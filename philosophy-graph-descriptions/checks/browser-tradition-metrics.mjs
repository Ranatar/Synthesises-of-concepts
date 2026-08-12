// Проба метрики межтрадиционной мостовости и отбора пар по традициям (V05).
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
await page.waitForFunction(() => typeof traditionBridgingIndex === 'function'
  && typeof nodes !== 'undefined' && nodes.length > 0, {timeout: 60000});

const r = await page.evaluate(() => {
  initializePhilosophyMetrics();
  const all = nodes.map(n => ({ id: n.id, label: n.label, phil: n.concept,
                                m: traditionBridgingIndex(n.id) }));
  const scored = all.filter(x => x.m.total > 0);
  const below = all.filter(x => x.m.belowThreshold);
  // проверка соответствия формуле: доля должна согласоваться со связями
  // Доля считается ПО ВЕСАМ, как и сама величина, поэтому сверяем её с
  // величиной, а не со счётом связей: у весов 1..3 они расходятся.
  const consistent = all.every(x => x.m.belowThreshold
    || Math.abs(x.m.total - x.m.share / 10) <= 0.051);   // доля округлена до целых процентов: полпроцента = 0.05
  // ниже порога — всегда ноль
  const zeroBelow = below.every(x => x.m.total === 0);
  // ПРОВЕРКА НА ВЫРОЖДЕННОСТЬ. Ровно эта ошибка и случилась: поле традиций
  // не было внесено в проекцию, на которой работают метрики, у всех философов
  // список традиций оказался пуст, общих не находилось ни у кого — и метрика
  // дала ровно 100 % у всех 293 концепций. Прочие проверки это пропустили:
  // формула была внутренне согласна сама с собой.
  const vals = scored.map(x => x.m.total);
  const spread = vals.length ? Math.max(...vals) - Math.min(...vals) : 0;
  const allFull = vals.length > 0 && vals.every(v => v >= 9.99);
  const top = scored.slice().sort((a, b) => b.m.total - a.m.total).slice(0, 5)
    .map(x => `${x.label} (${x.phil}) ${x.m.share}% из ${x.m.externalLinks}`);
  const bottom = scored.slice().sort((a, b) => a.m.total - b.m.total).slice(0, 3)
    .map(x => `${x.label} ${x.m.share}%`);
  // вид метрики строится
  const html = generateBridgingContent();
  // мостовость должна стоять в профиле концепции
  const inProfile = PROFILE_METRICS.some(m => m[0] === 'bridging');
  // Порядок РАВНЫХ читается из НАСТОЯЩЕГО вывода вида, а не из массива,
  // отсортированного тут же: сортировать самому и сверять со своей же
  // сортировкой — проверка пустая, она не может не сойтись.
  const box = document.createElement('div');
  box.innerHTML = html;
  const shown = [...box.querySelectorAll('.metric-result-name')].map(e => e.textContent.trim());
  const byLabel = {};
  all.forEach(x => { byLabel[x.label] = x.m; });
  let tieOk = true, tieChecked = 0;
  for (let i = 1; i < shown.length; i++) {
    const a = byLabel[shown[i-1]], b = byLabel[shown[i]];
    if (!a || !b) continue;
    if (Math.abs(a.total - b.total) < 1e-9) {
      tieChecked++;
      if (b.crossingLinks > a.crossingLinks) tieOk = false;
    }
  }
  const saturated = all.filter(x => x.m.total >= 9.999).length;
  // отбор пар по традициям
  const philOfLocal = {};
  concepts.forEach(c => philOfLocal[c.id] = c.philosopher);
  return { total: all.length, scored: scored.length, below: below.length,
           consistent, zeroBelow, top, bottom,
           spread, allFull, inProfile, tieOk, tieChecked, saturated, shownCount: shown.length,
           htmlOk: /Межтрадиционная мостовость/.test(html),
           hasDescription: /РАЗМЕТКУ традиций/.test(generateMetricDescriptionBlock('bridging')),
           inMenu: !!document.querySelector('[onclick="switchStatsView(\'bridging\')"]'),
           syntheticDesc: metricDescriptions['synthetic'].description,
           pairsFlagExists: typeof _pairsCrossTradition !== 'undefined' };
});

console.log('концепций всего: ' + r.total + ', с ненулевой мостовостью: ' + r.scored
  + ', ниже порога: ' + r.below);
console.log('доля согласуется с величиной: ' + (r.consistent ? 'да' : '!! НЕТ'));
console.log('ниже порога всегда ноль: ' + (r.zeroBelow ? 'да' : '!! НЕТ'));
console.log('величина не вырождена: ' + (r.allFull ? '!! НЕТ, у всех 100 %' : 'да')
  + ' (размах ' + r.spread.toFixed(1) + ' из 10)');
console.log('верх: ' + r.top.join('; '));
console.log('низ:  ' + r.bottom.join('; '));
console.log('стоит в профиле концепции: ' + (r.inProfile ? 'да' : '!! НЕТ'));
console.log('на потолке (доля 100 %): ' + r.saturated
  + ' | в выводе строк: ' + r.shownCount + ', пар с равным значением: ' + r.tieChecked
  + ' — порядок между ними по числу связей: ' + (r.tieOk ? 'да' : '!! НЕТ'));
console.log('вид метрики строится: ' + (r.htmlOk ? 'да' : '!! НЕТ')
  + ' | пункт в меню: ' + (r.inMenu ? 'да' : '!! НЕТ'));
console.log('в формуле сказано про разметку: ' + (r.hasDescription ? 'да' : '!! НЕТ'));
console.log('описание синтетичности: ' + r.syntheticDesc);
console.log('флаг отбора пар заведён: ' + (r.pairsFlagExists ? 'да' : '!! НЕТ'));
console.log('ошибок страницы: ' + errors.length);
errors.slice(0, 3).forEach(e => console.log('   ' + e.slice(0, 160)));
await browser.close();
const ok = r.consistent && r.zeroBelow && !r.allFull && r.spread > 1 && r.inProfile && r.tieOk && r.tieChecked > 0 && r.htmlOk && r.inMenu && r.hasDescription
  && r.pairsFlagExists && !/разные традиции/.test(r.syntheticDesc) && !errors.length;
process.exit(ok ? 0 : 1);
