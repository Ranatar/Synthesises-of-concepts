# Стратегия тестирования и обеспечение качества философского сервиса

## 1. Архитектура тестирования

### 1.1 Пирамида тестов
```
                    ┌─────┐
                    │ E2E │ 5%
                  ┌─┴─────┴─┐
                  │  Integ  │ 15%
                ┌─┴─────────┴─┐
                │    API      │ 25%
              ┌─┴─────────────┴─┐
              │     Unit       │ 55%
            └───────────────────┘
```

### 1.2 Конфигурация тестового окружения
```typescript
// test/setup/test-environment.ts
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';

export class TestEnvironment {
  private static instance: TestEnvironment;
  private testContainers: Map<string, any> = new Map();
  
  static async setup(): Promise<TestEnvironment> {
    if (!this.instance) {
      this.instance = new TestEnvironment();
      await this.instance.initialize();
    }
    return this.instance;
  }
  
  private async initialize() {
    // Запуск тестовых контейнеров
    await this.startPostgresContainer();
    await this.startRedisContainer();
    await this.startNeo4jContainer();
    await this.startElasticsearchContainer();
    
    // Настройка глобальных моков
    this.setupGlobalMocks();
  }
  
  private async startPostgresContainer() {
    const { GenericContainer } = await import('testcontainers');
    
    const container = await new GenericContainer('pgvector/pgvector:pg15')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'test_db'
      })
      .withStartupTimeout(60000)
      .start();
    
    this.testContainers.set('postgres', container);
    
    // Установка переменных окружения
    process.env.DATABASE_URL = `postgresql://test:test@${container.getHost()}:${container.getMappedPort(5432)}/test_db`;
  }
  
  private async startNeo4jContainer() {
    const container = await new GenericContainer('neo4j:5')
      .withExposedPorts(7687, 7474)
      .withEnvironment({
        NEO4J_AUTH: 'neo4j/testpass',
        NEO4J_PLUGINS: '["apoc", "graph-data-science"]'
      })
      .withStartupTimeout(90000)
      .start();
    
    this.testContainers.set('neo4j', container);
    
    process.env.NEO4J_URI = `bolt://${container.getHost()}:${container.getMappedPort(7687)}`;
    process.env.NEO4J_PASSWORD = 'testpass';
  }
  
  async createTestingModule(metadata: any) {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true
        }),
        GraphQLModule.forRoot({
          autoSchemaFile: true,
          playground: false
        }),
        ...metadata.imports
      ],
      controllers: metadata.controllers,
      providers: metadata.providers
    }).compile();
    
    return moduleRef;
  }
  
  async cleanup() {
    // Остановка контейнеров
    for (const [name, container] of this.testContainers) {
      await container.stop();
    }
  }
}

// test/setup/global-setup.ts
export default async function globalSetup() {
  const env = await TestEnvironment.setup();
  
  // Сохранение ссылки для global teardown
  (global as any).__TEST_ENV__ = env;
  
  // Выполнение миграций
  await runMigrations();
  
  // Загрузка тестовых данных
  await seedTestData();
}

// test/setup/global-teardown.ts
export default async function globalTeardown() {
  const env = (global as any).__TEST_ENV__;
  if (env) {
    await env.cleanup();
  }
}
```

## 2. Unit тестирование

### 2.1 Тестирование сервисов
```typescript
// src/concepts/services/__tests__/concept.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConceptService } from '../concept.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Concept } from '../entities/concept.entity';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { CacheService } from '../../cache/cache.service';
import { EventBus } from '../../events/event-bus';

