import fs from 'fs';
import {TEXTS} from './texts.mjs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const K = r=>`${r.source}|${r.target}|${r.type}`;
const byBirth = d.philosophers.slice().sort((a,b)=>a.birth-b.birth);
const HERE = byBirth.filter(p=>p.birth>=1859&&p.birth<=1872).map(p=>p.id);
const rel = d.relations.filter(r=>{const a=C[r.source],b=C[r.target];
  return a&&b&&a.philosopher===b.philosopher&&HERE.includes(a.philosopher)&&r.source!==r.target;});
rel.sort((a,b)=>{const pa=HERE.indexOf(C[a.source].philosopher),pb=HERE.indexOf(C[b.source].philosopher);
  if(pa!==pb)return pa-pb; return a.type<b.type?-1:a.type>b.type?1:0;});
const missing = rel.filter(r=>!TEXTS[K(r)]).map(K);
const extra = Object.keys(TEXTS).filter(k=>!rel.some(r=>K(r)===k));
if(missing.length) console.log('БЕЗ ТЕКСТА:',missing);
if(extra.length) console.log('ЛИШНИЕ:',extra);
const FL = JSON.parse(fs.readFileSync('batch09-flags.json','utf8'));
const edits = rel.map(r=>({source:r.source,target:r.target,type:r.type,verdict:'rewrite',
  criteria:FL[K(r)]||['К4','К5'], concept:C[r.source].label, targetConcept:C[r.target].label,
  philosopher:P[C[r.source].philosopher].nameRu, old:r.description, new:TEXTS[K(r)]}));
fs.writeFileSync('edits/batch-09-process-analysis.json', JSON.stringify({meta:{batch:'09',
  title:'Внутрисистемные связи: Гуссерль, Бергсон, Дьюи, Уайтхед, Рассел',
  spec:'descriptions-revision-spec.md',specRevision:3,target:'philosophy_graph.html',
  targetMd5:'aba5d239c816b44b2fcc975f3bc4d1ca',created:'2026-08-09',layer:'inner',
  count:edits.length},edits},null,2)+'\n');
console.log('правок:',edits.length);
