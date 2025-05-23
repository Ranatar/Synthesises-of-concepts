# Архитектура взаимодействия баз данных и интеграции с Claude

## 1. Окружение и инфраструктура

### 1.1 Контейнеризация (Docker Compose)
```yaml
version: '3.9'

services:
  # PostgreSQL - основная БД
  postgres:
    image: pgvector/pgvector:pg16
    container_name: philosophy-postgres
    environment:
      POSTGRES_DB: philosophy_db
      POSTGRES_USER: philosophy_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "-c shared_preload_libraries=pg_stat_statements,pgvector"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts/postgres:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - philosophy-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U philosophy_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Neo4j - графовая БД
  neo4j:
    image: neo4j:5.15-enterprise
    container_name: philosophy-neo4j
    environment:
      NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
      NEO4J_ACCEPT_LICENSE_AGREEMENT: "yes"
      NEO4J_dbms_memory_heap_initial__size: "2g"
      NEO4J_dbms_memory_heap_max__size: "4g"
      NEO4J_dbms_memory_pagecache_size: "2g"
      NEO4J_apoc_export_file_enabled: "true"
      NEO4J_apoc_import_file_enabled: "true"
      NEO4J_dbms_security_procedures_unrestricted: "apoc.*,gds.*"
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
      - ./plugins:/plugins
    ports:
      - "7474:7474"
      - "7687:7687"
    networks:
      - philosophy-network

  # Redis - кэш и очереди
  redis:
    image: redis:7-alpine
    container_name: philosophy-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - philosophy-network

  # Elasticsearch - полнотекстовый поиск
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: philosophy-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - xpack.security.http.ssl.enabled=false
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - philosophy-network

  # MinIO - S3-совместимое хранилище
  minio:
    image: minio/minio:latest
    container_name: philosophy-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - philosophy-network

  # Weaviate - векторная БД
  weaviate:
    image: semitechnologies/weaviate:latest
    container_name: philosophy-weaviate
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'false'
      AUTHENTICATION_APIKEY_ENABLED: 'true'
      AUTHENTICATION_APIKEY_ALLOWED_KEYS: ${WEAVIATE_API_KEY}
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-openai'
    volumes:
      - weaviate_data:/var/lib/weaviate
    ports:
      - "8080:8080"
    networks:
      - philosophy-network

volumes:
  postgres_data:
  neo4j_data:
  neo4j_logs:
  redis_data:
  elasticsearch_data:
  minio_data:
  weaviate_data:

networks:
  philosophy-network:
    driver: bridge
```

### 1.2 Kubernetes манифесты (для production)
```yaml
# Пример для PostgreSQL с высокой доступностью
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: philosophy-postgres
spec:
  instances: 3
  postgresql:
    parameters:
      shared_preload_libraries: 'pgvector'
      max_connections: '200'
      shared_buffers: '2GB'
      effective_cache_size: '6GB'
  
  bootstrap:
    initdb:
      database: philosophy_db
      owner: philosophy_user
      secret:
        name: postgres-credentials
  
  monitoring:
    enabled: true
  
  resources:
    requests:
      memory: "4Gi"
      cpu: "2"
    limits:
      memory: "8Gi"
      cpu: "4"
```

## 2. Слой синхронизации данных

