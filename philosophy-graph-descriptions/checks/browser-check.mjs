import fs from 'fs';
import puppeteer from 'puppeteer-core';
const FILE = process.argv[2] || 'dist/philosophy_graph.html';
const D3 = fs.readFileSync('node_modules/d3/dist/d3.min.js', 'utf8');
const CHROME = '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';

const browser = await puppeteer.launch({executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage']});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.setRequestInterception(true);
page.on('request', r => {
  if (/d3([.]min)?[.]js/i.test(r.url())) return r.respond({status: 200, contentType: 'application/javascript', body: D3});
  if (r.url().startsWith('file://')) return r.continue();
  return r.abort();
});
await page.goto('file://' + fs.realpathSync(FILE), {waitUntil: 'domcontentloaded', timeout: 60000});
await page.waitForFunction(
  () => typeof nodes !== 'undefined' && nodes.length > 0
     && typeof generateConnectionViewContent === 'function'
     && typeof openUniversalModal === 'function', {timeout: 60000});

const probe = await page.evaluate(() => {
  const out = [];
  const loops = links.filter(l => (l.source.id || l.source) === (l.target.id || l.target));
  for (const l of loops) {
    const html = generateConnectionViewContent(l);
    const div = document.createElement('div'); div.innerHTML = html;
    const box = div.querySelector('.connection-description');
    const id = l.source.id || l.source;
    out.push({
      id, type: l.type,
      shown: box ? box.textContent.trim() : null,
      matchesData: box ? box.textContent.trim() === (l.description || '').trim() : false,
      template: box ? /рефлексивная связь: понятие отнесено/i.test(box.textContent) : false,
      hasTypeRow: /<strong>Тип:<\/strong>/.test(html),
      hasGroundRow: /<strong>Основание:<\/strong>/.test(html),
    });
  }
  return {count: loops.length, out, total: links.length, nodes: nodes.length};
});
console.log(`узлов ${probe.nodes}, связей ${probe.total}, петель ${probe.count}`);
console.log('окно связи собралось для всех петель:', probe.out.every(o => o.shown));
console.log('описание в окне совпадает с данными:', probe.out.filter(o => o.matchesData).length, 'из', probe.out.length);
console.log('осталось шаблонных описаний:', probe.out.filter(o => o.template).length);
console.log('строки «Тип»/«Основание» рядом с описанием:',
  probe.out.filter(o => o.hasTypeRow).length, '/', probe.out.filter(o => o.hasGroundRow).length);
console.log('\nтри образца:');
for (const o of [probe.out[0], probe.out[11], probe.out[22]].filter(Boolean))
  console.log(`  [${o.type}] ${o.id}: ${o.shown.slice(0, 90)}…`);
console.log('\nошибок страницы:', errors.length);
errors.slice(0, 5).forEach(e => console.log('  ' + e));
await browser.close();
process.exit(errors.length ? 1 : 0);
