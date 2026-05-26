#!/usr/bin/env python3
"""
inject-styles.py — run from project root: python3 inject-styles.py
Reads each non-post page, shows current style block content,
then replaces it with correct layout CSS.
"""

import re, sys
from pathlib import Path

# ── CSS definitions per page ──────────────────────────────────────────────────

INDEX_CSS = """
/* ── Home page layout ───────────────────────────────────────────────────── */
.home {
  max-width: 68ch;
  margin-inline: auto;
  padding: 3rem 1.5rem 4rem;
}

.eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin: 0 0 0.75rem;
}

.dot { opacity: 0.4; }

.featured {
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--border);
}

.featured__title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0.5rem 0 1rem;
  color: var(--text);
  line-height: 1.2;
}

.featured__title a {
  color: inherit;
  text-decoration: none;
}

.featured__title a:hover { color: var(--accent); }

.featured__excerpt {
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 1rem;
}

.featured__meta {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.recent { margin-top: 0; }

.recent__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent__item {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}

.recent__date {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  flex-shrink: 0;
  white-space: nowrap;
}

.recent__title a {
  color: var(--text);
  text-decoration: none;
  transition: color 150ms ease-out;
}

.recent__title a:hover { color: var(--accent); }

.empty { color: var(--text-muted); margin-top: 2rem; }

@media (min-width: 768px) {
  .home { padding: 4rem 2rem 5rem; }
}
"""

ABOUT_CSS = """
/* ── About page layout ───────────────────────────────────────────────────── */
.about-page {
  max-width: 68ch;
  margin-inline: auto;
  padding: 3rem 1.5rem 4rem;
}

.about-name {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
  color: var(--text);
}

.about-tagline {
  color: var(--text-muted);
  margin: 0 0 3rem;
  font-size: 1rem;
  line-height: 1.6;
}

.about-section { margin-bottom: 2.5rem; }

.section-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-faint);
  margin: 0 0 1rem;
  font-weight: 400;
  display: block;
}

.section-body p {
  color: var(--text-muted);
  line-height: 1.75;
  margin: 0 0 1rem;
}

.section-body a {
  color: var(--accent);
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

.section-body a:hover { color: var(--accent-hover); }

.section-body ul {
  color: var(--text-muted);
  padding-left: 1.25rem;
  line-height: 1.75;
}

.cert-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cert-card {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  gap: 1rem;
}

.cert-name {
  font-weight: 500;
  color: var(--text);
  font-size: 0.9375rem;
}

.cert-issuer {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  flex-shrink: 0;
}

.work-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.work-item {
  padding: 0.4rem 0;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.status-grid {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 0.75rem 1.5rem;
  align-items: baseline;
}

.status-key {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  padding-top: 0.1rem;
}

.status-val {
  color: var(--text-muted);
  line-height: 1.6;
}

@media (min-width: 768px) {
  .about-page { padding: 4rem 2rem 5rem; }
}
"""

LIST_PAGE_CSS = """
/* ── List page layout (writeups / findings / notes) ─────────────────────── */
.list-page {
  max-width: 68ch;
  margin-inline: auto;
  padding: 3rem 1.5rem 4rem;
}

.page-header { margin-bottom: 2.5rem; }

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
  color: var(--text);
}

.page-desc {
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0;
}

.page-desc a {
  color: var(--accent);
  text-underline-offset: 3px;
}

.posts-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}

.post-date {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  flex-shrink: 0;
  white-space: nowrap;
}

.post-meta {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  flex-shrink: 0;
}

.post-title a {
  color: var(--text);
  text-decoration: none;
  transition: color 150ms ease-out;
}

.post-title a:hover { color: var(--accent); }

.empty {
  color: var(--text-muted);
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .list-page { padding: 4rem 2rem 5rem; }
}
"""

PROSE_PAGE_CSS = """
/* ── Prose page layout (now / disclaimer) ───────────────────────────────── */
.prose-page {
  max-width: 68ch;
  margin-inline: auto;
  padding: 3rem 1.5rem 4rem;
}

.prose-page h1 {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
  color: var(--text);
  line-height: 1.2;
}

.prose-page h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 2.5rem 0 0.75rem;
  color: var(--text);
}

.prose-page p {
  color: var(--text-muted);
  line-height: 1.75;
  margin: 0 0 1.25rem;
}

.prose-page ul,
.prose-page ol {
  color: var(--text-muted);
  padding-left: 1.5rem;
  margin: 0 0 1.25rem;
  line-height: 1.75;
}

.prose-page a {
  color: var(--accent);
  text-underline-offset: 3px;
}

.prose-page a:hover { color: var(--accent-hover); }

.updated {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  margin: 0 0 2.5rem;
}

@media (min-width: 768px) {
  .prose-page { padding: 4rem 2rem 5rem; }
}
"""

