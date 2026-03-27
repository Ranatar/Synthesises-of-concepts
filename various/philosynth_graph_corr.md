▎Инструкция по реализации Подхода 4

▎Обзор

Подход 4 предполагает модульную архитектуру с явным разделением ответственности:
• Конфигурационный слой — константы, словари, метаданные
• Логический слой — парсинг, валидация, трансформация
• Представленческий слой — визуализация (2D/3D), UI, экспорт

Это позволит легко добавлять новые методы синтеза, уровни глубины и типы визуализации без изменения ядра.

---

▎ЭТАП 1: Замена глобальных констант на конфигурационный объект

▎ШАГ 1.1 — Создать объект конфигурации (ЗАМЕНИТЬ строки 1–150)

Найти и удалить:

```js
const DL = { ... };
const ML = { ... };
const MD = { ... };
const SL = { ... };
const SD = { ... };
const METHOD_GRAPH = { ... };
const METHOD_TOPOLOGY = { ... };
const TOPOLOGY_ROLES_STRUCTURAL = "...";
const TOPOLOGY_ROLES_PROCEDURAL = { ... };
const LEVEL_GRAPH_METHODOLOGY = (p) => ({ ... });
const LEVEL_GRAPH_LAST_COL_NAME = { ... };
const LEVEL_GRAPH_LAST_COL_SPEC = { ... };
const LEVEL_TOPOLOGY_NOTE = { ... };
const SEC_NAMES = { ... };
```

Заменить на:

