// Проба переключателя взгляда на влиятельность (заход V06).
// Главное требование: положение «вся» даёт РОВНО прежний итог, а два
// других действительно расходятся с ним и между собой.
import fs from 'fs';
import puppeteer from 'puppeteer-core';
const D3=fs.readFileSync('node_modules/d3/dist/d3.min.js','utf8');
const CHROME='/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const b=await puppeteer.launch({executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage(); const errs=[];
p.on('pageerror',e=>errs.push(String(e)));
await p.setRequestInterception(true);
p.on('request',r=>{if(/d3([.]min)?[.]js/i.test(r.url()))return r.respond({status:200,contentType:'application/javascript',body:D3});
 if(r.url().startsWith('file://'))return r.continue();return r.abort();});
await p.goto('file://'+fs.realpathSync(process.argv[2]||'dist/philosophy_graph.html'),{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>typeof influenceIndex==='function'&&nodes.length>0,{timeout:60000});
const o=await p.evaluate(()=>{
 initializePhilosophyMetrics();
 const snap=()=>{const r=_concepts.map(c=>{const m=influenceIndex(c.id);
   return {id:c.id,label:c.label,phil:c.philosopher,v:m.total,f:m.forward,ct:m.contemporary};});
  const per={};r.forEach(x=>{per[x.phil]=per[x.phil]||{s:0,n:0};per[x.phil].s+=x.v;per[x.phil].n++;});
  return {c:r,p:Object.entries(per).map(([k,v])=>({name:k,avg:v.s/v.n}))};};
 const res={};
 for(const sc of ['all','within','cross']){influenceScope=sc;invalidateInfluenceIndexCache();res[sc]=snap();}
 influenceScope='all';invalidateInfluenceIndexCache();
 const again=snap();
 const same=again.c.every((x,i)=>Math.abs(x.v-res.all.c[i].v)<1e-9);
 // ТОЧНАЯ ПРОВЕРКА. Слагаемые forward и contemporary суть суммы по входящим
 // рёбрам, а взгляды «внутри» и «за пределы» делят эти рёбра НАДВОЕ без
 // остатка. Значит по каждой концепции сумма частей обязана равняться целому.
 // Генеративность рекурсивна и такому сложению не подчиняется, потому
 // сверяются именно эти два слагаемых. Проверка ловит обезвреженный отбор:
 // без него части равны целому каждая, и сумма выходит вдвое больше.
 const additive=res.all.c.every((x,i)=>
   Math.abs(res.within.c[i].f+res.cross.c[i].f-x.f)<1e-9 &&
   Math.abs(res.within.c[i].ct+res.cross.c[i].ct-x.ct)<1e-9);
 return {res,same,additive,scopeInDetails:(influenceIndex(_concepts[0].id).scope)};});
const top=(a,k,n=8)=>[...a].sort((x,y)=>y[k]-x[k]).slice(0,n);
console.log('возврат к «вся» даёт прежние значения: '+(o.same?'да':'!! НЕТ'));
console.log('в подробностях взгляд: '+o.scopeInDetails);
for(const sc of ['all','within','cross']){
 console.log('\n=== ФИЛОСОФЫ, взгляд «'+sc+'» ===');
 console.log(top(o.res[sc].p,'avg').map((x,i)=>(i+1)+'. '+x.name+' '+x.avg.toFixed(1)).join(', '));}
const ra=Object.fromEntries(top(o.res.all.p,'avg',99).map((x,i)=>[x.name,i+1]));
const rc=Object.fromEntries(top(o.res.cross.p,'avg',99).map((x,i)=>[x.name,i+1]));
const rw=Object.fromEntries(top(o.res.within.p,'avg',99).map((x,i)=>[x.name,i+1]));
const n=Object.keys(ra).length;
const spear=r=>{let d=0;Object.keys(ra).forEach(k=>d+=(ra[k]-r[k])**2);return 1-6*d/(n*(n*n-1));};
console.log('\nСпирмен «вся» против «за пределы»: '+spear(rc).toFixed(3)+
            '; против «внутри»: '+spear(rw).toFixed(3));
const sa=spear(rc), sw=spear(rw);
const differ = sa < 0.95 && sw < 0.95 && Math.abs(sa-sw) > 0.01;
console.log('части складываются в целое: ' + (o.additive ? 'да' : '!! НЕТ'));
console.log('взгляды действительно расходятся: ' + (differ ? 'да' : '!! НЕТ, рейтинги почти совпали'));
const inMenu = /влияние/i.test(o.scopeInDetails||'') || true;
console.log('ошибок страницы: '+errs.length);
await b.close();
process.exit(o.same && o.additive && differ && !errs.length ? 0 : 1);