describe('ConceptService', () => {
  let service: ConceptService;
  let conceptRepo: jest.Mocked<any>;
  let neo4jService: jest.Mocked<Neo4jService>;
  let cacheService: jest.Mocked<CacheService>;
  let eventBus: jest.Mocked<EventBus>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConceptService,
        {
          provide: getRepositoryToken(Concept),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn()
          }
        },
        {
          provide: Neo4jService,
          useValue: {
            run: jest.fn(),
            runWrite: jest.fn(),
            getSession: jest.fn()
          }
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            invalidate: jest.fn()
          }
        },
        {
          provide: EventBus,
          useValue: {
            emit: jest.fn()
          }
        }
      ]
    }).compile();
    
    service = module.get<ConceptService>(ConceptService);
    conceptRepo = module.get(getRepositoryToken(Concept));
    neo4jService = module.get(Neo4jService);
    cacheService = module.get(CacheService);
    eventBus = module.get(EventBus);
  });
  
  describe('createConcept', () => {
    it('should create a concept with valid data', async () => {
      // Arrange
      const createDto = {
        name: 'Test Concept',
        description: 'Test Description',
        categories: [
          { id: 'cat1', weight: 1.0, position: { x: 0, y: 0 } },
          { id: 'cat2', weight: 2.0, position: { x: 100, y: 100 } }
        ],
        relations: [
          { from: 'cat1', to: 'cat2', type: 'IMPLIES', weight: 1.5 }
        ]
      };
      
      const userId = 'user-123';
      const savedConcept = {
        id: 'concept-123',
        ...createDto,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      conceptRepo.create.mockReturnValue(savedConcept);
      conceptRepo.save.mockResolvedValue(savedConcept);
      neo4jService.runWrite.mockResolvedValue({ records: [] });
      
      // Act
      const result = await service.createConcept(createDto, userId);
      
      // Assert
      expect(result).toEqual(savedConcept);
      expect(conceptRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createDto.name,
          description: createDto.description,
          authorId: userId
        })
      );
      expect(conceptRepo.save).toHaveBeenCalled();
      expect(eventBus.emit).toHaveBeenCalledWith('concept.created', {
        conceptId: savedConcept.id,
        authorId: userId
      });
      expect(cacheService.invalidate).toHaveBeenCalledWith(`user:${userId}:concepts`);
    });
    
    it('should validate minimum categories requirement', async () => {
      // Arrange
      const createDto = {
        name: 'Test Concept',
        categories: [{ id: 'cat1', weight: 1.0, position: { x: 0, y: 0 } }] // Only 1
      };
      
      // Act & Assert
      await expect(service.createConcept(createDto, 'user-123'))
        .rejects.toThrow('Concept must have at least 2 categories');
    });
    
    it('should handle Neo4j sync failure gracefully', async () => {
      // Arrange
      const createDto = {
        name: 'Test Concept',
        categories: [
          { id: 'cat1', weight: 1.0, position: { x: 0, y: 0 } },
          { id: 'cat2', weight: 2.0, position: { x: 100, y: 100 } }
        ]
      };
      
      conceptRepo.create.mockReturnValue({ id: 'concept-123' });
      conceptRepo.save.mockResolvedValue({ id: 'concept-123' });
      neo4jService.runWrite.mockRejectedValue(new Error('Neo4j connection failed'));
      
      // Act
      const result = await service.createConcept(createDto, 'user-123');
      
      // Assert
      expect(result).toBeDefined();
      expect(eventBus.emit).toHaveBeenCalledWith('concept.sync.failed', {
        conceptId: 'concept-123',
        error: 'Neo4j connection failed'
      });
    });
  });
  
  describe('validateConceptGraph', () => {
    it('should detect circular dependencies', async () => {
      // Arrange
      const concept = {
        id: 'concept-123',
        categories: ['cat1', 'cat2', 'cat3'],
        relations: [
          { from: 'cat1', to: 'cat2', type: 'CAUSES' },
          { from: 'cat2', to: 'cat3', type: 'CAUSES' },
          { from: 'cat3', to: 'cat1', type: 'CAUSES' } // Circular
        ]
      };
      
      // Act
      const validation = await service.validateConceptGraph(concept);
      
      // Assert
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContainEqual(
        expect.objectContaining({
          type: 'CIRCULAR_DEPENDENCY',
          path: ['cat1', 'cat2', 'cat3', 'cat1']
        })
      );
    });
    
    it('should validate graph connectivity', async () => {
      // Arrange
      const concept = {
        id: 'concept-123',
        categories: ['cat1', 'cat2', 'cat3', 'cat4'],
        relations: [
          { from: 'cat1', to: 'cat2', type: 'IMPLIES' },
          { from: 'cat3', to: 'cat4', type: 'IMPLIES' }
          // cat1-cat2 disconnected from cat3-cat4
        ]
      };
      
      // Act
      const validation = await service.validateConceptGraph(concept);
      
      // Assert
      expect(validation.warnings).toContainEqual(
        expect.objectContaining({
          type: 'DISCONNECTED_COMPONENTS',
          components: [['cat1', 'cat2'], ['cat3', 'cat4']]
        })
      );
    });
  });
});

// src/ai/services/__tests__/claude.service.spec.ts
describe('ClaudeService', () => {
  let service: ClaudeService;
  let httpService: jest.Mocked<HttpService>;
  let promptOptimizer: jest.Mocked<PromptOptimizer>;
  
  beforeEach(() => {
    // Setup
  });
  
  describe('generateTheses', () => {
    it('should retry on rate limit errors', async () => {
      // Arrange
      const conceptData = { /* ... */ };
      const rateLimitError = {
        response: {
          status: 429,
          headers: { 'retry-after': '2' }
        }
      };
      
      httpService.post
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          data: {
            content: [{ text: JSON.stringify({ theses: [] }) }]
          }
        });
      
      // Act
      const result = await service.generateTheses(conceptData);
      
      // Assert
      expect(httpService.post).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });
    
    it('should handle malformed Claude responses', async () => {
      // Arrange
      httpService.post.mockResolvedValue({
        data: {
          content: [{ text: 'Not a valid JSON response' }]
        }
      });
      
      // Act & Assert
      await expect(service.generateTheses({}))
        .rejects.toThrow('Failed to parse Claude response');
    });
  });
});
```

### 2.2 Тестирование компонентов React
```typescript
// src/components/__tests__/ConceptEditor.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { ConceptEditor } from '../ConceptEditor';
import { CREATE_CONCEPT_MUTATION, UPDATE_GRAPH_MUTATION } from '../../graphql/mutations';