```js
// ════════════════════════════════════════════════════════════════════════════
// CONFIG LAYER — Конфигурационный слой
// Все метаданные синтеза, словари, инструкции в одном месте
// ════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // ── Глубина синтеза ──────────────────────────────────────────────────────
  depth: {
    overview:    { label: "Обзорная",      minWords: 150 },
    standard:    { label: "Стандартная",   minWords: 250 },
    deep:        { label: "Глубокая",      minWords: 400 },
    exhaustive:  { label: "Исчерпывающая", minWords: 600 },
  },

  // ── Методы синтеза ───────────────────────────────────────────────────────
  method: {
    dialectical: {
      label:       "Диалектический",
      description: "Движение от тезиса к антитезису и к синтезу — обнаружение внутренних противоречий между традициями и их снятие в новом единстве",
      graphRequirement: "Граф обязан содержать явные диалектические тройки «тезис — антитезис — синтез»: синтетические категории маркируются в столбце происхождения/генеалогии как точки снятия противоречий с явным указанием, какое именно противоречие снято. В таблице связей тип «диалектическая» обязателен для связей внутри таких троек; тип «противоречие» — для связей тезис ↔ антитезис. В топологии выдели кластеры по диалектическому движению и укажи, какие категории являются точками снятия.",
      topologyConstraint: "Каждое упоминание противоречия между категориями ОБЯЗАНО оформляться как диалектическая тройка с явным указанием, какая категория является тезисом, какая — антитезисом, и какая снимает противоречие. Использование терминов «деконструированная», «пересобранная», «слепое пятно», «предпосылка» в смысле деконструктивного метода — ЗАПРЕЩЕНО.",
      procedureRoles: ["тезис", "антитезис", "синтез"],
    },
    integrative: {
      label:       "Интегративный",
      description: "Поиск общих оснований, скрытых точек пересечения и взаимодополняющих элементов между выбранными традициями",
      graphRequirement: "Каждая синтетическая категория обязана иметь явную ссылку на общее основание у ≥ 2 философов — конкретный принцип или интуицию, разделяемую несколькими традициями. В таблице связей типы «дополнительность» и «основание» должны преобладать. В топологии выдели «ядро пересечений» — категории, опирающиеся на все или большинство традиций, и «периферию» — категории, специфичные для одной традиции.",
      topologyConstraint: "Категории описываются через общие основания, которые они интегрируют, — НЕ через противоречия, которые они снимают. Термины «тезис», «антитезис», «снятие», «деконструированная», «пересобранная» — ЗАПРЕЩЕНЫ.",
      procedureRoles: ["синтез"],
    },
    deconstructive: {
      label:       "Деконструктивный",
      description: "Разбор базовых предпосылок каждой традиции, обнаружение скрытых допущений и пересборка из очищенных элементов",
      graphRequirement: "В описании каждой категории укажи скрытую предпосылку исходных традиций, которую она несёт, и покажи, как эта предпосылка деконструирована и на каком основании категория пересобрана. В топологии раздели категории на «деконструированные» (критически переосмысленные из исходных систем) и «пересобранные» (результат синтеза после деконструкции). Связи типов «противоречие» и «эмерджентность» — приоритетны.",
      topologyConstraint: "Связи типа «противоречие» описывай как производительное напряжение между предпосылками — НЕ как диалектическую тройку «тезис—антитезис—синтез». Термины «тезис», «антитезис», «снятие» (в гегелевском смысле Aufhebung) — ЗАПРЕЩЕНЫ.",
      procedureRoles: ["деконструированная", "пересобранная"],
    },
    hermeneutical: {
      label:       "Герменевтический",
      description: "Погружение в горизонт понимания каждой традиции и расширение собственного горизонта через слияние перспектив",
      graphRequirement: "Категории организованы через «горизонты понимания»: каждая традиция задаёт свой горизонт, связи между категориями — это точки слияния горизонтов. В описании каждой связи укажи, горизонты каких традиций она соединяет. В топологии покажи движение от частных горизонтов каждого философа к расширенному общему горизонту; выдели «мосты» — категории, обеспечивающие слияние горизонтов.",
      topologyConstraint: "Категории описываются через горизонты понимания и точки их слияния — НЕ через противоречия или деконструкцию. Термины «тезис», «антитезис», «снятие», «деконструированная», «пересобранная» — ЗАПРЕЩЕНЫ.",
      procedureRoles: ["синтез"],
    },
    analytical: {
      label:       "Аналитический",
      description: "Формализация ключевых положений, выявление логической структуры и построение непротиворечивого синтеза",
      graphRequirement: "Все определения в таблице категорий — строго через род и видовое отличие, без метафор и образных описаний; каждое определение должно быть формально отличимо от всех остальных (отсутствие пересечений объёмов). В таблице связей преобладают типы «импликация», «основание», «определяющая»; расплывчатые описания связей («связана с», «влияет на» без уточнения механизма) — запрещены.",
      topologyConstraint: "Отношения между категориями описываются через логические зависимости (импликация, основание, определяющая связь) — НЕ через диалектические движения или деконструктивные разборы. Термины «тезис», «антитезис», «снятие», «деконструированная», «пересобранная», «горизонт» — ЗАПРЕЩЕНЫ.",
      procedureRoles: ["синтез"],
    },
    creative: {
      label:       "Творческий",
      description: "Свободная комбинаторика идей с упором на оригинальность, неожиданные связи и порождающий потенциал",
      graphRequirement: "Разрешены нестандартные типы связей (ассоциативная, метафорическая, генеративная) — указывай явно в столбце «Тип». Поощряй неочевидные пары категорий: чем менее предсказуема связь, тем подробнее обоснование её продуктивности. В топологии выдели «генеративные узлы» — категории с наибольшим числом нестандартных связей. Слабые и предположительные связи допустимы при явном указании гипотетического характера.",
      topologyConstraint: "Допустимы термины из любых методических традиций, но каждое нестандартное использование требует явного пояснения. Если в описании применяется диалектический язык («тезис», «антитезис») — укажи, какое именно движение этим оформляется и почему диалектический фрейм уместен для данной пары категорий.",
      procedureRoles: ["тезис", "антитезис", "синтез", "деконструированная", "пересобранная"],
    },
  },

  // ── Уровни синтеза ───────────────────────────────────────────────────────
  synthLevel: {
    comparative: {
      label: "Сравнительный",
      description: "Категории заимствуются из исходных философов с переопределением, дополняются синтетическими",
      lastColName: "Происхождение",
      lastColSpec: "- Происхождение: от какого философа (с указанием, переопределена ли категория) или «синтез»",
      graphNote: "На сравнительном уровне «деконструированная» (если метод её допускает) означает переопределённую категорию философа, а не полный разбор предпосылок.",
    },
    transformative: {
      label: "Преобразующий",
      description: "Каждая категория обязана возникать из напряжения между минимум двумя философами, прямое заимствование запрещено",
      lastColName: "Генеалогия",
      lastColSpec: "- Генеалогия: из какого напряжения между какими философами возникла (формат: «Философ A ↔ Философ B: суть напряжения → механизм разрешения»)",
      graphNote: "На преобразующем уровне роль «генеративная» (Слой 1) обязательна для узлов, из которых исходят ≥ 2 связей типа «эмерджентность» или «порождение».",
    },
    generative: {
      label: "Порождающий",
      description: "Категории порождаются проблемой, а не философами; философы — источники ограничений, которые синтез преодолевает",
      lastColName: "Преодолённые ограничения",
      lastColSpec: "- Преодолённые ограничения: какие слепые пятна каких исходных философов данная категория компенсирует",
      graphNote: "На порождающем уровне «деконструированная» (если метод её допускает) означает категорию, вскрывающую слепое пятно исходных традиций; «пересобранная» — категорию, предлагающую то, чего не мог сформулировать ни один из исходных философов.",
    },
  },

  // ── Структурные роли узлов ──────────────────────────────────────────────
  structuralRoles: ["центральная", "периферийная", "мост", "генеративная", "ядро"],

  // ── Процессуальные роли по методам ──────────────────────────────────────
  procedureRolesByMethod: {
    dialectical: ["тезис", "антитезис", "синтез"],
    integrative: ["синтез"],
    deconstructive: ["деконструированная", "пересобранная"],
    hermeneutical: ["синтез"],
    analytical: ["синтез"],
    creative: ["тезис", "антитезис", "синтез", "деконструированная", "пересобранная"],
  },

  // ── Названия разделов документа ─────────────────────────────────────────
  sections: {
    graph:    "Граф категорий",
    glossary: "Глоссарий терминов",
    theses:   "Корпус тезисов",
    history:  "Историческая контекстуализация",
    name:     "Анализ названия",
    practical:"Практическое применение",
    dialogue: "Диалог между традициями",
    evolution:"Эволюция и перспективы",
    critique: "Критический анализ",
    origin:   "Анализ происхождения",
  },

  // ── Типы категорий (онтологические классы) ──────────────────────────────
  categoryTypes: [
    "онтологическая",
    "эпистемологическая",
    "этическая",
    "аксиологическая",
    "метафизическая",
    "логическая",
    "практическая",
    "эстетическая",
    "антропологическая",
    "феноменологическая",
    "экзистенциальная",
    "социальная",
    "политическая",
    "теологическая",
  ],

  // ── Типы связей в графе ─────────────────────────────────────────────────
  edgeTypes: [
    "иерархическая",
    "диалектическая",
    "каузальная",
    "корреляционная",
    "дополнительность",
    "противоречие",
    "эмерджентность",
    "часть-целое",
    "средство-цель",
    "основание",
    "определяющая",
    "развитие",
  ],

  // ── Направления рёбер ───────────────────────────────────────────────────
  edgeDirections: ["однонаправленная", "двунаправленная", "рефлексивная"],
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Получить минимальное количество слов по глубине
// ════════════════════════════════════════════════════════════════════════════
function getMinWords(depth) {
  return CONFIG.depth[depth]?.minWords || 250;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Получить метаданные метода синтеза
// ════════════════════════════════════════════════════════════════════════════
function getMethodMeta(methodKey) {
  return CONFIG.method[methodKey] || CONFIG.method.analytical;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Получить метаданные уровня синтеза
// ════════════════════════════════════════════════════════════════════════════
function getSynthLevelMeta(levelKey) {
  return CONFIG.synthLevel[levelKey] || CONFIG.synthLevel.comparative;
}
```

---

▎ЭТАП 2: Создание логического слоя (парсинг и валидация)

▎ШАГ 2.1 — Заменить функции парсинга (НАЙТИ и ЗАМЕНИТЬ строки ~200–350)

Найти:

```js
function parseTopology(container, nodeNames) { ... }
function normalizeName(name) { ... }
function normalizeType(t) { ... }
function parseGraph(ct) { ... }
```

Заменить на:

