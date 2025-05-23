# Архитектура взаимодействия UI с базами данных

## 1. API Gateway и GraphQL схема

### 1.1 GraphQL схема
```graphql
# schema.graphql
scalar DateTime
scalar UUID
scalar JSON

type Query {
  # Пользователь
  me: User
  user(id: UUID!): User
  
  # Концепции
  concept(id: UUID!): Concept
  concepts(
    filter: ConceptFilter
    pagination: PaginationInput
    sort: ConceptSort
  ): ConceptConnection!
  
  # Поиск
  search(
    query: String!
    type: SearchType!
    limit: Int = 10
  ): SearchResults!
  
  # Категории
  categories(
    filter: CategoryFilter
    limit: Int = 50
  ): [Category!]!
  
  # Предложения на основе AI
  suggestCategories(
    conceptId: UUID!
    currentCategories: [UUID!]!
  ): [CategorySuggestion!]!
  
  # Аналитика
  conceptAnalytics(conceptId: UUID!): ConceptAnalytics!
}

type Mutation {
  # Концепции
  createConcept(input: CreateConceptInput!): ConceptResult!
  updateConcept(id: UUID!, input: UpdateConceptInput!): ConceptResult!
  deleteConcept(id: UUID!): DeleteResult!
  
  # Операции с графом
  addCategoryToConcept(
    conceptId: UUID!
    categoryId: UUID!
    position: PositionInput
    weight: Float
  ): Concept!
  
  addRelation(input: AddRelationInput!): Relation!
  removeRelation(id: UUID!): DeleteResult!
  
  # AI операции
  generateTheses(
    conceptId: UUID!
    options: GenerateThesesOptions
  ): GenerateThesesResult!
  
  synthesizeConcepts(
    conceptIds: [UUID!]!
    mode: SynthesisMode!
    options: SynthesisOptions
  ): SynthesisResult!
  
  # Коллаборация
  shareeConcept(
    conceptId: UUID!
    emails: [String!]!
    permissions: SharePermissions!
  ): ShareResult!
}

type Subscription {
  # Real-time обновления концепции
  conceptUpdates(conceptId: UUID!): ConceptUpdate!
  
  # Коллаборативное редактирование
  collaborativeEdits(conceptId: UUID!): EditEvent!
  
  # Прогресс AI операций
  aiOperationProgress(operationId: UUID!): OperationProgress!
  
  # Уведомления пользователя
  userNotifications: Notification!
}

# Основные типы
type Concept {
  id: UUID!
  name: String!
  description: String
  author: User!
  tradition: PhilosophicalTradition
  isPublic: Boolean!
  isPublished: Boolean!
  
  # Граф
  categories: [ConceptCategory!]!
  relations: [Relation!]!
  
  # Тезисы
  theses: [Thesis!]!
  
  # Метаданные
  qualityScore: Float
  complexity: ComplexityLevel!
  tags: [String!]!
  
  # Социальные метрики
  stars: Int!
  forks: Int!
  views: Int!
  
  # Связи
  parentConcepts: [Concept!]!
  derivedConcepts: [Concept!]!
  
  # Временные метки
  createdAt: DateTime!
  updatedAt: DateTime!
  publishedAt: DateTime
}

type ConceptCategory {
  category: Category!
  weight: Float
  position: Position
  color: String
  addedAt: DateTime!
}

type Category {
  id: UUID!
  name: String!
  canonicalName: String!
  description: String
  definition: String
  tradition: PhilosophicalTradition
  domain: PhilosophicalDomain
  synonyms: [String!]!
  
  # Использование
  usageCount: Int!
  concepts: [Concept!]!
  
  # AI метрики
  semanticSimilarCategories(limit: Int = 5): [SimilarCategory!]!
}

type Relation {
  id: UUID!
  from: Category!
  to: Category!
  type: RelationType!
  weight: Float
  rationale: String
  concept: Concept!
}

# Перечисления
enum PhilosophicalTradition {
  WESTERN
  EASTERN
  ANALYTICAL
  CONTINENTAL
  PRAGMATIC
}

enum ComplexityLevel {
  SIMPLE
  MODERATE
  COMPLEX
}

enum SynthesisMode {
  DIALECTICAL
  INTEGRATIVE
  CREATIVE
}

# Интерфейсы для результатов
interface Result {
  success: Boolean!
  message: String
}

type ConceptResult implements Result {
  success: Boolean!
  message: String
  concept: Concept
  validationErrors: [ValidationError!]
}

type GenerateThesesResult implements Result {
  success: Boolean!
  message: String
  theses: [Thesis!]!
  operationId: UUID!
}
```

