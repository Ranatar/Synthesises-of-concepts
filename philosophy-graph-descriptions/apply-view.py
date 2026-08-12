#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply-view.py — правки СЛОЯ ВЫВОДА: вставка кусков сценария по якорю.

Шестой применяющий скрипт. Прежние пять правили данные (описания, связи,
поле традиций); этот правит то, чем данные показываются, и потому устроен
иначе: адресация не по идентификатору записи, а по ЯКОРЮ — точному куску
текста файла, который обязан встречаться РОВНО ОДИН РАЗ.

  * `anchor` — кусок, перед которым ставится вставка. Ноль совпадений или
    больше одного — отказ: молчаливая вставка «куда-нибудь» недопустима.
  * `insert` — что вставить. Идемпотентность: если вставка уже есть в файле
    целиком, запись пропускается (skip), и повторный прогон даёт applied 0.
  * `replace` (необязательно) — если задан, якорь ЗАМЕНЯЕТСЯ на него, а не
    дополняется. Тогда идемпотентность проверяется по наличию замены.

Постпроверки: файл не уменьшился; каждая вставка присутствует ровно один раз;
встроенный сценарий по-прежнему разбирается узлом (`node --check`); и —
главное — размер файла и разбор данных остались прежними: правка вида не имеет
права трогать данные.

Использование:
    apply-view.py --html philosophy_graph.html \
                  --edits edits/batch-V01-traditions-view.json \
                  [--dry-run] [--report reports/report-V01.md] [--force]
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import sys
from pathlib import Path


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


def js_syntax_error(text):
    """Разбор встроенного сценария узлом. Заменил прежнюю проверку счёта
    скобок: та сверяла вставку саму с собой и потому не могла сработать
    никогда — пустая проверка, обнаруженная на пробе. Здесь же условие
    настоящее: сломанная вставка даёт ошибку разбора."""
    blocks = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', text, re.S)
    if not blocks:
        return 'встроенный сценарий не найден'
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False,
                                     encoding='utf-8') as f:
        f.write('\n;\n'.join(blocks))
        path = f.name
    r = subprocess.run(['node', '--check', path], capture_output=True)
    Path(path).unlink(missing_ok=True)
    if r.returncode:
        return r.stderr.decode('utf-8', 'replace').strip().split('\n')[-1][:200]
    return None


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

    before_data = {n: grab(text, n) for n in
                   ('philosophers', 'concepts', 'relations', 'traditions')}

    log, stats = [], {'applied': 0, 'skip': 0, 'fail': 0}
    want = data.get('meta', {}).get('targetMd5')
    if want and want != src_md5:
        log.append(f'СПРАВКА: md5 входа {src_md5} не совпадает с указанным {want}')

    out = text
    added = []
    for e in data.get('edits', []):
        eid = e.get('id', '?')
        anchor, insert, replace = e.get('anchor'), e.get('insert'), e.get('replace')
        piece = replace if replace is not None else insert
        if not anchor or piece is None:
            stats['fail'] += 1
            log.append(f'ОТКАЗ [{eid}]: не задан якорь или вставка')
            continue
        if out.count(piece) >= 1 and (replace is not None or out.count(insert) >= 1):
            stats['skip'] += 1
            continue
        n = out.count(anchor)
        if n != 1:
            stats['fail'] += 1
            log.append(f'ОТКАЗ [{eid}]: якорь встречается {n} раз, а должен ровно один')
            continue
        out = out.replace(anchor, piece if replace is not None else piece + anchor, 1)
        added.append((eid, piece))
        stats['applied'] += 1

    problems = []
    if added and not (stats['fail'] and not args.force):
        if len(out) <= len(text):
            problems.append('файл не вырос, хотя вставки были')
        for eid, piece in added:
            if out.count(piece) != 1:
                problems.append(f'[{eid}]: вставка встречается {out.count(piece)} раз')
        err = js_syntax_error(out)
        if err:
            problems.append('сценарий перестал разбираться: ' + err)
        try:
            after_data = {n: grab(out, n) for n in before_data}
        except Exception as exc:
            problems.append('данные перестали читаться: ' + str(exc)[:150])
            after_data = None
        if after_data is not None:
            for n in before_data:
                if json.dumps(before_data[n], sort_keys=True) != \
                   json.dumps(after_data[n], sort_keys=True):
                    problems.append(f'ПРАВКА ВИДА ТРОНУЛА ДАННЫЕ: массив {n} изменился')

    report = ['# Отчёт: правки слоя вывода\n',
              f'Файл: `{html}`  \nmd5 входа: `{src_md5}`\n',
              f'Правок: применено {stats["applied"]}, пропущено {stats["skip"]}, '
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
