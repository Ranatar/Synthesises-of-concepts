import fs from 'fs';
const L = s => [...(s||'')].length;
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const P = Object.fromEntries(d.philosophers.map(p=>[p.id,p]));
const C = d.concepts;
const N = C.length;
const pc = n => (n/N*100).toFixed(1)+'%';
const sent = s => s.split(/(?<=[.!?])\s+/).filter(Boolean).length;
const st = a => {a=a.slice().sort((x,y)=>x-y);const q=p=>a[Math.floor(p*(a.length-1))];
  return `мин ${a[0]} · д10 ${q(.1)} · Q1 ${q(.25)} · мед ${q(.5)} · Q3 ${q(.75)} · д90 ${q(.9)} · макс ${a[a.length-1]} · сред ${Math.round(a.reduce((x,y)=>x+y,0)/a.length)}`;};
const line = (t,n,extra='') => console.log('  '+t.padEnd(52)+String(n).padStart(5)+'  '+(n?pc(n):'').padStart(7)+'  '+extra);

console.log('# ЗАМЕР ОПИСАНИЙ КОНЦЕПЦИЙ\n');
console.log('концепций: '+N+' у '+d.philosophers.length+' философов\n');

console.log('## 1. Объём и строение');
console.log('  подпись  (description):        '+st(C.map(c=>L(c.description))));
console.log('  абзац (extendedDescription):   '+st(C.map(c=>L(c.extendedDescription))));
const dS={},eS={};for(const c of C){dS[sent(c.description)]=(dS[sent(c.description)]||0)+1;eS[sent(c.extendedDescription)]=(eS[sent(c.extendedDescription)]||0)+1;}
console.log('  фраз в подписи:  '+JSON.stringify(dS));
console.log('  фраз в абзаце:   '+JSON.stringify(eS));
line('подписей, кончающихся точкой', C.filter(c=>/[.!?]$/.test(c.description.trim())).length);
line('абзацев, не кончающихся точкой', C.filter(c=>!/[.!?]$/.test(c.extendedDescription.trim())).length);

