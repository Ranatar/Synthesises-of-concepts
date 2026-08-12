// Самопроверка файла правок описаний философов ДО применения.
//   node checks/selfcheck-batch-phil.mjs <edits.json> [файл-состояния.html]
//
// Повторяет предикаты check-philosophers.mjs по новым текстам и вдобавок
// делает то, чего проверка сделать не может:
//   * сверяет зачины и фразы захода СО ВСЕМ КОРПУСОМ (К06: самопроверка,
//     сверявшая только внутри захода, пропустила три совпадения с чужими);
//   * сверяет ОПОРУ — не потеряно ли при переписывании название труда,
//     стоявшее в старом тексте (К09, К10: этот класс дважды всплывал только
//     после применения и требовал пересборки базы).
//
// ПРЕДИКАТЫ ЗДЕСЬ — КОПИЯ ПРЕДИКАТОВ ПРОВЕРКИ. При всякой правке
// check-philosophers.mjs сверять и этот файл (грабля К11).
import fs from 'fs';

const editsPath = process.argv[2];
const htmlPath = process.argv[3] || 'dist/philosophy_graph.html';
if (!editsPath) { console.error('нужен путь к файлу правок'); process.exit(2); }

const src = fs.readFileSync(htmlPath, 'utf8');
function grab(name) {
  const m = new RegExp('const\\s+' + name + '\\s*=\\s*\\[').exec(src);
  let i = src.indexOf('[', m.index), depth = 0, j = i, inStr = null, esc = false;
  for (; j < src.length; j++) {
    const ch = src[j];
    if (inStr) { if (esc) { esc = false; continue; } if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null; continue; }
    if (ch === '"' || ch === '`' || ch === "'") { inStr = ch; continue; }
    if (ch === '[') depth++; else if (ch === ']') { depth--; if (!depth) { j++; break; } }
  }
  return new Function('return (' + src.slice(i, j) + ')')();
}
const philosophers = grab('philosophers');
const concepts = grab('concepts');
const BY = Object.fromEntries(philosophers.map(p => [p.id, p]));
const L = s => [...(s || '')].length;
const edits = JSON.parse(fs.readFileSync(editsPath, 'utf8')).edits;
const mine = new Set(edits.map(e => e.id));

