# Архитектура развертывания и DevOps процессы философского сервиса

## 1. Инфраструктура как код (IaC)

### 1.1 Terraform конфигурация для AWS
```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
  
  backend "s3" {
    bucket         = "philosophy-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# VPC и сеть
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  
  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = data.aws_availability_zones.available.names
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
  enable_dns_hostnames = true
  
  tags = local.common_tags
}

# EKS кластер
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "19.0.0"
  
  cluster_name    = "${var.project_name}-eks"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  # Управляемые node groups
  eks_managed_node_groups = {
    general = {
      min_size     = 3
      max_size     = 10
      desired_size = 5
      
      instance_types = ["t3.large"]
      
      labels = {
        Environment = var.environment
        Type        = "general"
      }
    }
    
    compute_optimized = {
      min_size     = 2
      max_size     = 5
      desired_size = 3
      
      instance_types = ["c5.xlarge"]
      
      labels = {
        Environment = var.environment
        Type        = "compute"
        Workload    = "ai-processing"
      }
      
      taints = [{
        key    = "ai-workload"
        value  = "true"
        effect = "NO_SCHEDULE"
      }]
    }
  }
  
  # IRSA для pod-level permissions
  enable_irsa = true
  
  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
}

# RDS PostgreSQL с высокой доступностью
module "rds" {
  source = "terraform-aws-modules/rds/aws"
  
  identifier = "${var.project_name}-postgres"
  
  engine               = "postgres"
  engine_version       = "15.4"
  family              = "postgres15"
  major_engine_version = "15"
  instance_class       = "db.r6g.xlarge"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  storage_type         = "gp3"
  
  db_name  = "philosophy_db"
  username = "philosophy_admin"
  port     = 5432
  
  multi_az               = true
  create_db_subnet_group = true
  subnet_ids             = module.vpc.database_subnets
  
  vpc_security_group_ids = [module.rds_security_group.security_group_id]
  
  backup_retention_period = 30
  backup_window          = "03:00-06:00"
  maintenance_window     = "Mon:00:00-Mon:03:00"
  
  # Включение расширений
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  parameters = [
    {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements,pgvector"
    },
    {
      name  = "log_statement"
      value = "all"
    }
  ]
}

# ElastiCache Redis кластер
module "elasticache" {
  source = "terraform-aws-modules/elasticache/aws"
  
  cluster_id           = "${var.project_name}-redis"
  engine              = "redis"
  node_type           = "cache.r6g.large"
  num_cache_nodes     = 3
  parameter_group_name = "default.redis7"
  engine_version      = "7.0"
  port                = 6379
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  subnet_ids = module.vpc.private_subnets
  
  # Включение режима cluster
  cluster_mode = {
    replicas_per_node_group = 2
    num_node_groups         = 3
  }
  
  # Автоматическое failover
  automatic_failover_enabled = true
  multi_az_enabled          = true
}

# S3 buckets
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-assets-${var.environment}"
  
  tags = local.common_tags
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  
  rule {
    id = "delete-old-versions"
    
    noncurrent_version_expiration {
      days = 90
    }
    
    status = "Enabled"
  }
  
  rule {
    id = "archive-old-files"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    status = "Enabled"
  }
}
```

