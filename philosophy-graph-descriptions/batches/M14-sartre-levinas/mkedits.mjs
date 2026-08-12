import fs from 'fs';
import {TEXTS, VERDICTS} from './texts.mjs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const K = r=>`${r.source}|${r.target}|${r.type}`;
const PAIRS=[['hegel','sartre'],['schopenhauer','sartre'],['kierkegaard','sartre'],
 ['marx','sartre'],['nietzsche','sartre'],['freud','sartre'],['husserl','sartre'],
 ['bergson','sartre'],['heidegger','sartre'],['bataille','sartre'],['lacan','sartre'],
 ['plato','levinas'],['aristotle','levinas'],['descartes','levinas'],['spinoza','levinas'],
 ['kant','levinas'],['hegel','levinas'],['kierkegaard','levinas'],['husserl','levinas']];
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
const edits=rel.map(r=>{
  const a=C[r.source],b=C[r.target];
  const base={source:r.source,target:r.target,type:r.type,
    concept:a.label,targetConcept:b.label,
    philosopher:P[a.philosopher].nameRu+' → '+P[b.philosopher].nameRu};
  if(!r.description) return {...base, verdict:'write', criteria:['К5б'], new:TEXTS[K(r)]};
  const v=VERDICTS[K(r)]||'rewrite';
  const crit=v==='fix'?['К4']:['К4','К5б'];
  if(/[A-Za-zÀ-ÿ]/.test(r.description)) crit.push('К6');
  return {...base, verdict:v, criteria:crit, old:r.description, new:TEXTS[K(r)]};
});
fs.writeFileSync('edits/batch-M14-sartre-levinas.json', JSON.stringify({meta:{batch:'M14',
 title:'Межсистемные связи: Сартр и Левинас — 19 пар',
 spec:'descriptions-revision-spec.md',specRevision:4,target:'philosophy_graph.html',
 targetMd5:'318c06b58fbdd5bfaaac0c6f7aace658',created:'2026-08-11',layer:'cross',
 count:edits.length},edits},null,2)+'\n');
const c={};for(const e of edits)c[e.verdict]=(c[e.verdict]||0)+1;
console.log('правок:',edits.length,JSON.stringify(c));
