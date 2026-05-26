#!/usr/bin/env python3
"""
css-diagnose.py — run from project root: python3 css-diagnose.py
Checks CSS compilation, cache state, and layout class presence.
Output written to css-diagnose-output.txt
"""

import subprocess, sys, os, re
from pathlib import Path
from datetime import datetime

OUT_FILE = "css-diagnose-output.txt"

def run(cmd, shell=True):
    result = subprocess.run(cmd, shell=shell, capture_output=True, text=True)
    return (result.stdout + result.stderr).strip()

SEP = "─" * 50

lines = []

def section(title):
    lines.append(f"\n{SEP}")
    lines.append(f"{title}")
    lines.append(SEP)

def log(text=""):
    lines.append(str(text))

# ── Header ────────────────────────────────────────────────────────────────────
lines.append("CSS DIAGNOSTICS")
lines.append(f"Run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
lines.append(f"PWD:    {os.getcwd()}")

# ── 1. Vite cache state ───────────────────────────────────────────────────────
section("1. VITE CACHE — node_modules/.vite exists?")
vite_cache = Path("node_modules/.vite")
if vite_cache.exists():
    cache_files = list(vite_cache.rglob("*"))
    log(f"EXISTS — {len(cache_files)} files in cache")
    log("Will be cleared in step: rm -rf node_modules/.vite")
else:
    log("NOT FOUND — cache already clean")

# ── 2. Current dist CSS files ─────────────────────────────────────────────────
section("2. CURRENT dist/client/_astro/*.css — before clean build")
css_dir = Path("dist/client/_astro")
if css_dir.exists():
    css_files = sorted(css_dir.glob("*.css"))
    if css_files:
        for f in css_files:
            size = f.stat().st_size
            mtime = datetime.fromtimestamp(f.stat().st_mtime).strftime('%H:%M:%S')
            log(f"  {f.name:<45} {size:>8} bytes  mtime={mtime}")
    else:
        log("  NO CSS FILES FOUND")
else:
    log("  dist/client/_astro/ does not exist — no prior build")

# ── 3. CSS links in built index.html ─────────────────────────────────────────
section("3. CSS <link> tags in dist/client/index.html — before clean build")
index_html = Path("dist/client/index.html")
if index_html.exists():
    content = index_html.read_text(encoding='utf-8')
    css_links = re.findall(r'href="([^"]*\.css)"', content)
    if css_links:
        for link in css_links:
            log(f"  {link}")
    else:
        log("  NO CSS LINKS FOUND")
else:
    log("  dist/client/index.html NOT FOUND")

# ── 4. Layout classes in existing CSS ─────────────────────────────────────────
section("4. LAYOUT CLASSES in built CSS — before clean build")
layout_classes = [r'\.home', r'\.featured', r'\.list-page', r'\.list-title',
                  r'\.about-page', r'\.about-name', r'\.recent__item']
if css_dir.exists():
    for css_file in sorted(css_dir.glob("*.css")):
        text = css_file.read_text(encoding='utf-8')
        found = [cls for cls in layout_classes if re.search(cls, text)]
        if found:
            log(f"  FOUND in {css_file.name}: {', '.join(found)}")
        else:
            log(f"  NONE   in {css_file.name}")
else:
    log("  No dist directory to check")

# ── 5. Style block contents summary ──────────────────────────────────────────
section("5. STYLE BLOCK SUMMARY — source files")
page_files = [
    "src/pages/index.astro",
    "src/pages/about.astro",
    "src/pages/findings.astro",
    "src/pages/notes.astro",
    "src/pages/writeups.astro",
    "src/pages/now.astro",
    "src/pages/disclaimer.astro",
    "src/pages/404.astro",
    "src/pages/tags/index.astro",
    "src/pages/tags/[tag].astro",
]
for pf in page_files:
    p = Path(pf)
    if not p.exists():
        log(f"  MISSING: {pf}")
        continue
    text = p.read_text(encoding='utf-8')
    style_match = re.search(r'<style>(.*?)</style>', text, re.DOTALL)
    if not style_match:
        log(f"  NO STYLE BLOCK: {pf}")
        continue
    style_content = style_match.group(1)
    # Count actual CSS rules (lines with {)
    rule_count = len(re.findall(r'\{', style_content))
    # Find class names defined
    classes = re.findall(r'\.([\w-]+)\s*[{,]', style_content)
    unique_classes = list(dict.fromkeys(classes))[:8]
    log(f"  {pf}")
    log(f"    rules: {rule_count}  classes: {', '.join(unique_classes)}")

# ── 6. Clear cache and clean build ───────────────────────────────────────────
section("6. CLEARING VITE CACHE AND REBUILDING")
log("Removing node_modules/.vite ...")
run("rm -rf node_modules/.vite")
log("Removing dist/ ...")
run("rm -rf dist")
log("Running npm run build ...")
log("")
build_output = run("npm run build 2>&1")
log(build_output)

# ── 7. Post-build CSS files ───────────────────────────────────────────────────
section("7. CSS FILES AFTER CLEAN BUILD")
if css_dir.exists():
    css_files = sorted(css_dir.glob("*.css"))
    if css_files:
        for f in css_files:
            size = f.stat().st_size
            mtime = datetime.fromtimestamp(f.stat().st_mtime).strftime('%H:%M:%S')
            log(f"  {f.name:<45} {size:>8} bytes  mtime={mtime}")
    else:
        log("  NO CSS FILES — build may have failed")
else:
    log("  dist/client/_astro/ does not exist — build failed")

# ── 8. Layout classes after clean build ──────────────────────────────────────
section("8. LAYOUT CLASSES in CSS — after clean build")
if css_dir.exists():
    all_found = {}
    for css_file in sorted(css_dir.glob("*.css")):
        text = css_file.read_text(encoding='utf-8')
        found = [cls for cls in layout_classes if re.search(cls, text)]
        all_found[css_file.name] = found
        if found:
            log(f"  FOUND in {css_file.name}: {', '.join(found)}")
        else:
            log(f"  NONE   in {css_file.name}")

    total_found = sum(len(v) for v in all_found.values())
    log(f"\n  Total layout class matches across all CSS files: {total_found}")
    if total_found == 0:
        log("  *** PROBLEM: CSS not being compiled into build output ***")
    else:
        log("  *** CSS is present in build output ***")
else:
    log("  No dist directory")

# ── 9. CSS links in index.html after build ────────────────────────────────────
section("9. CSS <link> tags in index.html — after clean build")
if index_html.exists():
    content = index_html.read_text(encoding='utf-8')
    css_links = re.findall(r'href="([^"]*\.css)"', content)
    if css_links:
        for link in css_links:
            log(f"  {link}")
    else:
        log("  NO CSS LINKS FOUND IN index.html")
else:
    log("  dist/client/index.html NOT FOUND")

# ── 10. Check about.html CSS links ───────────────────────────────────────────
section("10. CSS <link> tags in about/index.html — after clean build")
about_html = Path("dist/client/about/index.html")
if about_html.exists():
    content = about_html.read_text(encoding='utf-8')
    css_links = re.findall(r'href="([^"]*\.css)"', content)
    if css_links:
        for link in css_links:
            log(f"  {link}")
    else:
        log("  NO CSS LINKS FOUND IN about/index.html")
else:
    log("  dist/client/about/index.html NOT FOUND (SSR page — expected for Cloudflare adapter)")

# ── 11. Pagefind after clean build ───────────────────────────────────────────
section("11. PAGEFIND after clean build")
pf_entry = Path("dist/client/pagefind/pagefind-entry.json")
if pf_entry.exists():
    log(pf_entry.read_text(encoding='utf-8').strip())
else:
    pf_entry2 = Path("dist/pagefind/pagefind-entry.json")
    if pf_entry2.exists():
        log(pf_entry2.read_text(encoding='utf-8').strip())
    else:
        log("pagefind-entry.json NOT FOUND — Pagefind did not run")

# ── 12. CSP wasm check ────────────────────────────────────────────────────────
section("12. CSP wasm-unsafe-eval check")
headers_file = Path("public/_headers")
if headers_file.exists():
    content = headers_file.read_text(encoding='utf-8')
    if "wasm-unsafe-eval" in content:
        log("PASS — wasm-unsafe-eval present in _headers")
        csp_line = [l for l in content.splitlines() if "Content-Security-Policy" in l]
        if csp_line:
            log(f"\n  CSP line:\n  {csp_line[0].strip()}")
    else:
        log("FAIL — wasm-unsafe-eval MISSING from _headers")
else:
    log("public/_headers NOT FOUND")

# ── Write output ──────────────────────────────────────────────────────────────
output = "\n".join(lines)
Path(OUT_FILE).write_text(output, encoding='utf-8')
print(f"\nDone. Drop '{OUT_FILE}' in the chat.")
print(f"(also printed above for terminal review)")
print("\n" + output)
