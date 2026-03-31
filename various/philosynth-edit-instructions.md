# PhiloSynth Pro — Инструкция по реализации системы редактирования

## Этап 1: Объект состояния документа + перегенерация одного раздела

> Все ссылки на строки даны относительно файла `philosynth__2_.html` (8818 строк).
> Якоря — уникальные фрагменты кода, по которым можно найти место вставки поиском.

---

## 1. CSS — Добавить стили модального окна редактирования

**Где:** внутри `<style>`, **перед** закрывающим `</style>` (строка 1795).  
**Якорь:** вставить непосредственно перед строкой `    </style>`.

```css
      /* ── EDIT MODAL ── */
      .edit-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(10, 10, 15, 0.80);
        z-index: 9998;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .edit-overlay.visible {
        display: flex;
      }
      .edit-modal {
        background: var(--paper);
        border: 1px solid var(--rule);
        border-top: 4px solid var(--gold);
        width: 100%;
        max-width: 780px;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
      }
      .edit-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid var(--rule);
        flex-shrink: 0;
      }
      .edit-modal-title {
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        color: var(--gold);
      }
      .edit-modal-body {
        overflow-y: auto;
        flex: 1;
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .edit-modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 12px 24px;
        border-top: 1px solid var(--rule);
        flex-shrink: 0;
        gap: 8px;
      }
      .edit-sec-card {
        border: 1px solid var(--rule);
        background: var(--white);
        padding: 14px 18px;
        transition: border-color 0.15s;
      }
      .edit-sec-card:hover {
        border-color: var(--blue-corp);
      }
      .edit-sec-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 6px;
      }
      .edit-sec-title {
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--blue-corp);
      }
      .edit-sec-num {
        font-family: var(--mono);
        font-size: 9px;
        color: var(--ink-dim);
        letter-spacing: 1px;
      }
      .edit-sec-ctx-row {
        margin-top: 8px;
      }
      .edit-sec-ctx-label {
        font-family: var(--mono);
        font-size: 9px;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--ink-dim);
        margin-bottom: 4px;
      }
      .edit-sec-ctx-field {
        width: 100%;
        border: 1px solid var(--rule-strong);
        background: var(--white);
        padding: 8px 12px;
        font-family: var(--sans);
        font-size: 12px;
        color: var(--ink);
        line-height: 1.5;
        height: 48px;
        min-height: 32px;
        resize: vertical;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.15s;
      }
      .edit-sec-ctx-field:focus {
        border-color: var(--gold);
        box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.10);
      }
      .edit-sec-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 10px;
      }
      .edit-sec-btn {
        font-family: var(--mono);
        font-size: 9px;
        font-weight: 500;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 6px 14px;
        cursor: pointer;
        border: 1px solid var(--rule-strong);
        background: transparent;
        color: var(--ink-mid);
        transition: all 0.15s;
      }
      .edit-sec-btn:hover {
        border-color: var(--blue-corp);
        color: var(--blue-corp);
      }
      .edit-sec-btn.primary {
        background: var(--blue-corp);
        color: #fff;
        border-color: var(--blue-corp);
      }
      .edit-sec-btn.primary:hover {
        background: var(--blue-mid);
      }
      .edit-sec-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Панель предупреждений внутри карточки */
      .edit-dep-warnings {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .edit-dep-warn {
        font-family: var(--mono);
        font-size: 10px;
        padding: 6px 12px;
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        gap: 6px;
      }
      .edit-dep-warn.info {
        color: var(--blue-corp);
        background: var(--blue-light);
        border: 1px solid rgba(26, 40, 85, 0.2);
      }
      .edit-dep-warn.caution {
        color: var(--gold);
        background: #fffbee;
        border: 1px solid var(--gold);
      }
      .edit-dep-warn.danger {
        color: var(--red);
        background: #fff5f5;
        border: 1px solid var(--red);
      }
      .edit-dep-warn .dep-icon {
        flex-shrink: 0;
        font-size: 12px;
      }

      /* Прогресс-бар перегенерации */
      .edit-regen-progress {
        font-family: var(--mono);
        font-size: 10px;
        color: var(--blue-corp);
        padding: 8px 0;
        display: none;
      }
      .edit-regen-progress.active {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .edit-regen-spinner {
        width: 12px;
        height: 12px;
        border: 2px solid var(--rule);
        border-top-color: var(--blue-corp);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
```

---

## 2. HTML — Добавить разметку модального окна и кнопку

### 2a. Кнопка «Изменить» в панели действий

**Где:** строка 2257, **после** кнопки «Лог контекста», **перед** кнопкой «Сохранить HTML».  
**Якорь:** найти строку:
```html
            <button class="action-btn" onclick="viewCtxLog()">Лог контекста</button>
```
**Вставить сразу ПОСЛЕ неё:**

```html
            <button class="action-btn gold-btn" id="btnEdit" onclick="openEditModal()">Изменить</button>
```

### 2b. HTML модального окна

**Где:** **после** закрывающего `</div>` CTX LOG MODAL (строка 2373), **перед** `<script>` (строка 2375).  
**Якорь:** найти строку:
```html
    </div>
```
которая идёт сразу перед строкой `    <script>`.

**Вставить МЕЖДУ ними:**

```html
    <!-- EDIT MODAL -->
    <div class="edit-overlay" id="editOverlay" onclick="if (event.target === this) closeEditModal();">
      <div class="edit-modal">
        <div class="edit-modal-header">
          <div class="edit-modal-title">✎ Редактирование Разделов</div>
          <button class="raw-close" onclick="closeEditModal()">✕ Закрыть</button>
        </div>
        <div class="edit-modal-body" id="editModalBody">
          <!-- Карточки разделов генерируются динамически -->
        </div>
        <div class="edit-modal-footer">
          <div style="font-family:var(--mono);font-size:9px;color:var(--ink-dim);letter-spacing:1px;flex:1" id="editFooterInfo"></div>
          <button class="raw-close" onclick="closeEditModal()">Закрыть</button>
        </div>
      </div>
    </div>
```

---

## 3. JS — Объект DOC_STATE

**Где:** сразу после блока объявления глобальных переменных STATE (строка 2398), **перед** `const ML = {` (строка 2400).  
**Якорь:** найти строку:
```javascript
        clusterObjects2d = null;
```
**Вставить ПОСЛЕ неё (перед пустой строкой и `const ML`):**

```javascript

      // ════════════════════════════════════════
      // DOC_STATE — состояние сгенерированного документа
      // ════════════════════════════════════════
      const DOC_STATE = {
        /** Признак наличия завершённой генерации */
        ready: false,

        /** Параметры, с которыми был сгенерирован документ */
        params: null,  // { seed, phil, sec, method, depth, synthLevel, ctx, secCtx }

        /** Порядок разделов (включая "sum") */
        sectionOrder: [],

        /** Маппинг sectionKey → индекс DOM-контейнера db{N} */
        sectionDbIdx: {},

        /** Маппинг sectionKey → innerHTML контейнера (кэш последнего содержимого) */
        sectionHTML: {},

        /** Маппинг sectionKey → { key, num, title, prompt } из buildSectionDefs */
        sectionDefs: {},

        /** effectiveDeps на момент генерации */
        effectiveDeps: null,

        /** resolvedDeps на момент генерации */
        resolvedDeps: null,

        /** Номер документа */
        docNum: "",

        /** Разделы, перегенерированные после исходной генерации */
        editedSections: new Set(),
      };

      /** Заполняет DOC_STATE после завершения генерации */
      function populateDocState(p, defs, dynamicOrder, effectiveDeps, resolvedDeps, passes) {
        DOC_STATE.ready = true;
        DOC_STATE.params = {
          seed: p.seed,
          phil: [...p.phil],
          sec: [...p.sec],
          method: p.method,
          depth: p.depth,
          synthLevel: p.synthLevel,
          ctx: p.ctx,
          secCtx: { ...p.secCtx },
        };
        DOC_STATE.sectionOrder = [...dynamicOrder];
        DOC_STATE.sectionDbIdx = {};
        DOC_STATE.sectionDefs = {};
        DOC_STATE.sectionHTML = {};
        DOC_STATE.editedSections = new Set();

        // Маппинг key → dbIdx: проходим по passes, каждый pass занимает один db{i}
        for (let i = 0; i < passes.length; i++) {
          for (const def of passes[i]) {
            DOC_STATE.sectionDbIdx[def.key] = i;
            DOC_STATE.sectionDefs[def.key] = { ...def };
          }
        }

        // Кэшируем HTML каждого раздела
        for (const key of dynamicOrder) {
          const idx = DOC_STATE.sectionDbIdx[key];
          const el = document.getElementById("db" + idx);
          if (el) DOC_STATE.sectionHTML[key] = el.innerHTML;
        }

        DOC_STATE.effectiveDeps = effectiveDeps;
        DOC_STATE.resolvedDeps = resolvedDeps;
        DOC_STATE.docNum = document.getElementById("docNum")?.textContent || "";
      }

      /** Сбрасывает DOC_STATE */
      function resetDocState() {
        DOC_STATE.ready = false;
        DOC_STATE.params = null;
        DOC_STATE.sectionOrder = [];
        DOC_STATE.sectionDbIdx = {};
        DOC_STATE.sectionHTML = {};
        DOC_STATE.sectionDefs = {};
        DOC_STATE.effectiveDeps = null;
        DOC_STATE.resolvedDeps = null;
        DOC_STATE.docNum = "";
        DOC_STATE.editedSections = new Set();
      }

      // ════════════════════════════════════════
      // EDIT — зависимости, утилиты
      // ════════════════════════════════════════

      /** Полные метки разделов по ключу (не по secId) */
      const KEY_LABELS = {
        sum: "Исполнительное резюме",
        graph: "Граф категорий",
        glossary: "Глоссарий терминов",
        theses: "Корпус тезисов",
        name: "Анализ названия",
        history: "Историческая контекстуализация",
        origin: "Анализ происхождения",
        practical: "Практическое применение",
        dialogue: "Диалог между традициями",
        evolution: "Эволюция и перспективы",
        critique: "Критический анализ",
      };

      /**
       * Инверсия computePredecessors: для каждого раздела возвращает
       * множество разделов, которые ЗАВИСЯТ от него (будут затронуты его изменением).
       * @returns {{ [sectionKey: string]: Set<string> }}
       */
      function computeDependents(effectiveDeps) {
        const preds = computePredecessors(effectiveDeps);
        const dependents = {};
        for (const sec of Object.keys(effectiveDeps)) {
          dependents[sec] = new Set();
        }
        // Если B ∈ preds[A], значит A зависит от B → B влияет на A → A ∈ dependents[B]
        for (const [sec, predSet] of Object.entries(preds)) {
          for (const pred of predSet) {
            if (!dependents[pred]) dependents[pred] = new Set();
            dependents[pred].add(sec);
          }
        }
        return dependents;
      }

      /**
       * Обновляет ссылки §N в текстовых узлах DOM после изменения нумерации.
       * @param {Object} renumberMap — { старый_номер: новый_номер }
       */
      function renumberSectionRefs(renumberMap) {
        if (!Object.keys(renumberMap).length) return;

        const db = document.getElementById("docBodies");
        if (!db) return;

        // Обходим все текстовые узлы внутри .doc-content
        const walker = document.createTreeWalker(db, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        const regex = /§\s*(\d+)/g;
        for (const node of textNodes) {
          const original = node.nodeValue;
          const replaced = original.replace(regex, (match, num) => {
            const oldNum = parseInt(num, 10);
            if (renumberMap[oldNum] !== undefined && renumberMap[oldNum] !== oldNum) {
              return match.replace(num, String(renumberMap[oldNum]));
            }
            return match;
          });
          if (replaced !== original) node.nodeValue = replaced;
        }

        // Обновляем .section-num внутри каждого раздела
        for (const key of DOC_STATE.sectionOrder) {
          const def = DOC_STATE.sectionDefs[key];
          if (!def) continue;
          const idx = DOC_STATE.sectionDbIdx[key];
          const el = document.getElementById("db" + idx);
          if (!el) continue;
          const numEl = el.querySelector(".section-num");
          if (numEl) numEl.textContent = "§ " + def.num;
        }
      }

      /** Обновляет текст стоимости в футере после перегенерации */
      function updateFooterCost() {
        const costIn = totalInputTokens * 3 / 1e6;
        const costOut = totalOutputTokens * 15 / 1e6;
        const costTotal = costIn + costOut;
        const el = document.getElementById("footerCost");
        if (el) {
          el.textContent =
            "Токены: " + totalInputTokens.toLocaleString("ru") + " вх. + " +
            totalOutputTokens.toLocaleString("ru") + " вых. · Стоимость: $" +
            costTotal.toFixed(4) + " (" + (costTotal * 100).toFixed(2) + "¢)";
        }
      }
```

---

## 4. JS — Логика модального окна редактирования

**Где:** непосредственно перед функцией `resetForm()` (строка 8375).  
**Якорь:** найти строку:
```javascript
      function resetForm() {
```
**Вставить ПЕРЕД ней:**

