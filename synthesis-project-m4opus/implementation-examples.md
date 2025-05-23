# Примеры реализации ключевых сценариев философского сервиса

## 1. Сценарий: Создание новой концепции с real-time синхронизацией

### 1.1 Frontend компонент граф-редактора
```typescript
// components/ConceptEditor.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import { GraphCanvas } from '@/components/GraphCanvas';
import { CategoryPanel } from '@/components/CategoryPanel';
import { debounce } from 'lodash';

interface ConceptEditorProps {
  conceptId?: string;
  mode: 'create' | 'edit';
}

export const ConceptEditor: React.FC<ConceptEditorProps> = ({ conceptId, mode }) => {
  const [concept, setConcept] = useState<Concept>({
    name: '',
    description: '',
    categories: [],
    relations: []
  });
  
  const [localChanges, setLocalChanges] = useState<Map<string, any>>(new Map());
  const { socket, connected } = useWebSocket();
  
  // GraphQL мутации
  const [createConcept] = useMutation(CREATE_CONCEPT_MUTATION);
  const [updateGraph] = useMutation(UPDATE_GRAPH_MUTATION);
  
  // Подписка на real-time обновления
  useSubscription(CONCEPT_UPDATES_SUBSCRIPTION, {
    variables: { conceptId },
    skip: !conceptId || mode === 'create',
    onSubscriptionData: ({ subscriptionData }) => {
      handleRemoteUpdate(subscriptionData.data.conceptUpdate);
    }
  });
  
  // WebSocket для коллаборативного редактирования
  useEffect(() => {
    if (connected && conceptId && mode === 'edit') {
      socket.emit('join-concept', { conceptId });
      
      socket.on('graph-update', handleCollaborativeUpdate);
      socket.on('user-cursor', handleUserCursor);
      socket.on('element-locked', handleElementLock);
      
      return () => {
        socket.emit('leave-concept', { conceptId });
        socket.off('graph-update');
        socket.off('user-cursor');
        socket.off('element-locked');
      };
    }
  }, [connected, conceptId, mode]);
  
  // Оптимистичное обновление с debounce
  const updateGraphOptimistic = useCallback(
    debounce(async (changes: GraphChange) => {
      const operationId = generateOperationId();
      
      // Применяем изменения локально сразу
      setConcept(prev => applyChanges(prev, changes));
      setLocalChanges(prev => new Map(prev).set(operationId, changes));
      
      try {
        // Отправляем через WebSocket для быстрой синхронизации
        if (connected) {
          socket.emit('graph-edit', {
            conceptId,
            operation: changes.type,
            data: { ...changes.data, operationId }
          });
        }
        
        // Параллельно сохраняем в БД через GraphQL
        const result = await updateGraph({
          variables: {
            conceptId,
            changes
          },
          optimisticResponse: {
            updateGraph: {
              success: true,
              concept: applyChanges(concept, changes)
            }
          }
        });
        
        // Убираем из локальных изменений после подтверждения
        setLocalChanges(prev => {
          const next = new Map(prev);
          next.delete(operationId);
          return next;
        });
        
      } catch (error) {
        // Откат при ошибке
        rollbackChange(operationId);
        showError('Failed to save changes');
      }
    }, 300),
    [conceptId, connected, socket, updateGraph]
  );
  
  // Обработка drag & drop категорий
  const handleCategoryDrop = useCallback((category: Category, position: Position) => {
    updateGraphOptimistic({
      type: 'ADD_CATEGORY',
      data: {
        categoryId: category.id,
        position,
        weight: 1.0
      }
    });
  }, [updateGraphOptimistic]);
  
  // Создание связи между категориями
  const handleCreateRelation = useCallback((
    from: string,
    to: string,
    type: RelationType
  ) => {
    // Запрос блокировки элементов
    socket.emit('request-lock', {
      conceptId,
      elementId: `${from}-${to}`,
      elementType: 'relation'
    });
    
    updateGraphOptimistic({
      type: 'ADD_RELATION',
      data: {
        fromCategoryId: from,
        toCategoryId: to,
        relationType: type.id,
        weight: 1.0
      }
    });
  }, [socket, conceptId, updateGraphOptimistic]);
  
  // AI-ассистент для предложений
  const [suggestCategories, { loading: suggesting }] = useMutation(
    SUGGEST_CATEGORIES_MUTATION
  );
  
  const handleAISuggestions = async () => {
    const result = await suggestCategories({
      variables: {
        conceptId: concept.id,
        currentCategories: concept.categories.map(c => c.id)
      }
    });
    
    // Показываем предложения в UI
    showSuggestions(result.data.suggestions);
  };
  
  return (
    <div className="concept-editor">
      <div className="editor-header">
        <input
          type="text"
          value={concept.name}
          onChange={e => setConcept(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Название концепции"
          className="concept-name-input"
        />
        
        <div className="editor-actions">
          <button onClick={handleAISuggestions} disabled={suggesting}>
            {suggesting ? 'Анализ...' : 'AI предложения'}
          </button>
          
          {mode === 'edit' && <CollaboratorAvatars conceptId={conceptId} />}
        </div>
      </div>
      
      <div className="editor-main">
        <CategoryPanel
          onCategorySelect={handleCategoryDrop}
          recentCategories={recentCategories}
        />
        
        <GraphCanvas
          concept={concept}
          onCategoryMove={handleCategoryMove}
          onRelationCreate={handleCreateRelation}
          onElementSelect={handleElementSelect}
          collaborativeCursors={collaborativeCursors}
          lockedElements={lockedElements}
        />
        
        <PropertiesPanel
          selectedElement={selectedElement}
          onPropertyChange={handlePropertyChange}
        />
      </div>
      
      {localChanges.size > 0 && (
        <div className="sync-indicator">
          Синхронизация изменений... ({localChanges.size})
        </div>
      )}
    </div>
  );
};
```