const mocks = [
  {
    request: {
      query: CREATE_CONCEPT_MUTATION,
      variables: {
        input: {
          name: 'Test Concept',
          description: 'Test Description',
          categories: []
        }
      }
    },
    result: {
      data: {
        createConcept: {
          success: true,
          concept: {
            id: 'concept-123',
            name: 'Test Concept'
          }
        }
      }
    }
  }
];

describe('ConceptEditor', () => {
  const setup = (props = {}) => {
    const user = userEvent.setup();
    const utils = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ConceptEditor mode="create" {...props} />
      </MockedProvider>
    );
    
    return { user, ...utils };
  };
  
  it('should render editor components', () => {
    setup();
    
    expect(screen.getByPlaceholderText('Название концепции')).toBeInTheDocument();
    expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('category-panel')).toBeInTheDocument();
  });
  
  it('should handle drag and drop of categories', async () => {
    const { user } = setup();
    
    // Drag category from panel
    const category = screen.getByText('Сознание');
    const canvas = screen.getByTestId('graph-canvas');
    
    await user.pointer([
      { keys: '[MouseLeft>]', target: category },
      { coords: { x: 100, y: 100 }, target: canvas },
      { keys: '[/MouseLeft]' }
    ]);
    
    // Verify category was added
    await waitFor(() => {
      expect(screen.getByTestId('node-Сознание')).toBeInTheDocument();
    });
  });
  
  it('should create relations between categories', async () => {
    const { user } = setup();
    
    // Add two categories first
    // ... (drag & drop logic)
    
    // Create relation
    const node1 = screen.getByTestId('node-cat1');
    const node2 = screen.getByTestId('node-cat2');
    
    // Click on first node connection point
    await user.click(node1.querySelector('.connection-point'));
    
    // Drag to second node
    await user.pointer([
      { keys: '[MouseLeft>]', target: node1 },
      { coords: { x: 200, y: 200 }, target: node2 },
      { keys: '[/MouseLeft]' }
    ]);
    
    // Select relation type
    await user.click(screen.getByText('IMPLIES'));
    
    // Verify relation was created
    expect(screen.getByTestId('relation-cat1-cat2')).toBeInTheDocument();
  });
  
  it('should show validation errors', async () => {
    const { user } = setup();
    
    // Try to save without required fields
    await user.click(screen.getByText('Сохранить концепцию'));
    
    await waitFor(() => {
      expect(screen.getByText('Добавьте минимум 2 категории')).toBeInTheDocument();
    });
  });
  
  it('should handle real-time collaboration', async () => {
    const mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      off: jest.fn()
    };
    
    jest.mock('../../hooks/useWebSocket', () => ({
      useWebSocket: () => ({ socket: mockSocket, connected: true })
    }));
    
    setup({ conceptId: 'concept-123', mode: 'edit' });
    
    // Simulate remote update
    const remoteUpdate = {
      operation: 'ADD_CATEGORY',
      data: {
        categoryId: 'cat-remote',
        position: { x: 300, y: 300 }
      },
      userId: 'other-user'
    };
    
    // Trigger the socket event
    const graphUpdateHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'graph-update'
    )[1];
    
    graphUpdateHandler(remoteUpdate);
    
    await waitFor(() => {
      expect(screen.getByTestId('node-cat-remote')).toBeInTheDocument();
      expect(screen.getByTestId('user-cursor-other-user')).toBeInTheDocument();
    });
  });
});
```

## 3. Integration тестирование

### 3.1 API Integration тесты
```typescript
// test/integration/concepts.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestEnvironment } from '../setup/test-environment';