```javascript
      // ════════════════════════════════════════
      // EDIT MODAL — открытие, рендер, логика
      // ════════════════════════════════════════

      function openEditModal() {
        if (!DOC_STATE.ready) {
          alert("Документ ещё не сгенерирован.");
          return;
        }
        if (!API_KEY) {
          alert("API-ключ не задан. Введите ключ для перегенерации разделов.");
          return;
        }
        renderEditSections();
        document.getElementById("editOverlay").classList.add("visible");
        document.body.style.overflow = "hidden";
      }

      function closeEditModal() {
        document.getElementById("editOverlay").classList.remove("visible");
        document.body.style.overflow = "";
      }

      function renderEditSections() {
        const body = document.getElementById("editModalBody");
        body.innerHTML = "";

        const dependents = computeDependents(DOC_STATE.effectiveDeps);
        const order = DOC_STATE.sectionOrder.filter(k => k !== "sum");

        const infoEl = document.getElementById("editFooterInfo");
        if (infoEl) {
          infoEl.textContent = order.length + " разделов · " +
            DOC_STATE.editedSections.size + " изменено";
        }

        for (const key of order) {
          const def = DOC_STATE.sectionDefs[key];
          if (!def) continue;
          const label = KEY_LABELS[key] || key;
          const currentCtx = DOC_STATE.params.secCtx[key] || "";
          const deps = dependents[key] || new Set();
          const depsArr = [...deps].filter(k => k !== "sum");
          const isEdited = DOC_STATE.editedSections.has(key);

          const card = document.createElement("div");
          card.className = "edit-sec-card";
          card.id = "editCard-" + key;

          // Заголовок
          let headerHTML = `
            <div class="edit-sec-card-header">
              <div class="edit-sec-title">${isEdited ? "⟳ " : ""}§ ${def.num} — ${esc(label)}</div>
              <div class="edit-sec-num">${key}</div>
            </div>`;

          // Поле доп. контекста
          let ctxHTML = `
            <div class="edit-sec-ctx-row">
              <div class="edit-sec-ctx-label">Дополнительный контекст раздела</div>
              <textarea class="edit-sec-ctx-field" id="editCtx-${key}" 
                        placeholder="Особые требования, акценты, ограничения...">${esc(currentCtx)}</textarea>
            </div>`;

          // Предупреждения о зависимых
          let depsHTML = "";
          if (depsArr.length > 0) {
            const allSections = DOC_STATE.sectionOrder.filter(k => k !== "sum");
            const isTotal = depsArr.length >= allSections.length - 1; // все кроме самого раздела

            if (isTotal) {
              depsHTML = `
                <div class="edit-dep-warnings" id="editDeps-${key}">
                  <div class="edit-dep-warn danger">
                    <span class="dep-icon">⚠</span>
                    <span>Все остальные разделы документа зависят от «${esc(label)}». 
                    Перегенерация фактически означает перегенерацию всего документа.</span>
                  </div>
                </div>`;
            } else {
              const depNames = depsArr.map(k => "«" + (KEY_LABELS[k] || k) + "»").join(", ");
              depsHTML = `
                <div class="edit-dep-warnings" id="editDeps-${key}">
                  <div class="edit-dep-warn caution">
                    <span class="dep-icon">⚡</span>
                    <span>Затронутые разделы: ${depNames}. 
                    После перегенерации рекомендуется обновить их тоже.</span>
                  </div>
                </div>`;
            }
          }

          // Прогресс
          let progressHTML = `
            <div class="edit-regen-progress" id="editProgress-${key}">
              <div class="edit-regen-spinner"></div>
              <span id="editProgressText-${key}">Генерация...</span>
            </div>`;

          // Кнопки
          let actionsHTML = `
            <div class="edit-sec-actions">
              <button class="edit-sec-btn primary" 
                      id="editRegenBtn-${key}"
                      onclick="confirmAndRegenerate('${key}')">
                Перегенерировать
              </button>
            </div>`;

          card.innerHTML = headerHTML + ctxHTML + depsHTML + progressHTML + actionsHTML;
          body.appendChild(card);
        }
      }

      function esc(s) {
        if (typeof s !== "string") return "";
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;");
      }

      /** Показывает подтверждение и запускает перегенерацию */
      function confirmAndRegenerate(sectionKey) {
        const label = KEY_LABELS[sectionKey] || sectionKey;
        const dependents = computeDependents(DOC_STATE.effectiveDeps);
        const deps = [...(dependents[sectionKey] || [])].filter(k => k !== "sum");
        const allOthers = DOC_STATE.sectionOrder.filter(k => k !== "sum" && k !== sectionKey);
        const isTotal = deps.length >= allOthers.length;

        let msg = `Перегенерировать раздел «${label}»?`;
        if (isTotal) {
          msg += `\n\n⚠ ВСЕ остальные разделы зависят от этого раздела.\nЭто фактически перегенерация всего документа.`;
        } else if (deps.length > 0) {
          const depNames = deps.map(k => "«" + (KEY_LABELS[k] || k) + "»").join(", ");
          msg += `\n\nЗатронутые разделы: ${depNames}.\nИх рекомендуется перегенерировать после.`;
        }

        // Проверяем, изменился ли контекст
        const ctxField = document.getElementById("editCtx-" + sectionKey);
        const newCtx = ctxField ? ctxField.value.trim() : "";
        const oldCtx = DOC_STATE.params.secCtx[sectionKey] || "";
        if (newCtx !== oldCtx) {
          msg += `\n\nДополнительный контекст раздела ${newCtx ? "изменён" : "удалён"}.`;
        }

        if (!confirm(msg)) return;

        regenerateSection(sectionKey, newCtx);
      }

      /**
       * Перегенерация одного раздела.
       * @param {string} sectionKey — ключ раздела (graph, theses, ...)
       * @param {string} newCtx     — новый дополнительный контекст (или пустая строка)
       */
      async function regenerateSection(sectionKey, newCtx) {
        const p = DOC_STATE.params;
        if (!p) return;

        // ── 1. Блокируем UI ──
        const card = document.getElementById("editCard-" + sectionKey);
        const btn = document.getElementById("editRegenBtn-" + sectionKey);
        const progress = document.getElementById("editProgress-" + sectionKey);
        const progressText = document.getElementById("editProgressText-" + sectionKey);
        if (btn) btn.disabled = true;
        if (progress) progress.classList.add("active");

        try {
          // ── 2. Обновляем контекст в DOC_STATE ──
          if (newCtx) {
            DOC_STATE.params.secCtx[sectionKey] = newCtx;
          } else {
            delete DOC_STATE.params.secCtx[sectionKey];
          }

          // ── 3. Пересобираем промпт для этого раздела ──
          // Берём текущие параметры и строим def заново
          const fullP = { ...p, secCtx: { ...DOC_STATE.params.secCtx } };
          const allDefs = buildSectionDefs(fullP);
          patchPromptsWithSecCtx(allDefs, fullP.secCtx);
          const defsMap = Object.fromEntries(allDefs.map(d => [d.key, d]));
          const def = defsMap[sectionKey];
          if (!def) throw new Error("Раздел «" + sectionKey + "» не найден в определениях.");

          // Сохраняем оригинальный номер из текущего состояния
          const existingDef = DOC_STATE.sectionDefs[sectionKey];
          if (existingDef) def.num = existingDef.num;

          // ── 4. Собираем контекст из ранее сгенерированных разделов ──
          if (progressText) progressText.textContent = "Построение контекста...";

          const generated = {};
          for (const key of DOC_STATE.sectionOrder) {
            if (key === sectionKey) continue; // пропускаем себя
            const idx = DOC_STATE.sectionDbIdx[key];
            const el = document.getElementById("db" + idx);
            if (el && el.querySelector(".doc-section")) {
              generated[key] = el;
            }
          }

          let prior = "";
          if (sectionKey !== "sum") {
            try {
              prior = buildContextForSection(
                sectionKey, generated, fullP.depth,
                DOC_STATE.effectiveDeps,
                DOC_STATE.resolvedDeps
              );
            } catch (ctxErr) {
              console.warn("Ошибка построения контекста при перегенерации", sectionKey, ctxErr);
            }
          }

          // ── 5. Собираем финальный промпт ──
          const SYS = buildSYS();
          const partBase = baseCtx(fullP);
          const partRules = htmlRules();
          const partQuality = buildPartQuality(fullP);
          const sp = `§ ${def.num} — ${def.title.toUpperCase()}\n${def.prompt}`;
          const fp = `ПАРАМЕТРЫ СИНТЕЗА:\n${partBase}${prior}\n\n${partRules}\n\nЗАДАНИЕ: составь ТОЛЬКО следующие разделы (строго в указанном порядке, без добавления других):\n\n${sp}\n\n${partQuality}`;

          // ── 6. Записываем предварительный genLog ──
          const genEntry = {
            sectionKey: sectionKey,
            sectionLabel: def.title + " [перегенерация]",
            priorChars: prior.length,
            taskChars: sp.length,
            inputChars: SYS.length + fp.length,
            outputChars: 0,
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            error: null,
            status: "streaming",
            source: "edit",
          };
          genLog.push(genEntry);

          // ── 7. Стримим ответ в DOM-контейнер ──
          if (progressText) progressText.textContent = "Генерация...";

          const dbIdx = DOC_STATE.sectionDbIdx[sectionKey];
          const container = document.getElementById("db" + dbIdx);
          if (!container) throw new Error("DOM-контейнер db" + dbIdx + " не найден.");

          container.innerHTML = "";

          let lastLogRefresh = 0;
          const onDelta = (charsSoFar) => {
            genEntry.outputChars = charsSoFar;
            if (progressText) progressText.textContent = "Генерация... " + charsSoFar + " симв.";
          };

          const usage = await streamResp(fp, container, SYS, onDelta);

          // ── 8. Финализируем genLog ──
          totalInputTokens += usage.input_tokens;
          totalOutputTokens += usage.output_tokens;

          genEntry.outputChars = container.innerHTML.length;
          genEntry.inputTokens = usage.input_tokens;
          genEntry.outputTokens = usage.output_tokens;
          genEntry.cost = usage.input_tokens * 3 / 1e6 + usage.output_tokens * 15 / 1e6;
          genEntry.status = "done";

          // ── 9. Вставляем <details> для доп. контекста раздела ──
          if (newCtx) {
            const disc = makeSectionCtxDisclosure(newCtx);
            container.insertBefore(disc, container.firstChild);
          }

          // ── 10. Обновляем docTitle из раздела name ──
          if (sectionKey === "name") {
            updateDocTitleFromName(container);
          }

          // ── 11. Если это граф — перепарсить G ──
          if (sectionKey === "graph") {
            try {
              G = parseGraph(container);
              if (G.nodes.length > 0) {
                document.getElementById("btnGraph").style.display = "";
              }
            } catch (e) {
              console.warn("Graph re-parse after edit:", e);
            }
          }

          // ── 12. Обновляем DOC_STATE ──
          DOC_STATE.sectionHTML[sectionKey] = container.innerHTML;
          DOC_STATE.sectionDefs[sectionKey] = { ...def };
          DOC_STATE.editedSections.add(sectionKey);

          // ── 13. Обновляем стоимость в футере ──
          updateFooterCost();

          // ── 14. Обновляем UI модального окна ──
          if (progressText) progressText.textContent = "✓ Готово";
          if (progress) {
            progress.querySelector(".edit-regen-spinner")?.remove();
          }

          // Обновляем счётчик в футере модалки
          const infoEl = document.getElementById("editFooterInfo");
          if (infoEl) {
            const order = DOC_STATE.sectionOrder.filter(k => k !== "sum");
            infoEl.textContent = order.length + " разделов · " +
              DOC_STATE.editedSections.size + " изменено";
          }

          // Подсвечиваем карточки зависимых разделов
          highlightDependentCards(sectionKey);

        } catch (err) {
          console.error("Ошибка перегенерации раздела:", sectionKey, err);
          if (progressText) progressText.textContent = "⚠ Ошибка: " + err.message;
          const genEntry = genLog[genLog.length - 1];
          if (genEntry && genEntry.sectionKey === sectionKey) {
            genEntry.status = "error";
            genEntry.error = err.message;
          }
        } finally {
          if (btn) btn.disabled = false;
          setTimeout(() => {
            if (progress) progress.classList.remove("active");
          }, 3000);
        }
      }

      /** Подсвечивает карточки разделов, зависящих от перегенерированного */
      function highlightDependentCards(sectionKey) {
        const dependents = computeDependents(DOC_STATE.effectiveDeps);
        const deps = [...(dependents[sectionKey] || [])].filter(k => k !== "sum");

        for (const depKey of deps) {
          const depCard = document.getElementById("editCard-" + depKey);
          if (!depCard) continue;

          // Добавляем временную подсветку
          depCard.style.borderColor = "var(--gold)";
          depCard.style.background = "#fffbee";

          // Добавляем уведомление, если ещё нет
          let warnBox = depCard.querySelector(".edit-dep-regen-notice");
          if (!warnBox) {
            warnBox = document.createElement("div");
            warnBox.className = "edit-dep-warn info edit-dep-regen-notice";
            warnBox.innerHTML = `
              <span class="dep-icon">ℹ</span>
              <span>Раздел «${esc(KEY_LABELS[sectionKey] || sectionKey)}» был перегенерирован. 
              Рекомендуется обновить и этот раздел.</span>`;
            const actionsEl = depCard.querySelector(".edit-sec-actions");
            if (actionsEl) depCard.insertBefore(warnBox, actionsEl);
            else depCard.appendChild(warnBox);
          }
        }
      }

```

