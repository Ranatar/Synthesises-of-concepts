import fs from 'fs';
import crypto from 'crypto';
import {TEXTS} from './texts.mjs';

const HTML = 'dist/philosophy_graph.html';
const PHILS = ['whitehead', 'russell', 'cassirer', 'wittgenstein'];
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
const concepts = grab('concepts');
const philosophers = grab('philosophers');
const PH = Object.fromEntries(philosophers.map(p => [p.id, p.nameRu]));
const md5 = crypto.createHash('md5').update(fs.readFileSync(HTML)).digest('hex');

const mine = concepts.filter(c => PHILS.includes(c.philosopher));
const missing = mine.filter(c => !TEXTS[c.id]).map(c => c.id);
const extra = Object.keys(TEXTS).filter(id => !mine.some(c => c.id === id));
if (missing.length) { console.log('БЕЗ ТЕКСТА:', missing); process.exitCode = 1; }
if (extra.length) { console.log('ЛИШНИЕ:', extra); process.exitCode = 1; }

const FIELDS = ['description', 'extendedDescription'];
const edits = [];
for (const c of mine) {
  const t = TEXTS[c.id];
  for (const field of FIELDS) {
    const nw = t[field];
    const old = c[field] || '';
    if (nw === null || nw === undefined) {
      // поле признано годным: приговор keep, файл правок обязан его перечислить
      edits.push({id: c.id, field, verdict: 'keep', criteria: ['П10'],
        concept: c.label, philosopher: PH[c.philosopher], old,
        note: 'подпись годна как есть'});
      continue;
    }
    if (nw === old) {
      edits.push({id: c.id, field, verdict: 'keep', criteria: [],
        concept: c.label, philosopher: PH[c.philosopher], old});
      continue;
    }
    edits.push({id: c.id, field, verdict: 'rewrite',
      criteria: field === 'description' ? ['П10', 'П13'] : ['П4', 'П5', 'П5.5', 'П6', 'П8'],
      concept: c.label, philosopher: PH[c.philosopher],
      old, new: nw});
  }
}

fs.writeFileSync('edits/batch-K12-whitehead-wittgenstein.json', JSON.stringify({meta: {
  batch: 'K12',
  title: 'Описания концепций: Уайтхед, Рассел, Кассирер, Витгенштейн',
  spec: 'concepts-revision-spec.md', specRevision: 1,
  target: 'philosophy_graph.html', targetMd5: md5,
  created: '2026-08-11', layer: 'concepts',
  count: edits.length
}, edits}, null, 2) + '\n');

const v = {};
for (const e of edits) v[e.verdict] = (v[e.verdict] || 0) + 1;
console.log('концепций:', mine.length, '| записей правок:', edits.length, JSON.stringify(v));
