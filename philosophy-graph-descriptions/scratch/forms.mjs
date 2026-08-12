import fs from 'fs';
const src = fs.readFileSync('/mnt/user-data/uploads/philosophy_graph.html','utf8');
const lines = src.split('\n');
// собрать все строки, начинающиеся записью связи, и посмотреть формы
let forms={}, descLine={}, n=0;
for(let i=0;i<lines.length;i++){
  const m=/^\s*\{\s*source:\s*"([^"]+)",\s*target:\s*"([^"]+)",\s*type:\s*"([^"]+)"/.exec(lines[i]);
  if(!m) continue; n++;
  const rest=lines[i].slice(m[0].length);
  // форма окончания записи
  const oneLine = /\}\s*,?\s*$/.test(lines[i]);
  const key = oneLine? 'одна строка' : 'описание на следующей';
  forms[key]=(forms[key]||0)+1;
  // порядок полей
  const fields = [...lines[i].matchAll(/(\w+):/g)].map(x=>x[1]).join(',');
  descLine[fields]=(descLine[fields]||0)+1;
}
console.log('записей найдено регуляркой:', n);
console.log(forms);
console.log('порядок полей в первой строке:'); 
for(const [k,v] of Object.entries(descLine).sort((a,b)=>b[1]-a[1])) console.log('  ',k,v);