### 1.2 Резолверы с оптимизацией запросов
```typescript
// resolvers/concept.resolver.ts
import { DataLoader } from 'dataloader';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ConceptResolver {
  private categoryLoader: DataLoader<string, Category>;
  private relationLoader: DataLoader<string, Relation[]>;
  
  constructor(
    @InjectRepository(Concept)
    private conceptRepo: Repository<Concept>,
    private neo4jService: Neo4jService,
    private redisCache: RedisService,
    private elasticSearch: ElasticsearchService
  ) {
    // DataLoader для батчинга запросов
    this.categoryLoader = new DataLoader(async (conceptIds) => {
      const categories = await this.batchLoadCategories(conceptIds);
      return conceptIds.map(id => categories.filter(c => c.conceptId === id));
    });
    
    this.relationLoader = new DataLoader(async (conceptIds) => {
      const relations = await this.batchLoadRelations(conceptIds);
      return conceptIds.map(id => relations.filter(r => r.conceptId === id));
    });
  }
  
  @Query()
  async concept(@Args('id') id: string, @Context() ctx): Promise<Concept> {
    // Проверка кэша
    const cached = await this.redisCache.get(`concept:${id}`);
    if (cached) return cached;
    
    // Загрузка из PostgreSQL
    const concept = await this.conceptRepo.findOne({
      where: { id },
      relations: ['author']
    });
    
    if (!concept) throw new NotFoundException();
    
    // Проверка прав доступа
    if (!concept.isPublic && concept.authorId !== ctx.user?.id) {
      throw new ForbiddenException();
    }
    
    // Кэширование
    await this.redisCache.set(`concept:${id}`, concept, 300); // 5 минут
    
    return concept;
  }
  
  @ResolveField('categories')
  async categories(@Parent() concept: Concept): Promise<ConceptCategory[]> {
    // Используем DataLoader для батчинга
    return this.categoryLoader.load(concept.id);
  }
  
  @ResolveField('relations')
  async relations(@Parent() concept: Concept): Promise<Relation[]> {
    // Получаем из Neo4j через DataLoader
    return this.relationLoader.load(concept.id);
  }
  
  @ResolveField('theses')
  async theses(
    @Parent() concept: Concept,
    @Args('sort', { nullable: true }) sort?: ThesisSort
  ): Promise<Thesis[]> {
    const cacheKey = `concept:${concept.id}:theses:${sort || 'default'}`;
    const cached = await this.redisCache.get(cacheKey);
    if (cached) return cached;
    
    const theses = await this.conceptRepo
      .createQueryBuilder('concept')
      .leftJoinAndSelect('concept.theses', 'thesis')
      .where('concept.id = :id', { id: concept.id })
      .orderBy(this.getThesisOrderBy(sort))
      .getMany();
    
    await this.redisCache.set(cacheKey, theses, 300);
    return theses;
  }
  
  @ResolveField('semanticSimilarCategories')
  async semanticSimilarCategories(
    @Parent() category: Category,
    @Args('limit', { defaultValue: 5 }) limit: number
  ): Promise<SimilarCategory[]> {
    // Векторный поиск через Weaviate
    const embedding = await this.getEmbedding(category.id);
    const similar = await this.weaviateService.nearVector({
      vector: embedding,
      limit,
      className: 'Category',
      withDistance: true
    });
    
    return similar.map(item => ({
      category: item,
      similarity: 1 - item._additional.distance
    }));
  }
  
  private async batchLoadCategories(conceptIds: string[]): Promise<ConceptCategory[]> {
    // Оптимизированный запрос для множества концепций
    return this.neo4jService.read(`
      MATCH (c:Concept)-[r:INCLUDES]->(cat:Category)
      WHERE c.id IN $conceptIds
      RETURN c.id as conceptId, 
             cat,
             r.weight as weight,
             r.positionX as positionX,
             r.positionY as positionY,
             r.color as color
    `, { conceptIds });
  }
}
```

