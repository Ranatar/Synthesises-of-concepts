import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const T = Object.fromEntries(d.relationTypes.map(x=>[x.id,x]));
const HERE = ['aristotle','epicurus','marcus_aurelius','plotinus','augustine'];
const rel = d.relations.filter(r=>{
  const a=C[r.source],b=C[r.target];
  return a&&b&&a.philosopher===b.philosopher&&HERE.includes(a.philosopher)&&r.source!==r.target;
});
rel.sort((a,b)=>{
  const pa=HERE.indexOf(C[a.source].philosopher), pb=HERE.indexOf(C[b.source].philosopher);
  if(pa!==pb) return pa-pb;
  return a.type<b.type?-1:a.type>b.type?1:0;
});
console.log('связей:', rel.length);
let cur='';
for(const r of rel){
  const a=C[r.source],b=C[r.target],t=T[r.type];
  if(a.philosopher!==cur){cur=a.philosopher;console.log('\n########## '+P[cur].nameRu+' ##########');}
  console.log(`--- «${a.label}» —${r.type}→ «${b.label}»  вес ${r.weight}${r.bidirectional?' ВЗАИМНАЯ':''}`);
  console.log(`    тип: ${t.label}; слой ${t.layer}; основание ${t.ground||'—'}${t.symmetric?'; СИММЕТРИЧЕН':''}`);
  console.log(`    ЕСТЬ: ${r.description}`);
}
console.log('\n\n========== КОНЦЕПЦИИ ==========');
const ids=[...new Set(rel.flatMap(r=>[r.source,r.target]))];
for(const id of ids){const c=C[id];
  console.log(`\n[${id}] «${c.label}» (${P[c.philosopher].nameRu}) рубрики: ${(c.rubrics||[]).join(', ')}`);
  console.log(`  ${c.description}`);
  console.log(`  ${c.extendedDescription}`);
}
