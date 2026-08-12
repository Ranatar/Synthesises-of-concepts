// Сборка файла правок захода Ф07 (§ 11 спецификации). Запускать ИЗ КОРНЯ:
//   node batches/F07-leveling/mkedits.mjs
// Приговор fix: прежний текст неприкосновенен, правка только ДОПИСЫВАЕТ.
// Условие проведено механически — см. заставу ниже: все прежние абзацы
// обязаны уцелеть дословно и в прежнем порядке, иначе сборка отказывается.
import fs from 'fs';
import crypto from 'crypto';
import {ADD} from './texts.mjs';
import {PHILS} from './context.mjs';

const HTML = 'dist/philosophy_graph.html';
const MIN = 1800, MAX = 2600, PMIN = 4, PMAX = 7, TARGET = 2350;
const src = fs.readFileSync(HTML, 'utf8');
function grab(name) {
  const m = new RegExp('const\\s+' + name + '\\s*=\\s*\\[').exec(src);
  let i = src.indexOf('[', m.index), depth = 0, j = i, inStr = null, esc = false;
  for (; j < src.length; j++) {
    const ch = src[j];
    if (inStr) { if (esc) { esc = false; continue; } if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '/' && src[j + 1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
    if (ch === '[') depth++; else if (ch === ']') { depth--; if (!depth) { j++; break; } }
  }
  return new Function('return (' + src.slice(i, j) + ')')();
}
const philosophers = grab('philosophers');
const BY = Object.fromEntries(philosophers.map(p => [p.id, p]));
const md5 = crypto.createHash('md5').update(fs.readFileSync(HTML)).digest('hex');
const L = s => [...s].length;

const missing = PHILS.filter(id => !ADD[id]);
const extra = Object.keys(ADD).filter(id => !PHILS.includes(id));
if (missing.length) { console.log('БЕЗ ПРИПИСКИ:', missing); process.exitCode = 1; }
if (extra.length) { console.log('ЛИШНИЕ:', extra); process.exitCode = 1; }

let fail = 0;
const edits = [];
for (const id of PHILS) {
  const p = BY[id];
  if (!p) { console.log('НЕТ ТАКОГО ФИЛОСОФА:', id); fail++; continue; }
  const old = p.description;
  const oldParas = old.split(/\n\n+/);
  const {at, para} = ADD[id];
  if (!(at >= 0 && at <= oldParas.length)) {
    console.log(`!! ${id}: at=${at} вне числа абзацев (${oldParas.length})`); fail++; continue;
  }
  const newParas = [...oldParas.slice(0, at), para.trim(), ...oldParas.slice(at)];
  const nw = newParas.join('\n\n');

  // ЗАСТАВА ДОСЛОВНОСТИ: снимаем вставленный абзац и требуем ПОЛНОГО совпадения
  // с прежним текстом. Так «дописал» нельзя незаметно подменить на «переписал».
  const back = newParas.filter((_, k) => k !== at).join('\n\n');
  if (back !== old) { console.log(`!! ${id}: прежний текст изменён, а не дополнен`); fail++; continue; }
  if (newParas.length !== oldParas.length + 1) { console.log(`!! ${id}: абзац не добавился`); fail++; continue; }

  const n = L(nw), np = newParas.length;
  if (n < TARGET) { console.log(`!! ${id}: ${n} — не дотянуло до цели ${TARGET}`); fail++; }
  if (n > MAX || n < MIN) { console.log(`!! ${id}: ${n} вне коридора ${MIN}-${MAX}`); fail++; }
  if (np < PMIN || np > PMAX) { console.log(`!! ${id}: абзацев ${np} вне ${PMIN}-${PMAX}`); fail++; }

  edits.push({id, verdict: 'fix', criteria: ['Ф6', 'Ф7', 'Ф8', 'Ф9'],
    philosopher: p.nameRu, old, new: nw,
    note: `дописан абзац (${L(para.trim())} знаков), прежний текст сохранён дословно`});
}
if (fail) { console.log('ОТКАЗ СБОРКИ: замечаний', fail); process.exit(1); }

fs.writeFileSync('edits/batch-F07-leveling.json', JSON.stringify({meta: {
  batch: 'F07',
  title: 'Выравнивание объёма: приписки по существу',
  spec: 'philosophers-revision-spec.md', specRevision: 3,
  target: 'philosophy_graph.html', targetMd5: md5,
  created: '2026-08-12', layer: 'philosophers',
  count: edits.length
}, edits}, null, 2) + '\n');

const v = {};
for (const e of edits) v[e.verdict] = (v[e.verdict] || 0) + 1;
console.log('философов:', PHILS.length, '| записей правок:', edits.length, JSON.stringify(v));
console.log('объём:', edits.map(e => L(e.old) + '→' + L(e.new)).join(', '));
console.log('md5 входа:', md5);