## 2. WebSocket и Real-time обновления

### 2.1 WebSocket Gateway
```typescript
// gateways/collaboration.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'collaboration',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})
export class CollaborationGateway {
  @WebSocketServer()
  server: Server;
  
  private activeEditors = new Map<string, Set<string>>(); // conceptId -> Set<userId>
  private editLocks = new Map<string, Map<string, number>>(); // conceptId -> Map<elementId, userId>
  
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join-concept')
  async handleJoinConcept(
    client: Socket,
    payload: { conceptId: string }
  ): Promise<void> {
    const userId = client.data.userId;
    const { conceptId } = payload;
    
    // Присоединение к комнате концепции
    client.join(`concept:${conceptId}`);
    
    // Регистрация активного редактора
    if (!this.activeEditors.has(conceptId)) {
      this.activeEditors.set(conceptId, new Set());
    }
    this.activeEditors.get(conceptId).add(userId);
    
    // Отправка списка активных пользователей
    const activeUsers = await this.getActiveUsers(conceptId);
    this.server.to(`concept:${conceptId}`).emit('active-users', activeUsers);
    
    // Отправка текущих блокировок
    const locks = this.editLocks.get(conceptId) || new Map();
    client.emit('current-locks', Array.from(locks.entries()));
  }
  
  @SubscribeMessage('graph-edit')
  async handleGraphEdit(
    client: Socket,
    payload: GraphEditPayload
  ): Promise<void> {
    const userId = client.data.userId;
    const { conceptId, operation, data } = payload;
    
    // Проверка прав
    const hasPermission = await this.checkEditPermission(userId, conceptId);
    if (!hasPermission) {
      client.emit('error', { message: 'No edit permission' });
      return;
    }
    
    // Применение операции
    try {
      const result = await this.applyGraphOperation(operation, data);
      
      // Broadcast изменения всем в комнате, кроме отправителя
      client.to(`concept:${conceptId}`).emit('graph-update', {
        operation,
        data: result,
        userId,
        timestamp: new Date()
      });
      
      // Подтверждение отправителю
      client.emit('edit-confirmed', { operationId: data.operationId });
      
    } catch (error) {
      client.emit('edit-failed', {
        operationId: data.operationId,
        error: error.message
      });
    }
  }
  
  @SubscribeMessage('request-lock')
  async handleLockRequest(
    client: Socket,
    payload: { conceptId: string; elementId: string; elementType: string }
  ): Promise<void> {
    const userId = client.data.userId;
    const { conceptId, elementId } = payload;
    
    if (!this.editLocks.has(conceptId)) {
      this.editLocks.set(conceptId, new Map());
    }
    
    const locks = this.editLocks.get(conceptId);
    const currentLock = locks.get(elementId);
    
    if (!currentLock || currentLock === userId) {
      // Выдаем блокировку
      locks.set(elementId, userId);
      
      // Уведомляем всех о новой блокировке
      this.server.to(`concept:${conceptId}`).emit('element-locked', {
        elementId,
        userId,
        timestamp: Date.now()
      });
      
      // Автоматическое снятие блокировки через 30 секунд
      setTimeout(() => {
        if (locks.get(elementId) === userId) {
          this.releaseLock(conceptId, elementId, userId);
        }
      }, 30000);
    } else {
      // Блокировка занята
      client.emit('lock-denied', {
        elementId,
        lockedBy: currentLock
      });
    }
  }
  
  private async applyGraphOperation(
    operation: GraphOperation,
    data: any
  ): Promise<any> {
    switch (operation.type) {
      case 'ADD_CATEGORY':
        return this.graphService.addCategory(data);
      
      case 'MOVE_CATEGORY':
        return this.graphService.moveCategory(data);
      
      case 'ADD_RELATION':
        return this.graphService.addRelation(data);
      
      case 'UPDATE_WEIGHT':
        return this.graphService.updateWeight(data);
      
      default:
        throw new Error(`Unknown operation: ${operation.type}`);
    }
  }
}
```

