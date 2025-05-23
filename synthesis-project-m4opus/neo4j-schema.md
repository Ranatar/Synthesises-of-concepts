# Схема графовой базы данных Neo4j для философского сервиса

## 1. Модель данных

### 1.1 Узлы (Nodes)

#### Category (Категория)
```cypher
// Основной узел для философских категорий
(:Category {
  id: String! (UUID),
  name: String!,
  canonicalName: String!,
  description: String,
  definition: String,
  tradition: String, // 'western', 'eastern', 'analytical', etc.
  domain: String, // 'metaphysics', 'epistemology', 'ethics', etc.
  synonyms: [String],
  relatedTerms: [String],
  createdBy: String (UUID),
  isSystem: Boolean,
  usageCount: Integer,
  embedding: [Float], // векторное представление
  createdAt: DateTime,
  updatedAt: DateTime
})

// Индексы и ограничения
CREATE CONSTRAINT category_id_unique ON (c:Category) ASSERT c.id IS UNIQUE;
CREATE INDEX category_name_index FOR (c:Category) ON (c.name);
CREATE INDEX category_canonical_index FOR (c:Category) ON (c.canonicalName);
CREATE INDEX category_tradition_index FOR (c:Category) ON (c.tradition);
CREATE INDEX category_domain_index FOR (c:Category) ON (c.domain);
```

#### Concept (Концепция)
```cypher
// Узел для философской концепции
(:Concept {
  id: String! (UUID),
  name: String!,
  description: String,
  authorId: String! (UUID),
  tradition: String,
  isPublic: Boolean,
  isPublished: Boolean,
  version: Integer,
  forkFrom: String (UUID),
  starsCount: Integer,
  forksCount: Integer,
  viewsCount: Integer,
  qualityScore: Float, // 0.0 - 1.0
  complexityLevel: String, // 'simple', 'moderate', 'complex'
  tags: [String],
  metadata: Map,
  createdAt: DateTime,
  updatedAt: DateTime,
  publishedAt: DateTime
})

// Индексы и ограничения
CREATE CONSTRAINT concept_id_unique ON (c:Concept) ASSERT c.id IS UNIQUE;
CREATE INDEX concept_author_index FOR (c:Concept) ON (c.authorId);
CREATE INDEX concept_public_index FOR (c:Concept) ON (c.isPublic);
CREATE INDEX concept_name_index FOR (c:Concept) ON (c.name);
CREATE TEXT INDEX concept_fulltext FOR (c:Concept) ON (c.name, c.description);
```

#### Thesis (Тезис)
```cypher
// Узел для тезиса концепции
(:Thesis {
  id: String! (UUID),
  conceptId: String! (UUID),
  text: String!,
  strength: String, // 'high', 'medium', 'low'
  orderPosition: Integer,
  isGenerated: Boolean,
  generationParams: Map,
  qualityScore: Float,
  createdAt: DateTime,
  updatedAt: DateTime
})

// Индексы и ограничения
CREATE CONSTRAINT thesis_id_unique ON (t:Thesis) ASSERT t.id IS UNIQUE;
CREATE INDEX thesis_concept_index FOR (t:Thesis) ON (t.conceptId);
CREATE TEXT INDEX thesis_text_index FOR (t:Thesis) ON (t.text);
```

#### User (Пользователь)
```cypher
// Узел пользователя для связей авторства
(:User {
  id: String! (UUID),
  username: String!,
  email: String!,
  fullName: String,
  createdAt: DateTime
})

// Индексы и ограничения
CREATE CONSTRAINT user_id_unique ON (u:User) ASSERT u.id IS UNIQUE;
CREATE INDEX user_username_index FOR (u:User) ON (u.username);
```

#### PhilosophicalSchool (Философская школа)
```cypher
// Узел для группировки концепций по школам
(:PhilosophicalSchool {
  id: String! (UUID),
  name: String!,
  period: String, // 'ancient', 'medieval', 'modern', 'contemporary'
  region: String, // 'western', 'eastern', 'global'
  description: String,
  keyFigures: [String],
  foundedYear: Integer,
  endedYear: Integer
})

CREATE CONSTRAINT school_id_unique ON (s:PhilosophicalSchool) ASSERT s.id IS UNIQUE;
```

