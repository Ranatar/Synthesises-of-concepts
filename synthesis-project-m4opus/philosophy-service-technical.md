# Техническая спецификация философского сервиса

## 1. Структуры данных

### 1.1 Основные модели

```typescript
// Категория
interface Category {
  id: string;
  name: string;
  description?: string;
  tradition?: string; // философская традиция
  synonyms?: string[];
  weight?: number; // 1-5, опционально
}

// Тип связи
interface RelationType {
  id: string;
  name: string;
  directed: boolean;
  description?: string;
  examples?: string[];
}

// Связь
interface Relation {
  id: string;
  from: string; // ID категории
  to: string; // ID категории
  type: string; // ID типа связи
  weight?: number; // сила связи, опционально
  rationale?: string; // обоснование связи
}

// Тезис
interface Thesis {
  id: string;
  text: string;
  conceptId: string;
  relatedCategories: string[];
  strength: 'high' | 'medium' | 'low';
  order?: number;
}

// Концепция
interface Concept {
  id: string;
  name: string;
  description?: string;
  categories: Category[];
  relations: Relation[];
  theses: Thesis[];
  metadata: {
    created: Date;
    modified: Date;
    author?: string;
    tradition?: string;
    tags?: string[];
    parentConcepts?: string[];
  };
}
```

### 1.2 Запросы и ответы API

```typescript
// Запрос на генерацию тезисов
interface GenerateThesesRequest {
  concept: Concept;
  options: {
    count?: number;
    style?: 'academic' | 'accessible' | 'poetic';
    focus?: string[]; // ID категорий для фокуса
    useWeights: boolean;
  };
}

// Запрос на синтез
interface SynthesisRequest {
  concepts: Concept[];
  mode: 'dialectical' | 'integrative' | 'creative';
  priorities?: {
    conceptId: string;
    weight: number;
  }[];
  constraints?: {
    preserveCategories?: string[];
    excludeCategories?: string[];
    targetComplexity?: 'simple' | 'moderate' | 'complex';
  };
}

// Ответ с новыми элементами
interface NewElementsResponse {
  newCategories: Array<{
    suggested: Category;
    similar: Category[];
    confidence: number;
  }>;
  newRelationTypes: Array<{
    suggested: RelationType;
    similar: RelationType[];
    confidence: number;
  }>;
  requiresUserConfirmation: boolean;
}
```

## 2. API эндпоинты

### 2.1 Основные операции

```javascript
// Генерация структуры по названию
POST /api/concepts/generate-from-name
{
  "name": "Цифровой солипсизм",
  "options": {
    "complexity": "moderate",
    "includeWeights": false
  }
}

// Генерация тезисов
POST /api/concepts/{id}/generate-theses
{
  "options": {
    "count": 7,
    "useWeights": true
  }
}

// Реконструкция из тезисов
POST /api/concepts/reconstruct
{
  "theses": ["тезис1", "тезис2", ...],
  "hints": {
    "possibleName": "...",
    "tradition": "continental"
  }
}

// Синтез концепций
POST /api/synthesis
{
  "conceptIds": ["id1", "id2"],
  "mode": "dialectical",
  "options": {...}
}

// Поиск родительских концепций
POST /api/concepts/find-parents
{
  "theses": [...],
  "categories": [...],
  "limit": 5
}
```

### 2.2 Вспомогательные операции

```javascript
// Валидация графа
POST /api/concepts/validate
{
  "concept": {...},
  "checks": ["consistency", "completeness", "contradictions"]
}

// Предложение элементов
POST /api/concepts/{id}/suggest-elements
{
  "currentState": {...},
  "targetCount": 5
}

// Поиск похожих элементов
POST /api/elements/find-similar
{
  "element": {...},
  "threshold": 0.8
}
```

## 3. Алгоритмы обработки

### 3.1 Алгоритм оптимизации промптов

```javascript
class PromptOptimizer {
  // Сжатие графа для больших концепций
  compressGraph(concept, maxTokens = 2000) {
    // 1. Подсчет важности узлов (PageRank-подобный)
    const importance = this.calculateImportance(concept);
    
    // 2. Сортировка по важности
    const sorted = this.sortByImportance(concept, importance);
    
    // 3. Итеративное добавление пока не превысим лимит
    const compressed = this.buildCompressed(sorted, maxTokens);
    
    return compressed;
  }
  
  // Расчет структурной важности
  calculateImportance(concept) {
    const importance = {};
    const { categories, relations } = concept;
    
    // Инициализация
    categories.forEach(cat => {
      importance[cat.id] = 1.0;
    });
    
    // Итеративный расчет (упрощенный PageRank)
    for (let i = 0; i < 10; i++) {
      const newImportance = {};
      
      categories.forEach(cat => {
        let score = 0.15; // damping factor
        
        // Входящие связи
        const incoming = relations.filter(r => r.to === cat.id);
        incoming.forEach(rel => {
          score += 0.85 * importance[rel.from] / 
                   this.outDegree(rel.from, relations);
        });
        
        // Учет весов если есть
        if (cat.weight) {
          score *= (cat.weight / 3); // нормализация
        }
        
        newImportance[cat.id] = score;
      });
      
      Object.assign(importance, newImportance);
    }
    
    return importance;
  }
}
```

