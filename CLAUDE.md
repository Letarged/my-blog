# CLAUDE.md — Pentest Walkthrough Blog

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | Astro | 5.x (`astro@5`) |
| Content | MDX | `@astrojs/mdx@4` |
| Styling | Tailwind CSS | v4 (`@tailwindcss/vite`) |
| Syntax highlight | Shiki | bundled with Astro 5 |
| Search | Pagefind | `pagefind@1` (post-build) |
| Comments | Giscus | `@giscus/web` |
| Deployment | Cloudflare Pages | `@astrojs/cloudflare` adapter |
| Language | TypeScript | strict mode (`"strict": true`) |

Tailwind v4 uses `@import "tailwindcss"` in CSS — no `tailwind.config.js`.
Use CSS custom properties and the `@theme` block for all design tokens.

---

## Directory Layout

```
/
├── CLAUDE.md
├── astro.config.ts
├── tsconfig.json
├── public/
│   └── fonts/               # Self-hosted only — no Google Fonts CDN
├── src/
│   ├── content/
│   │   ├── config.ts        # Collection schema (zod)
│   │   └── posts/           # One .mdx file per walkthrough
│   ├── components/
│   │   ├── mdx/             # MDX-only components (Finding, Terminal, etc.)
│   │   └── ui/              # Layout/page components
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── Post.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── posts/[slug].astro
│   │   ├── rss.xml.ts
│   │   └── sitemap.xml.ts
│   └── styles/
│       └── global.css       # @import "tailwindcss"; + @theme block
└── scripts/
    └── strip-exif.sh        # MUST run before git add on any image
```

---

## Content Schema (`src/content/config.ts`)

```ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title:      z.string().max(90),
    date:       z.coerce.date(),
    category:   z.enum(['HackTheBox', 'TryHackMe', 'VulnHub', 'Research', 'CVE']),
    tags:       z.array(z.string()).max(8),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Insane']).optional(),
    box_status: z.enum(['active', 'retired', 'research']).default('retired'),
    excerpt:    z.string().max(200),
    cover:      z.string().optional(),  // relative path from public/
    draft:      z.boolean().default(false),
  }),
});

export const collections = { posts };
```

Never add undeclared frontmatter fields. Filter drafts in every collection query:

```ts
const posts = await getCollection('posts', p => !p.data.draft);
```

---

## MDX Component Rules

### Use `<Finding>` when documenting a vulnerability

Required props: `severity` (`critical | high | medium | low | info`), `title`.
Optional: `cve` (string), `cvss` (number).

```mdx
<Finding severity="high" title="SQLi in login endpoint" cve="CVE-2024-XXXX">
Unauthenticated attacker can dump the users table via `UNION`-based injection
on the `username` parameter.
</Finding>
```

### Use `<Terminal>` for shell session output

Preserves prompt context. Shiki handles code blocks inside posts; `<Terminal>`
is for multi-step interactive sessions where prompt/output distinction matters.

### Use plain Markdown for everything else

Regular prose, headers, lists, and inline code stay as standard Markdown.
Do not wrap generic text in custom components to add visual weight.

---

## Shiki Configuration (`astro.config.ts`)

```ts
import { defineConfig } from 'astro/config';

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',   // dark terminal-palette theme
      wrap: false,
    },
  },
});
```

Only use themes that suit a dark terminal palette: `one-dark-pro`, `tokyo-night`,
`dracula`, or a custom Shiki JSON theme. Never use `github-light` or `min-light`.

---

## Build / Dev Commands

```bash
# Development
pnpm dev

# Type-check
pnpm astro check

# Production build + Pagefind index
pnpm build && pnpx pagefind --site dist

# Preview production build locally
pnpm preview

# Strip EXIF from new images (run before git add)
bash scripts/strip-exif.sh public/images/
```

CI must run `astro check` and `pagefind` as part of the Cloudflare Pages build command.

---

## OPSEC Rules (Non-Negotiable)

1. **No client identifiers** — no company names, logos, or project codenames from
   paid engagements. All content must be CTF/lab-based or explicitly public CVE research.
2. **No internal hostnames** — scrub real FQDNs, IP ranges, and AD domain names.
   Use `target.htb`, `10.10.x.x`, or anonymised placeholders.
3. **No real names** — usernames, usernames in screenshots, and author metadata
   must not expose real identities beyond your public handle.
4. **EXIF must be stripped** before every commit containing images.
   `scripts/strip-exif.sh` uses `exiftool -all= -overwrite_original`.
   Add a pre-commit hook or CI check to enforce this.
5. **Screenshots** — blur or redact credentials, tokens, and session cookies
   before committing. Treat every screenshot as potentially public from day one.

---

## Aesthetic Direction

**Editorial-dark, terminal-palette accents, mono headlines.**

- Background: near-black (`#0d0d0d` or `#0f1117`), not pure `#000000`
- Accent: single terminal green (`#39ff14`) or amber (`#f5a623`) — pick one, use consistently
- Headlines: monospace font only (`JetBrains Mono`, `IBM Plex Mono`, `Geist Mono`)
- Body: a neutral sans with high legibility at small sizes (`Geist`, `Söhne`, `Departure Mono`)
- Prose line-length capped at `65ch` via Tailwind's `max-w-prose`
- No decorative gradients on text; reserve color for interactive states and severity badges

Define tokens in `global.css` `@theme` block:

```css
@import "tailwindcss";

@theme {
  --color-bg:      #0d0d0d;
  --color-surface: #161616;
  --color-accent:  #39ff14;
  --color-muted:   #6b7280;
  --font-mono:     'JetBrains Mono', monospace;
}
```

---

## Anti-Patterns — Never Do These

- **Generic SaaS card grids** — no feature-matrix layouts with emoji icons
- **Inter / Roboto / Space Grotesk** — these fonts signal generic AI output
- **AI-slop hero sections** — no full-viewport gradient blobs, particle canvases,
  or `"Empowering security professionals"` headline copy
- **Decorative motion** — no `framer-motion` scroll animations, floating elements,
  or entrance transitions; motion reserved for functional UI feedback only
- **Light mode as default** — this site is dark-first; a light mode toggle is optional
  but dark is the canonical design
- **Inline styles** — all styling through Tailwind utility classes or `@theme` tokens
- **`getStaticPaths` without type safety** — always type the return with
  `InferGetStaticPropsType` or `GetStaticPaths` from `astro`