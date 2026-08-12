import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const T = Object.fromEntries(d.relationTypes.map(x=>[x.id,x]));
const PAIRS = [['aristotle','epicurus'],['epicurus','marcus_aurelius'],
 ['plato','plotinus'],['aristotle','plotinus'],['epicurus','plotinus'],['marcus_aurelius','plotinus'],
 ['socrates','augustine'],['plato','augustine'],['epicurus','augustine'],['marcus_aurelius','augustine'],
 ['plotinus','augustine'],['plato','anselm'],['augustine','anselm'],
 ['plato','aquinas'],['aristotle','aquinas'],['plotinus','aquinas']];
const set = new Set(PAIRS.map(p=>p.slice().sort().join('|')));
const rel = d.relations.filter(r=>{
  const a=C[r.source].philosopher,b=C[r.target].philosopher;
  return a!==b && set.has([a,b].sort().join('|'));});
const order = p=>PAIRS.findIndex(x=>x.slice().sort().join('|')===p);
rel.sort((x,y)=>{
  const kx=[C[x.source].philosopher,C[x.target].philosopher].sort().join('|');
  const ky=[C[y.source].philosopher,C[y.target].philosopher].sort().join('|');
  return order(kx)-order(ky) || (x.type<y.type?-1:1);});
console.log('связей:', rel.length, '| описано:', rel.filter(r=>r.description).length);
let cur='';
for(const r of rel){
  const a=C[r.source],b=C[r.target],t=T[r.type];
  const k=[a.philosopher,b.philosopher].sort().join('|');
  if(k!==cur){cur=k;console.log('\n##### '+P[a.philosopher].nameRu+' ~ '+P[b.philosopher].nameRu+' #####');}
  console.log(`--- ${r.source}|${r.target}|${r.type}  [${P[a.philosopher].nameRu}] «${a.label}» → [${P[b.philosopher].nameRu}] «${b.label}»  вес ${r.weight}`);
  console.log(`    ${t.label}; слой ${t.layer}${t.symmetric?'; СИММЕТРИЧЕН':''}${t.temporal?'; временной '+t.temporal:''}`);
  console.log(`    ЕСТЬ: ${r.description||'(нет описания)'}`);
}
