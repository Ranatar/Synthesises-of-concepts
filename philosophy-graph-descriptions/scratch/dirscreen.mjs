import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const cById = Object.fromEntries(d.concepts.map(c=>[c.id,c]));
const tById = Object.fromEntries(d.relationTypes.map(t=>[t.id,t]));
function stem(label){
  let b = label.replace(/\s*\(.*?\)\s*/g,' ').trim();
  const w = b.split(/[\s\-—]+/)[0];
  return (w.length>5? w.slice(0,w.length-2): w).toLowerCase();
}
// маркеры: [регулярка, кто основание относительно маркера] 'before' | 'after'
const MARK = [
  [/следует из|вытекает из|проистека\w* из|выводится из|обусловлен\w* (?!не)|возникает из|рождается из|порожда\w*ся |опира\w*ся на|основан\w* на|предполага\w+|коренится в|зависит от|требует |восходит к/gi,'after'],
  [/следует |влечёт|влечет|порожда\w+ |ведёт к|ведет к|даёт |дает |обосновыва\w+ |делает возможн\w+|позволяет |производит |развёртыва\w+ в|разворачива\w+ся в|обусловливает|определяет /gi,'before'],
];
const rows=[];
for(const r of d.relations){
  const t=tById[r.type]; if(!t||!t.ground) continue;
  const cs=cById[r.source], ct=cById[r.target];
  const desc=(r.description||'').trim(); if(!desc||r.source===r.target) continue;
  const ss=stem(cs.label), st=stem(ct.label);
  if(ss===st) continue;
  const low=desc.toLowerCase();
  const posS=[...low.matchAll(new RegExp(ss.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))].map(m=>m.index);
  const posT=[...low.matchAll(new RegExp(st.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))].map(m=>m.index);
  if(!posS.length||!posT.length) continue;
  let verdict=null, marker=null;
  for(const [re,side] of MARK){
    re.lastIndex=0; let m;
    while((m=re.exec(desc))){
      const at=m.index;
      const before=(arr)=>arr.filter(p=>p<at).pop();
      const after=(arr)=>arr.find(p=>p>at);
      let groundPos = side==='after'? Math.min(...[after(posS),after(posT)].filter(v=>v!==undefined).concat([Infinity]))
                                    : Math.max(...[before(posS),before(posT)].filter(v=>v!==undefined).concat([-1]));
      if(!isFinite(groundPos)||groundPos<0) continue;
      const isS = posS.includes(groundPos), isT = posT.includes(groundPos);
      if(isS===isT) continue;
      verdict = isS? 'source':'target'; marker=m[0].trim(); break;
    }
    if(verdict) break;
  }
  if(!verdict) continue;
  rows.push({type:r.type, expected:t.ground, got:verdict, ok:verdict===t.ground, marker,
             s:cs.label, tg:ct.label, desc});
}
const bad = rows.filter(x=>!x.ok);
console.log('Опознано формулировок основания:', rows.length, ' расхождений:', bad.length, (100*bad.length/rows.length).toFixed(0)+'%');
const byT={}; for(const x of rows){ (byT[x.type] ||= [0,0]); byT[x.type][1]++; if(!x.ok) byT[x.type][0]++; }
for(const [k,v] of Object.entries(byT).sort((a,b)=>b[1][1]-a[1][1])) console.log(`  ${k.padEnd(14)} расхождений ${String(v[0]).padStart(3)} из ${v[1]}`);
console.log('\nПримеры расхождений:');
for(const x of bad.slice(0,12)) console.log(`  [${x.type} основание в ${x.expected}] «${x.s}» → «${x.tg}» (маркер: ${x.marker})\n     ${x.desc.slice(0,150)}`);
