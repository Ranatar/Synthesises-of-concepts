# Русский хардкод в `scripts/` — функциональный текст и логи/ошибки

JS-файлы разобраны парсером **acorn**; каждый кириллический строковый литерал,
шаблон и regex-литерал классифицирован по контексту в дереве разбора.
Комментарии (как JS `//`, `/* */`, так и `/* */`/`<!-- -->` **внутри строковых
литералов** — inline-CSS и SVG в генерируемом HTML) из выборки **исключены**.

Каждый случай отнесён к одной из трёх групп:

1. **Функциональный хардкод** — текст, от которого зависит работа сборки или
   который попадает в книгу: regex по структуре документа, словари сокращений,
   заголовки таблиц, контент страниц.
2. **Логи/ошибки с кириллицей внутри вычисляемого выражения** — русский литерал
   стоит внутри подстановки `${…}`, тернара `?:` или `|| && ??`: условные и
   «запасные» фрагменты (`|| '(нет)'`), согласование (`? 'ока' : 'оки'`),
   выбор между вариантами сообщения. Здесь правка требует сохранить логику
   ветвления (и, напр., правила согласования) — риск «сломать» лог.
3. **Логи/ошибки с кириллицей только в безусловном тексте** — весь русский лежит
   в плоских строках/квазисах, которые всегда попадают в вывод; подстановки
   нетекстовые (числа, пути, счётчики, ID). Такой текст можно править свободно.

## Сводка

| Файл | 1. Функциональный | 2. Кириллица в `${…}`/`?:`/`||` | 3. Кириллица только в тексте |
|---|---:|---:|---:|
| `book.js` | 0 | 1 | 14 |
| `build-parts.js` | 0 | 1 | 18 |
| `merge.js` | 76 | 1 | 20 |
| `run.js` | 12 | 7 | 40 |
| **Итого** | **88** | **10** | **92** |

Группы 2–3 считаются по **конструкциям** (одно `console.*`/`throw` = один пункт,
даже если оно занимает несколько строк); группа 1 — по физическим строкам с
кириллицей. `var msg` / `diag.push` / `tailBalance()` / `runtFix()` — это
промежуточные сборщики строк, которые затем уходят в `console.log`.

---

## 1. Функциональный хардкод

### `merge.js` — 76 строк

```js
// merge.js:342
    const EXER_RE = /^Упражнени[ея]\s+\d+\.\d+/;
```

```js
// merge.js:369
        if (/^Ответы\b/i.test(text)) return;        // только глава 15
```

```js
// merge.js:467
        if (!/^Ответы\s+\d+/i.test(h.textContent.trim())) continue;
```

```js
// merge.js:602
            /^letter-[A-Za-zА-Яа-яЁё]$/.test(el.id)) {
```

```js
// merge.js:636–638
        if (lower.includes('сводка грамматики') ||
            lower.includes('краткое содержание грамматики') ||
            lower.includes('грамматический материал')) {
```

```js
// merge.js:641
        if (/^Ответы\s+\d+/i.test(text)) {
```

```js
// merge.js:649
        if (h.textContent.trim().toLowerCase().includes('краткое содержание главы')) {
```

```js
// merge.js:668
        const m = lastNode.textContent.match(/^(\s*\d+\.\d+)\.\d+(\s+Лексика главы.*)$/i);
```

```js
// merge.js:745
            return /^(Примечани[ея]\s|Note\s)/i.test(t);
```

```js
// merge.js:765
const NOTE_RE = /^\s*Примечани[ея][\s\u00A0\u202F]*[\u00B9\u00B2\u00B3\u2070\u2074-\u2079]?\s*:/u;
```

```js
// merge.js:841
        const m = node.nodeValue.match(/^(\s*)(Примечани[ея]|Note)/);
```

```js
// merge.js:866
        if (!/^Ответы\s+находятся\s+здесь/.test(text)) continue;
```

```js
// merge.js:878
        p.appendChild(doc.createTextNode('Ответы см. в '));
```

```js
// merge.js:881
        newA.textContent = 'Главе 15';
```

