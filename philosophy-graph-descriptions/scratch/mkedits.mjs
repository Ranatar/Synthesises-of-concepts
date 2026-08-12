import fs from 'fs';
import {TEXTS} from './batch00-texts.mjs';
const d = JSON.parse(fs.readFileSync('data.json','utf8'));
const c = Object.fromEntries(d.concepts.map(x=>[x.id,x]));
const p = Object.fromEntries(d.philosophers.map(x=>[x.id,x]));
const md5 = 'ce1e5cc8d8d1fc429a07882994a0ccd3';
const refl = d.relations.filter(r=>r.source===r.target);
// порядок: по типу (presuppose, apply, internal_contradiction, limit), внутри — по хронологии философа
const ORDER = ['presuppose','apply','internal_contradiction','limit'];
refl.sort((a,b)=>{
  const t = ORDER.indexOf(a.type)-ORDER.indexOf(b.type);
  if(t) return t;
  return p[c[a.source].philosopher].birth - p[c[b.source].philosopher].birth;
});
const NOTES = {
  presuppose: 'самообоснование: шаблон заменён разбором того, почему понятие может быть обосновано только собой',
  apply: 'самоприменение, которое понятие выдерживает: шаблон стирал отличие от самоопровержения',
  internal_contradiction: 'самоприменение опровергает понятие — шаблон давал ту же формулу, что и у apply',
  limit: 'понятие само кладёт себе предел: шаблон об этом не говорил вовсе',
};
const edits = refl.map(r=>({
  source: r.source, target: r.target, type: r.type,
  verdict: 'rewrite',
  criteria: ['К2','К4','К5','К7','К8'],
  concept: c[r.source].label,
  philosopher: p[c[r.source].philosopher].nameRu,
  old: r.description,
  new: TEXTS[r.source],
  note: NOTES[r.type],
}));
const out = {
  meta: {
    batch: '00',
    title: 'Рефлексивные связи — переписывание шаблона',
    spec: 'descriptions-revision-spec.md',
    specRevision: 2,
    target: 'philosophy_graph.html',
    targetMd5: md5,
    created: '2026-08-09',
    layer: 'reflexive',
    count: edits.length,
  },
  edits,
};
fs.writeFileSync('edits/batch-00-reflexive.json', JSON.stringify(out,null,2)+'\n');
console.log('записано правок:', edits.length);
console.log('по типам:', JSON.stringify(edits.reduce((a,e)=>(a[e.type]=(a[e.type]||0)+1,a),{})));
