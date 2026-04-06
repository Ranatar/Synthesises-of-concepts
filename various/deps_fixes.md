# Аудит системы зависимостей: карта замен, уровне- и методо-патчи, пропущенные рёбра

## 1 `SUBSTITUTION_MAP` — завышенные оценки качества

Карта замен в целом семантически корректна, но несколько оценок `q` завышены:

| Замена | Текущий q | Проблема | Рекомендуемый q |
|--------|-----------|----------|-----------------|
| `graph:nodes` → `glossary:table` | 3 (равноценная) | Глоссарий содержит термины и определения, но **не содержит** центральность, тип, происхождение/генеалогию — ключевые столбцы таблицы категорий | **2** |
| `glossary:table` → `graph:nodes` | 3 (равноценная) | Обратная ситуация: граф содержит типы и центральность, но **не содержит** развёрнутых определений — основной смысл глоссария | **2** |
| `name:title` → `evolution:name_evolution` | 2 (частичная) | Эволюция названия обсуждает **будущие** варианты, а не текущее рекомендованное название. Потребитель, ожидающий `name:title`, получит спекуляцию вместо факта | **1** |
| `theses:summary` → `origin:decomposition` | 3 (равноценная) | Декомпозиция анализирует элементы по традициям-источникам, а сводка тезисов — компактный перечень формулировок. Пересечение есть, но формат радикально отличается | **2** |

**Пропущенные замены**:

```javascript
// critique:final_table — нет замен вообще. Добавить:
"critique:final_table": [
  { key: "critique:full", q: 2 },    // полный текст критики содержит таблицу
],

// capsule:full — нет замен. Добавить минимальный фолбэк:
"capsule:full": [
  { key: "name:title",       q: 1 },  // хотя бы название
  { key: "theses:summary",   q: 1 },  // и сводка тезисов
],
```

## 1b `CONTEXT_DEPS_BASE` — анализ базовых межразделовых зависимостей по промптам

### graph

```
required: ["sum:goals"]
optional: ["sum:portraits"]
```

**Проблема**: `sum:portraits` — optional, но промпт comparative: «Возьми ключевые категории **от каждого философа**», transformative: «из НАПРЯЖЕНИЯ между **как минимум двумя философами**», generative: «Философы выступают как источники **ОГРАНИЧЕНИЙ**». Без портретов модель знает только имена (из `baseCtx`), но не их специфические идеи, релевантные данному синтезу.

Для transformative и generative уровневые патчи промотируют `sum:portraits` в required (что подтверждает, что optional недостаточно). Но для **comparative** — самого распространённого — портреты остаются optional и могут быть вытеснены бюджетом.

**Рекомендация**: промотировать `sum:portraits` в required:
```javascript
graph: {
  required: ["sum:goals", "sum:portraits"],  // было: portraits в optional
  optional:  [],
},
```

### glossary

```
required: ["sum:goals", "graph:nodes"]
optional: []
```

**Проблема**: пустой optional. Промпт comparative: столбец «Традиционное понимание у ${p.phil.join(", ")}» — явно требует знания о каждом философе. Без `sum:portraits` модель реконструирует «традиционное понимание» из общих знаний, а не из контекста данного синтеза.

Уровневые патчи добавляют `sum:portraits` для transformative/generative, но **comparative остаётся без портретов**.

**Рекомендация**: добавить в optional:
```javascript
glossary: {
  required: ["sum:goals", "graph:nodes"],
  optional:  ["sum:portraits"],  // было: []
},
```

### theses

```
required: ["sum:goals", "sum:tensions", "graph:nodes", "graph:edges"]
optional: ["sum:portraits", "sum:novelty", "graph:topology", "glossary:table"]
```

**Корректно**. Тезисы строятся из категорий (nodes), связей (edges), учитывают напряжения. Портреты и глоссарий — полезный, но не обязательный контекст. Единственная возможная доработка: для generative `sum:portraits` стоит промотировать в required (промпт: «какое ОГРАНИЧЕНИЕ **его системы** данный тезис преодолевает?» — нужно знать систему) — это уже отмечено в §9.2.

### name

```
required: ["sum:goals", "sum:novelty", "graph:nodes"]
optional: ["sum:coherence", "sum:tensions"]
```

