#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply-traditions.py — заводит справочник `traditions` и поле `traditions`
у философов.

Пятый применяющий скрипт и второй, правящий ДАННЫЕ (первый — apply-newlinks).
Отличия от прочих:
  * правит СРАЗУ ДВА места: вставляет новый массив-справочник перед массивом
    `philosophers` и дописывает поле-массив в каждую запись философа;
  * адресация записи — по `id`, поле одно, как у apply-philosophers;
  * идемпотентность двойная: если справочник уже есть — не вставляем; если у
    записи уже есть поле `traditions` — пропускаем (skip). Повторный прогон
    даёт applied 0.

Проверки до записи:
  * словарь ЗАМКНУТ: всякая проставленная традиция есть в справочнике;
  * ПОКРЫТИЕ: у каждого из философов файла хотя бы одна традиция;
  * НЕПУСТОТА: в справочнике нет традиции без единого философа;
  * идентификаторы справочника не повторяются и совпадают с латиницей;
  * состав записи не пуст и без повторов;
  * всякий id из правок есть среди философов, и наоборот — правки покрывают
    всех философов файла.

Постпроверки: оба литерала читаются узлом; число философов не изменилось;
у всех есть поле; справочник разобран и его размер совпадает с ожидаемым.
При любом отказе файл не записывается.

Использование:
    apply-traditions.py --html philosophy_graph.html \
                        --edits edits/batch-TR01-traditions.json \
                        [--dry-run] [--report reports/report-TR01.md] [--force]
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ID_RE = re.compile(r'^[a-z][a-z0-9_]*$')


def md5(path):
    return hashlib.md5(Path(path).read_bytes()).hexdigest()


def grab(text, name):
    m = re.search(r'const\s+' + name + r'\s*=\s*\[', text)
    if not m:
        return None
    i = text.index('[', m.start())
    depth, j, in_str, esc = 0, i, None, False
    while j < len(text):
        ch = text[j]
        if in_str:
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == in_str:
                in_str = None
        elif ch in '"\'`':
            in_str = ch
        elif ch == '/' and j + 1 < len(text) and text[j + 1] == '/':
            while j < len(text) and text[j] != '\n':
                j += 1
            continue
        elif ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                j += 1
                break
        j += 1
    out = subprocess.run(
        ['node', '-e',
         'const s=require("fs").readFileSync(0,"utf8");'
         'process.stdout.write(JSON.stringify(new Function("return ("+s+")")()));'],
        input=text[i:j].encode('utf-8'), capture_output=True, check=True)
    return json.loads(out.stdout.decode('utf-8'))


