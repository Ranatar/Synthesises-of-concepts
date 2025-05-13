# Механизм аутентификации для бэкенд-прокси взаимодействия с Claude API

## 1. Введение

Данный документ описывает детальную спецификацию механизма аутентификации для бэкенд-прокси взаимодействия с Claude API. Безопасность является критическим компонентом системы, так как прокси-сервер обеспечивает доступ к API Claude и хранит конфиденциальные API-ключи.

### 1.1. Цели и задачи

Основные цели механизма аутентификации:

1. Защита от несанкционированного доступа к API
2. Безопасное хранение и использование API-ключей Claude
3. Обеспечение разграничения доступа к функциям API
4. Предоставление удобных и безопасных методов аутентификации для клиентского приложения

## 2. Архитектура механизма аутентификации

### 2.1. Общая архитектура

Механизм аутентификации реализуется с использованием подхода на основе API-ключей с опциональной конвертацией в JWT-токены для кратковременного использования. Этот подход обеспечивает баланс между безопасностью и простотой реализации.

![Архитектура аутентификации](https://mermaid.ink/img/pako:eNptkU9PwzAMxb9K5BOV2P5Aa9lp6wFxQpw4VYeQpluabWkSNVXVfnecFgHiBD_7955sP_kgcspQBDCjHs4Gq9H3GmbsjJO-bQJkvoFsaUhvYKEkW_KuJWs2C_b1GDx8WBVNTcmQJSJTd9YCvGlJRd5QWivSPuGIlDhLBK5Cv9KKfLt3g3F3kh5HsGWn6mYe1Z3TLcgJDj9ZGdIPHlOudcF-pSklc7JaSpZ8PvibHuZUwMy7FW5ePm56yHaL-cOCnQ_RPhMeOiE5nfxWCK2GqCuRExA_HaI8-y_oZCXp9RhkOOXEj-P1ue_XxRwH6-2J2lN9VpGTFq_GiTbMW7fB2Ro-YeqEy21clTZ7Bh3FUQ9ZUFFxgVLcdF8-3MZUKXPwv_OEDQUf4qiUQnEV-g5o0qHKhKI_4SaM5g)

### 2.2. Компоненты системы

1. **Сервис аутентификации** - основной сервис, отвечающий за проверку учетных данных и управление API-ключами
2. **Хранилище API-ключей** - безопасное хранилище для API-ключей и связанных с ними метаданных
3. **Middleware аутентификации** - компонент, проверяющий аутентификацию для каждого запроса
4. **Сервис генерации JWT** - компонент для создания и проверки JWT-токенов
5. **Сервис управления ключами Claude API** - компонент для безопасного хранения и использования API-ключей Claude

## 3. Механизм аутентификации клиентского приложения

### 3.1. Подход на основе API-ключей

В качестве основного метода аутентификации используются API-ключи с высокой энтропией.

#### 3.1.1. Структура API-ключа

API-ключи имеют следующий формат:
```
sk_live_[32 случайных символа]
```

Например: `sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

API-ключи генерируются с использованием криптографически стойкого генератора случайных чисел и содержат 32 символа с высокой энтропией (включая строчные и заглавные буквы, цифры).

#### 3.1.2. Хранение API-ключей

API-ключи никогда не хранятся в открытом виде. Вместо этого в базе данных хранится хеш ключа:

```javascript
// Пример на Node.js
const crypto = require('crypto');

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}
```

В базе данных для каждого API-ключа хранится следующая информация:

```javascript
{
  clientId: "client-123456",        // Уникальный идентификатор клиента
  keyHash: "a1b2c3d4e5f6...",       // Хеш API-ключа (SHA-256)
  name: "Philosophy Concepts App",  // Название клиентского приложения
  permissions: ["query", "queue"],  // Разрешения
  createdAt: "2025-04-15T12:00:00Z", // Дата создания
  expiresAt: "2026-04-15T12:00:00Z", // Дата истечения срока действия
  lastUsedAt: "2025-04-15T14:30:00Z", // Дата последнего использования
  status: "active",                 // Статус: active, revoked, expired
  createdByUserId: "admin-123",     // Идентификатор создателя
  allowedOrigins: ["https://philosophy-concepts.example.com"], // Разрешенные источники
  rateLimit: {                      // Ограничения запросов
    query: 60,                      // Запросов в минуту для /query
    queue: 20                       // Запросов в минуту для /queue
  }
}
```

### 3.2. Аутентификация с помощью JWT-токенов

Для повышения безопасности и удобства использования можно использовать дополнительный уровень аутентификации с помощью JWT-токенов, которые имеют короткий срок действия.

#### 3.2.1. Структура JWT-токена

JWT-токен состоит из трех частей: заголовка, полезной нагрузки и подписи.

```javascript
// Заголовок
{
  "alg": "HS256",
  "typ": "JWT"
}

