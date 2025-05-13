# Детальная структура основных сущностей для JSON-хранилища

В данном документе представлена детальная структура каждой основной сущности приложения философских концепций, включая их атрибуты, типы данных, правила валидации и связи с другими сущностями.

## 1. Концепции (concepts)

Концепции являются центральными сущностями приложения и представляют собой философские идеи, теории и принципы.

### Базовая структура

```javascript
{
  // Идентификация и метаданные
  id: string,                   // Уникальный идентификатор (UUID v4)
  name: string,                 // Название концепции (1-100 символов)
  description: string,          // Описание концепции
  created: ISO 8601 datetime,   // Дата и время создания
  updated: ISO 8601 datetime,   // Дата и время обновления
  author: string,               // ID автора (пользователя)
  version: number,              // Версия концепции (начиная с 1)
  
  // Категоризация
  tags: string[],               // Массив тегов
  tradition: string,            // Философская традиция
  era: string,                  // Историческая эпоха
  
  // Связи с другими сущностями
  relatedThesesIds: string[],   // ID связанных тезисов
  relatedConceptIds: string[],  // ID связанных концепций
  
  // Атрибуты для синтеза
  synthesisMetadata: {
    certainty: number,          // Степень уверенности (0-1)
    centrality: number,         // Централизация в философской системе (0-1)
    tradition: string,          // Философская традиция
    position: {                 // Позиция в смысловом пространстве
      x: number,
      y: number
    }
  },
  
  // Происхождение
  sourceType: string,           // Источник: "user", "claude", "synthesis"
  claudeQueryId: string | null, // ID запроса к Claude (если есть)
  synthesisId: string | null,   // ID синтеза (если есть)
  
  // История изменений
  history: [
    {
      version: number,          // Номер версии
      date: ISO 8601 datetime,  // Дата и время изменения
      author: string,           // ID автора изменения
      changes: object           // Объект с внесенными изменениями
    }
  ]
}
```

### Атрибуты и типы данных

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| id | string | Да | Уникальный идентификатор | UUID v4 формат |
| name | string | Да | Название концепции | 1-100 символов |
| description | string | Да | Описание концепции | Не пустая строка |
| created | string | Да | Дата и время создания | ISO 8601 формат |
| updated | string | Да | Дата и время обновления | ISO 8601 формат |
| author | string | Да | ID автора (пользователя) | Существующий ID пользователя |
| version | number | Да | Версия концепции | Целое число ≥ 1 |
| tags | array | Нет | Массив тегов | Каждый тег: 1-30 символов |
| tradition | string | Нет | Философская традиция | 1-50 символов |
| era | string | Нет | Историческая эпоха | 1-50 символов |
| relatedThesesIds | array | Нет | ID связанных тезисов | Каждый ID: UUID v4 формат |
| relatedConceptIds | array | Нет | ID связанных концепций | Каждый ID: UUID v4 формат |
| synthesisMetadata.certainty | number | Нет | Степень уверенности | Число от 0 до 1 |
| synthesisMetadata.centrality | number | Нет | Централизация | Число от 0 до 1 |
| synthesisMetadata.tradition | string | Нет | Философская традиция | 1-50 символов |
| synthesisMetadata.position.x | number | Нет | X-координата | Число |
| synthesisMetadata.position.y | number | Нет | Y-координата | Число |
| sourceType | string | Нет | Источник концепции | "user", "claude", "synthesis" |
| claudeQueryId | string | Нет | ID запроса к Claude | UUID v4 формат или null |
| synthesisId | string | Нет | ID синтеза | UUID v4 формат или null |
| history[].version | number | Да | Номер версии | Целое число ≥ 1 |
| history[].date | string | Да | Дата и время изменения | ISO 8601 формат |
| history[].author | string | Да | ID автора изменения | Существующий ID пользователя |
| history[].changes | object | Да | Изменения | Любой объект |

### Пример концепции

