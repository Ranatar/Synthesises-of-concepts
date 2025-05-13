# Механизм очередей для асинхронных задач в бэкенд-прокси

## 1. Введение

Механизм очередей является критически важным компонентом бэкенд-прокси для Claude API, позволяющим эффективно обрабатывать асинхронные запросы, обеспечивать отказоустойчивость и масштабируемость системы. Данный документ описывает детальную спецификацию механизма очередей, включая архитектуру, процессы обработки, механизмы обеспечения персистентности и стратегии масштабирования.

### 1.1. Цели и задачи

Основные цели механизма очередей:

1. **Асинхронная обработка запросов** - обработка длительных запросов к Claude API без блокировки клиентского приложения
2. **Управление нагрузкой** - контроль количества одновременных запросов к Claude API
3. **Обеспечение отказоустойчивости** - корректная обработка ошибок и повторные попытки
4. **Персистентность задач** - сохранение состояния задач при перезапуске сервера
5. **Приоритизация запросов** - обработка запросов с учетом их приоритета
6. **Масштабируемость** - возможность горизонтального масштабирования при увеличении нагрузки

## 2. Архитектура механизма очередей

### 2.1. Общая архитектура

Механизм очередей реализуется с использованием распределенной архитектуры, состоящей из следующих компонентов:

1. **Producer (Производитель)** - компонент, принимающий запросы от клиентов и помещающий их в очередь
2. **Queue (Очередь)** - структура данных для хранения задач, ожидающих обработки
3. **Worker (Исполнитель)** - компонент, извлекающий задачи из очереди и выполняющий их
4. **Task Storage (Хранилище задач)** - компонент для хранения состояния и результатов задач
5. **Scheduler (Планировщик)** - компонент для управления процессом выполнения задач

