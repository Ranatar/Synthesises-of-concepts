# Архитектура безопасности и аутентификации философского сервиса

## 1. Общая архитектура безопасности

### 1.1 Многоуровневая защита
```typescript
// security/security.config.ts
export const SecurityConfig = {
  // JWT конфигурация
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
      algorithm: 'RS256' as const
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
      algorithm: 'RS256' as const
    }
  },
  
  // OAuth провайдеры
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: ['email', 'profile']
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: ['user:email']
    }
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: {
      anonymous: 100,
      authenticated: 1000,
      premium: 5000
    }
  },
  
  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    maxAge: 86400
  },
  
  // Security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', process.env.API_URL]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};
```

### 1.2 Аутентификационный сервис
```typescript
// services/auth.service.ts
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
  private readonly jwtService: JwtService;
  private readonly sessionStore: SessionStore;
  private readonly auditLogger: AuditLogger;
  
  async register(dto: RegisterDto): Promise<AuthResult> {
    // 1. Валидация входных данных
    await this.validateRegistration(dto);
    
    // 2. Проверка на существование пользователя
    const existing = await this.userRepo.findOne({
      where: [
        { email: dto.email },
        { username: dto.username }
      ]
    });
    
    if (existing) {
      throw new ConflictException('User already exists');
    }
    
    // 3. Хеширование пароля с солью
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });
    
    // 4. Создание пользователя в транзакции
    const user = await this.db.transaction(async (trx) => {
      const newUser = await this.userRepo.create({
        email: dto.email,
        username: dto.username,
        passwordHash,
        emailVerificationToken: this.generateSecureToken(),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }, { transaction: trx });
      
      // Создание профиля пользователя
      await this.profileRepo.create({
        userId: newUser.id,
        preferences: {
          theme: 'light',
          language: 'ru',
          notifications: {
            email: true,
            push: false
          }
        }
      }, { transaction: trx });
      
      // Логирование события
      await this.auditLogger.log({
        event: 'USER_REGISTERED',
        userId: newUser.id,
        ip: dto.ipAddress,
        userAgent: dto.userAgent
      }, trx);
      
      return newUser;
    });
    
    // 5. Отправка email подтверждения
    await this.emailService.sendVerificationEmail(user);
    
    // 6. Генерация токенов
    const tokens = await this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      tokens,
      requiresEmailVerification: true
    };
  }
  
  async login(dto: LoginDto): Promise<AuthResult> {
    // 1. Поиск пользователя
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      include: ['profile', 'roles']
    });
    
    if (!user) {
      // Защита от timing attacks
      await argon2.hash('dummy_password');
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // 2. Проверка блокировки аккаунта
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is locked');
    }
    
    // 3. Проверка пароля
    const isValidPassword = await argon2.verify(
      user.passwordHash,
      dto.password
    );
    
    if (!isValidPassword) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // 4. Проверка 2FA если включено
    if (user.twoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return {
          requiresTwoFactor: true,
          tempToken: await this.generateTempToken(user.id)
        };
      }
      
      const isValid2FA = this.verify2FACode(user, dto.twoFactorCode);
      if (!isValid2FA) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }
    
    // 5. Обновление последнего входа
    await user.update({
      lastLoginAt: new Date(),
      failedLoginAttempts: 0
    });
    
    // 6. Создание сессии
    const session = await this.createSession(user, dto);
    
    // 7. Генерация токенов
    const tokens = await this.generateTokens(user, session.id);
    
    // 8. Логирование успешного входа
    await this.auditLogger.log({
      event: 'USER_LOGIN',
      userId: user.id,
      sessionId: session.id,
      ip: dto.ipAddress,
      userAgent: dto.userAgent
    });
    
    return {
      user: this.sanitizeUser(user),
      tokens,
      session
    };
  }
  
  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      // 1. Верификация refresh токена
      const payload = await this.jwtService.verifyAsync(
        refreshToken,
        { secret: SecurityConfig.jwt.refresh.secret }
      );
      
      // 2. Проверка сессии
      const session = await this.sessionStore.get(payload.sessionId);
      if (!session || session.revoked) {
        throw new UnauthorizedException('Invalid session');
      }
      
      // 3. Проверка fingerprint
      if (session.fingerprint !== payload.fingerprint) {
        await this.handleSuspiciousActivity(session);
        throw new UnauthorizedException('Invalid fingerprint');
      }
      
      // 4. Загрузка пользователя
      const user = await this.userRepo.findByPk(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found');
      }
      
      // 5. Генерация новых токенов
      const tokens = await this.generateTokens(user, session.id);
      
      // 6. Обновление сессии
      await this.sessionStore.update(session.id, {
        lastActivity: new Date(),
        refreshCount: session.refreshCount + 1
      });
      
      return tokens;
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw error;
    }
  }
  
  private async generateTokens(user: User, sessionId?: string): Promise<Tokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(r => r.name),
      sessionId: sessionId || generateUUID(),
      fingerprint: this.generateFingerprint()
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: SecurityConfig.jwt.access.secret,
        expiresIn: SecurityConfig.jwt.access.expiresIn,
        algorithm: SecurityConfig.jwt.access.algorithm
      }),
      this.jwtService.signAsync(payload, {
        secret: SecurityConfig.jwt.refresh.secret,
        expiresIn: SecurityConfig.jwt.refresh.expiresIn,
        algorithm: SecurityConfig.jwt.refresh.algorithm
      })
    ]);
    
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 минут в секундах
      refreshExpiresIn: 604800 // 7 дней в секундах
    };
  }
  
  async setup2FA(userId: string): Promise<TwoFactorSetup> {
    const user = await this.userRepo.findByPk(userId);
    
    // Генерация секрета
    const secret = speakeasy.generateSecret({
      name: `Philosophy Service (${user.email})`,
      issuer: 'Philosophy Service'
    });
    
    // Временное сохранение секрета
    await this.cacheService.set(
      `2fa:setup:${userId}`,
      secret.base32,
      300 // 5 минут
    );
    
    // Генерация QR кода
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: this.generateBackupCodes()
    };
  }
  
  async enable2FA(userId: string, code: string): Promise<void> {
    const tempSecret = await this.cacheService.get(`2fa:setup:${userId}`);
    if (!tempSecret) {
      throw new BadRequestException('2FA setup expired');
    }
    
    // Проверка кода
    const isValid = authenticator.verify({
      token: code,
      secret: tempSecret
    });
    
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }
    
    // Сохранение секрета
    await this.userRepo.update(userId, {
      twoFactorSecret: await this.encryptSecret(tempSecret),
      twoFactorEnabled: true,
      twoFactorEnabledAt: new Date()
    });
    
    // Очистка временного секрета
    await this.cacheService.del(`2fa:setup:${userId}`);
    
    // Логирование
    await this.auditLogger.log({
      event: '2FA_ENABLED',
      userId,
      timestamp: new Date()
    });
  }
}
```