```js
// ════════════════════════════════════════════════════════════════════════════
// LOGIC LAYER — Логический слой
// Парсинг, валидация, трансформация данных графа
// ════════════════════════════════════════════════════════════════════════════

// ── Нормализация имён категорий ─────────────────────────────────────────────
function normalizeName(name) {
  return name
    .replace(/[.*?]/g, "")
    .replace(/(.*?)/g, "")
    .replace(/[«»""]/g, "")
    .trim();
}

// ── Нормализация типов категорий (убирает маркеры деконструкции) ────────────
function normalizeType(t) {
  return (t || "")
    .replace(/s*[·-–—/]s*[А-ЯЁA-Zа-яёa-z]{1,3}s*$/g, "")
    .replace(/s*(s*[А-ЯЁA-Zа-яёa-z]{1,3}s*)s*$/g, "")
    .trim();
}

// ── Парсинг топологии: кластеры и роли узлов ───────────────────────────────
function parseTopology(container, nodeNames, methodKey) {
  const result = {
    clusters:      {},
    roles:         {},
    clusterLabels: [],
  };
  
  if (!nodeNames.length) return result;

  const sec = container.querySelector('[data-section="Топология графа"]');
  if (!sec) return result;

  const procedureRoles = CONFIG.procedureRolesByMethod[methodKey] || [];
  const ROLE_MAP = {
    "центральная":        "central",
    "периферийная":       "peripheral",
    "мост":               "bridge",
    "синтез":             "synthesis",
    "тезис":              "thesis",
    "антитезис":          "antithesis",
    "генеративная":       "generative",
    "ядро":               "core",
    "деконструированная": "deconstructed",
    "пересобранная":      "reassembled",
  };

  function addRole(name, role) {
    if (!result.roles[name]) result.roles[name] = [];
    if (!result.roles[name].includes(role)) result.roles[name].push(role);
  }

  function clusterNamePart(label) {
    const m = label.match(/^[IVXLCDM]+s*[-–—]s*(.+)$/i);
    return m ? m[1].trim() : label;
  }

  function findOrCreateCluster(label) {
    if (!label) return -1;
    let idx = result.clusterLabels.indexOf(label);
    if (idx !== -1) return idx;

    const SEPS = [" —", " –", " -", "u00a0—", "u00a0–", "u00a0-", " ", "u00a0"];
    idx = result.clusterLabels.findIndex(existing => {
      if (SEPS.some(s => existing.startsWith(label + s))) return true;
      if (SEPS.some(s => label.startsWith(existing + s))) return true;
      return false;
    });
    if (idx !== -1) return idx;

    const namePart = clusterNamePart(label);
    idx = result.clusterLabels.findIndex(existing =>
      clusterNamePart(existing).toLowerCase() === namePart.toLowerCase()
    );
    if (idx !== -1) return idx;

    idx = result.clusterLabels.length;
    result.clusterLabels.push(label);
    return idx;
  }

  function assignCluster(name, idx) {
    if (idx === -1) return;
    if (!result.clusters[name]) result.clusters[name] = [];
    if (!result.clusters[name].includes(idx)) result.clusters[name].push(idx);
  }

  const topoSection = sec.querySelector('[data-section="Топологическая таблица"]');
  const tableScope  = topoSection || sec;

  tableScope.querySelectorAll("table.doc-table tbody tr").forEach(tr => {
    const td = Array.from(tr.querySelectorAll("td")).map(c => c.textContent.trim());
    if (td.length < 2) return;

    const name = normalizeName(td[0]);
    if (!name) return;

    const clusterRaw = (td[1] || "").trim();
    if (clusterRaw) {
      clusterRaw.split(/s*/s*/).forEach(part => {
        const label = part.trim();
        if (!label) return;
        if (/^мост$/i.test(label)) {
          addRole(name, "bridge");
        } else {
          assignCluster(name, findOrCreateCluster(label));
        }
      });
    }

    const rolesRaw = (td[2] || "").trim();
    if (rolesRaw) {
      rolesRaw.split(/[,/]+/).forEach(part => {
        const key = part.trim().toLowerCase();
        const role = Object.entries(ROLE_MAP).find(([k]) => k === key)?.[1];
        if (role) addRole(name, role);
      });
    }
  });

  return result;
}

// ── Парсинг полного графа: узлы, рёбра, топология ──────────────────────────
function parseGraph(container, methodKey) {
  const nodes = [];
  const edges = [];

  // Парсинг таблицы категорий
  const nodeSection = container.querySelector('[data-section="Таблица категорий"]');
  if (nodeSection) {
    nodeSection.querySelectorAll("table.doc-table tbody tr").forEach(tr => {
      const td = Array.from(tr.querySelectorAll("td")).map(c => c.textContent.trim());
      if (td.length >= 4) {
        nodes.push({
          name: normalizeName(td[0]),
          type: normalizeType(td[1] || "").toLowerCase(),
          def:  td[2] || "",
          cen:  parseFloat(td[3]) || 0.5,
          cert: parseFloat(td[4]) || 0.5,
          orig: td[5] || "",
        });
      }
    });
  }

  // Парсинг таблицы связей
  const edgeSection = container.querySelector('[data-section="Таблица связей"]');
  if (edgeSection) {
    edgeSection.querySelectorAll("table.doc-table tbody tr").forEach(tr => {
      const td = Array.from(tr.querySelectorAll("td")).map(c => c.textContent.trim());
      if (td.length >= 4) {
        edges.push({
          src:  normalizeName(td[0]),
          desc: td[1] || "",
          tgt:  normalizeName(td[2]),
          type: td[3] || "",
          dir:  (td[4] || "однонаправленная").toLowerCase(),
          str:  parseFloat(td[5]) || 0.5,
        });
      }
    });
  }

  // Парсинг топологии
  const topology = parseTopology(container, nodes.map(n => n.name), methodKey);

  return { nodes, edges, topology };
}

// ── Валидация графа: проверка связности и консистентности ──────────────────
function validateGraph(graphData) {
  const errors = [];
  const warnings = [];

  const nodeNames = new Set(graphData.nodes.map(n => n.name.toLowerCase()));

  // Проверка: все рёбра указывают на существующие узлы
  graphData.edges.forEach((e, i) => {
    const src = e.src.toLowerCase();
    const tgt = e.tgt.toLowerCase();
    if (!nodeNames.has(src))
      errors.push(Ребро ${i}: источник "${e.src}" не найден в таблице категорий);
    if (!nodeNames.has(tgt))
      errors.push(Ребро ${i}: цель "${e.tgt}" не найден в таблице категорий);
  });

  // Проверка: граф связный (простой BFS)
  if (graphData.nodes.length > 0 && graphData.edges.length > 0) {
    const adj = {};
    graphData.nodes.forEach(n => { adj[n.name.toLowerCase()] = []; });
    graphData.edges.forEach(e => {
      const src = e.src.toLowerCase();
      const tgt = e.tgt.toLowerCase();
      if (adj[src] && adj[tgt]) {
        adj[src].push(tgt);
        if (!e.dir.includes("однонаправлен")) adj[tgt].push(src);
      }
    });

    const visited = new Set();
    const queue = [graphData.nodes[0].name.toLowerCase()];
    visited.add(queue[0]);
    while (queue.length > 0) {
      const u = queue.shift();
      for (const v of adj[u] || []) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
        }
      }
    }

    if (visited.size < graphData.nodes.length)
      warnings.push("⚠ Граф несвязный: существуют изолированные компоненты");
  }

  // Проверка: типы категорий из конфига
  const validTypes = new Set(CONFIG.categoryTypes.map(t => t.toLowerCase()));
  graphData.nodes.forEach((n, i) => {
    if (n.type && !validTypes.has(n.type))
      warnings.push(Узел ${i} "${n.name}": неизвестный тип "${n.type}");
  });

  return { valid: errors.length === 0, errors, warnings };
}
```

