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

---

## Исправления: четыре выявленных упущения

> Применяются **после** всех четырёх этапов.

---

## 30. JS — Предложения по замене при удалении раздела

**Где:** в функции `confirmAndDelete()` (Этап 2, пункт 13).

**Найти:**
```javascript
        if (consumers.length > 0 && !isTotal) {
          msg += `\n\nСистема попытается использовать подстановки контекста для смягчения потерь.`;
        }
```

**Заменить ЦЕЛИКОМ на:**

```javascript
        // Предложения по замене: какие отсутствующие разделы компенсируют потерю
        const replacementSuggestions = buildDeletionReplacements(sectionKey);
        if (replacementSuggestions.length > 0) {
          msg += `\n\nСистема применит подстановки, но для лучшей компенсации рекомендуется добавить:`;
          for (const s of replacementSuggestions) {
            msg += `\n  • «${s.label}» — ${s.reason} (качество замены: ${s.quality}/3)`;
          }
        } else if (consumers.length > 0 && !isTotal) {
          msg += `\n\nСистема попытается использовать подстановки контекста для смягчения потерь.`;
        }
```

**Затем:** добавить вспомогательную функцию. Вставить сразу **перед** `function confirmAndDelete`:

```javascript
      /**
       * Для удаляемого раздела определяет, какие НЕвыбранные разделы
       * лучше всего компенсируют потерю его контекста.
       * Возвращает массив { key, label, reason, quality }.
       */
      function buildDeletionReplacements(deletedKey) {
        // Какие контекстные ключи предоставляет удаляемый раздел?
        // Ищем все ключи вида "deletedKey:*" в SUBSTITUTION_MAP
        const providedKeys = Object.keys(SUBSTITUTION_MAP)
          .filter(k => sourceOf(k) === deletedKey);

        if (!providedKeys.length) return [];

        const currentSections = new Set(DOC_STATE.sectionOrder);
        const suggestions = {}; // key → { label, reasons[], maxQ }

        for (const ctxKey of providedKeys) {
          const candidates = SUBSTITUTION_MAP[ctxKey] || [];
          for (const { key: subKey, q } of candidates) {
            const src = sourceOf(subKey);
            // Только разделы, которых НЕТ в документе
            if (currentSections.has(src)) continue;
            if (src === deletedKey) continue;

            if (!suggestions[src]) {
              suggestions[src] = {
                key: src,
                label: KEY_LABELS[src] || src,
                reasons: [],
                maxQ: 0,
              };
            }
            const ctxLabel = CTX_LABELS[ctxKey] || ctxKey;
            const subLabel = CTX_LABELS[subKey] || subKey;
            suggestions[src].reasons.push(`${subLabel} заменяет ${ctxLabel}`);
            suggestions[src].maxQ = Math.max(suggestions[src].maxQ, q);
          }
        }

        return Object.values(suggestions)
          .sort((a, b) => b.maxQ - a.maxQ)
          .map(s => ({
            key: s.key,
            label: s.label,
            reason: s.reasons.slice(0, 2).join("; "),
            quality: s.maxQ,
          }));
      }
```

---

## 31. JS — Обработка ссылок §N на удалённый раздел

**Где:** функция `renumberSectionRefs()` (Этап 1, пункт 3).

**Найти всю функцию `renumberSectionRefs`** и **заменить ЦЕЛИКОМ на:**

```javascript
      /**
       * Обновляет ссылки §N в текстовых узлах DOM после изменения нумерации.
       * @param {Object} renumberMap — { старый_номер: новый_номер }
       * @param {number[]} [deletedNums] — номера §§ удалённых разделов
       */
      function renumberSectionRefs(renumberMap, deletedNums) {
        const hasRenumber = Object.keys(renumberMap).length > 0;
        const deletedSet = new Set(deletedNums || []);
        if (!hasRenumber && !deletedSet.size) return;

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
            // Ссылка на удалённый раздел
            if (deletedSet.has(oldNum)) {
              return match + " [удалён]";
            }
            // Перенумерация
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
```

**Затем:** в `deleteSection()` (Этап 2, пункт 13) нужно передать номер удалённого раздела.

**Найти** в `deleteSection()`:
```javascript
        // ── 5. Пересчитываем номера §§ ──
        const renumberMap = recalcSectionNumbers();

        // ── 6. Обновляем ссылки §N в тексте ──
        renumberSectionRefs(renumberMap);
```

**Заменить на:**
```javascript
        // ── 5. Пересчитываем номера §§ ──
        const deletedDef = DOC_STATE.sectionDefs?.[sectionKey];
        const deletedNum = deletedDef?.num;
        const renumberMap = recalcSectionNumbers();

        // ── 6. Обновляем ссылки §N в тексте (с пометкой удалённого) ──
        renumberSectionRefs(renumberMap, deletedNum ? [deletedNum] : []);
```

> Важно: `deletedDef` нужно извлечь **до** `delete DOC_STATE.sectionDefs[sectionKey]`. Поэтому строку `const deletedDef = ...` нужно вставить **перед** блоком `// ── 2. Обновляем DOC_STATE ──`, а использовать — в блоке 5–6.

Уточнённый фрагмент: **найти** в `deleteSection()`:
```javascript
        // ── 2. Обновляем DOC_STATE ──
        DOC_STATE.sectionOrder = DOC_STATE.sectionOrder.filter(k => k !== sectionKey);
```

**Вставить ПЕРЕД этой строкой:**
```javascript
        // ── 1b. Запоминаем номер удалённого раздела ДО очистки ──
        const deletedNum = DOC_STATE.sectionDefs[sectionKey]?.num;
```

А строку `const deletedDef = DOC_STATE.sectionDefs?.[sectionKey];` из замены выше убрать — вместо неё использовать уже сохранённый `deletedNum`:
```javascript
        // ── 6. Обновляем ссылки §N в тексте (с пометкой удалённого) ──
        renumberSectionRefs(renumberMap, deletedNum ? [deletedNum] : []);
```

---

## 32. JS — Синхронизация формы ввода при импорте

**Где:** в конце функции `populateFromImport()` (Этап 3, пункт 21), **перед** последними строками:
```javascript
        // ── Показываем документ ──
        document.getElementById("outputWrap").classList.add("visible");
```

**Вставить ПЕРЕД ними:**

```javascript
        // ── Синхронизируем форму ввода ──
        syncFormFromImport(meta);
```

**Затем** добавить функцию. Вставить **после** `buildDocStateFromImport()` (в конце блока функций импорта):

```javascript

      /**
       * Обновляет форму ввода (философы, разделы, метод, уровень, зерно, контекст)
       * по данным импорта, чтобы UI соответствовал загруженному документу.
       */
      function syncFormFromImport(meta) {
        // ── Зерно ──
        const seedEl = document.getElementById("seedInput");
        if (seedEl) seedEl.value = meta.seed || "";

        // ── Контекст ──
        const ctxEl = document.getElementById("contextInput");
        if (ctxEl) ctxEl.value = meta.ctx || "";

        // ── Метод ──
        const methodEl = document.getElementById("synthesisMethod");
        if (methodEl) methodEl.value = meta.method;

        // ── Уровень ──
        const levelEl = document.getElementById("synthesisLevel");
        if (levelEl) levelEl.value = meta.synthLevel;

        // ── Глубина ──
        const depthEl = document.getElementById("depthLevel");
        if (depthEl) depthEl.value = meta.depth;

        // ── Философы: сбрасываем все, затем отмечаем нужных ──
        const philBox = document.getElementById("philBox");
        if (philBox) {
          philBox.querySelectorAll("input[type='checkbox']").forEach(cb => {
            const shouldCheck = meta.phil.includes(cb.value);
            cb.checked = shouldCheck;
            // Обновляем визуальное состояние checkbox-item
            const item = cb.closest(".checkbox-item");
            if (item) item.classList.toggle("_checked", shouldCheck);
          });
        }

        // ── Разделы: отмечаем присутствующие в импортированном документе ──
        const secKeyToId = {
          graph: "secGraph", glossary: "secGlossary", theses: "secTheses",
          history: "secHistory", name: "secName", practical: "secPractical",
          dialogue: "secDialogue", evolution: "secEvolution", critique: "secCritique",
          origin: "secOrigin",
        };
        const importedSections = new Set(DOC_STATE.sectionOrder.filter(k => k !== "sum"));

        for (const [key, id] of Object.entries(secKeyToId)) {
          const cb = document.getElementById(id);
          if (!cb) continue;
          const shouldCheck = importedSections.has(key);
          cb.checked = shouldCheck;

          // Визуальное состояние
          const item = cb.closest(".checkbox-item");
          if (item) item.classList.toggle("_checked", shouldCheck);
          const wrap = cb.closest(".sec-item-wrap");
          if (wrap) {
            wrap.classList.toggle("_checked", shouldCheck);
            if (!shouldCheck) {
              const field = wrap.querySelector(".sec-ctx-field");
              const btn = wrap.querySelector(".sec-ctx-btn");
              if (field) field.classList.remove("open");
              if (btn) { btn.classList.remove("open"); btn.textContent = "+"; }
            }
          }

          // Доп. контекст раздела
          const ctxField = document.getElementById("secCtx-" + key);
          if (ctxField) {
            ctxField.value = DOC_STATE.params?.secCtx?.[key] || "";
          }
        }

        // Обновляем предупреждения и совместимость
        if (typeof updateSectionWarnings === "function") updateSectionWarnings();
        if (typeof updateCompatAdvisor === "function") updateCompatAdvisor();
        if (typeof updateCostEstimate === "function") updateCostEstimate();
      }
```

---

## 33. CSS + JS — Индикатор «импортированный документ»

### 33a. CSS

**Где:** в конец CSS-блока (перед `</style>`):