// Полезная нагрузка
{
  "clientId": "client-123456",
  "permissions": ["query", "queue"],
  "iat": 1618532730,            // Время выпуска
  "exp": 1618536330,            // Время истечения срока действия
  "jti": "jwt-123456"           // Уникальный идентификатор токена
}
```

#### 3.2.2. Процесс получения JWT-токена

1. Клиент отправляет запрос на эндпоинт `/api/auth/token` с API-ключом
2. Сервер проверяет API-ключ
3. Если ключ действителен, сервер генерирует JWT-токен с ограниченным сроком действия
4. Сервер возвращает JWT-токен клиенту
5. Клиент использует JWT-токен для аутентификации последующих запросов

```
Client                                 Server
  |                                       |
  | POST /api/auth/token                  |
  | Authorization: Bearer sk_live_a1b2... |
  |-------------------------------------->|
  |                                       | Verify API key
  |                                       | Generate JWT
  |                                       |
  | 200 OK                                |
  | {token: "eyJhb..."}                   |
  |<--------------------------------------|
  |                                       |
  | GET /api/claude/query                 |
  | Authorization: Bearer eyJhb...        |
  |-------------------------------------->|
  |                                       | Verify JWT
  |                                       | Process request
```

#### 3.2.3. Преимущества использования JWT-токенов

1. **Ограниченный срок действия** - JWT-токены имеют короткий срок действия (обычно от 15 минут до нескольких часов)
2. **Защита API-ключа** - API-ключ используется только для получения JWT-токена, а не для каждого запроса
3. **Отзыв токенов** - возможность быстрого отзыва всех активных токенов при компрометации API-ключа
4. **Детальная информация** - JWT-токен может содержать детальную информацию о клиенте и его разрешениях

### 3.3. Реализация аутентификации в middleware

Middleware аутентификации проверяет каждый запрос к API:

```javascript
// Пример на Node.js с Express
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function authMiddleware(req, res, next) {
  // Получение токена из заголовка Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'authentication_error',
        message: 'Отсутствует или неверный заголовок Authorization'
      }
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Определение типа токена (API-ключ или JWT)
  if (token.startsWith('sk_live_')) {
    // Проверка API-ключа
    verifyApiKey(token, req, res, next);
  } else {
    // Проверка JWT-токена
    verifyJWT(token, req, res, next);
  }
}

async function verifyApiKey(apiKey, req, res, next) {
  try {
    // Вычисление хеша ключа
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Поиск ключа в базе данных
    const keyData = await db.apiKeys.findOne({ keyHash });
    
    if (!keyData) {
      return res.status(401).json({
        error: {
          code: 'invalid_api_key',
          message: 'API-ключ недействителен'
        }
      });
    }
    
    // Проверка срока действия
    if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
      return res.status(401).json({
        error: {
          code: 'expired_api_key',
          message: 'Срок действия API-ключа истек'
        }
      });
    }
    
    // Проверка статуса
    if (keyData.status !== 'active') {
      return res.status(401).json({
        error: {
          code: 'inactive_api_key',
          message: `API-ключ имеет статус: ${keyData.status}`
        }
      });
    }
    
    // Проверка разрешений
    const requiredPermission = getRequiredPermission(req.path, req.method);
    
    if (requiredPermission && !keyData.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: {
          code: 'insufficient_permissions',
          message: `Отсутствует необходимое разрешение: ${requiredPermission}`
        }
      });
    }
    
    // Обновление времени последнего использования
    await db.apiKeys.updateOne(
      { keyHash },
      { $set: { lastUsedAt: new Date().toISOString() } }
    );
    
    // Добавление информации о клиенте в запрос
    req.client = {
      id: keyData.clientId,
      permissions: keyData.permissions,
      rateLimit: keyData.rateLimit
    };
    
    next();
  } catch (error) {
    console.error('Error verifying API key:', error);
    
    return res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: 'Внутренняя ошибка сервера при проверке API-ключа'
      }
    });
  }
}