---

▎ЭТАП 3: Создание слоя визуализации (2D/3D)

▎ШАГ 3.1 — Рефакторинг цветовых функций (НАЙТИ и ЗАМЕНИТЬ строки ~400–550)

Найти:

```js
const TC = { ... };
const EC = { ... };
const CPAL = [ ... ];
function _hexToHSL(hex) { ... }
function _hslToHex({ h, s, l }) { ... }
function _blendHex(hexArr) { ... }
function typeColor(t) { ... }
function typeColorHex(t) { ... }
function edgeTypeStyle(type) { ... }
```

Заменить на:

```js
// ════════════════════════════════════════════════════════════════════════════
// PRESENTATION LAYER — Слой визуализации
// Цвета, стили, геометрия, рендеринг
// ════════════════════════════════════════════════════════════════════════════

// ── Палитры цветов ─────────────────────────────────────────────────────────
const PALETTE = {
  // Цвета типов категорий (hex → число для Three.js)
  types: {
    онтологическ:       0x4a90d9,
    эпистемологическ:   0x50c878,
    этическ:            0xe8a838,
    аксиологическ:      0xe8a838,
    метафизическ:       0x9b59b6,
    логическ:           0x1abc9c,
    практическ:         0xe67e22,
    эстетическ:         0xe91e63,
    антропологическ:    0xf39c12,
    феноменологическ:   0x8e44ad,
    экзистенциальн:     0xc0392b,
    социальн:           0x27ae60,
    политическ:         0x2980b9,
    теологическ:        0x7f8c8d,
  },

  // Стили рёбер (цвет + пунктир)
  edges: {
    иерархическ:      { color: "#7f8c8d", dash: null   },
    диалектическ:     { color: "#e74c3c", dash: null   },
    каузальн:         { color: "#4a90d9", dash: null   },
    корреляционн:     { color: "#aaaaaa", dash: "5,3"  },
    дополнительност:  { color: "#2ecc71", dash: null   },
    противоречи:      { color: "#c0392b", dash: "7,3"  },
    эмерджентн:       { color: "#f1c40f", dash: null   },
    часть:            { color: "#8e44ad", dash: null   },
    средство:         { color: "#e67e22", dash: null   },
    основани:         { color: "#1abc9c", dash: null   },
    определяющ:       { color: "#d35400", dash: "9,3"  },
    развити:          { color: "#27ae60", dash: null   },
  },

  // Палитра кластеров (циклическая)
  clusters: [
    "#4a90d9", "#e8a838", "#50c878", "#e74c3c",
    "#9b59b6", "#1abc9c", "#f39c12", "#e91e63",
  ],
};

// ── Приоритет ролей для выбора визуального представления ──────────────────
const ROLE_SHAPE_PRIORITY = [
  "synthesis", "thesis", "antithesis", "generative", "core",
  "bridge", "central", "deconstructed", "reassembled", "peripheral"
];

// ── Утилиты HSL для смешивания цветов ───────────────────────────────────────
function hexToHSL(hex) {
  const r = ((hex >> 16) & 0xff) / 255;
  const g = ((hex >>  8) & 0xff) / 255;
  const b = ( hex        & 0xff) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, l };
}

function hslToHex({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  if (s === 0) { const v = Math.round(l * 255); return (v << 16) | (v << 8) | v; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return (Math.round(hue2rgb(p, q, h/360 + 1/3) * 255) << 16)
       | (Math.round(hue2rgb(p, q, h/360      ) * 255) <<  8)
       |  Math.round(hue2rgb(p, q, h/360 - 1/3) * 255);
}

function blendHexColors(hexArr) {
  const valid = hexArr.filter(c => c != null);
  if (!valid.length) return 0x95a5a6;
  if (valid.length === 1) return valid[0];
  let sinH = 0, cosH = 0, sumS = 0, sumL = 0;
  for (const c of valid) {
    const { h, s, l } = hexToHSL(c);
    sinH += Math.sin(h * Math.PI / 180);
    cosH += Math.cos(h * Math.PI / 180);
    sumS += s; sumL += l;
  }
  return hslToHex({
    h: Math.atan2(sinH, cosH) * 180 / Math.PI,
    s: sumS / valid.length,
    l: sumL / valid.length,
  });
}

// ── Получить цвет узла по типу (поддержка множественных типов) ──────────────
function getNodeColor(typeStr) {
  if (!typeStr) return 0x95a5a6;
  const parts = typeStr.split(/[/·,;]+/).map(s => s.trim()).filter(Boolean);
  const colors = parts.map(part => {
    for (const [k, v] of Object.entries(PALETTE.types))
      if (part.includes(k)) return v;
    return null;
  });
  return blendHexColors(colors);
}

function getNodeColorHex(typeStr) {
  return "#" + getNodeColor(typeStr).toString(16).padStart(6, "0");
}

// ── Получить стиль рёбер по типу (цвет + пунктир) ──────────────────────────
function getEdgeStyle(typeStr) {
  if (!typeStr) return { color: "#444", dash: "3,3" };
  const parts = typeStr.split(/[/·,;]+/).map(s => s.trim()).filter(Boolean);
  const matched = [];
  for (const part of parts) {
    const t = part.toLowerCase();
    let found = false;
    for (const [k, v] of Object.entries(PALETTE.edges))
      if (t.includes(k)) { matched.push(v); found = true; break; }
    if (!found) matched.push(null);
  }
  const valid = matched.filter(v => v != null);
  if (!valid.length) return { color: "#b39ddb", dash: "4,2" };
  if (valid.length === 1) return valid[0];
  const mixed = "#" + blendHexColors(valid.map(s => parseInt(s.color.slice(1), 16)))
                        .toString(16).padStart(6, "0");
  const dash = valid.find(s => s.dash)?.dash ?? null;
  return { color: mixed, dash };
}

// ── Получить первичную роль узла (по приоритету) ──────────────────────────
function getTopRole(rolesSet) {
  if (!rolesSet) return null;
  const roles = rolesSet instanceof Set ? [...rolesSet] : rolesSet;
  for (const r of ROLE_SHAPE_PRIORITY)
    if (roles.includes(r)) return r;
  return null;
}
```