```json
{
  "id": "c8a7d6f5-e3b2-4a10-9c8d-7b6a5e4f3d2c",
  "name": "Категорический императив",
  "description": "Фундаментальный принцип этики Канта, который предписывает действовать только согласно такой максиме, руководствуясь которой можно одновременно желать, чтобы она стала всеобщим законом.",
  "created": "2025-04-15T10:30:00Z",
  "updated": "2025-04-16T14:20:00Z",
  "author": "u1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
  "version": 2,
  "tags": ["ethics", "Kant", "deontology", "moral philosophy"],
  "tradition": "German idealism",
  "era": "18th century",
  "relatedThesesIds": [
    "t1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
    "t2b3c4d5-6e7f-8g9h-0i1j-k2l3m4n5o6p7"
  ],
  "relatedConceptIds": [
    "c1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
    "c2b3c4d5-6e7f-8g9h-0i1j-k2l3m4n5o6p7"
  ],
  "synthesisMetadata": {
    "certainty": 0.85,
    "centrality": 0.75,
    "tradition": "German idealism",
    "position": {
      "x": 0.3,
      "y": 0.7
    }
  },
  "sourceType": "user",
  "claudeQueryId": null,
  "synthesisId": null,
  "history": [
    {
      "version": 1,
      "date": "2025-04-15T10:30:00Z",
      "author": "u1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
      "changes": {
        "name": "Категорический императив",
        "description": "Фундаментальный принцип этики Канта, который предписывает действовать так, чтобы максима твоей воли могла быть всеобщим законом."
      }
    },
    {
      "version": 2,
      "date": "2025-04-16T14:20:00Z",
      "author": "u1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
      "changes": {
        "description": "Фундаментальный принцип этики Канта, который предписывает действовать только согласно такой максиме, руководствуясь которой можно одновременно желать, чтобы она стала всеобщим законом."
      }
    }
  ]
}
```

## 2. Графы концепций (graphs)

Графы концепций представляют визуальное отображение связей между философскими категориями и концепциями.

### Базовая структура

```javascript
{
  // Идентификация и метаданные
  id: string,                   // Уникальный идентификатор (UUID v4)
  name: string,                 // Название графа (1-100 символов)
  description: string,          // Описание графа
  created: ISO 8601 datetime,   // Дата и время создания
  updated: ISO 8601 datetime,   // Дата и время обновления
  author: string,               // ID автора (пользователя)
  version: number,              // Версия графа (начиная с 1)
  tags: string[],               // Массив тегов
  
  // Категории (узлы графа)
  categories: {
    [categoryId: string]: {     // Объект с категориями по ID
      id: string,               // Уникальный идентификатор категории
      name: string,             // Название категории (1-100 символов)
      description: string,      // Описание категории
      
      // Визуализация
      position: {               // Позиция узла на графе
        x: number,
        y: number
      },
      color: string,            // Цвет узла в формате HEX (#RRGGBB)
      size: number,             // Размер узла
      
      // Метаданные категории
      metadata: {
        centrality: number,     // Централизация в графе (0-1)
        certainty: number,      // Уверенность (0-1)
        tradition: string,      // Философская традиция
        era: string             // Историческая эпоха
      },
      
      // Связь с концепциями
      associatedConceptIds: string[]  // ID связанных концепций
    }
  },
  
  // Связи между категориями (рёбра графа)
  relationships: {
    [relationshipId: string]: { // Объект со связями по ID
      id: string,               // Уникальный идентификатор связи
      sourceId: string,         // ID исходной категории
      targetId: string,         // ID целевой категории
      type: string,             // Тип связи
      direction: string,        // Направление: "one-way" или "two-way"
      strength: number,         // Сила связи (0-1)
      description: string,      // Описание связи
      
      // Визуализация
      color: string,            // Цвет связи в формате HEX (#RRGGBB)
      width: number             // Толщина линии связи
    }
  },
  
  // Настройки визуализации графа
  visualSettings: {
    layout: string,             // Тип макета графа
    theme: string,              // Тема оформления
    nodeSizeBy: string,         // Определение размера узлов
    edgeWidthBy: string,        // Определение толщины связей
    zoom: number,               // Масштаб (0.1-5)
    pan: {                      // Смещение графа
      x: number,
      y: number
    }
  }
}
```

### Атрибуты и типы данных

