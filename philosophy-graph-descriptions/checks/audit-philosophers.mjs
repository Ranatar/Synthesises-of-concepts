#!/usr/bin/env node
// audit-philosophers.mjs — развёрнутый замер описаний философов.
//   node checks/audit-philosophers.mjs [файл.html]
import fs from 'fs';
const FILE = process.argv[2] || 'dist/philosophy_graph.html';
const L = s => [...(s||'')].length;
const src = fs.readFileSync(FILE,'utf8');
function grab(n){const m=new RegExp('const\\s+'+n+'\\s*=\\s*\\[').exec(src);
 let i=src.indexOf('[',m.index),d=0,j=i,s=null,e=false;
 for(;j<src.length;j++){const c=src[j];
  if(s){if(e){e=false;continue;}if(c==='\\'){e=true;continue;}if(c===s)s=null;continue;}
  if(c==='"'||c==='`'||c==="'"){s=c;continue;}
  if(c==='[')d++;else if(c===']'){d--;if(!d){j++;break;}}}
 return new Function('return ('+src.slice(i,j)+')')();}
const P=grab('philosophers'), C=grab('concepts'), R=grab('relations');
const N=P.length, pc=n=>(n/N*100).toFixed(0)+'%';
const line=(t,n,x='')=>console.log('  '+t.padEnd(50)+String(n).padStart(4)+'  '+(n?pc(n):'').padStart(5)+'  '+x);
const st=a=>{a=a.slice().sort((x,y)=>x-y);const q=p=>a[Math.floor(p*(a.length-1))];
 return `мин ${a[0]} · д10 ${q(.1)} · Q1 ${q(.25)} · мед ${q(.5)} · Q3 ${q(.75)} · д90 ${q(.9)} · макс ${a[a.length-1]} · сред ${Math.round(a.reduce((x,y)=>x+y,0)/a.length)}`;};

console.log('# ЗАМЕР ОПИСАНИЙ ФИЛОСОФОВ\n\nфилософов: '+N+' | концепций: '+C.length+' | связей: '+R.length+'\n');

console.log('## 1. Строение и объём');
console.log('  знаков:  '+st(P.map(p=>L(p.description))));
console.log('  абзацев: '+st(P.map(p=>p.description.split(/\n\n+/).length)));
console.log('  фраз:    '+st(P.map(p=>p.description.split(/(?<=[.!?])\s+/).length)));
line('поле description есть у всех', P.filter(p=>p.description&&p.description.trim()).length);
line('первая фраза вида «Имя — кто он»', P.filter(p=>/^[^—]{3,45}—/.test(p.description)).length);

console.log('\n## 2. Инвариант хранения');
line('двойная кавычка', P.filter(p=>/"/.test(p.description)).length);
line('обратный слэш', P.filter(p=>/\\/.test(p.description)).length);
line('двойной пробел', P.filter(p=>/  /.test(p.description)).length);
line('переводы строк (абзацы) — так и задумано', P.filter(p=>/\n/.test(p.description)).length);
line('одиночный перевод строки (не разделитель абзацев)', P.filter(p=>/[^\n]\n[^\n]/.test(p.description)).length);

console.log('\n## 3. Типографика');
line('дефис между пробелами', P.filter(p=>/ - /.test(p.description)).length);
line('прямая кавычка-апостроф', P.filter(p=>/'/.test(p.description)).length);
line('«ёлочки»', P.filter(p=>/«/.test(p.description)).length);
line('многоточие из трёх точек', P.filter(p=>/\.\.\./.test(p.description)).length);

console.log('\n## 4. Иноязычное');
line('латиница', P.filter(p=>/[A-Za-zÀ-ÿ]/.test(p.description)).length);
line('греческий', P.filter(p=>/[\u0370-\u03FF]/.test(p.description)).length);
const lat={}; for(const p of P) for(const w of (p.description.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]+/g)||[])) lat[w]=(lat[w]||0)+1;
console.log('  чаще всего: '+Object.entries(lat).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w,n])=>w+' '+n).join(', '));

console.log('\n## 5. ДУБЛИРОВАНИЕ ТОГО, ЧТО ОКНО ПЕЧАТАЕТ САМО');
line('повторяет собственное имя (плашка выше)', P.filter(p=>p.description.includes(p.nameRu.split(' ').pop())).length);
line('повторяет годы цифрами (плашка выше)', P.filter(p=>/\b\d{3,4}\b/.test(p.description)).length);
const lbl={}; for(const c of C)(lbl[c.philosopher]=lbl[c.philosopher]||[]).push(c.label.replace(/\s*\(.*?\)/,''));
let ol=0,ot=0; for(const p of P){const h=(lbl[p.id]||[]).filter(l=>p.description.includes(l)); if(h.length){ol++;ot+=h.length;}}
line('называет СВОИ метки концепций (список ниже)', ol, ot+' упоминаний');
const nm=P.map(p=>[p.id,p.nameRu.split(' ').pop()]).filter(([,n])=>L(n)>4);
let al=0,at=0,worst=[]; for(const p of P){const h=nm.filter(([id,n])=>id!==p.id&&p.description.includes(n));
 if(h.length){al++;at+=h.length;worst.push([p.nameRu,h.length]);}}