function verifyJWT(token, req, res, next) {
  try {
    // Проверка JWT-токена
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Проверка разрешений
    const requiredPermission = getRequiredPermission(req.path, req.method);
    
    if (requiredPermission && !decoded.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: {
          code: 'insufficient_permissions',
          message: `Отсутствует необходимое разрешение: ${requiredPermission}`
        }
      });
    }
    
    // Добавление информации о клиенте в запрос
    req.client = {
      id: decoded.clientId,
      permissions: decoded.permissions
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'token_expired',
          message: 'Срок действия токена истек'
        }
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'invalid_token',
          message: 'Недействительный токен'
        }
      });
    }
    
    console.error('Error verifying JWT:', error);
    
    return res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: 'Внутренняя ошибка сервера при проверке токена'
      }
    });
  }
}

function getRequiredPermission(path, method) {
  if (path.startsWith('/api/claude/query')) return 'query';
  if (path.startsWith('/api/claude/queue')) return 'queue';
  if (path.startsWith('/api/claude/task') && method === 'GET') return 'task:read';
  if (path.startsWith('/api/claude/task') && method === 'DELETE') return 'task:cancel';
  if (path.startsWith('/api/claude/tasks')) return 'task:list';
  if (path.startsWith('/api/health')) return null; // Публичный эндпоинт
  
  return null;
}
```

## 4. Управление API-ключами

### 4.1. Регистрация нового API-ключа

Процесс регистрации нового API-ключа:

1. Администратор отправляет запрос на эндпоинт `/api/auth/register` с информацией о клиентском приложении
2. Сервер генерирует новый API-ключ и его хеш
3. Сервер сохраняет хеш ключа и метаданные в базе данных
4. Сервер возвращает API-ключ администратору (единственный раз, когда ключ отображается в открытом виде)

```javascript
// Пример на Node.js
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function registerApiKey(req, res) {
  try {
    // Проверка, что запрос от администратора
    if (!req.isAdmin) {
      return res.status(403).json({
        error: {
          code: 'insufficient_permissions',
          message: 'Для регистрации API-ключа требуются права администратора'
        }
      });
    }
    
    // Валидация запроса
    const { name, description, permissions, expiresIn, allowedOrigins, rateLimit } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: {
          code: 'missing_parameter',
          message: 'Отсутствует обязательный параметр: name'
        }
      });
    }
    
    // Генерация уникального идентификатора клиента
    const clientId = `client-${uuidv4()}`;
    
    // Генерация API-ключа
    const apiKey = generateApiKey();
    
    // Вычисление хеша ключа
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Расчет даты истечения срока действия
    const now = new Date();
    const expiresAt = expiresIn ? 
      calculateExpiryDate(now, expiresIn) : 
      new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    // Создание записи API-ключа
    const apiKeyRecord = {
      clientId,
      keyHash,
      name,
      description: description || '',
      permissions: permissions || ['query'],
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      createdByUserId: req.user.id,
      allowedOrigins: allowedOrigins || [],
      rateLimit: rateLimit || { query: 60, queue: 20 }
    };
    
    // Сохранение записи в базе данных
    await db.apiKeys.insertOne(apiKeyRecord);
    
    // Возврат API-ключа клиенту
    return res.status(201).json({
      clientId,
      apiKey,
      name: apiKeyRecord.name,
      description: apiKeyRecord.description,
      permissions: apiKeyRecord.permissions,
      createdAt: apiKeyRecord.createdAt,
      expiresAt: apiKeyRecord.expiresAt,
      allowedOrigins: apiKeyRecord.allowedOrigins,
      rateLimit: apiKeyRecord.rateLimit,
      message: 'Сохраните этот API-ключ! Он больше не будет показан.'
    });
  } catch (error) {
    console.error('Error registering API key:', error);
    
    return res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: 'Внутренняя ошибка сервера при регистрации API-ключа'
      }
    });
  }
}

function generateApiKey() {
  // Генерация случайной строки из 32 символов
  const bytes = crypto.randomBytes(24); // 24 байта = 32 символа в base64
  return `sk_live_${bytes.toString('base64').replace(/[+/=]/g, '').substring(0, 32)}`;
}