![Архитектура очередей](https://mermaid.ink/img/pako:eNqNVMtu2zAQ_BWCJwcobMVJnKK-JEWaHlKgRYsCvRSURFtEZFEgKceF4X8vKcqWZDnowRetZnZnhkv6lWWyQJZnHdx4DQ0IrR2MYNCJqv4QNVS-A93ZZxM4l60sNWyc-K3UEA5Sq2qy2XkD9bvl1vXaghK9RaGFvDfQokLrlTJQQdADuEp1sD8EiXWjLOygP01sDDxc_XhafQEvG1vfoxjlrRrYKCW29QVqGTtEfCwKaaC9WCRIi0EV2v1F8bINHNc4BLuP0WGytVCjbk2FEtJ-TA1uRKf8IqmZcVgdBlAu1VnSE0O6ldCnc2OzDCwcBMSBDvZwl6L5v1wOxLPsNOzYgVF1lMXIrjXbSJO53VBc8g_xzRTXnb_Z2YHxvJVzJwOlwXm7iw0MzlGMzkPRSgxbbG3eKGWrQYzqBa_a6P4n9uJgurEtZGf5afYYQ2icQeVfXNfK52NcGxhsCwrxVWCx5ZvJchCRBCaHj_eXw4M_Z8yZ5yzAHJQJc8P4iDXQSgzPkZgzdkSanFvLZHMijAcbvvYoUgdpzxjJTYhwKS7ZSZbHEy_5MR_zkzE_G_PzMQ_4hIdL1LwN2kGprsTmRMQDCzyOv5EoPF1Zy1Y1GmPVcgR6vJLz-Tk7i29SiYXGaW9HbvmNdXk-SuZ0miXZqBFVJ29vYnI-iWOGFHylrZKNLN55dRcaHFsEXD8edPYXDl9I9A)

### 2.2. Компоненты системы

#### 2.2.1. Producer (Производитель)

Producer отвечает за:
- Валидацию входящих запросов
- Создание задач и присвоение им уникальных идентификаторов
- Помещение задач в очередь с учетом приоритета
- Обновление метаданных задачи в хранилище
- Возврат идентификатора задачи клиенту

#### 2.2.2. Queue (Очередь)

Очередь организована с учетом приоритетов задач:
- **High Priority Queue** - для задач с высоким приоритетом
- **Medium Priority Queue** - для задач со средним приоритетом (по умолчанию)
- **Low Priority Queue** - для задач с низким приоритетом

Очередь обеспечивает:
- Атомарные операции добавления и извлечения
- Персистентность для предотвращения потери данных
- Управление повторными попытками
- Отслеживание состояния задач

#### 2.2.3. Worker (Исполнитель)

Worker отвечает за:
- Извлечение задач из очереди с учетом приоритета
- Обработку задач и взаимодействие с Claude API
- Сохранение результатов или ошибок в хранилище
- Обработку исключений и повторные попытки
- Управление состоянием задачи

#### 2.2.4. Task Storage (Хранилище задач)

Хранилище задач обеспечивает:
- Сохранение метаданных задач
- Сохранение промежуточных состояний
- Сохранение результатов выполнения
- Сохранение информации об ошибках
- Статистику выполнения задач

#### 2.2.5. Scheduler (Планировщик)

Планировщик отвечает за:
- Управление количеством активных Workers
- Распределение ресурсов между очередями разных приоритетов
- Мониторинг состояния системы
- Обнаружение и обработку зависших задач
- Планирование повторных попыток

## 3. Структура задачи

### 3.1. Базовая структура задачи

```javascript
{
  id: "task-123e4567-e89b-12d3-a456-426614174000", // Уникальный идентификатор задачи
  type: "claude-query",                            // Тип задачи
  status: "queued",                                // Статус задачи
  priority: "medium",                              // Приоритет: "high", "medium", "low"
  
  // Метаданные времени
  createdAt: "2025-04-15T14:30:00Z",              // Время создания
  updatedAt: "2025-04-15T14:30:00Z",              // Время последнего обновления
  startedAt: null,                                 // Время начала выполнения
  completedAt: null,                               // Время завершения
  
  // Данные клиента
  clientId: "client-123456",                       // ID клиента
  requestId: "req-123456",                         // ID запроса (для трассировки)
  
  // Полезная нагрузка
  payload: {
    prompt: "Объясните основные принципы...",      // Текст запроса к Claude
    parameters: {                                  // Параметры запроса
      temperature: 0.7,
      maxTokens: 1000,
      model: "claude-3-opus"
    },
    system: "Вы - эксперт по философии..."         // Системный промпт
  },
  
  // Результат выполнения (заполняется после завершения)
  result: null,
  
  // Информация об ошибке (если есть)
  error: null,
  
  // Данные для обработки ошибок
  retries: 0,                                      // Количество повторных попыток
  maxRetries: 3,                                   // Максимальное количество повторных попыток
  nextRetryAt: null,                               // Время следующей попытки
  
  // Данные для вебхука
  callbackUrl: "https://example.com/webhook",      // URL для вебхука
  callbackAttempts: 0,                             // Количество попыток вызова вебхука
  maxCallbackAttempts: 3,                          // Максимальное количество попыток
  
  // Пользовательские метаданные
  metadata: {
    requestType: "philosophy-comparison",
    userReference: "project-123",
    tags: ["ethics", "philosophy", "comparison"]
  }
}
```

### 3.2. Жизненный цикл задачи

Задача проходит через следующие состояния:

1. **created** - задача создана, но еще не добавлена в очередь
2. **queued** - задача находится в очереди и ожидает обработки
3. **processing** - задача извлечена из очереди и обрабатывается
4. **completed** - задача успешно выполнена
5. **failed** - задача завершилась с ошибкой
6. **cancelled** - задача отменена пользователем
7. **retrying** - задача ожидает повторной попытки
8. **dead** - задача не может быть выполнена после всех повторных попыток

```
┌─────────┐     ┌────────┐     ┌────────────┐     ┌───────────┐
│ created │ ──► │ queued │ ──► │ processing │ ──► │ completed │
└─────────┘     └────────┘     └────────────┘     └───────────┘
                    ▲                │
                    │                │
                    │                ▼
                ┌────────┐      ┌────────┐      ┌────────┐
                │retrying│ ◄──  │ failed │  ──► │  dead  │
                └────────┘      └────────┘      └────────┘
                                    ▲
                                    │
                                    │
                              ┌──────────┐
                              │cancelled │
                              └──────────┘
```

## 4. Реализация механизма очередей

Рассмотрим три варианта реализации очередей, подходящих для разных сценариев использования.

### 4.1. In-memory очередь с периодическим сохранением

Самый простой вариант для небольших проектов или разработки.

#### 4.1.1. Структура в памяти

```javascript
const queues = {
  high: [],    // Очередь с высоким приоритетом
  medium: [],  // Очередь со средним приоритетом
  low: []      // Очередь с низким приоритетом
};

const taskMap = new Map(); // Хранение задач по ID
```

#### 4.1.2. Основные операции

```javascript
// Добавление задачи в очередь
function enqueueTask(task) {
  const priority = task.priority || 'medium';
  
  // Сохранение задачи в Map для быстрого доступа по ID
  taskMap.set(task.id, task);
  
  // Добавление в соответствующую очередь
  queues[priority].push(task.id);
  
  // Периодическое сохранение состояния в файл
  schedulePersistence();
  
  return task.id;
}

// Извлечение задачи из очереди
function dequeueTask() {
  // Приоритет очередей: high > medium > low
  for (const priority of ['high', 'medium', 'low']) {
    if (queues[priority].length > 0) {
      const taskId = queues[priority].shift();
      const task = taskMap.get(taskId);
      
      if (task) {
        task.status = 'processing';
        task.startedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
        
        // Периодическое сохранение состояния в файл
        schedulePersistence();
        
        return task;
      }
    }
  }
  
  return null; // Все очереди пусты
}

// Сохранение состояния в файл
function persistToFile() {
  const state = {
    queues,
    tasks: Array.from(taskMap.values())
  };
  
  fs.writeFileSync(
    'queue-state.json',
    JSON.stringify(state, null, 2),
    'utf8'
  );
}

// Загрузка состояния из файла
function loadFromFile() {
  try {
    if (fs.existsSync('queue-state.json')) {
      const data = fs.readFileSync('queue-state.json', 'utf8');
      const state = JSON.parse(data);
      
      // Восстановление очередей
      Object.assign(queues, state.queues);
      
      // Восстановление задач
      for (const task of state.tasks) {
        taskMap.set(task.id, task);
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error loading queue state:', error);
  }
  
  return false;
}

// Планирование сохранения состояния
let persistenceTimeout = null;
function schedulePersistence() {
  if (persistenceTimeout) {
    clearTimeout(persistenceTimeout);
  }
  
  persistenceTimeout = setTimeout(() => {
    persistToFile();
    persistenceTimeout = null;
  }, 1000); // Сохранение через 1 секунду после последнего изменения
}
```

#### 4.1.3. Преимущества и недостатки

**Преимущества:**
- Простота реализации
- Высокая производительность операций в памяти
- Минимальные внешние зависимости

**Недостатки:**
- Потеря данных при аварийном завершении работы
- Не подходит для распределенной архитектуры
- Ограниченная масштабируемость

### 4.2. Redis-based очередь

Более надежный вариант для продакшн-окружений с использованием Redis.

#### 4.2.1. Структура данных в Redis

```
# Списки для очередей разных приоритетов
queue:high    - список IDs задач высокого приоритета
queue:medium  - список IDs задач среднего приоритета
queue:low     - список IDs задач низкого приоритета

# Хеш-таблицы для хранения задач
task:{id}     - хеш-таблица с данными задачи

# Множества для отслеживания состояний
tasks:queued    - множество IDs задач в очереди
tasks:processing - множество IDs обрабатываемых задач
tasks:completed - множество IDs выполненных задач
tasks:failed    - множество IDs задач с ошибками

# Сортированные множества для планирования повторных попыток
tasks:retry     - сортированное множество (score = время повторной попытки)
```

#### 4.2.2. Основные операции

```javascript
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Добавление задачи в очередь
async function enqueueTask(task) {
  const priority = task.priority || 'medium';
  const taskId = task.id;
  
  // Сохранение задачи в Redis
  await redis.hset(`task:${taskId}`, {
    id: taskId,
    type: task.type,
    status: 'queued',
    priority,
    createdAt: task.createdAt,
    updatedAt: new Date().toISOString(),
    clientId: task.clientId,
    requestId: task.requestId,
    payload: JSON.stringify(task.payload),
    metadata: JSON.stringify(task.metadata || {}),
    callbackUrl: task.callbackUrl || '',
    maxRetries: task.maxRetries || 3,
    retries: 0
  });
  
  // Добавление в соответствующую очередь
  await redis.lpush(`queue:${priority}`, taskId);
  
  // Добавление в множество задач в очереди
  await redis.sadd('tasks:queued', taskId);
  
  return taskId;
}

// Извлечение задачи из очереди
async function dequeueTask() {
  // Использование транзакции для атомарного извлечения задачи
  const pipeline = redis.pipeline();
  
  // Приоритет очередей: high > medium > low
  for (const priority of ['high', 'medium', 'low']) {
    pipeline.rpop(`queue:${priority}`);
  }
  
  const results = await pipeline.exec();
  let taskId = null;
  
  // Поиск первой непустой очереди
  for (const [index, [err, id]] of results.entries()) {
    if (err) continue;
    if (id) {
      taskId = id;
      break;
    }
  }
  
  if (!taskId) return null; // Все очереди пусты
  
  // Получение данных задачи
  const taskData = await redis.hgetall(`task:${taskId}`);
  
  if (!taskData || !taskData.id) return null;
  
  // Парсинг JSON полей
  taskData.payload = JSON.parse(taskData.payload);
  taskData.metadata = JSON.parse(taskData.metadata);
  
  // Обновление статуса задачи
  const now = new Date().toISOString();
  await redis.hset(`task:${taskId}`, {
    status: 'processing',
    startedAt: now,
    updatedAt: now
  });
  
  // Обновление множеств для отслеживания состояний
  await redis.smove('tasks:queued', 'tasks:processing', taskId);
  
  return taskData;
}

// Обновление статуса задачи
async function updateTaskStatus(taskId, status, data = {}) {
  const now = new Date().toISOString();
  const updates = {
    status,
    updatedAt: now,
    ...data
  };
  
  // Обновление полей задачи
  await redis.hset(`task:${taskId}`, updates);
  
  // Обновление множеств состояний
  const oldStatus = await redis.hget(`task:${taskId}`, 'status');
  
  if (oldStatus) {
    await redis.srem(`tasks:${oldStatus}`, taskId);
  }
  
  await redis.sadd(`tasks:${status}`, taskId);
  
  return true;
}

// Сохранение результата выполнения задачи
async function completeTask(taskId, result) {
  return updateTaskStatus(taskId, 'completed', {
    result: JSON.stringify(result),
    completedAt: new Date().toISOString()
  });
}

// Сохранение информации об ошибке
async function failTask(taskId, error, shouldRetry = true) {
  const task = await redis.hgetall(`task:${taskId}`);
  
  if (!task || !task.id) return false;
  
  const retries = parseInt(task.retries || 0, 10);
  const maxRetries = parseInt(task.maxRetries || 3, 10);
  
  // Проверка, нужно ли делать повторную попытку
  if (shouldRetry && retries < maxRetries) {
    // Расчет времени следующей попытки с экспоненциальной задержкой
    const delaySeconds = Math.pow(2, retries) * 30; // 30 сек, 1 мин, 2 мин, 4 мин...
    const nextRetryAt = new Date(Date.now() + delaySeconds * 1000).toISOString();
    
    // Обновление статуса задачи
    await updateTaskStatus(taskId, 'retrying', {
      error: JSON.stringify(error),
      retries: retries + 1,
      nextRetryAt
    });
    
    // Добавление в сортированное множество для повторных попыток
    await redis.zadd('tasks:retry', Date.now() + delaySeconds * 1000, taskId);
    
    return true;
  }
  
  // Если повторные попытки не нужны или исчерпаны
  return updateTaskStatus(taskId, 'failed', {
    error: JSON.stringify(error),
    failedAt: new Date().toISOString()
  });
}

// Перемещение задач, ожидающих повторной попытки, обратно в очередь
async function processRetryTasks() {
  const now = Date.now();
  
  // Получение задач, для которых пора делать повторную попытку
  const taskIds = await redis.zrangebyscore('tasks:retry', 0, now);
  
  if (taskIds.length === 0) return 0;
  
  // Удаление задач из сортированного множества
  await redis.zremrangebyscore('tasks:retry', 0, now);
  
  // Обработка каждой задачи
  for (const taskId of taskIds) {
    const task = await redis.hgetall(`task:${taskId}`);
    
    if (!task || !task.id) continue;
    
    // Обновление статуса задачи и добавление обратно в очередь
    await updateTaskStatus(taskId, 'queued');
    await redis.lpush(`queue:${task.priority || 'medium'}`, taskId);
  }
  
  return taskIds.length;
}
```

#### 4.2.3. Преимущества и недостатки

**Преимущества:**
- Персистентность данных
- Атомарные операции
- Поддержка распределенной архитектуры
- Хорошая масштабируемость

**Недостатки:**
- Зависимость от внешнего сервиса (Redis)
- Дополнительные накладные расходы на сериализацию/десериализацию
- Необходимость настройки и мониторинга Redis

### 4.3. Облачные сервисы очередей

Для высоконагруженных приложений оптимальным решением являются управляемые облачные сервисы.

#### 4.3.1. AWS SQS + DynamoDB

```javascript
const AWS = require('aws-sdk');

// Инициализация сервисов AWS
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Создание задачи и добавление в очередь
async function enqueueTask(task) {
  const taskId = task.id;
  const priority = task.priority || 'medium';
  
  // Определение URL очереди в зависимости от приоритета
  const queueUrl = getQueueUrlByPriority(priority);
  
  // Сохранение задачи в DynamoDB
  await dynamodb.put({
    TableName: 'Tasks',
    Item: {
      id: taskId,
      type: task.type,
      status: 'queued',
      priority,
      createdAt: task.createdAt,
      updatedAt: new Date().toISOString(),
      clientId: task.clientId,
      requestId: task.requestId,
      payload: task.payload,
      metadata: task.metadata || {},
      callbackUrl: task.callbackUrl || '',
      maxRetries: task.maxRetries || 3,
      retries: 0
    }
  }).promise();
  
  // Отправка сообщения в SQS
  await sqs.sendMessage({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ taskId }),
    DelaySeconds: 0
  }).promise();
  
  return taskId;
}

// Получение задачи из очереди
async function pollForTasks() {
  // Приоритет очередей: high > medium > low
  for (const priority of ['high', 'medium', 'low']) {
    const queueUrl = getQueueUrlByPriority(priority);
    
    try {
      // Получение сообщения из очереди
      const response = await sqs.receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 300, // 5 минут
        WaitTimeSeconds: 5 // Long-polling
      }).promise();
      
      if (response.Messages && response.Messages.length > 0) {
        const message = response.Messages[0];
        const { taskId } = JSON.parse(message.Body);
        
        // Получение данных задачи из DynamoDB
        const taskData = await getTaskById(taskId);
        
        if (!taskData) {
          // Удаление сообщения из очереди, если задача не найдена
          await sqs.deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle
          }).promise();
          
          continue;
        }
        
        // Обновление статуса задачи
        const now = new Date().toISOString();
        await dynamodb.update({
          TableName: 'Tasks',
          Key: { id: taskId },
          UpdateExpression: 'SET #status = :status, startedAt = :startedAt, updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':status': 'processing',
            ':startedAt': now,
            ':updatedAt': now
          }
        }).promise();
        
        // Задача найдена и обработана
        return {
          task: taskData,
          message: {
            receiptHandle: message.ReceiptHandle,
            queueUrl
          }
        };
      }
    } catch (error) {
      console.error(`Error polling ${priority} queue:`, error);
    }
  }
  
  // Задач не найдено
  return null;
}

// Получение задачи по ID
async function getTaskById(taskId) {
  try {
    const response = await dynamodb.get({
      TableName: 'Tasks',
      Key: { id: taskId }
    }).promise();
    
    return response.Item;
  } catch (error) {
    console.error('Error getting task:', error);
    return null;
  }
}

// Завершение обработки задачи
async function completeTask(taskId, result, message) {
  // Обновление задачи в DynamoDB
  await dynamodb.update({
    TableName: 'Tasks',
    Key: { id: taskId },
    UpdateExpression: 'SET #status = :status, result = :result, completedAt = :completedAt, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'completed',
      ':result': result,
      ':completedAt': new Date().toISOString(),
      ':updatedAt': new Date().toISOString()
    }
  }).promise();
  
  // Удаление сообщения из очереди
  await sqs.deleteMessage({
    QueueUrl: message.queueUrl,
    ReceiptHandle: message.receiptHandle
  }).promise();
  
  return true;
}

// Обработка ошибки выполнения задачи
async function failTask(taskId, error, message, shouldRetry = true) {
  const taskData = await getTaskById(taskId);
  
  if (!taskData) return false;
  
  const retries = taskData.retries || 0;
  const maxRetries = taskData.maxRetries || 3;
  
  // Проверка, нужно ли делать повторную попытку
  if (shouldRetry && retries < maxRetries) {
    // Расчет задержки с экспоненциальной отсрочкой
    const delaySeconds = Math.pow(2, retries) * 30;
    
    // Обновление задачи в DynamoDB
    await dynamodb.update({
      TableName: 'Tasks',
      Key: { id: taskId },
      UpdateExpression: 'SET #status = :status, error = :error, retries = :retries, nextRetryAt = :nextRetryAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'retrying',
        ':error': error,
        ':retries': retries + 1,
        ':nextRetryAt': new Date(Date.now() + delaySeconds * 1000).toISOString(),
        ':updatedAt': new Date().toISOString()
      }
    }).promise();
    
    // Удаление текущего сообщения из очереди
    await sqs.deleteMessage({
      QueueUrl: message.queueUrl,
      ReceiptHandle: message.receiptHandle
    }).promise();
    
    // Добавление нового сообщения с задержкой
    await sqs.sendMessage({
      QueueUrl: getQueueUrlByPriority(taskData.priority || 'medium'),
      MessageBody: JSON.stringify({ taskId }),
      DelaySeconds: delaySeconds
    }).promise();
    
    return true;
  }
  
  // Если повторные попытки не нужны или исчерпаны
  await dynamodb.update({
    TableName: 'Tasks',
    Key: { id: taskId },
    UpdateExpression: 'SET #status = :status, error = :error, failedAt = :failedAt, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'failed',
      ':error': error,
      ':failedAt': new Date().toISOString(),
      ':updatedAt': new Date().toISOString()
    }
  }).promise();
  
  // Удаление сообщения из очереди
  await sqs.deleteMessage({
    QueueUrl: message.queueUrl,
    ReceiptHandle: message.receiptHandle
  }).promise();
  
  return true;
}

// Получение URL очереди по приоритету
function getQueueUrlByPriority(priority) {
  const queueUrls = {
    high: process.env.SQS_HIGH_PRIORITY_QUEUE_URL,
    medium: process.env.SQS_MEDIUM_PRIORITY_QUEUE_URL,
    low: process.env.SQS_LOW_PRIORITY_QUEUE_URL
  };
  
  return queueUrls[priority] || queueUrls.medium;
}
```

#### 4.3.2. Преимущества и недостатки

**Преимущества:**
- Масштабируемость и надежность облачной инфраструктуры
- Автоматическое резервное копирование и отказоустойчивость
- Возможность точной настройки производительности и стоимости
- Встроенные механизмы мониторинга и логирования

**Недостатки:**
- Зависимость от конкретного облачного провайдера
- Более высокая стоимость при больших объемах данных
- Необходимость управления учетными данными облачного провайдера

## 5. Логика Worker-процессов

### 5.1. Основная логика обработки задач

```javascript
async function startWorker() {
  console.log('Starting worker process');
  
  // Бесконечный цикл обработки задач
  while (true) {
    try {
      // Ожидание доступной задачи
      const task = await dequeueTask();
      
      if (!task) {
        // Если нет задач, ждем небольшое время
        await sleep(1000);
        continue;
      }
      
      console.log(`Processing task ${task.id}`);
      
      // Обработка задачи
      const result = await processTask(task);
      
      // Сохранение результата
      await completeTask(task.id, result);
      
      // Вызов вебхука, если указан
      if (task.callbackUrl) {
        await sendWebhook(task.id, task.callbackUrl, {
          status: 'completed',
          taskId: task.id,
          result
        });
      }
    } catch (error) {
      console.error('Error in worker loop:', error);
      
      // Пауза перед следующей итерацией в случае ошибки
      await sleep(5000);
    }
  }
}

// Основная логика обработки задачи
async function processTask(task) {
  try {
    // Проверка типа задачи
    if (task.type !== 'claude-query') {
      throw new Error(`Unsupported task type: ${task.type}`);
    }
    
    // Получение API-ключа Claude из защищенного хранилища
    const claudeApiKey = await getClaudeApiKey();
    
    // Извлечение параметров из payload
    const { prompt, parameters, system } = task.payload;
    
    // Подготовка запроса к Claude API
    const requestOptions = {
      model: parameters.model || 'claude-3',
      prompt,
      max_tokens: parameters.maxTokens || 1000,
      temperature: parameters.temperature || 0.7
    };
    
    if (system) {
      requestOptions.system = system;
    }
    
    // Вызов Claude API
    const claudeResponse = await callClaudeApi(claudeApiKey, requestOptions);
    
    // Формирование результата
    return {
      content: claudeResponse.content,
      usage: claudeResponse.usage,
      metadata: {
        timestamp: new Date().toISOString(),
        model: requestOptions.model,
        finishReason: claudeResponse.finishReason
      }
    };
  } catch (error) {
    console.error(`Error processing task ${task.id}:`, error);
    
    // Определение типа ошибки
    const isRetryable = isRetryableError(error);
    
    // Сохранение информации об ошибке
    await failTask(task.id, {
      message: error.message,
      code: error.code || 'task_processing_error',
      details: error.details || error.stack
    }, isRetryable);
    
    // Вызов вебхука с информацией об ошибке, если указан
    if (task.callbackUrl) {
      await sendWebhook(task.id, task.callbackUrl, {
        status: 'failed',
        taskId: task.id,
        error: {
          message: error.message,
          code: error.code || 'task_processing_error'
        }
      });
    }
    
    throw error;
  }
}

// Проверка, можно ли повторить попытку для данной ошибки
function isRetryableError(error) {
  // Коды ошибок, для которых стоит повторить попытку
  const retryableCodes = [
    'rate_limit_exceeded',
    'timeout',
    'connection_error',
    'service_unavailable',
    'internal_server_error'
  ];
  
  return retryableCodes.includes(error.code) || error.message.includes('timeout') || error.message.includes('rate limit');
}

// Функция для вызова Claude API
async function callClaudeApi(apiKey, requestOptions) {
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      requestOptions,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000 // 30 секунд таймаут
      }
    );
    
    return response.data;
  } catch (error) {
    // Преобразование ошибок Axios в более понятный формат
    if (error.response) {
      // Ответ от сервера с кодом ошибки
      const apiError = new Error(`Claude API error: ${error.response.status} ${error.response.statusText}`);
      apiError.code = error.response.data.error?.type || `claude_api_${error.response.status}`;
      apiError.details = error.response.data;
      
      throw apiError;
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      const connectionError = new Error('Connection error: no response from Claude API');
      connectionError.code = 'connection_error';
      connectionError.details = { request: error.request };
      
      throw connectionError;
    } else {
      // Ошибка при настройке запроса
      const setupError = new Error(`Request setup error: ${error.message}`);
      setupError.code = 'request_setup_error';
      
      throw setupError;
    }
  }
}

// Функция для отправки вебхука
async function sendWebhook(taskId, url, data) {
  const axios = require('axios');
  
  try {
    await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Task-ID': taskId
      },
      timeout: 10000 // 10 секунд таймаут
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending webhook for task ${taskId}:`, error);
    
    // Добавление в очередь повторных попыток для вебхука
    await scheduleWebhookRetry(taskId, url, data);
    
    return false;
  }
}

