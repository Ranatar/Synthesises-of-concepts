import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const cById = Object.fromEntries(d.concepts.map(c=>[c.id,c]));
const pById = Object.fromEntries(d.philosophers.map(p=>[p.id,p]));
const inner = d.relations.filter(r=>{const a=cById[r.source],b=cById[r.target];return a&&b&&a.philosopher===b.philosopher;});
const byPh={}; for(const r of inner){ (byPh[cById[r.source].philosopher] ||= []).push(r); }
const order = d.philosophers.slice().sort((a,b)=>a.birth-b.birth).filter(p=>byPh[p.id]);
const CAP=60;
let batch=[], batches=[];
for(const p of order){
  const n=byPh[p.id].length;
  if(batch.length && batch.reduce((a,x)=>a+byPh[x.id].length,0)+n>CAP){ batches.push(batch); batch=[]; }
  batch.push(p);
}
if(batch.length) batches.push(batch);
let tot=0;
batches.forEach((b,i)=>{
  const links=b.flatMap(p=>byPh[p.id]);
  const cids=new Set(links.flatMap(r=>[r.source,r.target]));
  const ctx=[...cids].reduce((a,id)=>a+[...(cById[id].extendedDescription||'')].length+[...(cById[id].description||'')].length,0);
  const cur=links.reduce((a,r)=>a+[...(r.description||'')].length,0);
  tot+=links.length;
  console.log(`Заход ${String(i+1).padStart(2)}: ${b.map(p=>p.nameRu).join(', ')}`);
  console.log(`         связей ${String(links.length).padStart(3)} | концепций ${String(cids.size).padStart(3)} | контекст концепций ${(ctx/1000).toFixed(1)} тыс. знаков | нынешние описания ${(cur/1000).toFixed(1)} тыс.`);
});
console.log('ИТОГО', tot, 'связей за', batches.length, 'заходов');