function calculateExpiryDate(baseDate, expiresIn) {
  // Парсинг строки expiresIn в формате ISO 8601 duration
  // Например, "P1Y" - 1 год, "P6M" - 6 месяцев, "P30D" - 30 дней
  
  const durationPattern = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  const matches = expiresIn.match(durationPattern);
  
  if (!matches) {
    throw new Error(`Invalid duration format: ${expiresIn}`);
  }
  
  const [, years, months, days, hours, minutes, seconds] = matches.map(m => m ? parseInt(m) : 0);
  
  const result = new Date(baseDate);
  
  if (years) result.setFullYear(result.getFullYear() + years);
  if (months) result.setMonth(result.getMonth() + months);
  if (days) result.setDate(result.getDate() + days);
  if (hours) result.setHours(result.getHours() + hours);
  if (minutes) result.setMinutes(result.getMinutes() + minutes);
  if (seconds) result.setSeconds(result.getSeconds() + seconds);
  
  return result;
}
```

### 4.2. Отзыв API-ключей

При необходимости API-ключ может быть отозван:

```javascript
async function revokeApiKey(req, res) {
  try {
    // Проверка, что запрос от администратора
    if (!req.isAdmin) {
      return res.status(403).json({
        error: {
          code: 'insufficient_permissions',
          message: 'Для отзыва API-ключа требуются права администратора'
        }
      });
    }
    
    const { clientId } = req.params;
    
    // Обновление статуса ключа
    const result = await db.apiKeys.updateOne(
      { clientId },
      { $set: { status: 'revoked', revokedAt: new Date().toISOString() } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        error: {
          code: 'client_not_found',
          message: `Клиент с ID ${clientId} не найден`
        }
      });
    }
    
    return res.status(200).json({
      clientId,
      status: 'revoked',
      message: 'API-ключ успешно отозван'
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    
    return res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: 'Внутренняя ошибка сервера при отзыве API-ключа'
      }
    });
  }
}
```

### 4.3. Ротация API-ключей

Для повышения безопасности рекомендуется периодическая ротация API-ключей. Процесс ротации:

1. Создание нового API-ключа для клиента с теми же разрешениями
2. Использование нового ключа в клиентском приложении
3. Отзыв старого ключа после успешного перехода на новый

```javascript
async function rotateApiKey(req, res) {
  try {
    // Проверка, что запрос от администратора
    if (!req.isAdmin) {
      return res.status(403).json({
        error: {
          code: 'insufficient_permissions',
          message: 'Для ротации API-ключа требуются права администратора'
        }
      });
    }
    
    const { clientId } = req.params;
    
    // Получение существующей записи ключа
    const existingKey = await db.apiKeys.findOne({ clientId });
    
    if (!existingKey) {
      return res.status(404).json({
        error: {
          code: 'client_not_found',
          message: `Клиент с ID ${clientId} не найден`
        }
      });
    }
    
    // Генерация нового API-ключа
    const newApiKey = generateApiKey();
    const newKeyHash = crypto.createHash('sha256').update(newApiKey).digest('hex');
    
    // Обновление статуса старого ключа и создание нового
    await db.apiKeys.updateOne(
      { clientId },
      { $set: { status: 'rotated', rotatedAt: new Date().toISOString() } }
    );
    
    // Создание записи нового ключа
    const newApiKeyRecord = {
      clientId: `client-${uuidv4()}`,
      keyHash: newKeyHash,
      name: existingKey.name,
      description: existingKey.description,
      permissions: existingKey.permissions,
      createdAt: new Date().toISOString(),
      expiresAt: existingKey.expiresAt,
      status: 'active',
      createdByUserId: req.user.id,
      allowedOrigins: existingKey.allowedOrigins,
      rateLimit: existingKey.rateLimit,
      previousClientId: clientId
    };
    
    await db.apiKeys.insertOne(newApiKeyRecord);
    
    return res.status(200).json({
      oldClientId: clientId,
      newClientId: newApiKeyRecord.clientId,
      apiKey: newApiKey,
      name: newApiKeyRecord.name,
      permissions: newApiKeyRecord.permissions,
      createdAt: newApiKeyRecord.createdAt,
      expiresAt: newApiKeyRecord.expiresAt,
      message: 'API-ключ успешно обновлен. Сохраните новый ключ!'
    });
  } catch (error) {
    console.error('Error rotating API key:', error);
    
    return res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: 'Внутренняя ошибка сервера при ротации API-ключа'
      }
    });
  }
}
```

## 5. Безопасное хранение API-ключей Claude

### 5.1. Хранение ключей Claude API

API-ключи Claude должны храниться с максимальной степенью защиты, так как они предоставляют доступ к платным API-сервисам.

#### 5.1.1. Использование переменных окружения

Наиболее простой и распространенный способ - хранение ключей в переменных окружения:

```
CLAUDE_API_KEY=sk_claude_abcdefghijklmnopqrstuvwxyz
```

#### 5.1.2. Использование сервисов управления секретами

Для продакшн-окружений рекомендуется использовать специализированные сервисы:

- AWS Secrets Manager
- Google Secret Manager
- Azure Key Vault
- HashiCorp Vault

Пример использования AWS Secrets Manager:

```javascript
const AWS = require('aws-sdk');

