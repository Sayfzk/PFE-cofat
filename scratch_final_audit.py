import os, re

latex_dir = r'd:\New folder\CapcityStudyCofat\latex_report_src'

print('=== 1. CHECKING DOCUMENT STRUCTURE & INCLUDES ===')
with open(os.path.join(latex_dir, 'main.tex'), 'r', encoding='utf-8') as f:
    main_tex = f.read()

inputs = re.findall(r'\\(?:input|include)\{([^}]+)\}', main_tex)
for inp in inputs:
    fpath = os.path.join(latex_dir, inp)
    if not fpath.endswith('.tex'):
        fpath += '.tex'
    status = "OK" if os.path.exists(fpath) else "MISSING!"
    print(f'  Input: {inp} -> {status}')

print('\n=== 2. CHECKING METADATA IN GLOBAL_CONFIG & COVER PAGE ===')
for cf in ['global_config.tex', 'tpl/cover_page.tex', 'tpl/signatures.tex', 'tpl/resume.tex']:
    path = os.path.join(latex_dir, cf.replace('/', os.sep))
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()
        print(f'--- {cf} ---')
        for line in c.splitlines():
            if any(k in line.lower() for k in ['author', 'title', 'supervisor', 'date', 'academic', 'year', 'company', 'zakraoui', 'sayf', 'm.', 'mr']):
                print(' ', line.strip()[:100])

print('\n=== 3. CHECKING LABELS & REFERENCES ===')
all_labels = set()
all_refs = []
for root, _, files in os.walk(latex_dir):
    for f in files:
        if not f.endswith('.tex'): continue
        with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as tf:
            cnt = tf.read()
        for m in re.finditer(r'\\label\{([^}]+)\}', cnt):
            all_labels.add(m.group(1))
        for m in re.finditer(r'\\(?:ref|autoref|pageref)\{([^}]+)\}', cnt):
            all_refs.append((f, m.group(1)))

broken_refs = [(f, r) for f, r in all_refs if r not in all_labels]
print(f'Total labels: {len(all_labels)}')
print(f'Total references: {len(all_refs)}')
print(f'Broken references: {len(broken_refs)}')
for br in broken_refs:
    print('  BROKEN REF:', br)

print('\n=== 4. CHECKING CITATIONS & BIBLIOGRAPHY ===')
bib_path = os.path.join(latex_dir, 'references.bib')
if os.path.exists(bib_path):
    with open(bib_path, 'r', encoding='utf-8', errors='ignore') as bf:
        bib_cnt = bf.read()
    bib_keys = set(re.findall(r'@\w+\{([^,]+),', bib_cnt))
    print(f'Bib keys count: {len(bib_keys)}')
    all_cites = []
    for root, _, files in os.walk(latex_dir):
        for f in files:
            if not f.endswith('.tex'): continue
            with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as tf:
                cnt = tf.read()
            for m in re.finditer(r'\\cite\{([^}]+)\}', cnt):
                for k in m.group(1).split(','):
                    all_cites.append((f, k.strip()))
    broken_cites = [(f, c) for f, c in all_cites if c not in bib_keys]
    print(f'Total citations: {len(all_cites)}')
    print(f'Broken citations: {len(broken_cites)}')
    for bc in broken_cites:
        print('  BROKEN CITE:', bc)
else:
    print('references.bib not found')
