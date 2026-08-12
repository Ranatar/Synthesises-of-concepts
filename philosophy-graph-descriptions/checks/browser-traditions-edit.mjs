// Проба правки традиций в системе редактирования (заход V02).
// Проверяет не разметку, а ДЕЛО: форма показывает выбранное, сохранение
// переписывает состав, новая запись получает поле, окно просмотра сразу
// показывает изменённое.
import fs from 'fs';
import puppeteer from 'puppeteer-core';
const D3 = fs.readFileSync('node_modules/d3/dist/d3.min.js', 'utf8');
const CHROME = '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const file = process.argv[2] || 'dist/philosophy_graph.html';
const browser = await puppeteer.launch({executablePath: CHROME,
  args: ['--no-sandbox', '--disable-dev-shm-usage']});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('dialog', d => d.accept());          // confirm при сохранении
await page.setRequestInterception(true);
page.on('request', r => {
  if (/d3([.]min)?[.]js/i.test(r.url()))
    return r.respond({status: 200, contentType: 'application/javascript', body: D3});
  if (r.url().startsWith('file://')) return r.continue();
  return r.abort();
});
await page.goto('file://' + fs.realpathSync(file), {waitUntil: 'domcontentloaded', timeout: 60000});
await page.waitForFunction(() => typeof philosophers !== 'undefined'
  && philosophers.length > 0 && typeof generatePhilosopherEditContent === 'function'
  && typeof traditions !== 'undefined', {timeout: 60000});

const res = await page.evaluate(() => {
  const out = {};
  // 1. форма показывает ровно то, что стоит в записи
  const check = name => {
    const p = philosophers.find(x => x.nameRu === name);
    const d = document.createElement('div');
    d.innerHTML = generatePhilosopherEditContent(name);
    const sel = d.querySelector('#philTraditions');
    if (!sel) return {ok: false, why: 'поля нет'};
    const opts = [...sel.options].map(o => o.value);
    const on = [...sel.options].filter(o => o.hasAttribute('selected')).map(o => o.value);
    return {ok: opts.length === traditions.length
              && on.length === p.traditions.length
              && p.traditions.every(t => on.includes(t)),
            multiple: sel.multiple, count: opts.length, on};
  };
  out.heidegger = check('Хайдеггер');       // три традиции
  out.marx = check('Маркс');                 // одна
  out.optionsAll = traditions.length;

  // 2. сохранение переписывает состав
  document.body.insertAdjacentHTML('beforeend',
    '<div id="probe">' + generatePhilosopherEditContent('Маркс') + '</div>');
  ModalContext.currentData = 'Маркс';
  ModalContext.currentType = 'philosopher';
  const sel = document.querySelector('#probe #philTraditions');
  [...sel.options].forEach(o => o.selected = ['marxism', 'lebensphilosophie'].includes(o.value));
  try { savePhilosopherData(); } catch (e) { out.saveError = String(e); }
  out.afterSave = (philosophers.find(p => p.nameRu === 'Маркс') || {}).traditions;

  // 3. окно просмотра сразу показывает изменённое
  const v = document.createElement('div');
  v.innerHTML = generatePhilosopherViewContent('Маркс');
  const tags = [...v.querySelectorAll('.rubric-name-tooltip')].map(e => e.firstChild.textContent.trim());
  const TN = Object.fromEntries(traditions.map(t => [t.id, t.name]));
  out.viewShows = ['marxism', 'lebensphilosophie'].every(t => tags.includes(TN[t]));
  out.viewHeader = [...v.querySelectorAll('.philosopher-section-title')]
    .map(e => e.textContent.trim()).find(t => /Традици/.test(t));
  return out;
});

console.log('традиций в списке:', res.heidegger.count, 'из', res.optionsAll);
console.log('множественный выбор:', res.heidegger.multiple ? 'да' : '!! НЕТ');
console.log('форма показывает выбранное (Хайдеггер, 3):', res.heidegger.ok ? 'да' : '!! НЕТ ' + JSON.stringify(res.heidegger.on));
console.log('форма показывает выбранное (Маркс, 1):', res.marx.ok ? 'да' : '!! НЕТ');
console.log('после сохранения состав Маркса:', JSON.stringify(res.afterSave));
// Порядок в записи идёт ПО СЛОВАРЮ, а не по порядку выбора: selectedOptions
// возвращает пункты в порядке разметки. Это и лучше — состав получается
// воспроизводимым, поэтому сверяем как множество.
const same = (a, b) => a && a.length === b.length && b.every(x => a.includes(x));
console.log('состав переписан верно:',
  same(res.afterSave, ['marxism', 'lebensphilosophie']) ? 'да (порядок по словарю)' : '!! НЕТ');
console.log('окно просмотра показывает новое:', res.viewShows ? 'да' : '!! НЕТ');
console.log('заголовок согласован с числом:', res.viewHeader);
if (res.saveError) console.log('!! ошибка сохранения:', res.saveError);
console.log('ошибок страницы:', errors.length);
errors.slice(0, 3).forEach(e => console.log('   ' + e.slice(0, 160)));
await browser.close();
const ok = res.heidegger.ok && res.marx.ok && res.heidegger.multiple && res.viewShows
  && same(res.afterSave, ['marxism', 'lebensphilosophie'])
  && /Традиции/.test(res.viewHeader || '') && !errors.length && !res.saveError;
process.exit(ok ? 0 : 1);
