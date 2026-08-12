import fs from 'fs';
import {TEXTS, DEFERRED} from './texts.mjs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const HERE = ['pythagoras','heraclitus','parmenides','socrates','plato'];
const rel = d.relations.filter(r=>{
  const a=C[r.source],b=C[r.target];
  return a&&b&&a.philosopher===b.philosopher&&HERE.includes(a.philosopher)&&r.source!==r.target;
});
rel.sort((a,b)=>{
  const pa=HERE.indexOf(C[a.source].philosopher), pb=HERE.indexOf(C[b.source].philosopher);
  if(pa!==pb) return pa-pb;
  return a.type<b.type?-1:a.type>b.type?1:0;
});
const K=r=>`${r.source}|${r.target}|${r.type}`;
const missing = rel.filter(r=>!TEXTS[K(r)]&&!DEFERRED[K(r)]).map(K);
const extra = [...Object.keys(TEXTS),...Object.keys(DEFERRED)].filter(k=>!rel.some(r=>K(r)===k));
if(missing.length) console.log('БЕЗ ТЕКСТА:', missing);
if(extra.length) console.log('ЛИШНИЕ КЛЮЧИ:', extra);
const CRIT = {
  К1:'направленность', К2:'тип', К3:'концепции', К4:'недублирование',
  К5:'содержание', К6:'язык', К7:'объём', К8:'неповторимость'};
// какие критерии нарушало старое описание — вывожу разбором
const FLAGS = JSON.parse(fs.readFileSync('batch01-flags.json','utf8'));
const edits = rel.map(r=>{
  const k=K(r);
  if(DEFERRED[k]) return {source:r.source,target:r.target,type:r.type,verdict:'defer',
    concept:C[r.source].label, targetConcept:C[r.target].label,
    philosopher:P[C[r.source].philosopher].nameRu, old:r.description, note:DEFERRED[k]};
  return {source:r.source,target:r.target,type:r.type,verdict:'rewrite',
    criteria:FLAGS[k]||['К4','К5'],
    concept:C[r.source].label, targetConcept:C[r.target].label,
    philosopher:P[C[r.source].philosopher].nameRu,
    old:r.description, new:TEXTS[k]};
});
const out={meta:{batch:'01',title:'Внутрисистемные связи: Пифагор, Гераклит, Парменид, Сократ, Платон',
  spec:'descriptions-revision-spec.md',specRevision:2,target:'philosophy_graph.html',
  targetMd5:'3cfd69b1d71571f00f27deb280579148',created:'2026-08-09',layer:'inner',count:edits.length},edits};
fs.writeFileSync('edits/batch-01-antiquity.json', JSON.stringify(out,null,2)+'\n');
console.log('правок:',edits.length,'| rewrite',edits.filter(e=>e.verdict==='rewrite').length,
            '| defer',edits.filter(e=>e.verdict==='defer').length);