## 2. Авторизация и контроль доступа

### 2.1 RBAC (Role-Based Access Control)
```typescript
// models/rbac.model.ts
export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[]; // Наследование ролей
}

// Предопределенные роли
export const SystemRoles = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    permissions: [
      { resource: '*', action: '*' } // Полный доступ
    ]
  },
  
  MODERATOR: {
    id: 'moderator',
    name: 'Moderator',
    permissions: [
      { resource: 'concept', action: 'read' },
      { resource: 'concept', action: 'update', conditions: { isPublic: true } },
      { resource: 'concept', action: 'delete', conditions: { reported: true } },
      { resource: 'user', action: 'ban' },
      { resource: 'comment', action: '*' }
    ]
  },
  
  PREMIUM_USER: {
    id: 'premium_user',
    name: 'Premium User',
    inherits: ['user'],
    permissions: [
      { resource: 'ai', action: 'unlimited_generation' },
      { resource: 'concept', action: 'advanced_analytics' },
      { resource: 'export', action: 'batch' }
    ]
  },
  
  USER: {
    id: 'user',
    name: 'Regular User',
    permissions: [
      { resource: 'concept', action: 'create' },
      { resource: 'concept', action: 'read', conditions: { OR: [{ isPublic: true }, { isOwner: true }] } },
      { resource: 'concept', action: 'update', conditions: { isOwner: true } },
      { resource: 'concept', action: 'delete', conditions: { isOwner: true } },
      { resource: 'ai', action: 'generate', conditions: { dailyLimit: 10 } }
    ]
  },
  
  GUEST: {
    id: 'guest',
    name: 'Guest',
    permissions: [
      { resource: 'concept', action: 'read', conditions: { isPublic: true } },
      { resource: 'search', action: 'execute', conditions: { rateLimit: 50 } }
    ]
  }
};
```

