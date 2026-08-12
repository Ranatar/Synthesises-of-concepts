// Проба окна концепции в Chrome.
//   node checks/browser-concepts.mjs <файл.html> <edits.json> [...]
//
// Проверяется то же, что и на ветви связей: окно действительно выводит текст,
// совпадающий с данными, и страница при этом не падает. Выводится
// generateConceptViewContent — та же функция, что вызывается по щелчку.
// Дополнительно сверяется массив nodes: он строится из concepts, и если
// правка не доехала до него, окно покажет старое.
import fs from 'fs';
import puppeteer from 'puppeteer-core';

const FILE = process.argv[2];
const D3 = fs.readFileSync('node_modules/d3/dist/d3.min.js', 'utf8');
const CHROME = '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const EDITS = process.argv.slice(3)
  .flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')).edits);
const IDS = [...new Set(EDITS.map(e => e.id))];

const browser = await puppeteer.launch({executablePath: CHROME,
  args: ['--no-sandbox', '--disable-dev-shm-usage']});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.setRequestInterception(true);
page.on('request', r => {
  if (/d3([.]min)?[.]js/i.test(r.url()))
    return r.respond({status: 200, contentType: 'application/javascript', body: D3});
  if (r.url().startsWith('file://')) return r.continue();
  return r.abort();
});
await page.goto('file://' + fs.realpathSync(FILE), {waitUntil: 'domcontentloaded', timeout: 60000});
await page.waitForFunction(
  () => typeof nodes !== 'undefined' && nodes.length > 0
     && typeof concepts !== 'undefined'
     && typeof generateConceptViewContent === 'function',
  {timeout: 60000});

const res = await page.evaluate(ids => {
  const out = [];
  for (const id of ids) {
    const c = concepts.find(c => c.id === id);
    if (!c) { out.push({id, found: false}); continue; }
    const n = nodes.find(n => n.id === id);
    // окну нужна запись из nodes: там имя философа лежит в поле concept,
    // тогда как в concepts стоит его идентификатор в поле philosopher
    const div = document.createElement('div');
    div.innerHTML = generateConceptViewContent(n || c);
    const box = div.querySelector('.description');
    const shown = box ? box.textContent.trim() : null;
    out.push({
      id, found: true,
      // окно печатает абзац
      extMatches: shown === (c.extendedDescription || '').trim(),
      // массив nodes собран из concepts — оба поля обязаны совпасть
      nodeSync: !!n
        && (n.extendedDescription || '') === (c.extendedDescription || '')
        && (n.description || '') === (c.description || ''),
      // метка и имя философа печатаются рядом: обоснование П4
      headHasLabel: div.textContent.includes(c.label),
    });
  }
  return out;
}, IDS);

console.log('концепций захода проверено:', res.length);
console.log('найдено в графе:', res.filter(r => r.found).length);
console.log('абзац выведен и совпадает с данными:', res.filter(r => r.extMatches).length);
console.log('массив nodes согласован с concepts:', res.filter(r => r.nodeSync).length);
console.log('метка напечатана над абзацем:', res.filter(r => r.headHasLabel).length);
for (const r of res.filter(r => !r.extMatches || !r.nodeSync).slice(0, 5))
  console.log('  расхождение:', r.id);
console.log('ошибок страницы:', errors.length);
errors.slice(0, 3).forEach(e => console.log('  ' + e));
await browser.close();
process.exitCode = (res.every(r => r.found && r.extMatches && r.nodeSync) && !errors.length) ? 0 : 1;