**Пропуск**: `theses:summary` отсутствует. Промпт: «точность отражения **сути концепции**» — суть концепции формулируется в тезисах. Названия, основанные только на категориях графа, могут быть поверхностными.

В стандартном топологическом порядке theses (3) → name (4), так что контекст доступен.

**Рекомендация**:
```javascript
name: {
  required: ["sum:goals", "sum:novelty", "graph:nodes"],
  optional: ["sum:coherence", "sum:tensions", "theses:summary"],  // +theses:summary
},
```

### history

```
required: ["sum:goals", "sum:portraits"]
optional: ["sum:novelty", "sum:tensions", "graph:nodes", "theses:summary", "name:title"]
```

**Корректно в целом**. Портреты в required — правильно (таблица «Философ | Ключевая идея | Как трансформирована»). `graph:nodes` optional — категории помогают привязать историю к конкретным элементам синтеза. `name:title` — для подраздела «Название в историческом контексте».

**Замечание**: `graph:edges` полностью отсутствует. Подраздел «Генеалогия идей» прослеживает интеллектуальные связи — связи графа (edges) дают структурный скелет для этого. Некритично, но полезно.

**Рекомендация**:
```javascript
history: {
  required: ["sum:goals", "sum:portraits"],
  optional: ["sum:novelty", "sum:tensions", "graph:nodes", "graph:edges",  // +graph:edges
             "theses:summary", "name:title"],
},
```

### origin

```
required: ["sum:goals", "sum:portraits", "sum:tensions", "graph:nodes", "theses:full"]
optional: ["sum:novelty", "sum:coherence", "graph:edges", "glossary:table", "name:title"]
```

**Корректно**. Самые тяжёлые зависимости — оправданы: «обратный инжиниринг» требует максимума данных. `theses:full` в required — обосновано промптом «для КАЖДОЙ категории графа и КАЖДОГО тезиса: из какой традиции он происходит?».

**Без изменений.**

### practical

```
required: ["sum:goals", "sum:novelty", "graph:nodes", "theses:summary"]
optional: ["glossary:table", "name:title"]
```

**Пропуск**: `sum:portraits` отсутствует. Промпт подразделов: «конкретные способы ОПЕРАЦИОНАЛИЗАЦИИ». Операционализация философских идей в образовании, этике и т.д. требует понимания, **какие именно** идеи каких философов применяются. Без портретов рекомендации абстрактнее.

**Рекомендация**:
```javascript
practical: {
  required: ["sum:goals", "sum:novelty", "graph:nodes", "theses:summary"],
  optional: ["sum:portraits", "glossary:table", "name:title"],  // +sum:portraits
},
```

### dialogue

```
required: ["sum:goals", "sum:portraits", "sum:tensions", "graph:nodes"]
optional: ["sum:difficulty", "graph:edges", "theses:summary", "name:title"]
```

**Вопрос**: `graph:edges` в optional. Промпт (все уровни): диалог строится вокруг столкновений, напряжений, связей между позициями. `graph:edges` — структурный скелет этих столкновений. При бюджете 24K (standard) edges (6 443 симв. по логу) могут не вместиться после required (3 739 + 4 983 + 2 393 + 8 453 = 19 568) — остаётся ~4 400, а edges = 6 443. **Edges вытесняются.**

Для transformative/generative это критичнее (диалог о «напряжениях» без таблицы связей). Уровневые патчи не промотируют edges.

**Рекомендация** — для BASE не менять (comparative-диалог может обойтись), но добавить уровневые патчи:

```javascript
// В CONTEXT_DEPS_LEVEL:
transformative: {
  // ...существующие...
  dialogue: {
    required: ["graph:edges"],        // промотировать из optional
    optional: ["glossary:table"],     // существующий патч
  },
},
generative: {
  // ...существующие...
  dialogue: {
    required: ["graph:edges"],        // промотировать из optional
    optional: ["glossary:table"],
  },
},
```

#### evolution

```
required: ["sum:goals", "sum:novelty", "name:full", "graph:nodes"]
optional: ["sum:coherence", "sum:tensions", "graph:edges", "graph:topology",
           "theses:summary", "history:contemporary", "history:genealogy"]
```

