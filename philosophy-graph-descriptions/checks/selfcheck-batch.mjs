// Самопроверка файла правок концепций ДО применения.
//   node checks/selfcheck-batch.mjs <edits.json> [файл-состояния.html]
//
// Повторяет предикаты check-concepts.mjs по новым текстам и вдобавок делает
// то, чего проверка сделать не может: сверяет подписи захода с подписями
// ВСЕГО КОРПУСА. Заход К06 показал, зачем: самопроверка внутри захода
// пропустила три совпадения зачинов с чужими философами («То, чем…» с
// Платоном, «То, что…» со Спинозой, «Связь между…» с Кантом), и они всплыли
// только после применения.
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
    if (ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '[') depth++; else if (ch === ']') { depth--; if (!depth) { j++; break; } }
  }
  return new Function('return (' + src.slice(i, j) + ')')();
}
const concepts = grab('concepts');
const philosophers = grab('philosophers');
const PH = Object.fromEntries(philosophers.map(p => [p.id, p.nameRu]));
const CN = Object.fromEntries(concepts.map(c => [c.id, c]));
const L = s => [...(s || '')].length;
const edits = JSON.parse(fs.readFileSync(editsPath, 'utf8')).edits;
const mine = new Set(edits.map(e => e.id));

let WL = new Set(fs.readFileSync('checks/terms-whitelist.txt', 'utf8')
  .split('\n').map(s => s.replace(/#.*/, '')).join(' ')
  .split(/\s+/).filter(Boolean).map(s => s.toLowerCase()));
for (const c of concepts) for (const w of (c.label.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || [])) WL.add(w.toLowerCase());

const NAMES = philosophers.map(p => p.nameRu.split(' ').pop()).filter(n => L(n) > 4);
const unq = s => s.replace(/«[^»]*»/g, ' ');
let bad = 0;
const say = (id, field, msg) => { bad++; console.log(`!! ${id}/${field}: ${msg}`); };

for (const e of edits) {
  if (!e.new) continue;
  const t = e.new, own = PH[CN[e.id].philosopher].split(' ').pop();
  if (/["\\\n\r\t]/.test(t)) say(e.id, e.field, 'запрещённый знак');
  if (t.includes(' - ') || /'/.test(t) || /\.\.\./.test(t)) say(e.id, e.field, 'типографика');
  // как и в check-concepts: закавыченное снимается — цитата не есть обращение
  if (/[?!]/.test(unq(t))) say(e.id, e.field, 'вопрос или восклицание');
  const alien = NAMES.filter(n => unq(t).includes(n) && n !== own);
  if (alien.length) say(e.id, e.field, 'ЧУЖОЙ философ: ' + alien.join(', '));
  if (L(own) > 4 && unq(t).includes(own)) say(e.id, e.field, 'свой философ');
  if (/(впервые|первая попытка|первый, кто|величайш|знаменит|гениальн|революционн|предвосхищ|прототип|предтеч)/i.test(t))
    say(e.id, e.field, 'оценочно-историческое');
  if (/(влия[веют]|наследу[веют]|развива[веют]|заимствов|перенима|восходит к|продолжа[веют])/i.test(t))
    say(e.id, e.field, 'глагол перехода (проверить: не в отрицании ли)');
  const lat = [...new Set((t.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) || []).map(s => s.toLowerCase()))]
    .filter(w => !WL.has(w));
  if (lat.length) say(e.id, e.field, 'латиница: ' + lat.join(', '));
  if (e.field === 'description') {
    if (L(t) < 20 || L(t) > 60) say(e.id, e.field, 'подпись вне коридора: ' + L(t));
    if (/[.!?]$/.test(t.trim())) say(e.id, e.field, 'подпись кончается точкой');
    if (t.split(/(?<=[.!?])\s+/).length !== 1) say(e.id, e.field, 'подпись не одна фраза');
    if (/[A-Za-zÀ-ÿ]/.test(t) && lat.length) say(e.id, e.field, 'иноязычное в подписи');
  } else {
    if (L(t) < 350 || L(t) > 750) say(e.id, e.field, 'абзац вне коридора: ' + L(t));
    if (!/[.!?]$/.test(t.trim())) say(e.id, e.field, 'абзац не кончается точкой');
  }
}

// Потеря опоры: цитата или заглавие было закавычено в старом тексте, а в
// новом введено прямой речью без кавычек. Дважды всплывало только ПОСЛЕ
// применения (К08 и К09), поднимая con.grounding вместо того, чтобы его
// снижать. Кавычки здесь нужны не ради проверки, а по существу: это чужие
// слова и названия книг.
const GROUND = /[«"'][А-ЯЁA-Z][^»"']{4,60}[»"']/;
for (const e of edits) {
  if (e.field !== 'extendedDescription' || !e.new || !e.old) continue;
  if (GROUND.test(e.old) && !GROUND.test(e.new)) {
    bad++;
    console.log(`!! ${e.id}: ПОТЕРЯНА ОПОРА — в старом тексте было ${e.old.match(GROUND)[0]}`);
  }
}

// подписи захода против ВСЕГО корпуса
const head = s => s.toLowerCase().split(/\s+/).slice(0, 2).join(' ');
const all = {};
for (const c of concepts) {
  const e = edits.find(x => x.id === c.id && x.field === 'description' && x.new);
  const sig = e ? e.new : c.description;
  (all[head(sig)] = all[head(sig)] || []).push({c, sig, mine: mine.has(c.id) && !!e});
}
for (const [k, v] of Object.entries(all)) {
  if (v.length < 2 || !v.some(x => x.mine)) continue;
  bad++;
  console.log(`!! совпадение зачина подписи «${k}…» ПО ВСЕМУ КОРПУСУ:`);
  for (const x of v) console.log(`     ${x.mine ? '[заход] ' : '        '}${PH[x.c.philosopher]} «${x.c.label}» — ${x.sig}`);
}
// дословно повторяющиеся фразы против всего корпуса
const sent = {};
for (const c of concepts) {
  const e = edits.find(x => x.id === c.id && x.field === 'extendedDescription' && x.new);
  const ext = e ? e.new : c.extendedDescription;
  for (const s of ext.split(/(?<=[.!?])\s+/)) {
    const key = s.trim().toLowerCase();
    if (L(key) < 40) continue;
    if (sent[key] && (mine.has(c.id) || mine.has(sent[key]))) {
      bad++; console.log(`!! дословный повтор фразы: ${c.id} и ${sent[key]}`);
    } else sent[key] = c.id;
  }
}

console.log(`\nправок: ${edits.length} | замечаний: ${bad}`);
process.exitCode = bad ? 1 : 0;
