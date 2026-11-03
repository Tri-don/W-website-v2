"""Refresh shared footers and build CSS/JavaScript assets using Python's standard library."""
from pathlib import Path
import json
import os
import re

ROOT = Path(__file__).resolve().parent


def find_end(text, start, stops):
    """Find a CSS delimiter outside strings, comments, functions and brackets."""
    quote = None
    parens = brackets = 0
    i = start
    while i < len(text):
        ch = text[i]
        if quote:
            if ch == '\\':
                i += 2
                continue
            if ch == quote:
                quote = None
        elif text.startswith('/*', i):
            end = text.find('*/', i + 2)
            i = len(text) if end < 0 else end + 2
            continue
        elif ch in "\"'":
            quote = ch
        elif ch == '(':
            parens += 1
        elif ch == ')':
            parens -= 1
        elif ch == '[':
            brackets += 1
        elif ch == ']':
            brackets -= 1
        elif not parens and not brackets and ch in stops:
            return i
        i += 1
    return len(text)


def close_brace(text, start):
    depth = 1
    i = start
    while depth:
        i = find_end(text, i, '{}')
        if i == len(text):
            raise ValueError('Unbalanced CSS block')
        depth += 1 if text[i] == '{' else -1
        i += 1
    return i - 1


def split_selectors(header):
    parts = []
    start = 0
    while start < len(header):
        end = find_end(header, start, ',')
        parts.append(header[start:end].strip())
        start = end + 1
    return parts


def guarded_selector(selector, key):
    # Guard the selected element, rather than assuming selectors start at body.
    # :where adds no specificity; root selectors and pseudo-elements still work.
    guard = f':where(html[data-wissen-css~="{key}"],html[data-wissen-css~="{key}"] *)'
    quote = None
    depth = 0
    for i, ch in enumerate(selector):
        if quote:
            if ch == quote and (i == 0 or selector[i - 1] != '\\'):
                quote = None
        elif ch in "\"'":
            quote = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        elif ch == ':' and depth == 0 and (selector[i:i + 2] == '::' or re.match(r':(?:before|after|first-line|first-letter)\b', selector[i:])):
            return selector[:i] + guard + selector[i:]
    return selector + guard


def scope_css(text, key):
    # Comments are not needed in the generated bundle; source files retain them.
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    names = re.findall(r'@(?:-webkit-)?keyframes\s+([\w-]+)', text)
    for name in set(names):
        replacement = key.replace('-', '_') + '__' + name
        text = re.sub(r'(@(?:-webkit-)?keyframes\s+)' + re.escape(name) + r'\b', lambda m: m[1] + replacement, text)
        text = re.sub(r'((?:animation|animation-name)\s*:\s*)([^;{}]+)', lambda m: m[1] + re.sub(r'(?<![\w-])' + re.escape(name) + r'(?![\w-])', replacement, m[2]), text)

    def walk(source):
        out = []
        i = 0
        while i < len(source):
            end = find_end(source, i, '{;')
            if end == len(source):
                out.append(source[i:])
                break
            head = source[i:end].strip()
            if source[end] == ';':
                out.append(source[i:end + 1])
                i = end + 1
                continue
            close = close_brace(source, end + 1)
            body = source[end + 1:close]
            if head.startswith('@'):
                if re.match(r'@(?:media|supports|container|layer|document)\b', head):
                    body = walk(body)
                out.append(head + '{' + body + '}')
            elif head:
                out.append(','.join(guarded_selector(s, key) for s in split_selectors(head)) + '{' + body + '}')
            i = close + 1
        return '\n'.join(out)
    return walk(text)


def rebase_urls(text, original_base):
    def replace(match):
        raw = match[1].strip()
        quote = raw[0] if raw[:1] in ('"', "'") else ''
        url = raw[1:-1] if quote else raw
        if re.match(r'(?:[a-z][\w+.-]*:|//|/|#)', url, re.I):
            return match[0]
        resolved = (ROOT / original_base / url).resolve()
        rebased = os.path.relpath(resolved, ROOT / 'css').replace('\\', '/')
        return 'url(' + quote + rebased + quote + ')'
    return re.sub(r'url\(([^)]+)\)', replace, text)


def build():
    manifest = json.loads((ROOT / 'src/site-manifest.json').read_text(encoding='utf-8'))
    # Keep one footer source while serving complete static HTML on every page.
    footer_source = (ROOT / manifest['footer_template']).read_text(encoding='utf-8').strip()
    for config in manifest['pages'].values():
        path = ROOT / config['file']
        original = path.read_text(encoding='utf-8')
        current_link = '<a href="' + config['file'] + '">'
        footer = footer_source.replace(current_link, current_link[:-1] + ' aria-current="page">')
        updated, count = re.subn(r'<footer\b[^>]*>.*?</footer\s*>', lambda match: footer, original, flags=re.S)
        if count != 1:
            raise ValueError(f'{config["file"]}: expected one footer, found {count}')
        if updated != original:
            path.write_text(updated, encoding='utf-8', newline='')
    css = ['/* Generated by build_site.py. Edit src/styles, then rebuild. */']
    for unit in manifest['styles']:
        source = (ROOT / unit['path']).read_text(encoding='utf-8-sig')
        css.append('\n/* ' + unit['key'] + ' */\n' + scope_css(rebase_urls(source, unit['base']), unit['key']))
    # The final shared design system intentionally overrides the template scales.
    css.append('\n/* Shared website design system */\n' + (ROOT / 'src/styles/global-system.css').read_text(encoding='utf-8'))
    (ROOT / 'css/site.css').write_text('\n'.join(css), encoding='utf-8')

    js = ['/* Generated by build_site.py. Original script order and head/defer timing are preserved. */', '(function(){', 'const modules = Object.create(null);']
    for unit in manifest['scripts']:
        source = (ROOT / unit['path']).read_text(encoding='utf-8-sig')
        js.append('modules[' + json.dumps(unit['key']) + '] = function(){\n' + source + '\n};')
    js.extend([
        'const page = ' + json.dumps(manifest['pages'], separators=(',', ':')) + ';',
        'const config = page[document.documentElement.dataset.wissenPage];',
        'if(!config)return;',
        'const delayed=[];',
        'for(const unit of config.scripts){if(unit.timing==="head")modules[unit.key]();else delayed.push(unit.key);}',
        'let started=false;',
        'function startDeferred(){if(started || document.readyState==="loading")return;started=true;for(const key of delayed)modules[key]();}',
        'if(document.readyState==="loading")document.addEventListener("readystatechange",startDeferred);else startDeferred();',
        '})();'
    ])
    (ROOT / 'js/site.js').write_text('\n'.join(js), encoding='utf-8')
    print(f'Built css/site.css and js/site.js for {len(manifest["pages"])} pages.')


if __name__ == '__main__':
    build()
