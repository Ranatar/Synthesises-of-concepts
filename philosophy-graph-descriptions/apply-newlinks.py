#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply-newlinks.py — ДОБАВЛЕНИЕ новых связей в массив relations.

Четвёртый применяющий скрипт и единственный, который правит ДАННЫЕ, а не
описания: три прежних (apply-descriptions, apply-concepts, apply-philosophers)
только переписывают текст у существующих записей, этот заводит новые рёбра.

Отсюда и его особенности:
  * адресация — тройка (source, target, type), как у apply-descriptions,
    но с обратным условием: тройки НЕ ДОЛЖНО БЫТЬ в файле. Если она есть,
    запись пропускается (skip), а не переписывается — так достигается
    идемпотентность: повторный прогон даёт applied 0;
  * для СИММЕТРИЧНЫХ типов (symmetric: true) проверяется и обратная тройка:
    у схождения направления нет, и записать его дважды значило бы удвоить
    связь;
  * сверяются существование обеих концепций, существование типа и его слой:
    логический тип между РАЗНЫМИ системами и исторический ВНУТРИ одной
    системы — отказ. Слой both допустим и там и там;
  * проверяется хронология по полю temporal самого типа: forward требует,
    чтобы источник был старше цели, retrospective — наоборот. Слой
    typological и temporal null не проверяются (контакта нет);
  * вес обязан быть 1, 2 или 3 (WEIGHT_OPTIONS в файле);
  * описание проходит инвариант хранения: ни двойных кавычек, ни обратных
    слэшей, ни переводов строк, ни двойных пробелов.

Записи вставляются перед закрывающей скобкой массива, отдельным блоком с
пояснением. Постпроверки: число связей выросло ровно на applied, литерал
по-прежнему читается узлом, новых висячих ссылок нет. При любом отказе файл
не записывается.

Использование:
    apply-newlinks.py --html philosophy_graph.html \
                      --edits edits/batch-L01-newlinks.json [...] \
                      [--dry-run] [--report reports/report-L01.md] [--force]
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

REL_START = re.compile(r'^\s*const\s+relations\s*=\s*\[')
ARR_END = re.compile(r'^\s*\];')
FORBIDDEN = {'"': 'двойная кавычка', '\\': 'обратный слэш',
             '\n': 'перевод строки', '\t': 'табуляция'}


def md5(path):
    return hashlib.md5(Path(path).read_bytes()).hexdigest()


def grab_array(text, name):
    """Разбор массива через узел: собственный разбор скобок здесь избыточен."""
    m = re.search(r'const\s+' + name + r'\s*=\s*\[', text)
    if not m:
        raise SystemExit(f'ОТКАЗ: массив {name} не найден')
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
    blob = text[i:j]
    out = subprocess.run(
        ['node', '-e',
         'const s=require("fs").readFileSync(0,"utf8");'
         'process.stdout.write(JSON.stringify(new Function("return ("+s+")")()));'],
        input=blob.encode('utf-8'), capture_output=True, check=True)
    return json.loads(out.stdout.decode('utf-8'))


def find_block(lines):
    start = None
    for i, ln in enumerate(lines):
        if REL_START.match(ln):
            start = i
            break
    if start is None:
        raise SystemExit('ОТКАЗ: массив relations не найден')
    depth = 0
    for j in range(start, len(lines)):
        depth += lines[j].count('[') - lines[j].count(']')
        if depth == 0 and j > start:
            return start, j
    raise SystemExit('ОТКАЗ: конец массива relations не найден')