### 2.1 Архитектура синхронизации
```python
# services/sync_manager.py
from abc import ABC, abstractmethod
import asyncio
from typing import Dict, Any, List
import asyncpg
from neo4j import AsyncGraphDatabase
import redis.asyncio as redis
from elasticsearch import AsyncElasticsearch
import aioboto3

class DataSyncManager:
    def __init__(self, config: Dict[str, Any]):
        self.postgres_pool = None
        self.neo4j_driver = None
        self.redis_client = None
        self.es_client = None
        self.s3_client = None
        self.sync_queue = asyncio.Queue()
        self.config = config
    
    async def initialize(self):
        """Инициализация всех подключений"""
        # PostgreSQL connection pool
        self.postgres_pool = await asyncpg.create_pool(
            host=self.config['postgres']['host'],
            database=self.config['postgres']['database'],
            user=self.config['postgres']['user'],
            password=self.config['postgres']['password'],
            min_size=10,
            max_size=20,
            command_timeout=60
        )
        
        # Neo4j driver
        self.neo4j_driver = AsyncGraphDatabase.driver(
            self.config['neo4j']['uri'],
            auth=(self.config['neo4j']['user'], self.config['neo4j']['password']),
            max_connection_pool_size=50
        )
        
        # Redis client
        self.redis_client = await redis.from_url(
            f"redis://:{self.config['redis']['password']}@{self.config['redis']['host']}",
            decode_responses=True
        )
        
        # Elasticsearch client
        self.es_client = AsyncElasticsearch(
            [self.config['elasticsearch']['host']],
            basic_auth=(self.config['elasticsearch']['user'], 
                       self.config['elasticsearch']['password'])
        )
        
        # S3 client
        session = aioboto3.Session()
        self.s3_client = await session.client(
            's3',
            endpoint_url=self.config['s3']['endpoint'],
            aws_access_key_id=self.config['s3']['access_key'],
            aws_secret_access_key=self.config['s3']['secret_key']
        ).__aenter__()

    async def sync_concept_to_neo4j(self, concept_id: str):
        """Синхронизация концепции из PostgreSQL в Neo4j"""
        async with self.postgres_pool.acquire() as conn:
            # Получаем данные концепции
            concept = await conn.fetchrow("""
                SELECT * FROM concepts WHERE id = $1
            """, concept_id)
            
            # Получаем категории
            categories = await conn.fetch("""
                SELECT c.*, cc.weight, cc.position_x, cc.position_y
                FROM categories c
                JOIN concept_categories cc ON c.id = cc.category_id
                WHERE cc.concept_id = $1
            """, concept_id)
            
            # Получаем связи
            relations = await conn.fetch("""
                SELECT cr.*, rt.name as relation_type_name
                FROM concept_relations cr
                JOIN relation_types rt ON cr.relation_type_id = rt.id
                WHERE cr.concept_id = $1
            """, concept_id)
        
        async with self.neo4j_driver.session() as session:
            # Транзакция для атомарного обновления
            await session.execute_write(
                self._create_concept_graph,
                concept, categories, relations
            )
    
    @staticmethod
    async def _create_concept_graph(tx, concept, categories, relations):
        """Создание графа концепции в Neo4j"""
        # Создаем или обновляем узел концепции
        await tx.run("""
            MERGE (c:Concept {id: $id})
            SET c += $properties
        """, id=concept['id'], properties={
            'name': concept['name'],
            'description': concept['description'],
            'authorId': concept['author_id'],
            'tradition': concept['tradition'],
            'isPublic': concept['is_public'],
            'qualityScore': concept['quality_score'],
            'updatedAt': concept['updated_at']
        })
        
        # Создаем категории и связи с концепцией
        for cat in categories:
            await tx.run("""
                MERGE (cat:Category {id: $cat_id})
                SET cat += $cat_properties
                WITH cat
                MATCH (c:Concept {id: $concept_id})
                MERGE (c)-[r:INCLUDES]->(cat)
                SET r += $rel_properties
            """, 
            cat_id=cat['id'],
            cat_properties={
                'name': cat['name'],
                'canonicalName': cat['canonical_name'],
                'description': cat['description']
            },
            concept_id=concept['id'],
            rel_properties={
                'weight': float(cat['weight']),
                'positionX': float(cat['position_x']),
                'positionY': float(cat['position_y'])
            })
        
        # Создаем связи между категориями
        for rel in relations:
            await tx.run(f"""
                MATCH (from:Category {{id: $from_id}})
                MATCH (to:Category {{id: $to_id}})
                MERGE (from)-[r:{rel['relation_type_name']}]->(to)
                SET r += $properties
            """, 
            from_id=rel['from_category_id'],
            to_id=rel['to_category_id'],
            properties={
                'conceptId': concept['id'],
                'weight': float(rel['weight']),
                'rationale': rel['rationale']
            })
```