```css

      /* ── IMPORT INDICATOR ── */
      .import-indicator {
        font-family: var(--mono);
        font-size: 9px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--violet);
        background: var(--violet-light);
        border: 1px solid rgba(107, 0, 170, 0.25);
        padding: 3px 10px;
        display: none;
      }
      .import-indicator.visible {
        display: inline-block;
      }
```

### 33b. HTML

**Где:** в `actions-bar`, **после** текста «ДОКУМЕНТ СГЕНЕРИРОВАН», **перед** `</div>` (закрывающим тот div со стилями).

**Найти:**
```html
            ДОКУМЕНТ СГЕНЕРИРОВАН
          </div>
```

**Заменить на:**
```html
            ДОКУМЕНТ СГЕНЕРИРОВАН
            <span class="import-indicator" id="importIndicator"></span>
          </div>
```

### 33c. JS

В функции `populateFromImport()` (Этап 3, пункт 21), **после** вызова `syncFormFromImport(meta)` (добавленного в пункте 32), **вставить:**

```javascript
        // ── Индикатор импорта ──
        const indicator = document.getElementById("importIndicator");
        if (indicator) {
          indicator.textContent = "↑ ИМПОРТ" + (filename ? ": " + filename : "");
          indicator.classList.add("visible");
        }
```

Для этого нужно передать `filename` в `populateFromImport`. **Модифицировать сигнатуру:**

**Найти:**
```javascript
      function populateFromImport(importedDocOutput, meta, sections, embeddedState) {
```

**Заменить на:**
```javascript
      function populateFromImport(importedDocOutput, meta, sections, embeddedState, filename) {
```

**Найти** вызов в `importHTML()`:
```javascript
        populateFromImport(docOutput, meta, sections, embeddedState);
```

**Заменить на:**
```javascript
        populateFromImport(docOutput, meta, sections, embeddedState, filename);
```

**И** в `resetForm()` (чтобы сбрасывать индикатор): **добавить** после `resetDocState();`:

```javascript
        const indicator = document.getElementById("importIndicator");
        if (indicator) { indicator.textContent = ""; indicator.classList.remove("visible"); }
```

---

## 34. Сводка исправлений

| Упущение | Пункт | Объём |
|---|---|---|
| Предложения по замене при удалении | 30 | ~50 строк (новая функция + замена 3 строк) |
| Битые ссылки на удалённый раздел | 31 | ~15 строк (замена функции + 2 вставки) |
| Синхронизация формы при импорте | 32 | ~70 строк (новая функция + 1 вставка) |
| Индикатор «импортировано» | 33 | ~25 строк (CSS + HTML + JS + правки сигнатур) |

**Итого исправлений: ~160 строк нового кода, ~20 строк замен.**

---

> Промежуточная сводка Этапов 1–4 + исправлений: ~2180 строк / ~74 замены.  
> Полная сводка с учётом Дополнений A–D — в конце документа.

---

## Дополнение A: Посекционный лог генерации

> Предусловие: все промпты разделов (включая critique и dialogue) единообразно используют формат `«Название секции»` → `<div data-section="Название секции"><h4>Название секции</h4>...`. Это ручная правка промптов, не описываемая в данной инструкции.
>
> Данное дополнение не зависит от Этапов 1–4 и может применяться независимо.

---

## A1. JS — Карта секций `SUBSECTION_MAP`

**Где:** сразу **после** константы `SEC_NAMES` (строка ~4719 исходного файла).  
**Якорь:** найти закрывающую `};` объекта `SEC_NAMES`. **Вставить ПОСЛЕ неё:**

```javascript

      // ════════════════════════════════════════
      // SUBSECTION MAP — ожидаемые секции каждого раздела
      // ════════════════════════════════════════

      /**
       * Базовая карта секций (не зависит от synthLevel/method).
       * Ключ — sectionKey раздела, значение — массив имён секций
       * в порядке, в котором они запрашиваются в промпте.
       */
      const SUBSECTION_MAP_BASE = {
        sum: [
          "Цели и метод",
          "Портрет каждого философа",
          "Новизна и ценность",
          "Структура документа",
          "Индекс когерентности",
          "Точки напряжения",
          "Оценка сложности",
        ],
        graph: [
          "Методология построения графа",
          "Таблица категорий",
          "Таблица связей",
          "Топология графа",
          "Топологическая таблица",
        ],
        theses: [
          "Онтологические тезисы",
          "Эпистемологические тезисы",
          "Этические и аксиологические тезисы",
          "Сводная таблица тезисов",
        ],
        name: [
          "Таблица вариантов названия",
          "Сравнительный анализ вариантов",
          "Итоговая рекомендация",
        ],
        history: [
          "Исторический контекст",
          "Источники влияния",
          "Генеалогия идей",
          "Современные концепции",
          "Потенциальное влияние",
          "Название в историческом контексте",
        ],
        origin: [
          "Идентификация родительских традиций",
          "Элементная декомпозиция",
          "Оценка оригинальности",
          "Потенциальные возражения",
        ],
        practical: [
          "Образование",
          "Этика и принятие решений",
          "Психология и личностное развитие",
          "Социальные институты",
          "Межкультурный диалог",
          "Сводная таблица",
        ],
        dialogue: [
          "Диалог",
          "Итоговая таблица диалога",
          "Аналитический комментарий",
        ],
        evolution: [
          "Направления развития",
          "Предлагаемые изменения графа",
          "Эволюция названия",
          "Интеграция с современной наукой",
          "Временная карта развития",
        ],
        // critique — после ручной унификации промпта:
        // пункты 2 и 3 зависят от synthLevel — вставляются динамически в buildSubsectionMap
        critique: [
          "Внутренняя когерентность",
          // ← сюда buildSubsectionMap вставит пункты 2 и 3
          "Верность методу синтеза",
          "Сохранение ценных аспектов",
          "Разрешение противоречий",
          "Слепые пятна",
          "Итоговая оценка",
          "Рекомендации по улучшению",
        ],
      };

      /**
       * Секции glossary зависят от synthLevel.
       */
      const SUBSECTION_MAP_GLOSSARY = {
        comparative: [
          "Таблица определений",
          "Переопределённые термины",
          "Заимствованные термины",
          "Новые термины",
        ],
        transformative: [
          "Таблица определений",
          "Преобразованные термины",
          "Эмерджентные термины",
        ],
        generative: [
          "Таблица определений",
          "Термины, преодолевающие ограничения",
          "Термины, порождённые проблемой",
        ],
      };

      /**
       * Пункт 2 критики — зависит от synthLevel.
       * Название секции совпадает с заголовком, выносимым в `«...»`.
       */
      const SUBSECTION_CRITIQUE_NOVELTY = {
        comparative:    "Философская новизна",
        transformative: "Эмерджентность концепции",
        generative:     "Проблемная генерация",
      };

      /**
       * Пункт 3 критики — зависит от synthLevel.
       *
       * ВАЖНО: названия в этих константах ОБЯЗАНЫ точно совпадать
       * с текстом в «...» в соответствующих промптах (после их ручной унификации).
       */
      const SUBSECTION_CRITIQUE_CHECK = {
        comparative:    "Верность источникам",
        transformative: "Верность уровню синтеза",
        generative:     "Верность уровню синтеза",
      };

      /**
       * Возвращает полную карту секций для данных параметров синтеза.
       * @param {{ synthLevel?: string }} p
       * @returns {{ [sectionKey: string]: string[] }}
       */
      function buildSubsectionMap(p) {
        const level = p?.synthLevel || "comparative";

        // Собираем critique: вставляем пункты 2 и 3 (динамические) после пункта 1
        const critiqueBase = SUBSECTION_MAP_BASE.critique;
        const critique = [
          critiqueBase[0],                                          // Внутренняя когерентность
          SUBSECTION_CRITIQUE_NOVELTY[level] || "Оценка новизны",   // пункт 2
          SUBSECTION_CRITIQUE_CHECK[level] || "Верность источникам", // пункт 3
          ...critiqueBase.slice(1),                                  // Верность методу синтеза, Сохранение..., и т.д.
        ];

        return {
          ...SUBSECTION_MAP_BASE,
          glossary: SUBSECTION_MAP_GLOSSARY[level] || SUBSECTION_MAP_GLOSSARY.comparative,
          critique,
        };
      }
```

---

## A2. JS — Трекер секций при стриминге

**Где:** сразу **после** `buildSubsectionMap` (из A1).

```javascript

      /**
       * Парсит текущий html-буфер стриминга и возвращает массив распознанных секций
       * с позициями и размерами.
       *
       * @param {string} html — накопленный HTML
       * @param {string[]} expectedSections — ожидаемые секции для данного раздела
       * @returns {{ name: string, startChar: number, chars: number, status: "done"|"streaming" }[]}
       */
      function parseSubsectionsFromHTML(html, expectedSections) {
        if (!html || !expectedSections || !expectedSections.length) return [];

        // Ищем все data-section="..." вхождения
        const regex = /data-section="([^"]+)"/g;
        const found = []; // { name, pos }
        let m;
        while ((m = regex.exec(html)) !== null) {
          found.push({ name: m[1], pos: m.index });
        }

        if (!found.length) return [];

        const result = [];

        // Для каждой ожидаемой секции: найдена ли она в html?
        for (let i = 0; i < expectedSections.length; i++) {
          const expected = expectedSections[i];

          // Ищем среди найденных (нечёткое совпадение: contains в обе стороны)
          const match = found.find(f =>
            f.name === expected ||
            f.name.toLowerCase().includes(expected.toLowerCase()) ||
            expected.toLowerCase().includes(f.name.toLowerCase())
          );

          if (!match) continue;

          // Начало секции — позиция data-section
          const startChar = match.pos;

          // Конец секции — начало следующей найденной секции или конец html
          const foundIdx = found.indexOf(match);
          const nextFound = found[foundIdx + 1];
          const endChar = nextFound ? nextFound.pos : html.length;
          const chars = endChar - startChar;

          // Статус: если это последняя найденная секция и она не закрыта
          // (нет следующей после неё) — streaming
          const isLast = foundIdx === found.length - 1;
          const status = isLast ? "streaming" : "done";

          result.push({ name: expected, startChar, chars, status });
        }

        return result;
      }
```

