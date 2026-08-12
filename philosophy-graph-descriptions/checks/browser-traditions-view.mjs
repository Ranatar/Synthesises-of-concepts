// Проба раздела традиций в окне философа (заход V01).
// Сверяет: раздел выведен у всех, стоит ПЕРВЫМ (традиция — данное о самом
// философе, прежде вычисляемых разделов), названия и пояснения-подсказки на
// месте, число в заголовке согласовано с составом.
import fs from 'fs';
import puppeteer from 'puppeteer-core';
const D3 = fs.readFileSync('node_modules/d3/dist/d3.min.js','utf8');
const CHROME='/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const browser=await puppeteer.launch({executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage(); const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await page.setRequestInterception(true);
page.on('request',r=>{ if(/d3([.]min)?[.]js/i.test(r.url())) return r.respond({status:200,contentType:'application/javascript',body:D3});
 if(r.url().startsWith('file://')) return r.continue(); return r.abort();});
await page.goto('file://'+fs.realpathSync(process.argv[2]||'dist/philosophy_graph.html'),{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForFunction(()=>typeof philosophers!=='undefined'&&philosophers.length>0&&typeof generatePhilosopherViewContent==='function'&&typeof traditions!=='undefined',{timeout:60000});
const res=await page.evaluate(()=>{
 const TN=Object.fromEntries(traditions.map(t=>[t.id,t.name]));
 const TD=Object.fromEntries(traditions.map(t=>[t.id,t.description]));
 return philosophers.map(p=>{
  const d=document.createElement('div'); d.innerHTML=generatePhilosopherViewContent(p.nameRu);
  const titles=[...d.querySelectorAll('.philosopher-section-title')].map(e=>e.textContent.trim());
  const idx=titles.findIndex(t=>/Традици/.test(t));
  const tags=[...d.querySelectorAll('.rubric-name-tooltip')].map(e=>e.firstChild.textContent.trim());
  const tips=[...d.querySelectorAll('.rubric-tooltip-text')].map(e=>e.textContent.trim());
  const want=(p.traditions||[]).map(t=>TN[t]);
  const wantTips=(p.traditions||[]).map(t=>TD[t]);
  return {id:p.id, has:idx>=0, first:idx===0,
    header:idx>=0?titles[idx]:'',
    names:want.every(n=>tags.includes(n)),
    tips:wantTips.every(n=>tips.includes(n)),
    plural:(p.traditions||[]).length>1?/Традиции/.test(titles[idx]||''):/Традиция$/.test((titles[idx]||'').replace(/^🏛\s*/,'')),
    order:titles.join(' | ')};
 });});
const n=res.length;
console.log('философов проверено: '+n);
console.log('раздел традиций выведен: '+res.filter(r=>r.has).length);
console.log('стоит ПЕРВЫМ разделом: '+res.filter(r=>r.first).length);
console.log('все названия традиций на месте: '+res.filter(r=>r.names).length);
console.log('все пояснения-подсказки на месте: '+res.filter(r=>r.tips).length);
console.log('число в заголовке согласовано: '+res.filter(r=>r.plural).length);
console.log('ошибок страницы: '+errors.length);
console.log('\nпорядок разделов (образец, Хайдеггер): '+res.find(r=>r.id==='heidegger').order);
console.log('заголовок у Хайдеггера: '+res.find(r=>r.id==='heidegger').header);
console.log('заголовок у Маркса: '+res.find(r=>r.id==='marx').header);
await browser.close();
const bad = res.filter(r => !(r.has && r.first && r.names && r.tips && r.plural)).length;
process.exit(errors.length || bad ? 1 : 0);
