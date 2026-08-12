import fs from 'fs';
import {TEXTS} from './texts.mjs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const K = r=>`${r.source}|${r.target}|${r.type}`;
const PAIRS=[["pythagoras","parmenides"],["heraclitus","parmenides"],["pythagoras","plato"],["heraclitus","plato"],["parmenides","plato"],["socrates","plato"],["pythagoras","aristotle"],["heraclitus","aristotle"],["parmenides","aristotle"],["socrates","aristotle"],["plato","aristotle"],["plato","epicurus"]];
const set=new Set(PAIRS.map(p=>p.slice().sort().join('|')));
const order=p=>PAIRS.findIndex(x=>x.slice().sort().join('|')===p);
const rel=d.relations.filter(r=>{const a=C[r.source].philosopher,b=C[r.target].philosopher;
 return a!==b&&set.has([a,b].sort().join('|'));});
rel.sort((x,y)=>{const kx=[C[x.source].philosopher,C[x.target].philosopher].sort().join('|');
 const ky=[C[y.source].philosopher,C[y.target].philosopher].sort().join('|');
 return order(kx)-order(ky)||(x.type<y.type?-1:1);});
const missing=rel.filter(r=>!TEXTS[K(r)]).map(K);
const extra=Object.keys(TEXTS).filter(k=>!rel.some(r=>K(r)===k));
if(missing.length)console.log('БЕЗ ТЕКСТА:',missing);
if(extra.length)console.log('ЛИШНИЕ:',extra);
const FL=JSON.parse(fs.readFileSync('batchM01-flags.json','utf8'));
const edits=rel.map(r=>{
  const a=C[r.source],b=C[r.target];
  const base={source:r.source,target:r.target,type:r.type,
    concept:a.label,targetConcept:b.label,
    philosopher:P[a.philosopher].nameRu+' → '+P[b.philosopher].nameRu};
  if(!r.description) return {...base, verdict:'write', criteria:['К5б'], new:TEXTS[K(r)]};
  return {...base, verdict:'rewrite', criteria:FL[K(r)]||['К4','К5б'], old:r.description, new:TEXTS[K(r)]};
});
fs.writeFileSync('edits/batch-M01-antiquity-cross.json', JSON.stringify({meta:{batch:'M01',
 title:'Межсистемные связи: античность — 12 пар (Пифагор, Гераклит, Парменид, Сократ, Платон, Аристотель, Эпикур)',
 spec:'descriptions-revision-spec.md',specRevision:4,target:'philosophy_graph.html',
 targetMd5:'e7481c27a88a058950a4df21b5e52e4a',created:'2026-08-10',layer:'cross',
 count:edits.length},edits},null,2)+'\n');
console.log('правок:',edits.length,'| rewrite',edits.filter(e=>e.verdict==='rewrite').length,
            '| write',edits.filter(e=>e.verdict==='write').length);