---

## 5. JS — Модификация `generateDoc()`: заполнение DOC_STATE

**Где:** в конце функции `generateDoc()`, **после** строки с `document.getElementById("btnText").textContent = "Синтезировать Концепцию";` (строка 5506), **перед** закрывающей `}` функции (строка 5507).  
**Якорь:** найти строку:
```javascript
        document.getElementById("btnText").textContent = "Синтезировать Концепцию";
```
**Вставить ПОСЛЕ неё (перед закрывающей `}`):**

```javascript

        // ── Заполнить DOC_STATE для системы редактирования ──
        populateDocState(p, defs, dynamicOrder, effectiveDeps, resolveContextDeps(p), passes);
```

Для этого нужно, чтобы переменные `defs`, `dynamicOrder`, `effectiveDeps`, `passes` были доступны в этой точке. Они уже объявлены ранее в теле `generateDoc()`:
- `effectiveDeps` — строка 5306
- `dynamicOrder` — строка 5307
- `defs` — строка 5317
- `passes` — строка 5323

Все они доступны в нужной точке. Дополнительных изменений не требуется.

---

## 6. JS — Модификация `resetForm()`: сброс DOC_STATE

**Где:** внутри функции `resetForm()` (строка 8375), **после** строки `window.scrollTo(...)` (строка 8386), **перед** закрывающей `}` (строка 8387).  
**Якорь:** найти строку:
```javascript
        window.scrollTo({ top: 0, behavior: "smooth" });
```
(внутри `resetForm`).

**Вставить ПОСЛЕ неё:**

```javascript
        resetDocState();
```

---

## 7. JS — Функция `esc()` — проверка на дублирование

Функция `esc()` уже добавлена в блоке из пункта 4 выше. **Проверьте**, нет ли уже функции с таким именем в файле. В исходном файле `esc` определена **внутри** `formatCtxLogHTML()` (строка ~8484) как локальная. Наша глобальная `esc` не конфликтует — локальная перекрывает её внутри той функции. Но для безопасности можно переименовать нашу в `escHtml`. В таком случае замените все `esc(...)` в коде из пункта 4 на `escHtml(...)` и объявите:

```javascript
      function escHtml(s) {
        ...
      }
```

> **Рекомендация:** оставить `esc` как есть — конфликта нет, и это самое читаемое имя.

---

## 8. Проверка доступности переменных

Убедитесь, что следующие функции/переменные доступны из глобальной области:
- `buildSYS()` — ✓ (строка 4308)
- `baseCtx(p)` — ✓ (строка 4731)
- `htmlRules()` — ✓ (строка 4319)
- `buildPartQuality(p)` — ✓ (строка 4312)
- `buildSectionDefs(p)` — ✓ (строка 4739)
- `patchPromptsWithSecCtx(defs, secCtx)` — ✓ (строка 5136)
- `buildContextForSection(...)` — ✓ (строка 4145)
- `streamResp(prompt, container, sys, onDelta)` — ✓ (строка 5509)
- `makeSectionCtxDisclosure(text)` — ✓ (строка 5188)
- `updateDocTitleFromName(container)` — ✓ (строка 5202)
- `parseGraph(ct)` — ✓ (строка 5827)
- `computePredecessors(effectiveDeps)` — ✓ (строка 2836)
- `resolveContextDeps(p)` — ✓ (строка 2699)

Все доступны. Дополнительных изменений не требуется.

---

## 9. Сводка изменений

| Файл / Место | Действие | Примерный объём |
|---|---|---|
| `<style>` перед `</style>` | Вставить CSS модального окна | ~180 строк |
| Панель действий (actions-bar-btns) | Вставить кнопку «Изменить» | 1 строка |
| После CTX LOG MODAL, перед `<script>` | Вставить HTML модального окна | ~18 строк |
| После глобальных переменных STATE | Вставить `DOC_STATE` + утилиты | ~180 строк |
| Перед `resetForm()` | Вставить логику модального окна + `regenerateSection` | ~300 строк |
| Конец `generateDoc()` | Вставить вызов `populateDocState(...)` | 2 строки |
| `resetForm()` | Вставить `resetDocState()` | 1 строка |

**Итого: ~680 строк нового кода, 3 строки вставок в существующие функции, 0 строк удалений.**

---

## Примечания к тестированию

1. **Сгенерируйте документ** как обычно.
2. Нажмите кнопку **«Изменить»** в панели действий.
3. В модальном окне у каждого раздела (кроме резюме) должен быть:
   - Заголовок с номером §
   - Поле дополнительного контекста (предзаполнено, если был задан)
   - Предупреждение о зависимых разделах (если есть)
   - Кнопка «Перегенерировать»
4. При нажатии «Перегенерировать» — подтверждение с перечнем последствий.
5. После подтверждения — стриминг нового содержимого в секцию документа.
6. После завершения — карточки зависимых разделов подсвечиваются с уведомлением.
7. Стоимость в футере обновляется.

---

## Этап 2: Удаление и добавление разделов с зависимостями

> Все якоря даны **относительно файла после применения Этапа 1**.
> Номера строк не указываются — ищите по уникальным фрагментам кода.

---

## 10. CSS — Дополнительные стили для удаления/добавления

**Где:** в конец CSS-блока из пункта 1 (Этап 1), **после** последнего правила `.edit-regen-spinner`, **перед** `</style>`.  
**Якорь:** найти строку:
```css
      }
```
которая закрывает `.edit-regen-spinner`, и вставить **после неё**, но **перед** `</style>`:

```css

      /* ── EDIT: кнопка удаления ── */
      .edit-sec-btn.danger {
        border-color: var(--red);
        color: var(--red);
      }
      .edit-sec-btn.danger:hover {
        background: var(--red);
        color: #fff;
      }

      /* ── EDIT: панель добавления раздела ── */
      .edit-add-panel {
        border: 2px dashed var(--rule-strong);
        padding: 18px;
        background: var(--off);
        transition: border-color 0.15s;
      }
      .edit-add-panel:hover {
        border-color: var(--blue-corp);
      }
      .edit-add-title {
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--ink-dim);
        margin-bottom: 12px;
      }
      .edit-add-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .edit-add-btn {
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 1px;
        padding: 7px 14px;
        cursor: pointer;
        border: 1px solid var(--blue-corp);
        background: var(--blue-light);
        color: var(--blue-corp);
        transition: all 0.15s;
      }
      .edit-add-btn:hover {
        background: var(--blue-corp);
        color: #fff;
      }
      .edit-add-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── EDIT: форма добавления (раскрывается после выбора раздела) ── */
      .edit-add-form {
        display: none;
        margin-top: 14px;
        padding: 16px;
        border: 1px solid var(--blue-corp);
        background: var(--white);
      }
      .edit-add-form.visible {
        display: block;
      }
      .edit-add-form-title {
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--blue-corp);
        margin-bottom: 10px;
      }
      .edit-add-dep-info {
        font-family: var(--mono);
        font-size: 10px;
        line-height: 1.6;
        color: var(--ink-mid);
        background: var(--off);
        border: 1px solid var(--rule);
        padding: 8px 12px;
        margin: 10px 0;
      }

      /* ── EDIT: бейдж удалённого раздела (перечёркнутый) ── */
      .edit-deleted-badge {
        font-family: var(--mono);
        font-size: 9px;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--red);
        background: #fff5f5;
        border: 1px solid var(--red);
        padding: 2px 8px;
        margin-left: 8px;
      }
```

---

## 11. JS — Модификация `populateDocState()`: добавить `data-section-key` к DOM-контейнерам

**Где:** внутри функции `populateDocState`, **найти** фрагмент:
```javascript
        for (let i = 0; i < passes.length; i++) {
          for (const def of passes[i]) {
            DOC_STATE.sectionDbIdx[def.key] = i;
            DOC_STATE.sectionDefs[def.key] = { ...def };
          }
        }
```
**Заменить ЦЕЛИКОМ на:**

```javascript
        for (let i = 0; i < passes.length; i++) {
          for (const def of passes[i]) {
            DOC_STATE.sectionDbIdx[def.key] = i;
            DOC_STATE.sectionDefs[def.key] = { ...def };
          }
          // Помечаем DOM-контейнер ключом раздела для rebuildDbMapping
          const el = document.getElementById("db" + i);
          if (el) {
            el.setAttribute("data-section-key", passes[i].map(d => d.key).join("+"));
          }
        }
```

---

## 12. JS — Утилиты: `rebuildDbMapping()` и `recalcSectionNumbers()`

**Где:** сразу **после** функции `updateFooterCost()` (добавленной в Этапе 1, пункт 3).  
**Якорь:** найти строку:
```javascript
      /** Обновляет текст стоимости в футере после перегенерации */
      function updateFooterCost() {
```
Найти закрывающую `}` этой функции. **Вставить ПОСЛЕ неё:**

```javascript

      /**
       * Пересобирает db-индексы после структурного изменения (удаление/добавление).
       * Проходит по потомкам #docBodies, переназначает id="db{N}",
       * обновляет DOC_STATE.sectionDbIdx и graphBodyIdx.
       */
      function rebuildDbMapping() {
        const db = document.getElementById("docBodies");
        if (!db) return;
        const children = Array.from(db.children);
        DOC_STATE.sectionDbIdx = {};
        graphBodyIdx = -1;

        children.forEach((el, i) => {
          el.id = "db" + i;
          if (i > 0) el.style.borderTop = "none";
          else el.style.borderTop = "";

          const keyAttr = el.getAttribute("data-section-key");
          if (keyAttr) {
            const keys = keyAttr.split("+");
            for (const k of keys) {
              DOC_STATE.sectionDbIdx[k] = i;
              if (k === "graph") graphBodyIdx = i;
            }
          }
        });
      }

      /**
       * Пересчитывает номера §§ всех разделов по текущему DOC_STATE.sectionOrder.
       * Обновляет DOC_STATE.sectionDefs[key].num и элементы .section-num в DOM.
       * Возвращает маппинг { старый_номер → новый_номер } для перезаписи ссылок.
       */
      function recalcSectionNumbers() {
        const renumberMap = {};
        let num = 1;

        for (const key of DOC_STATE.sectionOrder) {
          const def = DOC_STATE.sectionDefs[key];
          if (!def) { num++; continue; }

          const oldNum = def.num;
          def.num = num;
          if (oldNum !== num) renumberMap[oldNum] = num;

          // Обновляем .section-num в DOM
          const idx = DOC_STATE.sectionDbIdx[key];
          const el = document.getElementById("db" + idx);
          if (el) {
            const numEl = el.querySelector(".section-num");
            if (numEl) numEl.textContent = "§ " + num;
          }
          num++;
        }

        return renumberMap;
      }

      /**
       * Определяет позицию вставки нового раздела в текущий порядок.
       * Возвращает индекс в DOC_STATE.sectionOrder (0-based), ПОСЛЕ которого
       * следует вставить новый раздел.
       * Если раздел должен быть первым (после sum) — возвращает 0.
       */
      function findInsertPosition(newKey) {
        const currentSections = DOC_STATE.sectionOrder.filter(k => k !== "sum");
        const allSections = [...currentSections, newKey];

        // Пересчитываем эффективные зависимости с новым разделом
        const p = DOC_STATE.params;
        const resolvedDeps = resolveContextDeps(p);
        const effDeps = buildEffectiveDeps(allSections, resolvedDeps);
        const newOrder = buildDynamicOrder(effDeps, allSections, resolvedDeps);
        // newOrder включает "sum" первым

        // Находим позицию newKey в новом порядке
        const posInNew = newOrder.indexOf(newKey);

        // Находим ближайший предшествующий раздел, который есть в текущем порядке
        for (let i = posInNew - 1; i >= 0; i--) {
          const prevKey = newOrder[i];
          const posInCurrent = DOC_STATE.sectionOrder.indexOf(prevKey);
          if (posInCurrent !== -1) return posInCurrent;
        }

        // Если предшественников нет — вставляем после sum (позиция 0 в sectionOrder → после sum)
        return 0;
      }

      /**
       * Пересчитывает effectiveDeps и resolvedDeps после изменения набора разделов.
       */
      function recalcDependencies() {
        const p = DOC_STATE.params;
        if (!p) return;
        const currentSections = DOC_STATE.sectionOrder.filter(k => k !== "sum");
        p.sec = [...currentSections];
        DOC_STATE.resolvedDeps = resolveContextDeps(p);
        DOC_STATE.effectiveDeps = buildEffectiveDeps(currentSections, DOC_STATE.resolvedDeps);
      }
```

---

## 13. JS — Логика удаления раздела

**Где:** сразу **после** функции `highlightDependentCards()` (добавленной в Этапе 1, пункт 4).  
**Якорь:** найти закрывающую `}` функции `highlightDependentCards`. **Вставить ПОСЛЕ неё:**