async function getClaudeApiKey() {
  const secretsManager = new AWS.SecretsManager();
  
  try {
    const data = await secretsManager.getSecretValue({ SecretId: 'claude-api-key' }).promise();
    const secret = JSON.parse(data.SecretString);
    
    return secret.apiKey;
  } catch (error) {
    console.error('Error retrieving Claude API key:', error);
    throw error;
  }
}
```

### 5.2. Взаимодействие с Claude API

При взаимодействии с Claude API ключ должен передаваться только через защищенные каналы (HTTPS):

```javascript
const axios = require('axios');

async function queryClaude(prompt, parameters) {
  try {
    const claudeApiKey = await getClaudeApiKey();
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: parameters.model || 'claude-3',
        prompt,
        max_tokens: parameters.maxTokens || 1000,
        temperature: parameters.temperature || 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error querying Claude API:', error);
    throw error;
  }
}
```

### 5.3. Ротация ключей Claude API

Для повышения безопасности рекомендуется периодическая ротация ключей Claude API:

1. Создание нового ключа в панели управления Claude
2. Обновление ключа в хранилище секретов
3. Проверка работоспособности нового ключа
4. Отзыв старого ключа

## 6. Разграничение доступа

### 6.1. Система разрешений

Для более гибкого контроля доступа используется система разрешений:

| Разрешение | Описание |
|------------|----------|
| `query` | Доступ к синхронным запросам (POST /api/claude/query) |
| `queue` | Доступ к асинхронным запросам (POST /api/claude/queue) |
| `task:read` | Доступ к чтению статуса и результатов задач |
| `task:cancel` | Доступ к отмене задач |
| `task:list` | Доступ к списку задач |
| `admin` | Административные функции (управление API-ключами) |

### 6.2. Проверка разрешений

Проверка разрешений осуществляется в middleware:

```javascript
function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.client || !req.client.permissions.includes(permission)) {
      return res.status(403).json({
        error: {
          code: 'insufficient_permissions',
          message: `Отсутствует необходимое разрешение: ${permission}`
        }
      });
    }
    
    next();
  };
}

// Использование в маршрутах
app.post('/api/claude/query', checkPermission('query'), handleClaudeQuery);
app.post('/api/claude/queue', checkPermission('queue'), handleClaudeQueue);
app.get('/api/claude/task/:taskId', checkPermission('task:read'), handleGetTask);
```

## 7. Механизмы защиты от атак

### 7.1. Защита от brute-force атак

#### 7.1.1. Ограничение количества попыток

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Ограничение попыток аутентификации
const authLimiter = rateLimit({
  store: new RedisStore({
    redis: redisClient,
    prefix: 'ratelimit:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // 10 попыток
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'rate_limit_exceeded',
        message: 'Превышен лимит попыток аутентификации. Попробуйте позже.'
      }
    });
  }
});

// Применение ограничения к эндпоинтам аутентификации
app.post('/api/auth/token', authLimiter, handleGetToken);
```

#### 7.1.2. Задержка при ошибке аутентификации

```javascript
async function handleGetToken(req, res) {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      // Задержка для предотвращения timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      return res.status(400).json({
        error: {
          code: 'missing_parameter',
          message: 'Отсутствует обязательный параметр: apiKey'
        }
      });
    }
    
    // Вычисление хеша ключа
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Поиск ключа в базе данных
    const keyData = await db.apiKeys.findOne({ keyHash });
    
    if (!keyData) {
      // Задержка для предотвращения timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      return res.status(401).json({
        error: {
          code: 'invalid_api_key',
          message: 'API-ключ недействителен'
        }
      });
    }
    
    // ... остальная логика
  } catch (error) {
    // ... обработка ошибок
  }
}
```