let WL = new Set();
try {
  WL = new Set(fs.readFileSync('checks/terms-whitelist.txt', 'utf8')
    .split('\n').map(s => s.replace(/#.*/, '')).join(' ')
    .split(/\s+/).filter(Boolean).map(s => s.toLowerCase()));
} catch {}
for (const c of concepts) for (const w of (c.label.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || [])) WL.add(w.toLowerCase());
for (const p of philosophers) for (const w of ((p.name || '').match(/[A-Za-zÀ-ÿ]+/g) || [])) WL.add(w.toLowerCase());

const ownLabels = {};
for (const c of concepts) (ownLabels[c.philosopher] = ownLabels[c.philosopher] || [])
  .push(c.label.replace(/\s*\(.*?\)/, '').trim());
const NAMES = philosophers.map(p => [p.id, p.nameRu.split(' ').pop()]).filter(([, n]) => L(n) > 4);
const unq = s => s.replace(/«[^»]*»/g, ' ');
const WORK = /«[А-ЯЁA-Z][^»]{3,60}»/;

let bad = 0;
const say = (id, msg) => { bad++; console.log(`!! ${id}: ${msg}`); };

for (const e of edits) {
  if (!e.new) continue;
  const t = e.new, p = BY[e.id];
  if (!p) { say(e.id, 'нет такого философа'); continue; }
  const own = p.nameRu.split(' ').pop();

  if (/["\\\t]/.test(t) || /  /.test(t)) say(e.id, 'запрещённый знак или двойной пробел');
  if (/[^\n]\n(?!\n)/.test(t)) say(e.id, 'одиночный перевод строки: абзацы разделяются двойным');
  if (/ - /.test(t) || /'/.test(t) || /\.\.\./.test(t)) say(e.id, 'типографика');
  if (/[?!]/.test(unq(t))) say(e.id, 'вопрос или восклицание');
  if (t.includes(own)) say(e.id, 'повторяет собственное имя — оно напечатано выше');
  if (/\b\d{3,4}\b/.test(t)) say(e.id, 'годы цифрами — плашка напечатана выше');
  const alien = NAMES.filter(([id, n]) => id !== e.id && unq(t).includes(n)).map(([, n]) => n);
  if (alien.length) say(e.id, 'ЧУЖОЙ философ: ' + alien.join(', '));
  if (/(повлия|оказал[а]? влияни|испытал[а]? влияни|критикова|полемизирова|синтезирова(л|в)|противостоя)/i.test(unq(t)))
    say(e.id, 'глагол влияния (проверить: не в отрицании ли)');
  const labels = (ownLabels[e.id] || []).filter(l => l && t.includes(l));
  if (labels.length) say(e.id, 'называет свои метки концепций: ' + labels.slice(0, 3).join(', '));
  if (/(величайш|знаменит|впервые|огромное влияни|гениальн|революционн|один из самых|крупнейш|выдающ|прославл)/i.test(unq(t)))
    say(e.id, 'оценочно-историческое');
  const lat = [...new Set((t.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || []).map(s => s.toLowerCase()))]
    .filter(w => !WL.has(w));
  if (lat.length) say(e.id, 'латиница: ' + lat.join(', '));
  // смешение кириллицы с латиницей ВНУТРИ слова — класс, найденный в К16
  const mixed = t.match(/\S*[А-Яа-яЁё][A-Za-z]\S*|\S*[A-Za-z][А-Яа-яЁё]\S*/g);
  if (mixed) say(e.id, 'смешение кириллицы с латиницей внутри слова: ' + mixed.slice(0, 3).join(', '));
  if (L(t) < 1800 || L(t) > 2600) say(e.id, 'объём вне коридора 1800–2600: ' + L(t));
  const np = t.split(/\n\n+/).length;
  if (np < 4 || np > 7) say(e.id, 'абзацев вне коридора 4–7: ' + np);
  // сверка опоры
  if (e.old && WORK.test(e.old) && !WORK.test(t))
    say(e.id, 'ПОТЕРЯНА ОПОРА — в старом тексте было ' + (e.old.match(WORK) || [])[0]);
  if (!WORK.test(t)) say(e.id, 'СПРАВКА: не назван ни один труд');
}

// зачины и фразы против ВСЕГО корпуса
const head = s => s.split(/\s+/).slice(0, 6).join(' ').toLowerCase();
const all = {};
for (const p of philosophers) {
  const e = edits.find(x => x.id === p.id && x.new);
  const txt = e ? e.new : p.description;
  (all[head(txt)] = all[head(txt)] || []).push({p, mine: mine.has(p.id) && !!e});
}
for (const [k, v] of Object.entries(all)) {
  if (v.length < 2 || !v.some(x => x.mine)) continue;
  bad++;
  console.log(`!! совпадение зачина «${k}…» ПО ВСЕМУ КОРПУСУ:`);
  for (const x of v) console.log(`     ${x.mine ? '[заход] ' : '        '}${x.p.nameRu}`);
}
const sent = {};
for (const p of philosophers) {
  const e = edits.find(x => x.id === p.id && x.new);
  const txt = e ? e.new : p.description;
  for (const s of txt.split(/(?<=[.!?])\s+/)) {
    const key = s.trim().toLowerCase();
    if (L(key) < 40) continue;
    if (sent[key] && (mine.has(p.id) || mine.has(sent[key]))) {
      bad++; console.log(`!! дословный повтор фразы: ${p.id} и ${sent[key]}`);
    } else sent[key] = p.id;
  }
}

console.log(`\nправок: ${edits.length} | замечаний: ${bad}`);
process.exitCode = bad ? 1 : 0;