```javascript

      // ════════════════════════════════════════
      // EDIT — удаление раздела
      // ════════════════════════════════════════

      /**
       * Показывает подтверждение и удаляет раздел из документа.
       */
      function confirmAndDelete(sectionKey) {
        const label = KEY_LABELS[sectionKey] || sectionKey;
        const dependents = computeDependents(DOC_STATE.effectiveDeps);
        const deps = [...(dependents[sectionKey] || [])].filter(k => k !== "sum");
        const allOthers = DOC_STATE.sectionOrder.filter(k => k !== "sum" && k !== sectionKey);
        const isTotal = deps.length >= allOthers.length;

        let msg = `УДАЛИТЬ раздел «${label}»?\n\nЭто действие необратимо.`;

        if (isTotal) {
          msg += `\n\n⚠ ВСЕ остальные разделы зависят от «${label}».\nИх качество деградирует без этого раздела.\nРекомендуется перегенерировать их после удаления.`;
        } else if (deps.length > 0) {
          const depNames = deps.map(k => "«" + (KEY_LABELS[k] || k) + "»").join(", ");
          msg += `\n\nЗатронутые разделы: ${depNames}.\nОни потеряют часть контекста. Рекомендуется перегенерировать их.`;
        }

        // Подстановки: какие разделы могут компенсировать потерю?
        const currentSections = DOC_STATE.sectionOrder.filter(k => k !== "sum");
        const available = new Set(["sum", ...currentSections.filter(k => k !== sectionKey)]);
        const consumers = deps.filter(depKey => {
          // Проверяем, есть ли для depKey замены в SUBSTITUTION_MAP
          const depDeps = DOC_STATE.effectiveDeps[depKey];
          if (!depDeps) return false;
          const allKeys = [...depDeps.required, ...depDeps.optional];
          return allKeys.some(k => sourceOf(k) === sectionKey);
        });
        if (consumers.length > 0 && !isTotal) {
          msg += `\n\nСистема попытается использовать подстановки контекста для смягчения потерь.`;
        }

        if (!confirm(msg)) return;

        deleteSection(sectionKey);
      }

      /**
       * Удаляет раздел из документа.
       */
      function deleteSection(sectionKey) {
        // ── 1. Удаляем DOM-контейнер ──
        const dbIdx = DOC_STATE.sectionDbIdx[sectionKey];
        const container = document.getElementById("db" + dbIdx);
        if (container) container.remove();

        // ── 2. Обновляем DOC_STATE ──
        DOC_STATE.sectionOrder = DOC_STATE.sectionOrder.filter(k => k !== sectionKey);
        delete DOC_STATE.sectionDbIdx[sectionKey];
        delete DOC_STATE.sectionHTML[sectionKey];
        delete DOC_STATE.sectionDefs[sectionKey];
        delete DOC_STATE.params.secCtx[sectionKey];
        DOC_STATE.editedSections.delete(sectionKey);

        // ── 3. Перестраиваем маппинг db-индексов ──
        rebuildDbMapping();

        // ── 4. Пересчитываем зависимости (без удалённого раздела) ──
        recalcDependencies();

        // ── 5. Пересчитываем номера §§ ──
        const renumberMap = recalcSectionNumbers();

        // ── 6. Обновляем ссылки §N в тексте ──
        renumberSectionRefs(renumberMap);

        // ── 7. Обновляем кэш HTML ──
        for (const key of DOC_STATE.sectionOrder) {
          const idx = DOC_STATE.sectionDbIdx[key];
          const el = document.getElementById("db" + idx);
          if (el) DOC_STATE.sectionHTML[key] = el.innerHTML;
        }

        // ── 8. Если удалили граф — скрываем кнопку графа ──
        if (sectionKey === "graph") {
          G = {
            nodes: [], edges: [],
            topology: { clusters: {}, roles: { structural: {}, procedural: {} }, clusterLabels: [] }
          };
          graphBodyIdx = -1;
          document.getElementById("btnGraph").style.display = "none";
        }

        // ── 9. Перерисовываем модальное окно ──
        renderEditSections();
      }
```

---

## 14. JS — Логика добавления раздела

**Где:** сразу **после** функции `deleteSection()` (из пункта 13 выше).  
**Вставить ПОСЛЕ неё:**

```javascript

      // ════════════════════════════════════════
      // EDIT — добавление раздела
      // ════════════════════════════════════════

      /** Все доступные для добавления ключи разделов */
      const ALL_SECTION_KEYS = [
        "graph", "glossary", "theses", "name", "history",
        "origin", "practical", "dialogue", "evolution", "critique"
      ];

      /** Возвращает ключи разделов, которых нет в текущем документе */
      function getAvailableSectionsToAdd() {
        const current = new Set(DOC_STATE.sectionOrder);
        return ALL_SECTION_KEYS.filter(k => !current.has(k));
      }

      /** Выбирает раздел для добавления: показывает форму с контекстом и предупреждениями */
      function selectSectionToAdd(sectionKey) {
        const form = document.getElementById("editAddForm");
        if (!form) return;

        const label = KEY_LABELS[sectionKey] || sectionKey;

        // Заголовок
        const titleEl = form.querySelector(".edit-add-form-title");
        if (titleEl) titleEl.textContent = "Добавить: " + label;

        // Поле контекста
        let ctxField = document.getElementById("editAddCtxField");
        if (ctxField) ctxField.value = "";

        // Информация о зависимостях
        const depInfo = document.getElementById("editAddDepInfo");
        if (depInfo) {
          // Вычисляем, какие существующие разделы улучшатся
          const currentSections = DOC_STATE.sectionOrder.filter(k => k !== "sum");
          const allSections = [...currentSections, sectionKey];
          const tempResolved = resolveContextDeps({ ...DOC_STATE.params, sec: allSections });
          const tempEffDeps = buildEffectiveDeps(allSections, tempResolved);

          // Кто зависит от нового раздела?
          const tempDependents = computeDependents(tempEffDeps);
          const beneficiaries = [...(tempDependents[sectionKey] || [])]
            .filter(k => k !== "sum" && currentSections.includes(k));

          // Кто нужен новому разделу?
          const preds = computePredecessors(tempEffDeps);
          const prerequisites = [...(preds[sectionKey] || [])]
            .filter(k => k !== "sum");
          const missingPreds = prerequisites.filter(k => !currentSections.includes(k));

          let infoHTML = "";

          if (missingPreds.length > 0) {
            const names = missingPreds.map(k => "«" + (KEY_LABELS[k] || k) + "»").join(", ");
            infoHTML += `<div style="color:var(--gold);margin-bottom:6px">⚠ Отсутствуют предшественники: ${names}. Раздел будет сгенерирован с неполным контекстом (система применит подстановки).</div>`;
          }

          if (beneficiaries.length > 0) {
            const names = beneficiaries.map(k => "«" + (KEY_LABELS[k] || k) + "»").join(", ");
            infoHTML += `<div style="color:var(--green-check)">✦ Добавление улучшит качество: ${names}. Рекомендуется перегенерировать их после.</div>`;
          }

          if (prerequisites.length > 0 && missingPreds.length === 0) {
            const names = prerequisites.map(k => "«" + (KEY_LABELS[k] || k) + "»").join(", ");
            infoHTML += `<div style="color:var(--ink-dim)">Контекст из: ${names}.</div>`;
          }

          depInfo.innerHTML = infoHTML || '<div style="color:var(--ink-dim)">Раздел может быть добавлен без ограничений.</div>';
        }

        // Кнопка генерации
        let genBtn = document.getElementById("editAddGenBtn");
        if (genBtn) {
          genBtn.onclick = () => confirmAndAdd(sectionKey);
          genBtn.disabled = false;
          genBtn.textContent = "Сгенерировать";
        }

        // Сохраняем выбранный ключ
        form.setAttribute("data-adding-key", sectionKey);

        // Показываем форму
        form.classList.add("visible");

        // Подсвечиваем выбранную кнопку
        form.closest(".edit-add-panel")?.querySelectorAll(".edit-add-btn").forEach(btn => {
          btn.style.fontWeight = btn.getAttribute("data-key") === sectionKey ? "700" : "";
        });
      }

      /** Подтверждение и запуск добавления раздела */
      function confirmAndAdd(sectionKey) {
        const label = KEY_LABELS[sectionKey] || sectionKey;
        const ctxField = document.getElementById("editAddCtxField");
        const newCtx = ctxField ? ctxField.value.trim() : "";

        if (!confirm(`Добавить раздел «${label}» и сгенерировать его?`)) return;

        addSection(sectionKey, newCtx);
      }

      /**
       * Добавляет новый раздел в документ.
       * @param {string} sectionKey — ключ раздела
       * @param {string} newCtx     — дополнительный контекст (или "")
       */
      async function addSection(sectionKey, newCtx) {
        const p = DOC_STATE.params;
        if (!p) return;

        // ── Блокируем UI ──
        const genBtn = document.getElementById("editAddGenBtn");
        const progress = document.getElementById("editAddProgress");
        const progressText = document.getElementById("editAddProgressText");
        if (genBtn) genBtn.disabled = true;
        if (progress) progress.classList.add("active");

        try {
          // ── 1. Определяем позицию вставки ──
          const insertAfterIdx = findInsertPosition(sectionKey);
          // insertAfterIdx — индекс в DOC_STATE.sectionOrder

          // ── 2. Обновляем DOC_STATE.sectionOrder ──
          DOC_STATE.sectionOrder.splice(insertAfterIdx + 1, 0, sectionKey);

          // ── 3. Сохраняем контекст ──
          if (newCtx) {
            DOC_STATE.params.secCtx[sectionKey] = newCtx;
          }

          // ── 4. Пересчитываем зависимости с новым разделом ──
          recalcDependencies();

          // ── 5. Создаём DOM-контейнер и вставляем в правильное место ──
          const db = document.getElementById("docBodies");
          const newContainer = document.createElement("div");
          newContainer.className = "doc-body";
          newContainer.setAttribute("data-section-key", sectionKey);
          newContainer.style.borderTop = "none";

          // Ищем DOM-элемент раздела, ПОСЛЕ которого вставляем
          const prevKey = DOC_STATE.sectionOrder[insertAfterIdx];
          const prevDbIdx = DOC_STATE.sectionDbIdx[prevKey];
          const prevEl = document.getElementById("db" + prevDbIdx);

          if (prevEl && prevEl.nextSibling) {
            db.insertBefore(newContainer, prevEl.nextSibling);
          } else {
            db.appendChild(newContainer);
          }

          // ── 6. Перестраиваем db-маппинг ──
          rebuildDbMapping();

          // ── 7. Пересчитываем номера §§ ──
          // Сначала создаём def для нового раздела
          const fullP = { ...p, sec: DOC_STATE.sectionOrder.filter(k => k !== "sum"), secCtx: { ...DOC_STATE.params.secCtx } };
          const allDefs = buildSectionDefs(fullP);
          patchPromptsWithSecCtx(allDefs, fullP.secCtx);
          const defsMap = Object.fromEntries(allDefs.map(d => [d.key, d]));
          const newDef = defsMap[sectionKey];
          if (!newDef) throw new Error("Раздел «" + sectionKey + "» не найден в определениях.");

          // Номер будет назначен в recalcSectionNumbers
          DOC_STATE.sectionDefs[sectionKey] = { ...newDef };

          const renumberMap = recalcSectionNumbers();
          // Присваиваем актуальный номер
          newDef.num = DOC_STATE.sectionDefs[sectionKey].num;

          // ── 8. Обновляем ссылки §N в существующих разделах ──
          renumberSectionRefs(renumberMap);

          // ── 9. Собираем контекст и промпт ──
          if (progressText) progressText.textContent = "Построение контекста...";

          const generated = {};
          for (const key of DOC_STATE.sectionOrder) {
            if (key === sectionKey) continue;
            const idx = DOC_STATE.sectionDbIdx[key];
            const el = document.getElementById("db" + idx);
            if (el && el.querySelector(".doc-section")) {
              generated[key] = el;
            }
          }

          let prior = "";
          if (sectionKey !== "sum") {
            try {
              prior = buildContextForSection(
                sectionKey, generated, fullP.depth,
                DOC_STATE.effectiveDeps,
                DOC_STATE.resolvedDeps
              );
            } catch (ctxErr) {
              console.warn("Ошибка контекста при добавлении раздела", sectionKey, ctxErr);
            }
          }

          const SYS = buildSYS();
          const partBase = baseCtx(fullP);
          const partRules = htmlRules();
          const partQuality = buildPartQuality(fullP);
          const sp = `§ ${newDef.num} — ${newDef.title.toUpperCase()}\n${newDef.prompt}`;
          const fp = `ПАРАМЕТРЫ СИНТЕЗА:\n${partBase}${prior}\n\n${partRules}\n\nЗАДАНИЕ: составь ТОЛЬКО следующие разделы (строго в указанном порядке, без добавления других):\n\n${sp}\n\n${partQuality}`;

          // ── 10. GenLog ──
          const genEntry = {
            sectionKey,
            sectionLabel: newDef.title + " [добавлен]",
            priorChars: prior.length,
            taskChars: sp.length,
            inputChars: SYS.length + fp.length,
            outputChars: 0,
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            error: null,
            status: "streaming",
            source: "edit-add",
          };
          genLog.push(genEntry);

          // ── 11. Стриминг ──
          if (progressText) progressText.textContent = "Генерация...";

          const onDelta = (charsSoFar) => {
            genEntry.outputChars = charsSoFar;
            if (progressText) progressText.textContent = "Генерация... " + charsSoFar + " симв.";
          };

          const usage = await streamResp(fp, newContainer, SYS, onDelta);

          totalInputTokens += usage.input_tokens;
          totalOutputTokens += usage.output_tokens;

          genEntry.outputChars = newContainer.innerHTML.length;
          genEntry.inputTokens = usage.input_tokens;
          genEntry.outputTokens = usage.output_tokens;
          genEntry.cost = usage.input_tokens * 3 / 1e6 + usage.output_tokens * 15 / 1e6;
          genEntry.status = "done";

          // ── 12. Вставляем <details> для контекста ──
          if (newCtx) {
            const disc = makeSectionCtxDisclosure(newCtx);
            newContainer.insertBefore(disc, newContainer.firstChild);
          }

          // ── 13. Обработка особых разделов ──
          if (sectionKey === "name") {
            updateDocTitleFromName(newContainer);
          }
          if (sectionKey === "graph") {
            try {
              G = parseGraph(newContainer);
              if (G.nodes.length > 0) {
                document.getElementById("btnGraph").style.display = "";
              }
            } catch (e) {
              console.warn("Graph parse after add:", e);
            }
          }

          // ── 14. Финализация DOC_STATE ──
          DOC_STATE.sectionHTML[sectionKey] = newContainer.innerHTML;
          DOC_STATE.editedSections.add(sectionKey);

          updateFooterCost();

          // ── 15. Перерисовываем модальное окно ──
          if (progressText) progressText.textContent = "✓ Готово";
          setTimeout(() => renderEditSections(), 1500);

        } catch (err) {
          console.error("Ошибка добавления раздела:", sectionKey, err);
          if (progressText) progressText.textContent = "⚠ Ошибка: " + err.message;

          // Откатываем: удаляем раздел если он был частично добавлен
          if (DOC_STATE.sectionOrder.includes(sectionKey)) {
            DOC_STATE.sectionOrder = DOC_STATE.sectionOrder.filter(k => k !== sectionKey);
            delete DOC_STATE.sectionDefs[sectionKey];
            const idx = DOC_STATE.sectionDbIdx[sectionKey];
            const el = document.getElementById("db" + idx);
            if (el) el.remove();
            rebuildDbMapping();
            recalcDependencies();
            recalcSectionNumbers();
          }
        } finally {
          if (genBtn) genBtn.disabled = false;
          setTimeout(() => {
            if (progress) progress.classList.remove("active");
          }, 3000);
        }
      }
```