### 2.2 Обработчик событий CDC (Change Data Capture)
```python
# services/cdc_handler.py
import asyncio
from typing import Dict, Any
import psycopg2
from psycopg2.extras import LogicalReplicationConnection

class CDCHandler:
    def __init__(self, sync_manager: DataSyncManager):
        self.sync_manager = sync_manager
        self.handlers = {
            'concepts': self.handle_concept_change,
            'categories': self.handle_category_change,
            'concept_relations': self.handle_relation_change,
            'theses': self.handle_thesis_change
        }
    
    async def start_replication(self):
        """Запуск логической репликации PostgreSQL"""
        conn = psycopg2.connect(
            self.sync_manager.config['postgres']['dsn'],
            connection_factory=LogicalReplicationConnection
        )
        cur = conn.cursor()
        
        # Создаем слот репликации если не существует
        try:
            cur.create_replication_slot('philosophy_cdc', 'pgoutput')
        except psycopg2.ProgrammingError:
            pass
        
        # Начинаем стриминг
        cur.start_replication(
            slot_name='philosophy_cdc',
            decode=True,
            options={'publication_names': 'philosophy_changes'}
        )
        
        async for msg in self._consume_stream(cur):
            await self._process_change(msg)
    
    async def _process_change(self, msg: Dict[str, Any]):
        """Обработка изменения из CDC"""
        table = msg['table']
        operation = msg['operation']
        data = msg['data']
        
        if table in self.handlers:
            await self.handlers[table](operation, data)
        
        # Инвалидация кэша
        await self._invalidate_cache(table, data)
    
    async def handle_concept_change(self, operation: str, data: Dict):
        """Обработка изменений концепций"""
        concept_id = data['id']
        
        if operation in ['INSERT', 'UPDATE']:
            # Синхронизация с Neo4j
            await self.sync_manager.sync_concept_to_neo4j(concept_id)
            
            # Обновление поискового индекса
            await self._update_search_index(concept_id)
            
            # Обновление векторного индекса
            await self._update_vector_index(concept_id)
        
        elif operation == 'DELETE':
            # Удаление из всех систем
            await self._delete_from_all_systems(concept_id)
    
    async def _invalidate_cache(self, table: str, data: Dict):
        """Инвалидация кэша Redis"""
        concept_id = data.get('concept_id') or data.get('id')
        if concept_id:
            # Удаляем все ключи, связанные с концепцией
            pattern = f"concept:{concept_id}:*"
            async for key in self.sync_manager.redis_client.scan_iter(match=pattern):
                await self.sync_manager.redis_client.delete(key)
```

## 3. Интеграция с Claude API