// Служебная функция для паузы
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 5.2. Режим множественных Workers

Для повышения производительности можно запустить несколько Worker-процессов.

```javascript
const cluster = require('cluster');
const os = require('os');

// Количество процессов (можно настроить в зависимости от нагрузки)
const numWorkers = process.env.NUM_WORKERS || Math.max(1, os.cpus().length - 1);

if (cluster.isMaster) {
  console.log(`Master process started. Starting ${numWorkers} workers...`);
  
  // Запуск Worker-процессов
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  // Обработка завершения Worker
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    console.log('Starting a new worker...');
    cluster.fork();
  });
  
  // Запуск процесса для обработки повторных попыток
  startRetryProcessor();
} else {
  // Код Worker-процесса
  startWorker();
}

// Процесс для обработки повторных попыток
async function startRetryProcessor() {
  console.log('Starting retry processor');
  
  while (true) {
    try {
      // Перемещение задач, ожидающих повторной попытки, обратно в очередь
      const processedCount = await processRetryTasks();
      
      console.log(`Processed ${processedCount} retry tasks`);
      
      // Пауза перед следующей проверкой
      await sleep(10000); // 10 секунд
    } catch (error) {
      console.error('Error in retry processor:', error);
      await sleep(30000); // 30 секунд пауза при ошибке
    }
  }
}
```