---

## A3. JS — Модификация `streamResp()`: передача html в callback

**Где:** внутри функции `streamResp()` (строка ~5509 исходного файла).

**Найти:**
```javascript
                // Callback для обновления лога в реальном времени
                if (onDelta) onDelta(html.length);
```

**Заменить на:**
```javascript
                // Callback для обновления лога в реальном времени
                if (onDelta) onDelta(html.length, html);
```

---

## A4. JS — Модификация `generateDoc()`: трекинг секций

**Где:** внутри цикла `for (let i = 0; i < passes.length; i++)` в `generateDoc()`.

### A4a. Построить карту секций и передать в genEntry

**Найти:**
```javascript
          const genEntry = {
            sectionKey: pass.map(d => d.key).join("+"),
            sectionLabel,
            priorChars:  prior.length,
            taskChars:   sp.length,
            inputChars:  SYS.length + fp.length,
            outputChars: 0,
            outputTokens: 0,
            inputTokens: 0,
            cost: 0,
            error: null,
            status: "streaming",
          };
```

**Заменить на:**
```javascript
          // Карта ожидаемых секций для этого прохода
          const subsecMap = buildSubsectionMap(p);
          const expectedSubs = pass.flatMap(d => subsecMap[d.key] || []);

          const genEntry = {
            sectionKey: pass.map(d => d.key).join("+"),
            sectionLabel,
            priorChars:  prior.length,
            taskChars:   sp.length,
            inputChars:  SYS.length + fp.length,
            outputChars: 0,
            outputTokens: 0,
            inputTokens: 0,
            cost: 0,
            error: null,
            status: "streaming",
            expectedSubsections: expectedSubs,
            subsections: [],
          };
```

### A4b. Обновлять subsections при каждом чанке

**Найти:**
```javascript
          // Троттлинг обновления лога во время стриминга
          let lastLogRefresh = 0;
          const onDelta = (charsSoFar) => {
            genEntry.outputChars = charsSoFar;
            const now = Date.now();
            if (now - lastLogRefresh > 300) {
              lastLogRefresh = now;
              refreshCtxLogIfOpen();
            }
          };
```

**Заменить на:**
```javascript
          // Троттлинг обновления лога во время стриминга
          let lastLogRefresh = 0;
          const onDelta = (charsSoFar, htmlSoFar) => {
            genEntry.outputChars = charsSoFar;

            // Обновляем subsections (только если есть ожидаемые)
            if (htmlSoFar && expectedSubs.length > 0) {
              genEntry.subsections = parseSubsectionsFromHTML(htmlSoFar, expectedSubs);
            }

            const now = Date.now();
            if (now - lastLogRefresh > 300) {
              lastLogRefresh = now;
              refreshCtxLogIfOpen();
            }
          };
```

### A4c. Финализация subsections после завершения стриминга

**Найти** (после `const usage = await streamResp(...)`):**
```javascript
            genEntry.outputChars = ct.innerHTML.length;
            genEntry.inputTokens = usage.input_tokens;
            genEntry.outputTokens = usage.output_tokens;
```

**Вставить ПОСЛЕ `genEntry.outputChars = ct.innerHTML.length;`:**
```javascript
            // Финализация subsections: все переходят в done
            if (expectedSubs.length > 0) {
              genEntry.subsections = parseSubsectionsFromHTML(ct.innerHTML, expectedSubs);
              genEntry.subsections.forEach(s => { s.status = "done"; });
            }
```

---

## A5. JS — Модификация `formatCtxLogHTML()`: отображение секций

**Где:** внутри `formatCtxLogHTML()` (строка ~8613 исходного файла).

**Найти** блок, отображающий статус «ВЫХОД:» для `streaming`:
```javascript
            if (g.status === "streaming") {
              // Генерация в процессе — показываем накопленные символы с анимированным индикатором
              lines.push('<span style="color:#aaa;font-weight:500">ВЫХОД:</span> ' +
                '<span style="color:#7ba7e8">' + num(g.outputChars) + ' симв.</span>' +
                ' <span style="color:#7ba7e8">⟳ генерация...</span>');
```

**Заменить ЦЕЛИКОМ** весь блок `if (g.status === "streaming") {...} else if (g.status === "error") {...} else {...}` (от `if (g.status === "streaming")` до закрывающей `}` перед `lines.push('<span style="color:#555555">' + '─'.repeat(60)`) **на:**

```javascript
            if (g.status === "streaming") {
              lines.push('<span style="color:#aaa;font-weight:500">ВЫХОД:</span> ' +
                '<span style="color:#7ba7e8">' + num(g.outputChars) + ' симв.</span>' +
                ' <span style="color:#7ba7e8">⟳ генерация...</span>');
            } else if (g.status === "error") {
              lines.push('<span style="color:#aaa;font-weight:500">ВЫХОД:</span> ' +
                '<span style="color:#e06060;font-weight:600">⚠ ОШИБКА: ' + esc(g.error) + '</span>');
            } else {
              const ratioOut = g.outputChars > 0 && g.outputTokens > 0
                ? ' <span style="color:#888888">(' + (g.outputChars / g.outputTokens).toFixed(1) + ' с/т)</span>'
                : '';
              lines.push('<span style="color:#aaa;font-weight:500">ВЫХОД:</span> ' +
                '<span style="color:#4db87a">' + num(g.outputChars) + ' симв.</span>' +
                ' → <span style="color:#4db87a;font-weight:600">' + num(g.outputTokens) + ' ток.</span>' + ratioOut);
              lines.push('  Стоимость: <span style="color:#d4a017;font-weight:600">$' +
                g.cost.toFixed(4) + '</span> (' + (g.cost * 100).toFixed(2) + '¢)');
              if (g.error) {
                lines.push('  <span style="color:#e06060;font-weight:600">⚠ ОШИБКА: ' +
                  esc(g.error) + '</span>');
              }
            }

            // ── Посекционная разбивка ──
            const subs = g.subsections || [];
            const expected = g.expectedSubsections || [];
            if (expected.length > 0) {
              lines.push('');
              lines.push('  <span style="color:#aaa;font-weight:500">СЕКЦИИ:</span>');

              const foundMap = {};
              for (const s of subs) foundMap[s.name] = s;

              for (const secName of expected) {
                const s = foundMap[secName];
                const lbl = esc(secName).padEnd(40);
                if (s) {
                  if (s.status === "streaming") {
                    lines.push('    <span style="color:#7ba7e8">⟳</span> ' + lbl +
                      '<span style="color:#7ba7e8">' + num(s.chars) + ' симв.</span>' +
                      ' <span style="color:#7ba7e8;font-size:9px">генерация</span>');
                  } else {
                    lines.push('    <span style="color:#4db87a">✓</span> ' + lbl +
                      '<span style="color:#4db87a">' + num(s.chars) + ' симв.</span>');
                  }
                } else {
                  lines.push('    <span style="color:#555">◌</span> ' + lbl +
                    '<span style="color:#555">—</span>');
                }
              }
            }
```

---

## A6. JS — Модификация `formatCtxLog()` (plaintext): отображение секций

**Где:** внутри `formatCtxLog()` (строка ~8472 исходного файла).

**Найти** блок вывода «ВЫХОД:» — аналогичная структура.

**После** строки:
```javascript
              if (g.error) {
                lines.push("  ⚠ ОШИБКА: " + g.error);
              }
            }
```

(это конец else-ветки внутри цикла `for (const g of genLog)`, перед `lines.push("─".repeat(70))`)

**Вставить ПЕРЕД `lines.push("─".repeat(70))`:**

```javascript
            // Посекционная разбивка (plaintext)
            const subs = g.subsections || [];
            const expected = g.expectedSubsections || [];
            if (expected.length > 0) {
              lines.push("");
              lines.push("  СЕКЦИИ:");

              const foundMap = {};
              for (const s of subs) foundMap[s.name] = s;

              for (const secName of expected) {
                const s = foundMap[secName];
                const lbl = secName.padEnd(42);
                if (s) {
                  if (s.status === "streaming") {
                    lines.push("    ⟳ " + lbl + num(s.chars).padStart(7) + " симв.  генерация");
                  } else {
                    lines.push("    ✓ " + lbl + num(s.chars).padStart(7) + " симв.");
                  }
                } else {
                  lines.push("    ◌ " + lbl + "     —");
                }
              }
            }
```

---

## A7. Сводка Дополнения A

| Место | Действие | Объём |
|---|---|---|
| После `SEC_NAMES` | `SUBSECTION_MAP_BASE`, `SUBSECTION_MAP_GLOSSARY`, `SUBSECTION_CRITIQUE_NOVELTY/_CHECK`, `buildSubsectionMap` | ~130 строк |
| После `buildSubsectionMap` | `parseSubsectionsFromHTML` | ~45 строк |
| `streamResp()` | Передача `html` в callback | 1 строка (замена) |
| `generateDoc()` цикл | `expectedSubs` + расширение `genEntry` + обновление в `onDelta` + финализация | ~25 строк (замены + вставки) |
| `formatCtxLogHTML()` | Блок «СЕКЦИИ:» после «ВЫХОД:» | ~25 строк (вставка) |
| `formatCtxLog()` | Блок «СЕКЦИИ:» (plaintext) | ~20 строк (вставка) |
| `regenerateSection()` | `expectedSubsections` + `subsections` в genEntry, парсинг в onDelta, финализация | ~20 строк (замены + вставки) |
| `cascadeRegenerateOne()` | То же | ~15 строк (замены + вставки) |