line('называет ЧУЖИХ философов (взаимодействия ниже)', al, at+' упоминаний');
console.log('    больше всего: '+worst.sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,k])=>n+' '+k).join('; '));
line('глагол влияния (повлиял/критиковал/развивал…)',
 P.filter(p=>/(повлия|оказал влияни|испытал влияни|критикова|полемизирова|развива[лн]|синтезирова|противостоя)/i.test(p.description)).length);

console.log('\n## 6. Школа и традиция');
const sch=['платониз','аристотелиз','стоиц','эпикур','неоплатониз','схоласт','томиз','скотиз','эмпириз','рационализ','идеализ','неокантианств','позитивиз','прагматиз','феноменолог','экзистенциализ','герменевтик','структурализ','постструктурализ','аналитическ','марксиз','психоанализ','номинализ','скептиц'];
line('называет школу или направление', P.filter(p=>sch.some(s=>new RegExp(s,'i').test(p.description))).length);
line('поле для школы в данных', 0, 'ПОЛЯ НЕТ: '+[...new Set(P.flatMap(p=>Object.keys(p)))].join(', '));
line('цвет как признак школы', 0, 'НЕТ: '+new Set(P.map(p=>p.color)).size+' цветов на '+N+' философов');

console.log('\n## 7. Опора и оценки');
line('назван труд в «ёлочках»', P.filter(p=>/«[А-ЯЁA-Z][^»]{3,60}»/.test(p.description)).length);
line('оценочно-историческое суждение', P.filter(p=>/(величайш|знаменит|впервые|огромное влияни|гениальн|революционн|один из самых|крупнейш|выдающ)/i.test(p.description)).length);
line('риторический вопрос или восклицание', P.filter(p=>/[?!]/.test(p.description)).length);

console.log('\n## 8. ОБЪЁМ ПРОТИВ ЭПОХИ И ВЕСА');
const bands=[[-600,0],[0,1300],[1300,1650],[1650,1800],[1800,1880],[1880,2000]];
for(const [a,b] of bands){const g=P.filter(p=>p.birth>=a&&p.birth<b);if(!g.length)continue;
 console.log(`  рождение ${String(a).padStart(5)}..${String(b).padEnd(4)}: ${String(g.length).padStart(2)} чел., средний объём ${Math.round(g.reduce((x,p)=>x+L(p.description),0)/g.length)}`);}
const r=(xs,ys)=>{const mx=xs.reduce((a,b)=>a+b)/xs.length,my=ys.reduce((a,b)=>a+b)/ys.length;
 return (xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/(Math.sqrt(xs.reduce((s,x)=>s+(x-mx)**2,0))*Math.sqrt(ys.reduce((s,y)=>s+(y-my)**2,0)))).toFixed(2);};
const vol=P.map(p=>L(p.description));
const nc={}; for(const c of C) nc[c.philosopher]=(nc[c.philosopher]||0)+1;
const own={}; for(const c of C) own[c.id]=c.philosopher;
const deg={}; for(const rel of R) for(const e of [rel.source,rel.target]) if(own[e]) deg[own[e]]=(deg[own[e]]||0)+1;
console.log('  r(год рождения, объём)   = '+r(P.map(p=>p.birth),vol)+'   ← должно быть ~0');
console.log('  r(число концепций, объём)= '+r(P.map(p=>nc[p.id]||0),vol));
console.log('  r(число связей, объём)   = '+r(P.map(p=>deg[p.id]||0),vol));

console.log('\n## 9. Неповторимость');
const heads={}; for(const p of P){const k=p.description.split(/\s+/).slice(0,6).join(' ').toLowerCase();(heads[k]=heads[k]||[]).push(p.nameRu);}
line('совпадающие зачины (6 слов)', Object.values(heads).filter(v=>v.length>1).length);
const sent={},dup=[];
for(const p of P) for(const s of p.description.split(/(?<=[.!?])\s+/)){const k=s.trim().toLowerCase();if(L(k)<40)continue;
 if(sent[k])dup.push(p.nameRu+' и '+sent[k]);else sent[k]=p.nameRu;}
line('дословно повторяющиеся фразы', dup.length, dup.slice(0,3).join('; '));