## 6. Обработка ошибок и повторные попытки

### 6.1. Стратегия повторных попыток

```javascript
// Конфигурация стратегии повторных попыток
const retryConfig = {
  // Базовая задержка между попытками (в миллисекундах)
  baseDelay: 30000, // 30 секунд
  
  // Максимальная задержка между попытками (в миллисекундах)
  maxDelay: 3600000, // 1 час
  
  // Фактор для экспоненциальной задержки
  factor: 2,
  
  // Случайный множитель для предотвращения "грозди запросов"
  jitter: 0.2, // 20% случайности
  
  // Максимальное количество повторных попыток по умолчанию
  maxRetries: 3,
  
  // Коды ошибок, для которых следует делать повторные попытки
  retryableCodes: [
    'rate_limit_exceeded',
    'timeout',
    'connection_error',
    'service_unavailable',
    'internal_server_error',
    'claude_api_429',
    'claude_api_500',
    'claude_api_502',
    'claude_api_503',
    'claude_api_504'
  ]
};

// Расчет задержки для повторной попытки
function calculateRetryDelay(retries) {
  // Экспоненциальная задержка с множителем
  const delay = Math.min(
    retryConfig.maxDelay,
    retryConfig.baseDelay * Math.pow(retryConfig.factor, retries)
  );
  
  // Добавление случайности для предотвращения "грозди запросов"
  const jitter = 1 - retryConfig.jitter + (Math.random() * retryConfig.jitter * 2);
  
  return Math.floor(delay * jitter);
}

// Проверка, нужно ли делать повторную попытку для данной ошибки
function shouldRetry(error, retries, maxRetries) {
  if (retries >= maxRetries) {
    return false;
  }
  
  if (error.code && retryConfig.retryableCodes.includes(error.code)) {
    return true;
  }
  
  // Проверка сообщения об ошибке, если код не определен
  const retryableMessages = [
    'timeout',
    'connection reset',
    'too many requests',
    'rate limit',
    'temporarily unavailable',
    'internal server error',
    'bad gateway',
    'service unavailable',
    'gateway timeout'
  ];
  
  return retryableMessages.some(msg => 
    error.message && error.message.toLowerCase().includes(msg)
  );
}
```