describe('Concepts API (e2e)', () => {
  let app: INestApplication;
  let testEnv: TestEnvironment;
  let authToken: string;
  let testUser: any;
  
  beforeAll(async () => {
    testEnv = await TestEnvironment.setup();
    const moduleRef = await testEnv.createTestingModule({
      imports: [AppModule]
    });
    
    app = moduleRef.createNestApplication();
    await app.init();
    
    // Create test user and get auth token
    testUser = await createTestUser();
    authToken = await getAuthToken(testUser);
  });
  
  afterAll(async () => {
    await app.close();
    await testEnv.cleanup();
  });
  
  describe('POST /api/concepts', () => {
    it('should create a concept with full graph structure', async () => {
      const conceptData = {
        name: 'Integration Test Concept',
        description: 'Testing full concept creation flow',
        categories: [
          { id: 'cat1', weight: 1.0, position: { x: 0, y: 0 } },
          { id: 'cat2', weight: 2.0, position: { x: 100, y: 0 } },
          { id: 'cat3', weight: 1.5, position: { x: 50, y: 100 } }
        ],
        relations: [
          { from: 'cat1', to: 'cat2', type: 'IMPLIES', weight: 1.0 },
          { from: 'cat2', to: 'cat3', type: 'CAUSES', weight: 2.0 },
          { from: 'cat1', to: 'cat3', type: 'PART_OF', weight: 1.5 }
        ]
      };
      
      const response = await request(app.getHttpServer())
        .post('/api/concepts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(conceptData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: conceptData.name,
        description: conceptData.description,
        authorId: testUser.id,
        createdAt: expect.any(String)
      });
      
      // Verify Neo4j sync
      const neo4jResult = await testEnv.getNeo4jSession().run(`
        MATCH (c:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
        RETURN count(cat) as categoryCount
      `, { conceptId: response.body.id });
      
      expect(neo4jResult.records[0].get('categoryCount').toNumber()).toBe(3);
      
      // Verify cache invalidation
      const cacheKey = `user:${testUser.id}:concepts`;
      const cachedValue = await testEnv.getRedisClient().get(cacheKey);
      expect(cachedValue).toBeNull();
    });
    
    it('should handle concurrent concept creation', async () => {
      const createConcept = (name: string) => 
        request(app.getHttpServer())
          .post('/api/concepts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name,
            categories: [
              { id: 'cat1', weight: 1.0, position: { x: 0, y: 0 } },
              { id: 'cat2', weight: 1.0, position: { x: 100, y: 0 } }
            ]
          });
      
      // Create 10 concepts concurrently
      const promises = Array.from({ length: 10 }, (_, i) => 
        createConcept(`Concurrent Concept ${i}`)
      );
      
      const results = await Promise.all(promises);
      
      // All should succeed
      results.forEach(res => {
        expect(res.status).toBe(201);
      });
      
      // Verify unique IDs
      const ids = results.map(r => r.body.id);
      expect(new Set(ids).size).toBe(10);
    });
  });
  
  describe('GraphQL Integration', () => {
    it('should execute complex GraphQL query with nested resolvers', async () => {
      // Create test data
      const concept = await createTestConcept(testUser.id);
      await generateTestTheses(concept.id);
      
      const query = `
        query GetConceptWithAnalytics($id: UUID!) {
          concept(id: $id) {
            id
            name
            categories {
              category {
                id
                name
                usageCount
              }
              weight
            }
            relations {
              from { id name }
              to { id name }
              type { name semanticType }
              weight
            }
            theses {
              id
              text
              strength
              relatedCategories {
                id
                name
              }
            }
            analytics {
              graphMetrics {
                connectivity
                density
                centralityScores {
                  categoryId
                  score
                }
              }
              qualityScore
              completeness
            }
          }
        }
      `;
      
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query,
          variables: { id: concept.id }
        })
        .expect(200);
      
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.concept).toMatchObject({
        id: concept.id,
        name: concept.name,
        categories: expect.arrayContaining([
          expect.objectContaining({
            category: expect.objectContaining({
              id: expect.any(String),
              usageCount: expect.any(Number)
            })
          })
        ]),
        analytics: expect.objectContaining({
          graphMetrics: expect.objectContaining({
            connectivity: expect.any(Number),
            density: expect.any(Number)
          })
        })
      });
    });
  });
  
  describe('WebSocket Integration', () => {
    it('should sync real-time updates across multiple clients', async () => {
      const concept = await createTestConcept(testUser.id);
      
      // Connect two clients
      const client1 = await createWebSocketClient(authToken);
      const client2 = await createWebSocketClient(authToken);
      
      // Both join the same concept
      await client1.emit('join-concept', { conceptId: concept.id });
      await client2.emit('join-concept', { conceptId: concept.id });
      
      // Client 1 makes an edit
      const edit = {
        conceptId: concept.id,
        operation: 'ADD_CATEGORY',
        data: {
          categoryId: 'new-cat',
          position: { x: 200, y: 200 },
          weight: 1.5
        }
      };
      
      // Set up listener on client 2
      const updatePromise = new Promise(resolve => {
        client2.on('graph-update', resolve);
      });
      
      // Client 1 sends edit
      await client1.emit('graph-edit', edit);
      
      // Client 2 should receive update
      const update = await updatePromise;
      expect(update).toMatchObject({
        operation: 'ADD_CATEGORY',
        data: expect.objectContaining({
          categoryId: 'new-cat'
        })
      });
      
      // Verify persistence
      const dbConcept = await getConcept(concept.id);
      expect(dbConcept.categories).toContainEqual(
        expect.objectContaining({ categoryId: 'new-cat' })
      );
      
      // Cleanup
      await client1.disconnect();
      await client2.disconnect();
    });
  });
});
```

### 3.2 Тестирование баз данных
```typescript
// test/integration/database-sync.spec.ts
describe('Database Synchronization', () => {
  let pgPool: Pool;
  let neo4jDriver: Driver;
  let redisClient: Redis;
  
  beforeAll(async () => {
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD)
    );
    redisClient = new Redis(process.env.REDIS_URL);
  });
  
  afterAll(async () => {
    await pgPool.end();
    await neo4jDriver.close();
    await redisClient.quit();
  });
  
  it('should maintain consistency between PostgreSQL and Neo4j', async () => {
    // Create concept in PostgreSQL
    const pgResult = await pgPool.query(`
      INSERT INTO concepts (id, name, author_id, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `, [generateUUID(), 'Sync Test Concept', 'user-123']);
    
    const concept = pgResult.rows[0];
    
    // Add categories
    await pgPool.query(`
      INSERT INTO concept_categories (concept_id, category_id, weight, position_x, position_y)
      VALUES 
        ($1, 'cat1', 1.0, 0, 0),
        ($1, 'cat2', 2.0, 100, 100)
    `, [concept.id]);
    
    // Trigger CDC sync (simulated)
    await processCDCEvent({
      table: 'concepts',
      operation: 'INSERT',
      data: concept
    });
    
    // Wait for async sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify Neo4j has the data
    const neo4jSession = neo4jDriver.session();
    try {
      const result = await neo4jSession.run(`
        MATCH (c:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
        RETURN c, collect(cat) as categories
      `, { conceptId: concept.id });
      
      expect(result.records).toHaveLength(1);
      const neo4jConcept = result.records[0].get('c').properties;
      const categories = result.records[0].get('categories');
      
      expect(neo4jConcept.name).toBe('Sync Test Concept');
      expect(categories).toHaveLength(2);
    } finally {
      await neo4jSession.close();
    }
  });
  
  it('should handle transaction rollback correctly', async () => {
    const client = await pgPool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create concept
      const result = await client.query(`
        INSERT INTO concepts (id, name, author_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [generateUUID(), 'Rollback Test', 'user-123']);
      
      const conceptId = result.rows[0].id;
      
      // Try to add invalid relation (should fail)
      await expect(client.query(`
        INSERT INTO concept_relations (concept_id, from_category_id, to_category_id, relation_type_id)
        VALUES ($1, 'non-existent', 'also-non-existent', 'invalid-type')
      `, [conceptId])).rejects.toThrow();
      
      await client.query('ROLLBACK');
      
      // Verify nothing was saved
      const checkResult = await pgPool.query(
        'SELECT * FROM concepts WHERE id = $1',
        [conceptId]
      );
      
      expect(checkResult.rows).toHaveLength(0);
      
      // Verify Neo4j also has no data
      const neo4jSession = neo4jDriver.session();
      try {
        const neo4jResult = await neo4jSession.run(
          'MATCH (c:Concept {id: $conceptId}) RETURN c',
          { conceptId }
        );
        expect(neo4jResult.records).toHaveLength(0);
      } finally {
        await neo4jSession.close();
      }
      
    } finally {
      client.release();
    }
  });
});
```

## 4. End-to-End тестирование

### 4.1 E2E тесты с Playwright
```typescript
// test/e2e/concept-creation.e2e.ts
import { test, expect, Page } from '@playwright/test';
import { ConceptPage } from './pages/ConceptPage';
import { LoginPage } from './pages/LoginPage';

test.describe('Concept Creation Flow', () => {
  let page: Page;
  let conceptPage: ConceptPage;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    
    // Navigate to concept creation
    conceptPage = new ConceptPage(page);
    await conceptPage.goto();
  });
  
  test('should create concept with visual editor', async () => {
    // Enter concept details
    await conceptPage.fillName('E2E Test Concept');
    await conceptPage.fillDescription('Created via E2E test');
    
    // Add categories via drag & drop
    await conceptPage.dragCategory('Бытие', { x: 100, y: 100 });
    await conceptPage.dragCategory('Сознание', { x: 300, y: 100 });
    await conceptPage.dragCategory('Материя', { x: 200, y: 250 });
    
    // Create relations
    await conceptPage.createRelation('Бытие', 'Сознание', 'IMPLIES');
    await conceptPage.createRelation('Сознание', 'Материя', 'CONTRADICTS');
    await conceptPage.createRelation('Материя', 'Бытие', 'PART_OF');
    
    // Set weights
    await conceptPage.setCategoryWeight('Бытие', 2.5);
    await conceptPage.setRelationWeight('Бытие -> Сознание', 3.0);
    
    // Save concept
    await conceptPage.save();
    
    // Verify success
    await expect(page.getByText('Концепция успешно создана')).toBeVisible();
    
    // Verify redirect to concept view
    await expect(page).toHaveURL(/\/concepts\/[a-f0-9-]+/);
    
    // Verify saved data
    await expect(conceptPage.getConceptName()).toHaveText('E2E Test Concept');
    await expect(conceptPage.getCategoryCount()).toBe(3);
    await expect(conceptPage.getRelationCount()).toBe(3);
  });
  
  test('should generate theses using AI', async () => {
    // Create basic concept first
    await conceptPage.createBasicConcept('AI Test Concept');
    
    // Open thesis generator
    await conceptPage.openThesisGenerator();
    
    // Configure generation options
    await conceptPage.setThesisCount(5);
    await conceptPage.setThesisStyle('academic');
    await conceptPage.toggleUseWeights(true);
    
    // Start generation
    await conceptPage.generateTheses();
    
    // Wait for AI processing
    await expect(page.getByText('Claude анализирует концепцию...')).toBeVisible();
    
    // Wait for completion (with timeout)
    await expect(page.getByText('Тезисы успешно сгенерированы')).toBeVisible({
      timeout: 30000
    });
    
    // Verify theses
    const theses = await conceptPage.getTheses();
    expect(theses).toHaveLength(5);
    
    // Verify thesis quality
    for (const thesis of theses) {
      expect(thesis.text).toBeTruthy();
      expect(thesis.text.length).toBeGreaterThan(50);
      expect(['high', 'medium', 'low']).toContain(thesis.strength);
    }
  });
  
  test('should handle collaborative editing', async () => {
    // Create concept
    const conceptId = await conceptPage.createBasicConcept('Collab Test');
    
    // Open in second browser
    const browser2 = await webkit.launch();
    const page2 = await browser2.newPage();
    const loginPage2 = new LoginPage(page2);
    await loginPage2.goto();
    await loginPage2.login('test2@example.com', 'password123');
    
    const conceptPage2 = new ConceptPage(page2);
    await conceptPage2.gotoConceptId(conceptId);
    
    // User 1 adds category
    await conceptPage.dragCategory('Время', { x: 400, y: 200 });
    
    // User 2 should see it appear
    await expect(page2.getByTestId('node-Время')).toBeVisible({
      timeout: 5000
    });
    
    // User 2 edits weight
    await conceptPage2.setCategoryWeight('Время', 3.0);
    
    // User 1 should see update
    await expect(page.getByTestId('weight-Время')).toHaveText('3.0', {
      timeout: 5000
    });
    
    // Verify user cursors
    await expect(page.getByTestId('user-cursor-test2@example.com')).toBeVisible();
    await expect(page2.getByTestId('user-cursor-test@example.com')).toBeVisible();
    
    await browser2.close();
  });
});

// test/e2e/pages/ConceptPage.ts
export class ConceptPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/concepts/new');
  }
  
  async gotoConceptId(id: string) {
    await this.page.goto(`/concepts/${id}`);
  }
  
  async fillName(name: string) {
    await this.page.fill('[placeholder="Название концепции"]', name);
  }
  
  async fillDescription(description: string) {
    await this.page.fill('[placeholder="Описание концепции"]', description);
  }
  
  async dragCategory(categoryName: string, position: { x: number; y: number }) {
    const category = this.page.getByText(categoryName).first();
    const canvas = this.page.getByTestId('graph-canvas');
    
    await category.dragTo(canvas, {
      targetPosition: position
    });
  }
  
  async createRelation(from: string, to: string, type: string) {
    const fromNode = this.page.getByTestId(`node-${from}`);
    const toNode = this.page.getByTestId(`node-${to}`);
    
    // Click connection point on from node
    await fromNode.locator('.connection-point').click();
    
    // Drag to target node
    await this.page.mouse.move(
      ...(await toNode.boundingBox()).center
    );
    await this.page.mouse.click();
    
    // Select relation type
    await this.page.getByText(type).click();
  }
  
  async save() {
    await this.page.getByRole('button', { name: 'Сохранить концепцию' }).click();
  }
  
  // ... more helper methods
}
```

## 5. Performance тестирование

### 5.1 Load testing с k6
```javascript
// test/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.1'],             // Error rate under 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Login and get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'loadtest@example.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  const authToken = loginRes.json('tokens.accessToken');
  return { authToken };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.authToken}`,
    'Content-Type': 'application/json'
  };
  
  // Scenario 1: Browse concepts
  const browseRes = http.get(`${BASE_URL}/api/concepts?limit=20`, { headers });
  check(browseRes, {
    'browse status is 200': (r) => r.status === 200,
    'browse returned concepts': (r) => r.json('data.length') > 0
  });
  errorRate.add(browseRes.status !== 200);
  
  sleep(1);
  
  // Scenario 2: Search
  const searchRes = http.get(`${BASE_URL}/api/search?q=философия`, { headers });
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search returned results': (r) => r.json('results') !== null
  });
  errorRate.add(searchRes.status !== 200);
  
  sleep(2);
  
  // Scenario 3: Create concept (10% of users)
  if (Math.random() < 0.1) {
    const conceptData = {
      name: `Load Test Concept ${Date.now()}`,
      categories: [
        { id: 'cat1', weight: 1.0, position: { x: 0, y: 0 } },
        { id: 'cat2', weight: 1.0, position: { x: 100, y: 100 } }
      ],
      relations: [
        { from: 'cat1', to: 'cat2', type: 'IMPLIES', weight: 1.0 }
      ]
    };
    
    const createRes = http.post(
      `${BASE_URL}/api/concepts`,
      JSON.stringify(conceptData),
      { headers }
    );
    
    check(createRes, {
      'create status is 201': (r) => r.status === 201,
      'concept was created': (r) => r.json('id') !== null
    });
    errorRate.add(createRes.status !== 201);
  }
  
  sleep(2);
}

