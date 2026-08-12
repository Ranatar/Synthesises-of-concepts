#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply-concepts.py — применение файлов правок описаний концепций
к philosophy_graph.html.

Спецификация: concepts-revision-spec.md, раздел 9.

Отличия от apply-descriptions.py, ради которых понадобился отдельный скрипт:
  * адресация правки — пара (id концепции, имя поля), а не тройка
    (source, target, type): у концепции два поля описания, и правка одного
    не должна задевать другое;
  * поле `description` приходится отличать от `extendedDescription`
    ретроспективной проверкой: подстрока `description:` входит в оба;
  * оба поля есть у всех 453 концепций, поэтому приговор `write` здесь
    ожидается неупотребимым и служит только страховкой.

Общее с прежним скриптом сохранено: номера строк не используются, указатель
пересобирается после каждой правки, идемпотентность (повторный прогон даёт
applied=0), при любом отказе файл не записывается (снимается --force),
резервная копия и постпроверки перед записью.

Использование:
    apply-concepts.py --html philosophy_graph.html \
                      --edits edits/batch-K01-presocratics.json [...] \
                      [--dry-run] [--report report-K01.md] [--force]
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

CON_START = re.compile(r'^\s*const\s+concepts\s*=\s*\[')
CON_END = re.compile(r'^\s*\];')
ID_RE = re.compile(r'\bid:\s*"(?P<id>[^"]+)"')
LABEL_RE = re.compile(r'\blabel:\s*"(?P<label>[^"]*)"')

# `description:` входит в `extendedDescription:` как подстрока — короткое поле
# отбирается ретроспективной проверкой, длинное берётся по полному имени.
FIELD_RE = {
    'description': re.compile(
        r'(?P<head>(?<!extended)\bdescription:\s*")(?P<body>[^"]*)(?P<tail>")'),
    'extendedDescription': re.compile(
        r'(?P<head>\bextendedDescription:\s*")(?P<body>[^"]*)(?P<tail>")'),
}
FIELDS = tuple(FIELD_RE)

FORBIDDEN = {'"': 'двойная кавычка', '\\': 'обратный слэш',
             '\n': 'перевод строки', '\r': 'возврат каретки',
             '\t': 'табуляция'}

VERDICTS = {'keep', 'fix', 'rewrite', 'write', 'defer'}


def md5(path):
    return hashlib.md5(Path(path).read_bytes()).hexdigest()


def find_block(lines):
    """Границы литерала concepts: (строка с '[', строка с ']')."""
    start = None
    for i, ln in enumerate(lines):
        if CON_START.match(ln):
            start = i
            break
    if start is None:
        raise SystemExit('ОТКАЗ: массив concepts не найден')
    for j in range(start + 1, len(lines)):
        if CON_END.match(lines[j]):
            return start, j
    raise SystemExit('ОТКАЗ: конец массива concepts не найден')


def split_records(lines, start, end):
    """Записи блока: список (первая строка, последняя строка) включительно.

    Баланс фигурных скобок считается вне строковых литералов: в описаниях
    встречаются и скобки, и апострофы, и греческие буквы.
    """
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
    """Указатель по id концепции -> (i, j)."""
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


def get_field(lines, i, j, field):
    """Текущее значение поля и номер строки с ним, либо (None, None)."""
    rx = FIELD_RE[field]
    for k in range(i, j + 1):
        m = rx.search(lines[k])
        if m:
            return m.group('body'), k
    return None, None


def set_field(lines, k, field, new):
    """Замена значения поля по месту. Форма записи сохраняется."""
    rx = FIELD_RE[field]
    lines[k] = rx.sub(
        lambda m: m.group('head') + new + m.group('tail'), lines[k], count=1)


def add_field(lines, i, j, field, new):
    """Вставка отсутствующего поля перед закрывающей строкой записи."""
    if i == j:
        raise ValueError('однострочная запись концепции не поддержана')
    prev = lines[j - 1].rstrip()
    if not prev.endswith(','):
        lines[j - 1] = prev + ','
    ln = lines[j - 1]
    indent = ln[:len(ln) - len(ln.lstrip())]
    lines.insert(j, f'{indent}{field}: "{new}"')