---

## 15. JS — Модификация `renderEditSections()`: кнопка удаления + панель добавления

**Где:** Этап 1, пункт 4 — функция `renderEditSections()`.  
Нужно внести три изменения внутри этой функции.

### 15a. Добавить кнопку «Удалить» в блок действий каждой карточки

**Найти** внутри `renderEditSections()` фрагмент:
```javascript
          // Кнопки
          let actionsHTML = `
            <div class="edit-sec-actions">
              <button class="edit-sec-btn primary" 
                      id="editRegenBtn-${key}"
                      onclick="confirmAndRegenerate('${key}')">
                Перегенерировать
              </button>
            </div>`;
```

**Заменить ЦЕЛИКОМ на:**

```javascript
          // Кнопки
          let actionsHTML = `
            <div class="edit-sec-actions">
              <button class="edit-sec-btn primary" 
                      id="editRegenBtn-${key}"
                      onclick="confirmAndRegenerate('${key}')">
                Перегенерировать
              </button>
              <button class="edit-sec-btn danger" 
                      onclick="confirmAndDelete('${key}')">
                Удалить
              </button>
            </div>`;
```

### 15b. Добавить панель «Добавить раздел» в конец модального окна

**Найти** в `renderEditSections()` последнюю строку перед закрывающей `}` функции — это `body.appendChild(card);` внутри цикла `for`.  
**Найти** закрывающую `}` цикла `for (const key of order)`, а затем закрывающую `}` самой функции.

Вставить **между** концом цикла и закрывающей `}` функции, т.е. **найти:**
```javascript
          card.innerHTML = headerHTML + ctxHTML + depsHTML + progressHTML + actionsHTML;
          body.appendChild(card);
        }
      }
```

**Заменить на:**

```javascript
          card.innerHTML = headerHTML + ctxHTML + depsHTML + progressHTML + actionsHTML;
          body.appendChild(card);
        }

        // ── Панель добавления раздела ──
        const available = getAvailableSectionsToAdd();
        if (available.length > 0) {
          const addPanel = document.createElement("div");
          addPanel.className = "edit-add-panel";

          let addBtnsHTML = available.map(k =>
            `<button class="edit-add-btn" data-key="${k}" 
                    onclick="selectSectionToAdd('${k}')">
              + ${esc(KEY_LABELS[k] || k)}
            </button>`
          ).join("");

          addPanel.innerHTML = `
            <div class="edit-add-title">+ Добавить раздел</div>
            <div class="edit-add-grid">${addBtnsHTML}</div>
            <div class="edit-add-form" id="editAddForm">
              <div class="edit-add-form-title" id="editAddFormTitle">Добавить: —</div>
              <div class="edit-add-dep-info" id="editAddDepInfo"></div>
              <div class="edit-sec-ctx-row">
                <div class="edit-sec-ctx-label">Дополнительный контекст нового раздела</div>
                <textarea class="edit-sec-ctx-field" id="editAddCtxField"
                          placeholder="Особые требования, акценты, ограничения..."></textarea>
              </div>
              <div style="margin-top:10px;display:flex;align-items:center;gap:10px">
                <button class="edit-sec-btn primary" id="editAddGenBtn">Сгенерировать</button>
                <div class="edit-regen-progress" id="editAddProgress">
                  <div class="edit-regen-spinner"></div>
                  <span id="editAddProgressText">Генерация...</span>
                </div>
              </div>
            </div>`;

          body.appendChild(addPanel);
        }
      }
```

### 15c. Согласованность имени функции `esc()`

> Если в Этапе 1 (пункт 7) вы решили переименовать `esc` → `escHtml`, замените вызовы `esc(...)` в коде Этапа 2 на `escHtml(...)`.  
> По умолчанию (рекомендация Этапа 1) — используется `esc()` везде. В таком случае никаких замен не нужно.

---

## 16. Сводка изменений Этапа 2

| Место | Действие | Объём |
|---|---|---|
| CSS (в конец блока Этапа 1) | Стили для удаления/добавления | ~100 строк |
| `populateDocState()` | Добавить `data-section-key` на контейнеры | +5 строк (замена) |
| После `updateFooterCost()` | `rebuildDbMapping`, `recalcSectionNumbers`, `findInsertPosition`, `recalcDependencies` | ~95 строк |
| После `highlightDependentCards()` | `confirmAndDelete`, `deleteSection` | ~95 строк |
| После `deleteSection()` | `getAvailableSectionsToAdd`, `selectSectionToAdd`, `confirmAndAdd`, `addSection` | ~250 строк |
| `renderEditSections()` | Кнопка «Удалить» + панель добавления | ~40 строк (замена + вставка) |

**Итого Этап 2: ~580 строк нового кода, ~10 строк замен в существующем коде Этапа 1.**

---

## Примечания к тестированию Этапа 2

### Удаление
1. Откройте модальное окно «Изменить».
2. Нажмите «Удалить» на любом разделе.
3. Должно появиться подтверждение с перечнем зависимых разделов.
4. После подтверждения: раздел исчезает из документа, нумерация §§ обновляется, ссылки §N в тексте других разделов корректируются.
5. Модальное окно перерисовывается: удалённый раздел исчезает, в панели «Добавить» появляется кнопка для его возврата.
6. Повторное удаление другого раздела работает корректно (каскадное обновление).

### Добавление
1. В панели «Добавить раздел» выберите один из доступных.
2. Появляется форма: информация о зависимостях, поле контекста, кнопка «Сгенерировать».
3. Информация показывает: какие разделы улучшатся; каких предшественников не хватает; откуда будет взят контекст.
4. После генерации: раздел появляется в документе в правильной позиции, нумерация §§ обновляется, ссылки корректируются.
5. Модальное окно перерисовывается: добавленный раздел появляется в списке, из панели «Добавить» исчезает.

### Граничные случаи
- Удаление графа: кнопка «3D/2D Граф» скрывается, объект `G` сбрасывается.
- Добавление графа: после генерации `G` парсится, кнопка появляется.
- Удаление всех разделов, кроме одного: панель «Добавить» содержит все 9 кнопок.
- Добавление раздела, все предшественники которого отсутствуют: предупреждение + генерация с подстановками.

---

## Этап 3: Импорт HTML + встраивание состояния в сохранённый файл

> Все якоря даны **относительно файла после применения Этапов 1 и 2**.

---

## 17. CSS — Стили для кнопки и панели импорта

**Где:** в конец CSS-блока Этапа 2 (после стилей `.edit-deleted-badge`), **перед** `</style>`.

```css

      /* ── IMPORT ── */
      .import-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
        padding-top: 14px;
        border-top: 1px dashed var(--rule);
      }
      .import-btn {
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        background: transparent;
        border: 1px solid var(--rule-strong);
        padding: 8px 18px;
        cursor: pointer;
        color: var(--ink-mid);
        transition: all 0.15s;
      }
      .import-btn:hover {
        border-color: var(--violet);
        color: var(--violet);
      }
      .import-status {
        font-family: var(--mono);
        font-size: 10px;
        color: var(--ink-dim);
        letter-spacing: 0.5px;
      }
      .import-status.ok {
        color: var(--green-check);
      }
      .import-status.err {
        color: var(--red);
      }
```

---

## 18. HTML — Кнопка импорта и скрытый file input

### 18a. Скрытый file input

**Где:** непосредственно **перед** `<script>` (тот, что содержит `// STATE`).  
**Якорь:** найти строку:
```html
    <script>
      // ════════════════════════════════════════
      // STATE
```
**Вставить ПЕРЕД `<script>`:**

```html
    <!-- IMPORT FILE INPUT (скрыт) -->
    <input type="file" id="importFileInput" accept=".html,.htm"
           style="display:none" onchange="handleImportFile(this)">
```

### 18b. Кнопка импорта в форме ввода

**Где:** внутри `.submit-row`, **после** закрывающего `</div>` контейнера кнопки «Синтезировать Концепцию» и `costEstimate`, **перед** закрывающим `</div>` самого `.submit-row`.  
**Якорь:** найти строку:
```html
            <div id="costEstimate" style="font-family: var(--mono); font-size: 9px; color: var(--ink-dim); letter-spacing: 0.5px; text-align: right"></div>
          </div>
        </div>
      </div>
```
Здесь `</div></div>` — это закрытие flex-контейнера кнопки, затем `.submit-row`, затем `.input-form`.

**Заменить** эти четыре строки на:

```html
            <div id="costEstimate" style="font-family: var(--mono); font-size: 9px; color: var(--ink-dim); letter-spacing: 0.5px; text-align: right"></div>
          </div>
        </div>
        <div class="import-row">
          <button class="import-btn" onclick="document.getElementById('importFileInput').click()">
            ↑ Импорт HTML
          </button>
          <span class="import-status" id="importStatus"></span>
        </div>
      </div>
```

> Это вставляет строку импорта внутри `.input-form`, под `submit-row`, но до закрытия формы.

---

## 19. JS — Модификация `saveHTML()`: встраивание состояния

**Где:** внутри функции `saveHTML()`.  
**Якорь:** найти строку:
```javascript
        const html = `<!DOCTYPE html><html lang="ru"><head>
```
(это одна длинная строка, начинается с `const html =`).

**Заменить всю строку** (от `const html =` до `downloadFile(html, getDocFilename("html"), "text/html");`) — т.е. строки 8229–8230 — **на:**

```javascript
        // ── Встраиваем состояние для импорта ──
        let stateJSON = "";
        try {
          const stateData = {
            version: 1,
            genLog: genLog,
            ctxLog: ctxLog,
            genCommon: genCommon,
            params: DOC_STATE.ready ? DOC_STATE.params : null,
            sectionOrder: DOC_STATE.ready ? DOC_STATE.sectionOrder : null,
            editedSections: DOC_STATE.ready ? [...DOC_STATE.editedSections] : [],
          };
          stateJSON = `\n<script type="application/json" id="philosynth-state">${JSON.stringify(stateData)}<\/script>`;
        } catch (e) {
          console.warn("Не удалось сериализовать состояние:", e);
        }

        const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${document.getElementById("docTitle").textContent}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">${styles}<style>body{background:#f2f0eb;padding:32px}#docOutput{max-width:1100px;margin:0 auto}</style></head><body><div id="docOutput">${docHTML}</div>${graphSection}${stateJSON}</body></html>`;
        downloadFile(html, getDocFilename("html"), "text/html");