**Итого Дополнение A: ~245 строк нового кода, ~55 строк замен.**

---

## A8. JS — Посекционный трекинг в `regenerateSection()` и `cascadeRegenerateOne()`

### A8a. Модификация `regenerateSection()` (Этап 1, пункт 4)

**Найти** в `regenerateSection()` блок создания `genEntry`:
```javascript
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
```

**Заменить ЦЕЛИКОМ на:**
```javascript
          // Карта ожидаемых секций для трекинга
          const subsecMap = buildSubsectionMap(fullP);
          const expectedSubs = subsecMap[sectionKey] || [];

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
            expectedSubsections: expectedSubs,
            subsections: [],
          };
```

**Затем найти** в `regenerateSection()` блок `onDelta`:
```javascript
          let lastLogRefresh = 0;
          const onDelta = (charsSoFar) => {
            genEntry.outputChars = charsSoFar;
            if (progressText) progressText.textContent = "Генерация... " + charsSoFar + " симв.";
          };
```

**Заменить ЦЕЛИКОМ на:**
```javascript
          let lastLogRefresh = 0;
          const onDelta = (charsSoFar, htmlSoFar) => {
            genEntry.outputChars = charsSoFar;
            if (htmlSoFar && expectedSubs.length > 0) {
              genEntry.subsections = parseSubsectionsFromHTML(htmlSoFar, expectedSubs);
            }
            if (progressText) progressText.textContent = "Генерация... " + charsSoFar + " симв.";
          };
```

**Затем найти** (после `const usage = await streamResp(...)` в `regenerateSection()`):
```javascript
          genEntry.outputChars = container.innerHTML.length;
          genEntry.inputTokens = usage.input_tokens;
```

**Вставить ПЕРЕД `genEntry.inputTokens`:**
```javascript
          if (expectedSubs.length > 0) {
            genEntry.subsections = parseSubsectionsFromHTML(container.innerHTML, expectedSubs);
            genEntry.subsections.forEach(s => { s.status = "done"; });
          }
```

### A8b. Модификация `cascadeRegenerateOne()` (Этап 4, пункт 25)

**Найти** в `cascadeRegenerateOne()` блок создания `genEntry`:
```javascript
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
```

**Заменить ЦЕЛИКОМ на:**
```javascript
        // Карта ожидаемых секций
        const subsecMap = buildSubsectionMap(fullP);
        const expectedSubs = subsecMap[sectionKey] || [];

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
          expectedSubsections: expectedSubs,
          subsections: [],
        };
```

**Затем найти** в `cascadeRegenerateOne()` callback:
```javascript
        const usage = await streamResp(fp, container, SYS, (chars) => {
          genEntry.outputChars = chars;
        });
```

**Заменить ЦЕЛИКОМ на:**
```javascript
        const usage = await streamResp(fp, container, SYS, (chars, html) => {
          genEntry.outputChars = chars;
          if (html && expectedSubs.length > 0) {
            genEntry.subsections = parseSubsectionsFromHTML(html, expectedSubs);
          }
        });
```

**Затем найти** (после `const usage = ...` в `cascadeRegenerateOne()`):
```javascript
        genEntry.outputChars = container.innerHTML.length;
        genEntry.inputTokens = usage.input_tokens;
```

**Вставить ПЕРЕД `genEntry.inputTokens`:**
```javascript
        if (expectedSubs.length > 0) {
          genEntry.subsections = parseSubsectionsFromHTML(container.innerHTML, expectedSubs);
          genEntry.subsections.forEach(s => { s.status = "done"; });
        }
```

---

## A9. Примечания к тестированию

### В процессе генерации
1. Откройте лог контекста во время стриминга раздела.
2. После «ВЫХОД: N симв. ⟳ генерация...» должен появиться блок «СЕКЦИИ:»:
   - Уже сгенерированные секции: `✓ Цели и метод                  1 423 симв.`
   - Текущая секция: `⟳ Портрет каждого философа          847 симв.  генерация`
   - Ожидающие: `◌ Новизна и ценность                  —`
3. Числа обновляются в реальном времени (с троттлингом ~300 мс).
4. Все секции обязаны появиться в порядке из промпта.

### После завершения
1. Все секции в статусе `✓` с финальным количеством символов.
2. Сумма символов по секциям может быть меньше общего «ВЫХОД:» — разница это разметка между секциями (шапка `<div class="doc-section">`, `.section-num`, `.section-title`).

### Plaintext-копия
1. Нажмите «Скопировать лог» — в буфере та же структура, но без HTML-тегов.

### Секции glossary зависят от уровня
1. При `comparative`: ожидаются «Переопределённые термины», «Заимствованные термины», «Новые термины».
2. При `transformative`: «Преобразованные термины», «Эмерджентные термины».
3. Убедитесь, что лог показывает правильный набор для выбранного уровня.

### Секции critique зависят от уровня синтеза
1. При `comparative`: ожидаются «Философская новизна», «Верность источникам», «Верность методу синтеза».
2. При `transformative`: «Эмерджентность концепции», «Верность уровню синтеза», «Верность методу синтеза».
3. При `generative`: «Проблемная генерация», «Верность уровню синтеза», «Верность методу синтеза».
4. Пункт 4 («Верность методу синтеза») одинаков для всех методов — варьируется только содержание внутри.
5. Убедитесь, что лог показывает правильные названия для текущего уровня.

### Модель пропустила секцию
1. Если модель не сгенерировала одну из ожидаемых секций — она останется как `◌ ... —` после завершения. Это нормальное и информативное поведение: лог явно показывает пропуск.

### Совместимость с системой редактирования
1. При перегенерации раздела через «Изменить» — лог показывает секции раздела (модификации в пункте A8).
2. При каскадной перегенерации — каждый каскадный раздел также трекает секции.
3. В обоих случаях `genEntry.source` указывает `"edit"` или `"cascade"`, а `expectedSubsections` и `subsections` заполнены.

---

## Дополнение B: Видимый лог контекста в сохранённом HTML-файле

> Модифицирует пункт 19 (Этап 3). Применять **после** Этапа 3.

---

## B1. JS — Модификация `saveHTML()`: рендер лога в видимый блок

**Где:** в коде `saveHTML()` из пункта 19 (Этап 3).

**Найти** (внутри блока, добавленного в пункте 19):
```javascript
          stateJSON = `\n<script type="application/json" id="philosynth-state">${JSON.stringify(stateData)}<\/script>`;
```

**Заменить на:**
```javascript
          stateJSON = `\n<script type="application/json" id="philosynth-state">${JSON.stringify(stateData)}<\/script>`;

          // ── Видимый лог контекста ──
          const logHTML = typeof formatCtxLogHTML === "function" ? formatCtxLogHTML() : "";
          if (logHTML && !logHTML.includes("Лог пуст")) {
            stateJSON += `\n<details style="
              max-width:1100px; margin:20px auto 0; 
              border:1px solid #d8d4cc; background:#1a1814;
            ">
              <summary style="
                padding:10px 18px; cursor:pointer;
                font-family:'IBM Plex Mono',monospace; font-size:10px;
                letter-spacing:2px; text-transform:uppercase;
                color:#8a8278; background:#f2f0eb;
                list-style:none; display:flex; align-items:center; gap:6px;
                user-select:none;
              ">◈ Лог контекста и генерации</summary>
              <div style="padding:20px; overflow-x:auto;">
                <pre style="
                  font-family:'IBM Plex Mono',monospace; font-size:11px;
                  line-height:1.7; color:#c8c0b0; white-space:pre-wrap;
                  word-break:break-all; margin:0;
                ">${logHTML}</pre>
              </div>
            </details>`;
          }
```

Лог рендерится через `formatCtxLogHTML()` — ту же функцию, что используется в модальном окне лога на странице. Результат вставляется как `<details>` с инлайн-стилями (чтобы работать без внешних CSS-классов в автономном файле). Блок располагается после `#docOutput`, визуально — под футером документа.

---

## B2. Примечания

- Лог **не включается**, если он пуст (проверка `"Лог пуст"`).
- Стили инлайновые — `<details>` не зависит от CSS-переменных страницы и корректно отображается в автономном файле.
- JSON-состояние (`<script id="philosynth-state">`) по-прежнему сохраняется — оно нужно для импорта. Видимый лог — дополнение для чтения, не замена.
- При импорте файла видимый `<details>` с логом не мешает парсингу: `extractSections()` ищет только `.doc-section` внутри `#docBodies`/`#docOutput`.
- Если Дополнение A (посекционный лог) применено, `formatCtxLogHTML()` уже включает блок «СЕКЦИИ:» — он автоматически попадёт и в сохранённый файл.

---

## Дополнение C: Валидация метаданных при импорте

> Модифицирует пункт 21 (Этап 3). Применять **после** Этапа 3.

Текущая реализация `extractMetadata` при отсутствии данных молчаливо подставляет значения по умолчанию. Это опасно: пользователь не узнает, что при перегенерации раздела промпт будет построен с пустым списком философов или неверным методом.

---

## C1. JS — Функция валидации метаданных

**Где:** сразу **после** функции `extractMetadata()` (из пункта 21, Этап 3).  
**Вставить ПОСЛЕ неё:**