### 6.2. Обработка сложных ошибок

```javascript
// Обработка ошибок с различной стратегией восстановления
async function handleTaskError(task, error) {
  console.error(`Error processing task ${task.id}:`, error);
  
  // Получение текущего количества повторных попыток
  const retries = task.retries || 0;
  const maxRetries = task.maxRetries || retryConfig.maxRetries;
  
  // Определение стратегии восстановления в зависимости от типа ошибки
  if (error.code === 'claude_api_401') {
    // Ошибка аутентификации - необходимо проверить API-ключ
    console.error('Authentication error with Claude API. Check API key validity.');
    
    // Отметка задачи как неудачной без повторных попыток
    await failTask(task.id, {
      message: 'Authentication error with Claude API',
      code: 'authentication_error',
      details: error.details
    }, false);
    
    // Отправка уведомления администраторам
    await sendAdminNotification('API key validation failure', {
      taskId: task.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    return false;
  }
  
  if (error.code === 'claude_api_400' && error.details?.error?.type === 'invalid_request_error') {
    // Ошибка в параметрах запроса - повторные попытки не помогут
    await failTask(task.id, {
      message: 'Invalid request to Claude API',
      code: 'invalid_request',
      details: error.details
    }, false);
    
    return false;
  }
  
  // Для остальных ошибок определяем, нужна ли повторная попытка
  if (shouldRetry(error, retries, maxRetries)) {
    const delay = calculateRetryDelay(retries);
    const nextRetryAt = new Date(Date.now() + delay);
    
    console.log(`Scheduling retry #${retries + 1} for task ${task.id} at ${nextRetryAt.toISOString()}`);
    
    // Обновление информации о задаче и планирование повторной попытки
    await updateTaskStatus(task.id, 'retrying', {
      error: JSON.stringify({
        message: error.message,
        code: error.code || 'task_processing_error',
        details: error.details || null
      }),
      retries: retries + 1,
      nextRetryAt: nextRetryAt.toISOString(),
      lastError: error.message
    });
    
    // Добавление задачи в очередь повторных попыток
    await addToRetryQueue(task.id, delay);
    
    return true;
  }
  
  // Если повторные попытки не нужны или исчерпаны
  await failTask(task.id, {
    message: error.message,
    code: error.code || 'task_processing_error',
    details: error.details || error.stack
  }, false);
  
  // Отправка уведомления о критической ошибке
  if (retries >= maxRetries) {
    await sendAdminNotification('Task failed after maximum retries', {
      taskId: task.id,
      error: error.message,
      retries,
      timestamp: new Date().toISOString()
    });
  }
  
  return false;
}
```

## 7. Масштабирование и оптимизация

### 7.1. Стратегии масштабирования

#### 7.1.1. Вертикальное масштабирование

Для небольших и средних нагрузок можно использовать вертикальное масштабирование:

- Увеличение ресурсов сервера (CPU, RAM)
- Оптимизация кода и структур данных
- Использование планировщика задач для эффективного распределения ресурсов

#### 7.1.2. Горизонтальное масштабирование

Для высоких нагрузок рекомендуется горизонтальное масштабирование:

```javascript
// Пример использования PM2 для управления несколькими процессами
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'queue-producer',
      script: './producer.js',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'queue-worker',
      script: './worker.js',
      instances: 'max', // Использование всех доступных CPU
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'queue-scheduler',
      script: './scheduler.js',
      instances: 1, // Только один процесс для планировщика
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

