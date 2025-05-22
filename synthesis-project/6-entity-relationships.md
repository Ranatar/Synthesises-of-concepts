# Система связей между сущностями для JSON-хранилища философских концепций

## Введение

Проектирование эффективной системы связей между сущностями является ключевым аспектом разработки хранилища данных. В данном документе представлена детальная спецификация системы связей для JSON-хранилища философских концепций, включая механизмы поддержания целостности, оптимизации доступа и обработки каскадных изменений.

## Общая структура связей

В нашей системе присутствуют следующие основные типы связей:

| Тип связи | Описание | Пример |
|-----------|----------|--------|
| One-to-One | Связь "один к одному" | Синтез и результирующая концепция |
| One-to-Many | Связь "один ко многим" | Пользователь и его концепции |
| Many-to-Many | Связь "многие ко многим" | Концепции и тезисы |
| Self-Referential | Самостоятельная связь | Связь между концепциями |

## Детальное описание связей между сущностями

### 1. Концепции и тезисы (Many-to-Many)

#### Принцип организации связи:
Связь между концепциями и тезисами организована как отношение "многие ко многим" - одна концепция может быть связана с несколькими тезисами, и один тезис может быть связан с несколькими концепциями.

#### Структура связи:
```javascript
// В концепции
{
  "id": "concept-1",
  "name": "Категорический императив",
  // ...другие поля
  "relatedThesesIds": ["thesis-1", "thesis-2", "thesis-3"]
}

// В тезисе
{
  "id": "thesis-1",
  "content": "Категорический императив предписывает...",
  // ...другие поля
  "relatedConceptIds": ["concept-1", "concept-2"]
}
```

#### Механизм поддержания целостности:
1. При создании связи между концепцией и тезисом:
   - Добавить ID тезиса в массив `relatedThesesIds` концепции
   - Добавить ID концепции в массив `relatedConceptIds` тезиса
   - Обновить поле `updated` в обеих сущностях

2. При удалении связи:
   - Удалить ID тезиса из массива `relatedThesesIds` концепции
   - Удалить ID концепции из массива `relatedConceptIds` тезиса
   - Обновить поле `updated` в обеих сущностях

3. При удалении сущности:
   - При удалении концепции: для каждого связанного тезиса удалить ID концепции из массива `relatedConceptIds`
   - При удалении тезиса: для каждой связанной концепции удалить ID тезиса из массива `relatedThesesIds`

#### Методы эффективного доступа:
1. Создание индекса `theses-by-concept-id`:
   ```javascript
   {
     "concept-1": ["thesis-1", "thesis-2", "thesis-3"],
     "concept-2": ["thesis-1", "thesis-4"]
   }
   ```

2. Создание индекса `concepts-by-thesis-id`:
   ```javascript
   {
     "thesis-1": ["concept-1", "concept-2"],
     "thesis-2": ["concept-1"]
   }
   ```

#### Пример операции связывания:
```javascript
function linkConceptToThesis(conceptId, thesisId) {
  // Получение сущностей
  const concept = store.concepts.byId[conceptId];
  const thesis = store.theses.byId[thesisId];
  
  if (!concept || !thesis) {
    throw new Error("Концепция или тезис не найдены");
  }
  
  // Проверка на существование связи
  if (!concept.relatedThesesIds.includes(thesisId)) {
    concept.relatedThesesIds.push(thesisId);
    concept.updated = new Date().toISOString();
  }
  
  if (!thesis.relatedConceptIds.includes(conceptId)) {
    thesis.relatedConceptIds.push(conceptId);
    thesis.updated = new Date().toISOString();
  }
  
  // Обновление индексов
  if (!store.indexes.thesesByConceptId[conceptId]) {
    store.indexes.thesesByConceptId[conceptId] = [];
  }
  if (!store.indexes.thesesByConceptId[conceptId].includes(thesisId)) {
    store.indexes.thesesByConceptId[conceptId].push(thesisId);
  }
  
  if (!store.indexes.conceptsByThesisId[thesisId]) {
    store.indexes.conceptsByThesisId[thesisId] = [];
  }
  if (!store.indexes.conceptsByThesisId[thesisId].includes(conceptId)) {
    store.indexes.conceptsByThesisId[thesisId].push(conceptId);
  }
  
  saveStore(store);
}
```

