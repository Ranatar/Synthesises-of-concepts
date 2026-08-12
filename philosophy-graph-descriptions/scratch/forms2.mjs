import fs from 'fs';
const src = fs.readFileSync('/mnt/user-data/uploads/philosophy_graph.html','utf8');
const start = src.indexOf('const relations = [');
const end = src.indexOf('\n    ];', start);
const block = src.slice(start, end);
const lines = block.split('\n');
let opens=0, odd=[];
for(let i=0;i<lines.length;i++){
  if(/^\s*\{/.test(lines[i])){
    opens++;
    if(!/^\s*\{\s*source:\s*"[^"]+",\s*target:\s*"[^"]+",\s*type:\s*"[^"]+"/.test(lines[i])) odd.push([i,lines[i]]);
  }
}
console.log('строк, начинающихся с {:', opens, ' нестандартных:', odd.length);
odd.slice(0,10).forEach(([i,l])=>console.log(i, JSON.stringify(l.slice(0,160))));
// сколько записей с description
let withDesc=0, descSameLine=0, descNextLine=0;
for(let i=0;i<lines.length;i++){
  if(!/^\s*\{\s*source:/.test(lines[i])) continue;
  if(/description:/.test(lines[i])) {withDesc++; descSameLine++;}
  else if(lines[i+1] && /^\s*description:/.test(lines[i+1])) {withDesc++; descNextLine++;}
}
console.log('с описанием:', withDesc, ' в той же строке:', descSameLine, ' на следующей:', descNextLine);
