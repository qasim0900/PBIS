import os, re, sys
from pathlib import Path

root = Path('frontend/src')
js_files = list(root.rglob('*.js')) + list(root.rglob('*.jsx'))

unused = []

import_stmt_re = re.compile(r"^\s*import\s+(?P<what>.+?)\s+from\s+['\"].+['\"];?\s*$")
default_re = re.compile(r"^(?P<default>[_A-Za-z][_A-Za-z0-9]*)$")
namespace_re = re.compile(r"^\*\s+as\s+(?P<name>[_A-Za-z][_A-Za-z0-9]*)$")
named_re = re.compile(r"^{\s*(?P<named>.+)\s*}$")

for file in js_files:
    text = file.read_text(encoding='utf-8')
    lines = text.splitlines()
    imports = []
    for i, line in enumerate(lines[:50]):  # only top lines usually
        m = import_stmt_re.match(line)
        if m:
            what = m.group('what').strip()
            imports.append((i+1, what, line))

    # Exclude import lines from usage counting to avoid counting the import as a usage
    text_wo_imports = text
    for _, _, il in imports:
        text_wo_imports = text_wo_imports.replace(il, '')
    usages = set(re.findall(r"[_A-Za-z][_A-Za-z0-9]*", text_wo_imports))
    file_unused = []
    for (ln, what, line) in imports:
        # side-effect import like: import './index.css';
        if what.startswith("'") or what.startswith('"') or what.startswith('.'): 
            continue
        # default + named mix: e.g. default, {a, b}
        parts = [p.strip() for p in what.split(',') if p.strip()]
        for part in parts:
            # namespace
            mns = namespace_re.match(part)
            if mns:
                name = mns.group('name')
                # check usage
                if name not in usages:
                    file_unused.append((ln, name, line))
                continue
            # named
            mn = named_re.match(part)
            if mn:
                named = mn.group('named')
                # split by commas
                for namedpart in [n.strip() for n in named.split(',') if n.strip()]:
                    # handle as alias: a as b
                    if ' as ' in namedpart:
                        name = namedpart.split(' as ')[1].strip()
                    else:
                        name = namedpart
                    if name not in usages:
                        file_unused.append((ln, name, line))
                continue
            # default import name
            md = default_re.match(part)
            if md:
                name = md.group('default')
                if name not in usages:
                    file_unused.append((ln, name, line))
                continue
            # other patterns - try to extract word
            w = re.findall(r"[_A-Za-z][_A-Za-z0-9]*", part)
            for name in w:
                if name not in usages:
                    file_unused.append((ln, name, line))
    if file_unused:
        unused.append((str(file), file_unused))

# Now report for python files minimal analysis
py_root = Path('.')
py_files = list(py_root.rglob('*.py'))
py_unused = []

py_import_re = re.compile(r"^\s*(?:from\s+(?P<mod>[_A-Za-z0-9.]+)\s+import\s+(?P<names>.+)|import\s+(?P<imp>.+))\s*$")
for file in py_files:
    # skip migrations
    if 'migrations' in str(file.parts):
        continue
    text = file.read_text(encoding='utf-8')
    lines = text.splitlines()
    imports = []
    for i, line in enumerate(lines[:200]):
        m = py_import_re.match(line)
        if m:
            if m.group('names'):
                names = m.group('names')
                imports.append((i+1, 'from', names.strip(), line))
            elif m.group('imp'):
                imports.append((i+1, 'import', m.group('imp').strip(), line))
    if not imports:
        continue
        # Remove import lines from text for accurate usage counting
        text_wo_imports = text
        for _, _, il in imports:
            text_wo_imports = text_wo_imports.replace(il, '')
        usages = set(re.findall(r"[_A-Za-z][_A-Za-z0-9]*", text_wo_imports))
    file_unused = []
    for (ln, typ, names, line) in imports:
        if typ == 'from':
            # names may contain alias or parenthesis
            # strip parentheses
            names = names.strip()
            if names.startswith('(') and names.endswith(')'):
                names = names[1:-1]
            for part in [n.strip() for n in names.split(',')]:
                if ' as ' in part:
                    name = part.split(' as ')[1].strip()
                else:
                    name = part.split('.')[-1]
                if name not in usages:
                    # ignore typical noqa or intentionally unused
                    if '# noqa' in line or 'noqa' in line:
                        continue
                    file_unused.append((ln, name, line))
        else:
            # import x, y as z
            for part in [p.strip() for p in names.split(',')]:
                if ' as ' in part:
                    name = part.split(' as ')[1].strip()
                else:
                    name = part.split('.')[0]
                if name not in usages:
                    file_unused.append((ln, name, line))
    if file_unused:
        py_unused.append((str(file), file_unused))

# print results
print('--- JS/JSX unused imports ---')
for f, items in unused:
    print(f)
    for ln, name, line in items:
        print(f'  line {ln}: {name} in -> {line.strip()}')

print('\n--- PYTHON unused imports ---')
for f, items in py_unused:
    print(f)
    for ln, name, line in items:
        print(f'  line {ln}: {name} in -> {line.strip()}')
