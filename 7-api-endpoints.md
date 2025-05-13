# Спецификация API для бэкенд-прокси взаимодействия с Claude API

## Введение

Данный документ содержит детальную спецификацию API для минималистичного бэкенд-прокси, обеспечивающего безопасное взаимодействие с Claude API. Прокси-сервер является единственным серверным компонентом системы и предназначен для безопасной передачи запросов к Claude API, сохранения API-ключей, обработки асинхронных задач и кэширования результатов.

## Общая архитектура

### Компоненты сервера

1. **HTTP-сервер** - обрабатывает входящие HTTP-запросы к API
2. **Сервис Claude API** - взаимодействует с Claude API
3. **Сервис очередей** - управляет асинхронными задачами
4. **Кэш-сервис** - кэширует идентичные запросы
5. **Сервис аутентификации** - обеспечивает безопасность доступа
6. **Сервис логирования** - ведет журнал операций
7. **Сервис мониторинга** - отслеживает состояние сервера

### Технологический стек

- **Node.js** - основная платформа
- **Express.js** - фреймворк для создания API
- **Redis** (опционально) - для управления очередями и кэширования
- **MongoDB** (опционально) - для хранения истории запросов
- **Jest** - для тестирования
- **Winston** - для логирования
- **Helmet** - для обеспечения безопасности
- **Cors** - для настройки CORS
- **Axios** - для HTTP-запросов к Claude API

### Схема архитектуры

```
[Клиентское приложение]
         │
         ▼
    [Proxy Server]
    ┌─────┬─────┐
    │ API │ Auth│
    ├─────┼─────┤
    │Queue│Cache│
    └──┬──┴──┬──┘
       │     │
       ▼     ▼
[Claude API] [База данных]
```

## API Эндпоинты

### 1. Синхронный запрос к Claude API

#### Эндпоинт

```
POST /api/claude/query
```

#### Описание

Отправляет синхронный запрос к Claude API и возвращает результат. Этот эндпоинт следует использовать для коротких запросов, не требующих длительной обработки.

#### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| prompt | string | Да | Текст запроса к Claude |
| parameters | object | Нет | Параметры для API Claude |
| parameters.temperature | number | Нет | Температура (от 0 до 1), по умолчанию 0.7 |
| parameters.maxTokens | number | Нет | Максимальное количество токенов, по умолчанию 1000 |
| parameters.model | string | Нет | Версия модели Claude, по умолчанию "claude-3" |
| parameters.topP | number | Нет | Top-p значение, по умолчанию 1 |
| parameters.topK | number | Нет | Top-k значение, по умолчанию 0 |
| caching | boolean | Нет | Использовать кэширование, по умолчанию true |
| system | string | Нет | Системный промпт для Claude |

#### Пример запроса

```json
{
  "prompt": "Объясните основные принципы категорического императива Канта",
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "model": "claude-3"
  },
  "caching": true
}
```

#### Ответ - Успех (200 OK)

```json
{
  "id": "response-123456",
  "content": "Категорический императив — это фундаментальный моральный принцип в этике Иммануила Канта...",
  "usage": {
    "promptTokens": 12,
    "completionTokens": 450,
    "totalTokens": 462
  },
  "metadata": {
    "timestamp": "2025-04-15T14:30:00Z",
    "model": "claude-3",
    "cached": false
  }
}
```