#### 7.1.3. Микросервисная архитектура

Для крупных систем рекомендуется микросервисная архитектура:

- Отдельные сервисы для Producer, Worker и Scheduler
- Использование Kubernetes для оркестрации контейнеров
- Автоматическое масштабирование на основе нагрузки

```yaml
# Пример Kubernetes Deployment для Worker
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-queue-worker
spec:
  replicas: 5
  selector:
    matchLabels:
      app: claude-queue-worker
  template:
    metadata:
      labels:
        app: claude-queue-worker
    spec:
      containers:
      - name: worker
        image: my-registry/claude-queue-worker:latest
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        env:
        - name: REDIS_HOST
          value: redis-service
        - name: REDIS_PORT
          value: "6379"
        - name: CLAUDE_API_KEY
          valueFrom:
            secretKeyRef:
              name: claude-api-keys
              key: api-key
---
# Автомасштабирование
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: claude-queue-worker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: claude-queue-worker
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 7.2. Оптимизация производительности

#### 7.2.1. Кэширование результатов

Для повышения производительности и снижения затрат на API можно реализовать кэширование одинаковых запросов:

```javascript
const crypto = require('crypto');

// Генерация ключа кэша на основе запроса
function generateCacheKey(prompt, parameters) {
  // Создание строки для хеширования
  const data = JSON.stringify({
    prompt,
    model: parameters.model || 'claude-3',
    temperature: parameters.temperature || 0.7,
    maxTokens: parameters.maxTokens || 1000,
    // Не включаем систему промпта, если его нет
    ...(parameters.system && { system: parameters.system })
  });
  
  // Создание хеша
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Проверка кэша перед отправкой запроса к Claude API
async function getOrCallClaudeApi(prompt, parameters) {
  // Генерация ключа кэша
  const cacheKey = generateCacheKey(prompt, parameters);
  
  // Проверка наличия в кэше
  const cachedResult = await redis.get(`claude_cache:${cacheKey}`);
  
  if (cachedResult) {
    console.log(`Cache hit for key ${cacheKey}`);
    return JSON.parse(cachedResult);
  }
  
  console.log(`Cache miss for key ${cacheKey}`);
  
  // Запрос к Claude API
  const result = await callClaudeApi(await getClaudeApiKey(), {
    model: parameters.model || 'claude-3',
    prompt,
    max_tokens: parameters.maxTokens || 1000,
    temperature: parameters.temperature || 0.7,
    ...(parameters.system && { system: parameters.system })
  });
  
  // Сохранение результата в кэш
  await redis.set(
    `claude_cache:${cacheKey}`,
    JSON.stringify(result),
    'EX',
    60 * 60 * 24 // TTL: 24 часа
  );
  
  return result;
}
```

#### 7.2.2. Мониторинг и оптимизация

Для оптимизации работы системы рекомендуется реализовать мониторинг:

```javascript
// Пример использования Prometheus для мониторинга
const promClient = require('prom-client');

// Создание метрик
const tasksCounter = new promClient.Counter({
  name: 'claude_proxy_tasks_total',
  help: 'Total number of tasks processed',
  labelNames: ['status', 'type', 'priority']
});

const taskDurationHistogram = new promClient.Histogram({
  name: 'claude_proxy_task_duration_seconds',
  help: 'Task processing duration in seconds',
  labelNames: ['type', 'priority'],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600]
});

