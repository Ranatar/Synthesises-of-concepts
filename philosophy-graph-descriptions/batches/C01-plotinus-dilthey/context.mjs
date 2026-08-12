import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const T = Object.fromEntries(d.relationTypes.map(x=>[x.id,x]));
const ORD = Object.fromEntries(d.philosophers.map((x,i)=>[x.id,i]));
// принимающие системы этого захода (младший в паре)
const YOUNGER = ['plotinus','augustine','anselm','aquinas','descartes','spinoza','locke',
 'leibniz','berkeley','hume','rousseau','kant','fichte','hegel','schelling','schopenhauer',
 'kierkegaard','marx','dilthey'];
const ys = new Set(YOUNGER);
// все fix-правки из прежних заходов
const files = fs.readdirSync('edits').filter(f=>f.endsWith('.json')).sort();
const fix = [];
for (const f of files) { const e = JSON.parse(fs.readFileSync('edits/'+f,'utf8'));
  for (const x of e.edits) if (x.verdict === 'fix') fix.push({batch:e.meta.batch, ...x}); }
const first = s => s.split(/(?<=[.!?])\s+/)[0];
const one = fix.filter(r => !/[:—]/.test(first(r.new)));   // одночастный зачин
for (const r of one) { const a=C[r.source].philosopher, b=C[r.target].philosopher;
  r.younger = ORD[a] > ORD[b] ? a : b; r.elder = ORD[a] > ORD[b] ? b : a; }
const rel = one.filter(r => ys.has(r.younger));
rel.sort((x,y)=>ORD[x.younger]-ORD[y.younger]||ORD[x.elder]-ORD[y.elder]||(x.source<y.source?-1:1));
console.log('связей:', rel.length);
let cur='';
for (const r of rel) {
  const a=C[r.source], b=C[r.target], t=T[r.type];
  if (r.younger!==cur){cur=r.younger;console.log('\n##### принимающая система: '+P[r.younger].nameRu+' #####');}
  console.log(`--- ${r.source}|${r.target}|${r.type}   [${r.batch}]`);
  console.log(`    [${P[a.philosopher].nameRu}] «${a.label}» → [${P[b.philosopher].nameRu}] «${b.label}»  вес ${r.weight||2}`);
  console.log(`    ${t.label}; слой ${t.layer}${t.symmetric?'; СИММЕТРИЧЕН':''}`);
  console.log(`    СЕЙЧАС: ${r.new}`);
}