def esc_js(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--html', required=True)
    ap.add_argument('--edits', nargs='+', required=True)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--report')
    args = ap.parse_args()

    html = Path(args.html)
    src_md5 = md5(html)
    text = html.read_text(encoding='utf-8')

    concepts = grab_array(text, 'concepts')
    philosophers = grab_array(text, 'philosophers')
    relations = grab_array(text, 'relations')
    types = grab_array(text, 'relationTypes')

    C = {c['id']: c for c in concepts}
    PH = {p['id']: p for p in philosophers}
    TY = {t['id']: t for t in types}
    have = {(r['source'], r['target'], r['type']) for r in relations}
    n_before = len(relations)

    log, stats = [], {'applied': 0, 'skip': 0, 'fail': 0}
    new_records = []

    for ef in args.edits:
        data = json.loads(Path(ef).read_text(encoding='utf-8'))
        want = data.get('meta', {}).get('targetMd5')
        if want and want != src_md5:
            log.append(f'СПРАВКА [{ef}]: md5 входа {src_md5} не совпадает с '
                       f'указанным {want} — ожидаемо при цепочке заходов')
        for e in data.get('edits', []):
            s, t, ty = e.get('source'), e.get('target'), e.get('type')
            tag = f'{s} →{ty}→ {t}'
            if s not in C or t not in C:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: концепция не найдена')
                continue
            if ty not in TY:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: неизвестный тип')
                continue
            td = TY[ty]
            if (s, t, ty) in have:
                stats['skip'] += 1
                continue
            if td.get('symmetric') and (t, s, ty) in have:
                stats['skip'] += 1
                continue
            w = e.get('weight')
            if w not in (1, 2, 3):
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: вес {w!r} вне 1..3')
                continue
            d = e.get('description', '')
            bad = next((n for ch, n in FORBIDDEN.items() if ch in d), None)
            if bad or '  ' in d or not d.strip():
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: инвариант описания ({bad or "двойной пробел или пусто"})')
                continue
            ps, pt = C[s]['philosopher'], C[t]['philosopher']
            layer, inner = td.get('layer'), ps == pt
            if layer == 'logical' and not inner:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: логический тип между разными системами')
                continue
            if layer in ('historical', 'typological') and inner:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: тип слоя {layer} внутри одной системы')
                continue
            temporal = td.get('temporal')
            if temporal in ('forward', 'retrospective') and not inner:
                bs, bt = PH[ps]['birth'], PH[pt]['birth']
                if temporal == 'forward' and bs > bt:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: прямая конвенция, а источник моложе цели')
                    continue
                if temporal == 'retrospective' and bs < bt:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: обратная конвенция, а источник старше цели')
                    continue
            new_records.append((s, t, ty, w, d, e.get('note', '')))
            have.add((s, t, ty))
            stats['applied'] += 1

    lines = text.split('\n')
    start, end = find_block(lines)
    # Вставка не производится, если есть отказы: тогда и постпроверку числа
    # связей надо вести от невставленного, иначе она поднимает ложную тревогу.
    inserted = bool(new_records) and not (stats['fail'] and not args.force)
    if inserted:
        # ПОСЛЕДНЯЯ ЗАПИСЬ МАССИВА СТОИТ БЕЗ ЗАПЯТОЙ. Приписать после неё
        # новые записи, не поставив запятую, значит склеить два объекта и
        # получить неразбираемый литерал — на чём скрипт и споткнулся при
        # первом прогоне. Ищем последнюю содержательную строку перед концом
        # массива и дописываем запятую, если её нет.
        k = end - 1
        while k > start and (not lines[k].strip() or lines[k].lstrip().startswith('//')):
            k -= 1
        if lines[k].rstrip().endswith('}'):
            lines[k] = lines[k].rstrip() + ','
        block = ['',
                 '      // ── Добавленные связи (заход L01) ─────────────────────────',
                 '      // Починка островка двойственного ума и восемь рёбер, которых',
                 '      // недоставало по существу; разбор — reports/report-L01.md.']
        for (s, t, ty, w, d, note) in new_records:
            if note:
                block.append(f'      // {note}')
            block.append(f'      {{ source: "{s}", target: "{t}", type: "{ty}", weight: {w},')
            block.append(f'        description: "{esc_js(d)}" }},')
        lines[end:end] = block
    out = '\n'.join(lines)

    problems = []
    try:
        after = grab_array(out, 'relations')
    except Exception as exc:
        problems.append('литерал relations перестал читаться: ' + str(exc)[:200])
        after = []
    if after:
        expect = n_before + (stats['applied'] if inserted else 0)
        if len(after) != expect:
            problems.append(f'связей {n_before} → {len(after)}, ожидалось {expect}')
        if any(r['source'] not in C or r['target'] not in C for r in after):
            problems.append('появилась висячая ссылка')
        if len({(r['source'], r['target'], r['type']) for r in after}) != len(after):
            problems.append('появился дубликат тройки')

    report = ['# Отчёт добавления связей\n',
              f'Файл: `{html}`  \nmd5 входа: `{src_md5}`\n',
              f'Связей: применено {stats["applied"]}, пропущено (уже есть) '
              f'{stats["skip"]}, отказов {stats["fail"]}  \n'
              f'Всего связей: {n_before} → {len(after) if after else "?"}\n']
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

    text_report = '\n'.join(report)
    print(text_report)
    if args.report:
        Path(args.report).write_text(text_report + '\n', encoding='utf-8')
    return 1 if fatal else 0


if __name__ == '__main__':
    sys.exit(main())
