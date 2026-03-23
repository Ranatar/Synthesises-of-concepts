Полная карта архитектуры запросов
=================================

0\. Глобальное состояние
------------------------

   API_KEY             — ключ Anthropic
    totalInputTokens    — счётчик токенов входа (все проходы)
    totalOutputTokens   — счётчик токенов выхода
    ctxLog[]            — лог бюджетов контекста по разделам
    genLog[]            — лог каждого API-запроса (chars, tokens, cost, status)
    genCommon           — размеры общих частей промпта (разовый расчёт)
    G                   — данные графа категорий (заполняется после graphBodyIdx-прохода)
    graphBodyIdx        — индекс прохода, в котором генерируется граф

* * *

1\. Сбор входных данных → объект `p`
------------------------------------

| Поле | DOM-источник | Что содержит |
| --- | --- | --- |
| p.seed | #seedInput textarea | «Зерно концепции» — произвольный текст |
| p.phil | #philBox input:checked | Массив имён философов |
| p.sec | #sec* чекбоксы | Массив ключей разделов (graph, glossary, …) |
| p.method | #synthesisMethod select | dialectical / integrative / … |
| p.depth | #depthLevel select | overview / standard / deep / exhaustive |
| p.synthLevel | #synthesisLevel select | comparative / transformative / generative |
| p.ctx | #contextInput textarea | Дополнительный контекст (опционально) |

* * *

2\. Предварительная обработка перед первым запросом
---------------------------------------------------

   generateDoc()
      │
      ├─ buildEffectiveDeps(p.sec)
      │    ├─ для каждого раздела берёт CONTEXT_DEPS[sec]
      │    ├─ если раздел-источник ключа не выбран →
      │    │    findSubstitute() ищет замену в SUBSTITUTION_MAP
      │    │    (качество замены q=1..3; если q<3 и оригинал required → понижает в optional)
      │    │    если замена не найдена → ключ выпадает, раздел деградирует
      │    └─ возвращает effectiveDeps: { [secKey]: { required:[], optional:[] } }
      │
      ├─ buildDynamicOrder(effectiveDeps, p.sec)
      │    ├─ computePredecessors() — для каждого раздела строит множество предшественников
      │    │    (только не-sum источники контекстных ключей)
      │    ├─ resolveCircularDeps() — разрывает циклы зависимостей,
      │    │    удаляя слабейшие optional-рёбра (мутирует preds и effectiveDeps)
      │    ├─ Топосортировка Кана с вторичным упорядочиванием по SECTION_TOPO_ORDER:
      │    │    { sum:0, graph:1, glossary:2, theses:3, name:4,
      │    │      history:5, origin:6, practical:6, dialogue:6, evolution:7, critique:8 }
      │    └─ возвращает ["sum", ...динамический_порядок]
      │
      ├─ p.sec обновляется до нового порядка (без "sum")
      │
      ├─ buildSectionDefs(p) → массив defs[]
      │    каждый def = { key, num, title, prompt }
      │    sum всегда первый, остальные в порядке dynamicOrder
      │    prompt каждого раздела содержит §-инструкцию + `mw(p)` минимум слов
      │    mw(p) = { overview:150, standard:250, deep:400, exhaustive:600 }
      │
      ├─ groupPasses(defs) → passes[] = массив массивов
      │    каждый проход = ровно 1 раздел (i += 1)
      │
      ├─ SYS = buildSYS() — системный промпт (одни раз, общий для всех проходов)
      ├─ partBase = baseCtx(p) — базовые параметры (одни раз)
      ├─ partRules = htmlRules() — правила HTML (одни раз)
      └─ partQuality = buildPartQuality(p) — требования к качеству (одни раз)

* * *

3\. Строение единственного API-запроса (один проход = один раздел)
------------------------------------------------------------------

Каждый проход вызывает `streamResp(fp, container, SYS, onDelta)`.

### 3.1 Системный промпт → `SYS` → `body.system`

   buildSYS() → строка:
      "Ты — ведущий специалист по синтезу философских концепций
       и архитектор философских систем. Ты создаёшь ИСКЛЮЧИТЕЛЬНО
       строго структурированные академические документы..."

Передаётся как отдельное поле `system` в теле запроса (не как `messages`). Генерируется **один раз** до цикла проходов и не меняется.

* * *

### 3.2 Пользовательский промпт → `fp` → `messages[0].content`