### 7.2. Rate Limiting

#### 7.2.1. Общие ограничения

```javascript
// Общие ограничения для всех запросов
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 100, // 100 запросов в минуту
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.client?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'rate_limit_exceeded',
        message: 'Превышен общий лимит запросов. Попробуйте позже.'
      }
    });
  }
});

// Применение ко всем маршрутам API
app.use('/api', generalLimiter);
```

#### 7.2.2. Индивидуальные ограничения по эндпоинтам

```javascript
// Настраиваемые ограничения для разных эндпоинтов
function createEndpointLimiter(endpointName) {
  return rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: (req) => {
      // Использование индивидуальных ограничений из данных клиента
      if (req.client && req.client.rateLimit && req.client.rateLimit[endpointName]) {
        return req.client.rateLimit[endpointName];
      }
      
      // Значения по умолчанию
      const defaultLimits = {
        query: 60,
        queue: 20,
        task: 100
      };
      
      return defaultLimits[endpointName] || 60;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.client?.id || req.ip,
    handler: (req, res) => {
      res.status(429).json({
        error: {
          code: 'rate_limit_exceeded',
          message: `Превышен лимит запросов для ${endpointName}. Попробуйте позже.`
        }
      });
    }
  });
}

// Применение индивидуальных ограничений
app.post('/api/claude/query', createEndpointLimiter('query'), handleClaudeQuery);
app.post('/api/claude/queue', createEndpointLimiter('queue'), handleClaudeQueue);
app.use('/api/claude/task', createEndpointLimiter('task'), taskRouter);
```

### 7.3. CORS-защита

```javascript
const cors = require('cors');

// Настройка CORS
function configureSecurityMiddleware(app) {
  app.use(async (req, res, next) => {
    // Определение разрешенных источников для клиента
    let allowedOrigins = ['http://localhost:3000']; // Источники по умолчанию
    
    // Получение клиентских данных из API-ключа
    if (req.client && req.client.id) {
      const clientData = await db.apiKeys.findOne({ clientId: req.client.id });
      
      if (clientData && clientData.allowedOrigins && clientData.allowedOrigins.length > 0) {
        allowedOrigins = clientData.allowedOrigins;
      }
    }
    
    // Настройка CORS для текущего запроса
    cors({
      origin: (origin, callback) => {
        // Разрешить запросы без origin (например, от Postman)
        if (!origin) return callback(null, true);
        
        // Проверка, что origin входит в список разрешенных
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      maxAge: 86400 // 24 часа
    })(req, res, next);
  });
}
```

### 7.4. Защита от подделки межсайтовых запросов (CSRF)

Для защиты от CSRF-атак можно использовать токены CSRF и проверять заголовок Origin или Referer:

```javascript
function csrfProtection(req, res, next) {
  // Пропускаем запросы, которые не могут быть подвержены CSRF
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Проверяем заголовок Origin
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Если есть заголовок Origin
  if (origin) {
    const originUrl = new URL(origin);
    // Проверяем, что домен Origin соответствует ожидаемому
    if (isValidDomain(originUrl.hostname)) {
      return next();
    }
  }
  
  // Если есть заголовок Referer
  if (referer) {
    const refererUrl = new URL(referer);
    // Проверяем, что домен Referer соответствует ожидаемому
    if (isValidDomain(refererUrl.hostname)) {
      return next();
    }
  }
  
  // Если ни Origin, ни Referer не соответствуют ожидаемым доменам
  res.status(403).json({
    error: {
      code: 'csrf_failure',
      message: 'CSRF protection: invalid origin'
    }
  });
}

function isValidDomain(hostname) {
  // Список доменов, с которых разрешены запросы
  const validDomains = [
    'philosophy-concepts.example.com',
    'localhost'
  ];
  
  return validDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
}

// Применение защиты ко всем маршрутам API
app.use('/api', csrfProtection);
```

### 7.5. Хранение API-ключей в клиентском приложении

Рекомендации по безопасному хранению ключей в клиентском приложении:

