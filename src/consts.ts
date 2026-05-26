// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'c0rvex';
export const SITE_DESCRIPTION = 'HTB writeups, anonymised engagement findings, and TIL-style technical notes.';

// Giscus config — public identifiers, not secrets.
// Set these in wrangler.jsonc [vars] for Cloudflare Pages and in .env for local dev.
export const GISCUS_REPO         = import.meta.env.GISCUS_REPO         ?? '';
export const GISCUS_REPO_ID      = import.meta.env.GISCUS_REPO_ID      ?? '';
export const GISCUS_CATEGORY     = import.meta.env.GISCUS_CATEGORY     ?? 'Announcements';
export const GISCUS_CATEGORY_ID  = import.meta.env.GISCUS_CATEGORY_ID  ?? '';