### 1.2 Backend GraphQL резолвер с транзакциями
```typescript
// resolvers/concept.mutations.ts
import { Transaction } from 'sequelize';
import { PubSub } from 'graphql-subscriptions';

@Resolver()
export class ConceptMutationResolver {
  constructor(
    @InjectRepository(Concept) private conceptRepo: Repository<Concept>,
    private neo4jService: Neo4jService,
    private cacheService: CacheService,
    private pubsub: PubSub,
    private eventBus: EventBus
  ) {}
  
  @Mutation(() => ConceptResult)
  @UseGuards(AuthGuard)
  async createConcept(
    @Args('input') input: CreateConceptInput,
    @CurrentUser() user: User
  ): Promise<ConceptResult> {
    const transaction = await this.conceptRepo.sequelize.transaction();
    
    try {
      // 1. Создание в PostgreSQL
      const concept = await this.conceptRepo.create({
        ...input,
        authorId: user.id,
        id: generateUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      }, { transaction });
      
      // 2. Создание категорий и связей
      if (input.categories?.length > 0) {
        await this.createConceptCategories(
          concept.id,
          input.categories,
          transaction
        );
      }
      
      if (input.relations?.length > 0) {
        await this.createConceptRelations(
          concept.id,
          input.relations,
          transaction
        );
      }
      
      // 3. Коммит транзакции
      await transaction.commit();
      
      // 4. Асинхронная синхронизация с Neo4j
      this.eventBus.emit('concept.created', {
        conceptId: concept.id,
        authorId: user.id,
        timestamp: new Date()
      });
      
      // 5. Инвалидация кэша
      await this.cacheService.invalidate(`user:${user.id}:concepts`);
      
      // 6. Real-time уведомление подписчикам
      await this.pubsub.publish('CONCEPT_CREATED', {
        conceptCreated: {
          concept,
          author: user
        }
      });
      
      return {
        success: true,
        concept,
        message: 'Концепция успешно создана'
      };
      
    } catch (error) {
      await transaction.rollback();
      
      this.logger.error('Failed to create concept', {
        error: error.message,
        input,
        userId: user.id
      });
      
      throw new GraphQLError('Не удалось создать концепцию', {
        extensions: {
          code: 'CONCEPT_CREATION_FAILED',
          details: error.message
        }
      });
    }
  }
  
  @Mutation(() => ConceptResult)
  async updateGraph(
    @Args('conceptId') conceptId: string,
    @Args('changes') changes: GraphChangeInput,
    @CurrentUser() user: User
  ): Promise<ConceptResult> {
    // Проверка прав доступа
    const hasAccess = await this.checkConceptAccess(conceptId, user.id, 'write');
    if (!hasAccess) {
      throw new ForbiddenException('Нет прав на редактирование');
    }
    
    // Применение изменений в зависимости от типа
    switch (changes.type) {
      case 'ADD_CATEGORY':
        return this.addCategoryToConcept(conceptId, changes.data);
      
      case 'ADD_RELATION':
        return this.addRelationToConcept(conceptId, changes.data);
      
      case 'UPDATE_WEIGHT':
        return this.updateElementWeight(conceptId, changes.data);
      
      case 'REMOVE_ELEMENT':
        return this.removeElement(conceptId, changes.data);
      
      default:
        throw new Error(`Unknown change type: ${changes.type}`);
    }
  }
  
  private async addCategoryToConcept(
    conceptId: string,
    data: AddCategoryData
  ): Promise<ConceptResult> {
    const neo4jSession = this.neo4jService.getSession();
    const pgTransaction = await this.conceptRepo.sequelize.transaction();
    
    try {
      // 1. Добавление в PostgreSQL
      await this.conceptRepo.query(
        `INSERT INTO concept_categories 
         (concept_id, category_id, weight, position_x, position_y) 
         VALUES ($1, $2, $3, $4, $5)`,
        {
          bind: [conceptId, data.categoryId, data.weight, data.position.x, data.position.y],
          transaction: pgTransaction
        }
      );
      
      // 2. Добавление в Neo4j
      await neo4jSession.run(
        `MATCH (concept:Concept {id: $conceptId})
         MATCH (category:Category {id: $categoryId})
         MERGE (concept)-[r:INCLUDES]->(category)
         SET r.weight = $weight,
             r.positionX = $positionX,
             r.positionY = $positionY,
             r.addedAt = datetime()
         RETURN concept, category, r`,
        {
          conceptId,
          categoryId: data.categoryId,
          weight: data.weight,
          positionX: data.position.x,
          positionY: data.position.y
        }
      );
      
      await pgTransaction.commit();
      
      // 3. Обновление поискового индекса
      await this.updateSearchIndex(conceptId);
      
      // 4. Публикация обновления
      const updatedConcept = await this.getFullConcept(conceptId);
      
      await this.pubsub.publish(`CONCEPT_UPDATES.${conceptId}`, {
        conceptUpdate: {
          type: 'CATEGORY_ADDED',
          conceptId,
          data: {
            categoryId: data.categoryId,
            position: data.position
          },
          timestamp: new Date()
        }
      });
      
      return {
        success: true,
        concept: updatedConcept
      };
      
    } catch (error) {
      await pgTransaction.rollback();
      throw error;
    } finally {
      await neo4jSession.close();
    }
  }
}
```