### 1.2 Связи (Relationships)

#### Связи между категориями
```cypher
// Основные философские отношения
// Причинно-следственная связь
(:Category)-[:CAUSES {
  weight: Float,
  rationale: String,
  conceptId: String! (UUID),
  createdAt: DateTime
}]->(:Category)

// Логическое следование
(:Category)-[:IMPLIES {
  weight: Float,
  rationale: String,
  conceptId: String! (UUID),
  necessity: String, // 'necessary', 'probable', 'possible'
  createdAt: DateTime
}]->(:Category)

// Диалектическое противоречие
(:Category)-[:CONTRADICTS {
  weight: Float,
  rationale: String,
  conceptId: String! (UUID),
  resolutionType: String, // 'synthesis', 'hierarchy', 'context'
  createdAt: DateTime
}]->(:Category)

// Часть-целое
(:Category)-[:PART_OF {
  weight: Float,
  rationale: String,
  conceptId: String! (UUID),
  partType: String, // 'essential', 'accidental', 'functional'
  createdAt: DateTime
}]->(:Category)

// Обобщение
(:Category)-[:GENERALIZES {
  weight: Float,
  rationale: String,
  conceptId: String! (UUID),
  level: Integer,
  createdAt: DateTime
}]->(:Category)

// Ассоциативная связь
(:Category)-[:ASSOCIATES_WITH {
  weight: Float,
  rationale: String,
  conceptId: String! (UUID),
  associationType: String,
  createdAt: DateTime
}]->(:Category)
```

#### Связи концепций
```cypher
// Концепция включает категории
(:Concept)-[:INCLUDES {
  weight: Float,
  positionX: Float,
  positionY: Float,
  color: String,
  addedAt: DateTime
}]->(:Category)

// Концепция содержит тезисы
(:Concept)-[:HAS_THESIS {
  orderPosition: Integer
}]->(:Thesis)

// Тезис связан с категориями
(:Thesis)-[:RELATES_TO {
  relevance: Float
}]->(:Category)

// Авторство
(:User)-[:CREATED]->(:Concept)

// Форк концепции
(:Concept)-[:FORKED_FROM]->(:Concept)

// Родительские концепции
(:Concept)-[:DERIVED_FROM {
  influence: Float, // 0.0 - 1.0
  aspects: [String]
}]->(:Concept)

// Принадлежность к школе
(:Concept)-[:BELONGS_TO {
  confidence: Float
}]->(:PhilosophicalSchool)

// Синтез концепций
(:Concept)-[:SYNTHESIZED_FROM {
  mode: String, // 'dialectical', 'integrative', 'creative'
  contribution: Float
}]->(:Concept)
```

#### Социальные связи
```cypher
// Избранное
(:User)-[:FAVORITES {
  addedAt: DateTime
}]->(:Concept)

// Оценка
(:User)-[:RATED {
  score: Integer, // 1-5
  ratedAt: DateTime
}]->(:Concept)

// Сотрудничество
(:User)-[:COLLABORATES_ON {
  permissions: [String], // ['read', 'write', 'admin']
  since: DateTime
}]->(:Concept)
```

## 2. Ключевые запросы

### 2.1 Поиск путей между категориями
```cypher
// Найти все пути между двумя категориями в концепции
MATCH path = (start:Category {id: $startId})-[r*..5]->(end:Category {id: $endId})
WHERE ALL(rel IN relationships(path) WHERE rel.conceptId = $conceptId)
RETURN path, 
       [rel IN relationships(path) | type(rel)] AS relationTypes,
       reduce(w = 1.0, rel IN relationships(path) | w * rel.weight) AS pathWeight
ORDER BY pathWeight DESC
LIMIT 10
```