### 3.2 Обработка результатов от Claude

```javascript
class ResponseProcessor {
  // Извлечение структурированных данных
  async processClaudeResponse(response, expectedFormat) {
    try {
      // 1. Попытка прямого парсинга JSON
      const parsed = this.tryParseJSON(response);
      if (parsed) return this.validateFormat(parsed, expectedFormat);
      
      // 2. Извлечение JSON из текста
      const extracted = this.extractJSON(response);
      if (extracted) return this.validateFormat(extracted, expectedFormat);
      
      // 3. Fallback на NLP парсинг
      return this.nlpParse(response, expectedFormat);
      
    } catch (error) {
      // 4. Запрос уточнения
      return this.requestClarification(response, expectedFormat);
    }
  }
  
  // Валидация формата
  validateFormat(data, schema) {
    // Использование JSON Schema или Joi для валидации
    const validation = schema.validate(data);
    
    if (validation.error) {
      // Попытка автокоррекции
      return this.autoCorrect(data, validation.error);
    }
    
    return validation.value;
  }
  
  // Обработка новых элементов
  async processNewElements(elements, existingDb) {
    const results = {
      confirmed: [],
      needsReview: [],
      rejected: []
    };
    
    for (const element of elements) {
      // 1. Проверка на дубликаты
      const similar = await this.findSimilar(element, existingDb);
      
      if (similar.length > 0 && similar[0].score > 0.95) {
        results.rejected.push({
          element,
          reason: 'duplicate',
          existing: similar[0].item
        });
        continue;
      }
      
      // 2. Проверка качества
      const quality = await this.assessQuality(element);
      
      if (quality.score < 0.7) {
        results.needsReview.push({
          element,
          issues: quality.issues,
          suggestions: quality.suggestions
        });
        continue;
      }
      
      // 3. Автоматическое принятие
      results.confirmed.push(element);
    }
    
    return results;
  }
}
```

### 3.3 Интеллектуальное кэширование

```javascript
class SmartCache {
  constructor() {
    this.cache = new Map();
    this.patterns = new Map();
  }
  
  // Кэширование с учетом семантического сходства
  async get(request) {
    // 1. Точное совпадение
    const exact = this.cache.get(this.hash(request));
    if (exact) return exact;
    
    // 2. Семантически похожие запросы
    const similar = await this.findSimilarRequests(request);
    if (similar.length > 0 && similar[0].score > 0.9) {
      // Адаптация ответа
      return this.adaptResponse(similar[0].response, request);
    }
    
    // 3. Использование паттернов
    const pattern = this.matchPattern(request);
    if (pattern) {
      return this.generateFromPattern(pattern, request);
    }
    
    return null;
  }
  
  // Обучение на успешных генерациях
  learn(request, response, feedback) {
    // 1. Сохранение в кэш
    this.cache.set(this.hash(request), response);
    
    // 2. Извлечение паттернов
    if (feedback.quality > 0.8) {
      const pattern = this.extractPattern(request, response);
      this.patterns.set(pattern.id, pattern);
    }
    
    // 3. Обновление векторной базы для поиска
    this.updateVectorIndex(request, response);
  }
}
```

## 4. Интеграция с Claude API

### 4.1 Управление промптами

```javascript
class PromptManager {
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }
  
  // Динамическое построение промпта
  buildPrompt(operation, context) {
    const template = this.templates.get(operation);
    
    // 1. Базовый промпт
    let prompt = template.base;
    
    // 2. Добавление контекста
    if (context.useWeights) {
      prompt += template.weights;
    }
    
    if (context.tradition) {
      prompt += template.tradition.replace('{tradition}', context.tradition);
    }
    
    // 3. Оптимизация под размер контекстного окна
    const optimized = this.optimizeForContext(prompt, context.data);
    
    // 4. Добавление примеров если есть место
    if (this.hasSpace(optimized)) {
      optimized.examples = this.selectRelevantExamples(operation, context);
    }
    
    return optimized;
  }
  
  // Адаптивный retry с изменением промпта
  async executeWithRetry(prompt, maxRetries = 3) {
    let lastError = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.callClaude(prompt);
        return response;
        
      } catch (error) {
        lastError = error;
        
        // Адаптация промпта на основе ошибки
        if (error.type === 'format_error') {
          prompt = this.clarifyFormat(prompt);
        } else if (error.type === 'ambiguity') {
          prompt = this.addConstraints(prompt);
        } else if (error.type === 'token_limit') {
          prompt = this.compress(prompt);
        }
      }
    }
    
    throw lastError;
  }
}
```