```javascript

      /**
       * Проверяет извлечённые метаданные и возвращает массив предупреждений.
       * Пустой массив = всё в порядке.
       * @param {Object} meta
       * @param {Object|null} embeddedState — встроенное JSON-состояние (или null)
       * @returns {{ field: string, message: string, critical: boolean }[]}
       */
      function validateImportMeta(meta, embeddedState) {
        const warnings = [];

        if (!meta.phil || meta.phil.length === 0) {
          warnings.push({
            field: "phil",
            message: "Список философов не найден. Перегенерация разделов невозможна без него.",
            critical: true,
          });
        }

        if (!meta.seed) {
          warnings.push({
            field: "seed",
            message: "Зерно концепции не найдено. Перегенерация разделов будет работать без контекста задачи.",
            critical: true,
          });
        }

        // method / synthLevel / depth — проверяем, был ли fallback
        const methodDisplay = meta._raw?.methodDisplay || "";
        const depthDisplay = meta._raw?.depthDisplay || "";
        const synthDisplay = meta._raw?.synthDisplay || "";

        if (!methodDisplay || !REVERSE_ML[methodDisplay]) {
          warnings.push({
            field: "method",
            message: `Метод синтеза не распознан (найдено: «${methodDisplay || "—"}»). Подставлен «Диалектический» по умолчанию.`,
            critical: false,
          });
        }

        if (!depthDisplay || !REVERSE_DL[depthDisplay]) {
          warnings.push({
            field: "depth",
            message: `Глубина не распознана (найдено: «${depthDisplay || "—"}»). Подставлена «Стандартная» по умолчанию.`,
            critical: false,
          });
        }

        if (!synthDisplay || !REVERSE_SL[synthDisplay]) {
          warnings.push({
            field: "synthLevel",
            message: `Уровень синтеза не распознан (найдено: «${synthDisplay || "—"}»). Подставлен «Сравнительный» по умолчанию.`,
            critical: false,
          });
        }

        if (!meta.ctx) {
          // Не критично — контекст опционален
        }

        if (!embeddedState) {
          warnings.push({
            field: "log",
            message: "Лог контекста и генерации отсутствует. История стоимости и контекстных зависимостей недоступна. " +
              "Лог начнёт накапливаться заново при редактировании.",
            critical: false,
          });
        }

        return warnings;
      }
```

---

## C2. JS — Модификация `extractMetadata()`: сохранение сырых значений

Для работы валидации `extractMetadata` должна сохранить исходные строки из DOM до обратного маппинга.

**Найти** в `extractMetadata()` (пункт 21):
```javascript
        return { phil, method, depth, synthLevel, seed, ctx, docNum };
```

**Заменить на:**
```javascript
        return {
          phil, method, depth, synthLevel, seed, ctx, docNum,
          _raw: { methodDisplay, depthDisplay, synthDisplay },
        };
```

---

## C3. JS — Модификация `importHTML()`: вызов валидации и показ предупреждений

**Найти** в `importHTML()` (пункт 21):
```javascript
        // ── 5. Заполнение DOM ──
        populateFromImport(docOutput, meta, sections, embeddedState);
```

**Вставить ПЕРЕД этой строкой:**
```javascript
        // ── 2b. Валидация метаданных ──
        const metaWarnings = validateImportMeta(meta, embeddedState);
        const hasCritical = metaWarnings.some(w => w.critical);

        if (metaWarnings.length > 0) {
          let warnMsg = "Импорт: обнаружены проблемы с метаданными:\n\n";
          for (const w of metaWarnings) {
            warnMsg += (w.critical ? "⚠ КРИТИЧНО: " : "⚡ Внимание: ") + w.message + "\n";
          }

          if (hasCritical) {
            warnMsg += "\nКритические поля отсутствуют. Документ будет отображён, " +
              "но редактирование (перегенерация разделов) заблокировано.\n" +
              "Заполните недостающие поля в форме ввода и нажмите «Изменить» повторно.\n\n" +
              "Продолжить импорт?";
            if (!confirm(warnMsg)) {
              throw new Error("Импорт отменён пользователем.");
            }
          } else {
            // Некритичные — информируем, не блокируем
            alert(warnMsg + "\nЗначения по умолчанию подставлены. Проверьте форму ввода.");
          }
        }

```

---

## C4. JS — Модификация `buildDocStateFromImport()`: пометка неполного состояния

**Найти** в `buildDocStateFromImport()` (пункт 21) строку:
```javascript
        DOC_STATE.ready = true;
```

**Заменить на:**
```javascript
        // Проверяем полноту: если критические поля отсутствуют — DOC_STATE.ready,
        // но DOC_STATE.incomplete = true → openEditModal покажет предупреждение
        const metaWarnings = validateImportMeta(meta, embeddedState);
        const hasCritical = metaWarnings.some(w => w.critical);
        DOC_STATE.ready = true;
        DOC_STATE.incomplete = hasCritical;
        DOC_STATE.importWarnings = metaWarnings;
```

---

## C5. JS — Модификация `openEditModal()`: блокировка при неполных данных

**Найти** в `openEditModal()` (Этап 1, пункт 4):
```javascript
        if (!DOC_STATE.ready) {
          alert("Документ ещё не сгенерирован.");
          return;
        }
```

**Заменить на:**
```javascript
        if (!DOC_STATE.ready) {
          alert("Документ ещё не сгенерирован.");
          return;
        }
        if (DOC_STATE.incomplete) {
          let msg = "Редактирование ограничено: при импорте не удалось извлечь ключевые параметры.\n\n";
          for (const w of (DOC_STATE.importWarnings || [])) {
            if (w.critical) msg += "⚠ " + w.message + "\n";
          }
          msg += "\nЗаполните недостающие поля в форме ввода. " +
            "После этого система автоматически обновит параметры.\n\n" +
            "Открыть модальное окно только для просмотра?";
          if (!confirm(msg)) return;
        }
```

---

## C6. JS — Запрет перегенерации, удаления и добавления при неполных данных

### C6a. `confirmAndRegenerate()`

**Найти** в `confirmAndRegenerate()` (Этап 1, пункт 4) самое начало:
```javascript
      function confirmAndRegenerate(sectionKey) {
        const label = KEY_LABELS[sectionKey] || sectionKey;
```

**Вставить ПОСЛЕ `const label = ...`:**
```javascript
        if (DOC_STATE.incomplete) {
          alert("Перегенерация невозможна: не все параметры синтеза восстановлены при импорте.\n\n" +
            "Заполните недостающие поля (философы, зерно) в форме ввода.");
          return;
        }
```

### C6b. `confirmAndDelete()`

**Найти** в `confirmAndDelete()` (Этап 2, пункт 13) самое начало:
```javascript
      function confirmAndDelete(sectionKey) {
        const label = KEY_LABELS[sectionKey] || sectionKey;
```

**Вставить ПОСЛЕ `const label = ...`:**
```javascript
        if (DOC_STATE.incomplete) {
          alert("Удаление невозможно: не все параметры синтеза восстановлены при импорте.\n\n" +
            "Заполните недостающие поля в форме ввода.");
          return;
        }
```

### C6c. `confirmAndAdd()`

**Найти** в `confirmAndAdd()` (Этап 2, пункт 14) самое начало:
```javascript
      function confirmAndAdd(sectionKey) {
        const label = KEY_LABELS[sectionKey] || sectionKey;
```

**Вставить ПОСЛЕ `const label = ...`:**
```javascript
        if (DOC_STATE.incomplete) {
          alert("Добавление невозможно: не все параметры синтеза восстановлены при импорте.\n\n" +
            "Заполните недостающие поля в форме ввода.");
          return;
        }
```

---

## C7. JS — Обновление `DOC_STATE.incomplete` при изменении формы

Если пользователь заполнил недостающие поля в форме, `DOC_STATE.incomplete` должен сброситься. 

**Где:** в конце функции `syncFormFromImport()` (из пункта 32, Исправления).

**Найти:**
```javascript
        if (typeof updateCostEstimate === "function") updateCostEstimate();
      }
```

**Вставить ПЕРЕД закрывающей `}`:**
```javascript

        // Слушатели для сброса incomplete при ручном заполнении формы
        const recheckIncomplete = () => {
          if (!DOC_STATE.incomplete) return;
          const phil = getPhil();
          const seed = document.getElementById("seedInput")?.value?.trim();
          if (phil.length > 0 && seed) {
            // Обновляем params из формы
            DOC_STATE.params.phil = phil;
            DOC_STATE.params.seed = seed;
            DOC_STATE.params.method = document.getElementById("synthesisMethod")?.value || DOC_STATE.params.method;
            DOC_STATE.params.depth = document.getElementById("depthLevel")?.value || DOC_STATE.params.depth;
            DOC_STATE.params.synthLevel = document.getElementById("synthesisLevel")?.value || DOC_STATE.params.synthLevel;
            DOC_STATE.params.ctx = document.getElementById("contextInput")?.value?.trim() || "";
            DOC_STATE.incomplete = false;
            DOC_STATE.importWarnings = [];
            recalcDependencies();
            const statusEl = document.getElementById("importStatus");
            if (statusEl) {
              statusEl.textContent += " · Параметры дополнены ✓";
              statusEl.className = "import-status ok";
            }
          }
        };

        // Навешиваем обработчики на ключевые поля
        for (const id of ["seedInput", "synthesisMethod", "synthesisLevel", "depthLevel", "contextInput"]) {
          const el = document.getElementById(id);
          if (el) el.addEventListener("change", recheckIncomplete);
        }
        const philBox = document.getElementById("philBox");
        if (philBox) philBox.addEventListener("change", recheckIncomplete);
```

---

## C8. JS — Добавить поле `incomplete` в `resetDocState()`

**Найти** в `resetDocState()` (Этап 1, пункт 3):
```javascript
        DOC_STATE.editedSections = new Set();
```

**Вставить ПОСЛЕ:**
```javascript
        DOC_STATE.incomplete = false;
        DOC_STATE.importWarnings = [];
```

---

## C9. JS — Авто-заполнение `genCommon` при первой перегенерации

Если файл был импортирован без встроенного состояния, `genCommon` остаётся `null`, и в логе контекста не отображается блок «Общие элементы промпта». При первой перегенерации мы уже вычисляем все составляющие промпта — можно заполнить `genCommon`.