#### Ответ - Ошибка (400 Bad Request)

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Параметр prompt обязателен"
  }
}
```

#### Ответ - Ошибка (500 Internal Server Error)

```json
{
  "error": {
    "code": "claude_api_error",
    "message": "Ошибка при взаимодействии с Claude API",
    "details": "Rate limit exceeded"
  }
}
```

#### Заголовки запроса

| Заголовок | Значение | Описание |
|-----------|----------|----------|
| Content-Type | application/json | Тип содержимого запроса |
| Authorization | Bearer &lt;token&gt; | JWT токен для аутентификации |

#### Заголовки ответа

| Заголовок | Значение | Описание |
|-----------|----------|----------|
| Content-Type | application/json | Тип содержимого ответа |
| Cache-Control | max-age=3600 | Директивы кэширования (если используется кэш) |
| X-Request-ID | UUID | Уникальный идентификатор запроса |

### 2. Асинхронный запрос к Claude API (постановка в очередь)

#### Эндпоинт

```
POST /api/claude/queue
```

#### Описание

Ставит запрос к Claude API в очередь для асинхронной обработки. Этот эндпоинт следует использовать для длительных запросов или когда требуется отложенная обработка.

#### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| prompt | string | Да | Текст запроса к Claude |
| parameters | object | Нет | Параметры для API Claude (как в синхронном запросе) |
| priority | string | Нет | Приоритет задачи: "high", "medium", "low". По умолчанию "medium" |
| callbackUrl | string | Нет | URL для вебхука по завершении задачи |
| metadata | object | Нет | Пользовательские метаданные для задачи |

#### Пример запроса

```json
{
  "prompt": "Проведите глубокий анализ философии Канта и сравните ее с философией Гегеля",
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 5000,
    "model": "claude-3-opus"
  },
  "priority": "medium",
  "callbackUrl": "https://myapp.example.com/api/webhooks/claude-callback",
  "metadata": {
    "requestType": "philosophy-comparison",
    "userReference": "project-123"
  }
}
```

#### Ответ - Успех (202 Accepted)

```json
{
  "taskId": "task-123456",
  "status": "queued",
  "position": 3,
  "estimatedStartTime": "2025-04-15T14:35:00Z",
  "metadata": {
    "requestType": "philosophy-comparison",
    "userReference": "project-123"
  }
}
```

#### Ответ - Ошибка (400 Bad Request)

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Параметр prompt обязателен"
  }
}
```

#### Заголовки запроса и ответа

Аналогичны синхронному запросу.

### 3. Проверка статуса асинхронной задачи

#### Эндпоинт

```
GET /api/claude/task/:taskId
```

#### Описание

Проверяет статус ранее поставленной в очередь асинхронной задачи.

#### Параметры URL

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| taskId | string | Да | Идентификатор задачи, полученный при постановке в очередь |

#### Ответ - Задача в очереди (200 OK)

```json
{
  "taskId": "task-123456",
  "status": "queued",
  "position": 2,
  "estimatedStartTime": "2025-04-15T14:35:00Z",
  "metadata": {
    "requestType": "philosophy-comparison",
    "userReference": "project-123"
  }
}
```

#### Ответ - Задача выполняется (200 OK)

```json
{
  "taskId": "task-123456",
  "status": "processing",
  "startTime": "2025-04-15T14:35:00Z",
  "progress": 0.5,
  "estimatedCompletionTime": "2025-04-15T14:40:00Z",
  "metadata": {
    "requestType": "philosophy-comparison",
    "userReference": "project-123"
  }
}
```

#### Ответ - Задача завершена (200 OK)

```json
{
  "taskId": "task-123456",
  "status": "completed",
  "startTime": "2025-04-15T14:35:00Z",
  "completionTime": "2025-04-15T14:40:00Z",
  "metadata": {
    "requestType": "philosophy-comparison",
    "userReference": "project-123"
  },
  "resultAvailable": true
}
```

#### Ответ - Задача завершилась с ошибкой (200 OK)

```json
{
  "taskId": "task-123456",
  "status": "failed",
  "startTime": "2025-04-15T14:35:00Z",
  "failureTime": "2025-04-15T14:36:00Z",
  "error": {
    "code": "claude_api_error",
    "message": "Ошибка при взаимодействии с Claude API",
    "details": "Model temporarily unavailable"
  },
  "metadata": {
    "requestType": "philosophy-comparison",
    "userReference": "project-123"
  }
}
```

#### Ответ - Задача не найдена (404 Not Found)