```

---

## 20. JS — Обратные маппинги для распознавания параметров

**Где:** сразу **после** константы `KEY_LABELS` (добавленной в Этапе 1, пункт 3).  
**Якорь:** найти закрывающую `};` объекта `KEY_LABELS`. **Вставить ПОСЛЕ неё:**

```javascript

      // ── Обратные маппинги: отображаемое название → внутренний ключ ──
      const REVERSE_ML = Object.fromEntries(Object.entries(ML).map(([k, v]) => [v, k]));
      const REVERSE_DL = Object.fromEntries(Object.entries(DL).map(([k, v]) => [v, k]));
      const REVERSE_SL = Object.fromEntries(Object.entries(SL).map(([k, v]) => [v, k]));

      /**
       * Маппинг заголовка раздела из .section-title → ключ раздела.
       * Ключи — нижний регистр, без лишних пробелов.
       */
      const TITLE_TO_KEY = {
        "исполнительное резюме синтеза":               "sum",
        "исполнительное резюме":                       "sum",
        "граф категорий концепции":                    "graph",
        "граф категорий и концептуальных связей":      "graph",
        "граф категорий":                              "graph",
        "глоссарий категорий и определений":           "glossary",
        "глоссарий терминов":                          "glossary",
        "глоссарий":                                   "glossary",
        "корпус тезисов":                              "theses",
        "название концепции и его анализ":             "name",
        "анализ названия":                             "name",
        "название концепции":                          "name",
        "историческая контекстуализация":              "history",
        "анализ происхождения":                        "origin",
        "анализ происхождения и генеалогия идей":      "origin",
        "практическое применение":                     "practical",
        "диалог между традициями":                     "dialogue",
        "эволюция и перспективы":                      "evolution",
        "эволюция и перспективы концепции":            "evolution",
        "критический анализ":                          "critique",
        "критический анализ синтеза":                  "critique",
      };

      /**
       * Определяет ключ раздела по тексту заголовка .section-title.
       * Сначала точное совпадение, затем поиск по ключевым словам.
       */
      function titleToKey(titleText) {
        const norm = titleText.toLowerCase().trim()
          .replace(/\s+/g, " ")
          .replace(/^§\s*\d+\s*[-–—]\s*/, ""); // убираем "§ 3 — "

        // 1. Точное совпадение
        if (TITLE_TO_KEY[norm]) return TITLE_TO_KEY[norm];

        // 2. Совпадение по вхождению (заголовок может содержать доп. текст)
        for (const [pattern, key] of Object.entries(TITLE_TO_KEY)) {
          if (norm.includes(pattern) || pattern.includes(norm)) return key;
        }

        // 3. Ключевые слова
        const KW = {
          "резюме": "sum", "граф": "graph", "глоссар": "glossary",
          "тезис": "theses", "назван": "name", "историч": "history",
          "происхожден": "origin", "практическ": "practical",
          "диалог": "dialogue", "эволюц": "evolution", "критическ": "critique",
        };
        for (const [kw, key] of Object.entries(KW)) {
          if (norm.includes(kw)) return key;
        }

        return null; // не удалось распознать
      }
```

---

## 21. JS — Функции импорта

**Где:** сразу **после** функции `addSection()` (добавленной в Этапе 2, пункт 14).  
**Якорь:** найти закрывающий блок `finally { ... }` функции `addSection`, затем её закрывающую `}`. **Вставить ПОСЛЕ неё:**

```javascript

      // ════════════════════════════════════════
      // IMPORT HTML
      // ════════════════════════════════════════

      /** Обработчик выбора файла */
      function handleImportFile(input) {
        const file = input.files?.[0];
        if (!file) return;
        input.value = ""; // сброс, чтобы можно было выбрать тот же файл повторно

        const statusEl = document.getElementById("importStatus");
        if (statusEl) {
          statusEl.className = "import-status";
          statusEl.textContent = "Загрузка...";
        }

        const reader = new FileReader();
        reader.onload = () => {
          try {
            importHTML(reader.result, file.name);
            if (statusEl) {
              statusEl.className = "import-status ok";
              statusEl.textContent = "✓ Импортирован: " + file.name;
            }
          } catch (err) {
            console.error("Ошибка импорта:", err);
            if (statusEl) {
              statusEl.className = "import-status err";
              statusEl.textContent = "⚠ Ошибка: " + err.message;
            }
          }
        };
        reader.onerror = () => {
          if (statusEl) {
            statusEl.className = "import-status err";
            statusEl.textContent = "⚠ Не удалось прочитать файл";
          }
        };
        reader.readAsText(file);
      }

      /**
       * Импортирует сохранённый HTML-документ PhiloSynth.
       * @param {string} htmlString — содержимое файла
       * @param {string} filename   — имя файла (для сообщений)
       */
      function importHTML(htmlString, filename) {
        // ── 1. Парсинг HTML ──
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");

        // Проверка: это PhiloSynth-документ?
        const docOutput = doc.getElementById("docOutput") || doc.querySelector("#docOutput");
        if (!docOutput) {
          throw new Error("Не найден элемент #docOutput. Это не файл PhiloSynth.");
        }

        // ── 2. Извлечение метаданных из шапки ──
        const meta = extractMetadata(doc);

        // ── 3. Извлечение разделов ──
        const sections = extractSections(doc);
        if (sections.length === 0) {
          throw new Error("В файле не найдено ни одного раздела (.doc-section).");
        }

        // ── 4. Извлечение встроенного состояния (если есть) ──
        const embeddedState = extractEmbeddedState(doc);

        // ── 5. Заполнение DOM ──
        populateFromImport(docOutput, meta, sections, embeddedState);

        // ── 6. Парсинг графа ──
        const docBodies = document.getElementById("docBodies");
        if (docBodies) {
          try {
            G = parseGraph(docBodies);
            if (G.nodes.length > 0) {
              document.getElementById("btnGraph").style.display = "";
            }
          } catch (e) {
            console.warn("Не удалось распарсить граф при импорте:", e);
          }
        }

        // ── 7. Построение DOC_STATE ──
        buildDocStateFromImport(meta, sections, embeddedState);

        console.log("Импорт завершён:", filename,
          "разделов:", sections.length,
          "состояние:", embeddedState ? "восстановлено" : "реконструировано");
      }

      /**
       * Извлекает метаданные из распарсенного HTML-документа.
       */
      function extractMetadata(doc) {
        const getText = (id) => {
          const el = doc.getElementById(id);
          return el ? el.textContent.trim() : "";
        };

        // Философы: из footerPhil или из docSubtitle
        let phil = [];
        const footerPhil = getText("footerPhil");
        if (footerPhil && footerPhil !== "—") {
          phil = footerPhil.split(/\s*,\s*/).filter(Boolean);
        } else {
          const subtitle = getText("docSubtitle");
          const m = subtitle.match(/На основе:\s*(.+)/i);
          if (m) phil = m[1].split(/\s*,\s*/).filter(Boolean);
        }

        // Метод, глубина, уровень — обратный маппинг
        const methodDisplay = getText("docMethod");
        const depthDisplay = getText("docDepth");
        const synthDisplay = getText("docSynthLevel");

        const method = REVERSE_ML[methodDisplay] || "dialectical";
        const depth = REVERSE_DL[depthDisplay] || "standard";
        const synthLevel = REVERSE_SL[synthDisplay] || "comparative";

        // Зерно и общий контекст — из <details class="header-disclosure">
        let seed = "", ctx = "";
        const headerExtras = doc.getElementById("docHeaderExtras");
        if (headerExtras) {
          headerExtras.querySelectorAll("details.header-disclosure").forEach(det => {
            const summaryText = det.querySelector("summary")?.textContent?.trim()?.toLowerCase() || "";
            const bodyText = det.querySelector(".disclosure-body")?.textContent?.trim() || "";
            if (summaryText.includes("зерно")) seed = bodyText;
            else if (summaryText.includes("контекст")) ctx = bodyText;
          });
        }

        const docNum = getText("docNum");

        return { phil, method, depth, synthLevel, seed, ctx, docNum };
      }

      /**
       * Извлекает разделы из распарсенного документа.
       * Возвращает массив { key, num, title, html, secCtx }
       */
      function extractSections(doc) {
        const sections = [];

        // Ищем все .doc-body контейнеры внутри #docBodies (или потомки #docOutput)
        const docBodies = doc.getElementById("docBodies") || doc.getElementById("docOutput");
        if (!docBodies) return sections;

        // Контейнеры могут быть .doc-body или непосредственно .doc-section
        const sectionEls = docBodies.querySelectorAll(".doc-section");

        sectionEls.forEach((secEl) => {
          const numText = secEl.querySelector(".section-num")?.textContent?.trim() || "";
          const titleText = secEl.querySelector(".section-title")?.textContent?.trim() || "";
          const numMatch = numText.match(/§\s*(\d+)/);
          const num = numMatch ? parseInt(numMatch[1], 10) : 0;

          const key = titleToKey(titleText);
          if (!key) {
            console.warn("Импорт: не удалось определить ключ для раздела «" + titleText + "» — пропущен.");
            return;
          }

          // Извлекаем доп. контекст раздела (если есть <details class="sec-disclosure">)
          let secCtx = "";
          // Ищем в родительском .doc-body
          const parentBody = secEl.closest(".doc-body") || secEl.parentElement;
          if (parentBody) {
            const disc = parentBody.querySelector("details.sec-disclosure");
            if (disc) {
              secCtx = disc.querySelector(".disclosure-body")?.textContent?.trim() || "";
            }
          }

          // HTML всего контейнера (.doc-body), включая disclosure
          const containerHTML = parentBody
            ? parentBody.innerHTML
            : secEl.outerHTML;

          sections.push({ key, num, title: titleText, html: containerHTML, secCtx });
        });

        // Сортируем по номеру §
        sections.sort((a, b) => a.num - b.num);

        return sections;
      }

      /**
       * Извлекает встроенное JSON-состояние, если оно есть в файле.
       */
      function extractEmbeddedState(doc) {
        const stateEl = doc.getElementById("philosynth-state");
        if (!stateEl) return null;
        try {
          return JSON.parse(stateEl.textContent);
        } catch (e) {
          console.warn("Не удалось распарсить встроенное состояние:", e);
          return null;
        }
      }

      /**
       * Заполняет DOM страницы содержимым импортированного документа.
       */
      function populateFromImport(importedDocOutput, meta, sections, embeddedState) {
        // ── Шапка документа ──
        document.getElementById("docTitle").textContent =
          importedDocOutput.querySelector("#docTitle")?.textContent || "Импортированный документ";
        document.getElementById("docSubtitle").textContent =
          importedDocOutput.querySelector("#docSubtitle")?.textContent || "—";
        document.getElementById("docNum").textContent = meta.docNum || "IMPORT";
        document.getElementById("docDate").textContent =
          importedDocOutput.querySelector("#docDate")?.textContent || new Date().toLocaleDateString("ru-RU");
        document.getElementById("docMethod").textContent = ML[meta.method] || meta.method;
        document.getElementById("docDepth").textContent = DL[meta.depth] || meta.depth;
        document.getElementById("docSynthLevel").textContent = SL[meta.synthLevel] || meta.synthLevel;

        // Зерно и контекст в шапке
        buildDocHeaderExtras(meta.seed, meta.ctx);

        // ── Тело документа ──
        const db = document.getElementById("docBodies");
        db.innerHTML = "";

        sections.forEach((sec, i) => {
          const container = document.createElement("div");
          container.className = "doc-body";
          container.id = "db" + i;
          container.setAttribute("data-section-key", sec.key);
          if (i > 0) container.style.borderTop = "none";
          container.innerHTML = sec.html;
          db.appendChild(container);
        });

        // ── Футер ──
        document.getElementById("footerPhil").textContent = meta.phil.join(", ");
        document.getElementById("sessionId").textContent = meta.docNum || "IMPORT";
        document.getElementById("docFooter").style.display = "flex";

        // Стоимость из встроенного состояния
        if (embeddedState?.genLog) {
          const totals = embeddedState.genLog.reduce((a, g) => ({
            inT: a.inT + (g.inputTokens || 0),
            outT: a.outT + (g.outputTokens || 0),
            cost: a.cost + (g.cost || 0),
          }), { inT: 0, outT: 0, cost: 0 });
          totalInputTokens = totals.inT;
          totalOutputTokens = totals.outT;
        } else {
          totalInputTokens = 0;
          totalOutputTokens = 0;
        }
        updateFooterCost();

        // ── Показываем документ ──
        document.getElementById("outputWrap").classList.add("visible");
        document.getElementById("progressPanel").classList.remove("visible");
        document.getElementById("outputWrap")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }

      /**
       * Строит DOC_STATE из импортированных данных.
       */
      function buildDocStateFromImport(meta, sections, embeddedState) {
        resetDocState();

        // ── Восстанавливаем логи ──
        if (embeddedState) {
          if (embeddedState.genLog)    genLog = embeddedState.genLog;
          if (embeddedState.ctxLog)    ctxLog = embeddedState.ctxLog;
          if (embeddedState.genCommon) genCommon = embeddedState.genCommon;
        } else {
          genLog = [];
          ctxLog = [];
          genCommon = null;
        }

        // ── Порядок разделов ──
        // Если есть встроенный порядок — используем его,
        // иначе реконструируем из извлечённых секций
        let sectionOrder;
        if (embeddedState?.sectionOrder) {
          sectionOrder = embeddedState.sectionOrder;
        } else {
          sectionOrder = ["sum", ...sections.map(s => s.key).filter(k => k !== "sum")];
        }

        // ── Параметры ──
        const secCtxMap = {};
        sections.forEach(s => { if (s.secCtx) secCtxMap[s.key] = s.secCtx; });

        const params = embeddedState?.params || {
          seed: meta.seed,
          phil: meta.phil,
          sec: sectionOrder.filter(k => k !== "sum"),
          method: meta.method,
          depth: meta.depth,
          synthLevel: meta.synthLevel,
          ctx: meta.ctx,
          secCtx: secCtxMap,
        };
        // Гарантируем, что secCtx содержит контексты из файла
        // (даже если params загружен из embedded state, файл мог быть отредактирован)
        for (const s of sections) {
          if (s.secCtx && !params.secCtx[s.key]) {
            params.secCtx[s.key] = s.secCtx;
          }
        }

        // ── Зависимости ──
        const resolvedDeps = resolveContextDeps(params);
        const currentSections = sectionOrder.filter(k => k !== "sum");
        const effectiveDeps = buildEffectiveDeps(currentSections, resolvedDeps);

        // ── Defs: реконструируем из params ──
        const allDefs = buildSectionDefs(params);
        patchPromptsWithSecCtx(allDefs, params.secCtx);
        const defsMap = Object.fromEntries(allDefs.map(d => [d.key, d]));

        // Номера назначаем по порядку sectionOrder
        let num = 1;
        for (const key of sectionOrder) {
          if (defsMap[key]) defsMap[key].num = num++;
        }

        // ── Заполняем DOC_STATE ──
        DOC_STATE.ready = true;
        DOC_STATE.params = params;
        DOC_STATE.sectionOrder = sectionOrder;
        DOC_STATE.resolvedDeps = resolvedDeps;
        DOC_STATE.effectiveDeps = effectiveDeps;
        DOC_STATE.docNum = meta.docNum;
        DOC_STATE.editedSections = new Set(embeddedState?.editedSections || []);

        // ── db-маппинг и HTML-кэш ──
        DOC_STATE.sectionDbIdx = {};
        DOC_STATE.sectionDefs = {};
        DOC_STATE.sectionHTML = {};

        sections.forEach((sec, i) => {
          DOC_STATE.sectionDbIdx[sec.key] = i;
          DOC_STATE.sectionDefs[sec.key] = defsMap[sec.key] ? { ...defsMap[sec.key] } : { key: sec.key, num: i + 1, title: sec.title, prompt: "" };
          const el = document.getElementById("db" + i);
          if (el) DOC_STATE.sectionHTML[sec.key] = el.innerHTML;
        });

        // graphBodyIdx
        graphBodyIdx = DOC_STATE.sectionDbIdx["graph"] ?? -1;
      }