### 2.2 Optimistic UI Updates
```typescript
// services/optimistic-update.service.ts
export class OptimisticUpdateService {
  private pendingOperations = new Map<string, PendingOperation>();
  
  async applyOptimisticUpdate(operation: Operation): Promise<void> {
    const operationId = uuidv4();
    
    // Сохраняем состояние для возможного отката
    const snapshot = await this.createSnapshot(operation.targetId);
    
    this.pendingOperations.set(operationId, {
      operation,
      snapshot,
      timestamp: Date.now()
    });
    
    // Применяем изменение локально
    await this.applyLocal(operation);
    
    try {
      // Отправляем на сервер
      const result = await this.sendToServer(operation);
      
      // Подтверждаем операцию
      this.confirmOperation(operationId, result);
      
    } catch (error) {
      // Откатываем при ошибке
      await this.rollbackOperation(operationId);
      throw error;
    }
  }
  
  private async rollbackOperation(operationId: string): Promise<void> {
    const pending = this.pendingOperations.get(operationId);
    if (!pending) return;
    
    // Восстанавливаем состояние
    await this.restoreSnapshot(pending.snapshot);
    
    // Уведомляем UI об откате
    this.eventEmitter.emit('operation-rollback', {
      operationId,
      reason: 'Server rejected operation'
    });
    
    this.pendingOperations.delete(operationId);
  }
}
```

## 3. Кэширование на уровне API

### 3.1 Многоуровневое кэширование
```typescript
// services/cache.service.ts
export class MultiLevelCache {
  private l1Cache: LRUCache<string, any>; // In-memory
  private l2Cache: RedisService; // Redis
  private l3Cache: CDNCache; // CDN edge cache
  
  constructor(
    private redis: RedisService,
    private cdn: CDNCache,
    private metrics: MetricsService
  ) {
    this.l1Cache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5 // 5 минут
    });
  }
  
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    // L1: In-memory
    const l1Result = this.l1Cache.get(key);
    if (l1Result) {
      this.metrics.incrementCacheHit('l1');
      return l1Result;
    }
    
    // L2: Redis
    const l2Result = await this.redis.get(key);
    if (l2Result) {
      this.metrics.incrementCacheHit('l2');
      this.l1Cache.set(key, l2Result); // Promote to L1
      return l2Result;
    }
    
    // L3: CDN
    if (options?.useCDN) {
      const l3Result = await this.cdn.get(key);
      if (l3Result) {
        this.metrics.incrementCacheHit('l3');
        // Promote to L1 and L2
        this.l1Cache.set(key, l3Result);
        await this.redis.set(key, l3Result, options.ttl);
        return l3Result;
      }
    }
    
    this.metrics.incrementCacheMiss();
    return null;
  }
  
  async set<T>(
    key: string, 
    value: T, 
    options?: CacheOptions
  ): Promise<void> {
    // Set in all levels
    this.l1Cache.set(key, value);
    
    await this.redis.set(key, value, options?.ttl || 3600);
    
    if (options?.useCDN) {
      await this.cdn.set(key, value, {
        ttl: options.ttl,
        tags: options.tags
      });
    }
  }
  
  async invalidate(pattern: string, options?: InvalidateOptions): Promise<void> {
    // Invalidate L1
    for (const key of this.l1Cache.keys()) {
      if (key.match(pattern)) {
        this.l1Cache.delete(key);
      }
    }
    
    // Invalidate L2
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    // Invalidate L3
    if (options?.invalidateCDN) {
      await this.cdn.purgeByTag(options.tags || [pattern]);
    }
    
    // Broadcast invalidation to other instances
    await this.broadcastInvalidation(pattern);
  }
}
```