### 2. Графы, категории и связи (One-to-Many + Nested)

#### Принцип организации связи:
Графы содержат категории (узлы) и связи (рёбра) как вложенные объекты. Это отношение "один ко многим" с вложенностью данных.

#### Структура связи:
```javascript
{
  "id": "graph-1",
  "name": "Основные этические теории",
  // ...другие поля
  "categories": {
    "category-1": {
      "id": "category-1",
      "name": "Деонтология",
      // ...другие поля категории
      "associatedConceptIds": ["concept-1", "concept-2"]
    },
    "category-2": {
      // ...другая категория
    }
  },
  "relationships": {
    "relationship-1": {
      "id": "relationship-1",
      "sourceId": "category-1",
      "targetId": "category-2",
      // ...другие поля связи
    }
  }
}
```

#### Механизм поддержания целостности:
1. При создании категории в графе:
   - Добавить категорию в объект `categories` графа
   - Обновить поле `updated` графа

2. При создании связи в графе:
   - Проверить существование исходной и целевой категорий
   - Добавить связь в объект `relationships` графа
   - Обновить поле `updated` графа

3. При удалении категории:
   - Удалить все связи, где категория является исходной или целевой
   - Удалить категорию из объекта `categories` графа
   - Обновить поле `updated` графа

4. При обновлении ID категории:
   - Обновить все ссылки на категорию в связях
   - Обновить поле `updated` графа

#### Методы эффективного доступа:
1. Для быстрого доступа к категориям используется хранение по ключу (ID категории)
2. Для быстрого определения связей категории:
   ```javascript
   function getCategoryRelationships(graphId, categoryId) {
     const graph = store.graphs.byId[graphId];
     if (!graph) return [];
     
     return Object.values(graph.relationships).filter(rel => 
       rel.sourceId === categoryId || rel.targetId === categoryId
     );
   }
   ```

3. Кэширование связей категорий в дополнительной структуре:
   ```javascript
   "categoryRelationships": {
     "category-1": ["relationship-1", "relationship-2"],
     "category-2": ["relationship-1", "relationship-3"]
   }
   ```

#### Пример операции каскадного удаления:
```javascript
function deleteCategory(graphId, categoryId) {
  const graph = store.graphs.byId[graphId];
  if (!graph || !graph.categories[categoryId]) {
    throw new Error("Граф или категория не найдены");
  }
  
  // Удаление связей, связанных с категорией
  for (const relId in graph.relationships) {
    const relationship = graph.relationships[relId];
    if (relationship.sourceId === categoryId || relationship.targetId === categoryId) {
      delete graph.relationships[relId];
    }
  }
  
  // Удаление категории
  delete graph.categories[categoryId];
  
  // Обновление метаданных
  graph.updated = new Date().toISOString();
  
  saveStore(store);
}
```

### 3. Категории и концепции (Many-to-Many)

#### Принцип организации связи:
Категории в графах могут быть связаны с концепциями как отношение "многие ко многим".

#### Структура связи:
```javascript
// В категории (внутри графа)
{
  "id": "category-1",
  "name": "Деонтология",
  // ...другие поля
  "associatedConceptIds": ["concept-1", "concept-2"]
}

// В концепции
{
  "id": "concept-1",
  "name": "Категорический императив",
  // ...другие поля
  // Необязательное поле для оптимизации запросов
  "associatedCategoryIds": [
    {
      "graphId": "graph-1",
      "categoryId": "category-1"
    }
  ]
}
```

#### Механизм поддержания целостности:
1. При связывании категории с концепцией:
   - Добавить ID концепции в массив `associatedConceptIds` категории
   - Опционально: добавить информацию о категории в массив `associatedCategoryIds` концепции
   - Обновить поле `updated` в обеих сущностях

2. При удалении связи:
   - Удалить ID концепции из массива `associatedConceptIds` категории
   - Опционально: удалить информацию о категории из массива `associatedCategoryIds` концепции
   - Обновить поле `updated` в обеих сущностях

3. При удалении концепции:
   - Для каждой связанной категории удалить ID концепции из массива `associatedConceptIds`

4. При удалении категории или графа:
   - Опционально: для каждой связанной концепции удалить информацию о категории из массива `associatedCategoryIds`