console.log('\n## 2. Инвариант хранения');
line('двойная кавычка в подписи или абзаце', C.filter(c=>/"/.test(c.description+c.extendedDescription)).length);
line('обратный слэш', C.filter(c=>/\\/.test(c.description+c.extendedDescription)).length);
line('перевод строки или табуляция', C.filter(c=>/[\n\r\t]/.test(c.description+c.extendedDescription)).length);
line('двойной пробел', C.filter(c=>/  /.test(c.description+c.extendedDescription)).length);

console.log('\n## 3. Типографика');
line('дефис между пробелами в абзаце', C.filter(c=>/ - /.test(c.extendedDescription)).length);
line('дефис между пробелами в подписи', C.filter(c=>/ - /.test(c.description)).length);
line('прямая кавычка-апостроф', C.filter(c=>/'/.test(c.description+c.extendedDescription)).length);
line('«ёлочки»', C.filter(c=>/«/.test(c.description+c.extendedDescription)).length);
line('многоточие из трёх точек', C.filter(c=>/\.\.\./.test(c.extendedDescription)).length);

console.log('\n## 4. Иноязычные вкрапления');
const LAT=/[A-Za-zÀ-ÿ]/, GRK=/[\u0370-\u03FF]/;
line('латиница в абзаце', C.filter(c=>LAT.test(c.extendedDescription)).length);
line('латиница в подписи', C.filter(c=>LAT.test(c.description)).length);
line('греческий в абзаце', C.filter(c=>GRK.test(c.extendedDescription)).length);
line('и латиница, и греческий', C.filter(c=>LAT.test(c.extendedDescription)&&GRK.test(c.extendedDescription)).length);
const latWords={};
for(const c of C) for(const w of (c.extendedDescription.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]+/g)||[])) latWords[w]=(latWords[w]||0)+1;
console.log('  чаще всего: '+Object.entries(latWords).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([w,n])=>w+' '+n).join(', '));

console.log('\n## 5. Дублирование плашки (К4-аналог)');
const headWord = c => c.label.replace(/\(.*?\)/g,'').trim().split(/\s+/).filter(w=>L(w)>4)[0];
line('абзац повторяет слово из метки', C.filter(c=>{const w=headWord(c);return w&&c.extendedDescription.includes(w);}).length);
line('подпись повторяет слово из метки', C.filter(c=>{const w=headWord(c);return w&&c.description.includes(w);}).length);
line('абзац называет СВОЕГО философа', C.filter(c=>c.extendedDescription.includes(P[c.philosopher].nameRu.split(' ').pop())).length);
line('подпись называет своего философа', C.filter(c=>c.description.includes(P[c.philosopher].nameRu.split(' ').pop())).length);

console.log('\n## 6. Разделение труда с рёбрами');
const others = d.philosophers.map(p=>[p.id,p.nameRu.split(' ').pop()]).filter(([,n])=>L(n)>4);
const alien = c => others.filter(([id,n])=>id!==c.philosopher && c.extendedDescription.includes(n)).map(([,n])=>n);
const withAlien = C.filter(c=>alien(c).length);
line('абзац называет ЧУЖОГО философа', withAlien.length);
line('  из них двух и более', withAlien.filter(c=>alien(c).length>1).length);
const deg={};for(const r of d.relations){deg[r.source]=(deg[r.source]||0)+1;deg[r.target]=(deg[r.target]||0)+1;}
line('глаголы перехода в абзаце (влияет/наследует/развивает…)',
  C.filter(c=>/(влия|наследу|развива|предвосхищ|заимствов|перенима|восходит к|опирается на|продолжа)/i.test(c.extendedDescription)).length);

console.log('\n## 7. Опора в тексте');
const work=/[«"'][А-ЯЁA-Z][^»"']{4,60}[»"']/;
line('назван труд или дана цитата', C.filter(c=>work.test(c.extendedDescription)).length);
line('назван год', C.filter(c=>/\b(1[0-9]|20)\d\d\b/.test(c.extendedDescription)).length);

console.log('\n## 8. Регистр и оценки');
line('риторический вопрос', C.filter(c=>/\?/.test(c.extendedDescription)).length);
line('восклицание', C.filter(c=>/!/.test(c.extendedDescription)).length);
line('оценочно-историческое (первый/впервые/величайший/знаменитый)',
  C.filter(c=>/(впервые|первая попытка|первый, кто|величайш|знаменит|гениальн|революционн)/i.test(c.extendedDescription)).length);
line('«предвосхищает / прототип / предтеча»', C.filter(c=>/предвосхищ|прототип|предтеч/i.test(c.extendedDescription)).length);

console.log('\n## 9. Соразмерность объёма весу концепции');
const bands=[[0,3],[4,6],[7,10],[11,20],[21,99]];
for(const [lo,hi] of bands){
  const g=C.filter(c=>(deg[c.id]||0)>=lo&&(deg[c.id]||0)<=hi);
  if(!g.length)continue;
  console.log(`  связей ${String(lo).padStart(2)}–${String(hi).padEnd(2)}: концепций ${String(g.length).padStart(3)}  средний абзац ${Math.round(g.reduce((a,c)=>a+L(c.extendedDescription),0)/g.length)}`);
}

console.log('\n## 10. Согласованность двух полей');
line('подпись дословно входит в абзац', C.filter(c=>c.extendedDescription.includes(c.description)).length);
const firstOfE = c => c.extendedDescription.split(/(?<=[.!?])\s+/)[0];
line('первое слово подписи и абзаца совпадает', C.filter(c=>c.description.split(/\s+/)[0].toLowerCase()===firstOfE(c).split(/\s+/)[0].toLowerCase()).length);

console.log('\n## 11. Неповторимость');
const seen={},dupD=[];
for(const c of C){const k=c.description.toLowerCase();if(seen[k])dupD.push(k);else seen[k]=1;}
line('полностью совпадающие подписи', dupD.length);
const heads={},dupH=[];
for(const c of C){const k=c.description.toLowerCase().split(/\s+/).slice(0,2).join(' ');(heads[k]=heads[k]||[]).push(c.label);}
const rep=Object.entries(heads).filter(([,v])=>v.length>1);
line('совпадающий зачин подписи (2 слова) по всей базе', rep.reduce((a,[,v])=>a+v.length-1,0));
console.log('  ' + rep.sort((a,b)=>b[1].length-a[1].length).slice(0,6).map(([k,v])=>`«${k}…» ×${v.length}`).join('; '));
const sentSeen={},dupS=[];
for(const c of C) for(const s of c.extendedDescription.split(/(?<=[.!?])\s+/)) { const k=s.trim().toLowerCase(); if(L(k)<40)continue; if(sentSeen[k])dupS.push(k); else sentSeen[k]=c.label; }
line('дословно повторяющаяся фраза в абзацах', dupS.length);

console.log('\n## 12. Раскладка по философам');
const by={};for(const c of C)(by[c.philosopher]=by[c.philosopher]||[]).push(c);
const ent=Object.entries(by).map(([id,cs])=>[P[id].nameRu,cs.length]);
console.log('  философов: '+ent.length+' | концепций на философа: мин '+Math.min(...ent.map(e=>e[1]))+', макс '+Math.max(...ent.map(e=>e[1]))+', сред '+(N/ent.length).toFixed(1));
console.log('  ' + ent.map(([n,k])=>n+' '+k).join('; '));
