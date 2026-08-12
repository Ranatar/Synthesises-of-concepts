// Замер замечаний по философам одного захода.
// Считает ПРЯМО по машинному выводу проверки (--json: код, приговор, id).
//   node checks/tally-philosophers.mjs <edits.json> <файл-до> <файл-после>
//
// ВАЖНО: запускать ОТДЕЛЬНОЙ командой. На ветви связей замер трижды врал,
// когда его цепляли к длинной пересборке в одной команде: поток обрывался,
// и числа выходили заниженными. Сторож ниже это ловит.
import fs from 'fs';
import {execSync} from 'child_process';

const editsPath = process.argv[2];
const before = process.argv[3] || 'source/philosophy_graph.SOURCE.html';
const after  = process.argv[4] || 'dist/philosophy_graph.html';
if (!editsPath) { console.error('нужен путь к файлу правок'); process.exit(2); }

const edits = JSON.parse(fs.readFileSync(editsPath, 'utf8')).edits;
const ids = new Set(edits.map(e => e.id));

// Сторож против усечённого потока применяется ТОЛЬКО к файлу «до».
// В Ф06 он дал ложную тревогу: после завершения ветви машинный вывод по
// правленому файлу ПУСТ — не потому, что поток оборвался, а потому, что
// нарушений не осталось. Пустой вывод для файла «после» законен и есть
// цель работы; для исходника он по-прежнему означает обрыв.
function count(file, guard) {
  const out = execSync(`node checks/check-philosophers.mjs ${file} --json`,
    {maxBuffer: 1 << 30}).toString();
  const lines = out.split('\n').filter(Boolean).length;
  if (guard && lines < 50) {
    console.error(`ВНИМАНИЕ: вывод проверки для ${file} подозрительно короток `
      + `(${lines} строк). Запустите замер отдельной командой и повторите.`);
    process.exit(2);
  }
  const acc = {};
  for (const line of out.split('\n')) {
    const part = line.split('\t');
    if (part.length < 3) continue;
    if (ids.has(part[2])) acc[part[0]] = (acc[part[0]] || 0) + 1;
  }
  return acc;
}

const A = count(before, true), B = count(after, false);
let sa = 0, sb = 0;
for (const k of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
  sa += A[k] || 0; sb += B[k] || 0;
  console.log('  ' + k.padEnd(24)
    + ' до ' + String(A[k] || 0).padStart(3)
    + '  после ' + String(B[k] || 0).padStart(3));
}
console.log('  ИТОГО'.padEnd(26) + ' до ' + String(sa).padStart(3)
  + '  после ' + String(sb).padStart(3));
console.log(`  (философов в заходе: ${ids.size}, правок: ${edits.length})`);