def check_text(new):
    for ch, name in FORBIDDEN.items():
        if ch in new:
            return f'запрещённый знак ({name})'
    if not new.strip():
        return 'пустое значение поля'
    return None


def count_fields(lines, records):
    """Сколько записей имеют непустым каждое из двух полей."""
    acc = {f: 0 for f in FIELDS}
    for (i, j) in records:
        for f in FIELDS:
            body, _ = get_field(lines, i, j, f)
            if body and body.strip():
                acc[f] += 1
    return acc


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
    labels = {}
    for cid, (i, j) in idx.items():
        m = LABEL_RE.search('\n'.join(lines[i:j + 1]))
        labels[cid] = m.group('label') if m else cid
    n_before = len(records)
    fields_before = count_fields(lines, records)

    log = []
    stats = {'applied': 0, 'skip': 0, 'keep': 0, 'defer': 0, 'fail': 0}
    written = {f: 0 for f in FIELDS}

    for ef in args.edits:
        data = json.loads(Path(ef).read_text(encoding='utf-8'))
        meta = data.get('meta', {})
        want = meta.get('targetMd5')
        if want and want != src_md5:
            log.append(f'СПРАВКА [{ef}]: md5 входного файла {src_md5} '
                       f'не совпадает с указанным в правках {want} — '
                       f'это ожидаемо, если ранее применялись другие заходы')
        for e in data.get('edits', []):
            cid = e.get('id')
            field = e.get('field')
            verdict = e.get('verdict')
            tag = f'{cid} [{labels.get(cid, "?")}] · {field}'
            if verdict not in VERDICTS:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: неизвестный приговор {verdict!r}')
                continue
            if field not in FIELDS:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: неизвестное поле {field!r}; '
                           f'допустимы {" и ".join(FIELDS)}')
                continue
            if cid not in idx:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: концепция не найдена')
                continue
            i, j = idx[cid]
            cur, k = get_field(lines, i, j, field)
            if verdict == 'keep':
                if cur is None:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: приговор keep, а поля нет')
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
                    log.append(f'ОТКАЗ {tag}: приговор write, а поле есть')
                    continue
            else:
                if cur is None:
                    stats['fail'] += 1
                    log.append(f'ОТКАЗ {tag}: приговор {verdict}, '
                               f'а поля нет — нужен write')
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
            try:
                if k is not None:
                    set_field(lines, k, field, new)
                else:
                    add_field(lines, i, j, field, new)
            except ValueError as exc:
                stats['fail'] += 1
                log.append(f'ОТКАЗ {tag}: {exc}')
                continue
            stats['applied'] += 1
            if verdict == 'write':
                written[field] += 1
            # строки могли сдвинуться — указатель пересобирается
            start, end = find_block(lines)
            records = split_records(lines, start, end)
            idx = index_records(lines, records)

    # ---- постпроверки ----------------------------------------------------
    problems = []
    start, end = find_block(lines)
    records = split_records(lines, start, end)
    if len(records) != n_before:
        problems.append(f'число концепций изменилось: '
                        f'{n_before} → {len(records)}')
    fields_after = count_fields(lines, records)
    for f in FIELDS:
        want = fields_before[f] + written[f]
        if fields_after[f] != want:
            problems.append(f'число полей {f}: {fields_before[f]} → '
                            f'{fields_after[f]}, ожидалось {want}')
    for (i, j) in records:
        for f in FIELDS:
            body, _ = get_field(lines, i, j, f)
            if body is not None and not body.strip():
                problems.append(f'появилось пустое поле {f}')
                break

    out = '\n'.join(lines)
    try:
        blob = '\n'.join(lines[start:end + 1])
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
        problems.append('литерал concepts перестал читаться: '
                        + exc.stderr.decode('utf-8', 'replace')[:200])

    report = []
    report.append('# Отчёт применения правок описаний концепций\n')
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
