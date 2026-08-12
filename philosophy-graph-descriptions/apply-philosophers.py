#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply-philosophers.py — применение файлов правок описаний философов
к philosophy_graph.html.

Спецификация: philosophers-revision-spec.md, раздел 9.

Отличия от двух прежних применяющих скриптов:
  * адресация — один только `id`: поле описания у философа одно, и указывать
    его имя не нужно (у концепции их два, и там нужна пара);
  * ЗНАЧЕНИЕ СОДЕРЖИТ ПЕРЕВОДЫ СТРОК, и они существенны — ими разделяются
    абзацы, и вывод (generatePhilosopherViewContent) превращает их в разрыв
    строки. В файле они записаны последовательностью \\n внутри строкового
    литерала, тогда как в JSON правок стоят настоящими переводами строки.
    Скрипт переводит одно в другое в обе стороны и сверяет РАСШИФРОВАННЫЕ
    значения, а не записанные;
  * инвариант запрещает ОДИНОЧНЫЙ перевод строки: абзацы разделяются только
    двойным. Проверяется до записи.

Общее с прежними скриптами сохранено: номера строк не используются, указатель
пересобирается после каждой правки, идемпотентность (повторный прогон даёт
applied=0), при любом отказе файл не записывается (снимается --force),
резервная копия и постпроверки перед записью.

Использование:
    apply-philosophers.py --html philosophy_graph.html \
                          --edits edits/batch-F01-antiquity.json [...] \
                          [--dry-run] [--report report-F01.md] [--force]
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

PH_START = re.compile(r'^\s*const\s+philosophers\s*=\s*\[')
PH_END = re.compile(r'^\s*\];')
ID_RE = re.compile(r'\bid:\s*"(?P<id>[^"]+)"')
NAME_RE = re.compile(r'\bnameRu:\s*"(?P<name>[^"]*)"')
DESC_RE = re.compile(r'(?P<head>\bdescription:\s*")(?P<body>(?:[^"\\]|\\.)*)(?P<tail>")')

# в записи запрещены сами по себе; переводы строк живут только как \n
FORBIDDEN = {'"': 'двойная кавычка', '\t': 'табуляция', '\r': 'возврат каретки'}

VERDICTS = {'keep', 'fix', 'rewrite', 'write', 'defer'}


def md5(path):
    return hashlib.md5(Path(path).read_bytes()).hexdigest()


def decode(raw):
    """Записанный литерал -> настоящий текст (с переводами строк)."""
    return raw.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')


def encode(text):
    """Настоящий текст -> литерал для записи в файл."""
    return text.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')


def find_block(lines):
    start = None
    for i, ln in enumerate(lines):
        if PH_START.match(ln):
            start = i
            break
    if start is None:
        raise SystemExit('ОТКАЗ: массив philosophers не найден')
    for j in range(start + 1, len(lines)):
        if PH_END.match(lines[j]):
            return start, j
    raise SystemExit('ОТКАЗ: конец массива philosophers не найден')


def split_records(lines, start, end):
    """Записи блока: список (первая строка, последняя строка) включительно."""
    records = []
    depth = 0
    first = None
    for i in range(start + 1, end):
        in_str = False
        esc = False
        for ch in lines[i]:
            if in_str:
                if esc:
                    esc = False
                elif ch == '\\':
                    esc = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch == '{':
                if depth == 0:
                    first = i
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0 and first is not None:
                    records.append((first, i))
                    first = None
    if depth != 0:
        raise SystemExit('ОТКАЗ: разбор записей не сошёлся по скобкам')
    return records


def index_records(lines, records):
    idx = {}
    dups = []
    for (i, j) in records:
        text = '\n'.join(lines[i:j + 1])
        m = ID_RE.search(text)
        if not m:
            raise SystemExit(f'ОТКАЗ: запись в строках {i+1}-{j+1} без id')
        key = m.group('id')
        if key in idx:
            dups.append(key)
        idx[key] = (i, j)
    if dups:
        raise SystemExit(f'ОТКАЗ: повторяющиеся id: {dups[:5]}')
    return idx


def get_desc(lines, i, j):
    """Текущее описание (расшифрованное) и номер строки, либо (None, None)."""
    for k in range(i, j + 1):
        m = DESC_RE.search(lines[k])
        if m:
            return decode(m.group('body')), k
    return None, None


def set_desc(lines, k, new):
    lines[k] = DESC_RE.sub(
        lambda m: m.group('head') + encode(new) + m.group('tail'), lines[k], count=1)


def check_text(new):
    for ch, name in FORBIDDEN.items():
        if ch in new:
            return f'запрещённый знак ({name})'
    if '\\' in new:
        return 'обратный слэш'
    if '  ' in new:
        return 'двойной пробел'
    if re.search(r'[^\n]\n(?!\n)', new):
        return 'одиночный перевод строки: абзацы разделяются двойным'
    if new.startswith('\n') or new.endswith('\n'):
        return 'перевод строки в начале или конце'
    if not new.strip():
        return 'пустое значение'
    return None