**Проблема**: `name:full` в required — тяжело (truncateText до 4 000 символов). Реально нужен только подразделу «Эволюция названия» (1 из 5). Остальные четыре подраздела не упоминают название.

**Рекомендация**: понизить `name:full` → optional, добавить `name:title` в required:
```javascript
evolution: {
  required: ["sum:goals", "sum:novelty", "name:title", "graph:nodes"],  // name:title вместо name:full
  optional: ["name:full",  // понижен из required
             "sum:coherence", "sum:tensions", "graph:edges", "graph:topology",
             "theses:summary", "history:contemporary", "history:genealogy"],
},
```

### critique

```
required: ["sum:goals", "sum:portraits", "sum:novelty", "sum:tensions", "sum:coherence",
           "graph:nodes", "graph:edges", "theses:full", "glossary:table"]
optional: ["graph:topology", "name:title", "history:contemporary"]
```

**Корректно** — 9 required ключей с 1.5× бюджетом оправданы: критика проверяет **всё**.

**Пропуск**: `origin:decomposition` отсутствует даже в optional (добавлен deconstructive-патчем, но полезен для ЛЮБОГО метода — критика проверяет «откуда что взято»). `practical:summary` — критерий «практичность» в итоговой оценке.

**Рекомендация**:
```javascript
critique: {
  required: [/* без изменений */],
  optional: ["graph:topology", "name:title", "history:contemporary",
             "origin:decomposition", "practical:summary"],  // +2
},
```

### capsule

```
required: ["name:title", "graph:nodes_top", "theses:summary"]
optional: ["graph:edges", "graph:topology", "sum:novelty", "glossary:table", "critique:final_table"]
```

**Корректно**. Компактная карточка — лёгкие зависимости. `critique:final_table` в optional — отличное решение для абзаца «честная оценка».

**Без изменений.**

### Сводка рекомендуемых изменений BASE

```javascript
const CONTEXT_DEPS_BASE = {
  graph: {
    required: ["sum:goals", "sum:portraits"],     // portraits↑ из optional
    optional:  [],
  },
  glossary: {
    required: ["sum:goals", "graph:nodes"],
    optional:  ["sum:portraits"],                  // +portraits
  },
  // theses — без изменений
  name: {
    required: ["sum:goals", "sum:novelty", "graph:nodes"],
    optional:  ["sum:coherence", "sum:tensions", "theses:summary"],  // +theses:summary
  },
  history: {
    required: ["sum:goals", "sum:portraits"],
    optional:  ["sum:novelty", "sum:tensions", "graph:nodes", "graph:edges",  // +edges
                "theses:summary", "name:title"],
  },
  // origin — без изменений
  practical: {
    required: ["sum:goals", "sum:novelty", "graph:nodes", "theses:summary"],
    optional:  ["sum:portraits", "glossary:table", "name:title"],   // +portraits
  },
  // dialogue — без изменений в BASE (патчи в LEVEL для transformative/generative)
  evolution: {
    required: ["sum:goals", "sum:novelty", "name:title", "graph:nodes"],  // name:title вместо name:full
    optional:  ["name:full", "sum:coherence", "sum:tensions",             // name:full↓ из required
                "graph:edges", "graph:topology", "theses:summary",
                "history:contemporary", "history:genealogy"],
  },
  critique: {
    required: [/* без изменений */],
    optional: ["graph:topology", "name:title", "history:contemporary",
               "origin:decomposition", "practical:summary"],              // +2
  },
  // capsule — без изменений
};
```

**transformative** — все 5 патчей обоснованы промптами:
- `graph: +required sum:tensions` — промпт графа: «каждая категория ОБЯЗАНА возникать из НАПРЯЖЕНИЯ». ✓
- `glossary: +optional sum:portraits, sum:tensions` — столбец «Из какого напряжения между философами возникло». ✓
- `origin: +required graph:edges` — генеалогия связей нужна для верификации «столкновений». ✓
- `practical: +optional theses:full` — полные обоснования с трансформативным контекстом. ✓
- `dialogue: +optional glossary:table` — определения нужны в диалоге о напряжениях. ✓

**generative** — все 5 патчей обоснованы:
- `graph: +required sum:portraits, sum:tensions` — промпт: «философы — источники ОГРАНИЧЕНИЙ». Портреты раскрывают ограничения. ✓
- Остальные — аналогичны transformative с корректной мотивацией. ✓

