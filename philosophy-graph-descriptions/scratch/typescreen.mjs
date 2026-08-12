import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const cById = Object.fromEntries(d.concepts.map(c=>[c.id,c]));
const tById = Object.fromEntries(d.relationTypes.map(t=>[t.id,t]));
// слова, характерные для каждого типа (для поиска ЧУЖОГО типа в первой фразе)
const W = {
 influence:/влия\w+|повлия\w+|воздейств\w+/i,
 develop:/развива\w+|развитие|развёртыва\w+|продолжа\w+/i,
 critique:/критик\w+|оспарива\w+|опроверга\w+/i,
 oppose:/противопоставл\w+|противостои\w+|противопоставле\w+/i,
 dialogue:/вступает в диалог|обсужда\w+|полемизир\w+/i,
 synthesize:/синтезир\w+|синтез /i,
 consequence:/следует из|вытекает из|влечёт|влечет|порожда\w+/i,
 presuppose:/предполага\w+/i,
 condition:/услови\w+|обусловл\w+/i,
 exemplify:/иллюстри\w+|пример\w*|наглядн\w+/i,
 instrument:/служит ор\w+|орудие|инструмент\w*|средств\w+/i,
 culminate:/кульмина\w+|кульминир\w+|достигает вершины|завершается в/i,
 complement:/дополня\w+|взаимно дополн\w+/i,
 correlative:/взаимоопредел\w+|соотносительн\w+|определимы только друг/i,
 internal_contradiction:/противоречи\w+/i,
 emerge_from:/возника\w+ из|происходит из/i,
 limit:/ограничива\w+|ограничение|предел\w*/i,
 mediate:/опосред\w+|посредни\w+|медиир\w+/i,
 typological:/типологическ\w+ сходств\w+|независимо друг от друга|контакта не было/i,
 apply:/применяет себя|самоприменен\w+/i,
};
const rows=[]; let alien=0, ownWord=0, tot=0;
for(const r of d.relations){
  const desc=(r.description||'').trim(); if(!desc) continue;
  const first = desc.split(/(?<=[.!?])\s/)[0];
  tot++;
  const own = W[r.type] && W[r.type].test(first);
  if(own) ownWord++;
  const others = Object.entries(W).filter(([k,re])=> k!==r.type && re.test(first)).map(([k])=>k);
  // отбрасываем родственные пары, где слово общее
  const kin = {consequence:['condition'],condition:['consequence'],internal_contradiction:['oppose'],oppose:['internal_contradiction'],
               typological_opposition:['oppose','typological'],typological:['typological_opposition'],develop:['influence'],apply:['instrument']};
  const strange = others.filter(o=>!(kin[r.type]||[]).includes(o));
  if(!own && strange.length){ alien++; rows.push({r,first,strange}); }
}
console.log('Описаний всего', tot, '| первая фраза содержит слово СВОЕГО типа:', ownWord, (100*ownWord/tot).toFixed(0)+'%');
console.log('Первая фраза называет ЧУЖОЙ тип и не называет свой:', alien, (100*alien/tot).toFixed(0)+'%');
const byT={}; for(const x of rows) byT[x.r.type]=(byT[x.r.type]||0)+1;
console.log(JSON.stringify(byT));
for(const x of rows.slice(0,10)){
  const cs=cById[x.r.source],ct=cById[x.r.target];
  console.log(`  [${x.r.type} ← опознан как ${x.strange.join('/')}] «${cs.label}» → «${ct.label}»\n     ${x.first.slice(0,140)}`);
}