Структура `fp` (строго в этом порядке):

   ┌──────────────────────────────────────────────┐
    │ ПАРАМЕТРЫ СИНТЕЗА:                           │
    │ {partBase}                                   │  ← постоянная часть
    ├──────────────────────────────────────────────┤
    │ {prior}                                      │  ← переменная: пусто для прохода 0
    │                                              │    buildContextForSection() для i>0
    ├──────────────────────────────────────────────┤
    │                                              │
    │ {partRules}                                  │  ← постоянная часть
    │                                              │
    ├──────────────────────────────────────────────┤
    │ ЗАДАНИЕ: составь ТОЛЬКО следующие разделы   │  ← шаблонная связка
    │ (строго в указанном порядке, без добавления  │
    │ других):                                     │
    │                                              │
    │ {sp}                                         │  ← переменная: задание раздела
    ├──────────────────────────────────────────────┤
    │ {partQuality}                                │  ← постоянная часть
    └──────────────────────────────────────────────┘

* * *

### 3.3 Постоянные части промпта (одни и те же во всех проходах)

**`partBase`** = `baseCtx(p)`:

   ЗЕРНО КОНЦЕПЦИИ: «{p.seed}»
    ФИЛОСОФЫ: {p.phil.join(", ")}
    МЕТОД: {ML[method]} — {MD[method]}   ← метка + полное описание метода
    УРОВЕНЬ СИНТЕЗА: {SL[synthLevel]} — {SD[synthLevel]}
    ГЛУБИНА: {DL[depth]}
    ВЫБРАННЫЕ РАЗДЕЛЫ: Исполнительное резюме (всегда), {secList}
    [КОНТЕКСТ: {p.ctx}]   ← только если введён

**`partRules`** = `htmlRules()`:

   ФОРМАТИРОВАНИЕ — используй исключительно следующие HTML-теги:
    - <div class="doc-section"> — обёртка раздела
    ...

(полное содержимое в коде опущено через `// остальной текст`)

**`partQuality`** = `buildPartQuality(p)`:

   ТРЕБОВАНИЯ К КАЧЕСТВУ:
    - Каждый раздел — не менее {mw(p)} слов содержательного текста
    ...

* * *

### 3.4 Переменная часть — задание раздела `sp`