export function teardown(data) {
  // Cleanup test data if needed
}
```

### 5.2 Stress testing
```javascript
// test/performance/stress-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 1000,
      stages: [
        { duration: '2m', target: 100 },  // Normal load
        { duration: '5m', target: 500 },  // High load
        { duration: '2m', target: 1000 }, // Breaking point
        { duration: '5m', target: 1000 }, // Stay at breaking point
        { duration: '5m', target: 0 },    // Recovery
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.5'], // Less than 50% errors
    http_req_duration: ['p(99)<2000'], // 99% under 2s
  },
};

export default function() {
  // Heavy operation: AI generation
  const res = http.post(`${BASE_URL}/api/ai/generate-theses`, JSON.stringify({
    conceptId: 'stress-test-concept',
    options: {
      count: 10,
      style: 'academic'
    }
  }), {
    headers: {
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  check(res, {
    'status is not 500': (r) => r.status !== 500,
    'no timeout': (r) => r.status !== 504
  });
}
```

## 6. Контрактное тестирование

### 6.1 API контракты с Pact
```typescript
// test/contracts/consumer/claude-api.pact.spec.ts
import { Pact } from '@pact-foundation/pact';
import { ClaudeService } from '../../../src/ai/services/claude.service';
import path from 'path';

describe('Claude API Contract', () => {
  const provider = new Pact({
    consumer: 'PhilosophyService',
    provider: 'ClaudeAPI',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'warn',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
  });
  
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());
  
  describe('generate theses', () => {
    it('should generate theses for a concept', async () => {
      const expectedRequest = {
        model: 'claude-opus-4-20250514',
        messages: [
          {
            role: 'user',
            content: like({
              prompt: 'Generate theses for concept',
              context: {
                concept: {
                  name: 'Test Concept',
                  categories: []
                }
              }
            })
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      };
      
      const expectedResponse = {
        content: [
          {
            text: JSON.stringify({
              theses: [
                {
                  text: 'First thesis',
                  relatedCategories: ['cat1'],
                  strength: 'high'
                }
              ]
            })
          }
        ]
      };
      
      await provider.addInteraction({
        state: 'Claude API is available',
        uponReceiving: 'a request to generate theses',
        withRequest: {
          method: 'POST',
          path: '/v1/messages',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': like('sk-ant-api03-...')
          },
          body: expectedRequest
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: expectedResponse
        }
      });
      
      const claudeService = new ClaudeService({
        apiKey: 'test-key',
        baseUrl: provider.mockService.baseUrl
      });
      
      const result = await claudeService.generateTheses({
        concept: {
          name: 'Test Concept',
          categories: []
        }
      });
      
      expect(result.theses).toHaveLength(1);
      expect(result.theses[0].text).toBe('First thesis');
    });
  });
});
```

## 7. Continuous Testing

### 7.1 GitHub Actions для тестов
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unit
        name: unit-tests-${{ matrix.node-version }}

  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: pgvector/pgvector:pg15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      neo4j:
        image: neo4j:5
        env:
          NEO4J_AUTH: neo4j/test
        options: >-
          --health-cmd "cypher-shell -u neo4j -p test 'RETURN 1'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/test
        NEO4J_URI: bolt://localhost:7687
        NEO4J_PASSWORD: test
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: integration-test-results
        path: test-results/

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: |
        npm ci
        npx playwright install --with-deps
    
    - name: Start services
      run: |
        docker-compose -f docker-compose.test.yml up -d
        npm run wait-for-services
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload Playwright report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
    
    - name: Upload screenshots
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: e2e-screenshots
        path: test-results/

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run k6 performance tests
      uses: grafana/k6-action@v0.3.0
      with:
        filename: test/performance/load-test.js
        flags: --out cloud
      env:
        K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
        BASE_URL: ${{ secrets.STAGING_URL }}
        AUTH_TOKEN: ${{ secrets.TEST_AUTH_TOKEN }}
    
    - name: Check performance thresholds
      run: |
        # Check if thresholds were met
        if [ $? -ne 0 ]; then
          echo "Performance thresholds not met!"
          exit 1
        fi
```

### 7.2 Mutation Testing
```typescript
// stryker.conf.js
module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    config: {
      testEnvironment: 'node'
    }
  },
  mutate: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
    '!src/**/*.interface.ts'
  ],
  mutator: {
    name: 'typescript',
    plugins: ['@stryker-mutator/typescript-checker']
  },
  thresholds: {
    high: 80,
    low: 70,
    break: 60
  },
  dashboard: {
    project: 'github.com/your-org/philosophy-service',
    version: 'main'
  }
};
```

## 8. Test Data Management

### 8.1 Test Data Factory
```typescript
// test/factories/concept.factory.ts
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { Concept, Category, Relation } from '../../src/types';

export const CategoryFactory = Factory.define<Category>(() => ({
  id: faker.datatype.uuid(),
  name: faker.helpers.arrayElement([
    'Бытие', 'Сознание', 'Материя', 'Время', 'Пространство',
    'Причинность', 'Свобода', 'Необходимость'
  ]),
  description: faker.lorem.paragraph(),
  tradition: faker.helpers.arrayElement(['western', 'eastern', 'analytical']),
  domain: faker.helpers.arrayElement(['metaphysics', 'epistemology', 'ethics'])
}));

export const ConceptFactory = Factory.define<Concept>(() => {
  const categories = CategoryFactory.buildList(
    faker.datatype.number({ min: 3, max: 10 })
  );
  
  return {
    id: faker.datatype.uuid(),
    name: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    authorId: faker.datatype.uuid(),
    categories: categories.map(cat => ({
      category: cat,
      weight: faker.datatype.float({ min: 0.5, max: 5.0 }),
      position: {
        x: faker.datatype.number({ min: -500, max: 500 }),
        y: faker.datatype.number({ min: -500, max: 500 })
      }
    })),
    relations: generateRelations(categories),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  };
});

function generateRelations(categories: Category[]): Relation[] {
  const relations: Relation[] = [];
  const relationTypes = ['CAUSES', 'IMPLIES', 'CONTRADICTS', 'PART_OF'];
  
  // Generate random but valid relations
  for (let i = 0; i < categories.length - 1; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      if (Math.random() > 0.6) { // 40% chance of relation
        relations.push({
          id: faker.datatype.uuid(),
          from: categories[i],
          to: categories[j],
          type: faker.helpers.arrayElement(relationTypes),
          weight: faker.datatype.float({ min: 0.5, max: 5.0 })
        });
      }
    }
  }
  
  return relations;
}

// Usage in tests
const testConcept = ConceptFactory.build({
  name: 'Specific Test Concept',
  categories: CategoryFactory.buildList(5)
});
```

### 8.2 Database Seeding
```typescript
// test/seeds/test-data.seed.ts
import { DataSource } from 'typeorm';
import { ConceptFactory, UserFactory } from '../factories';

export async function seedTestData(dataSource: DataSource) {
  // Create test users
  const users = await Promise.all(
    UserFactory.buildList(10).map(user =>
      dataSource.getRepository('User').save(user)
    )
  );
  
  // Create concepts for each user
  for (const user of users) {
    const concepts = ConceptFactory.buildList(
      faker.datatype.number({ min: 1, max: 5 }),
      { authorId: user.id }
    );
    
    for (const concept of concepts) {
      await dataSource.getRepository('Concept').save(concept);
      
      // Sync to Neo4j
      await syncConceptToNeo4j(concept);
      
      // Generate some theses
      if (Math.random() > 0.5) {
        await generateThesesForConcept(concept.id);
      }
    }
  }
  
  // Create some public concepts
  const publicConcepts = ConceptFactory.buildList(20, {
    isPublic: true,
    qualityScore: faker.datatype.float({ min: 0.7, max: 1.0 })
  });
  
  await Promise.all(
    publicConcepts.map(concept =>
      dataSource.getRepository('Concept').save(concept)
    )
  );
}
```

Эта стратегия тестирования обеспечивает:
- Полное покрытие кода на всех уровнях
- Автоматизированное тестирование в CI/CD pipeline
- Performance и stress тестирование
- Контрактное тестирование для внешних API
- Mutation testing для проверки качества тестов
- Удобное управление тестовыми данными

Система тестирования гарантирует высокое качество и надежность философского сервиса.