1. **Не хранить API-ключ в исходном коде** - ключи не должны быть жестко закодированы в исходном коде приложения
2. **Использовать переменные окружения** - для серверной части приложения
3. **Использовать защищенные хранилища** - для мобильных приложений использовать Keychain (iOS) или Keystore (Android)
4. **Ограничить доступность** - доступ к ключам должен быть только у компонентов, которым они необходимы
5. **Не хранить в localStorage или cookies** - для веб-приложений не рекомендуется хранить ключи в localStorage или cookies без дополнительной защиты
6. **Использовать JWT** - для веб-приложений лучше получать кратковременные JWT-токены с сервера приложения

## 8. Логирование и мониторинг

### 8.1. Логирование аутентификации

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Логирование успешной аутентификации
function logSuccessfulAuth(clientId, ipAddress, userAgent) {
  logger.info('Successful authentication', {
    clientId,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString()
  });
}

// Логирование неудачной аутентификации
function logFailedAuth(ipAddress, userAgent, reason) {
  logger.warn('Failed authentication attempt', {
    ipAddress,
    userAgent,
    reason,
    timestamp: new Date().toISOString()
  });
}

// Логирование подозрительной активности
function logSuspiciousActivity(clientId, ipAddress, userAgent, activity) {
  logger.error('Suspicious activity detected', {
    clientId,
    ipAddress,
    userAgent,
    activity,
    timestamp: new Date().toISOString()
  });
}
```

### 8.2. Мониторинг попыток подбора ключей

```javascript
const redis = require('redis');
const redisClient = redis.createClient();

// Отслеживание неудачных попыток аутентификации по IP-адресу
async function trackFailedAttempts(ipAddress) {
  const key = `failed_auth:${ipAddress}`;
  
  // Увеличение счетчика неудачных попыток
  await redisClient.incr(key);
  
  // Установка TTL, если он еще не установлен
  const ttl = await redisClient.ttl(key);
  
  if (ttl < 0) {
    await redisClient.expire(key, 3600); // 1 час
  }
  
  // Получение текущего количества неудачных попыток
  const attempts = await redisClient.get(key);
  
  // Если количество попыток превышает порог, регистрируем подозрительную активность
  if (attempts > 5) {
    logSuspiciousActivity(null, ipAddress, req.headers['user-agent'], 'Multiple failed authentication attempts');
    
    // Возможные дополнительные действия:
    // - Временная блокировка IP-адреса
    // - Отправка уведомления администраторам
    // - Запись в список подозрительных IP
  }
}
```

## 9. Примеры реализации в клиентском приложении

### 9.1. Получение и использование JWT-токена

```javascript
// Пример на React/Redux с использованием Axios

import axios from 'axios';