**Пропущенные уровневые патчи**:

| Уровень | Раздел | Что добавить | Обоснование (промпт) |
|---------|--------|-------------|---------------------|
| generative | theses | `optional: ["sum:portraits"]` | Промпт: «для каждого из философов: какое ОГРАНИЧЕНИЕ его системы данный тезис преодолевает?» — нужны портреты с описанием ограничений. В BASE `sum:portraits` — optional только для theses, но для generative это более критично |
| transformative | theses | `optional: ["sum:portraits"]` | Промпт: «какое НАПРЯЖЕНИЕ между его позицией и позициями других привело к данному тезису?» — нужны портреты для идентификации напряжений |
| generative | critique | `optional: ["sum:portraits"]` | Промпт «Проблемная генерация»: «можно ли вывести элемент из одной из систем, минуя зерно концепции?» — нужно знать системы (портреты) для проверки |
| transformative | dialogue | `required: ["graph:edges"]` | Диалог о «напряжениях» без таблицы связей неконкретен. При стандартном бюджете edges (6 443 симв.) вытесняются из optional. См. §9.1b |
| generative | dialogue | `required: ["graph:edges"]` | Аналогично — диалог о «ограничениях» требует конкретных связей между категориями |

`sum:portraits` уже в BASE.theses.optional, но при generative/transformative уровне его значимость выше. `deepMergeUniq` повышает optional → required при появлении в required-списке патча, но не меняет приоритет внутри optional. Рекомендация: промотировать в required для generative:

```javascript
generative: {
  // ... существующие ...
  theses: {
    required: ["sum:portraits"],  // повышение из optional
  },
},
```

## 3 `CONTEXT_DEPS_METHOD` — методовые патчи: корректны, но есть пробелы

**hermeneutical** — 2 патча:
- `history: +optional origin:genealogy` — герменевтическая история прослеживает «слияние горизонтов» через генеалогию. ✓
- `evolution: +optional origin:genealogy` — эволюция в герменевтическом ключе — расширение горизонтов. ✓

**analytical** — 1 патч:
- `theses: +optional glossary:table` — формализация тезисов требует точных определений. ✓

**deconstructive** — 1 патч:
- `critique: +optional origin:decomposition` — проверка «не воспроизводит ли пересборка деконструированные предпосылки». ✓

**Пропущенные методовые патчи**:

| Метод | Раздел | Что добавить | Обоснование (промпт) |
|-------|--------|-------------|---------------------|
| analytical | critique | `optional: ["glossary:table"]` | Промпт: «насколько строги **формальные определения** в глоссарии — допускают ли они пограничные случаи». Критика явно проверяет глоссарий, но `glossary:table` уже в BASE.critique.required. **Нет бага** — просто избыточная рекомендация |
| hermeneutical | glossary | `optional: ["history:genealogy"]` | Промпт: «покажи, как понимание термина меняется в зависимости от **горизонта интерпретации**». Генеалогия идей даёт исторический контекст горизонтов |
| deconstructive | theses | `optional: ["origin:decomposition"]` | Промпт: «укажи ДЕКОНСТРУИРУЕМУЮ ПРЕДПОСЫЛКУ». Декомпозиция из origin содержит анализ предпосылок. **Но**: в стандартном порядке origin генерируется ПОСЛЕ theses (SECTION_TOPO_ORDER: theses=3, origin=6), поэтому при первичной генерации контекст недоступен. Полезно только при перегенерации theses после генерации origin |
| integrative | dialogue | `optional: ["sum:portraits"]` | Промпт: «каждый участник формулирует, что именно в позиции собеседника он готов принять». Портреты нужны для реконструкции позиций. `sum:portraits` уже в BASE.dialogue.required — **нет бага** |

Рекомендуемые добавления:

```javascript
const CONTEXT_DEPS_METHOD = {
  hermeneutical: {
    history:   { optional: ["origin:genealogy"] },
    evolution: { optional: ["origin:genealogy"] },
    // ДОБАВИТЬ:
    glossary:  { optional: ["history:genealogy"] },
  },
  // analytical и deconstructive — без изменений
};
```

