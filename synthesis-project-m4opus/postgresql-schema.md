# Схема базы данных PostgreSQL для философского сервиса

## 1. Основные таблицы

### 1.1 Таблица users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    api_quota_used INTEGER DEFAULT 0,
    api_quota_limit INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    
    -- Индексы
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_created_at (created_at)
);

-- Триггер для обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 Таблица categories
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    canonical_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    definition TEXT,
    tradition VARCHAR(100), -- 'western', 'eastern', 'analytical', etc.
    domain VARCHAR(100), -- 'metaphysics', 'epistemology', 'ethics', etc.
    synonyms TEXT[] DEFAULT '{}',
    related_terms TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    is_system BOOLEAN DEFAULT false, -- системные категории нельзя удалять
    usage_count INTEGER DEFAULT 0,
    embedding VECTOR(1536), -- для семантического поиска
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_categories_name (name),
    INDEX idx_categories_canonical_name (canonical_name),
    INDEX idx_categories_tradition (tradition),
    INDEX idx_categories_domain (domain),
    INDEX idx_categories_created_by (created_by),
    INDEX idx_categories_embedding (embedding vector_cosine_ops),
    
    -- Полнотекстовый поиск
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('russian', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED,
    INDEX idx_categories_search (search_vector) USING GIN
);
```

### 1.3 Таблица relation_types
```sql
CREATE TABLE relation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    canonical_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_directed BOOLEAN DEFAULT true,
    reverse_name VARCHAR(255), -- для двунаправленных связей
    examples TEXT[],
    semantic_type VARCHAR(50), -- 'causal', 'logical', 'dialectical', etc.
    created_by UUID REFERENCES users(id),
    is_system BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_relation_types_name (name),
    INDEX idx_relation_types_semantic_type (semantic_type)
);
```

### 1.4 Таблица concepts
```sql
CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    author_id UUID REFERENCES users(id) NOT NULL,
    tradition VARCHAR(100),
    parent_concepts UUID[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    fork_from UUID REFERENCES concepts(id),
    stars_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2), -- 0.00 - 1.00
    complexity_level VARCHAR(20), -- 'simple', 'moderate', 'complex'
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Индексы
    INDEX idx_concepts_author_id (author_id),
    INDEX idx_concepts_is_public (is_public),
    INDEX idx_concepts_tradition (tradition),
    INDEX idx_concepts_tags (tags) USING GIN,
    INDEX idx_concepts_created_at (created_at),
    INDEX idx_concepts_quality_score (quality_score DESC),
    
    -- Полнотекстовый поиск
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('russian', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED,
    INDEX idx_concepts_search (search_vector) USING GIN
);
```

### 1.5 Таблица concept_categories
```sql
CREATE TABLE concept_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    weight DECIMAL(3,2) DEFAULT 1.0, -- 0.00 - 5.00
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    color VARCHAR(7), -- hex color
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальность категории в концепции
    UNIQUE(concept_id, category_id),
    
    -- Индексы
    INDEX idx_concept_categories_concept_id (concept_id),
    INDEX idx_concept_categories_category_id (category_id)
);
```

### 1.6 Таблица concept_relations
```sql
CREATE TABLE concept_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    from_category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    to_category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    relation_type_id UUID REFERENCES relation_types(id) ON DELETE RESTRICT,
    weight DECIMAL(3,2) DEFAULT 1.0,
    rationale TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальность связи в концепции
    UNIQUE(concept_id, from_category_id, to_category_id, relation_type_id),
    
    -- Индексы
    INDEX idx_concept_relations_concept_id (concept_id),
    INDEX idx_concept_relations_from_category (from_category_id),
    INDEX idx_concept_relations_to_category (to_category_id),
    INDEX idx_concept_relations_type (relation_type_id)
);
```

### 1.7 Таблица theses
```sql
CREATE TABLE theses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    strength VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
    order_position INTEGER,
    related_categories UUID[] DEFAULT '{}',
    is_generated BOOLEAN DEFAULT false,
    generation_params JSONB DEFAULT '{}',
    quality_score DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_theses_concept_id (concept_id),
    INDEX idx_theses_order (concept_id, order_position),
    INDEX idx_theses_strength (strength),
    
    -- Полнотекстовый поиск
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('russian', coalesce(text, '')) ||
        to_tsvector('english', coalesce(text, ''))
    ) STORED,
    INDEX idx_theses_search (search_vector) USING GIN
);
```

### 1.8 Таблица synthesis_operations
```sql
CREATE TABLE synthesis_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    source_concepts UUID[] NOT NULL,
    result_concept_id UUID REFERENCES concepts(id),
    synthesis_mode VARCHAR(50) NOT NULL, -- 'dialectical', 'integrative', 'creative'
    parameters JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    quality_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Индексы
    INDEX idx_synthesis_user_id (user_id),
    INDEX idx_synthesis_status (status),
    INDEX idx_synthesis_created_at (created_at DESC)
);
```

### 1.9 Таблица ai_interactions
```sql
CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    operation_type VARCHAR(50) NOT NULL, -- 'generate_graph', 'generate_theses', etc.
    request_data JSONB NOT NULL,
    response_data JSONB,
    prompt_template VARCHAR(100),
    model_version VARCHAR(50),
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    quality_feedback INTEGER, -- 1-5 rating from user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Индексы
    INDEX idx_ai_interactions_user_id (user_id),
    INDEX idx_ai_interactions_operation_type (operation_type),
    INDEX idx_ai_interactions_created_at (created_at DESC),
    INDEX idx_ai_interactions_status (status)
);
```

### 1.10 Таблица user_favorites
```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальность
    UNIQUE(user_id, concept_id),
    
    -- Индексы
    INDEX idx_user_favorites_user_id (user_id),
    INDEX idx_user_favorites_concept_id (concept_id)
);
```

## 2. Вспомогательные таблицы

### 2.1 Таблица audit_log
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', etc.
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_audit_log_user_id (user_id),
    INDEX idx_audit_log_entity (entity_type, entity_id),
    INDEX idx_audit_log_created_at (created_at DESC)
);
```