### 1.2 Kubernetes манифесты
```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: philosophy-app
  labels:
    name: philosophy-app
    istio-injection: enabled

---
# k8s/base/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: philosophy-app
data:
  NODE_ENV: "production"
  API_PORT: "3000"
  LOG_LEVEL: "info"
  ENABLE_METRICS: "true"
  ENABLE_TRACING: "true"

---
# k8s/base/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: philosophy-app
type: Opaque
stringData:
  DATABASE_URL: "postgresql://username:password@postgres:5432/philosophy_db"
  REDIS_URL: "redis://:password@redis:6379"
  JWT_SECRET: "your-jwt-secret"
  CLAUDE_API_KEY: "your-claude-api-key"

---
# k8s/apps/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: philosophy-api
  namespace: philosophy-app
  labels:
    app: philosophy-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: philosophy-api
  template:
    metadata:
      labels:
        app: philosophy-api
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: philosophy-api
      
      initContainers:
      - name: wait-for-db
        image: busybox:1.35
        command: ['sh', '-c', 'until nc -z postgres 5432; do echo waiting for db; sleep 2; done']
      
      - name: run-migrations
        image: philosophy/api:${IMAGE_TAG}
        command: ['npm', 'run', 'migrate:prod']
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
      
      containers:
      - name: api
        image: philosophy/api:${IMAGE_TAG}
        imagePullPolicy: Always
        
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 20
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        
        volumeMounts:
        - name: app-storage
          mountPath: /app/uploads
        
      volumes:
      - name: app-storage
        persistentVolumeClaim:
          claimName: philosophy-storage-pvc

---
# k8s/apps/websocket-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: philosophy-websocket
  namespace: philosophy-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: philosophy-websocket
  template:
    metadata:
      labels:
        app: philosophy-websocket
    spec:
      containers:
      - name: websocket
        image: philosophy/websocket:${IMAGE_TAG}
        
        ports:
        - containerPort: 3001
          name: ws
        
        env:
        - name: STICKY_SESSIONS
          value: "true"
        - name: REDIS_ADAPTER
          value: "true"
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
# k8s/apps/claude-worker-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-worker
  namespace: philosophy-app
spec:
  replicas: 5
  selector:
    matchLabels:
      app: claude-worker
  template:
    metadata:
      labels:
        app: claude-worker
    spec:
      nodeSelector:
        workload: ai-processing
      
      tolerations:
      - key: "ai-workload"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
      
      containers:
      - name: worker
        image: philosophy/claude-worker:${IMAGE_TAG}
        
        env:
        - name: WORKER_CONCURRENCY
          value: "3"
        - name: CLAUDE_RATE_LIMIT
          value: "50"
        
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
```

## 2. CI/CD Pipeline

### 2.1 GitHub Actions
```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Анализ кода и тесты
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: pgvector/pgvector:pg15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
      
      neo4j:
        image: neo4j:5
        env:
          NEO4J_AUTH: neo4j/testpass
        ports:
          - 7687:7687
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
      env:
        DATABASE_URL: postgresql://postgres:testpass@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
        NEO4J_URI: bolt://localhost:7687
        NEO4J_PASSWORD: testpass
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
    
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # Анализ безопасности
  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
    
    - name: OWASP Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'philosophy-service'
        path: '.'
        format: 'ALL'

  # Сборка и публикация образов
  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    permissions:
      contents: read
      packages: write
    
    strategy:
      matrix:
        service: [api, websocket, claude-worker, frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./docker/Dockerfile.${{ matrix.service }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          BUILD_DATE=${{ github.event.head_commit.timestamp }}
          VCS_REF=${{ github.sha }}
          VERSION=${{ steps.meta.outputs.version }}

  # Деплой в staging
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: eu-west-1
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name philosophy-eks-staging --region eu-west-1
    
    - name: Deploy to staging
      run: |
        # Обновление образов
        kubectl set image deployment/philosophy-api \
          api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:develop-${{ github.sha }} \
          -n philosophy-app-staging
        
        kubectl set image deployment/philosophy-websocket \
          websocket=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/websocket:develop-${{ github.sha }} \
          -n philosophy-app-staging
        
        kubectl set image deployment/claude-worker \
          worker=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/claude-worker:develop-${{ github.sha }} \
          -n philosophy-app-staging
        
        # Ожидание готовности
        kubectl rollout status deployment/philosophy-api -n philosophy-app-staging
        kubectl rollout status deployment/philosophy-websocket -n philosophy-app-staging
        kubectl rollout status deployment/claude-worker -n philosophy-app-staging
    
    - name: Run smoke tests
      run: |
        npm run test:smoke -- --env=staging

  # Деплой в production
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://philosophy.example.com
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
        aws-region: eu-west-1
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name philosophy-eks-prod --region eu-west-1
    
    - name: Blue-Green Deployment
      run: |
        # Создание новой версии (green)
        kubectl apply -f k8s/production/deployment-green.yaml
        
        # Ожидание готовности
        kubectl wait --for=condition=ready pod -l version=green -n philosophy-app --timeout=300s
        
        # Переключение трафика
        kubectl patch service philosophy-api -n philosophy-app -p '{"spec":{"selector":{"version":"green"}}}'
        
        # Проверка здоровья
        ./scripts/health-check.sh https://philosophy.example.com
        
        # Удаление старой версии (blue)
        kubectl delete deployment philosophy-api-blue -n philosophy-app
```

