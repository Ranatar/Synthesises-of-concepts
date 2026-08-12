#!/usr/bin/env node
// mutate-concepts.mjs — проверка самого набора проверок.
// В копию файла вносится один намеренный дефект; check-concepts.mjs обязан
// его увидеть — то есть дать по нужному коду больше срабатываний, чем без него.
//
//   node checks/mutate-concepts.mjs [файл.html]

import fs from 'fs';
import path from 'path';
import {execFileSync} from 'child_process';
import {fileURLToPath} from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const FILE = process.argv[2] || path.join(ROOT, 'dist', 'philosophy_graph.html');
const TMP = path.join('/tmp', 'mutate-concepts-' + process.pid + '.html');

const base = fs.readFileSync(FILE, 'utf8');

// счётчик срабатываний по кодам для данного текста файла
function counts(text) {
  fs.writeFileSync(TMP, text);
  let out = '';
  try {
    out = execFileSync('node', [path.join(HERE, 'check-concepts.mjs'), TMP, '--json'],
      {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  } catch (e) { out = e.stdout || ''; }
  const c = {};
  for (const line of out.split('\n')) {
    const code = line.split('\t')[0];
    if (code) c[code] = (c[code] || 0) + 1;
  }
  return c;
}

// границы массива concepts — вне их мутировать нельзя: поле description
// встречается и в других массивах файла, и правка там ничего не докажет
function conceptsRange(text) {
  const m = /const\s+concepts\s*=\s*\[/.exec(text);
  if (!m) throw new Error('нет массива concepts');
  let i = text.indexOf('[', m.index), depth = 0, j = i, inStr = null, esc = false;
  for (; j < text.length; j++) {
    const ch = text[j];
    if (inStr) { if (esc) { esc = false; continue; } if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '[') depth++; else if (ch === ']') { depth--; if (!depth) { j++; break; } }
  }
  return [i, j];
}

// найти первое описание концепции, подходящее под условие, и заменить в нём текст
function mutate(text, field, pick, apply) {
  const [lo, hi] = conceptsRange(text);
  const re = new RegExp('(?<!extended)' + field.replace(/^./, c => c) + ': "((?:[^"\\\\]|\\\\.)*)"', 'g');
  const reAny = new RegExp(field + ': "((?:[^"\\\\]|\\\\.)*)"', 'g');
  const rx = field === 'description' ? re : reAny;
  rx.lastIndex = lo;
  let m;
  while ((m = rx.exec(text)) && m.index < hi) {
    if (!pick(m[1])) continue;
    const changed = apply(m[1]);
    if (changed === m[1]) continue;
    return text.slice(0, m.index) + `${field}: "${changed}"` + text.slice(m.index + m[0].length);
  }
  throw new Error('не нашлось места для мутации: ' + field);
}


// мутация, которой нужно знать, какой концепции принадлежит текст:
// разбираем массив, выбираем концепцию, подменяем её абзац по месту
function conceptObjects(text) {
  const [lo, hi] = conceptsRange(text);
  return new Function('return (' + text.slice(lo, hi) + ')')();
}
function mutateOwn(text, pick, apply) {
  for (const c of conceptObjects(text)) {
    if (!pick(c)) continue;
    const changed = apply(c);
    if (changed === c.extendedDescription) continue;
    const i = text.indexOf('"' + c.extendedDescription + '"');
    if (i < 0) continue;
    return text.slice(0, i) + '"' + changed + '"' + text.slice(i + c.extendedDescription.length + 2);
  }
  throw new Error('не нашлось концепции для мутации');
}

const MUTATIONS = [
  ['con.escapes', t => mutate(t, 'extendedDescription',
    s => !/["\\\n\r\t]/.test(s), s => s + '\t')],
  ['con.typography', t => mutate(t, 'extendedDescription',
    s => !/ - /.test(s) && !/'/.test(s), s => s.replace('. ', ' - '))],
  ['con.register', t => mutate(t, 'extendedDescription',
    s => !/[?!]/.test(s), s => s.replace(/\.$/, '?'))],
  ['con.alien-philosopher', t => mutate(t, 'extendedDescription',
    s => !/Кьеркегор/.test(s), s => s + ' Здесь важен Кьеркегор.')],
  ['con.label-echo', t => mutateOwn(t,
    c => { const w = c.label.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(x => [...x].length > 4);
           return w.length && !w.some(x => c.extendedDescription.includes(x)); },
    c => { const w = c.label.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(x => [...x].length > 4)[0];
           return c.extendedDescription + ' Здесь важно слово ' + w + '.'; })],
  ['con.ext-final', t => mutate(t, 'extendedDescription',
    s => /\.$/.test(s), s => s.replace(/\.$/, ''))],
  ['con.sig-sentences', t => mutate(t, 'description',
    s => !/[.!?]$/.test(s), s => s + '.')],
  ['con.sig-length', t => mutate(t, 'description',
    s => [...s].length >= 20 && [...s].length <= 60, s => s.slice(0, 6))],
  ['con.unique-sentence', t => {
    const re = /extendedDescription: "((?:[^"\\]|\\.)*)"/g;
    const m1 = re.exec(t);
    const first = m1[1].split(/(?<=[.!?])\s+/)[0];
    return mutate(t, 'extendedDescription',
      s => s !== m1[1] && !s.includes(first), s => s + ' ' + first);
  }],
  ['con.evaluative', t => mutate(t, 'extendedDescription',
    s => !/(впервые|первая попытка|первый, кто|величайш|знаменит|гениальн|революционн|предвосхищ|прототип|предтеч)/i.test(s),
    s => s + ' Это впервые сказано здесь.')],
  ['con.transition-verb', t => mutate(t, 'extendedDescription',
    s => !/(влия[веют]|наследу[веют]|развива[веют]|предвосхищ|заимствов|перенима|восходит к|продолжа[веют])/i.test(s),
    s => s + ' Понятие восходит к более раннему.')],
];

const before = counts(base);
let caught = 0;
for (const [code, fn] of MUTATIONS) {
  let after;
  try { after = counts(fn(base)); }
  catch (e) { console.log(`✗ ${code.padEnd(24)} мутация не удалась: ${e.message}`); continue; }
  const b = before[code] || 0, a = after[code] || 0;
  const ok = a > b;
  if (ok) caught++;
  console.log(`${ok ? '✓' : '✗'} ${code.padEnd(24)} было ${String(b).padStart(4)} → стало ${String(a).padStart(4)}`);
}
try { fs.unlinkSync(TMP); } catch {}
console.log(`\nпойманы ${caught} из ${MUTATIONS.length}`);
process.exitCode = caught === MUTATIONS.length ? 0 : 1;
