import fs from 'fs';
const PHILS = ['schelling','schopenhauer','comte','kierkegaard'];
const src = fs.readFileSync('dist/philosophy_graph.html','utf8');
function grab(name){const m=new RegExp('const\\s+'+name+'\\s*=\\s*\\[').exec(src);
 let i=src.indexOf('[',m.index),depth=0,j=i,inStr=null,esc=false;
 for(;j<src.length;j++){const ch=src[j];
  if(inStr){if(esc){esc=false;continue;}if(ch==='\\'){esc=true;continue;}if(ch===inStr)inStr=null;continue;}
  if(ch==='"'||ch==="'"||ch==='`'){inStr=ch;continue;}
  if(ch==='/'&&src[j+1]==='/'){while(j<src.length&&src[j]!=='\n')j++;continue;}
  if(ch==='[')depth++;else if(ch===']'){depth--;if(!depth){j++;break;}}}
 return new Function('return ('+src.slice(i,j)+')')();}
const concepts=grab('concepts'), philosophers=grab('philosophers'), relations=grab('relations');
const PH=Object.fromEntries(philosophers.map(p=>[p.id,p]));
const C=Object.fromEntries(concepts.map(c=>[c.id,c]));
const L=s=>[...(s||'')].length;
// степень и соседи — для П5.5 и П11
const inc={}, out={};
for(const r of relations){(out[r.source]=out[r.source]||[]).push(r);(inc[r.target]=inc[r.target]||[]).push(r);}
const mine=concepts.filter(c=>PHILS.includes(c.philosopher));
console.log('концепций:',mine.length);
let cur='';
for(const c of mine){
  if(c.philosopher!==cur){cur=c.philosopher;console.log('\n##### '+PH[cur].nameRu+' #####');}
  const o=out[c.id]||[], i=inc[c.id]||[];
  const deg=o.length+i.length;
  console.log('\n--- '+c.id+'   «'+c.label+'»   степень '+deg+'  (исходящих '+o.length+', входящих '+i.length+')');
  console.log('    рубрики: '+(c.rubrics||[]).join(', '));
  console.log('    ПОДПИСЬ ['+L(c.description)+']: '+c.description);
  console.log('    АБЗАЦ ['+L(c.extendedDescription)+']: '+c.extendedDescription);
  const nb = [...o.map(r=>'→ '+PH[C[r.target].philosopher].nameRu+' «'+C[r.target].label+'» ('+r.type+')'),
              ...i.map(r=>'← '+PH[C[r.source].philosopher].nameRu+' «'+C[r.source].label+'» ('+r.type+')')];
  console.log('    СОСЕДИ ПО ГРАФУ (о них говорят рёбра, не абзац): '+nb.join('; '));
}
