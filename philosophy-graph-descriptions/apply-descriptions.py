#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply-descriptions.py — применение файлов правок описаний связей
к philosophy_graph.html.

Спецификация: descriptions-revision-spec.md, раздел 7.

Свойства:
  * адресация правки — тройка (source, target, type); номера строк не
    используются, они смещаются от любой правки выше;
  * понимает все три формы записи связи в исходнике (однострочную без
    описания, двухстрочную и развёрнутую по полю на строку);
  * идемпотентен: повторный прогон даёт applied=0, skip=N, fail=0;
  * при любом fail файл не записывается (снимается --force);
  * перед записью — .bak и постпроверки.

Использование:
    apply-descriptions.py --html philosophy_graph.html \
                          --edits edits/batch-00-reflexive.json [...] \
                          [--dry-run] [--report report-00.md] [--force]
"""

import argparse
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

REL_START = re.compile(r'^\s*const\s+relations\s*=\s*\[')
REL_END = re.compile(r'^\s*\];')
KEY_RE = re.compile(
    r'source:\s*"(?P<source>[^"]+)"\s*,\s*target:\s*"(?P<target>[^"]+)"'
    r'\s*,\s*type:\s*"(?P<type>[^"]+)"',
    re.S)
DESC_RE = re.compile(r'(?P<head>description:\s*")(?P<body>[^"]*)(?P<tail>")')
# закрытие записи: "weight: 3 }," и "weight: 3}," обе формы встречаются
CLOSE_RE = re.compile(r'\s*\}\s*,?\s*$')

FORBIDDEN = {'"': 'двойная кавычка', '\\': 'обратный слэш',
             '\n': 'перевод строки', '\r': 'возврат каретки',
             '\t': 'табуляция'}

VERDICTS = {'keep', 'fix', 'rewrite', 'write', 'defer'}


def md5(path):
    return hashlib.md5(Path(path).read_bytes()).hexdigest()


def find_block(lines):
    """Границы литерала relations: (первая строка после '[', строка ']')."""
    start = None
    for i, ln in enumerate(lines):
        if REL_START.match(ln):
            start = i
            break
    if start is None:
        raise SystemExit('ОТКАЗ: массив relations не найден')
    for j in range(start + 1, len(lines)):
        if REL_END.match(lines[j]):
            return start, j
    raise SystemExit('ОТКАЗ: конец массива relations не найден')


def split_records(lines, start, end):
    """Записи блока: список (первая строка, последняя строка) включительно.

    Баланс фигурных скобок считается вне строковых литералов. В описаниях
    двойных кавычек нет (инвариант корпуса), но правило общее.
    """
    records = []
    depth = 0
    first = None
    for i in range(start + 1, end):
        ln = lines[i]
        in_str = False
        esc = False
        for ch in ln:
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
    """Указатель по тройке (source, target, type) -> (i, j)."""
    idx = {}
    dups = []
    for (i, j) in records:
        text = '\n'.join(lines[i:j + 1])
        m = KEY_RE.search(text)
        if not m:
            raise SystemExit(f'ОТКАЗ: запись в строках {i+1}-{j+1} без ключа')
        key = (m.group('source'), m.group('target'), m.group('type'))
        if key in idx:
            dups.append(key)
        idx[key] = (i, j)
    if dups:
        raise SystemExit(f'ОТКАЗ: дубликаты тройки: {dups[:5]}')
    return idx


def get_description(lines, i, j):
    """Текущее описание записи и номер строки с полем, либо (None, None)."""
    for k in range(i, j + 1):
        m = DESC_RE.search(lines[k])
        if m:
            return m.group('body'), k
    return None, None


def set_description(lines, i, j, k, new):
    """Замена или вставка описания. Формы записи сохраняются."""
    if k is not None:
        lines[k] = DESC_RE.sub(
            lambda m: m.group('head') + new + m.group('tail'), lines[k], count=1)
        return
    # описания нет: запись формы 1 (однострочная) или формы 3 (развёрнутая)
    if i == j:
        ln = lines[i]
        m = CLOSE_RE.search(ln)
        if not m:
            raise ValueError('однострочная запись без закрывающей скобки')
        head = ln[:m.start()].rstrip()
        indent = ln[:len(ln) - len(ln.lstrip())]
        tail = ln[m.start():].lstrip()          # "}," либо "}"
        lines[i] = head + ','
        lines.insert(i + 1, f'{indent}  description: "{new}" {tail}')
    else:
        # развёрнутая: дописываем поле перед закрывающей строкой
        prev = lines[j - 1].rstrip()
        if not prev.endswith(','):
            lines[j - 1] = prev + ','
        indent = lines[j - 1][:len(lines[j - 1]) - len(lines[j - 1].lstrip())]
        lines.insert(j, f'{indent}description: "{new}"')


def check_text(new):
    for ch, name in FORBIDDEN.items():
        if ch in new:
            return f'запрещённый знак ({name})'
    if not new.strip():
        return 'пустое описание'
    return None


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
    lines = text.split('\n')

    start, end = find_block(lines)
    records = split_records(lines, start, end)
    idx = index_records(lines, records)
    n_before = len(records)
    desc_before = sum(1 for (i, j) in records
                      if get_description(lines, i, j)[0])

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
            key = (e.get('source'), e.get('target'), e.get('type'))
            verdict = e.get('verdict')
            tag = f'{key[0]} —{key[2]}→ {key[1]}'
            if verdict not in VERDICTS:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: неизвестный приговор {verdict!r}')
                continue
            if key not in idx:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: связь не найдена')
                continue
            i, j = idx[key]
            cur, k = get_description(lines, i, j)
            if verdict == 'keep':
                if cur is None:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: приговор keep, а описания нет')
                elif 'old' in e and e['old'] != cur:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: keep, но описание изменилось')
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
            else:
                if cur is None:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: приговор {verdict}, '
                               f'а описания нет — нужен write')
                    continue
                if 'old' not in e:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: нет поля old')
                    continue
                if e['old'] != cur:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: описание изменилось помимо '
                               f'этого файла правок')
                    continue
            try:
                set_description(lines, i, j, k, new)
            except ValueError as exc:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: {exc}')
                continue
            stats['applied'] += 1
            if verdict == 'write':
                written += 1
            # строки могли сдвинуться — указатель пересобирается
            start, end = find_block(lines)
            records = split_records(lines, start, end)
            idx = index_records(lines, records)

    # ---- постпроверки ----------------------------------------------------
    problems = []
    start, end = find_block(lines)
    records = split_records(lines, start, end)
    if len(records) != n_before:
        problems.append(f'число связей изменилось: {n_before} → {len(records)}')
    desc_after = sum(1 for (i, j) in records if get_description(lines, i, j)[0])
    if desc_after != desc_before + written:
        problems.append(f'число описаний {desc_before} → {desc_after}, '
                        f'ожидалось {desc_before + written}')
    for (i, j) in records:
        body, _ = get_description(lines, i, j)
        if body is not None and not body.strip():
            problems.append('появилось пустое описание')
            break

    out = '\n'.join(lines)
    try:
        # литерал должен по-прежнему читаться как массив
        import subprocess
        blob = '\n'.join(lines[find_block(lines)[0]:find_block(lines)[1] + 1])
        blob = blob[blob.index('['):blob.rindex(']') + 1]
        subprocess.run(['node', '-e',
                        'const s=require("fs").readFileSync(0,"utf8");'
                        'const a=new Function("return ("+s+")")();'
                        'if(!Array.isArray(a)||!a.length)process.exit(3);'],
                       input=blob.encode('utf-8'), check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except FileNotFoundError:
        log.append('СПРАВКА: node не найден, разбор литерала не проверен')
    except subprocess.CalledProcessError as exc:
        problems.append('литерал relations перестал читаться: '
                        + exc.stderr.decode('utf-8', 'replace')[:200])

    report = []
    report.append(f'# Отчёт применения правок\n')
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