**Где:** в функции `regenerateSection()` (Этап 1, пункт 4).

**Найти:**
```javascript
          const SYS = buildSYS();
          const partBase = baseCtx(fullP);
          const partRules = htmlRules();
          const partQuality = buildPartQuality(fullP);
```

**Вставить ПОСЛЕ этих строк:**
```javascript

          // Заполняем genCommon, если он отсутствует (импорт без лога)
          if (!genCommon) {
            const scaffoldLen = `ПАРАМЕТРЫ СИНТЕЗА:\n\n\nЗАДАНИЕ: составь ТОЛЬКО следующие разделы (строго в указанном порядке, без добавления других):\n\n\n\n`.length;
            genCommon = {
              sysChars:      SYS.length,
              baseChars:     partBase.length,
              rulesChars:    partRules.length,
              qualityChars:  partQuality.length,
              scaffoldChars: scaffoldLen,
              totalChars:    SYS.length + partBase.length + partRules.length + partQuality.length + scaffoldLen,
            };
          }
```

> Аналогичную вставку следует добавить и в `cascadeRegenerateOne()` (Этап 4, пункт 25) — после тех же четырёх строк `const SYS = ...`. Код идентичен.

---

## C10. Сводка Дополнения C

| Место | Действие | Объём |
|---|---|---|
| После `extractMetadata()` | `validateImportMeta()` | ~60 строк |
| `extractMetadata()` | Добавить `_raw` в return | 1 строка (замена) |
| `importHTML()` | Вызов валидации + confirm/alert | ~20 строк (вставка) |
| `buildDocStateFromImport()` | Пометка `incomplete` | ~4 строки (замена) |
| `openEditModal()` | Проверка `incomplete` | ~10 строк (вставка) |
| `confirmAndRegenerate/Delete/Add()` | Блокировка при `incomplete` | ~15 строк (вставка) |
| `syncFormFromImport()` | Слушатели + авто-сброс `incomplete` | ~25 строк (вставка) |
| `resetDocState()` | Поля `incomplete`, `importWarnings` | 2 строки (вставка) |
| `regenerateSection()` | Авто-заполнение `genCommon` | ~10 строк (вставка) |
| `cascadeRegenerateOne()` | Авто-заполнение `genCommon` | ~10 строк (вставка) |

**Итого Дополнение C: ~155 строк нового кода, ~5 строк замен.**

---

## Дополнение D: Фактическая карта зависимостей из `ctxLog`

> Применять **после** Этапов 1–4 и Дополнения C.
> Надстройка над теоретической системой зависимостей — не заменяет её, а дополняет фактическими данными.

---

## D1. JS — Построение фактической карты зависимостей

**Где:** сразу **после** функции `computeDependents()` (Этап 1, пункт 3).  
**Якорь:** найти закрывающую `}` функции `computeDependents`. **Вставить ПОСЛЕ неё:**

```javascript

      // ════════════════════════════════════════
      // FACTUAL DEPS — карта реально использованных зависимостей из ctxLog
      // ════════════════════════════════════════

      /**
       * Строит карту фактических зависимостей из ctxLog.
       * Для каждого раздела-потребителя — какие разделы-источники он реально использовал
       * и сколько символов контекста получил.
       *
       * @param {Array} log — массив ctxLog
       * @returns {{ [consumer: string]: { [source: string]: { chars: number, keys: string[], statuses: string[] } } }}
       */
      function buildFactualDepsMap(log) {
        if (!log || !log.length) return {};

        // При мультисессионном логе для одного sectionKey может быть
        // несколько записей (оригинал + перегенерации). Берём ПОСЛЕДНЮЮ:
        // она отражает актуальное состояние зависимостей раздела.
        const latestByKey = {};
        for (const entry of log) {
          latestByKey[entry.sectionKey] = entry; // перезаписывает → остаётся последняя
        }

        const map = {};
        for (const entry of Object.values(latestByKey)) {
          const consumer = entry.sectionKey;
          if (!map[consumer]) map[consumer] = {};

          for (const e of entry.entries) {
            const source = sourceOf(e.key);
            if (source === "sum" || source === consumer) continue;
            if (e.status === "missing") continue;

            if (!map[consumer][source]) {
              map[consumer][source] = { chars: 0, keys: [], statuses: [] };
            }

            const info = map[consumer][source];
            info.keys.push(e.key);
            info.statuses.push(e.status);

            if (e.status === "found" || e.status === "truncated") {
              info.chars += e.len || 0;
            }
          }
        }
        return map;
      }

      /**
       * Инверсия buildFactualDepsMap: для каждого раздела-источника —
       * кто реально получал его контекст и сколько.
       *
       * @returns {{ [source: string]: { consumers: { key: string, chars: number, keys: string[] }[], totalChars: number } }}
       */
      function computeFactualDependents(factualDeps) {
        const result = {};

        for (const [consumer, sources] of Object.entries(factualDeps)) {
          for (const [source, info] of Object.entries(sources)) {
            if (!result[source]) result[source] = { consumers: [], totalChars: 0 };
            result[source].consumers.push({
              key: consumer,
              chars: info.chars,
              keys: info.keys,
            });
            result[source].totalChars += info.chars;
          }
        }

        // Сортируем потребителей по убыванию chars
        for (const data of Object.values(result)) {
          data.consumers.sort((a, b) => b.chars - a.chars);
        }

        return result;
      }

      /**
       * Для раздела возвращает оценку качества контекста на основе ctxLog.
       * @returns {{ score: number, reqFound: number, reqTotal: number, optIncluded: number, optTotal: number, issues: string[] }}
       */
      function getSectionContextQuality(sectionKey) {
        // Ищем последний ctxLog для этого раздела (может быть несколько при перегенерациях)
        const entries = ctxLog.filter(e => e.sectionKey === sectionKey);
        if (!entries.length) return null;

        const entry = entries[entries.length - 1]; // последний
        const issues = [];

        // Отсутствующие обязательные
        const missingReq = entry.entries.filter(e =>
          e.priority === "required" && (e.status === "missing" || e.status === "dropped")
        );
        if (missingReq.length > 0) {
          const names = missingReq.map(e => CTX_LABELS[e.key] || e.key);
          issues.push("Отсутствовали обязательные: " + names.join(", "));
        }

        // Пропущенные из-за бюджета
        const skipped = entry.entries.filter(e => e.status === "skipped_budget");
        if (skipped.length > 0) {
          issues.push(skipped.length + " контекст(ов) пропущено из-за бюджета");
        }

        // Обрезанные
        const truncated = entry.entries.filter(e => e.status === "truncated");
        if (truncated.length > 0) {
          issues.push(truncated.length + " контекст(ов) обрезано");
        }

        // Заменители
        const substitutes = entry.entries.filter(e => e.isSubstitute && e.status === "found");
        if (substitutes.length > 0) {
          issues.push(substitutes.length + " подстановок(ки)");
        }

        // Общий score: 0-100
        const reqScore = entry.reqTotal > 0 ? (entry.reqFound / entry.reqTotal) : 1;
        const budgetUsage = entry.budget > 0 ? Math.min(1, entry.totalUsed / entry.budget) : 0;
        const score = Math.round(reqScore * 70 + budgetUsage * 30);

        return {
          score,
          reqFound: entry.reqFound,
          reqTotal: entry.reqTotal,
          optIncluded: entry.optIncluded,
          optTotal: entry.optTotal,
          budgetUsed: entry.totalUsed,
          budget: entry.budget,
          issues,
        };
      }
```

---

## D2. JS — Заполнение `DOC_STATE.factualDeps` после генерации и импорта

### D2a. В `populateDocState()` (Этап 1, пункт 3)

**Найти** (в конце `populateDocState`, перед закрывающей `}`):
```javascript
        DOC_STATE.effectiveDeps = effectiveDeps;
        DOC_STATE.resolvedDeps = resolvedDeps;
```

**Вставить ПОСЛЕ:**
```javascript
        DOC_STATE.factualDeps = buildFactualDepsMap(ctxLog);
```

### D2b. В `buildDocStateFromImport()` (Этап 3, пункт 21)

**Найти** (ближе к концу функции):
```javascript
        DOC_STATE.effectiveDeps = effectiveDeps;
```

**Вставить ПОСЛЕ:**
```javascript
        DOC_STATE.factualDeps = buildFactualDepsMap(ctxLog);
```

### D2c. В `resetDocState()` (Этап 1, пункт 3)

**Найти:**
```javascript
        DOC_STATE.incomplete = false;
```

**Вставить ПЕРЕД:**
```javascript
        DOC_STATE.factualDeps = {};
```

---

## D3. JS — Обновление `DOC_STATE.factualDeps` после перегенерации

В `regenerateSection()` (Этап 1, пункт 4) и `cascadeRegenerateOne()` (Этап 4, пункт 25), `ctxLog` пополняется внутри `buildContextForSection`. После завершения перегенерации `factualDeps` устаревает.

**Где:** в `regenerateSection()`, **найти:**
```javascript
          // ── 12. Обновляем DOC_STATE ──
          DOC_STATE.sectionHTML[sectionKey] = container.innerHTML;
```

**Вставить ПЕРЕД этой строкой:**
```javascript
          // Пересобираем фактическую карту зависимостей
          DOC_STATE.factualDeps = buildFactualDepsMap(ctxLog);
```

**То же самое** в `cascadeRegenerateOne()`, **найти:**
```javascript
        // DOC_STATE
        DOC_STATE.sectionHTML[sectionKey] = container.innerHTML;
```

**Вставить ПЕРЕД:**
```javascript
        DOC_STATE.factualDeps = buildFactualDepsMap(ctxLog);
```

---

## D4. JS — Модификация `showCascadePanel()`: фактический вес зависимостей