### 2.2 Анализ центральности категорий
```cypher
// PageRank для определения важности категорий в концепции
CALL gds.graph.project(
  'concept-graph',
  'Category',
  {
    CAUSES: {properties: 'weight'},
    IMPLIES: {properties: 'weight'},
    PART_OF: {properties: 'weight'}
  }
)
YIELD graphName

CALL gds.pageRank.stream('concept-graph', {
  maxIterations: 20,
  dampingFactor: 0.85,
  relationshipWeightProperty: 'weight'
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS category, score
ORDER BY score DESC
```

### 2.3 Обнаружение сообществ
```cypher
// Louvain для обнаружения кластеров связанных категорий
CALL gds.louvain.stream('concept-graph', {
  relationshipWeightProperty: 'weight',
  maxLevels: 5,
  tolerance: 0.0001
})
YIELD nodeId, communityId
RETURN communityId, 
       collect(gds.util.asNode(nodeId).name) AS categories
ORDER BY size(categories) DESC
```

### 2.4 Поиск похожих концепций
```cypher
// Найти концепции с похожей структурой
MATCH (c1:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
WITH c1, collect(cat.id) AS categories1
MATCH (c2:Concept)-[:INCLUDES]->(cat2:Category)
WHERE c2.id <> c1.id AND cat2.id IN categories1
WITH c1, c2, count(cat2) AS commonCategories, categories1
MATCH (c2)-[:INCLUDES]->(allCat:Category)
WITH c1, c2, commonCategories, 
     size(categories1) AS size1, 
     count(DISTINCT allCat) AS size2
RETURN c2.name AS similarConcept,
       commonCategories,
       2.0 * commonCategories / (size1 + size2) AS jaccardSimilarity
ORDER BY jaccardSimilarity DESC
LIMIT 10
```

### 2.5 Синтез концепций - поиск мостов
```cypher
// Найти категории-мосты между двумя концепциями
MATCH (c1:Concept {id: $concept1Id})-[:INCLUDES]->(cat1:Category)
MATCH (c2:Concept {id: $concept2Id})-[:INCLUDES]->(cat2:Category)
MATCH path = shortestPath((cat1)-[*..3]-(cat2))
WHERE cat1 <> cat2
RETURN DISTINCT 
       [node IN nodes(path) WHERE node:Category | node.name] AS bridgePath,
       length(path) AS distance
ORDER BY distance
LIMIT 20
```

## 3. Процедуры и функции

### 3.1 Процедура валидации графа
```cypher
CALL apoc.custom.asProcedure(
  'validateConceptGraph',
  '
  MATCH (c:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
  WITH c, count(cat) AS categoryCount
  WHERE categoryCount < 2
  RETURN "Error: Concept must have at least 2 categories" AS error
  UNION
  MATCH (c:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
  WHERE NOT exists((cat)-[]-())
  RETURN "Warning: Category " + cat.name + " has no relations" AS error
  UNION
  MATCH (cat1:Category)<-[:INCLUDES]-(c:Concept {id: $conceptId})-[:INCLUDES]->(cat2:Category)
  WHERE cat1 <> cat2 AND NOT exists((cat1)-[]-(cat2))
  WITH count(*) AS unconnectedPairs
  WHERE unconnectedPairs > 5
  RETURN "Warning: Many unconnected category pairs" AS error
  ',
  'read',
  [['error', 'STRING']],
  [['conceptId', 'STRING']]
)
```

### 3.2 Функция расчета философской глубины
```cypher
CALL apoc.custom.asFunction(
  'calculatePhilosophicalDepth',
  '
  MATCH (c:Concept {id: $conceptId})-[:INCLUDES]->(cat:Category)
  WITH c, count(DISTINCT cat.domain) AS domainDiversity,
       avg(size((cat)-[]->())) AS avgOutDegree
  MATCH (c)-[:INCLUDES]->(cat)-[r]->()
  WITH domainDiversity, avgOutDegree, 
       count(DISTINCT type(r)) AS relationTypeDiversity
  RETURN (domainDiversity * 0.3 + 
          avgOutDegree * 0.3 + 
          relationTypeDiversity * 0.4) / 10.0 AS depth
  ',
  'FLOAT',
  [['conceptId', 'STRING']]
)
```

## 4. Интеграция с векторным поиском