#### Методы эффективного доступа:
1. Создание индекса `concepts-by-category`:
   ```javascript
   {
     "graph-1": {
       "category-1": ["concept-1", "concept-2"],
       "category-2": ["concept-3"]
     }
   }
   ```

2. Создание индекса `categories-by-concept`:
   ```javascript
   {
     "concept-1": [
       {
         "graphId": "graph-1",
         "categoryId": "category-1"
       }
     ]
   }
   ```

### 4. Пользователи и созданные ими сущности (One-to-Many)

#### Принцип организации связи:
Пользователи имеют отношение "один ко многим" с концепциями, графами и тезисами.

#### Структура связи:
```javascript
// В пользователе
{
  "id": "user-1",
  "name": "Иван Петров",
  // ...другие поля
  "conceptIds": ["concept-1", "concept-2"],
  "graphIds": ["graph-1"],
  "thesisIds": ["thesis-1", "thesis-2", "thesis-3"]
}

// В созданных сущностях
{
  "id": "concept-1",
  "name": "Категорический императив",
  // ...другие поля
  "author": "user-1"
}
```

#### Механизм поддержания целостности:
1. При создании сущности:
   - Установить `author` сущности в ID пользователя
   - Добавить ID сущности в соответствующий массив пользователя
   - Обновить поле `updated` пользователя

2. При удалении сущности:
   - Удалить ID сущности из соответствующего массива пользователя
   - Обновить поле `updated` пользователя

3. При удалении пользователя (две стратегии):
   - Каскадное удаление: удалить все сущности, созданные пользователем
   - Сохранение с анонимизацией: установить `author` сущностей в null или специальный ID "anonymous"

#### Методы эффективного доступа:
1. Создание индексов по автору для каждого типа сущности:
   ```javascript
   "conceptsByAuthor": {
     "user-1": ["concept-1", "concept-2"],
     "user-2": ["concept-3"]
   }
   ```

2. Использование индексов для пагинации и сортировки:
   ```javascript
   function getUserConceptsPaginated(userId, page, limit, sortField, sortOrder) {
     const conceptIds = store.indexes.conceptsByAuthor[userId] || [];
     const startIndex = (page - 1) * limit;
     const endIndex = startIndex + limit;
     
     // Получение концепций
     const concepts = conceptIds
       .map(id => store.concepts.byId[id])
       .filter(Boolean);
     
     // Сортировка
     concepts.sort((a, b) => {
       const aValue = a[sortField];
       const bValue = b[sortField];
       
       if (sortOrder === 'asc') {
         return aValue < bValue ? -1 : 1;
       } else {
         return aValue > bValue ? -1 : 1;
       }
     });
     
     // Пагинация
     return {
       concepts: concepts.slice(startIndex, endIndex),
       total: concepts.length,
       page,
       totalPages: Math.ceil(concepts.length / limit)
     };
   }
   ```

### 5. Концепции и их взаимосвязи (Self-Referential Many-to-Many)

#### Принцип организации связи:
Концепции могут быть связаны с другими концепциями как отношение "многие ко многим" с самой собой.

#### Структура связи:
```javascript
{
  "id": "concept-1",
  "name": "Категорический императив",
  // ...другие поля
  "relatedConceptIds": ["concept-2", "concept-3"]
}
```

#### Механизм поддержания целостности:
1. При создании связи между концепциями:
   - Добавить ID второй концепции в массив `relatedConceptIds` первой концепции
   - Добавить ID первой концепции в массив `relatedConceptIds` второй концепции
   - Обновить поле `updated` в обеих концепциях

2. При удалении связи:
   - Удалить ID второй концепции из массива `relatedConceptIds` первой концепции
   - Удалить ID первой концепции из массива `relatedConceptIds` второй концепции
   - Обновить поле `updated` в обеих концепциях

3. При удалении концепции:
   - Для каждой связанной концепции удалить ID удаляемой концепции из массива `relatedConceptIds`

#### Дополнительная информация о типе связи (опционально):
Для более детального определения отношений между концепциями можно использовать расширенную структуру:

```javascript
{
  "id": "concept-1",
  "name": "Категорический императив",
  // ...другие поля
  "conceptRelationships": [
    {
      "conceptId": "concept-2",
      "type": "opposes", // тип связи: "opposes", "derives_from", "extends", "criticizes"
      "strength": 0.8 // сила связи от 0 до 1
    },
    {
      "conceptId": "concept-3",
      "type": "extends",
      "strength": 0.6
    }
  ]
}
```

### 6. Взаимодействия с Claude и связанные сущности (One-to-Many)

#### Принцип организации связи:
Запросы к Claude API могут приводить к созданию различных сущностей (концепций, тезисов).

#### Структура связи:
```javascript
// В запросе к Claude
{
  "id": "claudeQuery-1",
  "prompt": "Объясните основные принципы категорического императива",
  // ...другие поля
  "linkedEntities": {
    "conceptIds": ["concept-4"],
    "thesisIds": ["thesis-1", "thesis-2"]
  }
}

// В созданных сущностях
{
  "id": "thesis-1",
  "content": "Категорический императив предписывает...",
  // ...другие поля
  "generationMetadata": {
    "source": "claude",
    "claudeQueryId": "claudeQuery-1",
    "timestamp": "2025-04-15T14:25:00Z"
  }
}
```

#### Механизм поддержания целостности:
1. При создании сущности на основе ответа Claude:
   - Установить `generationMetadata.source` в "claude"
   - Установить `generationMetadata.claudeQueryId` в ID запроса
   - Добавить ID сущности в соответствующий массив в `linkedEntities` запроса
   - Обновить поле `updated` запроса

2. При удалении сущности:
   - Удалить ID сущности из соответствующего массива в `linkedEntities` запроса
   - Обновить поле `updated` запроса

3. При удалении запроса к Claude (две стратегии):
   - Сохранение связанных сущностей: установить `generationMetadata.claudeQueryId` в null
   - Каскадное удаление: удалить все сущности, созданные на основе запроса

#### Методы эффективного доступа:
1. Создание индексов сущностей по запросу:
   ```javascript
   "entitiesByClaudeQuery": {
     "claudeQuery-1": {
       "concepts": ["concept-4"],
       "theses": ["thesis-1", "thesis-2"]
     }
   }
   ```

### 7. Синтез и связанные концепции (One-to-Many + One-to-One)

#### Принцип организации связи:
Синтез имеет связь "один ко многим" с исходными концепциями и связь "один к одному" с результирующей концепцией.

#### Структура связи:
```javascript
// В синтезе
{
  "id": "synthesis-1",
  "name": "Синтез деонтологии и утилитаризма",
  // ...другие поля
  "sourceConceptIds": ["concept-1", "concept-2"],
  "resultConceptId": "concept-5"
}

// В результирующей концепции
{
  "id": "concept-5",
  "name": "Интегрированная этическая теория",
  // ...другие поля
  "sourceType": "synthesis",
  "synthesisId": "synthesis-1"
}

// В исходных концепциях (опционально)
{
  "id": "concept-1",
  "name": "Категорический императив",
  // ...другие поля
  // Необязательное поле для оптимизации запросов
  "involvedInSynthesisIds": ["synthesis-1"]
}
```

#### Механизм поддержания целостности:
1. При создании синтеза:
   - Добавить ID исходных концепций в массив `sourceConceptIds`
   - Опционально: добавить ID синтеза в массив `involvedInSynthesisIds` каждой исходной концепции

2. При создании результирующей концепции:
   - Установить `sourceType` концепции в "synthesis"
   - Установить `synthesisId` концепции в ID синтеза
   - Установить `resultConceptId` синтеза в ID результирующей концепции

3. При удалении синтеза:
   - Для результирующей концепции: установить `synthesisId` в null и `sourceType` в "user"
   - Опционально: для каждой исходной концепции удалить ID синтеза из массива `involvedInSynthesisIds`

4. При удалении исходной концепции:
   - Удалить ID концепции из массива `sourceConceptIds` синтеза
   - Обновить поле `updated` синтеза

5. При удалении результирующей концепции:
   - Установить `resultConceptId` синтеза в null
   - Обновить поле `updated` синтеза

## Общие методы поддержания целостности данных

### 1. Атомарные операции

Для обеспечения целостности данных при выполнении операций, затрагивающих несколько сущностей, необходимо реализовать атомарные транзакции:

```javascript
function performTransaction(operations) {
  // Создаем копию хранилища
  const storeCopy = deepCopy(store);
  
  try {
    // Выполняем все операции
    for (const operation of operations) {
      operation(storeCopy);
    }
    
    // Если все операции выполнены успешно, заменяем хранилище
    store = storeCopy;
    saveStore(store);
    return true;
  } catch (error) {
    // Если произошла ошибка, отменяем транзакцию
    console.error('Transaction failed:', error);
    return false;
  }
}
```

Пример использования:

```javascript
performTransaction([
  (store) => {
    // Создание тезиса
    const thesis = createThesis(store, thesisData);
    // Связывание тезиса с концепцией
    linkThesisToConcept(store, thesis.id, conceptId);
  }
]);
```

### 2. Проверка и восстановление целостности

Для обнаружения и устранения нарушений целостности данных необходимо реализовать функции проверки и восстановления:

```javascript
function checkDataIntegrity() {
  const issues = [];
  
  // Проверка целостности связей между концепциями и тезисами
  for (const conceptId in store.concepts.byId) {
    const concept = store.concepts.byId[conceptId];
    
    for (const thesisId of concept.relatedThesesIds) {
      const thesis = store.theses.byId[thesisId];
      
      if (!thesis) {
        issues.push({
          type: 'missing_thesis',
          conceptId,
          thesisId
        });
      } else if (!thesis.relatedConceptIds.includes(conceptId)) {
        issues.push({
          type: 'inconsistent_relation',
          conceptId,
          thesisId,
          description: 'Тезис не содержит ссылку на концепцию'
        });
      }
    }
  }
  
  // Проверка целостности графов и категорий
  for (const graphId in store.graphs.byId) {
    const graph = store.graphs.byId[graphId];
    
    for (const relationshipId in graph.relationships) {
      const relationship = graph.relationships[relationshipId];
      
      if (!graph.categories[relationship.sourceId]) {
        issues.push({
          type: 'missing_category',
          graphId,
          relationshipId,
          categoryId: relationship.sourceId,
          role: 'source'
        });
      }
      
      if (!graph.categories[relationship.targetId]) {
        issues.push({
          type: 'missing_category',
          graphId,
          relationshipId,
          categoryId: relationship.targetId,
          role: 'target'
        });
      }
    }
    
    // ...другие проверки
  }
  
  return issues;
}

function fixIntegrityIssues(issues) {
  let fixed = 0;
  
  for (const issue of issues) {
    switch (issue.type) {
      case 'missing_thesis':
        // Удаление ссылки на несуществующий тезис
        const concept = store.concepts.byId[issue.conceptId];
        concept.relatedThesesIds = concept.relatedThesesIds.filter(id => id !== issue.thesisId);
        concept.updated = new Date().toISOString();
        fixed++;
        break;
        
      case 'inconsistent_relation':
        // Добавление обратной ссылки
        const thesis = store.theses.byId[issue.thesisId];
        if (!thesis.relatedConceptIds.includes(issue.conceptId)) {
          thesis.relatedConceptIds.push(issue.conceptId);
          thesis.updated = new Date().toISOString();
          fixed++;
        }
        break;
        
      case 'missing_category':
        // Удаление связи с несуществующей категорией
        const graph = store.graphs.byId[issue.graphId];
        delete graph.relationships[issue.relationshipId];
        graph.updated = new Date().toISOString();
        fixed++;
        break;
        
      // ...обработка других типов проблем
    }
  }
  
  saveStore(store);
  return fixed;
}
```

## Оптимизация доступа к связанным данным

### 1. Кэширование денормализованных данных

Для оптимизации доступа к часто запрашиваемым связанным данным можно использовать частичную денормализацию:

```javascript
// В концепции
{
  "id": "concept-1",
  "name": "Категорический императив",
  // ...основные поля
  
  // Кэшированная информация о связанных тезисах
  "relatedThesesCache": [
    {
      "id": "thesis-1",
      "content": "Категорический императив предписывает...",
      "type": "principle"
    }
  ],
  
  // Кэшированная информация о категориях в графах
  "categoriesCache": [
    {
      "graphId": "graph-1",
      "graphName": "Основные этические теории",
      "categoryId": "category-1",
      "categoryName": "Деонтология"
    }
  ]
}
```