```

---

## 22. Сводка изменений Этапа 3

| Место | Действие | Объём |
|---|---|---|
| CSS (в конец блока Этапов 1–2) | Стили импорта | ~35 строк |
| Перед `<script>` | Скрытый `<input type="file">` | 2 строки |
| `.submit-row` (внутри `.input-form`) | Кнопка «Импорт HTML» + статус | ~8 строк (замена 4 → 8) |
| `saveHTML()` | Встраивание JSON-состояния | ~15 строк (замена 2 → 17) |
| После `KEY_LABELS` | Обратные маппинги + `TITLE_TO_KEY` + `titleToKey()` | ~75 строк |
| После `addSection()` | `handleImportFile`, `importHTML`, `extractMetadata`, `extractSections`, `extractEmbeddedState`, `populateFromImport`, `buildDocStateFromImport` | ~250 строк |

**Итого Этап 3: ~385 строк нового кода, ~6 строк замен в существующем коде.**

---

## Примечания к тестированию Этапа 3

### Сохранение с состоянием
1. Сгенерируйте документ.
2. Нажмите «Сохранить HTML».
3. Откройте сохранённый файл в текстовом редакторе.
4. Убедитесь, что в конце `<body>` есть `<script type="application/json" id="philosynth-state">` с JSON-содержимым (genLog, ctxLog, params).

### Импорт
1. Сгенерируйте документ и сохраните HTML.
2. Нажмите «Новый Синтез» (сбросить текущее состояние).
3. Нажмите «↑ Импорт HTML» и выберите сохранённый файл.
4. Документ должен отобразиться со всеми разделами, шапкой, графом (кнопка «3D/2D Граф» появляется, если граф был).
5. Нажмите «Изменить» — модальное окно должно показать все разделы с правильными контекстами.
6. Перегенерация раздела после импорта должна работать штатно.

### Импорт файла без встроенного состояния
1. Откройте сохранённый HTML в текстовом редакторе и удалите `<script id="philosynth-state">`.
2. Импортируйте этот файл.
3. Метаданные (философы, метод, уровень, зерно) должны восстановиться из шапки.
4. Разделы должны распознаться по заголовкам.
5. Логи будут пустыми, стоимость — нулевой.
6. Редактирование должно работать.

### Импорт файла, отредактированного вручную
1. Откройте сохранённый HTML и удалите один `<div class="doc-section">` (вместе с родительским `.doc-body`).
2. Импортируйте.
3. Удалённый раздел не должен появиться; остальные — со скорректированной нумерацией.
4. В модальном окне «Изменить» панель «Добавить» должна содержать кнопку для удалённого раздела.

### Граничные случаи
- Файл не PhiloSynth: сообщение «Не найден элемент #docOutput».
- Файл без разделов: сообщение «Не найдено ни одного раздела».
- Файл с нераспознаваемыми заголовками разделов: предупреждение в консоли, раздел пропущен.

---

## Этап 4: Каскадные предложения и пакетная перегенерация

> Все якоря даны **относительно файла после применения Этапов 1–3**.
> Этот этап **модифицирует** код из предыдущих этапов в нескольких точках — все замены перечислены явно.

---

## 23. CSS — Стили каскадной панели

**Где:** в конец CSS-блока Этапов 1–3 (после стилей `.import-status.err`), **перед** `</style>`.

```css

      /* ── CASCADE PANEL ── */
      .cascade-panel {
        border: 2px solid var(--gold);
        background: #fffbee;
        padding: 18px;
        display: none;
        flex-direction: column;
        gap: 10px;
      }
      .cascade-panel.visible {
        display: flex;
      }
      .cascade-title {
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--gold);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cascade-desc {
        font-size: 12px;
        color: var(--ink-mid);
        line-height: 1.65;
      }
      .cascade-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .cascade-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--mono);
        font-size: 11px;
        color: var(--ink-mid);
        padding: 6px 10px;
        background: var(--white);
        border: 1px solid var(--rule);
        cursor: pointer;
        user-select: none;
        transition: border-color 0.15s, background 0.15s;
      }
      .cascade-item:hover {
        border-color: var(--blue-corp);
      }
      .cascade-item input[type="checkbox"] {
        accent-color: var(--blue-corp);
        cursor: pointer;
      }
      .cascade-item.done {
        border-color: var(--green-check);
        background: #f0fff4;
        color: var(--green-check);
      }
      .cascade-item.processing {
        border-color: var(--blue-corp);
        background: var(--blue-light);
        color: var(--blue-corp);
      }
      .cascade-item.error {
        border-color: var(--red);
        background: #fff5f5;
        color: var(--red);
      }
      .cascade-item-status {
        margin-left: auto;
        font-size: 9px;
        letter-spacing: 0.5px;
        opacity: 0.7;
      }
      .cascade-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 4px;
      }
      .cascade-progress-text {
        font-family: var(--mono);
        font-size: 10px;
        color: var(--ink-dim);
        letter-spacing: 0.5px;
      }
```

---

## 24. HTML — Каскадная панель внутри модального окна

**Где:** в разметке EDIT MODAL (добавленной в Этапе 1, пункт 2b), **сразу после** открывающего `<div class="edit-modal-body" id="editModalBody">`, **перед** комментарием `<!-- Карточки разделов генерируются динамически -->`.

**Якорь:** найти в HTML модального окна:
```html
        <div class="edit-modal-body" id="editModalBody">
          <!-- Карточки разделов генерируются динамически -->
```

**Заменить на:**

```html
        <div class="edit-modal-body" id="editModalBody">
          <!-- Каскадная панель (показывается после действий) -->
          <div class="cascade-panel" id="cascadePanel">
            <div class="cascade-title">
              <span>⚡</span>
              <span id="cascadeTitle">Затронутые разделы</span>
            </div>
            <div class="cascade-desc" id="cascadeDesc"></div>
            <div class="cascade-list" id="cascadeList"></div>
            <div class="cascade-actions">
              <button class="edit-sec-btn primary" id="cascadeRunBtn"
                      onclick="runCascadeRegeneration()">
                Перегенерировать выбранные
              </button>
              <button class="edit-sec-btn" onclick="dismissCascade()">
                Пропустить
              </button>
              <span class="cascade-progress-text" id="cascadeProgressText"></span>
            </div>
          </div>
          <!-- Карточки разделов генерируются динамически -->
```

---

## 25. JS — Замена `highlightDependentCards()` на `showCascadePanel()`

**Где:** в блоке кода из Этапа 1, пункт 4.

### 25a. Заменить функцию `highlightDependentCards`

**Найти** целиком:
```javascript
      /** Подсвечивает карточки разделов, зависящих от перегенерированного */
      function highlightDependentCards(sectionKey) {
        const dependents = computeDependents(DOC_STATE.effectiveDeps);
        const deps = [...(dependents[sectionKey] || [])].filter(k => k !== "sum");

        for (const depKey of deps) {
          const depCard = document.getElementById("editCard-" + depKey);
          if (!depCard) continue;

          // Добавляем временную подсветку
          depCard.style.borderColor = "var(--gold)";
          depCard.style.background = "#fffbee";

          // Добавляем уведомление, если ещё нет
          let warnBox = depCard.querySelector(".edit-dep-regen-notice");
          if (!warnBox) {
            warnBox = document.createElement("div");
            warnBox.className = "edit-dep-warn info edit-dep-regen-notice";
            warnBox.innerHTML = `
              <span class="dep-icon">ℹ</span>
              <span>Раздел «${esc(KEY_LABELS[sectionKey] || sectionKey)}» был перегенерирован. 
              Рекомендуется обновить и этот раздел.</span>`;
            const actionsEl = depCard.querySelector(".edit-sec-actions");
            if (actionsEl) depCard.insertBefore(warnBox, actionsEl);
            else depCard.appendChild(warnBox);
          }
        }
      }