### 2.2 Авторизационный Guard
```typescript
// guards/authorization.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authzService: AuthorizationService,
    private caslFactory: CaslAbilityFactory
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredPermissions) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false;
    }
    
    // Создание CASL ability для пользователя
    const ability = await this.caslFactory.createForUser(user);
    
    // Проверка каждого требуемого разрешения
    for (const permission of requiredPermissions) {
      const resource = await this.resolveResource(permission, request);
      
      if (!ability.can(permission.action, resource)) {
        // Логирование попытки несанкционированного доступа
        await this.logUnauthorizedAccess(user, permission, request);
        return false;
      }
    }
    
    return true;
  }
  
  private async resolveResource(
    permission: Permission,
    request: any
  ): Promise<any> {
    // Динамическое разрешение ресурса
    if (permission.resource === 'concept') {
      const conceptId = request.params.id || request.body.conceptId;
      if (conceptId) {
        return this.conceptService.findOne(conceptId);
      }
    }
    
    return permission.resource;
  }
}

// decorators/require-permission.decorator.ts
export const RequirePermission = (...permissions: Permission[]) => {
  return SetMetadata('permissions', permissions);
};

// Использование
@Controller('concepts')
@UseGuards(AuthGuard, AuthorizationGuard)
export class ConceptController {
  @Post()
  @RequirePermission({ resource: 'concept', action: 'create' })
  async create(@Body() dto: CreateConceptDto, @CurrentUser() user: User) {
    // Реализация
  }
  
  @Delete(':id')
  @RequirePermission({ resource: 'concept', action: 'delete' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    // Проверка владельца происходит в AuthorizationGuard
  }
}
```

### 2.3 CASL интеграция для сложных правил
```typescript
// services/casl-ability.factory.ts
import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Subjects = 'Concept' | 'User' | 'Category' | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  async createForUser(user: User): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    );
    
    // Загрузка ролей и разрешений пользователя
    const userWithRoles = await this.loadUserWithRoles(user.id);
    
    // Применение правил для каждой роли
    for (const role of userWithRoles.roles) {
      await this.applyRoleRules(can, cannot, role, user);
    }
    
    // Специальные правила для конкретного пользователя
    await this.applyUserSpecificRules(can, cannot, user);
    
    // Глобальные ограничения
    cannot('delete', 'Concept', { isSystemConcept: true });
    cannot('update', 'User', { id: { $ne: user.id } }, ['password']);
    
    return build({
      detectSubjectType: (item) =>
        item.constructor as AbilityClass<AppAbility>
    });
  }
  
  private async applyRoleRules(
    can: any,
    cannot: any,
    role: Role,
    user: User
  ) {
    switch (role.name) {
      case 'admin':
        can('manage', 'all');
        break;
        
      case 'moderator':
        can('read', 'Concept');
        can('update', 'Concept', { isPublic: true });
        can('delete', 'Concept', { 
          $or: [
            { reportCount: { $gte: 5 } },
            { qualityScore: { $lt: 0.2 } }
          ]
        });
        break;
        
      case 'premium_user':
        can('create', 'Concept');
        can('read', 'Concept');
        can('update', 'Concept', { authorId: user.id });
        can('delete', 'Concept', { authorId: user.id });
        can('create', 'Synthesis', { dailyCount: { $lt: 100 } });
        break;
        
      case 'user':
        can('create', 'Concept', { dailyCount: { $lt: 10 } });
        can('read', 'Concept', { 
          $or: [
            { isPublic: true },
            { authorId: user.id },
            { sharedWith: { $in: [user.id] } }
          ]
        });
        can('update', 'Concept', { authorId: user.id });
        can('delete', 'Concept', { 
          authorId: user.id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        break;
    }
  }
}
```