#### Основные атрибуты графа

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| id | string | Да | Уникальный идентификатор | UUID v4 формат |
| name | string | Да | Название графа | 1-100 символов |
| description | string | Нет | Описание графа | Строка |
| created | string | Да | Дата и время создания | ISO 8601 формат |
| updated | string | Да | Дата и время обновления | ISO 8601 формат |
| author | string | Да | ID автора (пользователя) | Существующий ID пользователя |
| version | number | Да | Версия графа | Целое число ≥ 1 |
| tags | array | Нет | Массив тегов | Каждый тег: 1-30 символов |

#### Атрибуты категорий (узлов)

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| categories[id].id | string | Да | Идентификатор категории | UUID v4 формат |
| categories[id].name | string | Да | Название категории | 1-100 символов |
| categories[id].description | string | Нет | Описание категории | Строка |
| categories[id].position.x | number | Да | X-координата | Число |
| categories[id].position.y | number | Да | Y-координата | Число |
| categories[id].color | string | Нет | Цвет узла | HEX формат: #RRGGBB |
| categories[id].size | number | Нет | Размер узла | Число > 0 |
| categories[id].metadata.centrality | number | Нет | Централизация | Число от 0 до 1 |
| categories[id].metadata.certainty | number | Нет | Уверенность | Число от 0 до 1 |
| categories[id].metadata.tradition | string | Нет | Традиция | 1-50 символов |
| categories[id].metadata.era | string | Нет | Эпоха | 1-50 символов |
| categories[id].associatedConceptIds | array | Нет | ID концепций | Каждый ID: UUID v4 формат |

#### Атрибуты связей (рёбер)

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| relationships[id].id | string | Да | Идентификатор связи | UUID v4 формат |
| relationships[id].sourceId | string | Да | ID исходной категории | ID существующей категории |
| relationships[id].targetId | string | Да | ID целевой категории | ID существующей категории |
| relationships[id].type | string | Да | Тип связи | Одно из: "similarity", "opposition", "causality", "inclusion", "influence", "other" |
| relationships[id].direction | string | Нет | Направление | "one-way" или "two-way" |
| relationships[id].strength | number | Нет | Сила связи | Число от 0 до 1 |
| relationships[id].description | string | Нет | Описание связи | Строка |
| relationships[id].color | string | Нет | Цвет связи | HEX формат: #RRGGBB |
| relationships[id].width | number | Нет | Толщина линии | Число > 0 |

#### Атрибуты настроек визуализации

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| visualSettings.layout | string | Нет | Тип макета | Одно из: "force", "radial", "hierarchical", "grid" |
| visualSettings.theme | string | Нет | Тема | Одно из: "light", "dark", "colorful" |
| visualSettings.nodeSizeBy | string | Нет | Размер узлов | Одно из: "fixed", "centrality", "degree", "custom" |
| visualSettings.edgeWidthBy | string | Нет | Толщина связей | Одно из: "fixed", "strength", "custom" |
| visualSettings.zoom | number | Нет | Масштаб | Число от 0.1 до 5 |
| visualSettings.pan.x | number | Нет | Смещение по X | Число |
| visualSettings.pan.y | number | Нет | Смещение по Y | Число |

### Пример графа концепций

