// Проба отбора по традициям (заход V03). Проверяет ровно те сценарии,
// которые разбирались при выборе модели А, и два новых режима.
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
await page.setRequestInterception(true);
page.on('request', r => {
  if (/d3([.]min)?[.]js/i.test(r.url()))
    return r.respond({status: 200, contentType: 'application/javascript', body: D3});
  if (r.url().startsWith('file://')) return r.continue();
  return r.abort();
});
await page.goto('file://' + fs.realpathSync(file), {waitUntil: 'domcontentloaded', timeout: 60000});
await page.waitForFunction(() => typeof selectedTraditions !== 'undefined'
  && typeof FilterModes !== 'undefined' && typeof links !== 'undefined'
  && links.length > 0, {timeout: 60000});

const r = await page.evaluate(() => {
  const out = {};
  const PS = 'poststructuralism';
  const members = philosophers.filter(p => (p.traditions || []).includes(PS)).map(p => p.nameRu);
  const all = new Set(Object.keys(philosopherConcepts));
  const visible = () => {
    const s = new Set();
    links.filter(FilterModes[filterMode].linkFilter).forEach(l => {
      s.add(l.source.concept); s.add(l.target.concept); });
    return [...s].sort();
  };
  const reset = () => { selectedPhilosophers = new Set(all);
    selectedTraditions = new Set(traditions.map(t => t.id)); filterMode = 'all'; };

  out.members = members;
  // 1. все философы + только одна традиция
  reset(); selectedTraditions = new Set([PS]);
  out.s1 = visible();
  // 2. сняты все философы + традиция
  reset(); selectedPhilosophers = new Set(); selectedTraditions = new Set([PS]);
  out.s2 = visible();
  // 3. часть философов, среди них двое из традиции
  reset(); selectedPhilosophers = new Set(['Фуко', 'Жак Деррида', 'Кант', 'Гегель']);
  selectedTraditions = new Set([PS]);
  out.s3 = visible();
  // 4. традиция + снят один её представитель
  reset(); selectedTraditions = new Set([PS]);
  selectedPhilosophers.delete('Жак Лакан');
  out.s4 = visible();
  out.s4tradStillOn = selectedTraditions.has(PS);
  // 5. кнопка «только эти» после того, как сняли всех
  reset(); selectedPhilosophers = new Set(); onlyTradition(PS);
  out.s5 = [...selectedPhilosophers].sort();
  // 6. кнопка «+» дважды и в обратном порядке — набор тот же
  reset(); selectedPhilosophers = new Set();
  addTradition('phenomenology'); addTradition(PS);
  const a = [...selectedPhilosophers].sort();
  selectedPhilosophers = new Set();
  addTradition(PS); addTradition('phenomenology');
  out.s6same = JSON.stringify(a) === JSON.stringify([...selectedPhilosophers].sort());
  // 7. философ без традиций не исчезает
  reset();
  philosopherTraditions['Кант'] = [];
  selectedTraditions = new Set([PS]);
  out.s7kant = visible().includes('Кант');
  rebuildPhilosopherTraditions();
  // 8. два новых режима
  reset(); filterMode = 'within_traditions';
  const w = links.filter(FilterModes.within_traditions.linkFilter);
  filterMode = 'between_traditions';
  const b = links.filter(FilterModes.between_traditions.linkFilter);
  filterMode = 'all';
  const ext = links.filter(l => l.source.concept !== l.target.concept);
  out.within = w.length; out.between = b.length; out.external = ext.length;
  out.overlap = w.filter(l => b.includes(l)).length;
  out.withinAllShare = w.every(l => {
    const s = philTraditionsSelected(l.source.concept);
    const t = philTraditionsSelected(l.target.concept);
    return s.some(x => t.includes(x)); });
  out.betweenNoneShare = b.every(l => {
    const s = philTraditionsSelected(l.source.concept);
    const t = philTraditionsSelected(l.target.concept);
    return !s.some(x => t.includes(x)); });
  // 9. режимы слушаются панели традиций
  selectedTraditions = new Set([PS]);
  filterMode = 'within_traditions';
  out.withinPSonly = links.filter(FilterModes.within_traditions.linkFilter).length;
  reset();
  return out;
});

const eq = (a, b) => JSON.stringify(a) === JSON.stringify([...b].sort());
console.log('постструктуралистов в базе:', r.members.length, '—', r.members.join(', '));
console.log('1. все философы + одна традиция →', r.s1.length, 'философов:', eq(r.s1, r.members) ? 'ровно они' : '!! ' + r.s1);
console.log('2. сняты все философы + традиция →', r.s2.length === 0 ? 'пусто (как и следует)' : '!! ' + r.s2);
console.log('3. часть философов ∩ традиция →', r.s3.join(', '), eq(r.s3, ['Фуко', 'Жак Деррида']) ? '(пересечение)' : '!!');
console.log('4. традиция минус Лакан →', r.s4.length, 'философов:', r.s4.join(', '), '| галочка традиции цела:', r.s4tradStillOn ? 'да' : '!! НЕТ');
console.log('5. кнопка «=» после снятия всех →', eq(r.s5, r.members) ? 'набор стал ровно традицией' : '!! ' + r.s5);
console.log('6. «+» в обратном порядке даёт тот же набор:', r.s6same ? 'да' : '!! НЕТ');
console.log('7. философ без традиций не исчезает:', r.s7kant ? 'да' : '!! НЕТ');
console.log('8. режимы: внутри', r.within, '+ между', r.between, '= ', r.within + r.between,
            '| всех межфилософских', r.external, '| пересечение', r.overlap);
console.log('   в «внутри» все делят традицию:', r.withinAllShare ? 'да' : '!! НЕТ',
            '| в «между» ни одна не общая:', r.betweenNoneShare ? 'да' : '!! НЕТ');
console.log('9. «внутри» при одной выбранной традиции:', r.withinPSonly, 'связей');
console.log('ошибок страницы:', errors.length);
errors.slice(0, 3).forEach(e => console.log('   ' + e.slice(0, 160)));
await browser.close();
const ok = eq(r.s1, r.members) && r.s2.length === 0 && eq(r.s3, ['Фуко', 'Жак Деррида'])
  && !r.s4.includes('Жак Лакан') && r.s4tradStillOn && eq(r.s5, r.members) && r.s6same && r.s7kant
  && r.overlap === 0 && r.withinAllShare && r.betweenNoneShare && !errors.length;
process.exit(ok ? 0 : 1);