```json
{
  "error": {
    "code": "task_not_found",
    "message": "Задача с ID task-123456 не найдена"
  }
}
```

### 4. Получение результата асинхронной задачи

#### Эндпоинт

```
GET /api/claude/task/:taskId/result
```

#### Описание

Получает результат выполнения асинхронной задачи.

#### Параметры URL

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| taskId | string | Да | Идентификатор задачи |

#### Ответ - Успех (200 OK)

```json
{
  "taskId": "task-123456",
  "content": "Анализ философии Канта и сравнение с философией Гегеля...",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 3200,
    "totalTokens": 3225
  },
  "metadata": {
    "timestamp": "2025-04-15T14:40:00Z",
    "model": "claude-3-opus",
    "requestType": "philosophy-comparison",
    "userReference": "project-123"
  }
}
```

#### Ответ - Задача ещё не завершена (400 Bad Request)

```json
{
  "error": {
    "code": "result_not_available",
    "message": "Результат задачи недоступен. Текущий статус: processing",
    "taskStatus": "processing"
  }
}
```

#### Ответ - Задача не найдена (404 Not Found)

```json
{
  "error": {
    "code": "task_not_found",
    "message": "Задача с ID task-123456 не найдена"
  }
}
```

### 5. Отмена асинхронной задачи

#### Эндпоинт

```
DELETE /api/claude/task/:taskId
```

#### Описание

Отменяет асинхронную задачу, если она ещё не выполнена.

#### Параметры URL

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| taskId | string | Да | Идентификатор задачи |

#### Ответ - Успех (200 OK)

```json
{
  "taskId": "task-123456",
  "status": "cancelled",
  "message": "Задача успешно отменена"
}
```

#### Ответ - Невозможно отменить (400 Bad Request)

```json
{
  "error": {
    "code": "cannot_cancel",
    "message": "Невозможно отменить задачу. Текущий статус: completed",
    "taskStatus": "completed"
  }
}
```

#### Ответ - Задача не найдена (404 Not Found)

```json
{
  "error": {
    "code": "task_not_found",
    "message": "Задача с ID task-123456 не найдена"
  }
}
```

### 6. Получение списка задач

#### Эндпоинт

```
GET /api/claude/tasks
```

#### Описание

Получает список асинхронных задач с возможностью фильтрации и пагинации.

#### Параметры запроса (query string)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| status | string | Нет | Фильтр по статусу: "queued", "processing", "completed", "failed", "cancelled" |
| page | number | Нет | Номер страницы, по умолчанию 1 |
| limit | number | Нет | Количество записей на странице, по умолчанию 10, максимум 100 |
| sortBy | string | Нет | Поле для сортировки, по умолчанию "createdAt" |
| sortOrder | string | Нет | Порядок сортировки: "asc" или "desc", по умолчанию "desc" |

#### Ответ - Успех (200 OK)