Эти кэши необходимо обновлять при изменении соответствующих сущностей.

### 2. Индексы для часто запрашиваемых выборок

Помимо основных индексов по ID, полезно создать индексы для часто запрашиваемых выборок:

```javascript
// Индекс концепций по тегам
"conceptsByTag": {
  "ethics": ["concept-1", "concept-3", "concept-5"],
  "Kant": ["concept-1", "concept-2"],
  "utilitarianism": ["concept-3", "concept-4"]
}

// Индекс тезисов по типу
"thesesByType": {
  "principle": ["thesis-1", "thesis-5"],
  "argument": ["thesis-2", "thesis-3"],
  "definition": ["thesis-4"]
}

// Комбинированный индекс концепций по традиции и эпохе
"conceptsByTraditionAndEra": {
  "German idealism": {
    "18th century": ["concept-1", "concept-2"]
  },
  "British empiricism": {
    "19th century": ["concept-3", "concept-4"]
  }
}
```

### 3. Стратегия ленивой загрузки связанных данных

Для оптимизации производительности при работе с большими объемами данных рекомендуется использовать ленивую загрузку:

```javascript
function getConceptWithRelated(conceptId, includeTheses = false, includeRelatedConcepts = false) {
  const concept = { ...store.concepts.byId[conceptId] };
  
  if (includeTheses) {
    concept.theses = concept.relatedThesesIds.map(id => store.theses.byId[id]).filter(Boolean);
  } else {
    delete concept.relatedThesesIds;
  }
  
  if (includeRelatedConcepts) {
    concept.relatedConcepts = concept.relatedConceptIds.map(id => {
      const relatedConcept = store.concepts.byId[id];
      if (relatedConcept) {
        return {
          id: relatedConcept.id,
          name: relatedConcept.name,
          tradition: relatedConcept.tradition
        };
      }
      return null;
    }).filter(Boolean);
  } else {
    delete concept.relatedConceptIds;
  }
  
  return concept;
}
```

## Примеры типичных сценариев работы со связями

### 1. Создание новой концепции и связывание с существующими тезисами

```javascript
function createConceptAndLinkTheses(conceptData, thesisIds) {
  return performTransaction([
    (store) => {
      // Создание концепции
      const newConcept = {
        id: generateUUID(),
        name: conceptData.name,
        description: conceptData.description,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        author: currentUserId,
        version: 1,
        tags: conceptData.tags || [],
        relatedThesesIds: [],
        relatedConceptIds: [],
        synthesisMetadata: conceptData.synthesisMetadata || {},
        sourceType: "user",
        claudeQueryId: null,
        synthesisId: null,
        history: [
          {
            version: 1,
            date: new Date().toISOString(),
            author: currentUserId,
            changes: {
              name: conceptData.name,
              description: conceptData.description
            }
          }
        ]
      };
      
      // Добавление концепции в хранилище
      store.concepts.byId[newConcept.id] = newConcept;
      store.concepts.allIds.push(newConcept.id);
      
      // Связывание с тезисами
      for (const thesisId of thesisIds) {
        const thesis = store.theses.byId[thesisId];
        if (thesis) {
          // Добавление связи в концепцию
          newConcept.relatedThesesIds.push(thesisId);
          
          // Добавление связи в тезис
          thesis.relatedConceptIds.push(newConcept.id);
          thesis.updated = new Date().toISOString();
          
          // Обновление индексов
          if (!store.indexes.thesesByConceptId[newConcept.id]) {
            store.indexes.thesesByConceptId[newConcept.id] = [];
          }
          store.indexes.thesesByConceptId[newConcept.id].push(thesisId);
          
          if (!store.indexes.conceptsByThesisId[thesisId]) {
            store.indexes.conceptsByThesisId[thesisId] = [];
          }
          store.indexes.conceptsByThesisId[thesisId].push(newConcept.id);
        }
      }
      
      // Обновление индекса по тегам
      for (const tag of newConcept.tags) {
        if (!store.indexes.conceptsByTag[tag]) {
          store.indexes.conceptsByTag[tag] = [];
        }
        store.indexes.conceptsByTag[tag].push(newConcept.id);
      }
      
      // Обновление индекса по автору
      if (!store.indexes.conceptsByAuthor[currentUserId]) {
        store.indexes.conceptsByAuthor[currentUserId] = [];
      }
      store.indexes.conceptsByAuthor[currentUserId].push(newConcept.id);
      
      // Добавление ID в список концепций пользователя
      const user = store.users.byId[currentUserId];
      if (user) {
        user.conceptIds.push(newConcept.id);
        user.updated = new Date().toISOString();
      }
      
      return newConcept.id;
    }
  ]);
}
```