### 4.2 Обработка потоковых ответов

```javascript
class StreamProcessor {
  // Обработка частичных результатов
  async processStream(stream, onPartial) {
    const buffer = [];
    let partialJSON = '';
    
    for await (const chunk of stream) {
      buffer.push(chunk);
      partialJSON += chunk;
      
      // Попытка извлечь завершенные элементы
      const completed = this.extractCompleted(partialJSON);
      
      if (completed.items.length > 0) {
        // Отправка промежуточных результатов
        await onPartial(completed.items);
        
        // Очистка обработанной части
        partialJSON = completed.remaining;
      }
    }
    
    // Финальная обработка
    return this.finalizeResponse(buffer.join(''));
  }
}
```

## 5. Оптимизация производительности

### 5.1 Параллельная обработка

```javascript
class ParallelProcessor {
  // Разбиение больших задач
  async processSynthesis(concepts, mode) {
    if (concepts.length <= 2) {
      // Прямой синтез
      return this.directSynthesis(concepts, mode);
    }
    
    // Параллельный попарный синтез
    const pairs = this.createPairs(concepts);
    const partialResults = await Promise.all(
      pairs.map(pair => this.synthesizePair(pair, mode))
    );
    
    // Рекурсивный синтез результатов
    return this.processSynthesis(partialResults, mode);
  }
  
  // Оптимизация для батч-операций
  async batchProcess(operations) {
    // Группировка по типу
    const grouped = this.groupByType(operations);
    
    // Параллельная обработка групп
    const results = await Promise.all(
      Object.entries(grouped).map(([type, ops]) => 
        this.processGroup(type, ops)
      )
    );
    
    // Сборка результатов
    return this.assembleResults(results);
  }
}
```

### 5.2 Предиктивная загрузка

```javascript
class PredictiveLoader {
  // Предсказание следующих действий
  predictNextAction(userHistory, currentState) {
    const patterns = this.analyzePatterns(userHistory);
    
    const predictions = [
      { action: 'generateTheses', probability: 0.0 },
      { action: 'addElements', probability: 0.0 },
      { action: 'synthesis', probability: 0.0 }
    ];
    
    // Анализ текущего состояния
    if (currentState.hasGraph && !currentState.hasTheses) {
      predictions[0].probability = 0.8;
    }
    
    // Анализ паттернов пользователя
    patterns.forEach(pattern => {
      predictions.forEach(pred => {
        if (pattern.nextAction === pred.action) {
          pred.probability += pattern.weight;
        }
      });
    });
    
    return predictions.filter(p => p.probability > 0.3);
  }
  
  // Предзагрузка вероятных операций
  async preload(predictions) {
    for (const pred of predictions) {
      if (pred.probability > 0.6) {
        // Подготовка промптов
        this.preparePrompt(pred.action);
        
        // Прогрев кэша
        this.warmCache(pred.action);
      }
    }
  }
}
```

## 6. Мониторинг и аналитика

### 6.1 Метрики качества

```javascript
class QualityMetrics {
  // Оценка философской согласованности
  async evaluateConsistency(concept) {
    const metrics = {
      logicalCoherence: 0,
      conceptualClarity: 0,
      structuralIntegrity: 0,
      philosophicalDepth: 0
    };
    
    // Проверка через Claude
    const evaluation = await this.requestEvaluation(concept);
    
    // Количественные метрики
    metrics.structuralIntegrity = this.calculateStructuralScore(concept);
    
    // Комбинированная оценка
    return this.combineMetrics(metrics, evaluation);
  }
  
  // Отслеживание улучшений
  trackImprovements(original, modified) {
    return {
      addedValue: this.calculateAddedValue(original, modified),
      preservedCore: this.calculatePreservation(original, modified),
      innovationScore: this.calculateInnovation(modified),
      userSatisfaction: null // заполняется из фидбека
    };
  }
}
```

Этот технический документ дополняет основную схему конкретными примерами реализации, структурами данных и алгоритмами, необходимыми для создания робастного философского сервиса.