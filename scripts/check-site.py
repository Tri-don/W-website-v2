"""Check local page/media references and build inputs, including Linux path casing."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import html
import json
import re
import sys

SOURCE = Path(__file__).resolve().parents[1]
OUTPUT = '--dist' in sys.argv
ROOT = SOURCE / 'dist' if OUTPUT else SOURCE
errors = set()
checked = 0

def check(value, owner, base):
    global checked
    value = html.unescape(value.strip())
    url = urlsplit(value)
    if url.scheme.lower() in {'javascript', 'vbscript'}:
        errors.add(f'{owner.relative_to(ROOT).as_posix()}: unsafe URL scheme')
        return
    if url.scheme or url.netloc or not url.path:
        return
    target = (ROOT if url.path.startswith('/') else base) / unquote(url.path).lstrip('/')
    target = target.resolve()
    checked += 1
    label = owner.relative_to(ROOT).as_posix()
    if not target.is_relative_to(ROOT) or 'Bin' in target.relative_to(ROOT).parts:
        errors.add(f'{label}: reference outside active site: {value}')
        return
    if not target.exists():
        errors.add(f'{label}: missing {value}')
        return
    current = ROOT
    for part in target.relative_to(ROOT).parts:
        if part not in {p.name for p in current.iterdir()}:
            errors.add(f'{label}: filename capitalization mismatch: {value}')
            return
        current /= part

class Page(HTMLParser):
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        label = self.owner.relative_to(ROOT).as_posix()
        if any(attr.startswith('on') for attr, _ in attrs):
            errors.add(f'{label}: inline event handler conflicts with the security policy')
        if tag == 'script' and (not values.get('src')) and values.get('type') != 'application/ld+json':
            errors.add(f'{label}: inline executable script conflicts with the security policy')
        if tag == 'style':
            errors.add(f'{label}: inline stylesheet conflicts with the security policy')
        if tag == 'form' and values.get('method', 'get').lower() != 'post':
            errors.add(f'{label}: form can place submitted data in a GET URL')
        if tag == 'form' and (values.get('data-form-mode') != 'disabled' or values.get('action')):
            errors.add(f'{label}: form must remain disabled until a reviewed backend is configured')
        for attr, value in attrs:
            if attr in {'src', 'href', 'poster'} and value:
                check(value, self.owner, self.owner.parent)

manifest = json.loads((SOURCE / 'src/site-manifest.json').read_text(encoding='utf-8'))
pages = list(ROOT.rglob('*.html')) if OUTPUT else [ROOT / entry['file'] for entry in manifest['pages'].values()]
if not pages:
    sys.exit('No HTML pages found; run the build first.')
for page in pages:
    parser = Page()
    parser.owner = page
    parser.feed(page.read_text(encoding='utf-8'))
    for match in re.finditer(r'url\(\s*(["\']?)(.*?)\1\s*\)', page.read_text(encoding='utf-8'), re.S):
        check(match[2], page, page.parent)
if not OUTPUT:
    for page in manifest['pages'].values():
        check(page['file'], ROOT / 'src/site-manifest.json', ROOT)
    for unit in manifest['styles'] + manifest['scripts']:
        check(unit['path'], ROOT / 'src/site-manifest.json', ROOT)
for path, base in [(ROOT / 'css/site.css', ROOT / 'css')] + [
    (ROOT / unit['path'], ROOT / unit['base']) for unit in manifest['styles'] if not OUTPUT
]:
    for match in re.finditer(r'url\(\s*(["\']?)(.*?)\1\s*\)', path.read_text(encoding='utf-8'), re.S):
        check(match[2], path, base)
for directory in ([] if OUTPUT else ['src/blog', 'src/scripts']):
    for path in (ROOT / directory).rglob('*'):
        if path.suffix not in {'.json', '.js'}:
            continue
        for match in re.finditer(r'["\']((?:\./)?assets/[^"\'\r\n]+)["\']', path.read_text(encoding='utf-8')):
            check(match[1], path, ROOT)
if errors:
    print('\n'.join(sorted(errors)))
    sys.exit(1)
print(f'Checked {checked} local references across {len(pages)} {"built" if OUTPUT else "source"} pages; no missing files, archived dependencies or casing mismatches.')