```json
{
  "id": "g1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
  "name": "Основные этические теории",
  "description": "Граф взаимосвязей между основными этическими теориями и их отношениями",
  "created": "2025-04-17T09:15:00Z",
  "updated": "2025-04-18T11:25:00Z",
  "author": "u1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
  "version": 1,
  "tags": ["ethics", "moral philosophy", "mapping"],
  
  "categories": {
    "cat-deontology": {
      "id": "cat-deontology",
      "name": "Деонтология",
      "description": "Этическая теория, оценивающая действия по их соответствию долгу и моральным правилам",
      "position": {
        "x": 100,
        "y": 150
      },
      "color": "#FF5733",
      "size": 50,
      "metadata": {
        "centrality": 0.85,
        "certainty": 0.9,
        "tradition": "German idealism",
        "era": "18th century"
      },
      "associatedConceptIds": [
        "c8a7d6f5-e3b2-4a10-9c8d-7b6a5e4f3d2c",
        "c2b3c4d5-6e7f-8g9h-0i1j-k2l3m4n5o6p7"
      ]
    },
    "cat-utilitarianism": {
      "id": "cat-utilitarianism",
      "name": "Утилитаризм",
      "description": "Этическая теория, оценивающая действия по их последствиям и пользе",
      "position": {
        "x": 300,
        "y": 150
      },
      "color": "#33FF57",
      "size": 50,
      "metadata": {
        "centrality": 0.8,
        "certainty": 0.9,
        "tradition": "British empiricism",
        "era": "19th century"
      },
      "associatedConceptIds": [
        "c3d4e5f6-7g8h-9i0j-1k2l-3m4n5o6p7q8",
        "c4e5f6g7-8h9i-0j1k-2l3m-4n5o6p7q8r9"
      ]
    },
    "cat-virtue-ethics": {
      "id": "cat-virtue-ethics",
      "name": "Этика добродетели",
      "description": "Этическая теория, фокусирующаяся на характере и добродетелях",
      "position": {
        "x": 200,
        "y": 300
      },
      "color": "#3357FF",
      "size": 50,
      "metadata": {
        "centrality": 0.75,
        "certainty": 0.85,
        "tradition": "Ancient Greek philosophy",
        "era": "Ancient"
      },
      "associatedConceptIds": [
        "c5f6g7h8-9i0j-1k2l-3m4n-5o6p7q8r9s0"
      ]
    }
  },
  
  "relationships": {
    "rel-deont-util": {
      "id": "rel-deont-util",
      "sourceId": "cat-deontology",
      "targetId": "cat-utilitarianism",
      "type": "opposition",
      "direction": "two-way",
      "strength": 0.75,
      "description": "Противопоставление по принципу оценки действий: правила vs. последствия",
      "color": "#999999",
      "width": 2
    },
    "rel-deont-virtue": {
      "id": "rel-deont-virtue",
      "sourceId": "cat-deontology",
      "targetId": "cat-virtue-ethics",
      "type": "similarity",
      "direction": "two-way",
      "strength": 0.6,
      "description": "Обе теории подчеркивают важность моральных принципов, а не только последствий",
      "color": "#999999",
      "width": 1.5
    },
    "rel-util-virtue": {
      "id": "rel-util-virtue",
      "sourceId": "cat-utilitarianism",
      "targetId": "cat-virtue-ethics",
      "type": "similarity",
      "direction": "two-way",
      "strength": 0.4,
      "description": "Некоторые утилитаристы утверждают, что добродетели максимизируют полезность",
      "color": "#999999",
      "width": 1
    }
  },
  
  "visualSettings": {
    "layout": "force",
    "theme": "light",
    "nodeSizeBy": "centrality",
    "edgeWidthBy": "strength",
    "zoom": 1,
    "pan": {
      "x": 0,
      "y": 0
    }
  }
}
```

## 3. Категории (categories)

Категории являются узлами графа концепций и представляют собой группы связанных философских идей.

### Базовая структура

Категории хранятся внутри графа в объекте `categories`, но их структура важна сама по себе:

```javascript
{
  id: string,                   // Уникальный идентификатор категории
  name: string,                 // Название категории (1-100 символов)
  description: string,          // Описание категории
  
  // Визуализация
  position: {                   // Позиция узла на графе
    x: number,
    y: number
  },
  color: string,                // Цвет узла в формате HEX (#RRGGBB)
  size: number,                 // Размер узла
  
  // Метаданные категории
  metadata: {
    centrality: number,         // Централизация в графе (0-1)
    certainty: number,          // Уверенность (0-1)
    tradition: string,          // Философская традиция
    era: string                 // Историческая эпоха
  },
  
  // Связь с концепциями
  associatedConceptIds: string[]  // ID связанных концепций
}
```

### Атрибуты и типы данных

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| id | string | Да | Идентификатор категории | UUID v4 или уникальный строковый ID |
| name | string | Да | Название категории | 1-100 символов |
| description | string | Нет | Описание категории | Строка |
| position.x | number | Да | X-координата | Число |
| position.y | number | Да | Y-координата | Число |
| color | string | Нет | Цвет узла | HEX формат: #RRGGBB |
| size | number | Нет | Размер узла | Число > 0 |
| metadata.centrality | number | Нет | Централизация | Число от 0 до 1 |
| metadata.certainty | number | Нет | Уверенность | Число от 0 до 1 |
| metadata.tradition | string | Нет | Традиция | 1-50 символов |
| metadata.era | string | Нет | Эпоха | 1-50 символов |
| associatedConceptIds | array | Нет | ID концепций | Каждый ID: UUID v4 формат |

