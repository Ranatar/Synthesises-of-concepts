// Замер поля традиций ГРАФОМ (§6 спеки традиций): словарь задан содержательно,
// и граф служит проверкой ПОСЛЕ простановки, а не источником до неё.
import fs from 'fs';
const src = fs.readFileSync(process.argv[2] || 'dist/philosophy_graph.html', 'utf8');
const g = n => { const m = new RegExp('const\\s+' + n + '\\s*=\\s*\\[').exec(src);
  let i = src.indexOf('[', m.index), d = 0, j = i, s = null, e = false;
  for (; j < src.length; j++) { const c = src[j];
    if (s) { if (e) { e = false; continue; } if (c === '\\') { e = true; continue; }
      if (c === s) s = null; continue; }
    if (c === '"' || c === '`' || c === "'") { s = c; continue; }
    if (c === '/' && src[j+1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
    if (c === '[') d++; else if (c === ']') { d--; if (!d) { j++; break; } } }
  return new Function('return (' + src.slice(i, j) + ')')(); };
const philosophers = g('philosophers'), concepts = g('concepts'),
      relations = g('relations'), types = g('relationTypes'), traditions = g('traditions');
const C = Object.fromEntries(concepts.map(c => [c.id, c]));
const PH = Object.fromEntries(philosophers.map(p => [p.id, p]));
const TY = Object.fromEntries(types.map(t => [t.id, t]));
const TN = Object.fromEntries(traditions.map(t => [t.id, t.name]));
const TR = p => PH[p].traditions || [];

console.log('традиций ' + traditions.length + ', философов ' + philosophers.length);
const sizes = traditions.map(t => [t.name, philosophers.filter(p => TR(p.id).includes(t.id)).length]);
console.log('размеры: ' + sizes.sort((a,b)=>b[1]-a[1]).map(s => s[0]+' '+s[1]).join('; '));

// пара философов считается «внутри», если у них есть ХОТЯ БЫ ОДНА общая традиция
function tally(layers) {
  let inside = 0, between = 0;
  const pairs = {};
  for (const r of relations) {
    const t = TY[r.type] || {};
    if (!layers.includes(t.layer)) continue;
    const a = C[r.source]?.philosopher, b = C[r.target]?.philosopher;
    if (!a || !b || a === b) continue;
    const ta = TR(a), tb = TR(b);
    if (ta.some(x => tb.includes(x))) inside++; else {
      between++;
      for (const x of ta) for (const y of tb) {
        const k = x < y ? x+'|'+y : y+'|'+x;
        pairs[k] = (pairs[k] || 0) + 1; } }
  }
  return {inside, between, pairs};
}
const hist = tally(['historical', 'both']);
const tot = hist.inside + hist.between;
console.log('\n=== ИСТОРИЧЕСКИЙ СЛОЙ (' + tot + ' рёбер между философами) ===');
console.log('  внутри традиций: ' + hist.inside + ' (' + (100*hist.inside/tot).toFixed(1) + '%)');
console.log('  между традициями: ' + hist.between + ' (' + (100*hist.between/tot).toFixed(1) + '%)');
// случайное ожидание: доля пар философов, делящих традицию
let sharePairs = 0, allPairs = 0;
for (let i = 0; i < philosophers.length; i++) for (let j = i+1; j < philosophers.length; j++) {
  allPairs++; if (TR(philosophers[i].id).some(x => TR(philosophers[j].id).includes(x))) sharePairs++; }
console.log('  для сравнения — доля пар философов, делящих традицию: '
  + (100*sharePairs/allPairs).toFixed(1) + '%');
console.log('\n  плотнейшие пары традиций:');
Object.entries(hist.pairs).sort((a,b)=>b[1]-a[1]).slice(0,8)
  .forEach(([k,v]) => { const [x,y] = k.split('|');
    console.log('    ' + String(v).padStart(3) + '  ' + TN[x] + ' ↔ ' + TN[y]); });

const typo = tally(['typological']);
const tt = typo.inside + typo.between;
console.log('\n=== ТИПОЛОГИЧЕСКИЙ СЛОЙ (' + tt + ' рёбер) ===');
console.log('  внутри традиций: ' + typo.inside + ' (' + (100*typo.inside/tt).toFixed(1) + '%)');
console.log('  ПОПЕРЁК традиций: ' + typo.between + ' (' + (100*typo.between/tt).toFixed(1) + '%)');
console.log('  (схождения без контакта ДОЛЖНЫ ложиться поперёк — иначе они');
console.log('   прикрывают преемственность, которой не заметили)');
