// Проба переходов между традициями в цепочке пути (заход V04).
// Проверяются: ноль переходов, один, несколько, ВОЗВРАТ в прежнюю традицию
// (различных традиций и переходов считаются порознь), внутрисистемное ребро
// (перехода нет по определению) и случай двух общих традиций (Локк — Юм).
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
await page.waitForFunction(() => typeof analyzePathTraditions === 'function'
  && typeof nodes !== 'undefined' && nodes.length > 0, {timeout: 60000});

const r = await page.evaluate(() => {
  const byPhil = name => nodes.filter(n => n.concept === name);
  const mk = names => names.map(n => byPhil(n)[0]);
  const A = p => analyzePathTraditions(p);
  const out = {};
  // 0 переходов: внутри одной системы
  out.internal = A(byPhil('Кант').slice(0, 3));
  // 0 переходов: разные философы, общая традиция (оба в немецком идеализме)
  out.shared = A(mk(['Кант', 'Гегель']));
  // две общие традиции: Локк и Юм — эмпиризм и Просвещение
  out.two = A(mk(['Локк', 'Юм']));
  // один переход
  out.one = A(mk(['Гуссерль', 'Уиллард Куайн']));
  // несколько переходов
  out.many = A(mk(['Платон', 'Кант', 'Гуссерль', 'Фуко']));
  // ВОЗВРАТ в прежнюю традицию
  out.back = A(mk(['Гуссерль', 'Уиллард Куайн', 'Мерло-Понти']));
  out.backPhils = ['Гуссерль', 'Уиллард Куайн', 'Мерло-Понти']
    .map(n => (philosopherTraditions[n] || []).join('+'));
  return out;
});

const show = (t, o, want) => {
  const kinds = o.segments.map(s => s.kind).join(', ');
  const ok = o.crossings === want;
  console.log((ok ? '  ' : '!!') + t.padEnd(34)
    + 'переходов ' + o.crossings + ' (ждали ' + want + '), различных традиций '
    + o.distinct + ' | сегменты: ' + kinds);
  return ok;
};
let ok = true;
ok = show('внутри одной системы', r.internal, 0) && ok;
ok = show('общая традиция (Кант→Гегель)', r.shared, 0) && ok;
ok = show('две общие (Локк→Юм)', r.two, 0) && ok;
console.log('     общие у Локка и Юма: ' + (r.two.segments[0].shared || []).join(', '));
ok = show('один переход', r.one, 1) && ok;
ok = show('несколько переходов', r.many, 3) && ok;
ok = show('ВОЗВРАТ в прежнюю традицию', r.back, 2) && ok;
console.log('     состав: ' + r.backPhils.join(' | '));
const backOk = r.back.crossings === 2 && r.back.distinct === 2;
console.log('     переходов 2 при 2 различных традициях: ' + (backOk ? 'да' : '!! НЕТ'));
console.log('     названы обе стороны перехода: '
  + (r.one.segments[0].from.length && r.one.segments[0].to.length ? 'да' : '!! НЕТ')
  + ' — ' + r.one.segments[0].from.join(', ') + ' → ' + r.one.segments[0].to.join(', '));
console.log('ошибок страницы: ' + errors.length);
errors.slice(0, 3).forEach(e => console.log('   ' + e.slice(0, 160)));
await browser.close();
process.exit(ok && backOk && !errors.length ? 0 : 1);
