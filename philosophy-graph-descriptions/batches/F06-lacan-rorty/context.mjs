// Контекст захода Ф01. Запускать ИЗ КОРНЯ рабочей папки:
//   node batches/F01-antiquity/context.mjs > batches/F01-antiquity/context.txt
// Печатает по каждому философу: запись, описание с разбивкой на абзацы,
// и ОТДЕЛЬНО то, что окно считает само (Ф3-Ф5): плашку, взаимодействия из
// рёбер и список своих концепций. Дублировать это в описании запрещено.
import fs from 'fs';
export const PHILS = ['lacan','sartre','levinas','merleau_ponty','quine',
  'deleuze','foucault','derrida','rorty'];
const src = fs.readFileSync('dist/philosophy_graph.html','utf8');
function grab(name){const m=new RegExp('const\\s+'+name+'\\s*=\\s*\\[').exec(src);
 let i=src.indexOf('[',m.index),depth=0,j=i,inStr=null,esc=false;
 for(;j<src.length;j++){const ch=src[j];
  if(inStr){if(esc){esc=false;continue;}if(ch==='\\'){esc=true;continue;}if(ch===inStr)inStr=null;continue;}
  if(ch==='"'||ch==="'"||ch==='`'){inStr=ch;continue;}
  if(ch==='/'&&src[j+1]==='/'){while(j<src.length&&src[j]!=='\n')j++;continue;}
  if(ch==='[')depth++;else if(ch===']'){depth--;if(!depth){j++;break;}}}
 return new Function('return ('+src.slice(i,j)+')')();}
const philosophers=grab('philosophers'), concepts=grab('concepts'),
      relations=grab('relations'), types=grab('relationTypes');
const PH=Object.fromEntries(philosophers.map(p=>[p.id,p]));
const C=Object.fromEntries(concepts.map(c=>[c.id,c]));
const TY=Object.fromEntries(types.map(t=>[t.id,t]));
const L=s=>[...(s||'')].length;
// ВЫВОД ТОЛЬКО ПРИ ПРЯМОМ ЗАПУСКЕ. mkedits импортирует отсюда PHILS, чтобы
// список философов захода жил в одном месте; без этой заставы импорт печатал
// весь контекст в поток сборки.
import {pathToFileURL} from 'url';
if (import.meta.url !== pathToFileURL(process.argv[1]).href) {
  // импортировано — молчим
} else {
if (process.argv[2]==='--list'){console.log(PHILS.join(' '));process.exit(0);}
console.log('философов в заходе: '+PHILS.length);
for(const id of PHILS){
  const p=PH[id];
  const mine=concepts.filter(c=>c.philosopher===id);
  const own=new Set(mine.map(c=>c.id));
  const ext=relations.filter(r=>(own.has(r.source))!==(own.has(r.target)));
  const by={};
  for(const r of ext){
    const outg=own.has(r.source);
    const other=C[outg?r.target:r.source].philosopher;
    const t=r.type, sym=r.bidirectional||(TY[t]||{}).symmetric;
    const slot=sym?'взаимно':(outg?'исходящее':'входящее');
    ((by[t]=by[t]||{})[slot]=by[t][slot]||new Set()).add(PH[other].nameRu);
  }
  console.log('\n\n================ '+p.nameRu+'  ['+p.id+'] ================');
  console.log('ЗАПИСЬ: name '+p.name+' | years '+p.years+' | birth '+p.birth+' | death '+p.death);
  console.log('ОБЪЁМ: '+L(p.description)+' знаков (коридор 1800-2600), абзацев '
    +p.description.split(/\n\n+/).length+' (коридор 4-7), фраз '
    +p.description.split(/(?<=[.!?])\s+/).filter(Boolean).length);
  console.log('\n--- ОКНО ПЕЧАТАЕТ САМО, ДУБЛИРОВАТЬ ЗАПРЕЩЕНО (Ф3-Ф5) ---');
  console.log('  плашка: '+p.nameRu+' / '+p.years);
  console.log('  ВЗАИМОДЕЙСТВИЯ (из рёбер, '+ext.length+' внешних связей):');
  for(const [t,slots] of Object.entries(by))
    for(const [slot,set] of Object.entries(slots))
      console.log('    '+t+' '+slot+': '+[...set].join(', '));
  console.log('  СВОИ КОНЦЕПЦИИ ('+mine.length+', печатаются списком с подписью и абзацем):');
  for(const c of mine) console.log('    «'+c.label+'» — '+c.description);
  console.log('\n--- ТЕКУЩЕЕ ОПИСАНИЕ ---');
  p.description.split(/\n\n+/).forEach((a,k)=>console.log('  ['+(k+1)+'] '+a));
}
}
