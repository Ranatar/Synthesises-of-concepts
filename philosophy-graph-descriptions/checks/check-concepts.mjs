#!/usr/bin/env node
// check-concepts.mjs — набор проверок описаний концепций.
// Спецификация: concepts-revision-spec.md, раздел 7.
//
//   node checks/check-concepts.mjs <файл.html> [--verbose] [--all] [--json] [--only=код]
//
// Приговоры: ОТКАЗ (описание нельзя оставить), ПРЕДУПР (нужен взгляд
// человека), СПРАВКА (величина к сведению). Отказ по коду, внесённому в
// known-exceptions-concepts.json, понижается до справки с указанием причины.

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

// ---- извлечение данных ----------------------------------------------------
const src = fs.readFileSync(file, 'utf8');
function grab(name) {
  const m = new RegExp('const\\s+' + name + '\\s*=\\s*\\[').exec(src);
  if (!m) throw new Error('нет массива ' + name);
  let i = src.indexOf('[', m.index), depth = 0, j = i, inStr = null, esc = false;
  for (; j < src.length; j++) {
    const ch = src[j];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '/' && src[j + 1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
    if (ch === '/' && src[j + 1] === '*') { j = src.indexOf('*/', j) + 1; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (!depth) { j++; break; } }
  }
  return new Function('return (' + src.slice(i, j) + ')')();
}
const concepts = grab('concepts');
const philosophers = grab('philosophers');
const relations = grab('relations');
const PH = Object.fromEntries(philosophers.map(p => [p.id, p]));

// степень концепции — для проверки соразмерности
const deg = {};
for (const r of relations) { deg[r.source] = (deg[r.source] || 0) + 1; deg[r.target] = (deg[r.target] || 0) + 1; }

// белый список иноязычных терминов
let WL = new Set();
try {
  WL = new Set(fs.readFileSync(path.join(HERE, 'terms-whitelist.txt'), 'utf8')
    .split('\n').map(s => s.replace(/#.*/, '')).join(' ')
    .split(/\s+/).filter(Boolean).map(s => s.toLowerCase()));
} catch {}
// метки концепций и имена философов латиницей — не нарушение
for (const c of concepts) for (const w of (c.label.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || [])) WL.add(w.toLowerCase());
for (const p of philosophers) for (const w of ((p.nameLat || '') .match(/[A-Za-zÀ-ÿ]+/g) || [])) WL.add(w.toLowerCase());

let EXC = {};
try { EXC = JSON.parse(fs.readFileSync(path.join(HERE, 'known-exceptions-concepts.json'), 'utf8')); } catch {}

const L = s => [...(s || '')].length;
const sentences = s => s.split(/(?<=[.!?])\s+/).filter(Boolean);

// ---- коридоры (раздел 6 спецификации) -------------------------------------
const SIG_MIN = 20, SIG_MAX = 60;
const EXT_MIN = 350, EXT_MAX = 750;

// ---- проверки -------------------------------------------------------------
const results = [];
function check(code, level, note, hits) {
  if (ONLY && code !== ONLY) return;
  results.push({code, level, note, hits});
}
const key = c => c.id;
const each = f => concepts.filter(f).map(key);

const sig = c => c.description || '';
const ext = c => c.extendedDescription || '';
const both = c => sig(c) + ' ' + ext(c);
const headWords = c => c.label.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(w => L(w) > 4);
const ownName = c => (PH[c.philosopher] || {}).nameRu ? PH[c.philosopher].nameRu.split(' ').pop() : '\u0000';
// Имя внутри «ёлочек» — не ссылка на чужую систему, а название труда или
// пример: диалоги названы по собеседникам («Парменид», «Теэтет», «Софист»),
// а у Фреге разбирается предложение «Сократ мудр». Поэтому перед поиском
// имён закавыченное снимается. Проверено: из 52 нынешних срабатываний на
// закавыченном имени держится ровно одно — тот самый пример у Фреге.
const unquoted = s => s.replace(/«[^»]*»/g, ' ');
const alienNames = c => philosophers
  .filter(p => p.id !== c.philosopher && L(p.nameRu.split(' ').pop()) > 4)
  .map(p => p.nameRu.split(' ').pop())
  .filter(n => unquoted(ext(c)).includes(n));

// П0 — наличие
check('con.present', 'ОТКАЗ', 'пустое поле описания',
  each(c => !sig(c).trim() || !ext(c).trim()));

// П1 — инвариант хранения
check('con.escapes', 'ОТКАЗ', 'двойная кавычка, обратный слэш или перевод строки',
  each(c => /["\\\n\r\t]/.test(both(c))));

// П2 — типографика
check('con.typography', 'ОТКАЗ', 'дефис вместо тире, прямые кавычки или многоточие из точек',
  each(c => / - /.test(both(c)) || /'/.test(both(c)) || /\.\.\./.test(both(c))));

// П3 — иноязычные вкрапления сверх меток и белого списка
const foreignWords = c => [...new Set((ext(c).match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || []).map(w => w.toLowerCase()))]
  .filter(w => !WL.has(w));
check('con.foreign-term', 'ПРЕДУПР', 'латиница сверх метки и белого списка',
  each(c => foreignWords(c).length > 0));
check('con.foreign-signature', 'ОТКАЗ', 'иноязычное в подписи',
  each(c => /[A-Za-zÀ-ÿ\u0370-\u03FF]/.test(sig(c)) && foreignWords({...c, extendedDescription: sig(c)}).length > 0));

// П4 — дублирование плашки
check('con.label-echo', 'ПРЕДУПР', 'абзац повторяет слово из метки',
  each(c => headWords(c).some(w => ext(c).includes(w))));
check('con.own-philosopher', 'ПРЕДУПР', 'абзац называет своего философа',
  each(c => ext(c).includes(ownName(c))));

// П5 — разделение труда с рёбрами
check('con.alien-philosopher', 'ОТКАЗ', 'абзац называет чужого философа: это дело описания связи',
  each(c => alienNames(c).length > 0));
check('con.transition-verb', 'ПРЕДУПР', 'глагол перехода между системами в абзаце',
  each(c => /(влия[веют]|наследу[веют]|развива[веют]|предвосхищ|заимствов|перенима|восходит к|продолжа[веют])/i.test(ext(c))));

// П6 — опора в тексте
// Вторая ветвь этого условия — «любой текст в ёлочках» — была написана до
// прохода типографики, когда ёлочек в корпусе не было ни одной, и потому
// молчала. После прохода она ожила и стала считать грамотным упоминанием
// труда всякую цитату, включая строчную («всё течёт»): число справок
// съехало с 388 на 306 без единой содержательной правки. Ветвь снята,
// осталось прежнее условие — кавычка любого вида плюс прописная буква.
check('con.grounding', 'СПРАВКА', 'не назван труд и нет цитаты',
  each(c => !/[«"'][А-ЯЁA-Z][^»"']{4,60}[»"']/.test(ext(c))));

// П7 — регистр и оценки
// Вопросительный и восклицательный знаки ВНУТРИ «ёлочек» — не обращение к
// читателю, а цитата или приводимая формулировка вопроса: лозунг «К самим
// вещам!», разбираемые вопросы «Существуют ли числа реально?», «разве я
// сторож брату моему?». Поэтому закавыченное снимается, как и в проверке на
// чужого философа. Проверено на всём корпусе: из 17 срабатываний ровно 7
// держались только на закавыченном, и все семь — этого рода.
check('con.register', 'ОТКАЗ', 'риторический вопрос или восклицание',
  each(c => /[?!]/.test(unquoted(ext(c)))));
check('con.evaluative', 'ПРЕДУПР', 'оценочно-историческое суждение',
  each(c => /(впервые|первая попытка|первый, кто|величайш|знаменит|гениальн|революционн|предвосхищ|прототип|предтеч)/i.test(ext(c))));

// П8 — строение подписи
check('con.sig-sentences', 'ОТКАЗ', 'подпись не одна фраза или кончается точкой',
  each(c => sentences(sig(c)).length !== 1 || /[.!?]$/.test(sig(c).trim())));
check('con.sig-length', 'ПРЕДУПР', `подпись вне коридора ${SIG_MIN}–${SIG_MAX}`,
  each(c => L(sig(c)) < SIG_MIN || L(sig(c)) > SIG_MAX));

// П9 — строение абзаца
check('con.ext-final', 'ОТКАЗ', 'абзац не кончается точкой',
  each(c => !/[.!?]$/.test(ext(c).trim())));
check('con.ext-length', 'ПРЕДУПР', `абзац вне коридора ${EXT_MIN}–${EXT_MAX}`,
  each(c => L(ext(c)) < EXT_MIN || L(ext(c)) > EXT_MAX));

// П10 — соразмерность объёма весу
const band = c => { const g = deg[c.id] || 0; return g <= 3 ? 0 : g <= 6 ? 1 : g <= 10 ? 2 : g <= 20 ? 3 : 4; };
const bandAvg = [];
for (let b = 0; b < 5; b++) {
  const g = concepts.filter(c => band(c) === b);
  bandAvg[b] = g.length ? Math.round(g.reduce((a, c) => a + L(ext(c)), 0) / g.length) : 0;
}
check('con.proportion', 'СПРАВКА',
  'средний абзац по разрядам связей 0-3/4-6/7-10/11-20/21+: ' + bandAvg.join(' / '),
  concepts.filter(c => band(c) >= 3 && L(ext(c)) < EXT_MIN + 50).map(key));

// П11 — неповторимость
const sigSeen = {}, sigDup = [];
for (const c of concepts) { const k = sig(c).trim().toLowerCase(); if (sigSeen[k]) sigDup.push(key(c)); else sigSeen[k] = 1; }
check('con.unique-signature', 'ОТКАЗ', 'подпись дословно совпадает с другой', sigDup);

const sigHead = {}, headDup = [];
for (const c of concepts) { const k = sig(c).toLowerCase().split(/\s+/).slice(0, 2).join(' '); (sigHead[k] = sigHead[k] || []).push(c); }
for (const g of Object.values(sigHead)) if (g.length > 1) for (const c of g.slice(1)) headDup.push(key(c));
check('con.unique-sig-head', 'ПРЕДУПР', 'совпадающий зачин подписи (два слова)', headDup);

const sentSeen = {}, sentDup = [];
for (const c of concepts) for (const s of sentences(ext(c))) {
  const k = s.trim().toLowerCase(); if (L(k) < 40) continue;
  if (sentSeen[k]) sentDup.push(key(c)); else sentSeen[k] = 1;
}
check('con.unique-sentence', 'ОТКАЗ', 'дословно повторяющаяся фраза в абзацах', [...new Set(sentDup)]);

// П12 — согласованность двух полей
check('con.fields-echo', 'ПРЕДУПР', 'подпись дословно входит в абзац',
  each(c => sig(c).trim() && ext(c).includes(sig(c).trim())));

// ---- вывод ---------------------------------------------------------------
if (JSONOUT) {
  for (const r of results) for (const h of r.hits) console.log(`${r.code}\t${r.level}\t${h}`);
  process.exitCode = 0;
} else {
  console.log(`Файл: ${file}`);
  const withBoth = concepts.filter(c => sig(c).trim() && ext(c).trim()).length;
  console.log(`Концепций ${concepts.length}, с обоими полями ${withBoth}\n`);
  let refusals = 0;
  for (const r of results) {
    let level = r.level;
    const exc = EXC[r.code];
    if (level === 'ОТКАЗ' && exc && exc.all) level = 'СПРАВКА';
    const n = r.hits.length;
    if (level === 'ОТКАЗ' && n) refusals += n;
    const verdict = n === 0 ? 'чисто' : `${level} ${n}`;
    console.log(`  ${r.code.padEnd(24)} ${verdict}`);
    if (r.note && (VERBOSE || (n && level === 'ОТКАЗ'))) console.log(`      ${r.note}`);
    if (n && (VERBOSE || ALL)) {
      const list = ALL ? r.hits : r.hits.slice(0, 8);
      for (const h of list) console.log(`      · ${h}`);
      if (!ALL && r.hits.length > 8) console.log(`      … ещё ${r.hits.length - 8}`);
    }
  }
  console.log(`\nИТОГ: отказов ${refusals}`);
  process.exitCode = refusals ? 1 : 0;
}
