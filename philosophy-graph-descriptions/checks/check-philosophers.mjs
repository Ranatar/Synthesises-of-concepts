#!/usr/bin/env node
// check-philosophers.mjs — набор проверок описаний философов.
// Спецификация: philosophers-revision-spec.md, раздел 7.
//
//   node checks/check-philosophers.mjs <файл.html> [--verbose] [--all] [--json] [--only=код]
//
// Приговоры: ОТКАЗ / ПРЕДУПР / СПРАВКА. Понижения — через
// known-exceptions-philosophers.json.

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2];
const VERBOSE = process.argv.includes('--verbose');
const ALL = process.argv.includes('--all');
const JSONOUT = process.argv.includes('--json');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
if (!file) { console.error('нужен путь к html'); process.exit(2); }

const src = fs.readFileSync(file, 'utf8');
function grab(name) {
  const m = new RegExp('const\\s+' + name + '\\s*=\\s*\\[').exec(src);
  if (!m) throw new Error('нет массива ' + name);
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
const concepts = grab('concepts');
const relations = grab('relations');

let WL = new Set();
try {
  WL = new Set(fs.readFileSync(path.join(HERE, 'terms-whitelist.txt'), 'utf8')
    .split('\n').map(s => s.replace(/#.*/, '')).join(' ')
    .split(/\s+/).filter(Boolean).map(s => s.toLowerCase()));
} catch {}
for (const c of concepts) for (const w of (c.label.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || [])) WL.add(w.toLowerCase());
for (const p of philosophers) for (const w of ((p.name || '').match(/[A-Za-zÀ-ÿ]+/g) || [])) WL.add(w.toLowerCase());

let EXC = {};
try { EXC = JSON.parse(fs.readFileSync(path.join(HERE, 'known-exceptions-philosophers.json'), 'utf8')); } catch {}

const L = s => [...(s || '')].length;
const desc = p => p.description || '';
const unquoted = s => s.replace(/«[^»]*»/g, ' ');
const surname = p => p.nameRu.split(' ').pop();
const paras = p => desc(p).split(/\n\n+/);
const sentences = s => s.split(/(?<=[.!?])\s+/).filter(Boolean);

// коридоры (раздел 5 спецификации)
const MIN = 1800, MAX = 2600, PMIN = 4, PMAX = 7;

const ownLabels = {};
for (const c of concepts) (ownLabels[c.philosopher] = ownLabels[c.philosopher] || [])
  .push(c.label.replace(/\s*\(.*?\)/, '').trim());
const alienNames = philosophers
  .map(p => [p.id, surname(p)]).filter(([, n]) => L(n) > 4);

const results = [];
function check(code, level, note, hits) {
  if (ONLY && code !== ONLY) return;
  results.push({code, level, note, hits});
}
const each = f => philosophers.filter(f).map(p => p.id);

// Ф-0 наличие
check('phi.present', 'ОТКАЗ', 'пустое описание',
  each(p => !desc(p).trim()));

// Ф2 инвариант хранения
check('phi.escapes', 'ОТКАЗ', 'двойная кавычка, обратный слэш, табуляция или двойной пробел',
  each(p => /["\\\t]/.test(desc(p)) || /  /.test(desc(p))));
// абзацы разделяются ДВОЙНЫМ переводом строки; одиночный — дефект
check('phi.paragraphs', 'ОТКАЗ', 'одиночный перевод строки (абзацы разделяются двойным)',
  each(p => /[^\n]\n(?!\n)/.test(desc(p))));

// Ф1, Ф2 типографика
check('phi.typography', 'ОТКАЗ', 'дефис вместо тире, прямые кавычки или многоточие из точек',
  each(p => / - /.test(desc(p)) || /'/.test(desc(p)) || /\.\.\./.test(desc(p))));

// Ф1 иноязычное
const foreign = p => [...new Set((desc(p).match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || [])
  .map(w => w.toLowerCase()))].filter(w => !WL.has(w));
check('phi.foreign-term', 'ПРЕДУПР', 'латиница сверх белого списка (в т. ч. римские цифры веков)',
  each(p => foreign(p).length > 0));

// Ф3 не пересказывать плашку
check('phi.self-name', 'ПРЕДУПР', 'повторяет собственное имя — оно напечатано над описанием',
  each(p => desc(p).includes(surname(p))));
check('phi.years-echo', 'ПРЕДУПР', 'повторяет годы цифрами — плашка с годами напечатана выше',
  each(p => /\b\d{3,4}\b/.test(desc(p))));

// Ф4 не пересказывать список концепций
check('phi.own-labels', 'ПРЕДУПР', 'называет свои метки концепций — их перечень напечатан ниже',
  each(p => (ownLabels[p.id] || []).some(l => l && desc(p).includes(l))));

// Ф5 не пересказывать взаимодействия
check('phi.alien-philosopher', 'ОТКАЗ',
  'называет чужого философа: взаимодействия вычислены из рёбер и напечатаны ниже',
  each(p => alienNames.some(([id, n]) => id !== p.id && unquoted(desc(p)).includes(n))));
check('phi.influence-verb', 'ОТКАЗ',
  'глагол влияния: кто на кого повлиял, страница считает сама',
  each(p => /(повлия|оказал[а]? влияни|испытал[а]? влияни|(?<!не )критикова|полемизирова|синтезирова(л|в)|противостоя)/i
    .test(unquoted(desc(p)))));

// Ф10 оценки
check('phi.evaluative', 'ОТКАЗ', 'оценочно-историческое суждение',
  each(p => /(величайш|знаменит|впервые|огромное влияни|гениальн|революционн|один из самых|крупнейш|выдающ|прославл)/i
    .test(unquoted(desc(p)))));

// Ф11 регистр
check('phi.register', 'ОТКАЗ', 'риторический вопрос или восклицание',
  each(p => /[?!]/.test(unquoted(desc(p)))));

// Ф9 опора
check('phi.grounding', 'СПРАВКА', 'не назван ни один труд',
  each(p => !/«[А-ЯЁA-Z][^»]{3,60}»/.test(desc(p))));

// Ф5 объём
check('phi.length', 'ПРЕДУПР', `объём вне коридора ${MIN}–${MAX}`,
  each(p => L(desc(p)) < MIN || L(desc(p)) > MAX));
check('phi.paragraph-count', 'ПРЕДУПР', `абзацев вне коридора ${PMIN}–${PMAX}`,
  each(p => paras(p).length < PMIN || paras(p).length > PMAX));

// СПРАВКА: перекос объёма по эпохе — то, ради чего заведён узкий коридор
const corr = (xs, ys) => {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const cov = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const sx = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0));
  const sy = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0));
  return sx && sy ? cov / (sx * sy) : 0;
};
const vol = philosophers.map(p => L(desc(p)));
const rEra = corr(philosophers.map(p => p.birth), vol);
const nc = {}; for (const c of concepts) nc[c.philosopher] = (nc[c.philosopher] || 0) + 1;
const owner = {}; for (const c of concepts) owner[c.id] = c.philosopher;
const deg = {}; for (const r of relations) for (const e of [r.source, r.target])
  if (owner[e]) deg[owner[e]] = (deg[owner[e]] || 0) + 1;
const rDeg = corr(philosophers.map(p => deg[p.id] || 0), vol);
check('phi.era-bias', 'СПРАВКА',
  `r(год рождения, объём) = ${rEra.toFixed(2)}; r(число связей, объём) = ${rDeg.toFixed(2)}`,
  Math.abs(rEra) > 0.3 ? philosophers.filter(p => L(desc(p)) > MAX).map(p => p.id) : []);

// Ф13 неповторимость
const heads = {}, headDup = [];
for (const p of philosophers) {
  const k = desc(p).split(/\s+/).slice(0, 6).join(' ').toLowerCase();
  (heads[k] = heads[k] || []).push(p);
}
for (const g of Object.values(heads)) if (g.length > 1) for (const p of g.slice(1)) headDup.push(p.id);
check('phi.unique-head', 'ПРЕДУПР', 'совпадающий зачин (шесть слов)', headDup);

const seen = {}, sentDup = [];
for (const p of philosophers) for (const s of sentences(desc(p))) {
  const k = s.trim().toLowerCase(); if (L(k) < 40) continue;
  if (seen[k]) sentDup.push(p.id); else seen[k] = p.id;
}
check('phi.unique-sentence', 'ОТКАЗ', 'дословно повторяющаяся фраза', [...new Set(sentDup)]);

// ---- вывод ---------------------------------------------------------------
if (JSONOUT) {
  for (const r of results) for (const h of r.hits) console.log(`${r.code}\t${r.level}\t${h}`);
} else {
  console.log(`Файл: ${file}\nФилософов: ${philosophers.length}\n`);
  let refusals = 0;
  for (const r of results) {
    let level = r.level;
    const exc = EXC[r.code];
    if (level === 'ОТКАЗ' && exc && exc.all) level = 'СПРАВКА';
    const n = r.hits.length;
    if (level === 'ОТКАЗ' && n) refusals += n;
    console.log(`  ${r.code.padEnd(24)} ${n === 0 ? 'чисто' : level + ' ' + n}`);
    if (r.note && (VERBOSE || (n && level === 'ОТКАЗ') || r.level === 'СПРАВКА'))
      console.log(`      ${r.note}`);
    if (n && (VERBOSE || ALL)) {
      const list = ALL ? r.hits : r.hits.slice(0, 8);
      for (const h of list) console.log(`      · ${h}`);
      if (!ALL && r.hits.length > 8) console.log(`      … ещё ${r.hits.length - 8}`);
    }
  }
  console.log(`\nИТОГ: отказов ${refusals}`);
  process.exitCode = refusals ? 1 : 0;
}
