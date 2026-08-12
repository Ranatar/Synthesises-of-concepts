import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const T = Object.fromEntries(d.relationTypes.map(x=>[x.id,x]));
const ORD = Object.fromEntries(d.philosophers.map((x,i)=>[x.id,i]));
const YOUNGER = ['heidegger','carnap','bataille','gadamer','lacan','sartre'];
const ys = new Set(YOUNGER);
// нынешние описания — из dist (состояние ДО этого захода)
const src = fs.readFileSync('dist/philosophy_graph.html','utf8');
function grab(name){const m=new RegExp('const\\s+'+name+'\\s*=\\s*\\[').exec(src);
 let i=src.indexOf('[',m.index),depth=0,j=i,inStr=null,esc=false;
 for(;j<src.length;j++){const ch=src[j];
  if(inStr){if(esc){esc=false;continue;}if(ch==='\\'){esc=true;continue;}if(ch===inStr)inStr=null;continue;}
  if(ch==='"'||ch==="'"||ch==='`'){inStr=ch;continue;}
  if(ch==='/'&&src[j+1]==='/'){while(j<src.length&&src[j]!=='\n')j++;continue;}
  if(ch==='[')depth++;else if(ch===']'){depth--;if(!depth){j++;break;}}}
 return new Function('return ('+src.slice(i,j)+')')();}
const REL = Object.fromEntries(grab('relations').map(r=>[`${r.source}|${r.target}|${r.type}`,r]));
// какие связи получали приговор fix в прежних заходах
const files = fs.readdirSync('edits').filter(f=>f.endsWith('.json')).sort();
const fixKeys = new Map();
for (const f of files) { const e = JSON.parse(fs.readFileSync('edits/'+f,'utf8'));
  if (e.meta.batch.startsWith('C')) continue;
  for (const x of e.edits) if (x.verdict === 'fix') fixKeys.set(`${x.source}|${x.target}|${x.type}`, e.meta.batch); }
const first = s => s.split(/(?<=[.!?])\s+/)[0];
const rel = [];
for (const [k, batch] of fixKeys) {
  const r = REL[k];
  if (/[:—]/.test(first(r.description))) continue;      // уже двухчастный — не трогаем
  const a = C[r.source].philosopher, b = C[r.target].philosopher;
  const younger = ORD[a] > ORD[b] ? a : b, elder = ORD[a] > ORD[b] ? b : a;
  if (!ys.has(younger)) continue;
  rel.push({key:k, r, batch, younger, elder});
}
rel.sort((x,y)=>ORD[x.younger]-ORD[y.younger]||ORD[x.elder]-ORD[y.elder]||(x.r.source<y.r.source?-1:1));
console.log('связей:', rel.length);
let cur='';
for (const {key, r, batch, younger} of rel) {
  const a=C[r.source], b=C[r.target], t=T[r.type];
  if (younger!==cur){cur=younger;console.log('\n##### принимающая система: '+P[younger].nameRu+' #####');}
  console.log(`--- ${key}   [${batch}]`);
  console.log(`    [${P[a.philosopher].nameRu}] «${a.label}» → [${P[b.philosopher].nameRu}] «${b.label}»`);
  console.log(`    ${t.label}; слой ${t.layer}`);
  console.log(`    СЕЙЧАС: ${r.description}`);
}
