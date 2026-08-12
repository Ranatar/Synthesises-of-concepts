import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const cById = Object.fromEntries(d.concepts.map(c=>[c.id,c]));
const pById = Object.fromEntries(d.philosophers.map(p=>[p.id,p]));
const tById = Object.fromEntries(d.relationTypes.map(t=>[t.id,t]));
const rows = d.relations.map((r,i)=>{
  const cs=cById[r.source], ct=cById[r.target];
  return {i,r,cs,ct,ps:cs&&cs.philosopher,pt:ct&&ct.philosopher,desc:(r.description||'').trim()};
}).filter(x=>x.desc);
const N=rows.length;
function pct(n){return (100*n/N).toFixed(1)+'%';}

// 1. латиница
const lat = rows.filter(x=>/[A-Za-z]/.test(x.desc));
const latWords = {};
for(const x of lat) for(const w of x.desc.match(/[A-Za-z][A-Za-z\-']*/g)||[]) latWords[w]=(latWords[w]||0)+1;
console.log('С латиницей:', lat.length, pct(lat.length));
console.log('Топ латинских слов:', Object.entries(latWords).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([w,n])=>w+':'+n).join(', '));
// греческий/иное
const grk = rows.filter(x=>/[\u0370-\u03FF\u1F00-\u1FFF]/.test(x.desc));
console.log('С греческим:', grk.length, pct(grk.length));

// 2. упоминание меток концепций
function mentions(desc,label){
  if(!label) return false;
  const base = label.replace(/\s*\(.*?\)\s*/g,'').trim();
  const head = base.split(/[\s-]/)[0];
  const stem = head.length>5? head.slice(0,head.length-2): head;
  return desc.toLowerCase().includes(stem.toLowerCase());
}
const noSrc = rows.filter(x=>!mentions(x.desc,x.cs&&x.cs.label));
const noTgt = rows.filter(x=>!mentions(x.desc,x.ct&&x.ct.label));
const noBoth = rows.filter(x=>!mentions(x.desc,x.cs&&x.cs.label)&&!mentions(x.desc,x.ct&&x.ct.label));
console.log('Не называет источник:', noSrc.length, pct(noSrc.length), '| цель:', noTgt.length, pct(noTgt.length), '| ни одной:', noBoth.length, pct(noBoth.length));

// 3. дублирование характеристик: название типа словом
const typeWords = {oppose:/противопоставл/i, dialogue:/диалог/i, critique:/критик/i, influence:/влия/i, develop:/развива|развитие/i,
 synthesize:/синтез/i, typological:/типологическ/i, typological_opposition:/типологическ/i, consequence:/следств|следует/i,
 presuppose:/предполага/i, condition:/услови/i, exemplify:/пример|иллюстр/i, instrument:/инструмент|средств/i,
 culminate:/кульмин/i, complement:/дополня/i, internal_contradiction:/противоречи/i, emerge_from:/возника/i,
 limit:/ограничи|предел/i, mediate:/опосред/i, correlative:/взаимоопредел|соотносительн/i, apply:/примен/i};
let dupType=0; const dupByType={};
for(const x of rows){ const re=typeWords[x.r.type]; if(re&&re.test(x.desc)){dupType++; dupByType[x.r.type]=(dupByType[x.r.type]||0)+1;} }
console.log('Пересказывает название типа:', dupType, pct(dupType), JSON.stringify(dupByType));

// вес/годы/направление словами
const yrs = rows.filter(x=>/\b1[0-9]{3}\b|\b[0-9]{3,4}\s*(г\.|году|до н\.э\.)/.test(x.desc));
console.log('Содержит годы:', yrs.length, pct(yrs.length));

// 4. зачины
const openers = {};
for(const x of rows){ const w=x.desc.split(/[\s:,.]/).slice(0,2).join(' '); openers[w]=(openers[w]||0)+1; }
console.log('Топ зачинов:', Object.entries(openers).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([w,n])=>`«${w}»:${n}`).join(', '));

// формула «Метка: ...» в начале
const colonHead = rows.filter(x=>/^[^.!?]{1,60}:\s/.test(x.desc));
console.log('Начинается с «Заголовок: »:', colonHead.length, pct(colonHead.length));

// 5. дубли описаний
const byDesc={}; for(const x of rows) (byDesc[x.desc] ||= []).push(x);
const dups = Object.entries(byDesc).filter(([k,v])=>v.length>1);
console.log('Повторяющиеся описания:', dups.length, 'групп,', dups.reduce((a,[k,v])=>a+v.length,0),'связей');
dups.slice(0,5).forEach(([k,v])=>console.log('   ×'+v.length, k.slice(0,90)));

// 6. число фраз
const sent = rows.map(x=>(x.desc.match(/[.!?…](\s|$)/g)||[]).length);
const hist={}; for(const s of sent) hist[s]=(hist[s]||0)+1;
console.log('Число завершённых фраз:', JSON.stringify(hist));

// 7. внутренние связи с именем философа
const innerRows = rows.filter(x=>x.ps===x.pt && x.ps);
let innerNamed=0;
for(const x of innerRows){ const p=pById[x.ps]; if(p && x.desc.includes(p.nameRu.split(' ').pop())) innerNamed++; }
console.log('Внутренних с именем своего философа:', innerNamed, 'из', innerRows.length);

// 8. внешние без имён обоих философов
const outRows = rows.filter(x=>x.ps!==x.pt);
let outNamed=0;
for(const x of outRows){ const a=pById[x.ps],b=pById[x.pt];
  const has=(p)=>p&&x.desc.includes(p.nameRu.split(' ').pop());
  if(has(a)&&has(b)) outNamed++; }
console.log('Внешних, называющих обоих философов:', outNamed, 'из', outRows.length);