def esc_js(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--html', required=True)
    ap.add_argument('--edits', required=True)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--report')
    args = ap.parse_args()

    html = Path(args.html)
    src_md5 = md5(html)
    text = html.read_text(encoding='utf-8')
    data = json.loads(Path(args.edits).read_text(encoding='utf-8'))

    philosophers = grab(text, 'philosophers')
    PH = {p['id']: p for p in philosophers}
    existing_dict = grab(text, 'traditions')

    trads = data.get('traditions', [])
    assigns = data.get('assignments', [])
    log, stats = [], {'applied': 0, 'skip': 0, 'fail': 0}

    want = data.get('meta', {}).get('targetMd5')
    if want and want != src_md5:
        log.append(f'СПРАВКА: md5 входа {src_md5} не совпадает с указанным '
                   f'{want} — ожидаемо при цепочке заходов')

    # --- проверки справочника
    tids = [t['id'] for t in trads]
    if len(set(tids)) != len(tids):
        stats['fail'] += 1
        log.append('ОТКАЗ: повторяющиеся идентификаторы в справочнике')
    for t in trads:
        if not ID_RE.match(t['id']):
            stats['fail'] += 1
            log.append(f'ОТКАЗ: негодный идентификатор {t["id"]!r}')
        for f in ('name', 'description'):
            v = t.get(f, '')
            if not v.strip() or '"' in v or '\n' in v or '  ' in v:
                stats['fail'] += 1
                log.append(f'ОТКАЗ [{t["id"]}]: поле {f} пусто или нарушает инвариант')

    # --- проверки состава
    used = set()
    seen_ids = set()
    for a in assigns:
        pid, tl = a.get('id'), a.get('traditions', [])
        if pid not in PH:
            stats['fail'] += 1
            log.append(f'ОТКАЗ: нет философа {pid!r}')
            continue
        if pid in seen_ids:
            stats['fail'] += 1
            log.append(f'ОТКАЗ [{pid}]: повторная запись')
            continue
        seen_ids.add(pid)
        if not tl:
            stats['fail'] += 1
            log.append(f'ОТКАЗ [{pid}]: пустой состав')
            continue
        if len(set(tl)) != len(tl):
            stats['fail'] += 1
            log.append(f'ОТКАЗ [{pid}]: повтор традиции в составе')
        for t in tl:
            if t not in tids:
                stats['fail'] += 1
                log.append(f'ОТКАЗ [{pid}]: традиция {t!r} вне справочника')
            else:
                used.add(t)

    missing_ph = [p['id'] for p in philosophers if p['id'] not in seen_ids]
    if missing_ph:
        stats['fail'] += 1
        log.append('ОТКАЗ: без традиции остались — ' + ', '.join(missing_ph))
    empty_tr = [t for t in tids if t not in used]
    if empty_tr:
        stats['fail'] += 1
        log.append('ОТКАЗ: традиции без единого философа — ' + ', '.join(empty_tr))

    lines = text.split('\n')
    fatal_now = stats['fail'] and not args.force

    # --- вставка справочника перед массивом philosophers
    inserted_dict = False
    if not fatal_now and existing_dict is None and trads:
        k = next(i for i, l in enumerate(lines)
                 if re.match(r'^\s*const\s+philosophers\s*=\s*\[', l))
        block = ['    // ── Традиции (заход TR01) ─────────────────────────────────',
                 '    // Признак читается как «в какой традиции его рассматривают»,',
                 '    // а не «к какой школе он принадлежал»: второе для доброй',
                 '    // половины корпуса просто ложно. Поле у философа множественное.',
                 '    const traditions = [']
        for t in trads:
            block.append('      {')
            block.append(f'        id: "{t["id"]}",')
            block.append(f'        name: "{esc_js(t["name"])}",')
            block.append(f'        description: "{esc_js(t["description"])}"')
            block.append('      },')
        block[-1] = block[-1].rstrip(',')
        block.append('    ];')
        block.append('')
        lines[k:k] = block
        inserted_dict = True
    elif existing_dict is not None:
        log.append('СПРАВКА: массив traditions уже есть — не вставляем')

    # --- поле у философов: дописываем строкой после строки с id.
    # ГРАНИЦЫ МАССИВА ОБЯЗАТЕЛЬНЫ: строка вида `id: "x",` встречается и у
    # концепций (их 453), и ловить её по всему файлу нельзя.
    # РАЗМЕТКА ЗАПИСЕЙ НЕОДНОРОДНА: у 56 философов id и name стоят на одной
    # строке, а у Ансельма каждое поле записано своей — потому шаблон
    # допускает и то и другое. Постпроверка это и поймала при первом прогоне.
    if not fatal_now:
        by_id = {a['id']: a['traditions'] for a in assigns if a['id'] in PH}
        beg = next(i for i, l in enumerate(lines)
                   if re.match(r'^\s*const\s+philosophers\s*=\s*\[', l))
        depth, end = 0, None
        for j in range(beg, len(lines)):
            depth += lines[j].count('[') - lines[j].count(']')
            if depth == 0 and j > beg:
                end = j
                break
        if end is None:
            problems_early = True
            stats['fail'] += 1
            log.append('ОТКАЗ: не найден конец массива philosophers')
        else:
            i = beg
            while i <= end:
                ln = lines[i]
                m = re.match(r'^(\s*)id:\s*"([a-z_]+)",(\s*name:\s*"|\s*$)', ln)
                if m and m.group(2) in by_id:
                    pid = m.group(2)
                    nxt = lines[i + 1] if i + 1 <= end else ''
                    if 'traditions:' in ln or 'traditions:' in nxt:
                        stats['skip'] += 1
                    else:
                        arr = ', '.join(f'"{t}"' for t in by_id[pid])
                        lines.insert(i + 1, f'{m.group(1)}traditions: [{arr}],')
                        stats['applied'] += 1
                        end += 1
                        i += 1
                i += 1

    out = '\n'.join(lines)

    problems = []
    if not fatal_now:
        try:
            after_ph = grab(out, 'philosophers')
            after_tr = grab(out, 'traditions')
        except Exception as exc:
            problems.append('литерал перестал читаться: ' + str(exc)[:200])
            after_ph = after_tr = None
        if after_ph is not None:
            if len(after_ph) != len(philosophers):
                problems.append(f'философов {len(philosophers)} → {len(after_ph)}')
            no_field = [p['id'] for p in after_ph if not p.get('traditions')]
            if no_field:
                problems.append('без поля остались: ' + ', '.join(no_field))
            bad = [p['id'] for p in after_ph
                   if any(t not in tids for t in p.get('traditions', []))]
            if bad:
                problems.append('поле ссылается вне словаря: ' + ', '.join(bad))
        if after_tr is None:
            problems.append('справочник traditions не читается')
        elif len(after_tr) != len(trads):
            problems.append(f'в справочнике {len(after_tr)}, ожидалось {len(trads)}')

    report = ['# Отчёт: поле традиций\n',
              f'Файл: `{html}`  \nmd5 входа: `{src_md5}`\n',
              f'Справочник: {"вставлен" if inserted_dict else "уже был"}, '
              f'традиций {len(trads)}  \n'
              f'Поле: применено {stats["applied"]}, пропущено {stats["skip"]}, '
              f'отказов {stats["fail"]}\n']
    if log:
        report.append('## Замечания\n')
        report.extend('- ' + s for s in log)
        report.append('')
    if problems:
        report.append('## ПОСТПРОВЕРКИ НЕ ПРОЙДЕНЫ\n')
        report.extend('- ' + s for s in problems)
        report.append('')

    fatal = stats['fail'] or problems
    if fatal and not args.force:
        report.append('**Файл не записан.**')
    elif args.dry_run:
        report.append('**Пробный прогон, файл не записан.**')
    else:
        shutil.copy2(html, str(html) + '.bak')
        html.write_text(out, encoding='utf-8')
        report.append(f'Записано. md5 выхода: `{md5(html)}`  \n'
                      f'Резервная копия: `{html}.bak`')

    txt = '\n'.join(report)
    print(txt)
    if args.report:
        Path(args.report).write_text(txt + '\n', encoding='utf-8')
    return 1 if fatal else 0


if __name__ == '__main__':
    sys.exit(main())
