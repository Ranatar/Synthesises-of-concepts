// Проба окна философа в Chrome.
//   node checks/browser-philosophers.mjs <файл.html> <edits.json> [...]
//
// Проверяется: окно выводит описание, совпадающее с данными; РАЗБИВКА НА
// АБЗАЦЫ сохранена (вывод превращает \n\n в разрыв строки); имя и плашка с
// годами напечатаны над описанием — то самое, ради чего введены Ф3–Ф5;
// разделы «взаимодействия» и «концепции» на месте; ошибок страницы нет.
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
  () => typeof philosophers !== 'undefined' && philosophers.length > 0
     && typeof generatePhilosopherViewContent === 'function',
  {timeout: 60000});

const res = await page.evaluate(ids => {
  const out = [];
  for (const id of ids) {
    const p = philosophers.find(p => p.id === id);
    if (!p) { out.push({id, found: false}); continue; }
    const div = document.createElement('div');
    div.innerHTML = generatePhilosopherViewContent(p.nameRu);
    const box = div.querySelector('.description');
    // ОБРАТНАЯ РАЗВЁРТКА. Сверять по textContent нельзя: вывод превращает
    // \n\n в <br><br>, а textContent у <br> пуст — абзацы слипаются без
    // разделителя, и сравнение всегда даёт ложное расхождение. Поэтому берём
    // innerHTML и возвращаем разрывы обратно в переводы строк.
    const shown = box ? box.innerHTML.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n').trim() : null;
    const flat = s => (s || '').replace(/[ \t]+/g, ' ').trim();
    out.push({
      id, found: true,
      descMatches: flat(shown) === flat(p.description),
      // разбивка: сколько разрывов вывелось против числа абзацев
      breaks: box ? box.querySelectorAll('br').length : -1,
      wantBreaks: (p.description.split(/\n\n+/).length - 1) * 2,
      headHasName: div.textContent.includes(p.nameRu),
      headHasYears: div.textContent.includes(p.years),
      // Признак берётся по ЗАГОЛОВКУ раздела, а не по словам в строках.
      // Прежний список основ (влияни|критиков|полемиз|Типологически) подобран
      // по частному случаю и промахивался: у Карнапа строки читаются
      // «Развивал концепции», «Противостоял», «Взаимная полемика»,
      // «Взаимная критика» — ни одна основа не совпадает, хотя раздел на месте.
      hasInteractions: [...div.querySelectorAll('.philosopher-section-title')]
        .some(e => /Взаимодействие/i.test(e.textContent)),
      hasConcepts: /Концепции философа/i.test(div.textContent),
    });
  }
  return out;
}, IDS);

const ok = r => r.found && r.descMatches && r.breaks === r.wantBreaks;
console.log('философов захода проверено:', res.length);
console.log('найдено в данных:', res.filter(r => r.found).length);
console.log('описание выведено и совпадает:', res.filter(r => r.descMatches).length);
console.log('разбивка на абзацы сохранена:', res.filter(r => r.breaks === r.wantBreaks).length);
console.log('имя напечатано над описанием:', res.filter(r => r.headHasName).length);
console.log('плашка с годами напечатана:', res.filter(r => r.headHasYears).length);
console.log('раздел взаимодействий выведен:', res.filter(r => r.hasInteractions).length);
console.log('раздел концепций выведен:', res.filter(r => r.hasConcepts).length);
for (const r of res.filter(r => !ok(r)).slice(0, 5))
  console.log('  расхождение:', r.id, JSON.stringify(r));
console.log('ошибок страницы:', errors.length);
errors.slice(0, 3).forEach(e => console.log('  ' + e));
await browser.close();
process.exitCode = (res.every(ok) && !errors.length) ? 0 : 1;