**Где:** в `showCascadePanel()` (Этап 4, пункт 25).

### D4a. Фильтрация по фактическим зависимостям

**Найти:**
```javascript
        // Сортируем в топологическом порядке
        deps = sortInTopoOrder(deps);
```

**Заменить ЦЕЛИКОМ на:**
```javascript
        // Обогащаем фактическими данными (если доступны)
        const factDeps = DOC_STATE.factualDeps || {};
        const factReverse = computeFactualDependents(factDeps);
        const factInfo = factReverse[triggerKey];

        // Для action "regen": фильтруем теоретических зависимых,
        // оставляя только тех, кто реально использовал контекст источника
        if (action === "regen" && factInfo) {
          const factConsumers = new Set(factInfo.consumers.map(c => c.key));
          const theoretical = deps.filter(k => !factConsumers.has(k));
          const factual = deps.filter(k => factConsumers.has(k));

          // Фактические — всегда показываем; теоретические — помечаем как низкоприоритетные
          deps = [...factual, ...theoretical];
        }

        // Сортируем в топологическом порядке
        deps = sortInTopoOrder(deps);
```

### D4b. Показ символов контекста в элементах списка

**Найти** генерацию элементов списка:
```javascript
          const item = document.createElement("label");
          item.className = "cascade-item";
          item.id = "cascadeItem-" + depKey;
          item.innerHTML = `
            <input type="checkbox" value="${depKey}" checked>
            <span>§ ${num} — ${esc(depLabel)}</span>
            <span class="cascade-item-status" id="cascadeStatus-${depKey}"></span>`;
          listEl.appendChild(item);
```

**Заменить ЦЕЛИКОМ на:**
```javascript
          // Фактический вес: сколько символов контекста из triggerKey получал depKey
          let weightHint = "";
          if (factInfo) {
            const consumer = factInfo.consumers.find(c => c.key === depKey);
            if (consumer && consumer.chars > 0) {
              weightHint = `<span style="font-size:9px;color:var(--gold);margin-left:4px">${consumer.chars.toLocaleString("ru")} симв.</span>`;
            } else if (!consumer) {
              // Теоретическая зависимость, фактически не использовалась
              weightHint = `<span style="font-size:9px;color:var(--ink-dim);margin-left:4px">не использовал</span>`;
            }
          }

          const item = document.createElement("label");
          item.className = "cascade-item";
          item.id = "cascadeItem-" + depKey;

          // Теоретические зависимости по умолчанию не отмечены
          const isFactual = factInfo?.consumers.some(c => c.key === depKey && c.chars > 0);
          const checkedAttr = (isFactual || !factInfo) ? "checked" : "";

          item.innerHTML = `
            <input type="checkbox" value="${depKey}" ${checkedAttr}>
            <span>§ ${num} — ${esc(depLabel)}${weightHint}</span>
            <span class="cascade-item-status" id="cascadeStatus-${depKey}"></span>`;
          listEl.appendChild(item);
```

---

## D5. JS — Модификация `renderEditSections()`: индикатор качества контекста

**Где:** в `renderEditSections()` (Этап 1, пункт 4 + модификации Этапа 2, пункт 15).

**Найти** строку, формирующую заголовок карточки:
```javascript
          let headerHTML = `
            <div class="edit-sec-card-header">
              <div class="edit-sec-title">${isEdited ? "⟳ " : ""}§ ${def.num} — ${esc(label)}</div>
              <div class="edit-sec-num">${key}</div>
            </div>`;
```

**Заменить ЦЕЛИКОМ на:**
```javascript
          // Индикатор качества контекста из ctxLog
          let qualityBadge = "";
          const quality = getSectionContextQuality(key);
          if (quality) {
            let badgeColor, badgeText;
            if (quality.score >= 90) {
              badgeColor = "var(--green-check)";
              badgeText = quality.score + "%";
            } else if (quality.score >= 60) {
              badgeColor = "var(--gold)";
              badgeText = quality.score + "%";
            } else {
              badgeColor = "var(--red)";
              badgeText = quality.score + "%";
            }
            const tooltip = [
              `Контекст: ${quality.reqFound}/${quality.reqTotal} обяз., ${quality.optIncluded}/${quality.optTotal} опц.`,
              `Бюджет: ${quality.budgetUsed.toLocaleString("ru")}/${quality.budget.toLocaleString("ru")} симв.`,
              ...quality.issues,
            ].join("&#10;");
            qualityBadge = ` <span title="${tooltip}" style="font-family:var(--mono);font-size:9px;color:${badgeColor};border:1px solid ${badgeColor};padding:1px 5px;margin-left:6px;cursor:help">${badgeText}</span>`;
          }

          // Предупреждение о деградации (обязательные контексты отсутствовали)
          let degradationHTML = "";
          if (quality && quality.issues.length > 0 && quality.score < 70) {
            degradationHTML = `
              <div class="edit-dep-warn caution" style="margin-top:6px">
                <span class="dep-icon">⚡</span>
                <span>Раздел был сгенерирован с неполным контекстом (${quality.score}%). ` +
                quality.issues.join("; ") + `. Рекомендуется перегенерировать.</span>
              </div>`;
          }

          let headerHTML = `
            <div class="edit-sec-card-header">
              <div class="edit-sec-title">${isEdited ? "⟳ " : ""}§ ${def.num} — ${esc(label)}${qualityBadge}</div>
              <div class="edit-sec-num">${key}</div>
            </div>${degradationHTML}`;
```

---

## D6. Сводка Дополнения D

| Место | Действие | Объём |
|---|---|---|
| После `computeDependents()` | `buildFactualDepsMap`, `computeFactualDependents`, `getSectionContextQuality` | ~120 строк |
| `populateDocState()` | Заполнение `factualDeps` | 1 строка |
| `buildDocStateFromImport()` | Заполнение `factualDeps` | 1 строка |
| `resetDocState()` | Сброс `factualDeps` | 1 строка |
| `regenerateSection()` | Пересборка `factualDeps` | 1 строка |
| `cascadeRegenerateOne()` | Пересборка `factualDeps` | 1 строка |
| `showCascadePanel()` | Фильтрация + вес в элементах | ~40 строк (замена) |
| `renderEditSections()` | Бейдж качества + предупреждение | ~35 строк (замена) |

**Итого Дополнение D: ~125 строк нового кода, ~75 строк замен.**

---

## D7. Примечания к тестированию

### Индикатор качества в модальном окне
1. Сгенерируйте документ с 6+ разделами.
2. Откройте «Изменить» — у каждого раздела (кроме первого после sum) бейдж с процентом.
3. Наведите на бейдж — tooltip показывает: «Контекст: 5/5 обяз., 3/4 опц. Бюджет: 18400/24000 симв.»
4. Если score < 70% — под заголовком карточки появляется предупреждение с перечнем проблем.

### Фактические зависимости в каскаде
1. Перегенерируйте «Граф категорий».
2. В каскадной панели разделы, реально использовавшие контекст графа, показывают количество символов: «§ 4 — Корпус тезисов  4 200 симв.»
3. Разделы, теоретически зависящие от графа, но не получившие его контекст (из-за бюджета или другой причины), помечены «не использовал» и **не отмечены** галочкой по умолчанию.
4. Пользователь может вручную отметить их, если хочет.

### Импорт с логом и без
1. Импорт файла с `ctxLog` → `factualDeps` заполняется → бейджи и фактические веса доступны.
2. Импорт файла без лога → `ctxLog = []` → `factualDeps = {}` → система работает как раньше (только теоретические зависимости, без бейджей).

### Каскад «delete»
1. При удалении раздела `forceDeps` передаётся извне (Этап 4, пункт 27). `factInfo` для удалённого раздела берётся из `factualDeps`, вычисленных **до** удаления (см. пункт 27a — `dependentsBefore`).
2. Для корректной работы нужно, чтобы `factualDeps` тоже запоминались до удаления. **Модификация пункта 27a** (Этап 4):

**Найти** в `deleteSection()`:
```javascript
        // ── 0. Запоминаем зависимые ДО удаления ──
        const dependentsBefore = computeDependents(DOC_STATE.effectiveDeps);
```

**Заменить на:**
```javascript
        // ── 0. Запоминаем зависимые ДО удаления ──
        const dependentsBefore = computeDependents(DOC_STATE.effectiveDeps);
        const factualDepsBefore = DOC_STATE.factualDeps ? { ...DOC_STATE.factualDeps } : {};
```

А в вызове `showCascadePanel` (пункт 27b) после удаления `factualDeps` уже пересобрана без удалённого раздела. Чтобы `showCascadePanel` мог использовать данные **до** удаления, передаём их:

**Найти:**
```javascript
          showCascadePanel("delete", sectionKey, remainingAffected);
```

**Заменить на:**
```javascript
          showCascadePanel("delete", sectionKey, remainingAffected, factualDepsBefore);
```

И в сигнатуре `showCascadePanel` — добавить опциональный четвёртый параметр:

**Найти:**
```javascript
      function showCascadePanel(action, triggerKey, forceDeps) {
```

**Заменить на:**
```javascript
      function showCascadePanel(action, triggerKey, forceDeps, overrideFactualDeps) {
```

И в теле — использовать его:

**Найти:**
```javascript
        const factDeps = DOC_STATE.factualDeps || {};
```

**Заменить на:**
```javascript
        const factDeps = overrideFactualDeps || DOC_STATE.factualDeps || {};
```

---

> Промежуточная сводка Этапов 1–4, исправлений и Дополнений A–D: ~2740 строк / ~214 замен.
> Полная сводка с учётом всех Дополнений — в конце документа.

---

## Дополнение E: Импорт по URL

> Применять **после** Этапа 3 и Дополнения C.
> Расширяет UI импорта: рядом с кнопкой «↑ Импорт HTML» (файл) появляется поле для URL.