### 1.3 Сервис синхронизации с CDC
```typescript
// services/cdc-sync.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as pgLogicalReplication from 'pg-logical-replication';

@Injectable()
export class CDCSyncService implements OnModuleInit {
  private replicationClient: any;
  
  constructor(
    @InjectQueue('sync') private syncQueue: Queue,
    private neo4jService: Neo4jService,
    private elasticService: ElasticsearchService,
    private cacheService: CacheService
  ) {}
  
  async onModuleInit() {
    await this.startCDC();
  }
  
  private async startCDC() {
    // Настройка логической репликации PostgreSQL
    this.replicationClient = new pgLogicalReplication.LogicalReplicationService({
      connectionString: process.env.DATABASE_URL,
      slotName: 'philosophy_cdc_slot',
      publicationName: 'philosophy_changes'
    });
    
    // Обработка изменений
    this.replicationClient.on('data', async (lsn: string, log: any) => {
      try {
        await this.processChange(log);
        await this.replicationClient.acknowledge(lsn);
      } catch (error) {
        this.logger.error('CDC processing error', { error, log });
      }
    });
    
    // Запуск стриминга
    await this.replicationClient.subscribe([
      'concepts',
      'concept_categories', 
      'concept_relations',
      'categories',
      'theses'
    ]);
  }
  
  private async processChange(change: CDCChange) {
    const { table, operation, data, oldData } = change;
    
    // Добавляем в очередь для асинхронной обработки
    await this.syncQueue.add(`sync-${table}`, {
      table,
      operation,
      data,
      oldData,
      timestamp: new Date()
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    
    // Критичные операции обрабатываем синхронно
    if (this.isCriticalOperation(table, operation)) {
      await this.processCriticalChange(change);
    }
  }
  
  private async processCriticalChange(change: CDCChange) {
    const { table, operation, data } = change;
    
    switch (table) {
      case 'concepts':
        if (operation === 'DELETE') {
          // Немедленное удаление из всех систем
          await Promise.all([
            this.deleteFromNeo4j(data.id),
            this.deleteFromElastic(data.id),
            this.invalidateCache(data.id)
          ]);
        }
        break;
        
      case 'concept_relations':
        if (operation === 'INSERT') {
          // Немедленное добавление связи в Neo4j
          await this.addRelationToNeo4j(data);
        }
        break;
    }
  }
  
  // Обработчик очереди синхронизации
  @Process('sync-concepts')
  async handleConceptSync(job: Job<SyncJobData>) {
    const { operation, data } = job.data;
    
    try {
      switch (operation) {
        case 'INSERT':
        case 'UPDATE':
          await this.syncConceptToNeo4j(data.id);
          await this.updateElasticIndex(data);
          await this.updateVectorEmbeddings(data.id);
          break;
          
        case 'DELETE':
          // Уже обработано в критичных операциях
          break;
      }
      
      // Метрики успешной синхронизации
      this.metrics.incrementSyncSuccess(job.data.table);
      
    } catch (error) {
      this.logger.error('Sync job failed', {
        jobId: job.id,
        error: error.message,
        data: job.data
      });
      
      this.metrics.incrementSyncFailure(job.data.table);
      throw error; // Bull повторит попытку
    }
  }
  
  private async syncConceptToNeo4j(conceptId: string) {
    const conceptData = await this.getConceptDataForSync(conceptId);
    
    const session = this.neo4jService.getSession();
    const tx = session.beginTransaction();
    
    try {
      // 1. Создание/обновление узла концепции
      await tx.run(`
        MERGE (c:Concept {id: $id})
        SET c += $properties
      `, {
        id: conceptData.id,
        properties: this.prepareNeo4jProperties(conceptData)
      });
      
      // 2. Синхронизация категорий
      await tx.run(`
        MATCH (c:Concept {id: $id})
        OPTIONAL MATCH (c)-[r:INCLUDES]->(:Category)
        DELETE r
      `, { id: conceptId });
      
      for (const category of conceptData.categories) {
        await tx.run(`
          MATCH (c:Concept {id: $conceptId})
          MATCH (cat:Category {id: $catId})
          CREATE (c)-[r:INCLUDES {
            weight: $weight,
            positionX: $posX,
            positionY: $posY
          }]->(cat)
        `, {
          conceptId,
          catId: category.categoryId,
          weight: category.weight,
          posX: category.positionX,
          posY: category.positionY
        });
      }
      
      // 3. Синхронизация связей
      for (const relation of conceptData.relations) {
        await tx.run(`
          MATCH (from:Category {id: $fromId})
          MATCH (to:Category {id: $toId})
          MERGE (from)-[r:${relation.typeName} {
            conceptId: $conceptId
          }]->(to)
          SET r.weight = $weight,
              r.rationale = $rationale
        `, {
          fromId: relation.fromCategoryId,
          toId: relation.toCategoryId,
          conceptId,
          weight: relation.weight,
          rationale: relation.rationale
        });
      }
      
      await tx.commit();
      
      // 4. Обновление аналитических метрик
      await this.updateConceptMetrics(conceptId);
      
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await session.close();
    }
  }
}
```