```js
// merge.js:909–911
        'Существительные': 'Сущ.', 'существительные': 'сущ.', 'существительных': 'сущ.',
        'Длинные': 'Дл.', 'Односложные': '1-слож.',
        'основой': 'осн.', 'стечением': 'стеч.', 'усечением': 'усеч.'
```

```js
// merge.js:957
        const tip = idx('Тип глагола');
```

```js
// merge.js:961–962
            aor: idx('Аорист'), pres: idx('Настоящее'),
            fut: idx('Будущее'), past: idx('Прошедшее'), perf: idx('Совершенное')
```

```js
// merge.js:1046
        const tip = heads.indexOf('Тип глагола');
```

```js
// merge.js:1077
        const abbr = { 'Настоящее': 'Наст.', 'Будущее': 'Буд.', 'Прошедшее': 'Прош.', 'Совершенное': 'Сов.' };
```

```js
// merge.js:1107
        const tip = idx('Тип глагола');
```

```js
// merge.js:1111–1112
            aor: idx('Аорист'), pres: idx('Настоящее'),
            fut: idx('Будущее'), past: idx('Прошедшее'), perf: idx('Совершенное')
```

```js
// merge.js:1116
        const labels = ['№', 'Тип', 'Аор.', 'Наст.', 'Буд.', 'Прош.', 'Сов.'];
```

```js
// merge.js:1291
    const anchors = [...doc.querySelectorAll('a[id]')].filter(a => /^[A-Za-zА-Яа-яЁё]$/.test(a.id));
```

```js
// merge.js:1353
    const titleText = titleH1 ? titleH1.textContent.trim() : 'Eldamo: вводный курс квэнья';
```

```js
// merge.js:1450
        newH1.textContent = 'Глава 15 — Ответы к упражнениям';
```

```js
// merge.js:1463
            groupH.textContent = `Ответы Главы ${n}`;
```

```js
// merge.js:1469
                        const m = txt.match(/^Ответы\s+(\d+(?:\.\d+)?)\s*$/i);
```

```js
// merge.js:1472
                            el.textContent = `Ответы к упражнению ${m[1]}`;
```

```js
// merge.js:1491
            b.innerHTML = `<a href="#${groupId}">Ответы Главы ${n}</a>`;
```

```js
// merge.js:1822
    let titleVersionText = 'версия 1.1.1 (июнь 2025)';
```

```js
// merge.js:1824
        const mv = (authorBlock.textContent || '').match(/верси[^\n]*/i);
```

```js
// merge.js:1959
    leafTranslator.textContent = 'пер. R\u00e1natar Maivandion';
```

```js
// merge.js:1990–2001
        '«Eldamo: вводный курс квэнья» — наиболее актуальный из имеющихся на ' +
        'русском языке учебник эльфийского языка квэнья, созданного ' +
        'Дж. Р. Р. Толкином. Курс не требует предварительной языковой подготовки ' +
        'и ведёт читателя от основ произношения и письма тенгвар до склонения ' +
        'имён, спряжения глаголов и синтаксиса сложного предложения. Каждая ' +
        'глава сочетает грамматику, тематическую лексику и упражнения с ' +
        'приложением сведений об эльфийской культуре и разбором подлинных ' +
        'текстов Толкина. Отличительная черта — опора на лексикон Eldamo, ' +
        'скрупулёзный учёт всех опубликованных материалов Толкина и честность ' +
        'перед источником: реконструированные и спорные явления помечаются ' +
        'отдельно, а принятые решения поясняются. Для всех, кто изучает ' +
        'языки Толкина.';
```

```js
// merge.js:2007–2013
        '<p class="imprint-title">Eldamo: вводный курс квэнья</p>' +
        '<p>Оригинальное название: <i>Eldamo Introductory Quenya</i></p>' +
        '<p>Составитель: Paul Strack</p>' +
        '<p>Перевод с английского: Ránatar Maivandion</p>' +
        '<p>Версия 1.1.1 (июнь 2025)</p>' +
        '<p>По материалам лексикона Eldamo (eldamo.org)</p>' +
        '<p>Лицензия Creative Commons Attribution 4.0 (CC&nbsp;BY&nbsp;4.0)</p>';
```