```json
{
  "tasks": [
    {
      "taskId": "task-123456",
      "status": "completed",
      "createdAt": "2025-04-15T14:30:00Z",
      "completedAt": "2025-04-15T14:40:00Z",
      "metadata": {
        "requestType": "philosophy-comparison"
      }
    },
    {
      "taskId": "task-123457",
      "status": "queued",
      "createdAt": "2025-04-15T14:45:00Z",
      "position": 1,
      "metadata": {
        "requestType": "ethics-analysis"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### 7. Проверка состояния сервиса

#### Эндпоинт

```
GET /api/health
```

#### Описание

Проверяет состояние сервиса и его компонентов.

#### Ответ - Все компоненты работают (200 OK)

```json
{
  "status": "healthy",
  "version": "1.0.0",
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
      "latency": 250
    },
    "queue": {
      "status": "healthy",
      "size": 5,
      "processing": 1
    },
    "database": {
      "status": "healthy",
      "connectionPool": 5
    }
  }
}
```

#### Ответ - Некоторые компоненты не работают (503 Service Unavailable)

```json
{
  "status": "degraded",
  "version": "1.0.0",
  "components": {
    "server": {
      "status": "healthy",
      "uptime": 3600
    },
    "claudeApi": {
      "status": "unhealthy",
      "error": "Cannot connect to Claude API",
      "lastSuccessfulConnection": "2025-04-15T13:30:00Z"
    },
    "queue": {
      "status": "healthy",
      "size": 15
    },
    "database": {
      "status": "healthy",
      "connectionPool": 5
    }
  }
}
```

## Механизм аутентификации

### Регистрация клиентского API-ключа

#### Эндпоинт

```
POST /api/auth/register
```

#### Описание

Регистрирует новый API-ключ для клиентского приложения. Требует аутентификации администратора.

#### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| name | string | Да | Название клиентского приложения |
| description | string | Нет | Описание клиентского приложения |
| permissions | array | Нет | Массив разрешений, по умолчанию ["query"] |
| expiresIn | string | Нет | Срок действия в формате ISO 8601 duration, по умолчанию "P1Y" (1 год) |

#### Пример запроса

```json
{
  "name": "Philosophy Concepts SPA",
  "description": "Одностраничное приложение для работы с философскими концепциями",
  "permissions": ["query", "queue"],
  "expiresIn": "P1Y"
}
```

#### Ответ - Успех (201 Created)

```json
{
  "clientId": "client-123456",
  "apiKey": "sk_live_abcdefghijklmnopqrstuvwxyz",
  "name": "Philosophy Concepts SPA",
  "permissions": ["query", "queue"],
  "createdAt": "2025-04-15T14:30:00Z",
  "expiresAt": "2026-04-15T14:30:00Z",
  "message": "Сохраните этот API-ключ! Он больше не будет показан."
}
```

### Аутентификация с помощью API-ключа

Прокси-сервер поддерживает два метода аутентификации:

#### 1. Аутентификация через заголовок

```
Authorization: Bearer sk_live_abcdefghijklmnopqrstuvwxyz
```

#### 2. Аутентификация через параметр запроса

```
/api/claude/query?apiKey=sk_live_abcdefghijklmnopqrstuvwxyz
```

### Получение JWT-токена (опционально)

#### Эндпоинт

```
POST /api/auth/token
```

#### Описание

Получает JWT-токен на основе API-ключа для последующих запросов.

#### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| apiKey | string | Да | API-ключ клиентского приложения |
| expiresIn | string | Нет | Срок действия токена, по умолчанию "1h" |

#### Пример запроса

```json
{
  "apiKey": "sk_live_abcdefghijklmnopqrstuvwxyz",
  "expiresIn": "1h"
}
```

#### Ответ - Успех (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-04-15T15:30:00Z",
  "tokenType": "Bearer"
}
```

## Механизм очередей для асинхронных задач

### Структура задачи

```javascript
{
  id: "task-123456",           // Уникальный ID задачи
  type: "claude-query",        // Тип задачи
  status: "queued",            // Статус: queued, processing, completed, failed, cancelled
  priority: 2,                 // Приоритет: 1 (high), 2 (medium), 3 (low)
  createdAt: "2025-04-15T14:30:00Z", // Время создания
  updatedAt: "2025-04-15T14:30:00Z", // Время последнего обновления
  startedAt: null,             // Время начала выполнения
  completedAt: null,           // Время завершения
  clientId: "client-123456",   // ID клиента
  payload: {                   // Полезная нагрузка
    prompt: "...",             // Текст запроса
    parameters: { ... }        // Параметры
  },
  result: null,                // Результат выполнения (null до завершения)
  error: null,                 // Ошибка (null при отсутствии ошибок)
  callbackUrl: "https://...",  // URL для вебхука
  metadata: { ... },           // Пользовательские метаданные
  retries: 0,                  // Количество повторных попыток
  maxRetries: 3                // Максимальное количество повторных попыток
}
```

