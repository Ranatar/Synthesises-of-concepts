import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const cById = Object.fromEntries(d.concepts.map(c=>[c.id,c]));
const pById = Object.fromEntries(d.philosophers.map(p=>[p.id,p]));
const tById = Object.fromEntries(d.relationTypes.map(t=>[t.id,t]));
const want = process.argv[2];
let n=0;
for(const r of d.relations){
  const cs=cById[r.source], ct=cById[r.target];
  if(!cs||!ct) continue;
  if(want && cs.philosopher!==want) continue;
  const t=tById[r.type]||{};
  console.log(`[${pById[cs.philosopher].nameRu}] «${cs.label}» --${r.type}(${t.ground||'-'},${t.layer})--> [${pById[ct.philosopher].nameRu}] «${ct.label}» w${r.weight}${r.bidirectional?' ⇄':''}`);
  console.log('   ' + (r.description||'(нет описания)'));
  if(++n>=14) break;
}
