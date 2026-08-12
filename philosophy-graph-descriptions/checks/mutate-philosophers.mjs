#!/usr/bin/env node
// mutate-philosophers.mjs — проверка самого набора проверок.
// В копию файла вносится один намеренный дефект; check-philosophers.mjs
// обязан его увидеть — дать по нужному коду больше срабатываний, чем без него.
//
//   node checks/mutate-philosophers.mjs [файл.html]
//
// ГРАБЛЯ, стоившая прогона на ветви концепций: предикат выбора мутации ОБЯЗАН
// совпадать с предикатом проверки, иначе дефект ляжет в уже посчитанную
// запись и ничего не докажет. Поэтому здесь мутации выбирают запись через
// разбор массива, а не по первому попавшемуся совпадению.

import fs from 'fs';
import path from 'path';
import {execFileSync} from 'child_process';
import {fileURLToPath} from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const FILE = process.argv[2] || path.join(ROOT, 'dist', 'philosophy_graph.html');
const TMP = path.join('/tmp', 'mutate-phil-' + process.pid + '.html');
const base = fs.readFileSync(FILE, 'utf8');

function counts(text) {
  fs.writeFileSync(TMP, text);
  let out = '';
  try {
    out = execFileSync('node', [path.join(HERE, 'check-philosophers.mjs'), TMP, '--json'],
      {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  } catch (e) { out = e.stdout || ''; }
  const c = {};
  for (const line of out.split('\n')) {
    const code = line.split('\t')[0];
    if (code) c[code] = (c[code] || 0) + 1;
  }
  return c;
}

// границы массива philosophers — вне их мутировать нельзя
function range(text) {
  const m = /const\s+philosophers\s*=\s*\[/.exec(text);
  if (!m) throw new Error('нет массива philosophers');
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
function records(text) {
  const [lo, hi] = range(text);
  return new Function('return (' + text.slice(lo, hi) + ')')();
}

// подменить описание выбранной записи: ищем ЗАПИСАННЫЙ вид строки в исходнике
function mutate(text, pick, apply) {
  for (const p of records(text)) {
    if (!pick(p)) continue;
    const changed = apply(p);
    if (changed === p.description) continue;
    // в файле строка записана с экранированными переводами строк
    const enc = s => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    const needle = '"' + enc(p.description) + '"';
    const i = text.indexOf(needle);
    if (i < 0) continue;
    return text.slice(0, i) + '"' + enc(changed) + '"' + text.slice(i + needle.length);
  }
  throw new Error('не нашлось записи для мутации');
}

const NAMES = () => records(base).map(p => p.nameRu.split(' ').pop()).filter(n => [...n].length > 4);

const MUTATIONS = [
  ['phi.escapes', t => mutate(t,
    p => !/["\\\t]/.test(p.description) && !/  /.test(p.description),
    p => p.description + '  конец')],
  ['phi.paragraphs', t => mutate(t,
    p => !/[^\n]\n(?!\n)/.test(p.description),
    p => p.description + '\nодиночный перевод строки')],
  ['phi.typography', t => mutate(t,
    p => !/ - /.test(p.description) && !/'/.test(p.description) && !/\.\.\./.test(p.description),
    p => p.description.replace('. ', ' - '))],
  ['phi.register', t => mutate(t,
    p => !/[?!]/.test(p.description.replace(/«[^»]*»/g, ' ')),
    p => p.description.replace(/\.$/, '?'))],
  ['phi.evaluative', t => mutate(t,
    p => !/(величайш|знаменит|впервые|огромное влияни|гениальн|революционн|один из самых|крупнейш|выдающ|прославл)/i
      .test(p.description.replace(/«[^»]*»/g, ' ')),
    p => p.description + ' Это выдающийся мыслитель.')],
  ['phi.alien-philosopher', t => {
    const names = NAMES();
    return mutate(t,
      p => !names.some(n => n !== p.nameRu.split(' ').pop()
        && p.description.replace(/«[^»]*»/g, ' ').includes(n)),
      p => p.description + ' Здесь важен Кьеркегор.');
  }],
  // Эти две мутации были ОБРАТНЫМИ, пока ветвь не была пройдена: бьющими
  // были ВСЕ 57 записей, чистой для порчи не оставалось, и прямая мутация
  // была невозможна ПО НАСЫЩЕНИЮ, а не по изъяну предиката; поэтому брали
  // бьющую запись, снимали причину и требовали ПАДЕНИЯ счёта.
  // После завершения ветви (Ф06) не бьёт ни одна запись, и насыщение снято:
  // обратная мутация стала невозможна, зато прямая — возможна. Переведены
  // в прямые; сама эта перемена и есть свидетельство, что ветвь пройдена.
  ['phi.influence-verb', t => mutate(t,
    p => !/(повлия|оказал[а]? влияни|испытал[а]? влияни|критикова|полемизирова|синтезирова(л|в)|противостоя)/i
      .test(p.description.replace(/«[^»]*»/g, ' ')),
    p => p.description + ' Он повлиял на многих.')],
  ['phi.self-name', t => mutate(t,
    p => !p.description.includes(p.nameRu.split(' ').pop()),
    p => p.description + ' Так рассуждал ' + p.nameRu.split(' ').pop() + '.')],
  ['phi.own-labels', t => {
    const src = fs.readFileSync(FILE, 'utf8');
    const m = /const\s+concepts\s*=\s*\[/.exec(src);
    let i = src.indexOf('[', m.index), d = 0, j = i, s = null, e = false;
    for (; j < src.length; j++) { const ch = src[j];
      if (s) { if (e) { e = false; continue; } if (ch === '\\') { e = true; continue; }
        if (ch === s) s = null; continue; }
      if (ch === '"' || ch === '`') { s = ch; continue; }
      if (ch === '[') d++; else if (ch === ']') { d--; if (!d) { j++; break; } } }
    const cs = new Function('return (' + src.slice(i, j) + ')')();
    const own = {}; for (const c of cs) (own[c.philosopher] = own[c.philosopher] || [])
      .push(c.label.replace(/\s*\(.*?\)/, '').trim());
    return mutate(t,
      p => (own[p.id] || []).length && !(own[p.id] || []).some(l => l && p.description.includes(l)),
      p => p.description + ' Ср. понятие ' + own[p.id][0] + '.');
  }],
  ['phi.years-echo', t => mutate(t,
    p => !/\b\d{3,4}\b/.test(p.description),
    p => p.description + ' Это было в 1789 году.')],
  ['phi.length', t => mutate(t,
    p => { const n = [...p.description].length; return n >= 1800 && n <= 2600; },
    p => p.description.slice(0, 900))],
  ['phi.paragraph-count', t => mutate(t,
    p => { const n = p.description.split(/\n\n+/).length; return n >= 4 && n <= 7; },
    p => p.description + '\n\nЛишний абзац.\n\nЕщё один.\n\nИ ещё.\n\nИ последний.')],
  ['phi.unique-sentence', t => {
    const first = records(base)[0].description.split(/(?<=[.!?])\s+/)[0];
    return mutate(t,
      p => p.description !== records(base)[0].description && !p.description.includes(first),
      p => p.description + ' ' + first);
  }],
];

const before = counts(base);
let caught = 0;
for (const [code, fn, mode] of MUTATIONS) {
  let after;
  try { after = counts(fn(base)); }
  catch (e) { console.log(`✗ ${code.padEnd(24)} мутация не удалась: ${e.message}`); continue; }
  const b = before[code] || 0, a = after[code] || 0;
  const rev = mode === 'reverse';
  const ok = rev ? a < b : a > b;
  if (ok) caught++;
  console.log(`${ok ? '✓' : '✗'} ${code.padEnd(24)} было ${String(b).padStart(3)} → стало ${String(a).padStart(3)}`
    + (rev ? '   (обратная: ожидалось падение)' : ''));
}
try { fs.unlinkSync(TMP); } catch {}
console.log(`\nпойманы ${caught} из ${MUTATIONS.length}`);
process.exitCode = caught === MUTATIONS.length ? 0 : 1;