### 3.1 Менеджер взаимодействия с Claude
```python
# services/claude_integration.py
import asyncio
from typing import Dict, Any, List, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
import json

class ClaudeIntegrationManager:
    def __init__(self, api_key: str, sync_manager: DataSyncManager):
        self.api_key = api_key
        self.sync_manager = sync_manager
        self.client = httpx.AsyncClient(timeout=60.0)
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-opus-4-20250514"
        self.request_queue = asyncio.Queue(maxsize=100)
        self.response_cache = {}
    
    async def prepare_context(self, operation: str, data: Dict) -> Dict:
        """Подготовка контекста из БД для Claude"""
        context = {
            'operation': operation,
            'timestamp': asyncio.get_event_loop().time()
        }
        
        if operation == 'generate_theses':
            # Получаем полный граф из Neo4j
            graph_data = await self._fetch_graph_from_neo4j(data['concept_id'])
            
            # Обогащаем семантически похожими концепциями
            similar_concepts = await self._find_similar_concepts(data['concept_id'])
            
            context.update({
                'graph': graph_data,
                'similar_concepts': similar_concepts[:3],
                'user_preferences': await self._get_user_preferences(data['user_id'])
            })
        
        elif operation == 'synthesis':
            # Получаем данные всех концепций для синтеза
            concepts_data = []
            for concept_id in data['concept_ids']:
                concept_full = await self._fetch_full_concept(concept_id)
                concepts_data.append(concept_full)
            
            context.update({
                'concepts': concepts_data,
                'synthesis_mode': data['mode'],
                'historical_syntheses': await self._get_similar_syntheses(data['concept_ids'])
            })
        
        return context
    
    async def _fetch_graph_from_neo4j(self, concept_id: str) -> Dict:
        """Получение графа из Neo4j в оптимизированном формате"""
        async with self.sync_manager.neo4j_driver.session() as session:
            result = await session.run("""
                MATCH (c:Concept {id: $concept_id})-[:INCLUDES]->(cat:Category)
                OPTIONAL MATCH (cat)-[r]->(cat2:Category)
                WHERE r.conceptId = $concept_id
                WITH c, 
                     collect(DISTINCT {
                         id: cat.id,
                         name: cat.name,
                         description: cat.description,
                         weight: [(c)-[inc:INCLUDES]->(cat) | inc.weight][0]
                     }) as categories,
                     collect(DISTINCT {
                         from: cat.id,
                         to: cat2.id,
                         type: type(r),
                         weight: r.weight,
                         rationale: r.rationale
                     }) as relations
                RETURN {
                    concept: {
                        id: c.id,
                        name: c.name,
                        description: c.description
                    },
                    categories: categories,
                    relations: [r in relations WHERE r.to IS NOT NULL]
                } as graph
            """, concept_id=concept_id)
            
            return await result.single()
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def call_claude(self, prompt: str, context: Dict) -> Dict:
        """Вызов Claude API с retry логикой"""
        # Проверяем кэш
        cache_key = self._generate_cache_key(prompt, context)
        if cache_key in self.response_cache:
            return self.response_cache[cache_key]
        
        # Подготовка запроса
        messages = [{
            "role": "user",
            "content": self._build_prompt(prompt, context)
        }]
        
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 4000,
            "temperature": 0.7
        }
        
        # Отправка запроса
        response = await self.client.post(
            self.base_url,
            headers=headers,
            json=data
        )
        response.raise_for_status()
        
        result = response.json()
        
        # Сохранение в кэш
        self.response_cache[cache_key] = result
        
        # Сохранение в БД для аналитики
        await self._save_interaction(prompt, context, result)
        
        return result
    
    def _build_prompt(self, template: str, context: Dict) -> str:
        """Построение промпта с контекстом"""
        if context['operation'] == 'generate_theses':
            return f"""
{template}

Концепция: {context['graph']['concept']['name']}
Описание: {context['graph']['concept']['description']}

Структура графа:
Категории:
{json.dumps(context['graph']['categories'], indent=2, ensure_ascii=False)}

Связи:
{json.dumps(context['graph']['relations'], indent=2, ensure_ascii=False)}

Похожие концепции для контекста:
{json.dumps(context['similar_concepts'], indent=2, ensure_ascii=False)}

Пользовательские предпочтения:
{json.dumps(context['user_preferences'], indent=2, ensure_ascii=False)}
"""
        # Другие шаблоны для разных операций...
        
    async def process_claude_response(self, response: Dict, operation: str) -> Dict:
        """Обработка и сохранение ответа Claude"""
        content = response['content'][0]['text']
        
        # Парсинг структурированного ответа
        try:
            parsed_data = json.loads(content)
        except json.JSONDecodeError:
            # Fallback на NLP парсинг
            parsed_data = await self._nlp_parse(content, operation)
        
        # Валидация данных
        validated_data = await self._validate_response(parsed_data, operation)
        
        # Сохранение в соответствующие БД
        if operation == 'generate_theses':
            await self._save_theses(validated_data)
        elif operation == 'synthesis':
            await self._save_synthesis(validated_data)
        
        return validated_data
```

### 3.2 Оптимизация промптов и кэширование
```python
# services/prompt_optimization.py
class PromptOptimizer:
    def __init__(self, sync_manager: DataSyncManager):
        self.sync_manager = sync_manager
        self.embeddings_cache = {}
        
    async def compress_for_context_window(self, data: Dict, max_tokens: int = 8000) -> Dict:
        """Сжатие данных для контекстного окна Claude"""
        # Расчет важности элементов через Neo4j
        importance_scores = await self._calculate_importance(data)
        
        # Итеративное удаление наименее важных элементов
        compressed = data.copy()
        current_tokens = self._estimate_tokens(compressed)
        
        while current_tokens > max_tokens:
            # Удаляем элемент с наименьшей важностью
            least_important = min(importance_scores.items(), key=lambda x: x[1])
            self._remove_element(compressed, least_important[0])
            importance_scores.pop(least_important[0])
            current_tokens = self._estimate_tokens(compressed)
        
        return compressed
    
    async def _calculate_importance(self, data: Dict) -> Dict[str, float]:
        """Расчет важности элементов через PageRank в Neo4j"""
        async with self.sync_manager.neo4j_driver.session() as session:
            result = await session.run("""
                CALL gds.pageRank.stream($graphName, {
                    maxIterations: 20,
                    dampingFactor: 0.85
                })
                YIELD nodeId, score
                RETURN gds.util.asNode(nodeId).id AS elementId, score
                ORDER BY score DESC
            """, graphName=f"concept-{data['concept_id']}")
            
            return {record['elementId']: record['score'] async for record in result}
```

## 4. Мониторинг и метрики

