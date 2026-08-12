import fs from 'fs';
import puppeteer from 'puppeteer-core';
const FILE = process.argv[2];
const D3 = fs.readFileSync('node_modules/d3/dist/d3.min.js','utf8');
const CHROME='/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const EDITS = process.argv.slice(3).flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')).edits);
const browser = await puppeteer.launch({executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
const page = await browser.newPage();
const errors=[];
page.on('pageerror',e=>errors.push('pageerror: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
await page.setRequestInterception(true);
page.on('request',r=>{
  if(/d3([.]min)?[.]js/i.test(r.url())) return r.respond({status:200,contentType:'application/javascript',body:D3});
  if(r.url().startsWith('file://')) return r.continue();
  return r.abort();
});
await page.goto('file://'+fs.realpathSync(FILE),{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForFunction(()=>typeof nodes!=='undefined'&&nodes.length>0&&typeof generateConnectionViewContent==='function',{timeout:60000});
const res = await page.evaluate(keys=>{
  const out=[];
  for(const k of keys){
    const [s,t,ty]=k.split('|');
    const l=links.find(l=>(l.source.id||l.source)===s&&(l.target.id||l.target)===t&&l.type===ty);
    if(!l){out.push({k,found:false});continue;}
    const div=document.createElement('div'); div.innerHTML=generateConnectionViewContent(l);
    // окно выводит ВСЕ связи между парой концепций (connectionsBetween),
    // поэтому блоков описания может быть несколько — ищем нужное среди них
    const boxes=[...div.querySelectorAll('.connection-description')].map(b=>b.textContent.trim());
    out.push({k,found:true,blocks:boxes.length,shown:boxes[0]||null,
      matches: boxes.includes((l.description||'').trim())});
  }
  return out;
}, EDITS.map(e=>`${e.source}|${e.target}|${e.type}`));
console.log('связей захода проверено:', res.length);
console.log('найдено в графе:', res.filter(r=>r.found).length);
console.log('описание выведено и совпадает с данными:', res.filter(r=>r.matches).length);
const miss=res.filter(r=>!r.matches);
miss.slice(0,5).forEach(r=>console.log('  расхождение:',r.k));
const multi=res.filter(r=>r.blocks>1);
if(multi.length) console.log('связей, выводимых вместе с соседями по паре:', multi.length, '—', multi.map(r=>r.k.split('|')[2]).join(', '));
console.log('ошибок страницы:', errors.length);
errors.slice(0,3).forEach(e=>console.log('  '+e));
await browser.close();