## 3. Защита API и данных

### 3.1 Input валидация и санитизация
```typescript
// validators/concept.validator.ts
import { z } from 'zod';
import * as DOMPurify from 'isomorphic-dompurify';

export const ConceptValidationSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Zа-яА-Я0-9\s\-_]+$/, 'Invalid characters in name')
    .transform(val => DOMPurify.sanitize(val)),
    
  description: z.string()
    .max(5000, 'Description too long')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val) : undefined),
    
  categories: z.array(z.object({
    id: z.string().uuid('Invalid category ID'),
    weight: z.number().min(0.1).max(5.0).default(1.0),
    position: z.object({
      x: z.number().min(-1000).max(1000),
      y: z.number().min(-1000).max(1000)
    })
  })).min(2, 'At least 2 categories required')
    .max(50, 'Too many categories'),
    
  relations: z.array(z.object({
    from: z.string().uuid(),
    to: z.string().uuid(),
    type: z.enum(['CAUSES', 'IMPLIES', 'CONTRADICTS', 'PART_OF', 'ASSOCIATES']),
    weight: z.number().min(0.1).max(5.0).default(1.0),
    rationale: z.string().max(500).optional()
      .transform(val => val ? DOMPurify.sanitize(val) : undefined)
  })).max(200, 'Too many relations')
});

// Middleware для валидации
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }
    
    try {
      const validationSchema = this.getSchema(metadata.metatype);
      const validated = await validationSchema.parseAsync(value);
      
      // Дополнительная проверка на SQL injection
      this.checkForSQLInjection(validated);
      
      // Проверка на XSS
      this.checkForXSS(validated);
      
      return validated;
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      throw error;
    }
  }
  
  private checkForSQLInjection(data: any) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
      /(--)|(\/*)|(*\/)/g,
      /(\bOR\b\s*\d+\s*=\s*\d+)/gi
    ];
    
    const checkValue = (val: any): void => {
      if (typeof val === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(val)) {
            throw new BadRequestException('Potential SQL injection detected');
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        Object.values(val).forEach(checkValue);
      }
    };
    
    checkValue(data);
  }
}
```