### 3.2 Query результатов кэширование
```typescript
// decorators/cache.decorator.ts
export function CacheQuery(options: CacheQueryOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cache = this.cacheService;
      const context = args[args.length - 1]; // GraphQL context
      
      // Генерация ключа кэша
      const key = generateCacheKey(
        target.constructor.name,
        propertyName,
        args,
        options.keyGenerator
      );
      
      // Проверка кэша
      const cached = await cache.get(key);
      if (cached && !options.skipCache?.(context)) {
        return cached;
      }
      
      // Выполнение запроса
      const result = await originalMethod.apply(this, args);
      
      // Кэширование результата
      const ttl = options.ttl || 300;
      const tags = options.tags || [];
      
      await cache.set(key, result, {
        ttl,
        tags: [...tags, `user:${context.user?.id}`]
      });
      
      return result;
    };
    
    return descriptor;
  };
}

// Использование
@Resolver()
export class ConceptResolver {
  @Query()
  @CacheQuery({
    ttl: 600,
    tags: ['concepts'],
    keyGenerator: (args) => `concepts:${args[0].filter}:${args[0].page}`
  })
  async concepts(
    @Args() args: ConceptsArgs,
    @Context() ctx: GraphQLContext
  ): Promise<ConceptConnection> {
    // Запрос к БД
  }
}
```

## 4. Оптимизация запросов для UI