### Обработка задачи в очереди

1. **Прием задачи**:
   - Валидация параметров
   - Создание записи задачи
   - Сохранение в базе данных
   - Помещение в очередь

2. **Обработка задачи**:
   - Извлечение из очереди по приоритету
   - Обновление статуса на "processing"
   - Отправка запроса к Claude API
   - Обработка результата или ошибки

3. **Завершение задачи**:
   - Обновление статуса на "completed" или "failed"
   - Сохранение результата или ошибки
   - Отправка уведомления через вебхук (если указан callbackUrl)

4. **Обработка ошибок**:
   - Автоматические повторные попытки для временных ошибок
   - Экспоненциальная задержка между попытками
   - Сохранение информации об ошибках

### Обработка очереди

Сервер использует одну из стратегий обработки очереди:

1. **In-memory очередь с периодическим сохранением** (для простых случаев):
   ```javascript
   {
     highPriority: [task1, task2],
     mediumPriority: [task3, task4, task5],
     lowPriority: [task6]
   }
   ```

2. **Redis-based очередь** (рекомендуется для продакшн):
   ```
   queue:high, queue:medium, queue:low
   ```

3. **Облачные сервисы очередей** (для высокой нагрузки):
   - AWS SQS
   - Google Cloud Tasks
   - Azure Queue Storage

## Кэширование запросов

### Стратегия кэширования

1. **Ключ кэша**: Хеш от prompt + параметров запроса
2. **Время жизни кэша**: Настраиваемое (по умолчанию 24 часа)
3. **Инвалидация кэша**: По времени и принудительно

### Пример реализации

```javascript
async function getCachedResponse(prompt, parameters) {
  // Создание ключа кэша
  const cacheKey = createCacheKey(prompt, parameters);
  
  // Проверка наличия в кэше
  const cachedResponse = await cache.get(cacheKey);
  
  if (cachedResponse) {
    // Добавление метаданных о кэшировании
    cachedResponse.metadata.cached = true;
    return cachedResponse;
  }
  
  // Получение ответа от Claude API
  const response = await claudeApiService.query(prompt, parameters);
  
  // Сохранение в кэш
  await cache.set(cacheKey, response, ttl);
  
  // Добавление метаданных о кэшировании
  response.metadata.cached = false;
  
  return response;
}
```

## Обработка ошибок

### Коды ошибок

| Код | Описание |
|-----|----------|
| invalid_request | Ошибка в параметрах запроса |
| authentication_error | Ошибка аутентификации |
| authorization_error | Отказ в доступе из-за недостаточных прав |
| rate_limit_exceeded | Превышен лимит запросов |
| claude_api_error | Ошибка при взаимодействии с Claude API |
| task_not_found | Задача не найдена |
| result_not_available | Результат задачи недоступен |
| internal_server_error | Внутренняя ошибка сервера |

### Формат ответа с ошибкой

```json
{
  "error": {
    "code": "error_code",
    "message": "Человекочитаемое сообщение об ошибке",
    "details": "Дополнительная информация об ошибке (опционально)",
    "requestId": "req-123456"
  }
}
```

### Обработка HTTP-кодов ответа

| HTTP-код | Описание |
|----------|----------|
| 200 OK | Успешное выполнение запроса |
| 201 Created | Успешное создание ресурса |
| 202 Accepted | Запрос принят в обработку |
| 400 Bad Request | Ошибка в параметрах запроса |
| 401 Unauthorized | Отсутствие или неверные учетные данные |
| 403 Forbidden | Недостаточно прав для выполнения операции |
| 404 Not Found | Ресурс не найден |
| 429 Too Many Requests | Превышен лимит запросов |
| 500 Internal Server Error | Внутренняя ошибка сервера |
| 503 Service Unavailable | Сервис временно недоступен |

## Защита и безопасность

### Rate Limiting

1. **Лимиты по умолчанию**:
   - 60 запросов в минуту для синхронных запросов
   - 20 запросов в минуту для асинхронных задач

