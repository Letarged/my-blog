#!/usr/bin/env bash
# c0rvex blog diagnostics — run from project root: bash diagnose.sh
# Output redirected to diagnose-output.txt

OUT="diagnose-output.txt"
exec > "$OUT" 2>&1

SEP="────────────────────────────────────────"

echo "c0rvex BLOG DIAGNOSTICS"
echo "Run at: $(date)"
echo "PWD:    $(pwd)"
echo ""

# ── 1. Project structure ──────────────────────────────────────────────────────
echo "$SEP"
echo "1. SRC/PAGES STRUCTURE"
echo "$SEP"
find src/pages -name "*.astro" | sort

echo ""
echo "$SEP"
echo "2. GLOBAL.CSS IMPORT — which pages have it"
echo "$SEP"
grep -rn "global.css" src/pages/ src/layouts/ 2>/dev/null || echo "NONE FOUND"

echo ""
echo "$SEP"
echo "3. GLOBAL.CSS — first 30 lines"
echo "$SEP"
head -30 src/styles/global.css 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "4. GLOBAL.CSS — body and html rules + CSS variables"
echo "$SEP"
grep -n "body\|html\b\|:root\|--bg\|--text\|--accent\|--surface\|@theme\|data-theme" src/styles/global.css 2>/dev/null | head -40

echo ""
echo "$SEP"
echo "5. TAILWIND — @import tailwindcss present?"
echo "$SEP"
grep -n "@import" src/styles/global.css 2>/dev/null || echo "NO @import FOUND"

echo ""
echo "$SEP"
echo "6. ASTRO CONFIG — vite + tailwind plugin"
echo "$SEP"
cat astro.config.mjs 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "7. BUILT CSS — theme tokens present?"
echo "$SEP"
if ls dist/client/_astro/*.css 1>/dev/null 2>&1; then
  grep -oh "\-\-bg[^;:}]*" dist/client/_astro/*.css | head -5
  grep -oh "\-\-accent[^;:}]*" dist/client/_astro/*.css | head -5
  echo "--- CSS file count and sizes:"
  ls -lh dist/client/_astro/*.css
else
  echo "NO CSS FILES IN dist/client/_astro/"
fi

echo ""
echo "$SEP"
echo "8. BUILT CSS — body background rule"
echo "$SEP"
if ls dist/client/_astro/*.css 1>/dev/null 2>&1; then
  grep -oh "body{[^}]*}" dist/client/_astro/*.css | head -3
  grep -oh "body {[^}]*}" dist/client/_astro/*.css | head -3
else
  echo "NO CSS FILES"
fi

echo ""
echo "$SEP"
echo "9. PAGEFIND — entry.json (page count)"
echo "$SEP"
cat dist/client/pagefind/pagefind-entry.json 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "10. PAGEFIND — which pages have data-pagefind-body"
echo "$SEP"
grep -rn "data-pagefind-body" src/ 2>/dev/null || echo "NONE FOUND"

echo ""
echo "$SEP"
echo "11. PAGEFIND — which pages have data-pagefind-ignore"
echo "$SEP"
grep -rn "data-pagefind-ignore" src/ 2>/dev/null || echo "NONE FOUND"

echo ""
echo "$SEP"
echo "12. PAGEFIND — JS loader component"
echo "$SEP"
grep -rn "pagefind" src/components/ 2>/dev/null | grep -v "Binary" | head -20

echo ""
echo "$SEP"
echo "13. CSP HEADERS — _headers file"
echo "$SEP"
cat public/_headers 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "14. CSP — wasm-unsafe-eval present?"
echo "$SEP"
grep -i "wasm" public/_headers 2>/dev/null || echo "wasm-unsafe-eval NOT FOUND IN _headers — THIS IS LIKELY THE SEARCH BUG"

echo ""
echo "$SEP"
echo "15. THEME INIT SCRIPT — public/theme-init.js"
echo "$SEP"
cat public/theme-init.js 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "16. SIDEBAR TOGGLE SCRIPT — public/sidebar-toggle.js"
echo "$SEP"
cat public/sidebar-toggle.js 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "17. INDEX PAGE — full frontmatter (first 20 lines)"
echo "$SEP"
head -20 src/pages/index.astro 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "18. ABOUT PAGE — full frontmatter (first 20 lines)"
echo "$SEP"
head -20 src/pages/about.astro 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "19. SITEHEADER — does it import global.css?"
echo "$SEP"
head -10 src/components/ui/SiteHeader.astro 2>/dev/null || echo "FILE NOT FOUND"
grep -n "global.css" src/components/ui/SiteHeader.astro 2>/dev/null || echo "NO global.css import in SiteHeader"

echo ""
echo "$SEP"
echo "20. BASEHEAD — does it import global.css or link a stylesheet?"
echo "$SEP"
cat src/components/BaseHead.astro 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "21. FIGURE COMPONENT — malformed image caption check"
echo "$SEP"
cat src/components/Figure.astro 2>/dev/null || echo "FILE NOT FOUND"

echo ""
echo "$SEP"
echo "22. EXAMPLE WRITEUP — figure/image usage"
echo "$SEP"
grep -n "Figure\|img\|!\[" src/content/posts/_example-writeup.mdx 2>/dev/null | head -20

echo ""
echo "$SEP"
echo "23. BUILT HTML — does index.html reference a CSS file?"
echo "$SEP"
grep -o 'href="/_astro/[^"]*\.css"' dist/client/index.html 2>/dev/null | head -5 || echo "dist/client/index.html NOT FOUND or no CSS link"

echo ""
echo "$SEP"
echo "24. BUILT HTML — does index.html have data-theme on html tag?"
echo "$SEP"
grep -o '<html[^>]*>' dist/client/index.html 2>/dev/null | head -3 || echo "NOT FOUND"

echo ""
echo "$SEP"
echo "DONE — drop diagnose-output.txt in the chat"
echo "$SEP"
