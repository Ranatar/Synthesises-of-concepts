// Единый проход типографики по описаниям концепций.
// Спецификация: concepts-revision-spec.md, § 8.1 и критерий П3.
//   node batches/T00-typography/mktypo.mjs
//
// Четыре замены, все механические:
//   1. апостроф элизии внутри слова  '  → ’   (L'être, l'invisible)
//   2. оставшиеся апострофы попарно   '…' → «…»
//   3. дефис между пробелами          - → —
//   4. многоточие из трёх точек     ... → …
//
// Порядок обязателен: элизии правятся ПЕРВЫМИ, иначе они собьют разбивку
// на пары. Замер: элизий ровно четыре, все французские, и ровно в тех же
// четырёх описаниях, где число апострофов нечётно; после их правки все
// счётчики чётные, то есть пары сходятся начисто.

import fs from 'fs';
import crypto from 'crypto';

const HTML = 'dist/philosophy_graph.html';
const OUT = 'edits/batch-T00-typography.json';

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

const AP = "'";
const LAQUO = '\u00AB', RAQUO = '\u00BB', RSQUO = '\u2019';
const MDASH = '\u2014', ELL = '\u2026';

function fixTypography(s) {
  // 1. элизия внутри слова
  let t = s.replace(/(\p{L})'(\p{L})/gu, '$1' + RSQUO + '$2');
  // 2. пары апострофов → «ёлочки»
  let open = true;
  t = t.replace(/'/g, () => { const ch = open ? LAQUO : RAQUO; open = !open; return ch; });
  if (!open) throw new Error('непарный апостроф остался');
  // 3. дефис между пробелами → длинное тире
  t = t.replace(/ - /g, ' ' + MDASH + ' ');
  // 4. многоточие
  t = t.replace(/\.\.\./g, ELL);
  return t;
}

// обратная развёртка: доказательство, что ничего сверх замен не изменилось
function unfix(s) {
  return s.replace(new RegExp('[' + LAQUO + RAQUO + RSQUO + ']', 'g'), AP)
          .replace(new RegExp(' ' + MDASH + ' ', 'g'), ' - ')
          .replace(new RegExp(ELL, 'g'), '...');
}

const FIELDS = ['description', 'extendedDescription'];
const edits = [];
const stat = {elision: 0, quotes: 0, dash: 0, ellipsis: 0};
let mismatched = 0;

for (const c of concepts) {
  for (const field of FIELDS) {
    const old = c[field] || '';
    if (!/ - |'|\.\.\./.test(old)) continue;
    const nw = fixTypography(old);
    if (nw === old) continue;
    if (unfix(nw) !== old) { mismatched++; console.log('!! обратная развёртка не сошлась:', c.id, field); continue; }
    stat.elision += (old.match(/\p{L}'\p{L}/gu) || []).length;
    stat.quotes += ((old.split(AP).length - 1) - (old.match(/\p{L}'\p{L}/gu) || []).length) / 2;
    stat.dash += (old.match(/ - /g) || []).length;
    stat.ellipsis += (old.match(/\.\.\./g) || []).length;
    edits.push({
      id: c.id, field, verdict: 'fix', criteria: ['П3'],
      concept: c.label, philosopher: PH[c.philosopher],
      old, new: nw,
      note: 'единый проход типографики: тире, «ёлочки», многоточие'
    });
  }
}

if (mismatched) { console.log('ОТКАЗ: расхождений обратной развёртки', mismatched); process.exit(1); }

fs.writeFileSync(OUT, JSON.stringify({meta: {
  batch: 'T00',
  title: 'Единый проход типографики по описаниям концепций',
  spec: 'concepts-revision-spec.md', specRevision: 1,
  target: 'philosophy_graph.html', targetMd5: md5,
  created: '2026-08-11', layer: 'concepts-typography',
  count: edits.length
}, edits}, null, 2) + '\n');

const byField = {};
for (const e of edits) byField[e.field] = (byField[e.field] || 0) + 1;
console.log('правок:', edits.length, JSON.stringify(byField));
console.log('замен: элизий', stat.elision, '| пар кавычек', stat.quotes,
            '| тире', stat.dash, '| многоточий', stat.ellipsis);
console.log('обратная развёртка сошлась у всех', edits.length);
