// Замер замечаний по концепциям одного захода.
// Считает ПРЯМО по машинному выводу проверки (--json: код, приговор, id).
//   node checks/tally-concepts.mjs <edits.json> <файл-до> <файл-после>
// Разбор человеческого отчёта здесь не годится: он усекает перечень.
//
// ВАЖНО: запускать ОТДЕЛЬНОЙ командой. На ветви связей замер трижды врал,
// когда его цепляли к длинной пересборке в одной команде: поток обрывался,
// и числа выходили заниженными вплоть до нулевых. Сторож ниже это ловит.
import fs from 'fs';
import {execSync} from 'child_process';

const editsPath = process.argv[2];
const before = process.argv[3] || 'source/philosophy_graph.SOURCE.html';
const after  = process.argv[4] || 'dist/philosophy_graph.html';
if (!editsPath) { console.error('нужен путь к файлу правок'); process.exit(2); }

const edits = JSON.parse(fs.readFileSync(editsPath, 'utf8')).edits;
// правки адресуются парой (id, поле), но проверки — по концепции целиком,
// поэтому считаем по множеству затронутых id
const ids = new Set(edits.map(e => e.id));

function count(file) {
  const out = execSync(`node checks/check-concepts.mjs ${file} --json`,
    {maxBuffer: 1 << 30}).toString();
  const lines = out.split('\n').filter(Boolean).length;
  if (lines < 200) {
    console.error(`ВНИМАНИЕ: вывод проверки для ${file} подозрительно короток `
      + `(${lines} строк). Запустите замер отдельной командой и повторите.`);
    process.exit(2);
  }
  const acc = {};
  for (const line of out.split('\n')) {
    if (!line) continue;
    const part = line.split('\t');
    if (part.length < 3) continue;
    if (ids.has(part[2])) acc[part[0]] = (acc[part[0]] || 0) + 1;
  }
  return acc;
}

const A = count(before), B = count(after);
let sa = 0, sb = 0;
for (const k of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
  sa += A[k] || 0; sb += B[k] || 0;
  console.log('  ' + k.padEnd(24)
    + ' до ' + String(A[k] || 0).padStart(3)
    + '  после ' + String(B[k] || 0).padStart(3));
}
console.log('  ИТОГО'.padEnd(26) + ' до ' + String(sa).padStart(3)
  + '  после ' + String(sb).padStart(3));
console.log(`  (концепций в заходе: ${ids.size}, правок: ${edits.length})`);