### 2.2 GitOps с ArgoCD
```yaml
# argocd/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: philosophy-app
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  
  source:
    repoURL: https://github.com/your-org/philosophy-k8s-config
    targetRevision: HEAD
    path: overlays/production
    
    # Kustomize
    kustomize:
      images:
      - philosophy/api:v1.2.3
      - philosophy/websocket:v1.2.3
      - philosophy/claude-worker:v1.2.3
  
  destination:
    server: https://kubernetes.default.svc
    namespace: philosophy-app
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    
    syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    - PruneLast=true
    
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

---
# argocd/rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: philosophy-api
  namespace: philosophy-app
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 5m}
      - analysis:
          templates:
          - templateName: success-rate
          args:
          - name: service-name
            value: philosophy-api
      - setWeight: 30
      - pause: {duration: 5m}
      - setWeight: 60
      - pause: {duration: 5m}
      - setWeight: 100
      
      trafficRouting:
        istio:
          virtualService:
            name: philosophy-api-vsvc
            routes:
            - primary
          destinationRule:
            name: philosophy-api-destrule
            canarySubsetName: canary
            stableSubsetName: stable
      
      analysis:
        templates:
        - templateName: success-rate
        - templateName: latency
        args:
        - name: service-name
          value: philosophy-api
```

## 3. Масштабирование и производительность

### 3.1 Horizontal Pod Autoscaler
```yaml
# k8s/autoscaling/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: philosophy-api-hpa
  namespace: philosophy-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: philosophy-api
  
  minReplicas: 3
  maxReplicas: 20
  
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  
  - type: External
    external:
      metric:
        name: queue_depth
        selector:
          matchLabels:
            queue_name: "ai-generation"
      target:
        type: Value
        value: "100"
  
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Min
    
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 5
        periodSeconds: 30
      selectPolicy: Max

---
# k8s/autoscaling/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: philosophy-api-vpa
  namespace: philosophy-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: philosophy-api
  
  updatePolicy:
    updateMode: "Auto"
  
  resourcePolicy:
    containerPolicies:
    - containerName: api
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
      controlledResources: ["cpu", "memory"]
```

