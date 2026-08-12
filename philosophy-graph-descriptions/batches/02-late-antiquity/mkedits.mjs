import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const K = r=>`${r.source}|${r.target}|${r.type}`;

async function build(file, filter, meta, flagsFile){
  const {TEXTS} = await import(file);
  const rel = d.relations.filter(filter);
  const missing = rel.filter(r=>!TEXTS[K(r)]).map(K);
  const extra = Object.keys(TEXTS).filter(k=>!rel.some(r=>K(r)===k));
  if(missing.length) console.log('БЕЗ ТЕКСТА:', missing);
  if(extra.length) console.log('ЛИШНИЕ:', extra);
  const FL = flagsFile? JSON.parse(fs.readFileSync(flagsFile,'utf8')) : {};
  const edits = rel.map(r=>({
    source:r.source, target:r.target, type:r.type, verdict:'rewrite',
    criteria: FL[K(r)] || ['К4','К5'],
    concept: C[r.source].label, targetConcept: C[r.target].label,
    philosopher: P[C[r.source].philosopher].nameRu,
    old: r.description, new: TEXTS[K(r)],
  }));
  fs.writeFileSync(meta.file, JSON.stringify({meta:{...meta.meta,count:edits.length},edits},null,2)+'\n');
  console.log(meta.file, '— правок', edits.length);
}

const B1B = new Set(['panta_rhei|fire|exemplify','eros|cave|exemplify','the_one_plato|eidos|culminate']);
await build('./texts.mjs', r=>B1B.has(K(r)),
  {file:'edits/batch-01b-deferred.json', meta:{batch:'01b',
   title:'Три связи, отложенные в заходе 1 (разметка проверена — правится описание)',
   spec:'descriptions-revision-spec.md',specRevision:3,target:'philosophy_graph.html',
   targetMd5:'6da5b3275cd2af3ae2b2b46fe5cf88e3',created:'2026-08-09',layer:'inner'}},
  'batch01b-flags.json');

const byBirth = d.philosophers.slice().sort((a,b)=>a.birth-b.birth);
const HERE = byBirth.filter(p=>p.birth>=-384&&p.birth<=354).map(p=>p.id);
const ORD = HERE;
await build('./texts.mjs',
  r=>{const a=C[r.source],b=C[r.target];
      return a&&b&&a.philosopher===b.philosopher&&HERE.includes(a.philosopher)&&r.source!==r.target;},
  {file:'edits/batch-02-late-antiquity.json', meta:{batch:'02',
   title:'Внутрисистемные связи: Аристотель, Эпикур, Марк Аврелий, Плотин, Августин',
   spec:'descriptions-revision-spec.md',specRevision:3,target:'philosophy_graph.html',
   targetMd5:'6da5b3275cd2af3ae2b2b46fe5cf88e3',created:'2026-08-09',layer:'inner'}},
  'batch02-flags.json');
