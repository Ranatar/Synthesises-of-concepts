import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const cById = Object.fromEntries(d.concepts.map(c=>[c.id,c]));
const pById = Object.fromEntries(d.philosophers.map(p=>[p.id,p]));
const tById = Object.fromEntries(d.relationTypes.map(t=>[t.id,t]));
const R = d.relations;
let miss=[], loops=0;
const rows = R.map(r=>{
  const cs=cById[r.source], ct=cById[r.target];
  const ps=cs?cs.philosopher:null, pt=ct?ct.philosopher:null;
  const inner = ps && pt && ps===pt;
  const self = r.source===r.target;
  const desc = (r.description||'').trim();
  return {r, ps, pt, inner, self, desc, len:[...desc].length, bytes:Buffer.byteLength(desc,'utf8')};
});
const withD = rows.filter(x=>x.desc.length>0);
const noD = rows.filter(x=>!x.desc.length);
console.log('всего связей', R.length);
console.log('с описанием', withD.length, 'без', noD.length);
const inner = rows.filter(x=>x.inner), outer = rows.filter(x=>!x.inner);
console.log('внутренних', inner.length, 'с описанием', inner.filter(x=>x.desc).length);
console.log('внешних', outer.length, 'с описанием', outer.filter(x=>x.desc).length);
console.log('рефлексивных', rows.filter(x=>x.self).length, 'с описанием', rows.filter(x=>x.self&&x.desc).length);
function stat(arr,f=x=>x.len){
  const v=arr.map(f).sort((a,b)=>a-b);
  if(!v.length) return 'нет';
  const q=p=>v[Math.floor((v.length-1)*p)];
  const mean=v.reduce((a,b)=>a+b,0)/v.length;
  return `n=${v.length} мин=${v[0]} q10=${q(.1)} q25=${q(.25)} мед=${q(.5)} q75=${q(.75)} q90=${q(.9)} макс=${v[v.length-1]} сред=${mean.toFixed(0)}`;
}
console.log('ЗНАКОВ все:', stat(withD));
console.log('ЗНАКОВ внутр:', stat(inner.filter(x=>x.desc)));
console.log('ЗНАКОВ внеш:', stat(outer.filter(x=>x.desc)));
console.log('БАЙТ все:', stat(withD,x=>x.bytes));
// по типам
console.log('\n-- по типам --');
const byType={};
for(const x of rows){ (byType[x.r.type] ||= []).push(x); }
for(const [t,arr] of Object.entries(byType).sort((a,b)=>b[1].length-a[1].length)){
  const wd=arr.filter(x=>x.desc);
  const ty=tById[t]||{};
  console.log(`${t.padEnd(24)} ${String(arr.length).padStart(4)}  опис ${String(wd.length).padStart(4)}  слой ${(ty.layer||'?').padEnd(11)} сред.знаков ${wd.length?Math.round(wd.reduce((a,b)=>a+b.len,0)/wd.length):'-'}`);
}
// философы по хронологии
console.log('\n-- внутренние связи по философам (хронология) --');
const ph = d.philosophers.slice().sort((a,b)=>a.birth-b.birth);
let acc=0;
for(const p of ph){
  const arr = inner.filter(x=>x.ps===p.id);
  const wd = arr.filter(x=>x.desc);
  acc+=arr.length;
  console.log(`${String(p.birth).padStart(5)} ${p.nameRu.padEnd(22)} связей ${String(arr.length).padStart(3)} опис ${String(wd.length).padStart(3)} сред ${wd.length?Math.round(wd.reduce((a,b)=>a+b.len,0)/wd.length):'-'} накопл ${acc}`);
}