// Создание экземпляра axios с базовым URL
const api = axios.create({
  baseURL: 'https://api.philosophy-concepts.example.com'
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок аутентификации
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка связана с истечением срока действия токена и запрос еще не был повторен
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Получение нового токена
        const token = await refreshToken();
        
        // Повторение исходного запроса с новым токеном
        return api(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен, перенаправление на страницу входа
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Функция для получения JWT-токена
async function getJwtToken(apiKey) {
  try {
    const response = await axios.post(
      'https://api.philosophy-concepts.example.com/api/auth/token',
      { apiKey }
    );
    
    const { token, expiresAt } = response.data;
    
    // Сохранение токена и времени истечения срока действия
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('jwt_expires_at', expiresAt);
    
    return token;
  } catch (error) {
    console.error('Error getting JWT token:', error);
    throw error;
  }
}

// Функция для обновления токена
async function refreshToken() {
  const apiKey = getApiKeyFromSecureStorage();
  
  if (!apiKey) {
    throw new Error('API key not found');
  }
  
  const token = await getJwtToken(apiKey);
  return token;
}

// Функция для выхода из системы
function logout() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('jwt_expires_at');
  window.location.href = '/login';
}

// Функция для проверки срока действия токена
function isTokenExpired() {
  const expiresAt = localStorage.getItem('jwt_expires_at');
  
  if (!expiresAt) {
    return true;
  }
  
  // Проверка, истек ли срок действия токена
  // Добавляем 5-минутный буфер для безопасности
  return new Date(expiresAt).getTime() - 5 * 60 * 1000 < Date.now();
}

// Функция для получения API-ключа из безопасного хранилища
function getApiKeyFromSecureStorage() {
  // В реальном приложении здесь может быть более безопасный механизм
  // например, интеграция с платформенным хранилищем ключей
  return sessionStorage.getItem('api_key');
}

// Пример использования API
async function queryClaudeApi(prompt, parameters) {
  try {
    // Проверка срока действия токена перед запросом
    if (isTokenExpired()) {
      await refreshToken();
    }
    
    const response = await api.post('/api/claude/query', {
      prompt,
      parameters
    });
    
    return response.data;
  } catch (error) {
    console.error('Error querying Claude API:', error);
    throw error;
  }
}
```

### 9.2. Хранение и обработка API-ключей

Рекомендации для различных типов приложений:

#### Веб-приложения (SPA)

```javascript
// Компонент для ввода и сохранения API-ключа
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ApiKeySetup() {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Проверка валидности API-ключа
      if (!apiKey.startsWith('sk_live_')) {
        throw new Error('Недействительный формат API-ключа');
      }
      
      // Получение JWT-токена для проверки ключа
      const token = await getJwtToken(apiKey);
      
      // Сохранение API-ключа в сессионном хранилище
      // (не использовать localStorage для API-ключей)
      sessionStorage.setItem('api_key', apiKey);
      
      // Перенаправление на главную страницу
      navigate('/');
    } catch (error) {
      console.error('Error setting up API key:', error);
      setError('Не удалось проверить API-ключ. Пожалуйста, проверьте его и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="api-key-setup">
      <h2>Настройка API-ключа</h2>
      <p>
        Для использования приложения требуется API-ключ. Пожалуйста, введите ваш API-ключ ниже.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiKey">API-ключ</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk_live_..."
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Проверка...' : 'Сохранить API-ключ'}
        </button>
      </form>
      
      <div className="security-note">
        <h3>Примечание о безопасности</h3>
        <p>
          Ваш API-ключ будет храниться только в сессионном хранилище вашего браузера
          и будет автоматически удален при закрытии браузера. Ключ никогда не передается
          третьим лицам и используется только для взаимодействия с нашим API.
        </p>
      </div>
    </div>
  );
}

export default ApiKeySetup;
```

#### Мобильные приложения (React Native)

```javascript
// Использование Keychain (iOS) / Keystore (Android) для хранения API-ключей
import * as Keychain from 'react-native-keychain';

// Сохранение API-ключа
async function saveApiKey(apiKey) {
  try {
    await Keychain.setGenericPassword('apiKey', apiKey, {
      service: 'com.philosophyconcepts.apikey',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
    });
    
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
}

// Получение API-ключа
async function getApiKey() {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.philosophyconcepts.apikey'
    });
    
    if (credentials) {
      return credentials.password; // API-ключ
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
}

// Удаление API-ключа
async function deleteApiKey() {
  try {
    await Keychain.resetGenericPassword({
      service: 'com.philosophyconcepts.apikey'
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    return false;
  }
}
```

## 10. Выводы и рекомендации

### 10.1. Выбор подхода к аутентификации

Для бэкенд-прокси взаимодействия с Claude API рекомендуется следующий подход:

1. **Основной метод аутентификации**: API-ключи с высокой энтропией
2. **Дополнительный метод для SPA**: JWT-токены с коротким сроком действия
3. **Авторизация**: Система разрешений для гибкого контроля доступа

### 10.2. Ключевые рекомендации по безопасности

1. **Никогда не хранить API-ключи в открытом виде** - использовать хеширование с солью
2. **Использовать HTTPS для всех взаимодействий** - шифрование трафика критически важно
3. **Применять rate limiting** - защита от brute-force атак и DoS
4. **Логировать все попытки аутентификации** - для мониторинга и обнаружения атак
5. **Регулярно ротировать ключи** - периодическая замена ключей повышает безопасность
6. **Применять CORS и защиту от CSRF** - для защиты от атак с других доменов
7. **Использовать JWT с коротким сроком действия** - для минимизации рисков при компрометации

### 10.3. Приоритетные меры безопасности

1. **Защита API-ключей Claude** - наивысший приоритет, так как они обеспечивают доступ к платному API
2. **Аутентификация клиентского приложения** - защита от несанкционированного доступа
3. **Rate limiting** - защита от автоматизированных атак
4. **Логирование и мониторинг** - обнаружение попыток взлома
5. **Безопасное хранение ключей на клиенте** - минимизация риска утечки ключей

Реализация указанных рекомендаций обеспечит надежную защиту бэкенд-прокси и безопасное взаимодействие с Claude API.