## 2. Сценарий: Генерация тезисов с контекстом

### 2.1 Frontend компонент генерации
```tsx
// components/ThesisGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';

interface ThesisGeneratorProps {
  conceptId: string;
  onThesesGenerated: (theses: Thesis[]) => void;
}

export const ThesisGenerator: React.FC<ThesisGeneratorProps> = ({
  conceptId,
  onThesesGenerated
}) => {
  const [options, setOptions] = useState<GenerateThesesOptions>({
    count: 7,
    style: 'academic',
    focusCategories: [],
    useWeights: true
  });
  
  const [generationState, setGenerationState] = useState<{
    status: 'idle' | 'preparing' | 'generating' | 'processing' | 'complete';
    progress: number;
    message: string;
  }>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  
  const [generateTheses, { loading }] = useMutation(GENERATE_THESES_MUTATION);
  
  // Подписка на прогресс генерации
  useSubscription(AI_OPERATION_PROGRESS_SUBSCRIPTION, {
    variables: { operationId: generationState.operationId },
    skip: !generationState.operationId,
    onSubscriptionData: ({ subscriptionData }) => {
      const progress = subscriptionData.data.aiOperationProgress;
      setGenerationState(prev => ({
        ...prev,
        status: progress.status,
        progress: progress.percentage,
        message: progress.message
      }));
    }
  });
  
  const handleGenerate = async () => {
    try {
      setGenerationState({
        status: 'preparing',
        progress: 10,
        message: 'Анализ структуры концепции...'
      });
      
      const result = await generateTheses({
        variables: {
          conceptId,
          options
        }
      });
      
      if (result.data.generateTheses.success) {
        setGenerationState(prev => ({
          ...prev,
          operationId: result.data.generateTheses.operationId
        }));
        
        // Ждем завершения через подписку
        const theses = await waitForCompletion(
          result.data.generateTheses.operationId
        );
        
        onThesesGenerated(theses);
      }
      
    } catch (error) {
      setGenerationState({
        status: 'idle',
        progress: 0,
        message: 'Ошибка генерации'
      });
      
      showError('Не удалось сгенерировать тезисы');
    }
  };
  
  return (
    <div className="thesis-generator">
      <div className="generator-header">
        <h3>Генерация тезисов с помощью AI</h3>
        <div className="ai-badge">
          <ClaudeIcon /> Claude 4 Opus
        </div>
      </div>
      
      <div className="generator-options">
        <div className="option-group">
          <label>Количество тезисов</label>
          <input
            type="range"
            min="3"
            max="15"
            value={options.count}
            onChange={e => setOptions(prev => ({
              ...prev,
              count: parseInt(e.target.value)
            }))}
          />
          <span>{options.count}</span>
        </div>
        
        <div className="option-group">
          <label>Стиль изложения</label>
          <select
            value={options.style}
            onChange={e => setOptions(prev => ({
              ...prev,
              style: e.target.value as any
            }))}
          >
            <option value="academic">Академический</option>
            <option value="accessible">Доступный</option>
            <option value="poetic">Поэтический</option>
          </select>
        </div>
        
        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={options.useWeights}
              onChange={e => setOptions(prev => ({
                ...prev,
                useWeights: e.target.checked
              }))}
            />
            Учитывать веса элементов
          </label>
        </div>
        
        <CategorySelector
          conceptId={conceptId}
          selected={options.focusCategories}
          onChange={categories => setOptions(prev => ({
            ...prev,
            focusCategories: categories
          }))}
          label="Фокус на категориях (опционально)"
        />
      </div>
      
      <AnimatePresence>
        {generationState.status !== 'idle' && (
          <motion.div
            className="generation-progress"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${generationState.progress}%` }}
              />
            </div>
            
            <div className="progress-message">
              {generationState.message}
            </div>
            
            {generationState.status === 'generating' && (
              <div className="ai-thinking">
                <ClaudeThinkingAnimation />
                <span>Claude анализирует концепцию...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        className="generate-button"
        onClick={handleGenerate}
        disabled={loading || generationState.status !== 'idle'}
      >
        {loading ? 'Генерация...' : 'Сгенерировать тезисы'}
      </button>
    </div>
  );
};
```

### 2.2 Backend сервис генерации с Claude
```typescript
// services/thesis-generation.service.ts
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class ThesisGenerationService {
  constructor(
    private claudeService: ClaudeService,
    private contextBuilder: ContextBuilderService,
    private neo4jService: Neo4jService,
    private vectorService: VectorSearchService,
    @InjectQueue('ai-operations') private aiQueue: Queue
  ) {}
  
  async generateTheses(
    conceptId: string,
    options: GenerateThesesOptions,
    userId: string
  ): Promise<GenerateThesesResult> {
    // 1. Создание операции
    const operationId = generateUUID();
    
    // 2. Добавление в очередь для асинхронной обработки
    const job = await this.aiQueue.add('generate-theses', {
      operationId,
      conceptId,
      options,
      userId
    }, {
      priority: this.calculatePriority(userId),
      attempts: 2
    });
    
    // 3. Немедленный возврат с ID операции
    return {
      success: true,
      operationId,
      estimatedTime: this.estimateGenerationTime(conceptId, options)
    };
  }
  
  @Process('generate-theses')
  async processThesisGeneration(job: Job<ThesisGenerationJob>) {
    const { operationId, conceptId, options, userId } = job.data;
    
    try {
      // 1. Обновление статуса
      await this.updateOperationStatus(operationId, {
        status: 'preparing',
        progress: 10,
        message: 'Загрузка данных концепции'
      });
      
      // 2. Построение обогащенного контекста
      const context = await this.buildEnrichedContext(conceptId, options);
      
      await this.updateOperationStatus(operationId, {
        status: 'preparing',
        progress: 30,
        message: 'Анализ структуры и поиск похожих концепций'
      });
      
      // 3. Поиск семантически похожих концепций для контекста
      const similarConcepts = await this.findSimilarConcepts(conceptId);
      context.similarConcepts = similarConcepts.slice(0, 3);
      
      // 4. Получение исторических тезисов пользователя для стиля
      const userStyle = await this.analyzeUserStyle(userId);
      context.userPreferences = userStyle;
      
      await this.updateOperationStatus(operationId, {
        status: 'generating',
        progress: 50,
        message: 'Claude генерирует тезисы на основе анализа'
      });
      
      // 5. Генерация через Claude
      const prompt = this.buildThesisPrompt(context, options);
      const claudeResponse = await this.claudeService.generate(prompt, {
        temperature: 0.7,
        maxTokens: 3000
      });
      
      await this.updateOperationStatus(operationId, {
        status: 'processing',
        progress: 80,
        message: 'Обработка и валидация результатов'
      });
      
      // 6. Парсинг и валидация ответа
      const theses = await this.parseAndValidateTheses(
        claudeResponse,
        context
      );
      
      // 7. Сохранение в БД
      const savedTheses = await this.saveTheses(conceptId, theses, {
        generatedBy: 'claude-4-opus',
        operationId,
        options
      });
      
      // 8. Обновление поискового индекса
      await this.updateSearchIndex(conceptId, savedTheses);
      
      // 9. Расчет качества
      const qualityMetrics = await this.calculateThesisQuality(
        savedTheses,
        context
      );
      
      await this.updateOperationStatus(operationId, {
        status: 'complete',
        progress: 100,
        message: 'Тезисы успешно сгенерированы',
        result: {
          theses: savedTheses,
          metrics: qualityMetrics
        }
      });
      
      // 10. Публикация результата
      await this.pubsub.publish(`AI_OPERATION_COMPLETE.${operationId}`, {
        operationComplete: {
          operationId,
          type: 'THESIS_GENERATION',
          result: savedTheses
        }
      });
      
    } catch (error) {
      await this.handleGenerationError(operationId, error);
      throw error;
    }
  }
  
  private async buildEnrichedContext(
    conceptId: string,
    options: GenerateThesesOptions
  ): Promise<EnrichedContext> {
    // Параллельная загрузка всех необходимых данных
    const [
      graphData,
      conceptMetrics,
      categoryDefinitions,
      relatedConcepts
    ] = await Promise.all([
      this.loadGraphFromNeo4j(conceptId),
      this.calculateConceptMetrics(conceptId),
      this.loadCategoryDefinitions(conceptId),
      this.findRelatedConcepts(conceptId)
    ]);
    
    // Оптимизация графа для контекстного окна
    const optimizedGraph = await this.optimizeGraphForPrompt(
      graphData,
      options
    );
    
    return {
      concept: {
        id: conceptId,
        ...optimizedGraph,
        metrics: conceptMetrics
      },
      categoryDefinitions,
      relatedConcepts,
      options
    };
  }
  
  private buildThesisPrompt(
    context: EnrichedContext,
    options: GenerateThesesOptions
  ): string {
    const { concept, categoryDefinitions, similarConcepts } = context;
    
    return `Проанализируй философскую концепцию "${concept.name}" и сгенерируй ${options.count} ключевых тезисов.

## Структура концепции:

### Категории (${concept.categories.length}):
${concept.categories.map(cat => 
  `- ${cat.name}${cat.weight > 1 ? ` (вес: ${cat.weight})` : ''}: ${
    categoryDefinitions[cat.id] || cat.description
  }`
).join('\n')}

### Связи между категориями (${concept.relations.length}):
${concept.relations.map(rel =>
  `- ${rel.from.name} → [${rel.type}] → ${rel.to.name}${
    rel.weight !== 1 ? ` (вес: ${rel.weight})` : ''
  }${rel.rationale ? `\n  Обоснование: ${rel.rationale}` : ''}`
).join('\n')}

### Метрики концепции:
- Связность графа: ${context.concept.metrics.connectivity}
- Философская глубина: ${context.concept.metrics.depth}
- Междисциплинарность: ${context.concept.metrics.interdisciplinarity}

${similarConcepts.length > 0 ? `
### Контекст похожих концепций:
${similarConcepts.map(sc => 
  `- "${sc.name}": ${sc.mainThesis}`
).join('\n')}
` : ''}

## Требования к тезисам:

1. Стиль изложения: ${this.getStyleDescription(options.style)}
2. Каждый тезис должен отражать существенные связи между категориями
3. ${options.useWeights ? 'Уделяй больше внимания элементам с высоким весом' : 'Рассматривай все элементы равнозначно'}
4. ${options.focusCategories?.length > 0 ? 
     `Особый фокус на категориях: ${options.focusCategories.join(', ')}` : 
     'Сбалансированное внимание ко всем аспектам'}
5. Избегай тавтологий и банальностей
6. Каждый тезис должен добавлять новое понимание концепции

## Формат ответа:

Верни JSON в следующем формате:
{
  "theses": [
    {
      "text": "Текст тезиса",
      "relatedCategories": ["id1", "id2"],
      "strength": "high|medium|low",
      "rationale": "Краткое обоснование важности тезиса"
    }
  ],
  "conceptSummary": "Краткое резюме сути концепции (1-2 предложения)",
  "suggestedDevelopments": ["Возможное направление развития 1", "..."]
}`;
  }
  
  private async calculateThesisQuality(
    theses: Thesis[],
    context: EnrichedContext
  ): Promise<QualityMetrics> {
    const metrics = {
      coherence: 0,
      coverage: 0,
      depth: 0,
      originality: 0,
      overall: 0
    };
    
    // 1. Coherence - согласованность между тезисами
    const embeddings = await this.vectorService.generateEmbeddings(
      theses.map(t => t.text)
    );
    metrics.coherence = this.calculateCoherenceScore(embeddings);
    
    // 2. Coverage - покрытие категорий и связей
    const coveredCategories = new Set(
      theses.flatMap(t => t.relatedCategories)
    );
    metrics.coverage = coveredCategories.size / context.concept.categories.length;
    
    // 3. Depth - философская глубина
    const depthKeywords = ['сущность', 'основание', 'принцип', 'диалектика'];
    metrics.depth = theses.filter(t => 
      depthKeywords.some(kw => t.text.includes(kw))
    ).length / theses.length;
    
    // 4. Originality - через сравнение с существующими
    const similarTheses = await this.findSimilarTheses(theses);
    metrics.originality = 1 - (similarTheses.length / theses.length);
    
    // 5. Overall
    metrics.overall = (
      metrics.coherence * 0.3 +
      metrics.coverage * 0.3 +
      metrics.depth * 0.2 +
      metrics.originality * 0.2
    );
    
    return metrics;
  }
}
```

## 3. Сценарий: Семантический поиск с ранжированием

### 3.1 Унифицированный поисковый сервис
```typescript
// services/unified-search.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnifiedSearchService {
  constructor(
    private elasticService: ElasticsearchService,
    private weaviateService: WeaviateService,
    private neo4jService: Neo4jService,
    private rankingService: SearchRankingService
  ) {}
  
  async search(
    query: string,
    options: SearchOptions
  ): Promise<SearchResults> {
    // 1. Препроцессинг запроса
    const processedQuery = await this.preprocessQuery(query);
    
    // 2. Параллельный поиск во всех источниках
    const [
      textResults,
      vectorResults,
      graphResults
    ] = await Promise.all([
      this.performTextSearch(processedQuery, options),
      this.performVectorSearch(processedQuery, options),
      this.performGraphSearch(processedQuery, options)
    ]);
    
    // 3. Объединение и ранжирование результатов
    const mergedResults = await this.mergeAndRank(
      textResults,
      vectorResults,
      graphResults,
      processedQuery
    );
    
    // 4. Постобработка и обогащение
    const enrichedResults = await this.enrichResults(
      mergedResults.slice(0, options.limit || 20)
    );
    
    // 5. Группировка по типам
    const groupedResults = this.groupResults(enrichedResults);
    
    return {
      query: processedQuery.original,
      totalCount: mergedResults.length,
      results: groupedResults,
      facets: await this.calculateFacets(mergedResults),
      suggestions: await this.generateSuggestions(processedQuery),
      performanceMetrics: {
        totalTime: Date.now() - startTime,
        searchTimes: {
          text: textResults.timing,
          vector: vectorResults.timing,
          graph: graphResults.timing
        }
      }
    };
  }
  
  private async performTextSearch(
    query: ProcessedQuery,
    options: SearchOptions
  ): Promise<TextSearchResults> {
    const startTime = Date.now();
    
    const esQuery = {
      bool: {
        should: [
          // Точное совпадение
          {
            multi_match: {
              query: query.normalized,
              fields: ['name^3', 'description^2', 'theses.text'],
              type: 'phrase',
              boost: 2
            }
          },
          // Fuzzy поиск для опечаток
          {
            multi_match: {
              query: query.normalized,
              fields: ['name^2', 'description'],
              fuzziness: 'AUTO',
              prefix_length: 2
            }
          },
          // Поиск по синонимам
          {
            multi_match: {
              query: query.synonyms.join(' '),
              fields: ['categories.synonyms', 'tags'],
              type: 'cross_fields'
            }
          }
        ],
        filter: this.buildFilters(options),
        minimum_should_match: 1
      }
    };
    
    // Добавление boosting для персонализации
    if (options.userId) {
      esQuery.bool.should.push({
        terms: {
          'author.id': await this.getUserNetwork(options.userId),
          boost: 0.5
        }
      });
    }
    
    const response = await this.elasticService.search({
      index: 'philosophy-concepts',
      body: {
        query: esQuery,
        highlight: {
          fields: {
            'name': {},
            'description': {},
            'theses.text': {}
          }
        },
        aggs: {
          traditions: {
            terms: { field: 'tradition' }
          },
          complexity: {
            terms: { field: 'complexity' }
          }
        }
      }
    });
    
    return {
      hits: response.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
        highlights: hit.highlight,
        type: 'text'
      })),
      timing: Date.now() - startTime,
      aggregations: response.aggregations
    };
  }
  
  private async performVectorSearch(
    query: ProcessedQuery,
    options: SearchOptions
  ): Promise<VectorSearchResults> {
    const startTime = Date.now();
    
    // 1. Генерация embedding для запроса
    const queryEmbedding = await this.generateQueryEmbedding(query);
    
    // 2. Поиск в Weaviate
    const graphql = `
      {
        Get {
          Concept(
            nearVector: {
              vector: ${JSON.stringify(queryEmbedding)}
              certainty: ${options.minSimilarity || 0.7}
            }
            limit: ${options.limit || 50}
            where: {
              operator: And
              operands: [
                ${this.buildWeaviateFilters(options)}
              ]
            }
          ) {
            _additional {
              id
              certainty
              distance
            }
            name
            description
            tradition
            categories {
              ... on Category {
                name
                domain
              }
            }
          }
        }
      }
    `;
    
    const response = await this.weaviateService.query(graphql);
    
    // 3. Дополнительный поиск похожих категорий
    const categoryResults = await this.searchSimilarCategories(
      queryEmbedding,
      options
    );
    
    return {
      conceptHits: response.data.Get.Concept.map(hit => ({
        id: hit._additional.id,
        score: hit._additional.certainty,
        distance: hit._additional.distance,
        source: hit,
        type: 'vector-concept'
      })),
      categoryHits: categoryResults,
      timing: Date.now() - startTime
    };
  }
  
  private async performGraphSearch(
    query: ProcessedQuery,
    options: SearchOptions
  ): Promise<GraphSearchResults> {
    const startTime = Date.now();
    
    // Поиск путей и паттернов в Neo4j
    const cypher = `
      // Поиск концепций с похожими структурами
      MATCH (c:Concept)-[:INCLUDES]->(cat:Category)
      WHERE cat.name =~ $pattern OR cat.canonicalName =~ $pattern
      WITH c, count(DISTINCT cat) as matchCount
      WHERE matchCount > 0
      
      // Расширение поиска через связанные категории
      MATCH (c)-[:INCLUDES]->(cat:Category)
      OPTIONAL MATCH (cat)-[r]-(related:Category)<-[:INCLUDES]-(c)
      WITH c, matchCount, 
           count(DISTINCT cat) as totalCategories,
           count(DISTINCT r) as relationCount,
           avg(CASE WHEN exists(r.weight) THEN r.weight ELSE 1 END) as avgWeight
      
      // Расчет релевантности на основе структуры
      WITH c, 
           matchCount * 2.0 / totalCategories as relevance,
           relationCount * 1.0 / (totalCategories * (totalCategories - 1) / 2) as density,
           avgWeight
      WHERE relevance > 0.1
      
      RETURN c.id as conceptId,
             c.name as name,
             relevance,
             density,
             relevance * 0.6 + density * 0.4 as structuralScore
      ORDER BY structuralScore DESC
      LIMIT $limit
    `;
    
    const results = await this.neo4jService.run(cypher, {
      pattern: `(?i).*${query.normalized}.*`,
      limit: options.limit || 30
    });
    
    return {
      hits: results.records.map(record => ({
        id: record.get('conceptId'),
        score: record.get('structuralScore'),
        source: {
          name: record.get('name'),
          relevance: record.get('relevance'),
          density: record.get('density')
        },
        type: 'graph-structure'
      })),
      timing: Date.now() - startTime
    };
  }
  
  private async mergeAndRank(
    textResults: TextSearchResults,
    vectorResults: VectorSearchResults,
    graphResults: GraphSearchResults,
    query: ProcessedQuery
  ): Promise<RankedResult[]> {
    // Объединение всех результатов с нормализацией скоров
    const allResults = new Map<string, MergedResult>();
    
    // Обработка текстовых результатов
    textResults.hits.forEach(hit => {
      allResults.set(hit.id, {
        id: hit.id,
        sources: {
          text: { score: this.normalizeScore(hit.score, 'text'), data: hit }
        },
        combinedScore: 0
      });
    });
    
    // Добавление векторных результатов
    [...vectorResults.conceptHits, ...vectorResults.categoryHits].forEach(hit => {
      const existing = allResults.get(hit.id) || { id: hit.id, sources: {} };
      existing.sources.vector = {
        score: this.normalizeScore(hit.score, 'vector'),
        data: hit
      };
      allResults.set(hit.id, existing);
    });
    
    // Добавление графовых результатов
    graphResults.hits.forEach(hit => {
      const existing = allResults.get(hit.id) || { id: hit.id, sources: {} };
      existing.sources.graph = {
        score: this.normalizeScore(hit.score, 'graph'),
        data: hit
      };
      allResults.set(hit.id, existing);
    });
    
    // Расчет комбинированного скора с учетом весов
    const weights = this.calculateSourceWeights(query);
    
    allResults.forEach(result => {
      result.combinedScore = 
        (result.sources.text?.score || 0) * weights.text +
        (result.sources.vector?.score || 0) * weights.vector +
        (result.sources.graph?.score || 0) * weights.graph;
      
      // Бонусы за присутствие в нескольких источниках
      const sourceCount = Object.keys(result.sources).length;
      if (sourceCount > 1) {
        result.combinedScore *= (1 + 0.1 * (sourceCount - 1));
      }
    });
    
    // Сортировка по комбинированному скору
    return Array.from(allResults.values())
      .sort((a, b) => b.combinedScore - a.combinedScore);
  }
}
```

Это завершает комплексную документацию архитектуры философского сервиса с примерами реализации всех ключевых компонентов. Система спроектирована для высокой производительности, масштабируемости и отличного пользовательского опыта.