## 4 `INTRA_DEPS` — пропущенные рёбра

| Раздел | Пропуск | Обоснование (промпт) | Исправление |
|--------|---------|---------------------|-------------|
| sum | «Новизна» не зависит от «Портрет» | Промпт: «чего не давали исходные философы **по отдельности**» — нужны портреты | `"Новизна и ценность": ["Портрет каждого философа"]` |
| graph | Все подразделы не зависят от «Методология» | Методология задаёт правила: уровневые ограничения, типы связей, роли | `"Таблица категорий": ["Методология построения графа"]` и каскадно — остальные уже зависят от таблицы |
| critique | Пункты 2 и 3 (динамические) не зависят ни от чего | Оба оценивают результаты «Внутренней когерентности» | Добавить динамически в `buildSubsectionMap` или вручную: `"Философская новизна": ["Внутренняя когерентность"]`, и аналогично для всех вариантов пунктов 2, 3 |
| dialogue | Ссылается на `"Диалог"` вместо `"Межфилософский диалог"` | Баг §7.5 — имена не совпадают | Исправить вместе с §7.5 |
| history | «Название в ист. контексте» зависит от «Потенциальное влияние» | Промпт: «вписывается в **историю** философии», «**исторические** прецеденты» — ретроспективный вопрос | Заменить: `"Название в историческом контексте": ["Генеалогия идей", "Исторический контекст"]` |

## 5 `SUBSECTION_TO_CTX_KEYS` — отсутствующие маппинги (6 из 11 разделов)

Заполнены: graph, glossary, theses, name, sum.
Не заполнены: **history, origin, evolution, dialogue, practical, critique**.

Без этих маппингов `getCrossSecDependents` возвращает `[]` для подразделов 6 разделов → межразделовый каскад подразделов полностью отключён для них.

**Полные дополнения** (добавить в `SUBSECTION_TO_CTX_KEYS`):

```javascript
"history": {
  "Исторический контекст":            [],  // не поставляет контекстных ключей
  "Источники влияния":                [],
  "Генеалогия идей":                  ["history:genealogy"],
  "Современные концепции":            ["history:contemporary"],
  "Потенциальное влияние":            ["history:influence"],
  "Название в историческом контексте":["history:name_context"],
},
"origin": {
  "Идентификация родительских традиций": ["origin:genealogy"],
  "Элементная декомпозиция":            ["origin:decomposition"],
  "Оценка оригинальности":             ["origin:novelty"],
  "Потенциальные возражения":           [],
},
"evolution": {
  "Направления развития":              ["evolution:directions"],
  "Предлагаемые изменения графа":      ["evolution:graph_changes"],
  "Эволюция названия":                 ["evolution:name_evolution"],
  "Интеграция с современной наукой":    ["evolution:science"],
  "Временная карта развития":           [],
},
"dialogue": {
  "Межфилософский диалог":             [],  // NB: имя из промпта, не "Диалог"
  "Итоговая таблица диалога":          [],
  "Аналитический комментарий":          ["dialogue:synthesis"],
},
"practical": {
  "Образование":                        [],
  "Этика и принятие решений":           [],
  "Психология и личностное развитие":   [],
  "Социальные институты":               [],
  "Межкультурный диалог":               [],
  "Сводная таблица":                    ["practical:summary"],
},
"critique": {
  "Внутренняя когерентность":           [],
  // Динамические пункты 2, 3 — не поставляют контекстных ключей
  "Верность методу синтеза":            [],
  "Сохранение ценных аспектов":         [],
  "Разрешение противоречий":            [],
  "Слепые пятна":                       [],
  "Итоговая оценка":                    ["critique:final_table"],
  "Рекомендации по улучшению":          [],
},
```

## 6 Общая оценка системы зависимостей

**Архитектура**: три уровня (разделы, подразделы внутри, подразделы между) + карта замен + уровне/методо-патчи — **продуманная и расширяемая**.

