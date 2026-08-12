import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const out = d.relations.filter(r=>C[r.source].philosopher!==C[r.target].philosopher);
const pairs = {};
for(const r of out){
  const a=C[r.source].philosopher, b=C[r.target].philosopher;
  const k=[a,b].sort().join('|');
  (pairs[k] ??= []).push(r);
}
const list = Object.entries(pairs).map(([k,v])=>{
  const [a,b]=k.split('|');
  const late = P[a].birth>=P[b].birth ? a : b;   // младший из пары
  const early = late===a ? b : a;
  return {k, a:early, b:late, n:v.length, desc:v.filter(r=>r.description).length, late:P[late].birth};
});
list.sort((x,y)=> x.late-y.late || P[x.a].birth-P[y.a].birth);
const CAP=55;
let cur=[], batches=[];
for(const p of list){
  if(cur.length && cur.reduce((s,q)=>s+q.n,0)+p.n>CAP){batches.push(cur);cur=[];}
  cur.push(p);
}
if(cur.length) batches.push(cur);
console.log('пар:', list.length, '| связей:', out.length, '| заходов:', batches.length);
batches.forEach((b,i)=>{
  const n=b.reduce((s,q)=>s+q.n,0), dsc=b.reduce((s,q)=>s+q.desc,0);
  const names = b.map(q=>`${P[q.a].nameRu} ~ ${P[q.b].nameRu} (${q.n})`).join('; ');
  console.log(`\n### Заход М${String(i+1).padStart(2,'0')} — ${n} связей (ревизия ${dsc}, написать ${n-dsc}); пар ${b.length}; до ${b[b.length-1].late} г.`);
  console.log(names);
});