```

**Заменить ЦЕЛИКОМ на:**

```javascript
      /**
       * Показывает каскадную панель с предложением перегенерировать затронутые разделы.
       * @param {"regen"|"delete"|"add"} action — какое действие инициировало каскад
       * @param {string} triggerKey — ключ раздела, над которым выполнено действие
       * @param {string[]} [forceDeps] — явный список затронутых (для delete, когда раздел уже удалён)
       */
      function showCascadePanel(action, triggerKey, forceDeps) {
        const panel = document.getElementById("cascadePanel");
        const titleEl = document.getElementById("cascadeTitle");
        const descEl = document.getElementById("cascadeDesc");
        const listEl = document.getElementById("cascadeList");
        const runBtn = document.getElementById("cascadeRunBtn");
        const progressText = document.getElementById("cascadeProgressText");

        if (!panel || !listEl) return;

        // Определяем затронутые разделы
        let deps;
        if (forceDeps) {
          deps = forceDeps;
        } else {
          const dependents = computeDependents(DOC_STATE.effectiveDeps);
          deps = [...(dependents[triggerKey] || [])].filter(k => k !== "sum");
        }

        // Если нет затронутых — не показываем панель
        if (deps.length === 0) {
          panel.classList.remove("visible");
          return;
        }

        // Сортируем в топологическом порядке
        deps = sortInTopoOrder(deps);

        // Заголовок и описание по типу действия
        const label = KEY_LABELS[triggerKey] || triggerKey;
        switch (action) {
          case "regen":
            titleEl.textContent = "⚡ Каскад: перегенерация";
            descEl.innerHTML = `Раздел «<strong>${esc(label)}</strong>» перегенерирован. ` +
              `Следующие разделы используют его как контекст и могут нуждаться в обновлении:`;
            break;
          case "delete":
            titleEl.textContent = "⚠ Каскад: удаление";
            descEl.innerHTML = `Раздел «<strong>${esc(label)}</strong>» удалён. ` +
              `Следующие разделы потеряли часть контекста. ` +
              `Перегенерация адаптирует их к новому набору разделов (система применит подстановки):`;
            break;
          case "add":
            titleEl.textContent = "✦ Каскад: добавление";
            descEl.innerHTML = `Раздел «<strong>${esc(label)}</strong>» добавлен. ` +
              `Следующие разделы могут улучшиться, получив новый контекст:`;
            break;
        }

        // Генерируем список с чекбоксами
        listEl.innerHTML = "";
        for (const depKey of deps) {
          const depLabel = KEY_LABELS[depKey] || depKey;
          const def = DOC_STATE.sectionDefs[depKey];
          const num = def ? def.num : "?";

          const item = document.createElement("label");
          item.className = "cascade-item";
          item.id = "cascadeItem-" + depKey;
          item.innerHTML = `
            <input type="checkbox" value="${depKey}" checked>
            <span>§ ${num} — ${esc(depLabel)}</span>
            <span class="cascade-item-status" id="cascadeStatus-${depKey}"></span>`;
          listEl.appendChild(item);
        }

        // Сброс состояния
        if (runBtn) runBtn.disabled = false;
        if (progressText) progressText.textContent = "";

        // Показываем панель и скроллим к ней
        panel.classList.add("visible");
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      /** Скрывает каскадную панель */
      function dismissCascade() {
        const panel = document.getElementById("cascadePanel");
        if (panel) panel.classList.remove("visible");
      }

      /**
       * Сортирует массив ключей разделов в топологическом порядке
       * (используя текущие DOC_STATE.effectiveDeps).
       */
      function sortInTopoOrder(keys) {
        const orderMap = {};
        DOC_STATE.sectionOrder.forEach((k, i) => { orderMap[k] = i; });
        return [...keys].sort((a, b) => (orderMap[a] ?? 999) - (orderMap[b] ?? 999));
      }

      /**
       * Запускает пакетную перегенерацию выбранных разделов.
       * Разделы обрабатываются последовательно в топологическом порядке.
       */
      async function runCascadeRegeneration() {
        const listEl = document.getElementById("cascadeList");
        const runBtn = document.getElementById("cascadeRunBtn");
        const progressText = document.getElementById("cascadeProgressText");

        if (!listEl) return;

        // Собираем выбранные разделы
        const selected = [];
        listEl.querySelectorAll("input[type='checkbox']:checked").forEach(cb => {
          selected.push(cb.value);
        });

        if (selected.length === 0) {
          dismissCascade();
          return;
        }

        // Сортируем в топологическом порядке
        const sorted = sortInTopoOrder(selected);

        // Блокируем UI
        if (runBtn) runBtn.disabled = true;
        listEl.querySelectorAll("input[type='checkbox']").forEach(cb => { cb.disabled = true; });

        let completed = 0;
        let errors = 0;

        for (const sectionKey of sorted) {
          const item = document.getElementById("cascadeItem-" + sectionKey);
          const statusEl = document.getElementById("cascadeStatus-" + sectionKey);

          if (item) item.className = "cascade-item processing";
          if (statusEl) statusEl.textContent = "генерация...";
          if (progressText) {
            progressText.textContent = `${completed + 1} / ${sorted.length}: ${KEY_LABELS[sectionKey] || sectionKey}`;
          }

          try {
            await cascadeRegenerateOne(sectionKey);
            completed++;
            if (item) item.className = "cascade-item done";
            if (statusEl) statusEl.textContent = "✓";
          } catch (err) {
            errors++;
            console.error("Каскад: ошибка перегенерации", sectionKey, err);
            if (item) item.className = "cascade-item error";
            if (statusEl) statusEl.textContent = "⚠ " + (err.message || "ошибка").slice(0, 40);
          }
        }

        // Финализация
        if (progressText) {
          progressText.textContent = `Готово: ${completed} из ${sorted.length}` +
            (errors ? `, ошибок: ${errors}` : "");
        }

        // Обновляем модальное окно через 2 секунды
        setTimeout(() => {
          dismissCascade();
          renderEditSections();
        }, 2000);
      }

      /**
       * Перегенерация одного раздела в рамках каскада.
       * Упрощённая версия regenerateSection — без UI модального окна,
       * без показа каскадной панели (чтобы не рекурсировать).
       */
      async function cascadeRegenerateOne(sectionKey) {
        const p = DOC_STATE.params;
        if (!p) throw new Error("DOC_STATE.params отсутствует");

        // Текущий контекст раздела (не меняем при каскаде)
        const currentCtx = p.secCtx[sectionKey] || "";

        // Пересобираем def
        const fullP = { ...p, secCtx: { ...p.secCtx } };
        const allDefs = buildSectionDefs(fullP);
        patchPromptsWithSecCtx(allDefs, fullP.secCtx);
        const defsMap = Object.fromEntries(allDefs.map(d => [d.key, d]));
        const def = defsMap[sectionKey];
        if (!def) throw new Error("Раздел «" + sectionKey + "» не найден.");

        // Номер из текущего состояния
        const existingDef = DOC_STATE.sectionDefs[sectionKey];
        if (existingDef) def.num = existingDef.num;

        // Контекст из ранее сгенерированных разделов
        const generated = {};
        for (const key of DOC_STATE.sectionOrder) {
          if (key === sectionKey) continue;
          const idx = DOC_STATE.sectionDbIdx[key];
          const el = document.getElementById("db" + idx);
          if (el && el.querySelector(".doc-section")) {
            generated[key] = el;
          }
        }

        let prior = "";
        if (sectionKey !== "sum") {
          try {
            prior = buildContextForSection(
              sectionKey, generated, fullP.depth,
              DOC_STATE.effectiveDeps,
              DOC_STATE.resolvedDeps
            );
          } catch (ctxErr) {
            console.warn("Каскад: ошибка контекста для", sectionKey, ctxErr);
          }
        }

        // Промпт
        const SYS = buildSYS();
        const partBase = baseCtx(fullP);
        const partRules = htmlRules();
        const partQuality = buildPartQuality(fullP);
        const sp = `§ ${def.num} — ${def.title.toUpperCase()}\n${def.prompt}`;
        const fp = `ПАРАМЕТРЫ СИНТЕЗА:\n${partBase}${prior}\n\n${partRules}\n\nЗАДАНИЕ: составь ТОЛЬКО следующие разделы (строго в указанном порядке, без добавления других):\n\n${sp}\n\n${partQuality}`;

        // GenLog
        const genEntry = {
          sectionKey,
          sectionLabel: def.title + " [каскад]",
          priorChars: prior.length,
          taskChars: sp.length,
          inputChars: SYS.length + fp.length,
          outputChars: 0,
          inputTokens: 0,
          outputTokens: 0,
          cost: 0,
          error: null,
          status: "streaming",
          source: "cascade",
        };
        genLog.push(genEntry);

        // Стриминг
        const dbIdx = DOC_STATE.sectionDbIdx[sectionKey];
        const container = document.getElementById("db" + dbIdx);
        if (!container) throw new Error("DOM-контейнер не найден.");
        container.innerHTML = "";

        const usage = await streamResp(fp, container, SYS, (chars) => {
          genEntry.outputChars = chars;
        });

        // Финализация
        totalInputTokens += usage.input_tokens;
        totalOutputTokens += usage.output_tokens;
        genEntry.outputChars = container.innerHTML.length;
        genEntry.inputTokens = usage.input_tokens;
        genEntry.outputTokens = usage.output_tokens;
        genEntry.cost = usage.input_tokens * 3 / 1e6 + usage.output_tokens * 15 / 1e6;
        genEntry.status = "done";

        // Доп. контекст
        if (currentCtx) {
          const disc = makeSectionCtxDisclosure(currentCtx);
          container.insertBefore(disc, container.firstChild);
        }

        // Особые разделы
        if (sectionKey === "name") updateDocTitleFromName(container);
        if (sectionKey === "graph") {
          try {
            G = parseGraph(container);
            if (G.nodes.length > 0) document.getElementById("btnGraph").style.display = "";
          } catch (e) { console.warn("Каскад: graph parse:", e); }
        }

        // DOC_STATE
        DOC_STATE.sectionHTML[sectionKey] = container.innerHTML;
        DOC_STATE.sectionDefs[sectionKey] = { ...def };
        DOC_STATE.editedSections.add(sectionKey);

        updateFooterCost();
      }
```

---

## 26. JS — Модификация `regenerateSection()`: вызов каскадной панели

**Где:** в коде `regenerateSection()` из Этапа 1 (пункт 4).

**Найти:**
```javascript
          // Подсвечиваем карточки зависимых разделов
          highlightDependentCards(sectionKey);
```

**Заменить на:**
```javascript
          // Показываем каскадную панель для зависимых разделов
          showCascadePanel("regen", sectionKey);
```

---

## 27. JS — Модификация `deleteSection()`: вызов каскадной панели

**Где:** в коде `deleteSection()` из Этапа 2 (пункт 13).

Необходимо сохранить список зависимых **до** удаления (потому что после удаления раздел исчезнет из `effectiveDeps`), а затем показать каскадную панель **после** `renderEditSections()`.

### 27a. Сохранить deps до удаления

**Найти** в `deleteSection()`:
```javascript
        // ── 1. Удаляем DOM-контейнер ──
```

**Вставить ПЕРЕД этой строкой:**
```javascript
        // ── 0. Запоминаем зависимые ДО удаления ──
        const dependentsBefore = computeDependents(DOC_STATE.effectiveDeps);
        const affectedKeys = [...(dependentsBefore[sectionKey] || [])]
          .filter(k => k !== "sum" && k !== sectionKey);
```

### 27b. Показать каскадную панель после перерисовки

**Найти** в `deleteSection()`:
```javascript
        // ── 9. Перерисовываем модальное окно ──
        renderEditSections();
```

**Заменить на:**
```javascript
        // ── 9. Перерисовываем модальное окно ──
        renderEditSections();

        // ── 10. Каскадная панель для затронутых разделов ──
        // affectedKeys — вычислены ДО удаления, фильтруем по оставшимся
        const remainingAffected = affectedKeys.filter(k => DOC_STATE.sectionOrder.includes(k));
        if (remainingAffected.length > 0) {
          showCascadePanel("delete", sectionKey, remainingAffected);
        }
```

---

## 28. JS — Модификация `addSection()`: вызов каскадной панели

**Где:** в коде `addSection()` из Этапа 2 (пункт 14).

**Найти:**
```javascript
          // ── 15. Перерисовываем модальное окно ──
          if (progressText) progressText.textContent = "✓ Готово";
          setTimeout(() => renderEditSections(), 1500);
```

**Заменить на:**
```javascript
          // ── 15. Перерисовываем модальное окно и показываем каскад ──
          if (progressText) progressText.textContent = "✓ Готово";
          setTimeout(() => {
            renderEditSections();
            showCascadePanel("add", sectionKey);
          }, 1500);
```

---

## 29. Сводка изменений Этапа 4

| Место | Действие | Объём |
|---|---|---|
| CSS (в конец блока Этапов 1–3) | Стили каскадной панели | ~85 строк |
| HTML EDIT MODAL body | Вставить каскадную панель | ~20 строк (замена 2 → 22) |
| Вместо `highlightDependentCards()` | `showCascadePanel` + `dismissCascade` + `sortInTopoOrder` + `runCascadeRegeneration` + `cascadeRegenerateOne` | ~265 строк (замена ~30 → ~265) |
| `regenerateSection()` | `highlightDependentCards` → `showCascadePanel` | 1 строка (замена) |
| `deleteSection()` | Сохранение deps + вызов `showCascadePanel` | +8 строк (вставка + замена) |
| `addSection()` | Вызов `showCascadePanel` | ~3 строки (замена) |

**Итого Этап 4: ~375 строк нового кода, ~35 строк замен в коде Этапов 1–2.**

---

## Примечания к тестированию Этапа 4

### Каскад после перегенерации
1. Перегенерируйте раздел «Граф категорий».
2. После завершения — вверху модального окна появляется каскадная панель:
   - Заголовок: «⚡ Каскад: перегенерация»
   - Описание с именем перегенерированного раздела
   - Список затронутых разделов с чекбоксами (все отмечены)
   - Кнопки «Перегенерировать выбранные» и «Пропустить»
3. Снимите галочку с одного раздела и нажмите «Перегенерировать выбранные».
4. Разделы обрабатываются последовательно: каждый получает статус «генерация...» → «✓» или «⚠ ошибка».
5. Прогресс-текст показывает «2 / 5: Корпус тезисов» и т.д.
6. После завершения — панель скрывается через 2 секунды, модальное окно перерисовывается.

### Каскад после удаления
1. Удалите раздел «Глоссарий терминов».
2. Модальное окно перерисовывается (глоссарий исчезает).
3. Каскадная панель показывает разделы, которые ранее зависели от глоссария.
4. Описание: «Раздел удалён. Следующие разделы потеряли часть контекста...»
5. При перегенерации выбранных — система собирает контекст без глоссария, применяя подстановки.

### Каскад после добавления
1. Добавьте раздел «Практическое применение».
2. После генерации — каскадная панель показывает разделы, которые улучшатся.
3. Описание: «Раздел добавлен. Следующие разделы могут улучшиться...»

### Пропуск каскада
1. Нажмите «Пропустить» — панель скрывается, никаких перегенераций не происходит.
2. Карточки затронутых разделов остаются без изменений (информация не потеряна — при следующем открытии модального окна предупреждения о зависимостях всё равно видны).

### Каскад при отсутствии затронутых
1. Перегенерируйте раздел «Критический анализ» (обычно это последний раздел, от которого ничего не зависит).
2. Каскадная панель **не появляется** — нет затронутых разделов.

### Каскад после каскада
1. Перегенерируйте граф → каскадная панель показывает 7 разделов.
2. Выберите 3 и перегенерируйте.
3. После завершения каскада — **новая** каскадная панель **не появляется** (каскад не рекурсирует: `cascadeRegenerateOne` не вызывает `showCascadePanel`). Это by design — каскад второго порядка был бы чрезмерным. Если пользователю нужна вторичная перегенерация, он инициирует её вручную.

### Обработка ошибок
1. При ошибке API на одном из разделов каскада — этот раздел получает статус «⚠ ошибка», остальные продолжают обрабатываться.
2. Итоговый текст: «Готово: 4 из 5, ошибок: 1».

---

## Общая сводка проекта

| Этап | Описание | Новый код | Замены |
|---|---|---|---|
| 1 | DOC_STATE + перегенерация | ~680 строк | 3 строки |
| 2 | Удаление + добавление | ~580 строк | ~10 строк |
| 3 | Импорт + состояние в файле | ~385 строк | ~6 строк |
| 4 | Каскадные предложения | ~375 строк | ~35 строк |
| **Итого** | | **~2020 строк** | **~54 строки** |

Финальный объём файла после применения всех этапов: ~8818 + ~2020 ≈ **~10 840 строк**.