const queueSizeGauge = new promClient.Gauge({
  name: 'claude_proxy_queue_size',
  help: 'Current size of the queue',
  labelNames: ['priority']
});

// Периодическое обновление размера очереди
async function updateQueueSizeMetrics() {
  // Для Redis-based очереди
  const highPrioritySize = await redis.llen('queue:high');
  const mediumPrioritySize = await redis.llen('queue:medium');
  const lowPrioritySize = await redis.llen('queue:low');
  
  queueSizeGauge.set({ priority: 'high' }, highPrioritySize);
  queueSizeGauge.set({ priority: 'medium' }, mediumPrioritySize);
  queueSizeGauge.set({ priority: 'low' }, lowPrioritySize);
}

// Измерение времени выполнения задачи
async function processTaskWithMetrics(task) {
  const startTime = Date.now();
  
  try {
    const result = await processTask(task);
    
    // Увеличение счетчика успешных задач
    tasksCounter.inc({
      status: 'completed',
      type: task.type,
      priority: task.priority
    });
    
    // Запись времени выполнения
    taskDurationHistogram.observe(
      {
        type: task.type,
        priority: task.priority
      },
      (Date.now() - startTime) / 1000
    );
    
    return result;
  } catch (error) {
    // Увеличение счетчика неудачных задач
    tasksCounter.inc({
      status: 'failed',
      type: task.type,
      priority: task.priority
    });
    
    throw error;
  }
}