### 4.1 Создание векторного индекса
```cypher
// Создание индекса для семантического поиска категорий
CALL db.index.vector.createNodeIndex(
  'category-embeddings',
  'Category',
  'embedding',
  1536,
  'cosine'
)
```

### 4.2 Семантический поиск похожих категорий
```cypher
// Найти семантически похожие категории
CALL db.index.vector.queryNodes(
  'category-embeddings',
  10,
  $queryEmbedding
)
YIELD node, score
WHERE score > 0.8
RETURN node.name AS category, 
       node.description AS description,
       score
ORDER BY score DESC
```

## 5. Триггеры и ограничения

### 5.1 Проверка циклических зависимостей
```cypher
// Процедура для проверки циклов при добавлении связи
CALL apoc.trigger.add(
  'check-cycles',
  '
  UNWIND $createdRelationships AS rel
  WITH rel
  WHERE type(rel) IN ["CAUSES", "IMPLIES", "PART_OF"]
  MATCH path = (startNode)-[*]->(endNode)
  WHERE id(startNode) = id(endNode) 
    AND rel IN relationships(path)
  WITH rel
  CALL apoc.do.throw("Circular dependency detected") YIELD value
  RETURN value
  ',
  {phase: 'before'}
)
```

### 5.2 Обновление счетчиков
```cypher
// Триггер для обновления счетчиков использования
CALL apoc.trigger.add(
  'update-usage-count',
  '
  UNWIND $createdRelationships AS rel
  WHERE type(rel) = "INCLUDES"
  MATCH (c:Concept)-[rel]->(cat:Category)
  SET cat.usageCount = coalesce(cat.usageCount, 0) + 1
  ',
  {phase: 'after'}
)
```

## 6. Оптимизация производительности

### 6.1 Проекции графов для аналитики
```cypher
// Создание персистентной проекции для анализа
CALL gds.graph.project.cypher(
  'philosophy-analysis',
  'MATCH (c:Category) RETURN id(c) AS id',
  'MATCH (c1:Category)-[r]->(c2:Category) 
   RETURN id(c1) AS source, id(c2) AS target, 
          type(r) AS type, r.weight AS weight',
  {
    relationshipProperties: 'weight'
  }
)
```

### 6.2 Кэширование результатов
```cypher
// Материализованные пути для частых запросов
CREATE (cache:PathCache {
  fromId: $fromId,
  toId: $toId,
  conceptId: $conceptId,
  paths: $serializedPaths,
  calculatedAt: datetime(),
  expiresAt: datetime() + duration('PT1H')
})
```

## 7. Мониторинг и метрики

### 7.1 Статистика использования
```cypher
// Сбор метрик по концепциям
MATCH (c:Concept)
OPTIONAL MATCH (c)-[:INCLUDES]->(cat:Category)
OPTIONAL MATCH (c)-[:HAS_THESIS]->(t:Thesis)
OPTIONAL MATCH (cat)-[r]-(cat2:Category)
WHERE r.conceptId = c.id
RETURN c.name AS concept,
       count(DISTINCT cat) AS categoryCount,
       count(DISTINCT t) AS thesisCount,
       count(DISTINCT r) AS relationCount,
       avg(r.weight) AS avgRelationWeight
```

### 7.2 Качество графов
```cypher
// Оценка связности и баланса графов
MATCH (c:Concept)-[:INCLUDES]->(cat:Category)
WITH c, collect(cat) AS categories
UNWIND categories AS cat1
UNWIND categories AS cat2
WHERE cat1 <> cat2
OPTIONAL MATCH path = shortestPath((cat1)-[*..5]-(cat2))
WITH c, 
     count(CASE WHEN path IS NOT NULL THEN 1 END) AS connectedPairs,
     count(*) AS totalPairs
RETURN c.name AS concept,
       toFloat(connectedPairs) / totalPairs AS connectivity,
       CASE 
         WHEN connectivity = 1.0 THEN 'fully connected'
         WHEN connectivity > 0.8 THEN 'well connected'
         WHEN connectivity > 0.5 THEN 'moderately connected'
         ELSE 'poorly connected'
       END AS connectivityLevel
```