### Пример категории

```json
{
  "id": "cat-deontology",
  "name": "Деонтология",
  "description": "Этическая теория, оценивающая действия по их соответствию долгу и моральным правилам",
  "position": {
    "x": 100,
    "y": 150
  },
  "color": "#FF5733",
  "size": 50,
  "metadata": {
    "centrality": 0.85,
    "certainty": 0.9,
    "tradition": "German idealism",
    "era": "18th century"
  },
  "associatedConceptIds": [
    "c8a7d6f5-e3b2-4a10-9c8d-7b6a5e4f3d2c",
    "c2b3c4d5-6e7f-8g9h-0i1j-k2l3m4n5o6p7"
  ]
}
```

## 4. Связи (relationships)

Связи представляют отношения между категориями в графе концепций.

### Базовая структура

Связи хранятся внутри графа в объекте `relationships`, но их структура важна сама по себе:

```javascript
{
  id: string,                   // Уникальный идентификатор связи
  sourceId: string,             // ID исходной категории
  targetId: string,             // ID целевой категории
  type: string,                 // Тип связи
  direction: string,            // Направление: "one-way" или "two-way"
  strength: number,             // Сила связи (0-1)
  description: string,          // Описание связи
  
  // Визуализация
  color: string,                // Цвет связи в формате HEX (#RRGGBB)
  width: number                 // Толщина линии связи
}
```

### Атрибуты и типы данных

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| id | string | Да | Идентификатор связи | UUID v4 или уникальный строковый ID |
| sourceId | string | Да | ID исходной категории | ID существующей категории |
| targetId | string | Да | ID целевой категории | ID существующей категории |
| type | string | Да | Тип связи | Одно из: "similarity", "opposition", "causality", "inclusion", "influence", "other" |
| direction | string | Нет | Направление | "one-way" или "two-way" |
| strength | number | Нет | Сила связи | Число от 0 до 1 |
| description | string | Нет | Описание связи | Строка |
| color | string | Нет | Цвет связи | HEX формат: #RRGGBB |
| width | number | Нет | Толщина линии | Число > 0 |

### Пример связи

```json
{
  "id": "rel-deont-util",
  "sourceId": "cat-deontology",
  "targetId": "cat-utilitarianism",
  "type": "opposition",
  "direction": "two-way",
  "strength": 0.75,
  "description": "Противопоставление по принципу оценки действий: правила vs. последствия",
  "color": "#999999",
  "width": 2
}
```

## 5. Тезисы (theses)

Тезисы представляют собой утверждения, аргументы, определения и примеры, связанные с философскими концепциями.

### Базовая структура

```javascript
{
  // Идентификация и метаданные
  id: string,                   // Уникальный идентификатор (UUID v4)
  content: string,              // Содержание тезиса
  type: string,                 // Тип тезиса
  created: ISO 8601 datetime,   // Дата и время создания
  updated: ISO 8601 datetime,   // Дата и время обновления
  author: string,               // ID автора (пользователя)
  version: number,              // Версия тезиса (начиная с 1)
  tags: string[],               // Массив тегов
  
  // Связи с другими сущностями
  relatedConceptIds: string[],  // ID связанных концепций
  
  // Метаданные генерации тезиса
  generationMetadata: {
    source: string,             // Источник: "user", "claude", "synthesis"
    prompt: string,             // Запрос для генерации
    timestamp: ISO 8601 datetime, // Время генерации
    claudeQueryId: string | null, // ID запроса к Claude
    synthesisId: string | null  // ID синтеза
  },
  
  // Стиль и формат тезиса
  style: {
    format: string,             // Формат содержимого: "plain", "markdown", "html"
    length: string,             // Длина: "short", "medium", "long"
    tone: string                // Тон: "neutral", "academic", "casual", "questioning"
  }
}
```

### Атрибуты и типы данных