def count_desc(lines, records):
    n = 0
    for (i, j) in records:
        body, _ = get_desc(lines, i, j)
        if body and body.strip():
            n += 1
    return n


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
    lines = html.read_text(encoding='utf-8').split('\n')

    start, end = find_block(lines)
    records = split_records(lines, start, end)
    idx = index_records(lines, records)
    names = {}
    for pid, (i, j) in idx.items():
        m = NAME_RE.search('\n'.join(lines[i:j + 1]))
        names[pid] = m.group('name') if m else pid
    n_before = len(records)
    desc_before = count_desc(lines, records)

    log = []
    stats = {'applied': 0, 'skip': 0, 'keep': 0, 'defer': 0, 'fail': 0}
    written = 0

    for ef in args.edits:
        data = json.loads(Path(ef).read_text(encoding='utf-8'))
        meta = data.get('meta', {})
        want = meta.get('targetMd5')
        if want and want != src_md5:
            log.append(f'СПРАВКА [{ef}]: md5 входного файла {src_md5} '
                       f'не совпадает с указанным в правках {want} — '
                       f'это ожидаемо, если ранее применялись другие заходы')
        for e in data.get('edits', []):
            pid = e.get('id')
            verdict = e.get('verdict')
            tag = f'{pid} [{names.get(pid, "?")}]'
            if verdict not in VERDICTS:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: неизвестный приговор {verdict!r}')
                continue
            if pid not in idx:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: философ не найден')
                continue
            i, j = idx[pid]
            cur, k = get_desc(lines, i, j)
            if verdict == 'keep':
                if cur is None:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: приговор keep, а описания нет')
                elif 'old' in e and e['old'] != cur:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: keep, но значение изменилось')
                else:
                    stats['keep'] += 1
                continue
            if verdict == 'defer':
                stats['defer'] += 1
                log.append(f'отложено {tag}: {e.get("note", "без пояснения")}')
                continue
            new = e.get('new')
            if new is None:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: нет поля new при приговоре {verdict}')
                continue
            bad = check_text(new)
            if bad:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: {bad}')
                continue
            if cur == new:
                stats['skip'] += 1
                continue
            if verdict == 'write':
                if cur is not None:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: приговор write, а описание есть')
                    continue
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: описание есть у всех 57, '
                           f'приговор write здесь неупотребим')
                continue
            if cur is None:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: приговор {verdict}, а описания нет')
                continue
            if 'old' not in e:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: нет поля old')
                continue
            if e['old'] != cur:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: значение изменилось помимо '
                           f'этого файла правок')
                continue
            set_desc(lines, k, new)
            stats['applied'] += 1
            start, end = find_block(lines)
            records = split_records(lines, start, end)
            idx = index_records(lines, records)

    # ---- постпроверки ----------------------------------------------------
    problems = []
    start, end = find_block(lines)
    records = split_records(lines, start, end)
    if len(records) != n_before:
        problems.append(f'число философов изменилось: {n_before} → {len(records)}')
    desc_after = count_desc(lines, records)
    if desc_after != desc_before + written:
        problems.append(f'число описаний: {desc_before} → {desc_after}, '
                        f'ожидалось {desc_before + written}')
    for (i, j) in records:
        body, _ = get_desc(lines, i, j)
        if body is not None and re.search(r'[^\n]\n(?!\n)', body):
            problems.append('появился одиночный перевод строки')
            break

    out = '\n'.join(lines)
    try:
        blob = '\n'.join(lines[start:end + 1])
        blob = blob[blob.index('['):blob.rindex(']') + 1]
        subprocess.run(['node', '-e',
                        'const s=require("fs").readFileSync(0,"utf8");'
                        'const a=new Function("return ("+s+")")();'
                        'if(!Array.isArray(a)||!a.length)process.exit(3);'
                        'if(a.some(p=>/[^\\n]\\n(?!\\n)/.test(p.description||"")))process.exit(4);'],
                       input=blob.encode('utf-8'), check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except FileNotFoundError:
        log.append('СПРАВКА: node не найден, разбор литерала не проверен')
    except subprocess.CalledProcessError as exc:
        problems.append('литерал philosophers перестал читаться или содержит '
                        'одиночный перевод строки: '
                        + exc.stderr.decode('utf-8', 'replace')[:200])

    report = []
    report.append('# Отчёт применения правок описаний философов\n')
    report.append(f'Файл: `{html}`  \nmd5 входа: `{src_md5}`\n')
    report.append(f'Правок: применено {stats["applied"]}, '
                  f'пропущено (уже применены) {stats["skip"]}, '
                  f'признано годными {stats["keep"]}, '
                  f'отложено {stats["defer"]}, '
                  f'отказов {stats["fail"]}\n')
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
