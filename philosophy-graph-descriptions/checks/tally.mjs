// Замер замечаний по связям одного захода.
// Считает ПРЯМО по машинному выводу проверки (--json: код, приговор, ключ).
//   node checks/tally.mjs <edits.json> <файл-до> <файл-после>
// Разбор человеческого отчёта здесь не годится: он усекает перечень.
import fs from 'fs';
import {execSync} from 'child_process';
const editsPath = process.argv[2];
const before = process.argv[3] || '/mnt/user-data/uploads/philosophy_graph.html';
const after  = process.argv[4] || 'dist/philosophy_graph.html';
const edits = JSON.parse(fs.readFileSync(editsPath, 'utf8')).edits;
const keys = new Set(edits.map(e => e.source + '|' + e.target + '|' + e.type));
function count(file) {
  const out = execSync(`node checks/check-descriptions.mjs ${file} --json`, {maxBuffer: 1 << 30}).toString();
  // Сторож против усечённого вывода: запуск замера в одной команде сразу
  // после долгой пересборки давал неполный поток и заниженные (вплоть до
  // нулевых) числа. Замер следует запускать ОТДЕЛЬНОЙ командой.
  const lines = out.split('\n').filter(Boolean).length;
  if (lines < 500) {
    console.error(`ВНИМАНИЕ: вывод проверки для ${file} подозрительно короток `
      + `(${lines} строк). Запустите замер отдельной командой и повторите.`);
    process.exit(2);
  }
  const acc = {};
  for (const line of out.split('\n')) {
    if (!line) continue;
    const part = line.split('\t');
    if (part.length < 3) continue;
    if (keys.has(part[2])) acc[part[0]] = (acc[part[0]] || 0) + 1;
  }
  return acc;
}
const A = count(before), B = count(after);
let sa = 0, sb = 0;
for (const k of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
  sa += A[k] || 0; sb += B[k] || 0;
  console.log('  ' + k.padEnd(22) + ' до ' + String(A[k] || 0).padStart(3) + '  после ' + String(B[k] || 0).padStart(3));
}
console.log('  ИТОГО'.padEnd(24) + ' до ' + String(sa).padStart(3) + '  после ' + String(sb).padStart(3));