### 3.2 Кэширование и CDN
```typescript
// infrastructure/cdn-config.ts
import { CloudFront } from '@aws-sdk/client-cloudfront';

export const cdnConfiguration = {
  // CloudFront distribution
  distribution: {
    origins: [
      {
        domainName: 'api.philosophy.example.com',
        originPath: '/api',
        customOriginConfig: {
          originProtocolPolicy: 'https-only',
          originSslProtocols: ['TLSv1.2'],
        },
        originRequestPolicy: {
          headerBehavior: 'whitelist',
          headers: ['Authorization', 'Content-Type', 'X-Request-ID'],
          queryStringBehavior: 'all',
          cookieBehavior: 'none'
        }
      },
      {
        domainName: 'philosophy-assets.s3.amazonaws.com',
        s3OriginConfig: {
          originAccessIdentity: 'origin-access-identity/cloudfront/ABCDEFG'
        }
      }
    ],
    
    defaultCacheBehavior: {
      targetOriginId: 'S3-philosophy-assets',
      viewerProtocolPolicy: 'redirect-to-https',
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      compress: true,
      cachePolicyId: 'Managed-CachingOptimized',
      responseHeadersPolicyId: 'Managed-SecurityHeadersPolicy'
    },
    
    cacheBehaviors: [
      {
        pathPattern: '/api/concepts/*',
        targetOriginId: 'API-philosophy',
        viewerProtocolPolicy: 'https-only',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
        cachePolicyId: 'Managed-CachingDisabled',
        originRequestPolicyId: 'Managed-AllViewer',
        responseHeadersPolicyId: 'Managed-CORS-and-SecurityHeadersPolicy'
      },
      {
        pathPattern: '/api/search/*',
        targetOriginId: 'API-philosophy',
        viewerProtocolPolicy: 'https-only',
        allowedMethods: ['GET', 'HEAD'],
        defaultTTL: 300,
        maxTTL: 3600,
        minTTL: 0,
        forwardedValues: {
          queryString: true,
          headers: ['Accept-Language', 'CloudFront-Viewer-Country']
        }
      },
      {
        pathPattern: '/static/*',
        targetOriginId: 'S3-philosophy-assets',
        viewerProtocolPolicy: 'redirect-to-https',
        compress: true,
        defaultTTL: 86400,
        maxTTL: 31536000
      }
    ],
    
    customErrorResponses: [
      {
        errorCode: 404,
        responseCode: 404,
        responsePagePath: '/404.html',
        errorCachingMinTTL: 300
      },
      {
        errorCode: 500,
        responseCode: 500,
        responsePagePath: '/500.html',
        errorCachingMinTTL: 0
      }
    ]
  }
};

// Cache warming strategy
export class CacheWarmer {
  async warmCache() {
    const criticalPaths = [
      '/api/concepts/popular',
      '/api/categories/top',
      '/api/search/suggestions'
    ];
    
    for (const path of criticalPaths) {
      await this.preloadPath(path);
    }
  }
  
  private async preloadPath(path: string) {
    // Запрос через все edge locations
    const edgeLocations = ['us-east-1', 'eu-west-1', 'ap-southeast-1'];
    
    await Promise.all(
      edgeLocations.map(location => 
        fetch(`https://${location}.philosophy.example.com${path}`, {
          headers: { 'X-Cache-Warm': 'true' }
        })
      )
    );
  }
}
```

## 4. Мониторинг и Observability

### 4.1 Prometheus и Grafana
```yaml
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: 'philosophy-prod'
        region: 'eu-west-1'
    
    rule_files:
      - /etc/prometheus/rules/*.yml
    
    alerting:
      alertmanagers:
        - static_configs:
          - targets: ['alertmanager:9093']
    
    scrape_configs:
      # Kubernetes service discovery
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
            action: keep
            regex: default;kubernetes;https
      
      # Application metrics
      - job_name: 'philosophy-apps'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
          - action: labelmap
            regex: __meta_kubernetes_pod_label_(.+)
      
      # Node exporter
      - job_name: 'node-exporter'
        kubernetes_sd_configs:
          - role: node
        relabel_configs:
          - source_labels: [__address__]
            regex: '(.*):10250'
            replacement: '${1}:9100'
            target_label: __address__
      
      # Database exporters
      - job_name: 'postgres-exporter'
        static_configs:
          - targets: ['postgres-exporter:9187']
      
      - job_name: 'redis-exporter'
        static_configs:
          - targets: ['redis-exporter:9121']
      
      - job_name: 'neo4j-exporter'
        static_configs:
          - targets: ['neo4j-exporter:9201']

---
# monitoring/alert-rules.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  app-alerts.yml: |
    groups:
      - name: philosophy-app
        interval: 30s
        rules:
          # API latency
          - alert: HighAPILatency
            expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High API latency detected"
              description: "95th percentile latency is {{ $value }}s"
          
          # Error rate
          - alert: HighErrorRate
            expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "High error rate detected"
              description: "Error rate is {{ $value | humanizePercentage }}"
          
          # Claude API failures
          - alert: ClaudeAPIFailure
            expr: rate(claude_api_errors_total[5m]) > 0.1
            for: 2m
            labels:
              severity: critical
            annotations:
              summary: "Claude API experiencing high failure rate"
              description: "Claude API error rate is {{ $value | humanizePercentage }}"
          
          # Database connections
          - alert: DatabaseConnectionPoolExhausted
            expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "Database connection pool nearly exhausted"
              description: "{{ $value | humanizePercentage }} of connections in use"
          
          # Memory usage
          - alert: HighMemoryUsage
            expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "Container memory usage is high"
              description: "Container {{ $labels.container }} memory usage is {{ $value | humanizePercentage }}"
          
          # Queue depth
          - alert: HighQueueDepth
            expr: redis_queue_depth{queue="ai-generation"} > 1000
            for: 10m
            labels:
              severity: warning
            annotations:
              summary: "AI generation queue depth is high"
              description: "Queue depth is {{ $value }}"
```

### 4.2 Distributed Tracing с Jaeger
```yaml
# monitoring/jaeger.yaml
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: philosophy-tracing
  namespace: monitoring
spec:
  strategy: production
  
  storage:
    type: elasticsearch
    options:
      es:
        server-urls: https://elasticsearch:9200
        index-prefix: jaeger
        tls:
          ca: /es/certificates/ca.crt
        username: elastic
        password: changeme
  
  collector:
    replicas: 3
    resources:
      limits:
        cpu: 1
        memory: 1Gi
      requests:
        cpu: 500m
        memory: 512Mi
    
    options:
      collector:
        num-workers: 100
        queue-size: 10000
  
  query:
    replicas: 2
    resources:
      limits:
        cpu: 500m
        memory: 512Mi
    
    options:
      query:
        base-path: /jaeger
  
  agent:
    strategy: DaemonSet
    options:
      agent:
        tags: "cluster=production,region=eu-west-1"
```

### 4.3 Application Performance Monitoring
```typescript
// monitoring/apm.ts
import { MetricsCollector } from './metrics';
import { TracingService } from './tracing';
import { LoggingService } from './logging';

export class APMService {
  private metrics: MetricsCollector;
  private tracing: TracingService;
  private logging: LoggingService;
  
  constructor() {
    this.metrics = new MetricsCollector({
      serviceName: 'philosophy-api',
      pushgateway: process.env.PROMETHEUS_PUSHGATEWAY
    });
    
    this.tracing = new TracingService({
      serviceName: 'philosophy-api',
      jaegerEndpoint: process.env.JAEGER_ENDPOINT,
      samplingRate: 0.1
    });
    
    this.logging = new LoggingService({
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      defaultMeta: {
        service: 'philosophy-api',
        version: process.env.APP_VERSION
      }
    });
  }
  
  // Middleware для Express
  expressMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const span = this.tracing.startSpan('http.request', {
        attributes: {
          'http.method': req.method,
          'http.url': req.url,
          'http.target': req.path,
          'user.id': req.user?.id
        }
      });
      
      const timer = this.metrics.startTimer('http_request_duration_seconds', {
        method: req.method,
        path: req.route?.path || req.path
      });
      
      // Request ID для корреляции логов
      const requestId = req.headers['x-request-id'] || generateUUID();
      req.id = requestId;
      
      // Логирование запроса
      this.logging.info('Request received', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Перехват response
      const originalSend = res.send;
      res.send = function(data) {
        res.send = originalSend;
        
        // Завершение метрик
        timer({ status: res.statusCode });
        
        // Завершение трейса
        span.setAttributes({
          'http.status_code': res.statusCode,
          'http.response.size': Buffer.byteLength(data)
        });
        
        if (res.statusCode >= 400) {
          span.recordException(new Error(`HTTP ${res.statusCode}`));
        }
        
        span.end();
        
        // Логирование ответа
        this.logging.info('Request completed', {
          requestId,
          statusCode: res.statusCode,
          duration: Date.now() - req.startTime
        });
        
        return res.send(data);
      };
      
      req.startTime = Date.now();
      next();
    };
  }
  
  // Мониторинг производительности БД
  monitorDatabase() {
    this.metrics.registerDatabaseMetrics({
      connectionPool: {
        size: () => this.db.pool.size,
        available: () => this.db.pool.available,
        waiting: () => this.db.pool.waiting
      },
      
      queryDuration: (duration: number, query: string) => {
        this.metrics.observe('db_query_duration_seconds', duration, {
          query_type: this.getQueryType(query)
        });
      }
    });
  }
  
  // Кастомные метрики бизнес-логики
  trackBusinessMetrics() {
    // Количество созданных концепций
    this.metrics.increment('concepts_created_total', {
      tradition: concept.tradition,
      complexity: concept.complexity
    });
    
    // Использование AI
    this.metrics.increment('ai_generations_total', {
      type: 'thesis',
      model: 'claude-4-opus'
    });
    
    // Качество генерации
    this.metrics.observe('ai_generation_quality', qualityScore, {
      type: 'thesis'
    });
    
    // Активные пользователи
    this.metrics.gauge('active_users', () => this.getActiveUserCount());
  }
}
```

## 5. Disaster Recovery и Backup

### 5.1 Стратегия резервного копирования
```bash
#!/bin/bash
# scripts/backup.sh

set -euo pipefail

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/${BACKUP_DATE}"
S3_BUCKET="philosophy-backups"

# Функция логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# PostgreSQL backup
backup_postgres() {
    log "Starting PostgreSQL backup..."
    
    # Создание логического дампа
    PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
        -h $POSTGRES_HOST \
        -U $POSTGRES_USER \
        -d $POSTGRES_DB \
        --format=custom \
        --verbose \
        --no-owner \
        --no-privileges \
        --exclude-table-data='audit_logs' \
        > "${BACKUP_DIR}/postgres_${BACKUP_DATE}.dump"
    
    # Создание SQL скрипта для быстрого восстановления
    PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
        -h $POSTGRES_HOST \
        -U $POSTGRES_USER \
        -d $POSTGRES_DB \
        --format=plain \
        --schema-only \
        > "${BACKUP_DIR}/postgres_schema_${BACKUP_DATE}.sql"
    
    log "PostgreSQL backup completed"
}

# Neo4j backup
backup_neo4j() {
    log "Starting Neo4j backup..."
    
    # Использование neo4j-admin для полного бэкапа
    kubectl exec -n philosophy-app neo4j-0 -- neo4j-admin backup \
        --database=neo4j \
        --backup-dir=/backups \
        --verbose
    
    # Копирование бэкапа
    kubectl cp philosophy-app/neo4j-0:/backups/neo4j.backup \
        "${BACKUP_DIR}/neo4j_${BACKUP_DATE}.backup"
    
    log "Neo4j backup completed"
}

# Redis backup
backup_redis() {
    log "Starting Redis backup..."
    
    # Создание RDB snapshot
    kubectl exec -n philosophy-app redis-master-0 -- redis-cli BGSAVE
    
    # Ожидание завершения
    while [ $(kubectl exec -n philosophy-app redis-master-0 -- redis-cli LASTSAVE) -eq $last_save ]; do
        sleep 1
    done
    
    # Копирование дампа
    kubectl cp philosophy-app/redis-master-0:/data/dump.rdb \
        "${BACKUP_DIR}/redis_${BACKUP_DATE}.rdb"
    
    log "Redis backup completed"
}

# Elasticsearch backup
backup_elasticsearch() {
    log "Starting Elasticsearch backup..."
    
    # Создание snapshot repository если не существует
    curl -X PUT "${ELASTICSEARCH_URL}/_snapshot/s3_backup" \
        -H "Content-Type: application/json" \
        -d '{
            "type": "s3",
            "settings": {
                "bucket": "'${S3_BUCKET}'",
                "base_path": "elasticsearch",
                "region": "eu-west-1"
            }
        }'
    
    # Создание snapshot
    curl -X PUT "${ELASTICSEARCH_URL}/_snapshot/s3_backup/snapshot_${BACKUP_DATE}?wait_for_completion=true" \
        -H "Content-Type: application/json" \
        -d '{
            "indices": ["philosophy-*"],
            "include_global_state": false
        }'
    
    log "Elasticsearch backup completed"
}

# Загрузка в S3
upload_to_s3() {
    log "Uploading backups to S3..."
    
    # Сжатие бэкапов
    tar -czf "${BACKUP_DIR}.tar.gz" -C "/backups" "${BACKUP_DATE}"
    
    # Загрузка с шифрованием
    aws s3 cp "${BACKUP_DIR}.tar.gz" \
        "s3://${S3_BUCKET}/backups/${BACKUP_DATE}.tar.gz" \
        --sse AES256 \
        --storage-class STANDARD_IA
    
    # Создание метаданных
    cat > "${BACKUP_DIR}/metadata.json" <<EOF
{
    "backup_date": "${BACKUP_DATE}",
    "databases": {
        "postgres": {
            "size": "$(du -h ${BACKUP_DIR}/postgres_${BACKUP_DATE}.dump | cut -f1)",
            "tables": $(PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        },
        "neo4j": {
            "size": "$(du -h ${BACKUP_DIR}/neo4j_${BACKUP_DATE}.backup | cut -f1)"
        },
        "redis": {
            "size": "$(du -h ${BACKUP_DIR}/redis_${BACKUP_DATE}.rdb | cut -f1)"
        }
    },
    "retention_days": 30
}
EOF
    
    aws s3 cp "${BACKUP_DIR}/metadata.json" \
        "s3://${S3_BUCKET}/backups/${BACKUP_DATE}_metadata.json"
    
    log "Upload completed"
}

# Очистка старых бэкапов
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Удаление локальных бэкапов старше 7 дней
    find /backups -type f -mtime +7 -delete
    
    # Настройка lifecycle policy для S3
    aws s3api put-bucket-lifecycle-configuration \
        --bucket ${S3_BUCKET} \
        --lifecycle-configuration file://s3-lifecycle.json
    
    log "Cleanup completed"
}

# Основной процесс
main() {
    log "Starting backup process..."
    
    mkdir -p "${BACKUP_DIR}"
    
    # Параллельное выполнение бэкапов
    backup_postgres &
    PG_PID=$!
    
    backup_neo4j &
    NEO4J_PID=$!
    
    backup_redis &
    REDIS_PID=$!
    
    backup_elasticsearch &
    ES_PID=$!
    
    # Ожидание завершения всех процессов
    wait $PG_PID $NEO4J_PID $REDIS_PID $ES_PID
    
    # Загрузка в S3
    upload_to_s3
    
    # Очистка
    cleanup_old_backups
    
    # Отправка уведомления
    send_notification "Backup completed successfully" "success"
    
    log "Backup process completed successfully"
}

# Обработка ошибок
trap 'send_notification "Backup failed: $?" "error"; exit 1' ERR

# Запуск
main
```

### 5.2 План восстановления
```yaml
# dr/disaster-recovery-plan.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: disaster-recovery-plan
  namespace: philosophy-app
data:
  rto: "4 hours"  # Recovery Time Objective
  rpo: "1 hour"   # Recovery Point Objective
  
  recovery-procedures: |
    # 1. Оценка ущерба
    - Определить затронутые компоненты
    - Оценить потерю данных
    - Активировать команду реагирования
    
    # 2. Переключение на DR регион
    - Обновить DNS на DR load balancer
    - Проверить доступность DR кластера
    - Масштабировать DR ресурсы
    
    # 3. Восстановление данных
    - Идентифицировать последний валидный бэкап
    - Восстановить PostgreSQL из дампа
    - Восстановить Neo4j из бэкапа
    - Восстановить Redis из RDB
    - Восстановить Elasticsearch из snapshot
    
    # 4. Проверка целостности
    - Выполнить проверку консистентности данных
    - Запустить автоматические тесты
    - Проверить критические пути приложения
    
    # 5. Восстановление сервиса
    - Постепенное включение трафика
    - Мониторинг производительности
    - Коммуникация со стейкхолдерами

---
# dr/restore-script.sh
#!/bin/bash
# Скрипт автоматического восстановления

restore_from_backup() {
    BACKUP_DATE=$1
    TARGET_ENV=$2
    
    echo "Starting restore from backup ${BACKUP_DATE} to ${TARGET_ENV}"
    
    # Скачивание бэкапа
    aws s3 cp "s3://philosophy-backups/backups/${BACKUP_DATE}.tar.gz" /tmp/
    tar -xzf "/tmp/${BACKUP_DATE}.tar.gz" -C /tmp/
    
    # Восстановление PostgreSQL
    kubectl exec -n ${TARGET_ENV} postgres-0 -- sh -c "
        PGPASSWORD=\$POSTGRES_PASSWORD dropdb -U \$POSTGRES_USER -h localhost philosophy_db --if-exists
        PGPASSWORD=\$POSTGRES_PASSWORD createdb -U \$POSTGRES_USER -h localhost philosophy_db
    "
    
    kubectl cp /tmp/${BACKUP_DATE}/postgres_${BACKUP_DATE}.dump \
        ${TARGET_ENV}/postgres-0:/tmp/restore.dump
    
    kubectl exec -n ${TARGET_ENV} postgres-0 -- \
        pg_restore -U $POSTGRES_USER -d philosophy_db -v /tmp/restore.dump
    
    # Восстановление Neo4j
    kubectl scale statefulset neo4j --replicas=0 -n ${TARGET_ENV}
    sleep 30
    
    kubectl cp /tmp/${BACKUP_DATE}/neo4j_${BACKUP_DATE}.backup \
        ${TARGET_ENV}/neo4j-0:/var/lib/neo4j/
    
    kubectl exec -n ${TARGET_ENV} neo4j-0 -- \
        neo4j-admin restore --from=/var/lib/neo4j/neo4j_${BACKUP_DATE}.backup
    
    kubectl scale statefulset neo4j --replicas=3 -n ${TARGET_ENV}
    
    echo "Restore completed"
}
```

Эта архитектура DevOps обеспечивает:
- Полную автоматизацию развертывания через IaC
- CI/CD pipeline с проверками безопасности
- Автоматическое масштабирование на основе метрик
- Комплексный мониторинг и observability
- Надежную стратегию резервного копирования и восстановления
- Готовность к disaster recovery с RTO 4 часа