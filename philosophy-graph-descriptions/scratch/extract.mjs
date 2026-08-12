import fs from 'fs';
const src = fs.readFileSync('/mnt/user-data/uploads/philosophy_graph.html','utf8');
function grab(name){
  const re = new RegExp('const\\s+'+name+'\\s*=\\s*\\[');
  const m = re.exec(src);
  if(!m) throw new Error('no '+name);
  let i = src.indexOf('[', m.index);
  let depth=0, j=i, inStr=null, esc=false;
  for(; j<src.length; j++){
    const ch=src[j];
    if(inStr){
      if(esc){esc=false;continue;}
      if(ch==='\\'){esc=true;continue;}
      if(ch===inStr) inStr=null;
      continue;
    }
    if(ch==='"'||ch==="'"||ch==='`'){inStr=ch;continue;}
    if(ch==='/'&&src[j+1]==='/'){ while(j<src.length&&src[j]!=='\n') j++; continue;}
    if(ch==='/'&&src[j+1]==='*'){ j=src.indexOf('*/',j)+1; continue;}
    if(ch==='[') depth++;
    else if(ch===']'){depth--; if(depth===0){j++;break;}}
  }
  const lit = src.slice(i,j);
  return new Function('return ('+lit+')')();
}
const data = {
  philosophers: grab('philosophers'),
  relationTypes: grab('relationTypes'),
  concepts: grab('concepts'),
  relations: grab('relations'),
};
fs.writeFileSync('data.json', JSON.stringify(data));
for(const k of Object.keys(data)) console.log(k, data[k].length);
console.log('sample relation:', JSON.stringify(data.relations[0]));
console.log('sample type:', JSON.stringify(data.relationTypes[0]));
console.log('sample concept:', JSON.stringify(data.concepts[0]));
console.log('sample philosopher:', JSON.stringify(data.philosophers[0]));