| Атрибут | Тип данных | Обязательное | Описание | Валидация |
|---------|------------|--------------|----------|-----------|
| id | string | Да | Уникальный идентификатор | UUID v4 формат |
| content | string | Да | Содержание тезиса | Не пустая строка |
| type | string | Нет | Тип тезиса | Одно из: "principle", "argument", "definition", "example", "question", "critique", "other" |
| created | string | Да | Дата и время создания | ISO 8601 формат |
| updated | string | Да | Дата и время обновления | ISO 8601 формат |
| author | string | Да | ID автора (пользователя) | Существующий ID пользователя |
| version | number | Да | Версия тезиса | Целое число ≥ 1 |
| tags | array | Нет | Массив тегов | Каждый тег: 1-30 символов |
| relatedConceptIds | array | Нет | ID связанных концепций | Каждый ID: UUID v4 формат |
| generationMetadata.source | string | Нет | Источник тезиса | Одно из: "user", "claude", "synthesis" |
| generationMetadata.prompt | string | Нет | Запрос для генерации | Строка |
| generationMetadata.timestamp | string | Нет | Время генерации | ISO 8601 формат |
| generationMetadata.claudeQueryId | string | Нет | ID запроса к Claude | UUID v4 формат или null |
| generationMetadata.synthesisId | string | Нет | ID синтеза | UUID v4 формат или null |
| style.format | string | Нет | Формат содержимого | Одно из: "plain", "markdown", "html" |
| style.length | string | Нет | Длина тезиса | Одно из: "short", "medium", "long" |
| style.tone | string | Нет | Тон тезиса | Одно из: "neutral", "academic", "casual", "questioning" |

### Пример тезиса

```json
{
  "id": "t1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
  "content": "Категорический императив предписывает действовать так, чтобы максима твоей воли могла бы стать принципом всеобщего законодательства.",
  "type": "principle",
  "created": "2025-04-15T14:30:00Z",
  "updated": "2025-04-16T10:20:00Z",
  "author": "u1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
  "version": 1,
  "tags": ["ethics", "Kant", "deontology"],
  "relatedConceptIds": ["c8a7d6f5-e3b2-4a10-9c8d-7b6a5e4f3d2c"],
  "generationMetadata": {
    "source": "claude",
    "prompt": "Сформулируйте основной принцип категорического императива Канта",
    "timestamp": "2025-04-15T14:25:00Z",
    "claudeQueryId": "q1a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6",
    "synthesisId": null
  },
  "style": {
    "format": "plain",
    "length": "medium",
    "tone": "academic"
  }
}
```

## Рекомендации по эффективному хранению и доступу

### 1. Индексирование

Для оптимизации доступа к данным рекомендуется создать следующие индексы:

#### Индексы для концепций:
- По тегам (`concepts-byTag`)
- По автору (`concepts-byAuthor`)
- По дате создания (`concepts-byDateCreated`)
- По традиции (`concepts-byTradition`)

#### Индексы для тезисов:
- По связанным концепциям (`theses-byConceptId`)
- По типу тезиса (`theses-byType`)
- По источнику (`theses-bySource`)

#### Индексы для графов:
- По тегам (`graphs-byTag`)
- По автору (`graphs-byAuthor`)

### 2. Денормализация для оптимизации доступа

Для часто выполняемых операций можно использовать частичную денормализацию:

1. Хранить имена и основные метаданные связанных сущностей:
   ```json
   "relatedConcepts": [
     {
       "id": "c8a7d6f5-e3b2-4a10-9c8d-7b6a5e4f3d2c",
       "name": "Категорический императив",
       "tradition": "German idealism"
     }
   ]
   ```

2. Кэшировать агрегированные данные:
   ```json
   "conceptStats": {
     "totalTheses": 15,
     "relatedConcepts": 3,
     "lastModified": "2025-04-16T14:20:00Z"
   }
   ```

### 3. Стратегии для обработки больших объемов данных

1. **Пагинация**: Загружать данные постранично (особенно для списков тезисов)
2. **Ленивая загрузка**: Загружать детали концепций только при открытии
3. **Разделение данных**: Хранить большие блоки текста отдельно от метаданных
4. **Компрессия**: Сжимать исторические данные, которые редко используются

