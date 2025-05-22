# Детальный формат запросов и ответов для API бэкенд-прокси

## Введение

В данном документе детально описаны форматы запросов и ответов для каждого эндпоинта API бэкенд-прокси взаимодействия с Claude API. Документ содержит примеры запросов, успешных ответов, обработки ошибок и HTTP-заголовков для всех эндпоинтов.

## 1. Синхронный запрос к Claude API (POST /api/claude/query)

Этот эндпоинт предназначен для отправки синхронных запросов к Claude API и получения ответов без постановки в очередь.

### 1.1. Формат запроса

#### HTTP-метод и URL
```
POST /api/claude/query
```

#### HTTP-заголовки
```http
Content-Type: application/json
Authorization: Bearer <api_token>
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело запроса (JSON)

```json
{
  "prompt": "Объясните основные идеи категорического императива Канта и как он применяется в современной этике",
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "model": "claude-3",
    "topP": 0.95,
    "topK": 40,
    "stopSequences": ["###"]
  },
  "caching": true,
  "system": "Вы - эксперт по философии Канта. Отвечайте академично, но понятно."
}
```

#### Валидация полей запроса

| Поле | Тип | Обязательное | Ограничения | Описание |
|------|-----|--------------|-------------|----------|
| prompt | string | Да | 1-100000 символов | Текст запроса к Claude API |
| parameters | object | Нет | - | Параметры запроса |
| parameters.temperature | number | Нет | 0.0-1.0 | Температура генерации |
| parameters.maxTokens | number | Нет | 1-100000 | Максимальное количество токенов |
| parameters.model | string | Нет | Допустимые: "claude-3", "claude-3-opus", "claude-3-sonnet", "claude-3-haiku" | Версия модели Claude |
| parameters.topP | number | Нет | 0.0-1.0 | Top-p значение |
| parameters.topK | number | Нет | 0-100 | Top-k значение |
| parameters.stopSequences | array | Нет | Максимум 10 строк | Последовательности для остановки генерации |
| caching | boolean | Нет | - | Использовать кэширование |
| system | string | Нет | 0-2000 символов | Системный промпт для Claude |

### 1.2. Формат успешного ответа (200 OK)

#### HTTP-заголовки
```http
Content-Type: application/json
Cache-Control: private, max-age=3600
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1619123456
```

#### Тело ответа (JSON)

```json
{
  "id": "resp-abcdef12-3456-7890-abcd-ef1234567890",
  "content": "Категорический императив Канта — это фундаментальный моральный принцип, который утверждает, что человеку следует действовать только согласно такой максиме, относительно которой он мог бы желать, чтобы она стала всеобщим законом. Кант сформулировал этот принцип в своей работе «Основы метафизики нравственности» (1785).\n\nКатегорический императив имеет несколько формулировок:\n\n1. **Формула универсального закона**: «Поступай только согласно такой максиме, руководствуясь которой ты в то же время можешь пожелать, чтобы она стала всеобщим законом».\n\n2. **Формула человечества как цели**: «Поступай так, чтобы ты всегда относился к человечеству и в своем лице, и в лице всякого другого также как к цели и никогда не относился бы к нему только как к средству».\n\n3. **Формула автономии**: «Поступай так, чтобы воля могла рассматривать себя в качестве всеобщего законодателя посредством своих максим».\n\nВ современной этике категорический императив продолжает оказывать значительное влияние, особенно в следующих областях:\n\n- **Биоэтика**: При решении вопросов об экспериментах на людях или животных категорический императив напоминает о необходимости рассматривать всех существ как цели, а не только как средства.\n\n- **Бизнес-этика**: Категорический императив применяется для оценки этичности бизнес-практик и корпоративной ответственности.\n\n- **Экологическая этика**: Приложение формулы универсального закона к проблемам окружающей среды позволяет оценить долгосрочные последствия наших действий.\n\n- **Правосудие**: Концепция категорического императива лежит в основе многих принципов правовой системы и прав человека.\n\nОднако категорический императив также подвергается критике за свою абсолютность и формальность, которые могут не учитывать контекстуальные особенности этических дилемм. Тем не менее, вклад Канта в этическую мысль остается неоценимым, предлагая рациональный и универсальный подход к моральным решениям.",
  "usage": {
    "promptTokens": 43,
    "completionTokens": 365,
    "totalTokens": 408
  },
  "metadata": {
    "timestamp": "2025-04-15T14:30:22.567Z",
    "model": "claude-3",
    "cached": false,
    "finishReason": "stop",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Описание полей ответа

| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор ответа |
| content | string | Текст ответа от Claude API |
| usage | object | Информация об использованных токенах |
| usage.promptTokens | number | Количество токенов в запросе |
| usage.completionTokens | number | Количество токенов в ответе |
| usage.totalTokens | number | Общее количество токенов |
| metadata | object | Метаданные ответа |
| metadata.timestamp | string | Время генерации ответа в ISO 8601 формате |
| metadata.model | string | Использованная модель Claude |
| metadata.cached | boolean | Был ли ответ получен из кэша |
| metadata.finishReason | string | Причина завершения генерации: "stop", "length", "content_filtered" |
| metadata.requestId | string | Идентификатор запроса |

### 1.3. Форматы ошибок

#### Недопустимый запрос (400 Bad Request)

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Отсутствует обязательный параметр 'prompt'",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Ошибка аутентификации (401 Unauthorized)

```json
{
  "error": {
    "code": "authentication_error",
    "message": "API ключ недействителен или истек срок его действия",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Превышение лимита запросов (429 Too Many Requests)

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Превышен лимит запросов: 60 запросов в минуту",
    "details": {
      "rateLimit": 60,
      "resetInSeconds": 35
    },
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Ошибка Claude API (502 Bad Gateway)

```json
{
  "error": {
    "code": "claude_api_error",
    "message": "Ошибка при взаимодействии с Claude API",
    "details": "Claude API вернул статус 500 Internal Server Error",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## 2. Асинхронный запрос к Claude API (POST /api/claude/queue)

Этот эндпоинт используется для постановки запросов в очередь для асинхронной обработки.

### 2.1. Формат запроса

#### HTTP-метод и URL
```
POST /api/claude/queue
```

#### HTTP-заголовки
```http
Content-Type: application/json
Authorization: Bearer <api_token>
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело запроса (JSON)

```json
{
  "prompt": "Проведите подробный сравнительный анализ деонтологической этики Канта и утилитаризма Милля, включая их основные принципы, критику и современное применение.",
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 8000,
    "model": "claude-3-opus",
    "topP": 0.95
  },
  "priority": "medium",
  "callbackUrl": "https://myapp.example.com/api/webhooks/claude-callback",
  "metadata": {
    "requestType": "ethics-comparison",
    "userReference": "project-123",
    "tags": ["ethics", "philosophy", "comparison"]
  },
  "system": "Вы - профессор философии, проводящий сравнительный анализ этических теорий."
}
```

#### Валидация полей запроса

| Поле | Тип | Обязательное | Ограничения | Описание |
|------|-----|--------------|-------------|----------|
| prompt | string | Да | 1-100000 символов | Текст запроса к Claude API |
| parameters | object | Нет | - | Параметры запроса (см. синхронный запрос) |
| priority | string | Нет | "high", "medium", "low" | Приоритет задачи в очереди |
| callbackUrl | string | Нет | Валидный URL | URL для вебхука по завершении задачи |
| metadata | object | Нет | - | Пользовательские метаданные |
| system | string | Нет | 0-2000 символов | Системный промпт для Claude |

### 2.2. Формат успешного ответа (202 Accepted)

#### HTTP-заголовки
```http
Content-Type: application/json
Location: /api/claude/task/task-123e4567-e89b-12d3-a456-426614174000
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
X-RateLimit-Reset: 1619123456
```

#### Тело ответа (JSON)

```json
{
  "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
  "status": "queued",
  "position": 3,
  "estimatedStartTime": "2025-04-15T14:35:00Z",
  "createdAt": "2025-04-15T14:30:00Z",
  "metadata": {
    "requestType": "ethics-comparison",
    "userReference": "project-123",
    "tags": ["ethics", "philosophy", "comparison"]
  },
  "priority": "medium",
  "links": {
    "self": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000",
    "result": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000/result",
    "cancel": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Описание полей ответа

| Поле | Тип | Описание |
|------|-----|----------|
| taskId | string | Уникальный идентификатор задачи |
| status | string | Статус задачи: "queued", "processing", "completed", "failed", "cancelled" |
| position | number | Позиция в очереди (для статуса "queued") |
| estimatedStartTime | string | Примерное время начала выполнения |
| createdAt | string | Время создания задачи |
| metadata | object | Пользовательские метаданные |
| priority | string | Приоритет задачи |
| links | object | Ссылки на связанные ресурсы |
| links.self | string | URL для проверки статуса задачи |
| links.result | string | URL для получения результата |
| links.cancel | string | URL для отмены задачи |

### 2.3. Форматы ошибок

Форматы ошибок аналогичны синхронному запросу.

## 3. Проверка статуса задачи (GET /api/claude/task/:taskId)

Этот эндпоинт используется для проверки статуса ранее поставленной в очередь задачи.

### 3.1. Формат запроса

#### HTTP-метод и URL
```
GET /api/claude/task/task-123e4567-e89b-12d3-a456-426614174000
```

#### HTTP-заголовки
```http
Authorization: Bearer <api_token>
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Параметры URL

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| taskId | string | Да | Идентификатор задачи |

### 3.2. Форматы успешных ответов (200 OK)

#### Задача в очереди

```json
{
  "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
  "status": "queued",
  "position": 2,
  "estimatedStartTime": "2025-04-15T14:32:00Z",
  "createdAt": "2025-04-15T14:30:00Z",
  "metadata": {
    "requestType": "ethics-comparison",
    "userReference": "project-123",
    "tags": ["ethics", "philosophy", "comparison"]
  },
  "priority": "medium",
  "links": {
    "self": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000",
    "result": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000/result",
    "cancel": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Задача выполняется

```json
{
  "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
  "status": "processing",
  "createdAt": "2025-04-15T14:30:00Z",
  "startedAt": "2025-04-15T14:32:00Z",
  "progress": 0.5,
  "estimatedCompletionTime": "2025-04-15T14:37:00Z",
  "metadata": {
    "requestType": "ethics-comparison",
    "userReference": "project-123",
    "tags": ["ethics", "philosophy", "comparison"]
  },
  "priority": "medium",
  "links": {
    "self": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000",
    "result": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000/result",
    "cancel": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Задача завершена

```json
{
  "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "createdAt": "2025-04-15T14:30:00Z",
  "startedAt": "2025-04-15T14:32:00Z",
  "completedAt": "2025-04-15T14:37:00Z",
  "metadata": {
    "requestType": "ethics-comparison",
    "userReference": "project-123",
    "tags": ["ethics", "philosophy", "comparison"]
  },
  "usage": {
    "promptTokens": 85,
    "completionTokens": 2500,
    "totalTokens": 2585
  },
  "priority": "medium",
  "resultAvailable": true,
  "links": {
    "self": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000",
    "result": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000/result"
  }
}
```

#### Задача завершилась с ошибкой

```json
{
  "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
  "status": "failed",
  "createdAt": "2025-04-15T14:30:00Z",
  "startedAt": "2025-04-15T14:32:00Z",
  "failedAt": "2025-04-15T14:33:00Z",
  "metadata": {
    "requestType": "ethics-comparison",
    "userReference": "project-123",
    "tags": ["ethics", "philosophy", "comparison"]
  },
  "priority": "medium",
  "error": {
    "code": "claude_api_error",
    "message": "Ошибка при взаимодействии с Claude API",
    "details": "Model temporarily unavailable"
  },
  "retryCount": 2,
  "maxRetries": 3,
  "links": {
    "self": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### 3.3. Формат ошибки "Задача не найдена" (404 Not Found)

```json
{
  "error": {
    "code": "task_not_found",
    "message": "Задача с ID task-123e4567-e89b-12d3-a456-426614174000 не найдена",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## 4. Получение результата задачи (GET /api/claude/task/:taskId/result)

Этот эндпоинт используется для получения результата выполненной задачи.

### 4.1. Формат запроса

#### HTTP-метод и URL
```
GET /api/claude/task/task-123e4567-e89b-12d3-a456-426614174000/result
```

#### HTTP-заголовки
```http
Authorization: Bearer <api_token>
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Параметры URL

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| taskId | string | Да | Идентификатор задачи |

### 4.2. Формат успешного ответа (200 OK)

#### HTTP-заголовки
```http
Content-Type: application/json
Cache-Control: private, max-age=86400
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело ответа (JSON)

```json
{
  "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
  "content": "# Сравнительный анализ деонтологической этики Канта и утилитаризма Милля\n\n## 1. Введение\n\nДеонтологическая этика Иммануила Канта и утилитаризм Джона Стюарта Милля представляют собой два фундаментальных, но противоположных подхода к нормативной этике. Кант разработал систему этики, основанную на абсолютных моральных принципах, в то время как Милль предложил консеквенциалистский подход, оценивающий действия по их последствиям.\n\n...[содержание длинного детального ответа]...\n\n## 7. Заключение\n\nДеонтология Канта и утилитаризм Милля остаются важнейшими этическими теориями, каждая со своими сильными и слабыми сторонами. Современная этическая мысль часто пытается совместить ценные аспекты обоих подходов, признавая как важность намерений и универсальных принципов, так и значимость последствий наших действий.",
  "usage": {
    "promptTokens": 85,
    "completionTokens": 2500,
    "totalTokens": 2585
  },
  "metadata": {
    "timestamp": "2025-04-15T14:37:00Z",
    "model": "claude-3-opus",
    "finishReason": "stop",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000",
    "taskCreatedAt": "2025-04-15T14:30:00Z",
    "taskStartedAt": "2025-04-15T14:32:00Z",
    "taskCompletedAt": "2025-04-15T14:37:00Z",
    "requestType": "ethics-comparison",
    "userReference": "project-123",
    "tags": ["ethics", "philosophy", "comparison"]
  }
}
```

### 4.3. Форматы ошибок

#### Результат недоступен (400 Bad Request)

```json
{
  "error": {
    "code": "result_not_available",
    "message": "Результат задачи недоступен. Текущий статус: processing",
    "taskStatus": "processing",
    "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Задача не найдена (404 Not Found)

```json
{
  "error": {
    "code": "task_not_found",
    "message": "Задача с ID task-123e4567-e89b-12d3-a456-426614174000 не найдена",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## 5. Отмена задачи (DELETE /api/claude/task/:taskId)

Этот эндпоинт используется для отмены задачи, которая находится в очереди или в процессе выполнения.

### 5.1. Формат запроса

#### HTTP-метод и URL
```
DELETE /api/claude/task/task-123e4567-e89b-12d3-a456-426614174000
```

#### HTTP-заголовки
```http
Authorization: Bearer <api_token>
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Параметры URL

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| taskId | string | Да | Идентификатор задачи |

### 5.2. Формат успешного ответа (200 OK)

```json
{
  "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
  "status": "cancelled",
  "previousStatus": "queued",
  "createdAt": "2025-04-15T14:30:00Z",
  "cancelledAt": "2025-04-15T14:31:00Z",
  "message": "Задача успешно отменена"
}
```

### 5.3. Форматы ошибок

#### Невозможно отменить (400 Bad Request)

```json
{
  "error": {
    "code": "cannot_cancel",
    "message": "Невозможно отменить задачу. Текущий статус: completed",
    "taskStatus": "completed",
    "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Задача не найдена (404 Not Found)

```json
{
  "error": {
    "code": "task_not_found",
    "message": "Задача с ID task-123e4567-e89b-12d3-a456-426614174000 не найдена",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## 6. Получение списка задач (GET /api/claude/tasks)

Этот эндпоинт используется для получения списка задач с возможностью фильтрации и пагинации.

### 6.1. Формат запроса

#### HTTP-метод и URL
```
GET /api/claude/tasks?status=queued&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

#### HTTP-заголовки
```http
Authorization: Bearer <api_token>
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Параметры запроса (query string)

| Параметр | Тип | Обязательный | Ограничения | Описание |
|----------|-----|--------------|-------------|----------|
| status | string | Нет | Допустимые: "queued", "processing", "completed", "failed", "cancelled" | Фильтр по статусу |
| page | number | Нет | ≥ 1 | Номер страницы |
| limit | number | Нет | 1-100 | Количество записей на странице |
| sortBy | string | Нет | Допустимые: "createdAt", "startedAt", "completedAt", "priority" | Поле для сортировки |
| sortOrder | string | Нет | Допустимые: "asc", "desc" | Порядок сортировки |
| tags | string | Нет | Список тегов, разделенных запятыми | Фильтрация по тегам |
| metadata.requestType | string | Нет | - | Фильтрация по типу запроса |
| metadata.userReference | string | Нет | - | Фильтрация по пользовательской ссылке |

### 6.2. Формат успешного ответа (200 OK)

#### HTTP-заголовки
```http
Content-Type: application/json
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело ответа (JSON)

```json
{
  "tasks": [
    {
      "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
      "status": "completed",
      "createdAt": "2025-04-15T14:30:00Z",
      "startedAt": "2025-04-15T14:32:00Z",
      "completedAt": "2025-04-15T14:37:00Z",
      "metadata": {
        "requestType": "ethics-comparison",
        "tags": ["ethics", "philosophy", "comparison"]
      },
      "priority": "medium",
      "resultAvailable": true,
      "links": {
        "self": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000",
        "result": "/api/claude/task/task-123e4567-e89b-12d3-a456-426614174000/result"
      }
    },
    {
      "taskId": "task-234e5678-e89b-12d3-a456-426614174000",
      "status": "queued",
      "createdAt": "2025-04-15T14:45:00Z",
      "position": 1,
      "estimatedStartTime": "2025-04-15T14:50:00Z",
      "metadata": {
        "requestType": "ethics-analysis",
        "tags": ["ethics", "philosophy", "analysis"]
      },
      "priority": "high",
      "links": {
        "self": "/api/claude/task/task-234e5678-e89b-12d3-a456-426614174000",
        "result": "/api/claude/task/task-234e5678-e89b-12d3-a456-426614174000/result",
        "cancel": "/api/claude/task/task-234e5678-e89b-12d3-a456-426614174000"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3,
    "links": {
      "first": "/api/claude/tasks?page=1&limit=10",
      "last": "/api/claude/tasks?page=3&limit=10",
      "next": "/api/claude/tasks?page=2&limit=10",
      "prev": null
    }
  },
  "filters": {
    "status": "queued",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

## 7. Проверка состояния сервиса (GET /api/health)

Этот эндпоинт используется для проверки состояния сервиса и его компонентов.

### 7.1. Формат запроса

#### HTTP-метод и URL
```
GET /api/health
```

### 7.2. Формат успешного ответа (200 OK)

#### HTTP-заголовки
```http
Content-Type: application/json
Cache-Control: no-cache
```

#### Тело ответа (JSON)

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-04-15T14:30:00Z",
  "uptime": 86400,
  "components": {
    "server": {
      "status": "healthy",
      "uptime": 86400,
      "memoryUsage": {
        "rss": "125MB",
        "heapTotal": "75MB",
        "heapUsed": "50MB"
      }
    },
    "claudeApi": {
      "status": "healthy",
      "latency": 250,
      "lastCheck": "2025-04-15T14:29:50Z"
    },
    "queue": {
      "status": "healthy",
      "size": 5,
      "processing": 1,
      "completed": 124,
      "failed": 3
    },
    "database": {
      "status": "healthy",
      "connectionPool": 5,
      "latency": 5
    }
  }
}
```

### 7.3. Формат ответа при частичной деградации (503 Service Unavailable)

```json
{
  "status": "degraded",
  "version": "1.0.0",
  "timestamp": "2025-04-15T14:30:00Z",
  "uptime": 3600,
  "components": {
    "server": {
      "status": "healthy",
      "uptime": 3600,
      "memoryUsage": {
        "rss": "125MB",
        "heapTotal": "75MB",
        "heapUsed": "50MB"
      }
    },
    "claudeApi": {
      "status": "unhealthy",
      "error": "Cannot connect to Claude API",
      "lastSuccessfulConnection": "2025-04-15T13:30:00Z",
      "failureCount": 5
    },
    "queue": {
      "status": "healthy",
      "size": 15,
      "processing": 0,
      "completed": 120,
      "failed": 3
    },
    "database": {
      "status": "healthy",
      "connectionPool": 5,
      "latency": 5
    }
  },
  "message": "Сервис работает в ограниченном режиме: Claude API недоступен"
}
```

## 8. Регистрация API-ключа клиентского приложения (POST /api/auth/register)

Этот эндпоинт используется для регистрации нового API-ключа для клиентского приложения.

### 8.1. Формат запроса

#### HTTP-метод и URL
```
POST /api/auth/register
```

#### HTTP-заголовки
```http
Content-Type: application/json
Authorization: Bearer <admin_token>
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело запроса (JSON)

```json
{
  "name": "Philosophy Concepts SPA",
  "description": "Одностраничное приложение для работы с философскими концепциями",
  "permissions": ["query", "queue", "task:read", "task:cancel"],
  "expiresIn": "P1Y",
  "allowedOrigins": ["https://philosophy-concepts.example.com"],
  "rateLimit": {
    "query": 60,
    "queue": 20
  }
}
```

#### Валидация полей запроса

| Поле | Тип | Обязательное | Ограничения | Описание |
|------|-----|--------------|-------------|----------|
| name | string | Да | 1-100 символов | Название клиентского приложения |
| description | string | Нет | 0-500 символов | Описание клиентского приложения |
| permissions | array | Нет | Допустимые: "query", "queue", "task:read", "task:cancel", "task:list" | Массив разрешений |
| expiresIn | string | Нет | ISO 8601 duration | Срок действия |
| allowedOrigins | array | Нет | Массив валидных URL | Разрешенные источники для CORS |
| rateLimit | object | Нет | - | Настройки ограничения запросов |
| rateLimit.query | number | Нет | > 0 | Лимит для синхронных запросов |
| rateLimit.queue | number | Нет | > 0 | Лимит для асинхронных запросов |

### 8.2. Формат успешного ответа (201 Created)

#### HTTP-заголовки
```http
Content-Type: application/json
Location: /api/auth/apikey/key-123e4567-e89b-12d3-a456-426614174000
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело ответа (JSON)

```json
{
  "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
  "apiKey": "sk_live_abcdefghijklmnopqrstuvwxyz",
  "name": "Philosophy Concepts SPA",
  "description": "Одностраничное приложение для работы с философскими концепциями",
  "permissions": ["query", "queue", "task:read", "task:cancel"],
  "createdAt": "2025-04-15T14:30:00Z",
  "expiresAt": "2026-04-15T14:30:00Z",
  "allowedOrigins": ["https://philosophy-concepts.example.com"],
  "rateLimit": {
    "query": 60,
    "queue": 20
  },
  "message": "Сохраните этот API-ключ! Он больше не будет показан."
}
```

### 8.3. Форматы ошибок

#### Недостаточно прав (403 Forbidden)

```json
{
  "error": {
    "code": "insufficient_permissions",
    "message": "Для выполнения этого действия требуются права администратора",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Ошибка валидации (400 Bad Request)

```json
{
  "error": {
    "code": "validation_error",
    "message": "Ошибка валидации данных запроса",
    "details": {
      "name": "Поле является обязательным",
      "permissions": "Неизвестное разрешение: 'admin'"
    },
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## 9. Получение JWT-токена (POST /api/auth/token)

Этот эндпоинт используется для получения JWT-токена на основе API-ключа.

### 9.1. Формат запроса

#### HTTP-метод и URL
```
POST /api/auth/token
```

#### HTTP-заголовки
```http
Content-Type: application/json
User-Agent: PhilosophyConceptsSPA/1.0
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело запроса (JSON)

```json
{
  "apiKey": "sk_live_abcdefghijklmnopqrstuvwxyz",
  "expiresIn": "1h"
}
```

#### Валидация полей запроса

| Поле | Тип | Обязательное | Ограничения | Описание |
|------|-----|--------------|-------------|----------|
| apiKey | string | Да | Валидный API-ключ | API-ключ клиентского приложения |
| expiresIn | string | Нет | "15m", "30m", "1h", "6h", "12h", "24h" | Срок действия токена |

### 9.2. Формат успешного ответа (200 OK)

#### HTTP-заголовки
```http
Content-Type: application/json
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
```

#### Тело ответа (JSON)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImNsaWVudC0xMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJwZXJtaXNzaW9ucyI6WyJxdWVyeSIsInF1ZXVlIiwidGFzazpyZWFkIiwidGFzazpjYW5jZWwiXSwiaWF0IjoxNjE4NTMyNzMwLCJleHAiOjE2MTg1MzYzMzB9.7M3JyZiM_Z6YyCRu4Z8KGmL7I4T6LJ_S5xg2YM4DdZo",
  "expiresAt": "2025-04-15T15:30:00Z",
  "tokenType": "Bearer",
  "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
  "permissions": ["query", "queue", "task:read", "task:cancel"]
}
```

### 9.3. Форматы ошибок

#### Недействительный API-ключ (401 Unauthorized)

```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "API-ключ недействителен или истек срок его действия",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## Общая система кодов ошибок

| Код ошибки | HTTP-код | Описание |
|------------|----------|----------|
| invalid_request | 400 | Ошибка в параметрах запроса |
| validation_error | 400 | Ошибка валидации данных запроса |
| missing_parameter | 400 | Отсутствует обязательный параметр |
| invalid_parameter | 400 | Недопустимое значение параметра |
| cannot_cancel | 400 | Невозможно отменить задачу |
| result_not_available | 400 | Результат задачи недоступен |
| authentication_error | 401 | Ошибка аутентификации |
| invalid_api_key | 401 | Недействительный API-ключ |
| token_expired | 401 | Истек срок действия токена |
| authorization_error | 403 | Отказ в доступе из-за недостаточных прав |
| insufficient_permissions | 403 | Недостаточно прав для выполнения операции |
| task_not_found | 404 | Задача не найдена |
| resource_not_found | 404 | Ресурс не найден |
| rate_limit_exceeded | 429 | Превышен лимит запросов |
| claude_api_error | 502 | Ошибка при взаимодействии с Claude API |
| service_unavailable | 503 | Сервис временно недоступен |
| internal_server_error | 500 | Внутренняя ошибка сервера |

## Рекомендации по валидации запросов

### 1. Валидация полей запросов

Для клиентских приложений рекомендуется реализовать валидацию полей запросов перед отправкой на сервер:

```javascript
function validateClaudeQuery(request) {
  const errors = {};
  
  // Проверка наличия обязательного поля
  if (!request.prompt) {
    errors.prompt = "Поле является обязательным";
  } else if (typeof request.prompt !== "string") {
    errors.prompt = "Поле должно быть строкой";
  } else if (request.prompt.length > 100000) {
    errors.prompt = "Максимальная длина - 100000 символов";
  }
  
  // Проверка параметров
  if (request.parameters) {
    if (typeof request.parameters !== "object") {
      errors.parameters = "Поле должно быть объектом";
    } else {
      // Проверка температуры
      if (request.parameters.temperature !== undefined) {
        if (typeof request.parameters.temperature !== "number") {
          errors["parameters.temperature"] = "Поле должно быть числом";
        } else if (request.parameters.temperature < 0 || request.parameters.temperature > 1) {
          errors["parameters.temperature"] = "Значение должно быть от 0 до 1";
        }
      }
      
      // Проверка maxTokens
      if (request.parameters.maxTokens !== undefined) {
        if (typeof request.parameters.maxTokens !== "number") {
          errors["parameters.maxTokens"] = "Поле должно быть числом";
        } else if (request.parameters.maxTokens < 1 || request.parameters.maxTokens > 100000) {
          errors["parameters.maxTokens"] = "Значение должно быть от 1 до 100000";
        }
      }
      
      // Проверка модели
      if (request.parameters.model !== undefined) {
        const validModels = ["claude-3", "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"];
        if (!validModels.includes(request.parameters.model)) {
          errors["parameters.model"] = `Недопустимое значение. Допустимые значения: ${validModels.join(", ")}`;
        }
      }
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}
```

### 2. Обработка ошибок HTTP-статусов

Клиентское приложение должно корректно обрабатывать различные HTTP-статусы:

```javascript
async function callClaudeApi(endpoint, method, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`,
        "X-Request-ID": generateRequestId()
      },
      body: data ? JSON.stringify(data) : undefined
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Обработка ошибок
      switch (response.status) {
        case 400:
          // Ошибка в запросе
          showValidationErrors(responseData.error);
          break;
        case 401:
          // Ошибка аутентификации
          refreshToken();
          break;
        case 403:
          // Недостаточно прав
          showPermissionError(responseData.error);
          break;
        case 404:
          // Ресурс не найден
          showNotFoundError(responseData.error);
          break;
        case 429:
          // Превышен лимит запросов
          scheduleRetry(responseData.error);
          break;
        case 500:
        case 502:
        case 503:
          // Серверные ошибки
          showServerError(responseData.error);
          break;
      }
      
      throw new ApiError(responseData.error);
    }
    
    return responseData;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}
```

## Рекомендации по обеспечению обратной совместимости

Для обеспечения обратной совместимости при обновлениях API рекомендуется:

1. **Версионирование API**:
   - Использовать версионирование в URL (например, `/api/v1/claude/query`)
   - Поддерживать старые версии API в течение переходного периода

2. **Совместимые изменения**:
   - Добавление новых необязательных полей
   - Добавление новых эндпоинтов
   - Добавление новых ответов с существующими HTTP-кодами
   - Добавление новых HTTP-заголовков

3. **Несовместимые изменения**:
   - Удаление или переименование полей
   - Изменение типа поля
   - Изменение формата даты или времени
   - Изменение HTTP-методов для существующих эндпоинтов

4. **Политика устаревания**:
   - При добавлении новых полей старые должны оставаться поддерживаемыми
   - При удалении полей должно быть предупреждение в ответе
   - Установка четких сроков перехода на новые версии API

## Заключение

Детальное описание форматов запросов и ответов API бэкенд-прокси взаимодействия с Claude API обеспечивает:

1. **Единообразие** - стандартизированный формат для всех эндпоинтов
2. **Предсказуемость** - четкие правила обработки запросов и ответов
3. **Надежность** - понятная система кодов ошибок и их обработка
4. **Масштабируемость** - возможность расширения API без нарушения обратной совместимости
5. **Валидация** - четкие правила для проверки входящих данных

Следование данной спецификации обеспечит надежное взаимодействие клиентского приложения с бэкенд-прокси и Claude API.