// Настройка сервера метрик для Prometheus
const express = require('express');
const app = express();

app.get('/metrics', async (req, res) => {
  // Обновление метрик очереди перед отправкой
  await updateQueueSizeMetrics();
  
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.listen(9090, () => {
  console.log('Metrics server listening on port 9090');
});
```

## 8. Рекомендации по выбору и внедрению механизма очередей

### 8.1. Выбор подхода в зависимости от нагрузки

| Подход | Нагрузка | Преимущества | Недостатки |
|--------|----------|--------------|------------|
| In-memory | Низкая (до 100 запросов в день) | Простота, минимум зависимостей | Отсутствие персистентности, ограниченная масштабируемость |
| Redis-based | Средняя (до 10000 запросов в день) | Надежность, персистентность, хорошая производительность | Необходимость настройки Redis, дополнительные затраты на инфраструктуру |
| Cloud-based | Высокая (более 10000 запросов в день) | Масштабируемость, надежность, отказоустойчивость | Зависимость от облачного провайдера, более высокая стоимость |

### 8.2. Рекомендации по внедрению

1. **Начните с простого решения** - для начальной стадии проекта достаточно In-memory очереди с сохранением состояния
2. **Мониторьте нагрузку** - отслеживайте количество задач, время их выполнения и используемые ресурсы
3. **Обеспечьте персистентность** - даже для простых решений реализуйте механизм сохранения состояния
4. **Реализуйте повторные попытки** - обработка ошибок и повторные попытки критически важны для надежности
5. **Планируйте масштабирование** - проектируйте систему с учетом возможного роста нагрузки

### 8.3. Поэтапное внедрение

1. **Этап 1: Базовая реализация**
   - Создание структуры задачи
   - Реализация In-memory очереди
   - Базовая обработка ошибок

2. **Этап 2: Повышение надежности**
   - Добавление персистентности
   - Реализация механизма повторных попыток
   - Добавление мониторинга

3. **Этап 3: Масштабирование**
   - Переход на Redis или облачное решение
   - Реализация множественных Workers
   - Оптимизация производительности

## 9. Заключение

Механизм очередей для асинхронных задач является ключевым компонентом бэкенд-прокси для взаимодействия с Claude API. Правильно спроектированный механизм очередей обеспечивает:

1. **Надежность** - задачи не теряются даже при сбоях сервера
2. **Масштабируемость** - система может обрабатывать растущую нагрузку
3. **Отказоустойчивость** - ошибки обрабатываются корректно с автоматическими повторными попытками
4. **Приоритизацию** - важные задачи обрабатываются в первую очередь
5. **Оптимизацию** - ресурсы используются эффективно

Выбор конкретной реализации зависит от ожидаемой нагрузки, требований к надежности и доступных ресурсов. Независимо от выбранного подхода, ключевым аспектом является корректная обработка ошибок и обеспечение персистентности данных.