## Правила валидации данных

### Общие правила:

1. **ID**: Все ID должны быть в формате UUID v4 или уникальными строковыми идентификаторами
2. **Даты**: Все даты должны быть в формате ISO 8601
3. **Строки**: Строковые поля должны соответствовать ограничениям по длине
4. **Ссылки**: Все ссылки на другие сущности должны быть действительными

### Специфические правила:

1. **Концепции**:
   - Название не должно быть пустым и не должно превышать 100 символов
   - Должны быть заполнены обязательные поля: id, name, description, created, updated, author

2. **Графы**:
   - Каждая категория должна иметь уникальный ID внутри графа
   - Каждая связь должна ссылаться на существующие категории
   - ID исходной и целевой категории в связи не должны совпадать

3. **Тезисы**:
   - Содержание не должно быть пустым
   - Тип тезиса должен быть одним из разрешенных значений

## Примеры типичных операций с данными

### 1. Создание новой концепции

```javascript
const newConcept = {
  id: generateUUID(),
  name: "Императив практического разума",
  description: "Философский принцип Канта, определяющий моральный закон...",
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  author: currentUserId,
  version: 1,
  tags: ["ethics", "Kant", "deontology"],
  relatedThesesIds: [],
  relatedConceptIds: ["c8a7d6f5-e3b2-4a10-9c8d-7b6a5e4f3d2c"],
  synthesisMetadata: {
    certainty: 0.8,
    centrality: 0.7,
    tradition: "German idealism"
  },
  sourceType: "user",
  claudeQueryId: null,
  synthesisId: null,
  history: [
    {
      version: 1,
      date: new Date().toISOString(),
      author: currentUserId,
      changes: {
        name: "Императив практического разума",
        description: "Философский принцип Канта, определяющий моральный закон..."
      }
    }
  ]
};

// Добавление в хранилище
store.concepts.byId[newConcept.id] = newConcept;
store.concepts.allIds.push(newConcept.id);

// Обновление индексов
updateConceptIndexes(newConcept);

// Сохранение в localStorage
saveStore(store);
```

### 2. Связывание тезиса с концепцией

```javascript
const linkThesisToConcept = (thesisId, conceptId) => {
  // Проверка существования
  if (!store.theses.byId[thesisId]) {
    throw new Error(`Тезис с ID ${thesisId} не найден`);
  }
  
  if (!store.concepts.byId[conceptId]) {
    throw new Error(`Концепция с ID ${conceptId} не найдена`);
  }
  
  // Обновление тезиса
  const thesis = store.theses.byId[thesisId];
  if (!thesis.relatedConceptIds.includes(conceptId)) {
    thesis.relatedConceptIds.push(conceptId);
    thesis.updated = new Date().toISOString();
  }
  
  // Обновление концепции
  const concept = store.concepts.byId[conceptId];
  if (!concept.relatedThesesIds.includes(thesisId)) {
    concept.relatedThesesIds.push(thesisId);
    concept.updated = new Date().toISOString();
  }
  
  // Обновление индексов
  updateThesisIndexes(thesis);
  
  // Сохранение в localStorage
  saveStore(store);
};
```

### 3. Добавление категории в граф

```javascript
const addCategoryToGraph = (graphId, categoryData) => {
  // Проверка существования графа
  if (!store.graphs.byId[graphId]) {
    throw new Error(`Граф с ID ${graphId} не найден`);
  }
  
  const graph = store.graphs.byId[graphId];
  
  // Создание категории
  const newCategory = {
    id: categoryData.id || `cat-${generateUUID()}`,
    name: categoryData.name,
    description: categoryData.description || "",
    position: categoryData.position || { x: 0, y: 0 },
    color: categoryData.color || "#000000",
    size: categoryData.size || 40,
    metadata: categoryData.metadata || {
      centrality: 0.5,
      certainty: 0.5
    },
    associatedConceptIds: categoryData.associatedConceptIds || []
  };
  
  // Добавление категории в граф
  graph.categories[newCategory.id] = newCategory;
  graph.updated = new Date().toISOString();
  
  // Сохранение в localStorage
  saveStore(store);
  
  return newCategory.id;
};
```