```js
// merge.js:2087
    tocH1.textContent = 'Содержание';
```

```js
// merge.js:2096
    legendSample.textContent = 'Серым';
```

```js
// merge.js:2099–2100
        ' отмечены номера рубрик с дополнительным материалом — ' +
        'при первом чтении их можно пропустить.'));
```

```js
// merge.js:2120
        if (/^Упражнение\b/.test(linkText) || /^#x\d+-\d+$/.test(href)) {
```

```js
// merge.js:2189
    briefH1.textContent = 'Оглавление';
```

```js
// merge.js:2198
        let chapterCaption = `Глава ${item.num}`;
```

```js
// merge.js:2200
            chapterCaption += ' — Ответы к упражнениям';
```

```js
// merge.js:2249
        const label = `Глава ${item.num}`;
```

```js
// merge.js:2255
        if (item.num === 14) section.setAttribute('data-chapter-title', 'Русско-квэнья словарь');
```

```js
// merge.js:2423
        '<p>Квэнья — «эльфийская латынь» Дж. Р. Р. Толкина, древний язык нолдор, на котором звучат имена звёзд и дивные сказания Заокраинного Запада. Эта книга — наиболее актуальный курс квэнья на русском языке, ведущий читателя от первого произнесённого звука до сложных времён и придаточных предложений.</p><p>Курс «вводный» лишь в том смысле, что не требует предварительной подготовки, — но он учит квэнья всерьёз, как живой иностранный язык. В главах раскрывается фонетика, письмо тенгвар, склонение и спряжение, синтаксис, а грамматика освещается вместе с тематической лексикой и упражнениями. Не обойдена вниманием и эльфийская культура вместе с подлинными текстами Толкина. Всё это делает книгу и учебником, и справочником.</p><p>Главная особенность курса — честность перед источником. Толкин не завершил свои языки, и там, где его записи молчат или противоречат себе, автор не скрывает швов: реконструированные формы помечены, спорные решения объяснены, и все опубликованные материалы скрупулёзно учитываются. Осваивая квэнья, читатель учится ещё и тому, как язык эльфов восстанавливают из наследия его творца.</p><p>Для всех, кто хочет не просто узнать пару слов по-эльфийски, а по-настоящему войти в язык Высоких эльфов.</p>';
```

```js
// merge.js:2641
        '<p class="colophon-kind">Учебное издание</p>' +
```

```js
// merge.js:2643–2649
        '<p class="colophon-title">Eldamo: вводный курс квэнья</p>' +
        '<p>Перевод с английского: R\u00e1natar Maivandion</p>' +
        '<p>Вёрстка: R\u00e1natar Maivandion и Claude Opus 4.8 High</p>' +
        '<p>Гарнитуры: PT Serif и Gentium Plus (композитное семейство BookSerif);<br>' +
        'тенгвар \u2014 Tengwar Eldamar и Tengwar Annatar (Glaemscrafu)</p>' +
        '<p>Формат 170\u00d7240 мм</p>' +
        '<p>Оригинал-макет: HTML \u2192 Chromium \u2192 PDF (puppeteer-core, pdf-lib)</p>' +
```


### `run.js` — 12 строк

```js
// run.js:585–587
                'Именительный': 'Им.', 'Дательный': 'Дат.', 'Родительный': 'Род.',
                'Притяжательный': 'Прит.', 'Целевой': 'Цел.', 'Исходный': 'Исх.',
                'Местный': 'Мест.', 'Творительный': 'Твор.'
```

```js
// run.js:861
                    const m = txt.match(/^(Глава\s+\d+)\s*[—–-]\s*(.+)$/i);
```

```js
// run.js:866
                    label: s.getAttribute('data-chapter-label') || `Глава ${s.getAttribute('data-chapter-num')}`,
```

```js
// run.js:876
                const m = text.match(/^(Глава\s+\d+)/i);
```

```js
// run.js:906
                if (/^[A-Za-zА-Яа-яЁё]$/.test(t)) dictLetters.push(t);
```