**Данные**: ~80% рёбер корректны и обоснованы промптами. Основные проблемы:
1. **Неполнота `SUBSECTION_TO_CTX_KEYS`** (6/11 разделов) — главный пробел, отключает межразделовый подразделовый каскад
2. **`CONTEXT_DEPS_BASE`**: `sum:portraits` недоступен для comparative-graph и comparative-glossary (только в optional или отсутствует); `name:full` в required у evolution — избыточно; critique и practical не получают origin/practical контекст
3. **5 пропущенных рёбер в `INTRA_DEPS`** — каскад не предложит обновить зависимые подразделы
4. **4 завышенных `q` в `SUBSTITUTION_MAP`** + замена `graph:nodes↔glossary:table` некорректна по содержимому (§9.7)
5. **2–3 пропущенных патча** в `CONTEXT_DEPS_LEVEL/METHOD` — некритично, так как базовые зависимости покрывают
6. **dialogue: `graph:edges` вытесняется бюджетом** при transformative/generative — нужны уровневые патчи
7. **`extractGraphNodesTable` отдаёт все 6 столбцов** без оптимизации — 8.5K на каждого потребителя (§9.7)

## 7 Оптимизация извлечения `graph:nodes` + влияние на `SUBSTITUTION_MAP`

#### Проблема: `extractGraphNodesTable` отдаёт все 6 столбцов

`extractGraphNodesTable` ищет таблицу по заголовкам «категори» + «центральност» и копирует **все столбцы** через `tableToText`:

```
Категория | Тип | Определение | Центральность | Определённость | Происхождение/Генеалогия
```

При 12 категориях с развёрнутыми определениями (~100 символов) и генеалогиями (~150 символов) — это **8 453 символа** (по логу).

Для сравнения: `extractGlossaryCompact` намеренно обрезает глоссарий до **2 столбцов** (Термин | Определение), экономя ~70%. Аналогичной оптимизации для графа нет.

### Не всем потребителям нужны все столбцы

Анализ потребителей `graph:nodes` по промптам:

| Потребитель | Какие столбцы реально нужны | Лишние столбцы |
|-------------|---------------------------|----------------|
| glossary | Категория, Определение (для ссылок на §§) | Тип, Центральность, Определённость, Генеалогия |
| theses | Категория, Тип (для привязки тезисов к типам) | Определённость, Генеалогия |
| name | Категория (для отражения в названии) | Тип, Определение, Центральность, Определённость, Генеалогия |
| history | Категория, Тип | Определение, Центральность, Определённость, Генеалогия |
| practical | Категория, Определение | Тип, Центральность, Определённость, Генеалогия |
| dialogue | Категория, Тип, Определение (для конкретности) | Центральность, Определённость, Генеалогия |
| origin | Категория, Определение, **Генеалогия** (для декомпозиции) | Центральность, Определённость |
| evolution | Категория, Тип, Центральность (для приоритизации) | Определённость, Генеалогия |
| critique | **Все** (проверяет всё) | — |
| capsule (`nodes_top`) | Категория, Тип, Определение, **Центральность** (для сортировки) | Определённость, Генеалогия |

**Только critique нуждается во всех 6 столбцах.** Остальные 9 потребителей получают 2–4 лишних столбца.

### Решение: `extractGraphNodesCompact` — 3 столбца

Добавить компактный вариант, аналогичный `extractGlossaryCompact`:

```javascript
/**
 * Извлекает из таблицы категорий только 3 столбца: Категория | Тип | Определение.
 * Полная таблица (6 столбцов × 12+ строк) слишком объёмна для большинства потребителей.
 */
function extractGraphNodesCompact(containerEl) {
  const tables = containerEl.querySelectorAll("table.doc-table");
  for (const t of tables) {
    const ths = Array.from(t.querySelectorAll("thead th"))
      .map(th => th.textContent.trim().toLowerCase());
    if (ths.some(h => h.includes("категори")) &&
        ths.some(h => h.includes("центральност"))) {
      const rows = [];
      // Заголовок: берём первые 3 столбца
      const headers = Array.from(t.querySelectorAll("thead th"))
        .map(th => th.textContent.trim());
      rows.push([headers[0], headers[1], headers[2]].join(" | "));
      rows.push("--- | --- | ---");
      t.querySelectorAll("tbody tr").forEach(tr => {
        const tds = tr.querySelectorAll("td");
        if (tds.length >= 3) {
          const c0 = tds[0].textContent.trim().replace(/\n+/g, " ");
          const c1 = tds[1].textContent.trim().replace(/\n+/g, " ");
          const c2 = tds[2].textContent.trim().replace(/\n+/g, " ").replace(/\s{2,}/g, " ");
          rows.push(c0 + " | " + c1 + " | " + c2);
        }
      });
      return "ТАБЛИЦА КАТЕГОРИЙ (компактная):\n" + rows.join("\n");
    }
  }
  return null;
}
```