### 2.2 Таблица collaboration_invites
```sql
CREATE TABLE collaboration_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"read": true, "write": false}',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Индексы
    INDEX idx_collaboration_invites_concept_id (concept_id),
    INDEX idx_collaboration_invites_invitee (invitee_email),
    INDEX idx_collaboration_invites_token (token),
    INDEX idx_collaboration_invites_status (status)
);
```

## 3. Материализованные представления

### 3.1 Популярные категории
```sql
CREATE MATERIALIZED VIEW popular_categories AS
SELECT 
    c.id,
    c.name,
    c.canonical_name,
    c.tradition,
    c.domain,
    COUNT(DISTINCT cc.concept_id) as concept_count,
    c.usage_count,
    AVG(concepts.quality_score) as avg_concept_quality
FROM categories c
JOIN concept_categories cc ON c.id = cc.category_id
JOIN concepts ON cc.concept_id = concepts.id
WHERE concepts.is_public = true
GROUP BY c.id
ORDER BY concept_count DESC, c.usage_count DESC;

CREATE INDEX idx_popular_categories_count ON popular_categories(concept_count DESC);
```

### 3.2 Статистика пользователей
```sql
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    COUNT(DISTINCT c.id) as total_concepts,
    COUNT(DISTINCT c.id) FILTER (WHERE c.is_public = true) as public_concepts,
    SUM(c.stars_count) as total_stars,
    SUM(c.forks_count) as total_forks,
    AVG(c.quality_score) as avg_quality_score,
    COUNT(DISTINCT ai.id) as ai_interactions,
    MAX(c.created_at) as last_concept_created
FROM users u
LEFT JOIN concepts c ON u.id = c.author_id
LEFT JOIN ai_interactions ai ON u.id = ai.user_id
GROUP BY u.id;

CREATE INDEX idx_user_statistics_total_concepts ON user_statistics(total_concepts DESC);
```

## 4. Функции и триггеры

### 4.1 Функция обновления updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 4.2 Функция проверки циклических зависимостей
```sql
CREATE OR REPLACE FUNCTION check_circular_relations()
RETURNS TRIGGER AS $$
DECLARE
    has_cycle BOOLEAN;
BEGIN
    -- Используем рекурсивный CTE для поиска циклов
    WITH RECURSIVE relation_path AS (
        SELECT 
            NEW.from_category_id as start_id,
            NEW.to_category_id as end_id,
            ARRAY[NEW.from_category_id, NEW.to_category_id] as path
        
        UNION ALL
        
        SELECT 
            rp.start_id,
            cr.to_category_id,
            rp.path || cr.to_category_id
        FROM relation_path rp
        JOIN concept_relations cr ON rp.end_id = cr.from_category_id
        WHERE cr.concept_id = NEW.concept_id
        AND NOT cr.to_category_id = ANY(rp.path)
    )
    SELECT EXISTS (
        SELECT 1 FROM relation_path 
        WHERE end_id = start_id
    ) INTO has_cycle;
    
    IF has_cycle THEN
        RAISE EXCEPTION 'Circular dependency detected';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_circular_relations_trigger
BEFORE INSERT OR UPDATE ON concept_relations
FOR EACH ROW EXECUTE FUNCTION check_circular_relations();
```

### 4.3 Функция обновления счетчиков
```sql
CREATE OR REPLACE FUNCTION update_usage_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Обновляем счетчики для категорий
        UPDATE categories 
        SET usage_count = usage_count + 1 
        WHERE id IN (NEW.from_category_id, NEW.to_category_id);
        
        -- Обновляем счетчик для типа связи
        UPDATE relation_types 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.relation_type_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usage_counters_trigger
AFTER INSERT ON concept_relations
FOR EACH ROW EXECUTE FUNCTION update_usage_counters();
```

## 5. Партиционирование

### 5.1 Партиционирование таблицы ai_interactions
```sql
-- Партиционирование по месяцам для больших таблиц
CREATE TABLE ai_interactions_partitioned (
    LIKE ai_interactions INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Создание партиций на год вперед
CREATE TABLE ai_interactions_2025_01 PARTITION OF ai_interactions_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
    
CREATE TABLE ai_interactions_2025_02 PARTITION OF ai_interactions_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
    
-- И так далее...
```

## 6. Оптимизация производительности

### 6.1 Дополнительные индексы для сложных запросов
```sql
-- Составной индекс для поиска публичных концепций по автору
CREATE INDEX idx_concepts_public_author 
ON concepts(author_id, is_public, created_at DESC) 
WHERE is_public = true;

-- Индекс для поиска связей между конкретными категориями
CREATE INDEX idx_relations_category_pair 
ON concept_relations(from_category_id, to_category_id, concept_id);

-- Частичный индекс для активных пользователей
CREATE INDEX idx_users_active 
ON users(email, username) 
WHERE is_active = true AND email_verified = true;
```

### 6.2 Настройка автовакуума для часто обновляемых таблиц
```sql
ALTER TABLE ai_interactions SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02
);

ALTER TABLE concepts SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);
```