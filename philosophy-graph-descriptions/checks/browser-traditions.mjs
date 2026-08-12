// Проба поля традиций в живой странице: справочник и поле должны быть видны
// сценарию страницы, а сама страница — работать без ошибок.
import fs from 'fs';
import puppeteer from 'puppeteer-core';
const D3 = fs.readFileSync('node_modules/d3/dist/d3.min.js', 'utf8');
const CHROME = '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const [file, editsFile] = process.argv.slice(2);
const E = JSON.parse(fs.readFileSync(editsFile, 'utf8'));
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
await page.waitForFunction(
  () => typeof philosophers !== 'undefined' && philosophers.length > 0
        && typeof traditions !== 'undefined', {timeout: 60000});
const res = await page.evaluate(() => ({
  dict: traditions.map(t => t.id),
  named: traditions.every(t => t.name && t.description),
  field: philosophers.map(p => [p.id, p.traditions || []]),
}));
const want = E.traditions.map(t => t.id);
const wantBy = Object.fromEntries(E.assignments.map(a => [a.id, a.traditions]));
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
console.log('справочник виден странице:', res.dict.length, 'из', want.length,
  same(res.dict, want) ? '(состав и порядок совпадают)' : '!! РАСХОЖДЕНИЕ');
console.log('у всех традиций есть имя и пояснение:', res.named ? 'да' : '!! НЕТ');
const ok = res.field.filter(([id, tl]) => wantBy[id] && same(tl, wantBy[id]));
console.log('поле совпадает с правками:', ok.length, 'из', res.field.length);
const closed = res.field.every(([, tl]) => tl.length && tl.every(t => want.includes(t)));
console.log('всякая ссылка внутри словаря и состав непуст:', closed ? 'да' : '!! НЕТ');
console.log('ошибок страницы:', errors.length);
errors.slice(0, 3).forEach(e => console.log('   ' + e.slice(0, 160)));
await browser.close();
process.exit(errors.length || !closed || ok.length !== res.field.length ? 1 : 0);