---

▎ЭТАП 4: Замена функций построения графиков (2D/3D)

▎ШАГ 4.1 — Рефакторинг build3D() (НАЙТИ и ЗАМЕНИТЬ строки ~1000–1500)

Найти:
```js
function build3D() { ... }
```

Заменить на:

```js
// ── Геометрия узлов по ролям ───────────────────────────────────────────────
function getNodeGeometry(role, radius) {
  switch (role) {
    case "synthesis":     return new THREE.OctahedronGeometry(radius, 0);
    case "thesis":        return new THREE.TetrahedronGeometry(radius, 0);
    case "antithesis":    return new THREE.TetrahedronGeometry(radius, 0);
    case "generative":    return new THREE.IcosahedronGeometry(radius, 0);
    case "core":          return new THREE.OctahedronGeometry(radius, 0);
    case "bridge":        return new THREE.BoxGeometry(radius*1.6, radius*1.6, radius*1.6);
    case "central":       return new THREE.DodecahedronGeometry(radius, 0);
    case "deconstructed": return new THREE.IcosahedronGeometry(radius, 1);
    case "reassembled":   return new THREE.TetrahedronGeometry(radius, 0);
    default:              return new THREE.SphereGeometry(radius, 20, 20);
  }
}

// ── Построение 3D-сцены ────────────────────────────────────────────────────
function build3D() {
  const container = document.getElementById("view3d");
  const oldCanvas = container.querySelector("canvas");
  if (oldCanvas) oldCanvas.remove();
  if (renderer3d) { renderer3d.dispose(); renderer3d = null; }
  if (anim3d) cancelAnimationFrame(anim3d);

  if (scene3d) {
    scene3d.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
    scene3d = null;
  }

  const W = container.clientWidth, H = container.clientHeight;
  const { ns, es } = warmup(G.nodes, G.edges, 3);

  function getRoles(n) {
    const r = G.topology?.roles?.[n.name];
    if (!r) return new Set();
    if (r instanceof Set) return r;
    if (Array.isArray(r)) return new Set(r);
    return new Set();
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14);
  scene3d = scene;
  const cam = new THREE.PerspectiveCamera(50, W / H, 1, 2000);
  cam.position.set(0, 0, 150);
  renderer3d = new THREE.WebGLRenderer({ antialias: true });
  renderer3d.setSize(W, H);
  renderer3d.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.insertBefore(renderer3d.domElement, container.firstChild);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dl = new THREE.DirectionalLight(0xffffff, 0.8);
  dl.position.set(50, 80, 100);
  scene.add(dl);

  // ── Создание узлов ─────────────────────────────────────────────────────
  const meshes = [];
  const types = new Set();
  for (const n of ns) {
    const c    = getNodeColor(n.type);
    const cert = n.cert ?? 0.5;
    types.add(n.type || "другое");
    const r = 1.5 + n.cen * 3;

    const roles    = getRoles(n);
    const role     = getTopRole(roles);
    const geometry = getNodeGeometry(role, r);
    
    const m = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: c, emissive: c, emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.2 + cert * 0.65,
      }),
    );
    
    if (role === "antithesis")   m.scale.y = -1;
    if (role === "core")         m.scale.set(1, 0.4, 1);
    
    if (role === "bridge") {
      const wf = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.6 }),
      );
      m.add(wf);
    }
    
    if (role === "deconstructed") {
      m.material.opacity = 0.05;
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.8 }),
      );
      m.add(edges);
    }

    if (role === "reassembled") {
      m.material.side = THREE.DoubleSide;
      const geo2 = new THREE.TetrahedronGeometry(r, 0);
      const mat2 = new THREE.MeshPhongMaterial({
        color: c, emissive: c, emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.2 + cert * 0.65,
        side: THREE.DoubleSide,
      });
      const m2 = new THREE.Mesh(geo2, mat2);
      m2.scale.set(1, -1, 1);
      m.add(m2);
      m.quaternion.setFromUnitVectors(
        new THREE.Vector3(1, 1, 1).normalize(),
        new THREE.Vector3(0, 1, 0)
      );
    }
    
    m.position.set(n.x, n.y, n.z);
    m.userData = { nodeIdx: n.id, baseOpacity: 0.2 + cert * 0.65 };
    scene.add(m);
    meshes.push(m);

    const sp = mkSprite(n.name);
    sp.position.set(n.x, n.y + r + 2.5, n.z);
    sp.userData = { labelFor: n.id };
    scene.add(sp);
  }

  // ── Создание рёбер и стрелок ───────────────────────────────────────────
  const edgeGeos      = [];
  const edgeHitMeshes = [];
  const reflMeshes    = [];
  const arrowMeshes   = [];
  const edgeMaterials = [];

  function updateCone(mesh, si, ti, pointsToTi) {
    const s = ns[si], t = ns[ti];
    const ev = new THREE.Vector3(t.x - s.x, t.y - s.y, t.z - s.z);
    const len = ev.length();
    if (len < 0.001) return;
    const dir = ev.divideScalar(len);
    if (pointsToTi) {
      const r = 1.5 + (t.cen || 0.5) * 3;
      mesh.position.copy(
        new THREE.Vector3(t.x, t.y, t.z).sub(dir.clone().multiplyScalar(r + 1.5))
      );
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    } else {
      const r = 1.5 + (s.cen || 0.5) * 3;
      const d2 = dir.clone().negate();
      mesh.position.copy(
        new THREE.Vector3(s.x, s.y, s.z).sub(d2.clone().multiplyScalar(r + 1.5))
      );
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d2);
    }
  }

  for (const e of es) {
    const s    = ns[e.si], t = ns[e.ti];
    const refl = e.dir.includes("рефлексив") || e.si === e.ti;
    const bi   = e.dir.includes("двунаправлен");

    const { color: colHex, dash } = getEdgeStyle(e.type);
    const col = parseInt(colHex.replace("#", ""), 16);
    const op  = 0.3 + (e.str || 0.5) * 0.5;

    if (refl) {
      const nodeR  = 1.5 + (s.cen || 0.5) * 1.5;
      const loopR  = nodeR * 1.8;
      const tubeR  = Math.max(0.2, nodeR * 0.1);
      const SEGS   = 48;
      const GAP    = Math.PI * 0.09;

      const pts = [];
      const startA = -Math.PI / 2 + GAP / 2;
      for (let i = 0; i <= SEGS; i++) {
        const a = startA + (i / SEGS) * (2 * Math.PI - GAP);
        pts.push(new THREE.Vector3(
          Math.cos(a) * loopR,
          Math.sin(a) * loopR,
          0
        ));
      }
      const curve    = new THREE.CatmullRomCurve3(pts, false);
      const loopGeo  = new THREE.TubeGeometry(curve, SEGS, tubeR, 6, false);
      const loopMesh = new THREE.Mesh(
        loopGeo,
        new THREE.MeshPhongMaterial({
          color: col, emissive: col, emissiveIntensity: 0.2,
          transparent: true, opacity: op + 0.1,
        }),
      );
      loopMesh.position.set(s.x, s.y + nodeR + loopR, s.z);
      scene.add(loopMesh);
      reflMeshes.push({ mesh: loopMesh, si: e.si });
      loopMesh.material.userData = { baseOp: loopMesh.material.opacity };
      edgeMaterials.push(loopMesh.material);

      const loopHit = new THREE.Mesh(
        new THREE.TorusGeometry(loopR, tubeR + 1.5, 6, 16),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      loopHit.position.set(s.x, s.y + nodeR + loopR, s.z);
      loopHit.userData = { edgeData: e };
      scene.add(loopHit);
      edgeHitMeshes.push({ mesh: loopHit, si: e.si, ti: e.ti });
    } else {
      let lineMat;
      if (dash) {
        const [dashSize, gapSize] = dash.split(",").map(Number);
        lineMat = new THREE.LineDashedMaterial({
          color: col, transparent: true, opacity: op,
          dashSize: dashSize ?? 3, gapSize: gapSize ?? 2,
        });
      } else {
        lineMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op });
      }
      if (!lineMat.userData) lineMat.userData = {};
      lineMat.userData.baseOp = lineMat.opacity;
      edgeMaterials.push(lineMat);

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(s.x, s.y, s.z),
        new THREE.Vector3(t.x, t.y, t.z),
      ]);
      const line = new THREE.Line(geo, lineMat);
      if (dash) line.computeLineDistances();
      line.userData = { si: e.si, ti: e.ti, baseOp: lineMat.opacity };
      scene.add(line);
      edgeGeos.push({ geo, si: e.si, ti: e.ti, line, isDashed: !!dash });

      const dir = new THREE.Vector3(t.x - s.x, t.y - s.y, t.z - s.z).normalize();
      const tr  = 1.5 + (ns[e.ti].cen || 0.5) * 3;
      const ap  = new THREE.Vector3(t.x, t.y, t.z).sub(dir.clone().multiplyScalar(tr + 1.5));
      const cn  = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 1, 3, 8),
        new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: op + 0.1 }),
      );
      cn.position.copy(ap);
      cn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      cn.userData = { si: e.si, ti: e.ti, baseOp: lineMat.opacity };
      scene.add(cn);
      arrowMeshes.push({ mesh: cn, si: e.si, ti: e.ti, pointsToTi: true });
      cn.material.userData = { baseOp: cn.material.opacity };
      edgeMaterials.push(cn.material);

      if (bi) {
        const d2  = dir.clone().negate();
        const sr  = 1.5 + (ns[e.si].cen || 0.5) * 3;
        const ap2 = new THREE.Vector3(s.x, s.y, s.z).sub(d2.clone().multiplyScalar(sr + 1.5));
        const cn2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0, 1, 3, 8),
          new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: op + 0.1 }),
        );
        cn2.position.copy(ap2);
        cn2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d2);
        cn2.userData = { si: e.si, ti: e.ti, baseOp: lineMat.opacity };
        scene.add(cn2);
        arrowMeshes.push({ mesh: cn2, si: e.si, ti: e.ti, pointsToTi: false });
        cn2.material.userData = { baseOp: cn2.material.opacity };
        edgeMaterials.push(cn2.material);
      }

      const edgeVec = new THREE.Vector3(t.x - s.x, t.y - s.y, t.z - s.z);
      const edgeLen = edgeVec.length();
      const hitMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, edgeLen, 6),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hitMesh.position.set((s.x + t.x) / 2, (s.y + t.y) / 2, (s.z + t.z) / 2);
      hitMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), edgeVec.normalize());
      hitMesh.userData = { edgeData: e, _origLen: edgeLen };
      scene.add(hitMesh);
      edgeHitMeshes.push({ mesh: hitMesh, si: e.si, ti: e.ti });
    }
  }

  // ── Кластерные оболочки ────────────────────────────────────────────────
  const clusterShells = [];
  {
    const topo   = G.topology;
    const labels = topo?.clusterLabels || [];
    if (labels.length > 0) {
      const clusterNodes = {};
      for (const n of ns) {
        const clusterList = topo.clusters?.[n.name] || [];
        for (const idx of clusterList) {
          if (!clusterNodes[idx]) clusterNodes[idx] = [];
          clusterNodes[idx].push(n);
        }
      }
      for (const [idxStr, members] of Object.entries(clusterNodes)) {
        const idx   = Number(idxStr);
        const color = parseInt((PALETTE.clusters[idx % PALETTE.clusters.length] || "#555555").replace("#", ""), 16);
        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(1, 16, 16),
          new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.04,
            side: THREE.BackSide, depthWrite: false,
          }),
        );
        shell.userData = { clusterIdx: idx };
        scene.add(shell);
        clusterShells.push({ mesh: shell, clusterIdx: idx });
      }
    }
  }

  // ── Остальной код build3D (интерактивность, анимация) ────────────────────
  // [ОСТАЁТСЯ БЕЗ ИЗМЕНЕНИЙ — см. исходный файл, строки ~1300–1800]
  // Копировать весь код после создания clusterShells до конца функции build3D

  // ... (весь оставшийся код интерактивности и анимации)
}
```