### 2. Добавление категории в граф и связывание с концепциями

```javascript
function addCategoryAndLinkConcepts(graphId, categoryData, conceptIds) {
  return performTransaction([
    (store) => {
      const graph = store.graphs.byId[graphId];
      if (!graph) {
        throw new Error(`Граф с ID ${graphId} не найден`);
      }
      
      // Создание категории
      const categoryId = categoryData.id || `cat-${generateUUID()}`;
      const newCategory = {
        id: categoryId,
        name: categoryData.name,
        description: categoryData.description || "",
        position: categoryData.position || { x: 0, y: 0 },
        color: categoryData.color || "#000000",
        size: categoryData.size || 40,
        metadata: categoryData.metadata || {
          centrality: 0.5,
          certainty: 0.5
        },
        associatedConceptIds: []
      };
      
      // Добавление категории в граф
      graph.categories[categoryId] = newCategory;
      graph.updated = new Date().toISOString();
      
      // Связывание с концепциями
      for (const conceptId of conceptIds) {
        const concept = store.concepts.byId[conceptId];
        if (concept) {
          // Добавление связи в категорию
          newCategory.associatedConceptIds.push(conceptId);
          
          // Опциональное добавление обратной связи в концепцию
          if (!concept.associatedCategoryIds) {
            concept.associatedCategoryIds = [];
          }
          
          concept.associatedCategoryIds.push({
            graphId,
            categoryId
          });
          
          concept.updated = new Date().toISOString();
          
          // Обновление индексов
          if (!store.indexes.conceptsByCategory[graphId]) {
            store.indexes.conceptsByCategory[graphId] = {};
          }
          
          if (!store.indexes.conceptsByCategory[graphId][categoryId]) {
            store.indexes.conceptsByCategory[graphId][categoryId] = [];
          }
          
          store.indexes.conceptsByCategory[graphId][categoryId].push(conceptId);
          
          if (!store.indexes.categoriesByConcept[conceptId]) {
            store.indexes.categoriesByConcept[conceptId] = [];
          }
          
          store.indexes.categoriesByConcept[conceptId].push({
            graphId,
            categoryId
          });
        }
      }
      
      return categoryId;
    }
  ]);
}
```

### 3. Удаление концепции с каскадным обновлением связанных сущностей