NOT_FOUND_CSS = """
/* ── 404 page ───────────────────────────────────────────────────────────── */
.not-found {
  min-height: 60vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 2rem;
}

.not-found__code {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: clamp(4rem, 12vw, 8rem);
  font-weight: 700;
  color: var(--text-faint);
  line-height: 1;
  margin: 0 0 1rem;
}

.not-found__msg {
  color: var(--text-muted);
  margin: 0 0 2rem;
  font-size: 1.125rem;
}

.not-found__link {
  color: var(--accent);
  text-underline-offset: 3px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.875rem;
}

.not-found__link:hover { color: var(--accent-hover); }
"""

TAGS_INDEX_CSS = """
/* ── Tags index page ─────────────────────────────────────────────────────── */
.tags-page {
  max-width: 68ch;
  margin-inline: auto;
  padding: 3rem 1.5rem 4rem;
}

.tags-page h1 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 2rem;
  color: var(--text);
}

.tag-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-decoration: none;
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 3px;
  transition: color 150ms ease-out, border-color 150ms ease-out;
}

.tag-item a:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.tag-count {
  color: var(--text-faint);
  font-size: 0.6875rem;
}

@media (min-width: 768px) {
  .tags-page { padding: 4rem 2rem 5rem; }
}
"""

TAG_PAGE_CSS = """
/* ── Single tag page ─────────────────────────────────────────────────────── */
.tag-page {
  max-width: 68ch;
  margin-inline: auto;
  padding: 3rem 1.5rem 4rem;
}

.tag-page h1 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
  color: var(--text);
}

.tag-page .back {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  text-decoration: none;
  display: inline-block;
  margin-bottom: 2rem;
}

.tag-page .back:hover { color: var(--accent); }

.post-count {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6875rem;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1.5rem;
}

.posts-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}

.post-date {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-faint);
  flex-shrink: 0;
  white-space: nowrap;
}

.post-title a {
  color: var(--text);
  text-decoration: none;
  transition: color 150ms ease-out;
}

.post-title a:hover { color: var(--accent); }

@media (min-width: 768px) {
  .tag-page { padding: 4rem 2rem 5rem; }
}
"""

# ── File → CSS mapping ────────────────────────────────────────────────────────

FILE_CSS_MAP = {
    "src/pages/index.astro":       INDEX_CSS,
    "src/pages/about.astro":       ABOUT_CSS,
    "src/pages/findings.astro":    LIST_PAGE_CSS,
    "src/pages/notes.astro":       LIST_PAGE_CSS,
    "src/pages/writeups.astro":    LIST_PAGE_CSS,
    "src/pages/now.astro":         PROSE_PAGE_CSS,
    "src/pages/disclaimer.astro":  PROSE_PAGE_CSS,
    "src/pages/404.astro":         NOT_FOUND_CSS,
    "src/pages/tags/index.astro":  TAGS_INDEX_CSS,
    "src/pages/tags/[tag].astro":  TAG_PAGE_CSS,
}

STYLE_PATTERN = re.compile(r'<style>(.*?)</style>', re.DOTALL)

def has_real_css(content: str) -> bool:
    """Returns True if the style block has actual CSS rules (not just comments/whitespace)."""
    stripped = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return bool(re.search(r'\{', stripped))

def process_file(path_str: str, css: str) -> None:
    path = Path(path_str)
    if not path.exists():
        print(f"  SKIP — not found: {path_str}")
        return

    text = path.read_text(encoding='utf-8')
    match = STYLE_PATTERN.search(text)

    if not match:
        # No <style> block at all — append one before end of file
        print(f"  ADD  — no style block found, appending: {path_str}")
        text = text.rstrip() + f"\n\n<style>{css}</style>\n"
        path.write_text(text, encoding='utf-8')
        return

    current_content = match.group(1)
    if has_real_css(current_content):
        print(f"  SKIP — already has CSS rules: {path_str}")
        print(f"         (first 80 chars: {current_content.strip()[:80]!r})")
        return

    print(f"  FIX  — replacing empty/comment-only style block: {path_str}")
    new_text = STYLE_PATTERN.sub(f'<style>{css}</style>', text, count=1)
    path.write_text(new_text, encoding='utf-8')

def main():
    print("inject-styles.py — injecting layout CSS into non-post pages\n")
    for file_path, css in FILE_CSS_MAP.items():
        process_file(file_path, css)

    print("\nDone. Run: npm run build && npm run preview")
    print("Then check:")
    print("  grep -c '\\.home\\|\\.about-page\\|\\.featured\\|\\.list-page' dist/client/_astro/*.css")
    print("  (should return > 0 for at least one file)\n")
    print("  ls -lh dist/client/_astro/*.css")
    print("  (should show MORE files than before, or larger sizes)\n")

if __name__ == "__main__":
    main()
