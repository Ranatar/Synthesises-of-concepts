import fs from 'fs';
import {HEAD, TAIL} from './texts.mjs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
// нынешние описания берём из dist — они и есть old
const src = fs.readFileSync('dist/philosophy_graph.html','utf8');
function grab(name){const m=new RegExp('const\\s+'+name+'\\s*=\\s*\\[').exec(src);
 let i=src.indexOf('[',m.index),depth=0,j=i,inStr=null,esc=false;
 for(;j<src.length;j++){const ch=src[j];
  if(inStr){if(esc){esc=false;continue;}if(ch==='\\'){esc=true;continue;}if(ch===inStr)inStr=null;continue;}
  if(ch==='"'||ch==="'"||ch==='`'){inStr=ch;continue;}
  if(ch==='/'&&src[j+1]==='/'){while(j<src.length&&src[j]!=='\n')j++;continue;}
  if(ch==='[')depth++;else if(ch===']'){depth--;if(!depth){j++;break;}}}
 return new Function('return ('+src.slice(i,j)+')')();}
const REL = Object.fromEntries(grab('relations').map(r=>[`${r.source}|${r.target}|${r.type}`,r]));
const split = s => s.split(/(?<=[.!?])\s+/);
const lower = s => s.charAt(0).toLowerCase() + s.slice(1);

const keys = Object.keys(HEAD);
const missing = keys.filter(k=>!REL[k]);
if (missing.length) { console.log('НЕТ ТАКИХ СВЯЗЕЙ:', missing); process.exitCode = 1; }
const badTail = Object.keys(TAIL).filter(k=>!HEAD[k]);
if (badTail.length) { console.log('TAIL без HEAD:', badTail); process.exitCode = 1; }

const edits = keys.map(k => {
  const r = REL[k];
  const parts = split(r.description);
  const head = HEAD[k];
  const body = TAIL[k] !== undefined ? TAIL[k] : lower(parts[0].replace(/[.]$/,''));
  const rest = parts.slice(1).join(' ');
  const nw = `${head}: ${body}. ${rest}`;
  const a = C[r.source], b = C[r.target];
  return {source:r.source, target:r.target, type:r.type,
    concept:a.label, targetConcept:b.label,
    philosopher: P[a.philosopher].nameRu + ' → ' + P[b.philosopher].nameRu,
    verdict:'fix', criteria:['К7','К8'],
    old:r.description, new:nw,
    note:'восстановлен двухчастный зачин: заголовочная часть плюс разворот; вторая фраза не тронута'};
});
fs.writeFileSync('edits/batch-C02-nietzsche-wittgenstein.json', JSON.stringify({meta:{batch:'C02',
 title:'Поправка строя fix-описаний: принимающие системы от Ницше до Витгенштейна',
 spec:'descriptions-revision-spec.md', specRevision:4, target:'philosophy_graph.html',
 targetMd5:'313f2912921f20a8aa93308baef44b98', created:'2026-08-11', layer:'cross-correction',
 count:edits.length}, edits}, null, 2)+'\n');
// сторож: вторая фраза обязана совпасть дословно
let bad=0;
for (const e of edits) {
  const o = split(e.old).slice(1).join(' '), n = split(e.new).slice(1).join(' ');
  if (o !== n) { bad++; console.log('!! вторая фраза разошлась:', e.source+'|'+e.target+'|'+e.type); }
}
console.log('правок:', edits.length, '| вторая фраза дословна у', edits.length-bad, 'из', edits.length);
