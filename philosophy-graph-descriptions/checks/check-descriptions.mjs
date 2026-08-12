#!/usr/bin/env node
// check-descriptions.mjs — набор проверок описаний связей.
// Спецификация: descriptions-revision-spec.md, раздел 7.5.
//
//   node checks/check-descriptions.mjs <файл.html> [--verbose] [--only=код]
//
// Приговоры: ОТКАЗ (описание нельзя оставить), ПРЕДУПР (нужен взгляд
// человека), СПРАВКА (величина к сведению). Отказ по коду, внесённому в
// known-exceptions.json, понижается до справки с указанием причины.

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2];
const VERBOSE = process.argv.includes('--verbose');
const ALL = process.argv.includes('--all');   // не усекать перечень замечаний
const JSONOUT = process.argv.includes('--json'); // машинный вывод: код + ключ связи
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
const relationTypes = grab('relationTypes');
const relations = grab('relations');
const C = Object.fromEntries(concepts.map(c => [c.id, c]));
const T = Object.fromEntries(relationTypes.map(t => [t.id, t]));

// ---- вспомогательное ------------------------------------------------------
const EXC = JSON.parse(fs.readFileSync(path.join(HERE, 'known-exceptions.json'), 'utf8'));
const WHITE = new Set(
  fs.readFileSync(path.join(HERE, 'terms-whitelist.txt'), 'utf8')
    .split('\n').map(s => s.replace(/#.*/, '').trim()).filter(Boolean)
    .flatMap(s => s.split(/\s+/)).map(s => s.toLowerCase()));
// метки концепций на латинице входят в список без обсуждения
for (const c of concepts)
  for (const w of (c.label.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || []))
    WHITE.add(w.toLowerCase());

const key = r => `${r.source}|${r.target}|${r.type}`;
function excused(code, r) {
  const e = EXC[code];
  if (!e) return null;
  if (e.all) return e.reason;
  return (e.keys || []).includes(key(r)) ? e.reason : null;
}
function stem(label) {
  const base = label.replace(/\s*\(.*?\)\s*/g, ' ').replace(/[«»'",.:;!?]/g, ' ').trim();
  const w = base.split(/[\s\-—]+/)[0] || base;
  return (w.length > 5 ? w.slice(0, w.length - 2) : w).toLowerCase();
}
function mentions(desc, label) {
  return desc.toLowerCase().includes(stem(label));
}
const sentences = d => (d.match(/[.!?](\s|$)/g) || []).length;

// ---- словари --------------------------------------------------------------
const STOP_EN = /\b(the|of|and|but|to|in|is|as|for|with|from|by|that|it|its|not|are|be|this|which|through|between|his|her|their|was|were|has|have|all|only|about|into|than|then|there|these|those|we|they|you)\b/i;
const STOP_XX = /\b(le|la|les|des|du|au|aux|et|pour|dans|sur|sich|für|das|der|die|den|dem|ist|und|zum|zur|nicht|eine|einer|mit|von|auf)\b/;
const TYPE_WORDS = {
  influence: /влия\w+|повлия\w+|воздейств\w+/i,
  develop: /развива\w+|развитие|развёртыва\w+/i,
  critique: /критик\w+|оспарива\w+|опроверга\w+/i,
  oppose: /противопоставл\w+|противостои\w+/i,
  dialogue: /вступает в диалог|обсужда\w+|полемизир\w+/i,
  synthesize: /синтезир\w+/i,
  consequence: /следует из|вытекает из|влечёт|порожда\w+/i,
  presuppose: /предполага\w+/i,
  condition: /услови\w+|обусловл\w+/i,
  exemplify: /иллюстри\w+|наглядн\w+/i,
  instrument: /служит ор\w+|орудие|инструмент\w*/i,
  culminate: /кульмина\w+|кульминир\w+|достигает вершины/i,
  complement: /дополня\w+/i,
  correlative: /взаимоопредел\w+|соотносительн\w+/i,
  internal_contradiction: /внутренне противореч\w+/i,
  emerge_from: /возника\w+ из|происходит из/i,
  limit: /ограничива\w+|ограничение/i,
  mediate: /опосред\w+|посредни\w+/i,
  typological: /типологическ\w+ сходств\w+/i,
  apply: /применяет себя|самоприменен\w+/i,
};
const KIN = {
  consequence: ['condition'], condition: ['consequence'],
  internal_contradiction: ['oppose'], oppose: ['internal_contradiction'],
  typological_opposition: ['oppose', 'typological'], typological: ['typological_opposition'],
  develop: ['influence'], apply: ['instrument'], instrument: ['apply'],
};
const GROUND_MARK = [
  [/следует из|вытекает из|проистека\w* из|выводится из|обусловлен\w*|возникает из|рождается из|опира\w*ся на|основан\w* на|коренится в|зависит от|восходит к/gi, 'after'],
  [/влечёт|порожда\w+ |ведёт к|обосновыва\w+ |делает возможн\w+|производит |развёртыва\w+ в/gi, 'before'],
];

// ---- проверки -------------------------------------------------------------
const results = [];   // {code, level, r, msg}
function add(code, level, r, msg) {
  if (ONLY && code !== ONLY) return;
  const why = level === 'ОТКАЗ' ? excused(code, r) : null;
  results.push({code, level: why ? 'СПРАВКА' : level, r, msg: why ? msg + ' [исключение: ' + why + ']' : msg});
}

for (const r of relations) {
  const cs = C[r.source], ct = C[r.target], t = T[r.type] || {};
  const d = (r.description || '').trim();
  const tag = `${cs ? cs.label : r.source} —${r.type}→ ${ct ? ct.label : r.target}`;

  if (!d) { add('desc.present', 'ОТКАЗ', r, `${tag}: описания нет`); continue; }

  const L = [...d].length;
  if (L < 150 || L > 330) add('desc.length', 'СПРАВКА', r, `${tag}: ${L} знаков`);
  if (sentences(d) !== 2) add('desc.sentences', 'ПРЕДУПР', r, `${tag}: фраз ${sentences(d)}`);
  for (const [ch, name] of [['"', 'двойная кавычка'], ['\\', 'обратный слэш'], ['\n', 'перевод строки']])
    if (d.includes(ch)) add('desc.escapes', 'ОТКАЗ', r, `${tag}: ${name}`);

  // К3 (ревизия 3 спецификации): метку заменяет однозначный перифраз, которого
  // машина не узнаёт, — поэтому предупреждение, а не отказ.
  if (cs && !mentions(d, cs.label)) add('desc.names-source', 'ПРЕДУПР', r, `${tag}: метка «${cs.label}» не встречается`);
  if (ct && r.source !== r.target && !mentions(d, ct.label))
    add('desc.names-target', 'ПРЕДУПР', r, `${tag}: метка «${ct.label}» не встречается`);

  const en = d.match(STOP_EN), xx = d.match(STOP_XX);
  if (en) add('desc.foreign-phrase', 'ОТКАЗ', r, `${tag}: английское служебное «${en[0]}»`);
  else if (xx) add('desc.foreign-phrase', 'ОТКАЗ', r, `${tag}: иноязычное служебное «${xx[0]}»`);
  const alien = (d.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || []).filter(w => !WHITE.has(w.toLowerCase()));
  if (alien.length) add('desc.foreign-term', 'ПРЕДУПР', r, `${tag}: вне белого списка ${[...new Set(alien)].join(', ')}`);

  const first = d.split(/(?<=[.!?])\s/)[0];
  const own = TYPE_WORDS[r.type] && TYPE_WORDS[r.type].test(first);
  if (own) add('desc.own-type', 'ПРЕДУПР', r, `${tag}: первая фраза пересказывает свой тип`);
  else {
    const strange = Object.entries(TYPE_WORDS)
      .filter(([k, re]) => k !== r.type && re.test(first))
      .map(([k]) => k).filter(k => !(KIN[r.type] || []).includes(k));
    if (strange.length) add('desc.alien-type', 'ПРЕДУПР', r, `${tag}: похоже на ${strange.join('/')}`);
  }

  if (/\b1[0-9]{3}\b|\b[0-9]{3,4}\s*(г\.|году|до н\.э\.)/.test(d))
    add('desc.years', 'ПРЕДУПР', r, `${tag}: датировка в описании`);

  if (/ - /.test(d)) add('desc.typography', 'ПРЕДУПР', r, `${tag}: дефис вместо тире`);
  if (/'/.test(d)) add('desc.typography', 'ПРЕДУПР', r, `${tag}: прямая кавычка`);
  if (/--|–|\u00A0|[“”]/.test(d)) add('desc.typography', 'ПРЕДУПР', r, `${tag}: посторонний знак`);

  // согласование с основанием (эвристика)
  if (t.ground && cs && ct && r.source !== r.target) {
    const ss = stem(cs.label), st = stem(ct.label);
    if (ss !== st) {
      const low = d.toLowerCase();
      const posS = [...low.matchAll(new RegExp(ss.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))].map(m => m.index);
      const posT = [...low.matchAll(new RegExp(st.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))].map(m => m.index);
      if (posS.length && posT.length) {
        let got = null, mark = null;
        outer: for (const [re, side] of GROUND_MARK) {
          re.lastIndex = 0; let m;
          while ((m = re.exec(d))) {
            const at = m.index;
            const cand = side === 'after'
              ? [posS.find(p => p > at), posT.find(p => p > at)].filter(v => v !== undefined)
              : [posS.filter(p => p < at).pop(), posT.filter(p => p < at).pop()].filter(v => v !== undefined);
            if (!cand.length) continue;
            const g = side === 'after' ? Math.min(...cand) : Math.max(...cand);
            const isS = posS.includes(g), isT = posT.includes(g);
            if (isS === isT) continue;
            got = isS ? 'source' : 'target'; mark = m[0].trim(); break outer;
          }
        }
        if (got && got !== t.ground)
          add('desc.ground', 'ПРЕДУПР', r, `${tag}: основание читается в ${got}, объявлено в ${t.ground} (маркер «${mark}»)`);
      }
    }
  }
}

// неповторимость зачинов
const openings = {};
for (const r of relations) {
  const d = (r.description || '').trim(); if (!d) continue;
  const o = d.split(/(?<=[.!?])\s/)[0].toLowerCase().replace(/[^\p{L}\s]/gu, '').trim();
  (openings[o] ||= []).push(r);
}
for (const [o, rs] of Object.entries(openings))
  if (rs.length > 1)
    for (const r of rs) add('desc.unique-opening', 'ПРЕДУПР', r, `совпадающий зачин ×${rs.length}: «${o.slice(0, 50)}…»`);

// неповторимость: повторяющиеся фразы в разных описаниях
const phrases = {};
for (const r of relations) {
  const d = (r.description || '').trim(); if (!d) continue;
  for (const s of d.split(/(?<=[.!?])\s+/)) {
    const n = s.toLowerCase().replace(/[^\p{L}\s]/gu, '').trim();
    if ([...n].length < 40) continue;
    (phrases[n] ||= new Set()).add(r);
  }
}
for (const [s, rs] of Object.entries(phrases))
  if (rs.size > 1)
    for (const r of rs) add('desc.unique-sentence', 'ПРЕДУПР', r, `фраза повторена в ${rs.size} описаниях: «${s.slice(0, 45)}…»`);

// ---- машинный вывод -------------------------------------------------------
if (JSONOUT) {
  // ВАЖНО: process.exit() здесь обрывал ещё не записанный буфер stdout при
  // выводе в канал — замер получал усечённый поток и молча занижал числа.
  // Пишем одним куском и выходим кодом, а не немедленным завершением.
  process.stdout.write(results
    .map(x => `${x.code}\t${x.level}\t${x.r.source}|${x.r.target}|${x.r.type}`)
    .join('\n') + '\n');
}
if (!JSONOUT) {

// ---- отчёт ----------------------------------------------------------------
const by = {};
for (const x of results) (by[x.code] ||= {ОТКАЗ: 0, ПРЕДУПР: 0, СПРАВКА: 0, items: []}),
  by[x.code][x.level]++, by[x.code].items.push(x);
const order = ['desc.present', 'desc.escapes', 'desc.names-source', 'desc.names-target',
  'desc.foreign-phrase', 'desc.foreign-term', 'desc.own-type', 'desc.alien-type',
  'desc.ground', 'desc.sentences', 'desc.years', 'desc.typography',
  'desc.unique-opening', 'desc.unique-sentence', 'desc.length'];
let fails = 0;
console.log(`Файл: ${file}`);
console.log(`Связей ${relations.length}, с описанием ${relations.filter(r => (r.description || '').trim()).length}\n`);
for (const code of order) {
  const b = by[code]; if (!b) { console.log(`  ${code.padEnd(22)} чисто`); continue; }
  fails += b['ОТКАЗ'];
  const parts = [];
  if (b['ОТКАЗ']) parts.push(`ОТКАЗ ${b['ОТКАЗ']}`);
  if (b['ПРЕДУПР']) parts.push(`ПРЕДУПР ${b['ПРЕДУПР']}`);
  if (b['СПРАВКА']) parts.push(`справка ${b['СПРАВКА']}`);
  console.log(`  ${code.padEnd(22)} ${parts.join(', ')}`);
  if (VERBOSE) for (const x of (ALL ? b.items : b.items.slice(0, 20))) console.log(`      ${x.level} ${x.msg}`);
}
console.log(`\nИТОГ: отказов ${fails}`);
process.exitCode = fails ? 1 : 0;
}