```js
// run.js:2114–2115
            label = `Упр. ${xm[1]}.${xm[2]}`;            // x6-1 → "Упр. 6.1"
        } else if (/^letter-[A-Za-zА-Яа-яЁё]$/.test(decoded)) {
```

```js
// run.js:2137
    const UNINFORMATIVE_TITLES = new Set(['откуда это известно']);
```

```js
// run.js:2302–2303
                    if (c) { prefix = (c.label || `Глава ${ch}`).trim(); title = c.title || ''; }
                    else { prefix = `Глава ${ch}`; }
```


---

## 2. Логи/ошибки с кириллицей внутри вычисляемого выражения

Кириллица сидит внутри `${…}` / `?:` / `|| && ??`. В заголовке блока показан
сам вычисляемый фрагмент с кириллицей (`кириллица в подстановке: …`).

### `book.js` — 1

```js
// book.js:153–154   [console.log]   — кириллица в подстановке: args.join(' ') || '(нет)'
console.log(`Запуск: ${new Date().toISOString()}, node ${process.version}, ` +
        `аргументы: ${args.join(' ') || '(нет)'}`)
```


### `build-parts.js` — 1

```js
// build-parts.js:188   [console.log]   — кириллица в подстановке: head === 'front' ? 'титул + оглавление' : 'титул … глава 12'
console.log(`===== PART=${head}: ${head === 'front' ? 'титул + оглавление' : 'титул … глава 12'} (живая сессия, без кэша) =====`)
```


### `merge.js` — 1