### 3.2 Rate Limiting и DDoS защита
```typescript
// middleware/rate-limiter.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class AdvancedRateLimiter implements NestMiddleware {
  private redis: Redis.Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      enableOfflineQueue: false
    });
  }
  
  async use(req: Request, res: Response, next: NextFunction) {
    const identifier = this.getIdentifier(req);
    const endpoint = req.route?.path || req.path;
    const method = req.method;
    
    // Различные лимиты для разных endpoints
    const limits = this.getEndpointLimits(endpoint, method, req.user);
    
    // Sliding window rate limiting
    const key = `ratelimit:${identifier}:${endpoint}:${method}`;
    const now = Date.now();
    const windowStart = now - limits.windowMs;
    
    // Lua скрипт для атомарной проверки и обновления
    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window_start = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local ttl = tonumber(ARGV[4])
      
      -- Удаляем старые записи
      redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
      
      -- Подсчитываем текущие запросы
      local current = redis.call('ZCARD', key)
      
      if current < limit then
        -- Добавляем новый запрос
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, ttl)
        return {1, limit - current - 1}
      else
        return {0, 0}
      end
    `;
    
    const [allowed, remaining] = await this.redis.eval(
      luaScript,
      1,
      key,
      now,
      windowStart,
      limits.max,
      Math.ceil(limits.windowMs / 1000)
    ) as [number, number];
    
    // Установка заголовков
    res.setHeader('X-RateLimit-Limit', limits.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('X-RateLimit-Reset', new Date(now + limits.windowMs).toISOString());
    
    if (!allowed) {
      // Логирование превышения лимита
      await this.logRateLimitExceeded(identifier, endpoint);
      
      // Проверка на DDoS
      if (await this.checkForDDoS(identifier)) {
        await this.blockIdentifier(identifier);
      }
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil(limits.windowMs / 1000)
      });
      return;
    }
    
    next();
  }
  
  private getEndpointLimits(endpoint: string, method: string, user?: User) {
    const baseLimits = {
      '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 },
      '/api/auth/register': { windowMs: 60 * 60 * 1000, max: 3 },
      '/api/concepts': {
        GET: { windowMs: 60 * 1000, max: 100 },
        POST: { windowMs: 60 * 60 * 1000, max: 10 }
      },
      '/api/ai/generate': { windowMs: 60 * 60 * 1000, max: 20 },
      '/api/search': { windowMs: 60 * 1000, max: 30 }
    };
    
    let limits = baseLimits[endpoint]?.[method] || baseLimits[endpoint] || {
      windowMs: 15 * 60 * 1000,
      max: 100
    };
    
    // Увеличение лимитов для авторизованных пользователей
    if (user) {
      limits.max *= 2;
      
      // Премиум пользователи
      if (user.subscription === 'premium') {
        limits.max *= 5;
      }
    }
    
    return limits;
  }
  
  private async checkForDDoS(identifier: string): Promise<boolean> {
    const key = `ddos:check:${identifier}`;
    const threshold = 1000; // Запросов в час
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 3600);
    }
    
    return count > threshold;
  }
  
  private async blockIdentifier(identifier: string) {
    const key = `blocked:${identifier}`;
    await this.redis.set(key, '1', 'EX', 24 * 60 * 60); // 24 часа
    
    // Уведомление администраторов
    await this.notificationService.notifyAdmins({
      type: 'DDOS_DETECTED',
      identifier,
      timestamp: new Date()
    });
  }
}
```

## 4. Шифрование и защита данных

### 4.1 Шифрование чувствительных данных
```typescript
// services/encryption.service.ts
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivationIterations = 100000;
  
  constructor(
    private readonly kmsService: KMSService // AWS KMS или аналог
  ) {}
  
  async encryptSensitiveData(data: string, context: string): Promise<EncryptedData> {
    // 1. Получение мастер-ключа из KMS
    const masterKey = await this.kmsService.getDataKey(context);
    
    // 2. Генерация уникального ключа для данных
    const salt = crypto.randomBytes(32);
    const key = crypto.pbkdf2Sync(
      masterKey.plaintext,
      salt,
      this.keyDerivationIterations,
      32,
      'sha256'
    );
    
    // 3. Шифрование
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    // 4. Очистка ключей из памяти
    masterKey.plaintext.fill(0);
    key.fill(0);
    
    return {
      encrypted: encrypted.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      keyId: masterKey.keyId,
      algorithm: this.algorithm
    };
  }
  
  async decryptSensitiveData(encryptedData: EncryptedData, context: string): Promise<string> {
    // 1. Получение мастер-ключа
    const masterKey = await this.kmsService.getDataKey(context, encryptedData.keyId);
    
    // 2. Восстановление ключа
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const key = crypto.pbkdf2Sync(
      masterKey.plaintext,
      salt,
      this.keyDerivationIterations,
      32,
      'sha256'
    );
    
    // 3. Расшифровка
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(encryptedData.iv, 'base64')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData.encrypted, 'base64')),
      decipher.final()
    ]);
    
    // 4. Очистка ключей
    masterKey.plaintext.fill(0);
    key.fill(0);
    
    return decrypted.toString('utf8');
  }
  
  // Шифрование полей в БД
  async encryptDatabaseField(value: any, fieldName: string): Promise<string> {
    if (!value) return null;
    
    const context = `db:field:${fieldName}`;
    const jsonValue = JSON.stringify(value);
    const encrypted = await this.encryptSensitiveData(jsonValue, context);
    
    return JSON.stringify(encrypted);
  }
  
  async decryptDatabaseField(encryptedValue: string, fieldName: string): Promise<any> {
    if (!encryptedValue) return null;
    
    try {
      const context = `db:field:${fieldName}`;
      const encrypted = JSON.parse(encryptedValue);
      const decrypted = await this.decryptSensitiveData(encrypted, context);
      
      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error('Failed to decrypt field', { fieldName, error });
      throw new Error('Decryption failed');
    }
  }
}