---

▎ЭТАП 5: Замена функции build2D()

▎ШАГ 5.1 — Рефакторинг build2D() (НАЙТИ и ЗАМЕНИТЬ строки ~1800–2200)

Найти:
```js
function build2D() { ... }
```

Заменить на:

```js
// ── Построение 2D-сцены (D3.js) ────────────────────────────────────────────
function build2D() {
  const container = document.getElementById("view2d");
  if (sim2d) { sim2d.stop(); sim2d = null; }
  container.innerHTML = "";
  const W = container.clientWidth, H = container.clientHeight;

  // ── Подготовка данных ─────────────────────────────────────────────────
  const topo = G.topology || { clusters: {}, roles: {}, clusterLabels: [] };
  const nm   = Object.fromEntries(G.nodes.map((n, i) => [n.name.toLowerCase(), i]));

  const nodes = G.nodes.map((n, i) => ({
    ...n,
    id:      i,
    cluster: topo.clusters[n.name] ?? [],
    roles: (() => {
      const r = topo.roles[n.name];
      if (!r) return new Set();
      if (r instanceof Set) return r;
      if (Array.isArray(r)) return new Set(r);
      return new Set();
    })(),
  }));

  const links = G.edges
    .map(e => ({
      source: nm[e.src.toLowerCase().trim()],
      target: nm[e.tgt.toLowerCase().trim()],
      type:   e.type,
      dir:    e.dir,
      str:    e.str,
      desc:   e.desc,
    }))
    .filter(l => l.source != null & l.target != null);

  const regularLinks = links.filter(l => !l.dir.includes("рефлексив"));
  const reflLinks    = links.filter(l =>  l.dir.includes("рефлексив"));

  // ── Плоский массив кольцевых данных ───────────────────────────────────
  const ringData = nodes.flatMap(n =>
    n.cluster.map((clIdx, offset) => ({ node: n, clIdx, offset }))
  );

  // ── SVG-сцена ─────────────────────────────────────────────────────────
  const svg = d3.select(container).append("svg")
    .attr("width", W).attr("height", H)
    .style("background", "#0a0a14");
  const g = svg.append("g");
  svg.call(d3.zoom().scaleExtent([0.2, 5])
    .on("zoom", e => g.attr("transform", e.transform)));

  // ── Defs ──────────────────────────────────────────────────────────────
  const defs = g.append("defs");
  const glowFilter = defs.append("filter").attr("id", "glow2");
  glowFilter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
  glowFilter.append("feMerge").selectAll("feMergeNode")
    .data(["blur", "SourceGraphic"]).enter()
    .append("feMergeNode").attr("in", d => d);

  function addMarker(id, color, reverse) {
    defs.append("marker")
      .attr("id", id)
      .attr("viewBox", "0 -3 6 6")
      .attr("refX", 6)
      .attr("refY", 0)
      .attr("markerWidth", 4).attr("markerHeight", 4)
      .attr("orient", reverse ? "auto-start-reverse" : "auto")
      .append("path").attr("d", "M0,-3L6,0L0,3").attr("fill", color);
  }

  const markerColorSet = new Set();
  links.forEach(l => markerColorSet.add(getEdgeStyle(l.type).color));

  function colorId(hex) { return hex.replace("#", ""); }
  markerColorSet.forEach(color => {
    const cid = colorId(color);
    addMarker(arr-fwd-${cid},       color, false);
    addMarker(arr-bi-end-${cid},    color, false);
    addMarker(arr-bi-start-${cid},  color, true);
  });

  // ── Геометрия рёбер ───────────────────────────────────────────────────
  function edgeEndpoints(d) {
    const sx = d.source.x, sy = d.source.y;
    const tx = d.target.x, ty = d.target.y;
    const angle = Math.atan2(ty - sy, tx - sx);
    const rs = 6 + (d.source.cen || 0) * 14;
    const rt = 6 + (d.target.cen || 0) * 14;
    return {
      x1: sx + Math.cos(angle) * rs, y1: sy + Math.sin(angle) * rs,
      x2: tx - Math.cos(angle) * rt, y2: ty - Math.sin(angle) * rt,
    };
  }

  function arcPath(d) {
    const x = typeof d.source === "object" ? d.source.x : nodes[d.source].x;
    const y = typeof d.source === "object" ? d.source.y : nodes[d.source].y;
    const cen = typeof d.source === "object" ? (d.source.cen || 0) : 0;
    const r = 18 + cen * 12;
    return M${x},${y}A${r},${r},0,1,1,${x + 1},${y + 1};
  }

  // ── Симуляция ─────────────────────────────────────────────────────────
  sim2d = d3.forceSimulation(nodes)
    .force("link",      d3.forceLink(links).id(d => d.id).distance(180).strength(d => d.str || 0.1))
    .force("charge",    d3.forceManyBody().strength(-300))
    .force("center",    d3.forceCenter(W / 2, H / 2))
    .force("collision", d3.forceCollide().radius(d => 10 + d.cen * 20));

  // ── Невидимые зоны попадания ──────────────────────────────────────────
  const linkHit = g.selectAll(".edge-hit").data(regularLinks).enter()
    .append("line").attr("class", "edge-hit")
    .attr("stroke", "transparent").attr("stroke-width", 12).style("cursor", "pointer");
  linkHit.append("title").text(d => ${d.desc}\n[${d.type}]\n${d.dir});

  const arcHit = g.selectAll(".edge-arc-hit").data(reflLinks).enter()
    .append("path").attr("class", "edge-arc-hit").attr("fill", "none")
    .attr("stroke", "transparent").attr("stroke-width", 10).style("cursor", "pointer");
  arcHit.append("title").text(d => ${d.desc}\n[${d.type}]\n${d.dir});

  // ── Видимые рёбра ─────────────────────────────────────────────────────
  const link = g.selectAll(".edge-line").data(regularLinks).enter()
    .append("line").attr("class", "edge-line").attr("stroke-linecap", "round")
    .each(function(d) {
      const { color, dash } = edgeTypeStyle(d.type);
      const cid = colorId(color); 
      const isBi  = d.dir.includes("двунаправлен");
      // Слабые связи (str < 0.3) всегда пунктирные, даже если тип сплошной
      const finalDash = dash || (d.str < 0.3 ? "3,3" : null);
      d3.select(this)
        .attr("stroke",            color)
        .attr("stroke-opacity",    0.25 + (d.str || 0.5) * 0.55)
        .attr("stroke-width",      1 + (d.str || 0.5) * 2.5)
        .attr("stroke-dasharray",  finalDash || null)
        .attr("marker-end",   isBi ? url(#arr-bi-end-${cid})   : url(#arr-fwd-${cid}))
        .attr("marker-start", isBi ? url(#arr-bi-start-${cid}) : null)
    });
 
  const arc = g.selectAll(".edge-arc").data(reflLinks).enter()
    .append("path").attr("class", "edge-arc").attr("fill", "none")
    .each(function(d) {
      const { color } = edgeTypeStyle(d.type);
      d3.select(this)
        .attr("stroke",         color)
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width",   2);
    });
 
  // ── Кольца кластеров (под узлами) ─────────────────────────────────────
  const clusterRing = g.selectAll(".cluster-ring").data(ringData).enter()
    .append("circle").attr("class", "cluster-ring")
    .attr("r",               d => (6 + d.node.cen * 14) + 6 + d.offset * 5)
    .attr("fill",            "none")
    .attr("stroke",          d => CPAL[d.clIdx % CPAL.length])
    .attr("stroke-opacity",  0.5)
    .attr("stroke-width",    1.5)
    .attr("stroke-dasharray","3,2")
    .attr("pointer-events",  "none");
 
  // ── Узлы ──────────────────────────────────────────────────────────────
  const nodeEnter = g.selectAll(".node-g").data(nodes).enter()
    .append("g").attr("class", "node-g").style("cursor", "pointer");
  
  // Для каждого узла — circle или path в зависимости от роли
  nodeEnter.each(function(d) {
    const role   = getTopRole(d.roles);
    const r      = 6 + d.cen * 14;
    const fill   = typeColorHex(d.type);
    const fillOp = 0.2 + (d.cert ?? 0.5) * 0.65;
    const stroke = fill;
    const isDash = d.roles.has("bridge") ? "4,2.5" : null;
  
    const sel = d3.select(this);
    if (!role || role === "peripheral") {
      sel.append("circle")
        .attr("class", "node-circle")
        .attr("r", r);
    } else {
      sel.append("path")
        .attr("class", "node-circle")
        .attr("transform", role === "antithesis" ? "rotate(180)" : null)
        .attr("transform", role === "core" ? "rotate(45)" : null)
        .attr("d", nodeSymbolPath(d));
    }
  
    sel.select(".node-circle")
      .attr("fill",             fill)
      .attr("fill-opacity",     fillOp)
      .attr("stroke",           stroke)
      .attr("stroke-width",     2)
      .attr("stroke-dasharray", isDash);
  });
  
  const node = nodeEnter;  // далее весь код hover/click работает через nodeEnter
  
  // ── Drag ──────────────────────────────────────────────────────────────────
  node.call(d3.drag()
    .on("start", (event, d) => {
      if (!event.active) sim2d.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) sim2d.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    })
  );
 
  // ── Метки ─────────────────────────────────────────────────────────────
  const label = g.selectAll(".node-label").data(nodes).enter()
    .append("text").attr("class", "node-label")
    .attr("dy",           d => -(9 + d.cen * 14))
    .attr("text-anchor",  "middle")
    .attr("pointer-events", "none")
    .text(d => d.name);
 
  // ── Hover: подсветка окрестности ─────────────────────────────────────
  
  // Переменная выбранного узла (по клику)
  let selected2d = null;
  
  // Применяет диммирование несвязанных (вызывается при клике)
  function applyDim2d(d) {
    const nbrIds = new Set([d.id]);
    links.forEach(l => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      if (s === d.id) nbrIds.add(t);
      if (t === d.id) nbrIds.add(s);
    });
    const DIM = 0.08;
    node.attr("opacity",        n => nbrIds.has(n.id) ? 1 : DIM);
    label.attr("opacity",       n => nbrIds.has(n.id) ? 1 : DIM);
    clusterRing.attr("opacity", d => nbrIds.has(d.node.id) ? 1 : DIM);
    link.attr("opacity", l => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      return (s === d.id || t === d.id) ? 1 : DIM * 0.5;
    });
    arc.attr("opacity", l => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      return s === d.id ? 1 : DIM * 0.5;
    });
  }
  
  // Снимает диммирование
  function resetDim2d() {
    node.attr("opacity", 1);
    label.attr("opacity", 1);
    clusterRing.attr("opacity", 1);
    link.attr("opacity", null);
    arc.attr("opacity", null);
  }
  
  node
    .on("mouseover", function(event, d) {
      const nbrIds = new Set([d.id]);
      links.forEach(l => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        if (s === d.id) nbrIds.add(t);
        if (t === d.id) nbrIds.add(s);
      });

      node.attr("filter", n => nbrIds.has(n.id) ? "url(#glow2)" : null);

      // stroke-opacity, а не opacity
      link.attr("stroke-opacity", l => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        return (s === d.id || t === d.id) ? 1 : 0.25 + (l.str || 0.5) * 0.55;
      });
      arc.attr("stroke-opacity", l => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        return s === d.id ? 1 : 0.7;
      });

      d3.select(this).raise();
    })
    .on("mouseout", function() {
      node.attr("filter", null);
      // Восстанавливаем stroke-opacity явно по формуле
      link.attr("stroke-opacity", l => 0.25 + (l.str || 0.5) * 0.55);
      arc.attr("stroke-opacity", 0.7);
      // Снимаем opacity-диммирование от клика (если было)
      link.attr("opacity", null);
      arc.attr("opacity", null);
      // Восстанавливаем диммирование выбранного узла
      if (selected2d !== null) {
        const selData = nodes.find(n => n.id === selected2d);
        if (selData) applyDim2d(selData);
      }
    });
 
  // ── Клик: диммирование + панель ──────────────────────────────────────
  node.on("click", function(event, d) {
    event.stopPropagation();
    if (selected2d === d.id) {
      // Повторный клик по тому же узлу — снять выделение
      selected2d = null;
      resetDim2d();
      const p = ct.querySelector(".gm-info-panel");
      if (p) p.classList.remove("visible");
    } else {
      selected2d = d.id;
      applyDim2d(d);
      showNodePanel(ct, d, links, topo.clusterLabels);
    }
  });
  svg.on("click", () => {
    selected2d = null;
    resetDim2d();
    const p = ct.querySelector(".gm-info-panel");
    if (p) p.classList.remove("visible");
  });
 
  // ── Tick ──────────────────────────────────────────────────────────
  sim2d.on("tick", () => {
    link.each(function(d) {
      const { x1, y1, x2, y2 } = edgeEndpoints(d);
      d3.select(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    });
    linkHit.each(function(d) {
      const { x1, y1, x2, y2 } = edgeEndpoints(d);
      d3.select(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    });
    arc.attr("d", arcPath);
    arcHit.attr("d", arcPath);
    node.attr("transform", d => translate(${d.x},${d.y}));
    clusterRing.attr("cx", d => d.node.x).attr("cy", d => d.node.y);
    label.attr("x",        d => d.x).attr("y", d => d.y);
  });
}
```