javascript

   const sp = pass
      .map((d) => `§ ${d.num} — ${d.title.toUpperCase()}\n${d.prompt}`)
      .join("\n\n");
    ```
    
    Формат для каждого def:
    ```
    § N — НАЗВАНИЕ РАЗДЕЛА В ВЕРХНЕМ РЕГИСТРЕ
    {prompt раздела — специфичные инструкции}
    Минимум {mw(p)} слов.
    ```
    
    ---
    
    ### 3.5 Переменная часть — контекст из предыдущих разделов `prior`
    
    **Для прохода 0 (Исполнительное резюме):** `prior = ""` — контекст пуст.
    
    **Для проходов i > 0:**
    ```
    buildContextForSection(sectionKey, generated, depth, effectiveDeps)
      │
      ├─ deps = effectiveDeps[sectionKey]   // уже разрешённые зависимости
      ├─ budget = CONTEXT_BUDGET[depth]
      │    (critique: budget × 1.5)
      │
      ├─ ФАЗА 1: обязательный контекст
      │    for key in deps.required:
      │      extractContextFragment(key, generated) → text | null
      │      логируется в ctxLog: {key, status:"found"|"missing", len, priority:"required"}
      │
      ├─ ФАЗА 2: расчёт остатка
      │    remainingBudget = budget - sum(required lengths)
      │
      ├─ ФАЗА 3: опциональный контекст
      │    for key in deps.optional (если remainingBudget > 500):
      │      если budget кончился (≤300) → status:"skipped_budget"
      │      extractContextFragment(key, generated) → text
      │      если text.length ≤ remainingBudget → добавить полностью
      │      иначе → truncateText(text, remainingBudget-50), break
      │      логируется: {status:"found"|"truncated"|"missing", len}
      │
      ├─ ФАЗА 4: аварийное сжатие (если required > budget×1.5)
      │    UNTOUCHABLE = {graph:nodes, graph:edges, sum:goals, sum:tensions}
      │    обрезать хвостовые required-части до 50% (только не-UNTOUCHABLE)
      │
      ├─ Логируем «утраченные» ключи из оригинальных зависимостей:
      │    ключи, что есть в CONTEXT_DEPS но отсутствуют в effectiveDeps →
      │    status: "dropped" + причина
      │
      └─ ФОРМАТИРОВАНИЕ:
           allParts = [...requiredParts, ...optionalParts]
           каждый → "### {CTX_LABELS[key]}\n{text}"
           объединить через "\n\n"
           обернуть:
             "КОНТЕКСТ ИЗ ПРЕДЫДУЩИХ РАЗДЕЛОВ
              (используй термины, §§ и названия категорий; не повторяй содержание):
              \"\"\"
              {formatted}
              \"\"\""
    ```
    
    ---
    
    ## 4. Функции извлечения контекста из DOM
    
    `extractContextFragment(contextKey, generated)` — отображение ключей на DOM-операции:
    
    | Ключ | Что извлекает | Метод | Лимит |
    |---|---|---|---|
    | `sum:goals` | Секция «цели и метод» / «цели» | `extractSection(el, "цели")` | — |
    | `sum:portraits` | Секция «портрет» | `extractSection` | — |
    | `sum:novelty` | Секция «новизн» | `extractSection` | — |
    | `sum:tensions` | Секция «напряжени» | `extractSection` | — |
    | `sum:coherence` | Секция «когерентност» | `extractSection` | — |
    | `sum:difficulty` | Секция «сложност» | `extractSection` | — |
    | `graph:nodes` | Таблица с «категори» + «центральност» | `extractGraphNodesTable` | — |
    | `graph:edges` | Таблица с «источник» + «цел»/«направлен» | `extractGraphEdgesTable` | — |
    | `graph:topology` | Секция «тополог» | `extractSection` | — |
    | `glossary:table` | Только столбцы Термин\|Определение | `extractGlossaryCompact` | первые 2 из 6 колонок |
    | `theses:full` | Весь innerText | `truncateText` | 6000 симв. |
    | `theses:summary` | `<strong>` теги → нумерованный список | `extractThesesSummary` | fallback 3000 |
    | `name:title` | Первый `<strong>` + секция «обоснован» | `extractNameTitle` | fallback 1500 |
    | `name:full` | Весь innerText | `truncateText` | 4000 симв. |
    | `dialogue:synthesis` | Секция «аналитическ» | `extractSection` | — |
    | `origin:genealogy` | Секция «идентификац» | `extractSection` | — |
    | `origin:decomposition` | Секция «декомпозиц» | `extractSection` + truncate | 5000 симв. |
    | `origin:novelty` | Секция «оригинальност» | `extractSection` | — |
    | `history:full` | Весь innerText | `truncateText` | 4000 симв. |
    | `history:contemporary` | Секция «современн» | `extractSection` | — |
    | `history:genealogy` | Секция «генеалог» | `extractSection` | — |
    | `history:influence` | Секция «потенциальное влиян» | `extractSection` | — |
    | `history:name_context` | Секция «название историчес» или «соответствие назван» | `extractSection` | — |
    | `practical:summary` | Последняя `.doc-table` в разделе | таблица → текст | — |
    | `evolution:directions` | Секция «направления развития» | `extractSection` | — |
    | `evolution:graph_changes` | Секция «изменения графа» | `extractSection` | — |
    | `evolution:name_evolution` | Секция «эволюция названия» | `extractSection` | — |
    | `evolution:science` | Секция «современной науке» | `extractSection` | — |
    
    `extractSection` ищет сначала `<div data-section="...">` (приоритет), затем `<h4>` с нужным ключевым словом, собирая все дочерние элементы до следующего `<h4>` или `data-section`.
    
    ---
    
    ## 5. Зависимости разделов (`CONTEXT_DEPS`)
    
    | Раздел | required | optional |
    |---|---|---|
    | `graph` | sum:goals | sum:portraits |
    | `glossary` | sum:goals, graph:nodes | — |
    | `theses` | sum:goals, sum:tensions, graph:nodes, graph:edges | sum:portraits, sum:novelty, graph:topology, glossary:table |
    | `name` | sum:goals, sum:novelty | sum:coherence, graph:nodes, theses:summary |
    | `history` | sum:goals, sum:portraits | sum:novelty, sum:tensions, graph:nodes, theses:summary, name:title |
    | `origin` | sum:goals, sum:portraits, sum:tensions, graph:nodes, graph:edges, theses:full | sum:novelty, glossary:table, name:title |
    | `practical` | sum:goals, sum:novelty, theses:full | graph:nodes, name:title |
    | `dialogue` | sum:goals, sum:portraits, sum:tensions, graph:nodes | sum:difficulty, graph:edges, graph:topology, theses:summary, name:title |
    | `evolution` | sum:goals, sum:novelty, name:full, graph:nodes | sum:coherence, graph:edges, graph:topology, theses:summary, history:contemporary, history:genealogy, history:influence, history:name_context |
    | `critique` | sum:goals, sum:tensions, sum:coherence, graph:nodes, graph:edges, theses:full, glossary:table | sum:portraits, sum:novelty, graph:topology, name:title, history:contemporary |
    
    ---
    
    ## 6. Куда попадает каждый тип промпта
    ```
    streamResp(fp, container, SYS, onDelta)
          │
          ▼
    POST https://api.anthropic.com/v1/messages
    {
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      stream: true,
      system: SYS,          ← системный промпт (buildSYS)
      messages: [{
        role: "user",
        content: fp          ← сборный пользовательский промпт:
                                partBase + prior + partRules + sp + partQuality
      }]
    }
    ```
    
    Ответ читается через SSE:
    - `message_start` → `usageIn` (входные токены)
    - `content_block_delta` → стримится HTML в `container.innerHTML` через `requestAnimationFrame`
    - `message_delta` → `usageOut` (выходные токены)
    
    По завершении:
    - если проход = `graphBodyIdx` → `parseGraph(ct)` для построения 3D/2D графа
    - `genEntry` обновляется: `outputChars`, `inputTokens`, `outputTokens`, `cost`, `status:"done"`
    - `totalInputTokens += usage.input_tokens`, `totalOutputTokens += usage.output_tokens`
    
    ---
    
    ## 7. Итоговый поток данных (одна генерация целиком)
    ```
    UI-форма
      ↓  p = {seed, phil, sec, method, depth, synthLevel, ctx}
      ↓
    buildEffectiveDeps()   → effectiveDeps (с заменами и деградациями)
    buildDynamicOrder()    → топологически упорядоченный порядок разделов
    buildSectionDefs()     → defs[] с промптами разделов
    groupPasses()          → passes[] (по 1 разделу каждый)
    
    SYS = buildSYS()       ─────────────────┐
    partBase = baseCtx(p)  ─────────────────┤
    partRules = htmlRules()─────────────────┤  постоянные части
    partQuality = bPQ(p)   ─────────────────┘
    
    ЦИКЛ по passes[i]:
      ├─ generated = {key: DOM-элемент} — результаты всех предыдущих проходов
      ├─ prior = buildContextForSection(def.key, generated, depth, effectiveDeps)
      │           [пусто для i=0]
      │           [извлечение из DOM + бюджетирование для i>0]
      ├─ sp = `§ N — TITLE\n{prompt}` для разделов прохода
      ├─ fp = `ПАРАМЕТРЫ СИНТЕЗА:\n{partBase}{prior}\n\n{partRules}\n\nЗАДАНИЕ:...\n\n{sp}\n\n{partQuality}`
      ├─ genLog.push(genEntry)
      └─ streamResp(fp, container, SYS, onDelta)
           → POST /v1/messages {system:SYS, messages:[{user:fp}]}
           → SSE → HTML стримится в DOM
           → usage → genEntry.{inputTokens, outputTokens, cost}
    
    ИТОГ: footer с суммарными токенами и стоимостью ($3/MTok вход + $15/MTok выход)

* * *

8\. Ключевые инварианты
-----------------------

*   **`sum` (Исполнительное резюме) всегда генерируется первым** — нет `prior`, нет зависимостей
*   **Каждый следующий раздел получает `prior` только из уже отрендеренных DOM-элементов** — не из JSON, а из парсинга HTML-вывода предыдущих проходов
*   **Бюджет контекста** ограничивает `prior` по символам, не по токенам; абсолютно защищены от обрезки: `graph:nodes`, `graph:edges`, `sum:goals`, `sum:tensions`
*   **Граф данных (G)** парсится из DOM только после прохода с `key === "graph"` — используется для 3D/2D-визуализации, но не для последующих промптов
*   **Порядок разделов динамический** — определяется топосортировкой по зависимостям, а не фиксированно, что означает что при разных комбинациях включённых разделов `critique` может стоять раньше `evolution` если `evolution` не выбран, но `history` выбран и нужен `critique`\-у