// Использование в Entity
@Entity()
export class User {
  @Column({
    type: 'text',
    transformer: {
      to: (value: any) => encryptionService.encryptDatabaseField(value, 'userData'),
      from: (value: string) => encryptionService.decryptDatabaseField(value, 'userData')
    }
  })
  sensitiveData: any;
}
```

### 4.2 Защита API ключей и токенов
```typescript
// services/api-key.service.ts
@Injectable()
export class ApiKeyService {
  private readonly keyPrefix = 'pk_'; // public key prefix
  private readonly secretPrefix = 'sk_'; // secret key prefix
  
  async generateApiKey(userId: string, name: string): Promise<ApiKeyPair> {
    // 1. Генерация ключей
    const keyId = generateUUID();
    const publicKey = `${this.keyPrefix}${this.generateRandomKey(16)}`;
    const secretKey = `${this.secretPrefix}${this.generateRandomKey(32)}`;
    
    // 2. Хеширование секретного ключа
    const hashedSecret = await argon2.hash(secretKey, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3
    });
    
    // 3. Сохранение в БД
    const apiKey = await this.apiKeyRepo.create({
      id: keyId,
      userId,
      name,
      publicKey,
      secretKeyHash: hashedSecret,
      permissions: this.getDefaultPermissions(userId),
      lastUsedAt: null,
      expiresAt: new Date(Date.now() + a365 * 24 * 60 * 60 * 1000) // 1 год
    });
    
    // 4. Логирование создания
    await this.auditLogger.log({
      event: 'API_KEY_CREATED',
      userId,
      keyId,
      name
    });
    