### Новый контекстный ключ `graph:nodes_compact`

Добавить в `extractContextFragment`:

```javascript
case "graph:nodes_compact": return extractGraphNodesCompact(el);
```

Добавить в `CTX_LABELS`:
```javascript
"graph:nodes_compact": "Граф → Таблица категорий (компактная)",
```

Добавить в `FRAGMENT_SHARE`:
```javascript
"graph:nodes_compact": 0.14,  // ~60% от graph:nodes (без 3 столбцов)
```

### Миграция потребителей с `graph:nodes` на `graph:nodes_compact`

Большинство потребителей могут использовать компактный вариант. Для critique — оставить полный:

```javascript
// В CONTEXT_DEPS_BASE:
glossary: {
  required: ["sum:goals", "graph:nodes_compact"],   // было: graph:nodes
  optional:  ["sum:portraits"],
},
theses: {
  required: ["sum:goals", "sum:tensions", "graph:nodes_compact", "graph:edges"],  // было: graph:nodes
  optional:  ["sum:portraits", "sum:novelty", "graph:topology", "glossary:table"],
},
name: {
  required: ["sum:goals", "sum:novelty", "graph:nodes_compact"],  // было: graph:nodes
  optional:  ["sum:coherence", "sum:tensions", "theses:summary"],
},
history: {
  required: ["sum:goals", "sum:portraits"],
  optional:  ["sum:novelty", "sum:tensions", "graph:nodes_compact", "graph:edges",  // было: graph:nodes
              "theses:summary", "name:title"],
},
practical: {
  required: ["sum:goals", "sum:novelty", "graph:nodes_compact", "theses:summary"],  // было: graph:nodes
  optional:  ["sum:portraits", "glossary:table", "name:title"],
},
dialogue: {
  required: ["sum:goals", "sum:portraits", "sum:tensions", "graph:nodes_compact"],  // было: graph:nodes
  optional:  ["sum:difficulty", "graph:edges", "theses:summary", "name:title"],
},
evolution: {
  required: ["sum:goals", "sum:novelty", "name:title", "graph:nodes_compact"],  // было: graph:nodes
  optional:  ["name:full", "sum:coherence", "sum:tensions",
              "graph:edges", "graph:topology", "theses:summary",
              "history:contemporary", "history:genealogy"],
},
// critique — оставить graph:nodes (полные 6 столбцов)
// origin — оставить graph:nodes (нужна Генеалогия)
// capsule — оставить graph:nodes_top (уже компактный: top-7 по центральности)
```

Оценка экономии: ~3 500 символов на каждого из 7 потребителей = **~24 500 символов** суммарно по всему документу. При стандартном бюджете 24K это существенно: освобождается место для optional-контекстов, которые сейчас вытесняются.

### Влияние на `SUBSTITUTION_MAP`

Замена `graph:nodes → glossary:table` (текущий q=3) становится ещё более некорректной при переходе на `graph:nodes_compact`:

- `graph:nodes_compact` = Категория | Тип | Определение (~5K)
- `glossary:table` (compact) = Термин | Определение (~8.7K)

Пересечение: оба содержат определения, но **graph** дополнительно даёт **Тип** (онтологическая/эпистемологическая/...), а глоссарий — **развёрнутые** определения + столбцы уровня. Тип критичен для тезисов (группировка по типам) и истории.

Для `graph:nodes_compact` нужна отдельная замена:
```javascript
"graph:nodes_compact": [
  { key: "glossary:table", q: 2 },    // определения есть, типов нет
  { key: "theses:summary", q: 1 },    // косвенно через категории в тезисах
],
```

Замену `graph:nodes` (полная таблица) для critique/origin оставить с пониженным q:
```javascript
"graph:nodes": [
  { key: "glossary:table",       q: 2 },  // было: 3
  { key: "origin:decomposition", q: 2 },
  { key: "theses:summary",       q: 1 },
],
```
