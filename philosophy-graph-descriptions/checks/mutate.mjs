// Проверка набора мутацией: в копию файла вносится заведомый дефект каждого
// класса, и набор обязан его поймать. Иначе это не проверка, а прогон.
import fs from 'fs';
import {execSync} from 'child_process';
const SRC = process.argv[2] || 'dist/philosophy_graph.html';
const base = fs.readFileSync(SRC, 'utf8');
// подопытные: рефлексивные описания, переписанные в заходе 0
const MUT = [
  ['desc.escapes',        'Перводвигатель потому и есть мысль о мысли', 'Перводвигатель потому и есть \\"мысль о мысли\\"'],
  ['desc.foreign-phrase', 'Абсолютная идея есть мышление, имеющее предметом само себя', 'The absolute idea is a thinking of itself'],
  ['desc.names-source',   'Рука, трогающая другую руку, в тот же миг трогаема: хиазм', 'Рука, трогающая другую руку, в тот же миг трогаема: перекрест'],
  ['desc.own-type',       'Сомнение в окончательности всякого словаря честно', 'Иронизм применяет себя к себе, и сомнение в словаре честно'],
  ['desc.typography',     'Самость есть отношение, которое относит себя к самому себе, и отчаяние —', 'Самость есть отношение, которое относит себя к самому себе, и отчаяние -'],
  ['desc.years',          'Изображать факты предложение может', 'В 1921 году показано, что изображать факты предложение может'],
  ['desc.length',         'Символический порядок ручается за значение, но за него самого ручаться некому: Другого у Другого нет. Собственная нехватка и кладёт Большому Другому предел — символическое не может замкнуться, и ограничивает его это незамыкание, а не какая-либо внешняя граница.', 'Другого у Другого нет.'],
  ['desc.unique-sentence','Круг признан и принят — вне науки нет точки, с которой её можно обосновать.', 'Оттого иронист не проповедник: он не может выдать своё описание за последнее, которым следовало бы заменить чужие, — и в этом всё различие с обличителем.'],
];
let ok = 0, bad = [];
for (const [code, from, to] of MUT) {
  if (!base.includes(from)) { bad.push(`${code}: якорь мутации не найден`); continue; }
  fs.writeFileSync('/tmp/mut.html', base.replace(from, to));
  let out = '';
  try { out = execSync(`node checks/check-descriptions.mjs /tmp/mut.html --only=${code}`, {maxBuffer: 1e8}).toString(); }
  catch (e) { out = (e.stdout || '').toString(); }
  const line = out.split('\n').find(l => l.includes(code)) || '';
  const caught = /ОТКАЗ \d|ПРЕДУПР \d|справка \d/.test(line);
  if (caught) ok++; else bad.push(`${code}: НЕ ПОЙМАН (${line.trim()})`);
  console.log(`${caught ? '✓' : '✗'} ${code.padEnd(22)} ${line.trim()}`);
}
console.log(`\nпойманы ${ok} из ${MUT.length}`);
if (bad.length) { console.log(bad.join('\n')); process.exit(1); }