    // 5. Возврат ключа только один раз
    return {
      id: keyId,
      publicKey,
      secretKey, // Показывается только при создании
      name,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt
    };
  }
  
  async validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
    // 1. Определение типа ключа
    if (!apiKey.startsWith(this.secretPrefix)) {
      throw new UnauthorizedException('Invalid API key format');
    }
    
    // 2. Поиск по публичной части (первые 8 символов после префикса)
    const publicPart = apiKey.substring(0, this.secretPrefix.length + 8);
    const candidates = await this.apiKeyRepo.findAll({
      where: {
        publicKey: {
          [Op.like]: `${publicPart}%`
        },
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });
    
    // 3. Проверка каждого кандидата
    for (const candidate of candidates) {
      const isValid = await argon2.verify(candidate.secretKeyHash, apiKey);
      
      if (isValid) {
        // 4. Обновление времени использования
        await candidate.update({ lastUsedAt: new Date() });
        
        // 5. Проверка rate limits
        const rateLimitOk = await this.checkApiKeyRateLimit(candidate.id);
        if (!rateLimitOk) {
          throw new TooManyRequestsException('API key rate limit exceeded');
        }
        
        return {
          valid: true,
          keyId: candidate.id,
          userId: candidate.userId,
          permissions: candidate.permissions
        };
      }
    }
    
    // 6. Защита от timing attacks
    await new Promise(resolve => setTimeout(resolve, 100));
    
    throw new UnauthorizedException('Invalid API key');
  }
}
```

## 5. Мониторинг безопасности и аудит

### 5.1 Система аудита
```typescript
// services/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    private elasticService: ElasticsearchService,
    private alertService: SecurityAlertService
  ) {}
  
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // 1. Сохранение в БД
    const auditEntry = await this.auditRepo.create({
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resource: event.resource,
      action: event.action,
      result: event.result,
      metadata: event.metadata,
      timestamp: new Date()
    });
    
    // 2. Индексация в Elasticsearch для поиска
    await this.elasticService.index({
      index: 'security-audit',
      body: {
        ...auditEntry,
        geoLocation: await this.getGeoLocation(event.ipAddress),
        riskScore: this.calculateRiskScore(event)
      }
    });
    
    // 3. Проверка на подозрительную активность
    if (await this.detectSuspiciousActivity(event)) {
      await this.handleSuspiciousActivity(event);
    }
    
    // 4. Real-time алерты для критических событий
    if (event.severity === 'CRITICAL') {
      await this.alertService.sendAlert({
        type: 'CRITICAL_SECURITY_EVENT',
        event,
        timestamp: new Date()
      });
    }
  }
  
  private async detectSuspiciousActivity(event: SecurityEvent): Promise<boolean> {
    const patterns = [
      // Множественные неудачные попытки входа
      {
        pattern: 'MULTIPLE_FAILED_LOGINS',
        query: {
          eventType: 'LOGIN_FAILED',
          userId: event.userId,
          timeWindow: 15 * 60 * 1000, // 15 минут
          threshold: 5
        }
      },
      
      // Доступ с разных географических локаций
      {
        pattern: 'GEOGRAPHIC_ANOMALY',
        query: {
          eventType: 'LOGIN_SUCCESS',
          userId: event.userId,
          checkGeoDistance: true,
          threshold: 1000 // км
        }
      },
      
      // Необычное время активности
      {
        pattern: 'TEMPORAL_ANOMALY',
        query: {
          userId: event.userId,
          checkTimePattern: true
        }
      },
      
      // Массовый экспорт данных
      {
        pattern: 'DATA_EXFILTRATION',
        query: {
          eventType: 'DATA_EXPORT',
          userId: event.userId,
          timeWindow: 60 * 60 * 1000, // 1 час
          threshold: 100
        }
      }
    ];
    
    for (const { pattern, query } of patterns) {
      if (await this.matchPattern(event, query)) {
        await this.logSecurityPattern(pattern, event);
        return true;
      }
    }
    
    return false;
  }
  
  async generateSecurityReport(period: DateRange): Promise<SecurityReport> {
    const events = await this.elasticService.search({
      index: 'security-audit',
      body: {
        query: {
          range: {
            timestamp: {
              gte: period.start,
              lte: period.end
            }
          }
        },
        aggs: {
          by_event_type: {
            terms: { field: 'eventType' }
          },
          by_severity: {
            terms: { field: 'severity' }
          },
          by_user: {
            terms: { field: 'userId', size: 20 }
          },
          failed_logins: {
            filter: { term: { eventType: 'LOGIN_FAILED' } },
            aggs: {
              by_hour: {
                date_histogram: {
                  field: 'timestamp',
                  interval: 'hour'
                }
              }
            }
          },
          suspicious_activities: {
            filter: { term: { suspicious: true } }
          }
        }
      }
    });
    
    return {
      period,
      summary: {
        totalEvents: events.hits.total.value,
        criticalEvents: events.aggregations.by_severity.buckets.find(
          b => b.key === 'CRITICAL'
        )?.doc_count || 0,
        suspiciousActivities: events.aggregations.suspicious_activities.doc_count,
        topUsers: events.aggregations.by_user.buckets.map(b => ({
          userId: b.key,
          eventCount: b.doc_count
        }))
      },
      details: this.processAggregations(events.aggregations),
      recommendations: await this.generateSecurityRecommendations(events)
    };
  }
}
```

Эта архитектура безопасности обеспечивает:
- Многоуровневую аутентификацию с 2FA
- Гибкую систему авторизации на основе ролей и правил
- Защиту от основных типов атак (SQL injection, XSS, DDoS)
- Шифрование чувствительных данных
- Комплексный аудит и мониторинг безопасности
- Соответствие стандартам безопасности (OWASP, GDPR)