---

## E1. CSS — Стили поля URL-импорта

**Где:** в конец CSS-блока (перед `</style>`):

```css

      /* ── URL IMPORT ── */
      .import-url-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }
      .import-url-input {
        flex: 1;
        border: 1px solid var(--rule-strong);
        background: var(--white);
        padding: 7px 12px;
        font-family: var(--mono);
        font-size: 12px;
        color: var(--ink);
        outline: none;
        transition: border-color 0.15s;
      }
      .import-url-input:focus {
        border-color: var(--violet);
        box-shadow: 0 0 0 3px rgba(107, 0, 170, 0.08);
      }
      .import-url-input::placeholder {
        color: var(--ink-dim);
        font-size: 11px;
      }
      .import-url-btn {
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        background: transparent;
        border: 1px solid var(--rule-strong);
        padding: 8px 16px;
        cursor: pointer;
        color: var(--ink-mid);
        transition: all 0.15s;
        white-space: nowrap;
      }
      .import-url-btn:hover {
        border-color: var(--violet);
        color: var(--violet);
      }
      .import-url-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
```

---

## E2. HTML — Поле URL под кнопкой файлового импорта

**Где:** модифицирует пункт 18b (Этап 3). Нужно расширить блок `.import-row`.

**Найти** (из пункта 18b):
```html
        <div class="import-row">
          <button class="import-btn" onclick="document.getElementById('importFileInput').click()">
            ↑ Импорт HTML
          </button>
          <span class="import-status" id="importStatus"></span>
        </div>
```

**Заменить ЦЕЛИКОМ на:**
```html
        <div class="import-row">
          <button class="import-btn" onclick="document.getElementById('importFileInput').click()">
            ↑ Файл
          </button>
          <span class="import-status" id="importStatus"></span>
        </div>
        <div class="import-url-row">
          <input class="import-url-input" id="importUrlInput" type="url"
                 placeholder="https://example.com/document.html"
                 onkeydown="if(event.key==='Enter'){importFromUrl();}">
          <button class="import-url-btn" id="importUrlBtn" onclick="importFromUrl()">
            ↑ Импорт по URL
          </button>
        </div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--ink-dim);margin-top:4px;line-height:1.5;letter-spacing:0.3px">
          ⚠ При кросс-доменной загрузке содержимое страницы может пройти через сторонний CORS-прокси.
          Для конфиденциальных документов используйте импорт из файла.
        </div>
```

---

## E3. JS — Функции импорта по URL

**Где:** сразу **после** функции `handleImportFile()` (Этап 3, пункт 21).  
**Якорь:** найти закрывающую `}` функции `handleImportFile`. **Вставить ПОСЛЕ неё:**

```javascript

      // ════════════════════════════════════════
      // IMPORT BY URL
      // ════════════════════════════════════════

      /** Список CORS-прокси (пробуются по порядку) */
      const CORS_PROXIES = [
        (url) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
        (url) => "https://corsproxy.io/?" + encodeURIComponent(url),
      ];

      /**
       * Загружает HTML по URL и передаёт в importHTML.
       * Стратегия: прямой fetch → CORS-прокси → инструкция скачать вручную.
       */
      async function importFromUrl() {
        const input = document.getElementById("importUrlInput");
        const btn = document.getElementById("importUrlBtn");
        const statusEl = document.getElementById("importStatus");
        const rawUrl = input?.value?.trim();

        if (!rawUrl) {
          if (statusEl) {
            statusEl.className = "import-status err";
            statusEl.textContent = "⚠ Введите URL";
          }
          return;
        }

        // Валидация URL
        let url;
        try {
          url = new URL(rawUrl);
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
          if (statusEl) {
            statusEl.className = "import-status err";
            statusEl.textContent = "⚠ Некорректный URL";
          }
          return;
        }

        if (btn) btn.disabled = true;
        if (statusEl) {
          statusEl.className = "import-status";
          statusEl.textContent = "Загрузка...";
        }

        // Извлекаем имя файла из URL
        const filename = url.pathname.split("/").pop() || "import.html";

        try {
          const htmlString = await fetchWithFallback(url.href, statusEl);

          // Проверяем, что это HTML
          if (!htmlString || !htmlString.includes("<")) {
            throw new Error("Ответ не содержит HTML.");
          }

          importHTML(htmlString, filename);

          if (statusEl) {
            statusEl.className = "import-status ok";
            statusEl.textContent = "✓ Импортирован: " + filename;
          }
          if (input) input.value = "";

        } catch (err) {
          console.error("Ошибка импорта по URL:", err);
          if (statusEl) {
            statusEl.className = "import-status err";
            statusEl.textContent = "⚠ " + err.message;
          }
        } finally {
          if (btn) btn.disabled = false;
        }
      }

      /**
       * Пытается загрузить URL: сначала напрямую, затем через CORS-прокси.
       * @param {string} url
       * @param {HTMLElement|null} statusEl — для обновления статуса
       * @returns {Promise<string>} — HTML-содержимое
       */
      async function fetchWithFallback(url, statusEl) {
        // ── 1. Прямой fetch ──
        try {
          if (statusEl) statusEl.textContent = "Прямая загрузка...";
          const resp = await fetch(url, {
            mode: "cors",
            headers: { "Accept": "text/html" },
          });
          if (resp.ok) {
            const text = await resp.text();
            if (text && text.includes("<")) return text;
          }
        } catch (e) {
          // CORS или сетевая ошибка — продолжаем к прокси
          console.log("Прямой fetch не удался:", e.message);
        }

        // ── 2. CORS-прокси (по порядку) ──
        for (let i = 0; i < CORS_PROXIES.length; i++) {
          const proxyUrl = CORS_PROXIES[i](url);
          try {
            if (statusEl) statusEl.textContent = `Прокси ${i + 1}/${CORS_PROXIES.length}...`;
            const resp = await fetch(proxyUrl);
            if (resp.ok) {
              const text = await resp.text();
              if (text && text.includes("<")) return text;
            }
          } catch (e) {
            console.log(`Прокси ${i + 1} не удался:`, e.message);
          }
        }

        // ── 3. Все попытки исчерпаны ──
        throw new Error(
          "Не удалось загрузить: сервер блокирует кросс-доменные запросы. " +
          "Скачайте файл вручную (Ctrl+S на странице) и загрузите через кнопку «↑ Файл»."
        );
      }
```

---

## E4. Сводка Дополнения E

| Место | Действие | Объём |
|---|---|---|
| CSS | Стили `.import-url-row`, `.import-url-input`, `.import-url-btn` | ~40 строк |
| HTML (пункт 18b) | Поле URL + кнопка | ~12 строк (замена) |
| После `handleImportFile()` | `CORS_PROXIES`, `importFromUrl`, `fetchWithFallback` | ~100 строк |

**Итого Дополнение E: ~140 строк нового кода, ~6 строк замен.**

---

## E5. Примечания к тестированию

### Прямой fetch (тот же домен или CORS-разрешённый)
1. Если PhiloSynth и импортируемый файл на одном домене — загрузка мгновенная.
2. Если сервер отдаёт `Access-Control-Allow-Origin: *` — тоже работает напрямую.
3. Статус: «Прямая загрузка...» → «✓ Импортирован: PS-6361-FEAG.html».

### Fallback через CORS-прокси
1. GitHub Pages не отдаёт CORS-заголовки для HTML.
2. Прямой fetch молча падает → система пробует `api.allorigins.win`, затем `corsproxy.io`.
3. Статус: «Прямая загрузка...» → «Прокси 1/2...» → «✓ Импортирован».
4. Если первый прокси лежит — пробуется второй. Если оба — сообщение с инструкцией скачать вручную.

### Ввод по Enter
1. Введите URL в поле и нажмите Enter — импорт запускается без нажатия кнопки.

### Валидация
1. Пустое поле → «⚠ Введите URL».
2. `ftp://...` или невалидная строка → «⚠ Некорректный URL».
3. URL, возвращающий не-HTML (JSON API, изображение) → «⚠ Ответ не содержит HTML».

### Интеграция с существующим импортом
1. После загрузки HTML по URL вызывается тот же `importHTML(htmlString, filename)` — вся валидация, заполнение DOC_STATE, синхронизация формы работают идентично файловому импорту.
2. `filename` извлекается из URL path: `https://example.com/docs/PS-1234.html` → `"PS-1234.html"`.

### Приватность
1. CORS-прокси видит URL запрашиваемой страницы. Содержимое страницы проходит через прокси-сервер.
2. Если это неприемлемо — пользователь может скачать файл вручную и загрузить через «↑ Файл».
3. Рекомендация: добавить tooltip или подсказку рядом с полем URL: «При загрузке через внешний прокси содержимое страницы проходит через сторонний сервер».

---

## Общая сводка проекта (финальная)

| Блок | Описание | Новый код | Замены |
|---|---|---|---|
| Этап 1 | DOC_STATE + перегенерация | ~680 строк | 3 строки |
| Этап 2 | Удаление + добавление | ~580 строк | ~10 строк |
| Этап 3 | Импорт + состояние в файле | ~385 строк | ~6 строк |
| Этап 4 | Каскадные предложения | ~375 строк | ~35 строк |
| fix | Исправления упущений | ~160 строк | ~20 строк |
| A | Посекционный лог генерации | ~245 строк | ~55 строк |
| B | Лог контекста в сохранённом файле | ~35 строк | ~5 строк |
| C | Валидация метаданных при импорте | ~155 строк | ~5 строк |
| D | Фактическая карта зависимостей | ~125 строк | ~75 строк |
| E | Импорт по URL | ~140 строк | ~6 строк |
| **Итого** | | **~2880 строк** | **~220 строк** |

Финальный объём файла: ~8818 + ~2880 ≈ **~11 700 строк**.