```js
// merge.js:2328–2330   [console.log]   — кириллица в подстановке: notes.classedLi ? `, неведущих <li> размечено на месте: ${not…
console.log(`Примечания: поднято <li>→<p>: ${notes.lifted}, размечено <p>: ${notes.classedP}, ` +
                `ярлыков в курсив: ${notes.labelled}` +
                (notes.classedLi ? `, неведущих <li> размечено на месте: ${notes.classedLi}` : ''))
```


### `run.js` — 7

```js
// run.js:681–689   [console.log]   — кириллица в подстановке: tableFit.escalated ? `, дожато inline-кеглем ${tableFit.escal…  |  tableFit.stillOver ? `, ⚠ ВСЁ ЕЩЁ ШИРЕ ПОЛОСЫ: ${tableFit.sti…
console.log(
            `Ужатие таблиц по ширине: полоса ${Math.round(printFieldPx)}px, ` +
            `«исходных» ${tableFit.candidates}, сокращены падежи ${tableFit.abbreviated} ` +
            `(в ${tableFit.groupsAbbrev} разделах-главах), ` +
            `ужато до 9pt ${tableFit.shrunk}` +
            (tableFit.escalated ? `, дожато inline-кеглем ${tableFit.escalated}` : '') +
            (tableFit.stillOver
                ? `, ⚠ ВСЁ ЕЩЁ ШИРЕ ПОЛОСЫ: ${tableFit.stillOver} (упёрлись в пол 7.5pt — проверьте вёрстку)`
                : ''))
```

```js
// run.js:1084–1085   [console.log]   — кириллица в подстановке: part ? '1-й проход: извлекаю якоря (PART-режим, без штамповки…
console.log(part ? '1-й проход: извлекаю якоря (PART-режим, без штамповки)...'
                         : '1-й проход: анализирую и добавляю колонтитулы...')
```

```js
// run.js:1396–1400   [console.log (через msg)]   — кириллица в подстановке: cut.kind === 'cut' ? `хвост ${cut.n} статей (с «${cut.lemma}»…
msg =
                    cut.kind === 'cut' ? `хвост ${cut.n} статей (с «${cut.lemma}»)` :
                    cut.kind === 'fit' ? `подгоночный кусок ${cut.n}/${cut.of} (с «${cut.lemma}»)` :
                    cut.kind === 'shrink' ? `кусок «${cut.lemma}» ужат до ${cut.n}` :
                    `откат подгонки «${cut.lemma}» (тесно)`
```

```js
// run.js:1494–1496   [diag.push → console.log]   — кириллица в подстановке: inBottom ? ' [подвал]' : ''
diag.push(`${h.id}: p${d0.page} y${Math.round(d0.y)}` +
                            `${inBottom ? ' [подвал]' : ''} строк=${ys.length} ` +
                            `статейНаСтр=${onPage.length} ulей=${uls.length} дальше=${continues}`)
```

```js
// run.js:1591–1594   [console.log]   — кириллица в подстановке: moved.lines === 1 ? 'ока' : 'оки'  |  moved.glued > 1 ? `, склеено кусков: ${moved.glued}` : ''
console.log(`  Висячие буквы${label} [${movedLetters}]: «${moved.letter}» ` +
                    `(${moved.lines} стр${moved.lines === 1 ? 'ока' : 'оки'} в подвале` +
                    (moved.glued > 1 ? `, склеено кусков: ${moved.glued}` : '') +
                    `) → новая страница.`)
```

```js
// run.js:1613   [runtFix() → console.log]   — кириллица в подстановке: round > 1 ? ` (раунд ${round})` : ''
runtFix(round > 1 ? ` (раунд ${round})` : '')
```

```js
// run.js:1685–1687   [console.log]   — кириллица в подстановке: leftover.length ? ` ⚠ Остались сироты-рубрики: ${leftover.len…
console.log(leftover.length
                    ? `  ⚠ Остались сироты-рубрики: ${leftover.length} (не удалось устранить за 2 итерации)`
                    : `  Сироты-рубрики устранены полностью.`)
```


---

## 3. Логи/ошибки с кириллицей только в безусловном тексте

Весь русский — безусловный текст сообщения; подстановки нетекстовые (числа,
пути, счётчики, ID). Можно локализовать независимо от логики кода.

### `book.js` — 14

```js
// book.js:124–126   [fs.writeSync]
fs.writeSync(fd, `=== Завершение: код ${code}, ` +
                `${((Date.now() - t0) / 1000).toFixed(1)} с, ` +
                `${new Date().toISOString()} ===\n`)
```

```js
// book.js:151   [console.log]
console.log(`Лог сборки: ${logPath}`)
```

```js
// book.js:161–162   [console.log]
console.log(`Железо: ${os.cpus().length}\u00d7${os.cpus()[0].model.trim()}, ` +
        `${(os.totalmem() / 1024 ** 3).toFixed(1)} ГБ ОЗУ, ${os.type()} ${os.release()}`)
```

```js
// book.js:165   [console.error]
console.error('--mono несовместим с --skip-merge/--parts (это параметры раздельной сборки).')
```

```js
// book.js:179   [console.error]
console.error('--skip-merge: нет ' + htmlPath + ' — сначала соберите HTML (без флага или node merge.js).')
```

```js
// book.js:182   [console.log]
console.log('[1/2] merge: пропущено (--skip-merge; правки chapters/ не учитываются)')
```

```js
// book.js:184   [console.log]
console.log('[1/2] merge: 15 глав → единый HTML')
```

```js
// book.js:187   [console.log]
console.log(`[2/2] build-parts: раздельная сборка (схема ${scheme})`)
```

```js
// book.js:209   [console.log]
console.log('[cache] Попадание: переиспользую пост-транскрипционный HTML')
```

```js
// book.js:218   [console.log]
console.log('[cache] Промах: полная пересборка HTML')
```

```js
// book.js:219   [console.log]
console.log('        Запишу в:', path.relative(process.cwd(), cacheFile))
```

```js
// book.js:223   [console.log]
console.log('[cache] Отключён (--no-cache)')
```

```js
// book.js:227   [console.log]
console.log('[1/2] merge: 15 глав → единый HTML')
```

```js
// book.js:230   [console.log]
console.log('[1/2] merge: пропущено (cache hit)')
```


### `build-parts.js` — 18

```js
// build-parts.js:78   [throw]
throw new Error(`Не найдены границы части ${part}`);
```

```js
// build-parts.js:127   [throw]
throw new Error(`Неизвестная схема разбиения: ${scheme}`);
```

```js
// build-parts.js:165   [console.log]
console.log(`\n===== PART=${pt}: кэш-попадание (${meta.numPages} стр., ключ ${key}) =====`)
```

```js
// build-parts.js:201   [console.log]
console.log(`Глава 1 пришлась бы на чётную стр. ${cum + 1} — вставляю пустую страницу-прокладку.`)
```

```js
// build-parts.js:208   [console.log]
console.log(`\n===== PART=${pt}: старт на стр. ${cum + 1} книги (${parity}) =====`)
```

```js
// build-parts.js:219–221   [console.log]
console.log(`Объединённая модель: ${model.totalPages} стр. ` +
                `(${chain.map(p => counts[p]).join(' + ')}` +
                `${assembly.some(a => a.kind === 'blank') ? ' + blank' : ''}).`)
```

```js
// build-parts.js:231   [console.log]
console.log('Склеиваю части (pdf-lib copyPages)...')
```

```js
// build-parts.js:244   [console.log]
console.log('Штампую колонтитулы и номера по объединённой модели...')
```

```js
// build-parts.js:253   [console.log]
console.log('Переписываю именованные назначения ссылок в явные...')
```

```js
// build-parts.js:256–258   [console.log]
console.log(`  link-аннотаций: ${rw.links}, переписано: ${rw.rewritten}, ` +
        `уже явных/внешних: ${rw.skipped}, без цели: ${rw.dangling} ` +
        `за ${((Date.now() - tRw) / 1000).toFixed(1)} с.`)
```

```js
// build-parts.js:260   [console.log]
console.log('Дедуплицирую одинаковые потоки (глифы шрифтов частей)...')
```

```js
// build-parts.js:263–264   [console.log]
console.log(`  убрано ${dd.removed} дубликатов за ${((Date.now() - tDedup) / 1000).toFixed(1)} с: ` +
        `${(dd.before / 1e6).toFixed(2)} → ${(dd.after / 1e6).toFixed(2)} МБ`)
```

```js
// build-parts.js:266–267   [console.log]
console.log(`Сборка завершена за ${((Date.now() - t0) / 1000).toFixed(0)} с: ` +
        `${outputPdf} (${model.totalPages} стр.; кэш: ${cacheHits} попаданий, ${cacheMisses} рендеров).`)
```

```js
// build-parts.js:476   [console.error]
console.error('build-parts.js — внутренний модуль. Используйте:')
```

```js
// build-parts.js:477   [console.error]
console.error('  node book.js                        — раздельная сборка (поглавная, с кэшем)')
```

```js
// build-parts.js:478   [console.error]
console.error('  node book.js --parts=coarse         — раздельная, 4 крупные части')
```

```js
// build-parts.js:479   [console.error]
console.error('  node book.js --skip-merge           — на существующем full HTML, без merge')
```

```js
// build-parts.js:480   [console.error]
console.error('  node book.js --mono                 — опорный монолитный рендер')
```


### `merge.js` — 20

```js
// merge.js:190   [console.log]
console.log(`  Объединено вложенных <ul> внутри vocab-list <li>: ${mergedCount}`)
```

```js
// merge.js:229   [console.log]
console.log(`  Перечни → multicol: ${n}`)
```

```js
// merge.js:371   [console.warn]
console.warn(`  Рубрика без якоря пропущена в «Содержании»: «${text.slice(0, 60)}»`)
```

```js
// merge.js:377   [console.warn]
console.warn(`  Рубрика длиннее 100 знаков, укорочена в «Содержании»: «${text.slice(0, 50)}…»`)
```

```js
// merge.js:1378   [console.log]
console.log(`Глава ${n}: загружаю и преобразую…`)
```

```js
// merge.js:2234–2235   [console.log]
console.log(`Оглавление+Содержание: глав ${processed.length}, ` +
        `строк содержания ${tocBody.children.length}.`)
```

```js
// merge.js:2277   [console.log]
console.log(`Глобально переписано кросс-главных ссылок «Лексика главы»: ${renamed}`)
```

```js
// merge.js:2299   [console.log]
console.log(`Зачистка toc-сирот (цели нет в документе): удалено ${tocOrphans}.`)
```

```js
// merge.js:2309   [console.log]
console.log(`Сжато пробелов перед надстрочными индексами: ${tightened}`)
```

```js
// merge.js:2319   [console.log]
console.log(`Снят класс exercise-list с <ul>: ${strippedUls}`)
```

```js
// merge.js:2336   [console.log]
console.log(`Техт увеличено под выделенной согласной: ${grownTehtar}`)
```

```js
// merge.js:2344   [console.log]
console.log(`Обёрнут вводный текст родительских <li>: ${liLeads}`)
```

```js
// merge.js:2357   [console.log]
console.log(`Единообразно сокращено слов в заголовках таблиц: ${thAbbr}`)
```

```js
// merge.js:2368   [console.log]
console.log(`Разбито таблиц спряжения: ${splitVerb}`)
```

```js
// merge.js:2369   [console.log]
console.log(`Вынесен «Тип глагола» в легенду: ${verbTypeExtracted}`)
```

```js
// merge.js:2372   [console.log]
console.log(`Перестроена таблица спряжения в одну компактную (все столбцы, 9pt): ${verbHdr}`)
```

```js
// merge.js:2379   [console.log]
console.log(`Обёрнуто шапок таблиц в <thead>: ${wrappedHeaders}`)
```

```js
// merge.js:2388   [console.log]
console.log(`Добавлено скрытых ссылок для destinations: ${preservedAnchors}`)
```

```js
// merge.js:2670   [console.log]
console.log('Готово:', OUT_FILE)
```

```js
// merge.js:2671–2677   [console.log]
console.log('Статистика:', {
        chapters: processed.length,
        chaptersWithMiniToc: processed.filter(p => p.miniToc && p.miniToc.children.length > 0).length,
        chaptersWithAnswers: Object.keys(collectedAnswers).length,
        totalAnswerBlocks: Object.values(collectedAnswers).reduce((s, a) => s + a.length, 0),
        outputSize: html.length
    })
```


### `run.js` — 40

```js
// run.js:98   [console.error]
console.error('Не найден Chrome/Chromium. Установите его или укажите путь через PUPPETEER_EXECUTABLE_PATH.')
```

```js
// run.js:99   [console.error]
console.error('На Windows 7 используйте Chrome 109 (последняя версия для Win7) — Chrome 110+ требует Win10/11.')
```

```js
// run.js:223   [console.log]
console.log(`Формат: ${formatArg} (${pageFormat.width} × ${pageFormat.height})`)
```

```js
// run.js:270   [console.log]
console.log('Открываю:', fileUrl)
```

```js
// run.js:273   [console.log]
console.log('Жду транскрипцию…')
```

```js
// run.js:277   [console.warn]
console.warn('Не вся транскрипция отработала.')
```

```js
// run.js:286   [console.log]
console.log('Стат-ка после транскрипции:', stats)
```

```js
// run.js:334   [throw]
throw new Error('PART-фильтр: не найдены секции глав 13/14/15');
```

```js
// run.js:350   [throw]
throw new Error('PART-фильтр: неизвестная часть ' + part);
```

```js
// run.js:355   [throw]
throw new Error('PART-фильтр: не найдены границы части ' + part);
```

```js
// run.js:459–461   [console.log]
console.log(`PART=${part}: удалено верхнеуровневых блоков чужих частей: ${removed.removed}, ` +
                        `компенсирующих якорных ссылок: ${removed.farmLinks}, ` +
                        `заглушек-целей для внешних якорей: ${removed.stubIds.length}.`)
```

```js
// run.js:956–957   [console.log]
console.log(`Подразделов: ${sectionNumbers.length}, глав в книге: ${meta.chapters.length}, ` +
                    `букв словаря: ${meta.dictLetters.length}, ToC-якорей: ${meta.tocTargets.length}`)
```

```js
// run.js:965   [console.log]
console.log('  Сохранён пост-транскрипционный HTML в кэш:', process.env.CACHE_OUT_PATH)
```

```js
// run.js:968   [console.log]
console.log('Печатаю PDF:', outputPdf)
```

```js
// run.js:1043   [console.log]
console.log(`  Multicol-перечни: ${mcCount} статей промаркировано для балансировки хвостов.`)
```

```js
// run.js:1082   [console.log]
console.log('1-й проход PDF...')
```

```js
// run.js:1095   [console.log]
console.log(`  Глава 1 на чётной стр. ${ch1Page} — вставляю пустую страницу перед ней.`)
```

```js
// run.js:1127   [console.log]
console.log(`  Колофон лёг бы на нечётную книжную страницу (локально ${dCol.page}) — вставляю пустую перед ним.`)
```

```js
// run.js:1392   [console.log]
console.log(`  Балансировка хвостов${label}: завершена, хвостов: ${total} (по печати на хвост).`)
```

```js
// run.js:1401   [console.log]
console.log(`  Балансировка хвостов${label} [${total}]: ${msg}.`)
```

```js
// run.js:1404   [console.log]
console.log(`  ⚠ Балансировка хвостов${label}: достигнут предел итераций (хвостов: ${total}).`)
```

```js
// run.js:1465   [diag.push → console.log]
diag.push(`${h.id}: НЕТ DEST`)
```

```js
// run.js:1477   [diag.push → console.log]
diag.push(`${h.id}: НЕТ UL`)
```

```js
// run.js:1601   [tailBalance() → console.log]
tailBalance(`${label} (перерезка)`)
```

```js
// run.js:1618   [console.log]
console.log(`  Висячие буквы: перенесено всего ${totalMoved}.`)
```

```js
// run.js:1678   [console.log]
console.log(`  Сироты-рубрики: сдвинуто заголовок+рубрика ${pushed} (итерация ${iter + 1})`)
```

```js
// run.js:1691   [tailBalance() → console.log]
tailBalance(' (после сирот)')
```

```js
// run.js:1813–1814   [console.log]
console.log(`  Концевая полоса: ${linesLast} строк(и) < ${MIN_END_LINES} — ` +
                    `переношу хвост с «${moved.text}…» (итерация ${iter}).`)
```

```js
// run.js:1821   [console.log]
console.log('Найдены ToC-якоря — делаю 2-й проход с номерами страниц...')
```

```js
// run.js:1838   [console.log]
console.log(`  Обновлено в HTML: ${updateCount.updated}, удалено сирот: ${updateCount.removed}`)
```

```js
// run.js:1840   [console.log]
console.log('2-й проход: финальные колонтитулы и номера...')
```

```js
// run.js:1852   [console.log]
console.log(`PART=${part}: вёрстка стабильна (${beforeInfo.numPages} стр.) — передаю управление оркестратору...`)
```

```js
// run.js:1869   [console.log]
console.log(`  ToC: обновлено ${updateCount.updated}, удалено сирот: ${updateCount.removed}. Перепечатываю часть 1...`)
```

```js
// run.js:1873–1876   [throw]
throw new Error(
                        `Вписывание номеров ToC изменило длину части 1: ` +
                        `${beforeInfo.numPages} → ${afterInfo.numPages} стр. — ` +
                        `чётности и офсеты частей недействительны.`);
```

```js
// run.js:1878   [console.log]
console.log(`  Длина части 1 стабильна: ${afterInfo.numPages} стр.`)
```

```js
// run.js:1891   [console.log]
console.log('  Страница-болванка отрезана.')
```

```js
// run.js:1895   [console.log]
console.log('Готово.')
```

```js
// run.js:1908   [console.error]
console.error('Использование: node run.js <in.html> <out.pdf> [--format=RUS]')
```

```js
// run.js:1966   [throw]
throw new Error('Не найден шрифт для колонтитулов. Положите PTSerif-Regular.ttf (приоритетно) или LiberationSerif-Regular.ttf в ./fonts/.');
```

```js
// run.js:2266   [throw]
throw new Error(`stampBook: страниц в PDF ${pages.length}, в модели ${model.totalPages} — рассинхрон частей`);
```


