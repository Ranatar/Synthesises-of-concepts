// Сборка файла правок захода Ф01. Запускать ИЗ КОРНЯ:
//   node batches/F02-anselm-berkeley/mkedits.mjs
// Читает old из dist/philosophy_graph.html — значит dist обязан стоять в
// состоянии ДО этого захода (грабля ветви связей).
import fs from 'fs';
import crypto from 'crypto';
import {TEXTS} from './texts.mjs';
import {PHILS} from './context.mjs';

const HTML = 'dist/philosophy_graph.html';
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

const missing = PHILS.filter(id => !TEXTS[id]);
const extra = Object.keys(TEXTS).filter(id => !PHILS.includes(id));
if (missing.length) { console.log('БЕЗ ТЕКСТА:', missing); process.exitCode = 1; }
if (extra.length) { console.log('ЛИШНИЕ:', extra); process.exitCode = 1; }

const edits = [];
for (const id of PHILS) {
  const p = BY[id];
  if (!p) { console.log('НЕТ ТАКОГО ФИЛОСОФА:', id); process.exitCode = 1; continue; }
  const parts = TEXTS[id];
  if (!parts) continue;
  // склейка ДВОЙНЫМ переводом строки — одиночный запрещён инвариантом
  const nw = parts.map(s => s.trim()).join('\n\n');
  if (nw === p.description) {
    edits.push({id, verdict: 'keep', criteria: [], philosopher: p.nameRu,
      old: p.description, note: 'описание годно как есть'});
    continue;
  }
  edits.push({id, verdict: 'rewrite',
    criteria: ['Ф3', 'Ф4', 'Ф5', 'Ф6', 'Ф7', 'Ф8', 'Ф10'],
    philosopher: p.nameRu, old: p.description, new: nw});
}

fs.writeFileSync('edits/batch-F02-anselm-berkeley.json', JSON.stringify({meta: {
  batch: 'F02',
  title: 'Описания философов: Ансельм — Беркли',
  spec: 'philosophers-revision-spec.md', specRevision: 2,
  target: 'philosophy_graph.html', targetMd5: md5,
  created: '2026-08-12', layer: 'philosophers',
  count: edits.length
}, edits}, null, 2) + '\n');

const v = {};
for (const e of edits) v[e.verdict] = (v[e.verdict] || 0) + 1;
console.log('философов:', PHILS.length, '| записей правок:', edits.length, JSON.stringify(v));
console.log('md5 входа:', md5);
