import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const C = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const P = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const out = d.relations.filter(r=>C[r.source].philosopher!==C[r.target].philosopher);
const pairs={};
for(const r of out){const a=C[r.source].philosopher,b=C[r.target].philosopher;
  (pairs[[a,b].sort().join('|')] ??= []).push(r);}
const list=Object.entries(pairs).map(([k,v])=>{const[a,b]=k.split('|');
  const late=P[a].birth>=P[b].birth?a:b, early=late===a?b:a;
  return {a:early,b:late,n:v.length,desc:v.filter(r=>r.description).length,late:P[late].birth};});
list.sort((x,y)=>x.late-y.late||P[x.a].birth-P[y.a].birth);
const CAP=55; let cur=[],B=[];
for(const p of list){ if(cur.length&&cur.reduce((s,q)=>s+q.n,0)+p.n>CAP){B.push(cur);cur=[];} cur.push(p);}
if(cur.length)B.push(cur);
const short=n=>n.replace(/^(Жорж |Жак |Ханс-Георг |Уиллард |Ричард |Эрнст |Эммануэль |Альфред Норт |Бертран |Готлоб |Франц |Чарльз Сандерс |Вильгельм |Анри |Джон |Зигмунд |Алексиус |Рудольф |Огюст |Фридрих |Жан-Жак |Фрэнсис |Николай |Ансельм |Дунс |Марк )/, (m)=>m)
  .replace('Ансельм Кентерберийский','Ансельм').replace('Фома Аквинский','Фома')
  .replace('Николай Кузанский','Кузанский').replace('Фрэнсис Бэкон','Бэкон')
  .replace('Жан-Жак Руссо','Руссо').replace('Огюст Конт','Конт')
  .replace('Фридрих Шеллинг','Шеллинг').replace('Вильгельм Дильтей','Дильтей')
  .replace('Франц Брентано','Брентано').replace('Чарльз Сандерс Пирс','Пирс')
  .replace('Готлоб Фреге','Фреге').replace('Алексиус Мейнонг','Мейнонг')
  .replace('Зигмунд Фрейд','Фрейд').replace('Анри Бергсон','Бергсон')
  .replace('Джон Дьюи','Дьюи').replace('Альфред Норт Уайтхед','Уайтхед')
  .replace('Бертран Рассел','Рассел').replace('Эрнст Кассирер','Кассирер')
  .replace('Рудольф Карнап','Карнап').replace('Жорж Батай','Батай')
  .replace('Ханс-Георг Гадамер','Гадамер').replace('Жак Лакан','Лакан')
  .replace('Эммануэль Левинас','Левинас').replace('Уиллард Куайн','Куайн')
  .replace('Жак Деррида','Деррида').replace('Ричард Рорти','Рорти')
  .replace('Дунс Скот','Скот').replace('Марк Аврелий','Марк Аврелий');
let outp='';
B.forEach((b,i)=>{
  const n=b.reduce((s,q)=>s+q.n,0), dsc=b.reduce((s,q)=>s+q.desc,0);
  outp+=`\n**М${String(i+1).padStart(2,'0')} — ${n} связей (ревизия ${dsc}, написать ${n-dsc}), пар ${b.length}.**  \n`;
  outp+=b.map(q=>`${short(P[q.a].nameRu)} ~ ${short(P[q.b].nameRu)} ${q.n}`).join('; ')+'\n';
});
fs.writeFileSync('sec54.md', outp);
console.log('готово', outp.length);