### 4.1 Агрегированные запросы
```typescript
// services/aggregation.service.ts
export class AggregationService {
  constructor(
    private postgres: PostgresService,
    private neo4j: Neo4jService,
    private elastic: ElasticsearchService
  ) {}
  
  async getConceptDashboard(
    conceptId: string,
    userId: string
  ): Promise<ConceptDashboard> {
    // Параллельное выполнение запросов
    const [
      basicInfo,
      graphStats,
      thesesAnalysis,
      similarConcepts,
      userActivity
    ] = await Promise.all([
      this.getBasicInfo(conceptId),
      this.getGraphStats(conceptId),
      this.analyzeTheses(conceptId),
      this.findSimilarConcepts(conceptId),
      this.getUserActivity(conceptId, userId)
    ]);
    
    return {
      concept: basicInfo,
      stats: {
        ...graphStats,
        thesesCount: thesesAnalysis.count,
        averageThesisQuality: thesesAnalysis.avgQuality
      },
      similar: similarConcepts,
      userContext: userActivity
    };
  }
  
  private async getGraphStats(conceptId: string): Promise<GraphStats> {
    // Оптимизированный запрос к Neo4j
    const result = await this.neo4j.run(`
      MATCH (c:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
      WITH c, count(cat) as categoryCount
      MATCH (c)-[:INCLUDES]->(cat)-[r]-(cat2)<-[:INCLUDES]-(c)
      WITH categoryCount, count(DISTINCT r) as relationCount,
           avg(r.weight) as avgWeight
      MATCH (c:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
      OPTIONAL MATCH (cat)-[r]-()
      WITH categoryCount, relationCount, avgWeight,
           cat, count(r) as degree
      RETURN {
        categories: categoryCount,
        relations: relationCount,
        avgWeight: avgWeight,
        avgDegree: avg(degree),
        maxDegree: max(degree),
        connectivity: toFloat(relationCount) / 
                     (categoryCount * (categoryCount - 1) / 2)
      } as stats
    `, { conceptId });
    
    return result.records[0].get('stats');
  }
}
```

### 4.2 Виртуализация больших списков
```typescript
// hooks/useVirtualizedConceptList.ts
export function useVirtualizedConceptList(
  filter: ConceptFilter,
  pageSize: number = 50
) {
  const [items, setItems] = useState<Concept[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<(() => void) | null>(null);
  
  const { data, fetchMore, subscribeToMore } = useQuery(GET_CONCEPTS, {
    variables: {
      filter,
      pagination: { limit: pageSize, offset: 0 }
    },
    notifyOnNetworkStatusChange: true
  });
  
  // Подписка на real-time обновления
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: CONCEPT_UPDATES_SUBSCRIPTION,
      variables: { filter },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        
        const update = subscriptionData.data.conceptUpdate;
        
        switch (update.type) {
          case 'CREATED':
            return {
              ...prev,
              concepts: {
                ...prev.concepts,
                edges: [update.concept, ...prev.concepts.edges]
              }
            };
          
          case 'UPDATED':
            return {
              ...prev,
              concepts: {
                ...prev.concepts,
                edges: prev.concepts.edges.map(edge =>
                  edge.node.id === update.concept.id ? update.concept : edge
                )
              }
            };
          
          case 'DELETED':
            return {
              ...prev,
              concepts: {
                ...prev.concepts,
                edges: prev.concepts.edges.filter(
                  edge => edge.node.id !== update.conceptId
                )
              }
            };
        }
      }
    });
    
    return () => unsubscribe();
  }, [filter]);
  
  // Функция загрузки следующей страницы
  loadMoreRef.current = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            limit: pageSize,
            offset: items.length
          }
        }
      });
      
      const newItems = result.data.concepts.edges;
      setItems(prev => [...prev, ...newItems]);
      setHasMore(result.data.concepts.pageInfo.hasNextPage);
      
    } finally {
      setLoading(false);
    }
  };
  
  return {
    items,
    hasMore,
    loading,
    loadMore: loadMoreRef.current
  };
}
```

## 5. Обработка ошибок и восстановление

### 5.1 Circuit Breaker для БД
```typescript
// services/circuit-breaker.service.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly options: {
      failureThreshold: number;
      resetTimeout: number;
      halfOpenRequests: number;
    }
  ) {}
  
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else if (fallback) {
        return fallback();
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
      
    } catch (error) {
      this.onFailure();
      
      if (fallback && this.state === 'OPEN') {
        return fallback();
      }
      
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime >= this.options.resetTimeout
    );
  }
}

// Использование
export class DatabaseService {
  private pgBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000,
    halfOpenRequests: 3
  });
  
  async getConceptWithFallback(id: string): Promise<Concept> {
    return this.pgBreaker.execute(
      // Основная операция
      async () => {
        return this.postgres.findOne(id);
      },
      // Fallback на кэш или Neo4j
      async () => {
        const cached = await this.cache.get(`concept:${id}`);
        if (cached) return cached;
        
        // Попробовать получить из Neo4j
        return this.neo4j.getConcept(id);
      }
    );
  }
}
```

## 6. Мониторинг UI производительности

### 6.1 Performance tracking
```typescript
// services/performance.service.ts
export class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  
  trackQuery(operationName: string): QueryTracker {
    const startTime = performance.now();
    const tracker = {
      addDatabaseTime: (db: string, time: number) => {
        this.addMetric(`${operationName}.${db}`, time);
      },
      
      complete: () => {
        const duration = performance.now() - startTime;
        this.addMetric(operationName, duration);
        
        // Отправка метрик
        if (duration > 1000) {
          this.reportSlowQuery(operationName, duration);
        }
      }
    };
    
    return tracker;
  }
  
  private reportSlowQuery(operation: string, duration: number): void {
    this.analytics.track('slow_query', {
      operation,
      duration,
      timestamp: new Date(),
      context: this.getContext()
    });
  }
}
```