```javascript
function deleteConcept(conceptId) {
  return performTransaction([
    (store) => {
      const concept = store.concepts.byId[conceptId];
      if (!concept) {
        throw new Error(`Концепция с ID ${conceptId} не найдена`);
      }
      
      // 1. Обработка связанных тезисов
      for (const thesisId of concept.relatedThesesIds) {
        const thesis = store.theses.byId[thesisId];
        if (thesis) {
          // Удаление ID концепции из тезиса
          thesis.relatedConceptIds = thesis.relatedConceptIds.filter(id => id !== conceptId);
          thesis.updated = new Date().toISOString();
          
          // Обновление индекса
          if (store.indexes.conceptsByThesisId[thesisId]) {
            store.indexes.conceptsByThesisId[thesisId] = store.indexes.conceptsByThesisId[thesisId].filter(id => id !== conceptId);
          }
        }
      }
      
      // 2. Обработка связанных концепций
      for (const relatedConceptId of concept.relatedConceptIds) {
        const relatedConcept = store.concepts.byId[relatedConceptId];
        if (relatedConcept) {
          // Удаление ID удаляемой концепции из связанной
          relatedConcept.relatedConceptIds = relatedConcept.relatedConceptIds.filter(id => id !== conceptId);
          relatedConcept.updated = new Date().toISOString();
        }
      }
      
      // 3. Обработка категорий, связанных с концепцией
      if (concept.associatedCategoryIds) {
        for (const categoryRef of concept.associatedCategoryIds) {
          const graph = store.graphs.byId[categoryRef.graphId];
          if (graph && graph.categories[categoryRef.categoryId]) {
            const category = graph.categories[categoryRef.categoryId];
            
            // Удаление ID концепции из категории
            category.associatedConceptIds = category.associatedConceptIds.filter(id => id !== conceptId);
            graph.updated = new Date().toISOString();
            
            // Обновление индекса
            if (store.indexes.conceptsByCategory[categoryRef.graphId] &&
                store.indexes.conceptsByCategory[categoryRef.graphId][categoryRef.categoryId]) {
              store.indexes.conceptsByCategory[categoryRef.graphId][categoryRef.categoryId] = 
                store.indexes.conceptsByCategory[categoryRef.graphId][categoryRef.categoryId].filter(id => id !== conceptId);
            }
          }
        }
      }
      
      // 4. Обработка синтезов, где концепция является исходной
      for (const synthesisId in store.synthesis.byId) {
        const synthesis = store.synthesis.byId[synthesisId];
        
        if (synthesis.sourceConceptIds.includes(conceptId)) {
          // Удаление ID концепции из исходных концепций синтеза
          synthesis.sourceConceptIds = synthesis.sourceConceptIds.filter(id => id !== conceptId);
          synthesis.updated = new Date().toISOString();
        }
      }
      
      // 5. Обработка синтеза, где концепция является результатом
      if (concept.sourceType === "synthesis" && concept.synthesisId) {
        const synthesis = store.synthesis.byId[concept.synthesisId];
        if (synthesis) {
          // Удаление ссылки на результирующую концепцию
          synthesis.resultConceptId = null;
          synthesis.updated = new Date().toISOString();
        }
      }
      
      // 6. Обработка запросов к Claude, связанных с концепцией
      for (const queryId in store.claudeInteractions.byId) {
        const query = store.claudeInteractions.byId[queryId];
        
        if (query.linkedEntities && query.linkedEntities.conceptIds && 
            query.linkedEntities.conceptIds.includes(conceptId)) {
          // Удаление ID концепции из связанных сущностей запроса
          query.linkedEntities.conceptIds = query.linkedEntities.conceptIds.filter(id => id !== conceptId);
          query.updated = new Date().toISOString();
        }
      }
      
      // 7. Обработка пользователя-автора концепции
      const user = store.users.byId[concept.author];
      if (user && user.conceptIds) {
        user.conceptIds = user.conceptIds.filter(id => id !== conceptId);
        user.updated = new Date().toISOString();
      }
      
      // 8. Обновление индексов
      // 8.1. Удаление из индекса по тегам
      for (const tag of concept.tags) {
        if (store.indexes.conceptsByTag[tag]) {
          store.indexes.conceptsByTag[tag] = store.indexes.conceptsByTag[tag].filter(id => id !== conceptId);
        }
      }
      
      // 8.2. Удаление из индекса по автору
      if (store.indexes.conceptsByAuthor[concept.author]) {
        store.indexes.conceptsByAuthor[concept.author] = store.indexes.conceptsByAuthor[concept.author].filter(id => id !== conceptId);
      }
      
      // 8.3. Удаление из индекса тезисов по концепции
      delete store.indexes.thesesByConceptId[conceptId];
      
      // 8.4. Удаление из индекса категорий по концепции
      delete store.indexes.categoriesByConcept[conceptId];
      
      // 9. Удаление концепции из хранилища
      delete store.concepts.byId[conceptId];
      store.concepts.allIds = store.concepts.allIds.filter(id => id !== conceptId);
      
      return true;
    }
  ]);
}
```

## Заключение

Спроектированная система связей между сущностями для JSON-хранилища философских концепций обеспечивает:

1. **Полноту отношений** - все необходимые связи между сущностями представлены и организованы оптимальным образом
2. **Поддержание целостности** - механизмы обеспечивают согласованность данных при изменениях
3. **Эффективный доступ** - индексы и кэширование оптимизируют доступ к связанным данным
4. **Каскадные операции** - правильная обработка зависимых сущностей при изменениях
5. **Возможность восстановления** - методы проверки и исправления проблем с целостностью

Разработанные подходы позволяют эффективно работать с взаимосвязанными философскими концепциями, графами, категориями и тезисами в рамках ограничений JSON-формата.