### 4.1 Сбор метрик производительности
```python
# services/monitoring.py
from prometheus_client import Counter, Histogram, Gauge
import time

class MetricsCollector:
    def __init__(self):
        # Счетчики операций
        self.db_operations = Counter(
            'philosophy_db_operations_total',
            'Total database operations',
            ['database', 'operation', 'status']
        )
        
        # Гистограммы времени выполнения
        self.operation_duration = Histogram(
            'philosophy_operation_duration_seconds',
            'Operation duration in seconds',
            ['operation_type']
        )
        
        # Текущие значения
        self.active_connections = Gauge(
            'philosophy_active_connections',
            'Active database connections',
            ['database']
        )
        
        self.cache_hit_rate = Gauge(
            'philosophy_cache_hit_rate',
            'Cache hit rate',
            ['cache_type']
        )
    
    async def track_operation(self, operation_type: str, database: str):
        """Декоратор для отслеживания операций"""
        def decorator(func):
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                status = 'success'
                
                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    status = 'error'
                    raise e
                finally:
                    duration = time.time() - start_time
                    self.db_operations.labels(
                        database=database,
                        operation=operation_type,
                        status=status
                    ).inc()
                    self.operation_duration.labels(
                        operation_type=operation_type
                    ).observe(duration)
            
            return wrapper
        return decorator
```

### 4.2 Health checks
```python
# services/health.py
class HealthChecker:
    def __init__(self, sync_manager: DataSyncManager):
        self.sync_manager = sync_manager
        
    async def check_all_systems(self) -> Dict[str, Dict]:
        """Проверка здоровья всех систем"""
        results = {}
        
        # PostgreSQL
        try:
            async with self.sync_manager.postgres_pool.acquire() as conn:
                await conn.fetchval('SELECT 1')
            results['postgresql'] = {'status': 'healthy', 'latency_ms': 0}
        except Exception as e:
            results['postgresql'] = {'status': 'unhealthy', 'error': str(e)}
        
        # Neo4j
        try:
            async with self.sync_manager.neo4j_driver.session() as session:
                await session.run('RETURN 1')
            results['neo4j'] = {'status': 'healthy'}
        except Exception as e:
            results['neo4j'] = {'status': 'unhealthy', 'error': str(e)}
        
        # Redis
        try:
            await self.sync_manager.redis_client.ping()
            results['redis'] = {'status': 'healthy'}
        except Exception as e:
            results['redis'] = {'status': 'unhealthy', 'error': str(e)}
        
        # Elasticsearch
        try:
            health = await self.sync_manager.es_client.cluster.health()
            results['elasticsearch'] = {
                'status': 'healthy', 
                'cluster_status': health['status']
            }
        except Exception as e:
            results['elasticsearch'] = {'status': 'unhealthy', 'error': str(e)}
        
        return results
```

## 5. Бэкапы и восстановление

### 5.1 Стратегия резервного копирования
```python
# services/backup.py
class BackupManager:
    def __init__(self, sync_manager: DataSyncManager):
        self.sync_manager = sync_manager
        
    async def create_full_backup(self) -> str:
        """Создание полного бэкапа всех систем"""
        backup_id = f"backup-{int(time.time())}"
        
        # PostgreSQL backup
        pg_backup = await self._backup_postgres(backup_id)
        
        # Neo4j backup
        neo4j_backup = await self._backup_neo4j(backup_id)
        
        # Elasticsearch snapshot
        es_backup = await self._backup_elasticsearch(backup_id)
        
        # Сохранение метаданных бэкапа
        metadata = {
            'backup_id': backup_id,
            'timestamp': datetime.utcnow().isoformat(),
            'components': {
                'postgresql': pg_backup,
                'neo4j': neo4j_backup,
                'elasticsearch': es_backup
            }
        }
        
        # Загрузка в S3
        await self._upload_to_s3(backup_id, metadata)
        
        return backup_id
    
    async def _backup_postgres(self, backup_id: str) -> Dict:
        """Бэкап PostgreSQL через pg_dump"""
        # Используем COPY для экспорта данных
        async with self.sync_manager.postgres_pool.acquire() as conn:
            tables = ['users', 'concepts', 'categories', 'theses']
            
            for table in tables:
                query = f"COPY {table} TO STDOUT WITH (FORMAT CSV, HEADER)"
                data = await conn.copy_to_table(query)
                
                # Сохранение в S3
                key = f"{backup_id}/postgres/{table}.csv"
                await self._upload_data_to_s3(key, data)
        
        return {'status': 'completed', 'tables': tables}
```