2. **Настраиваемые лимиты**:
   - По API-ключу
   - По IP-адресу
   - По типу запроса

3. **Заголовки Rate Limit**:
   ```
   X-RateLimit-Limit: 60
   X-RateLimit-Remaining: 58
   X-RateLimit-Reset: 1618532730
   ```

### Безопасность API-ключей

1. **Хранение ключей**:
   - Хеширование API-ключей в базе данных
   - Использование сильных алгоритмов (bcrypt)

2. **Ротация ключей**:
   - Возможность создания новых ключей
   - Возможность отзыва существующих ключей

3. **Мониторинг использования**:
   - Отслеживание аномального поведения
   - Блокировка при подозрительной активности

### Защита от атак

1. **CORS-защита**:
   - Настройка разрешенных источников
   - Настройка разрешенных методов и заголовков

2. **Защита от CSRF**:
   - Использование токенов для защиты от CSRF-атак

3. **Защита от XSS и инъекций**:
   - Валидация и санитизация входных данных
   - HTTP-заголовки безопасности (Content-Security-Policy, X-XSS-Protection)

## Логирование и мониторинг

### Уровни логирования

1. **ERROR** - ошибки, требующие вмешательства
2. **WARN** - предупреждения, не требующие немедленного вмешательства
3. **INFO** - информационные сообщения
4. **DEBUG** - отладочная информация

### Структура лога

```json
{
  "timestamp": "2025-04-15T14:30:00.123Z",
  "level": "INFO",
  "message": "Successfully processed Claude API request",
  "context": {
    "requestId": "req-123456",
    "clientId": "client-123456",
    "endpoint": "/api/claude/query",
    "responseTime": 350,
    "tokenUsage": {
      "prompt": 12,
      "completion": 450,
      "total": 462
    }
  }
}
```

### Метрики мониторинга

1. **Производительность**:
   - Время ответа API (среднее, медиана, 95-й перцентиль)
   - Количество запросов в секунду
   - Использование CPU и памяти

2. **Очереди**:
   - Размер очереди
   - Время ожидания в очереди
   - Скорость обработки задач

3. **Ошибки**:
   - Количество ошибок по типам
   - Частота повторных попыток
   - Процент успешных запросов

## Рекомендации по развертыванию

### Варианты развертывания

1. **Локальное развертывание**:
   - Node.js + Express
   - Локальный Redis для очереди и кэша
   - Локальная MongoDB для хранения задач

2. **Контейнеризация с Docker**:
   ```
   docker-compose up -d
   ```

3. **Serverless развертывание**:
   - AWS Lambda + API Gateway
   - Google Cloud Functions
   - Azure Functions

### Масштабирование

1. **Горизонтальное масштабирование**:
   - Несколько экземпляров сервера
   - Балансировка нагрузки

2. **Масштабирование очереди**:
   - Разделение на несколько очередей по типам задач
   - Динамическое изменение числа обработчиков

3. **Кэширование**:
   - Распределенный кэш
   - CDN для часто запрашиваемых результатов

### Мониторинг и оповещения

1. **Оповещения о критических ситуациях**:
   - Высокий уровень ошибок
   - Большое время ответа
   - Переполнение очереди

2. **Панели мониторинга**:
   - Grafana + Prometheus
   - New Relic
   - Datadog

## Заключение

Данная спецификация API для бэкенд-прокси обеспечивает:

1. **Безопасность** - защита API-ключей, аутентификация и авторизация
2. **Эффективность** - кэширование и оптимизация запросов
3. **Масштабируемость** - асинхронная обработка через очереди
4. **Надежность** - обработка ошибок и повторные попытки
5. **Мониторинг** - логирование и отслеживание производительности

Предложенная архитектура является минималистичной, но при этом достаточно гибкой для обеспечения всех необходимых функций по безопасному взаимодействию с Claude API.
