---
name: publish-walkthrough
description: Use this skill when the user wants to publish a new post to the blog at src/content/posts/. Triggers on phrases like "publish writeup", "new post about X", "draft walkthrough", "new finding", "post-mortem writeup", "publish HTB writeup", or any request that produces a new .mdx file under src/content/posts/. Handles writeups (HTB/CTF), findings (engagement-derived, redaction-critical), and notes. Bakes in frontmatter schema, redaction checklist, EXIF stripping, Shiki fencing, and HTB Retired verification. Do NOT use for editing existing posts, fixing typos, or non-post content (about page, projects index).
---

# publish-walkthrough

Project-rooted skill for the blog. Posts live in `src/content/posts/*.mdx`, cover images in `public/images/{slug}/`. Astro + MDX + Shiki. Three categories: `writeup` (HTB/CTF/labs), `finding` (engagement-derived, redaction-critical), `note` (short technical).

## Execution order — do NOT skip steps

### 1. Convention scan (mandatory first step)

Before writing anything, read 1–2 existing posts to match house style:

```bash
ls -t src/content/posts/*.mdx | head -2
```

`view` both. Match: heading depth, code-fence language tags, callout components, image placement, prose voice, sentence length. If the user named a similar prior post (same category or topic), prefer that one as the primary reference.

Do not invent components. If a component is not in the existing posts, do not use it.

### 2. Frontmatter — write to `src/content/posts/{slug}.mdx`

Slug = kebab-case of the title, ASCII-only, no stop words at the start. `htb-shibboleth` not `the-htb-shibboleth-writeup`.

```yaml
---
title: string                              # required
date: YYYY-MM-DD                           # required, ISO, no time component
category: writeup | finding | note         # required, exactly one
tags: [array, of, strings]                 # required, lowercase, hyphenated
difficulty: easy | medium | hard | insane  # writeup ONLY — omit for finding/note
box_status: Retired                        # HTB writeups ONLY — must be verified, see §7
excerpt: string                            # required, ≤160 chars, no markdown, no trailing period
cover: /images/{slug}/cover.png            # required, must exist on disk before deploy
draft: true                                # required, default true — see §8
---
```

Rules:
- `excerpt` is hard-capped at 160 characters. Count it. If it overflows, rewrite — do not truncate mid-word.
- `tags` lowercase, hyphenated, 3–6 entries. No tag duplicates the category.
- `cover` path is absolute from `public/` (so `/images/{slug}/cover.png`, not `public/images/...`).
- Omit fields that don't apply. Do not write `difficulty: null` or `box_status: ""`.

### 3. REDACTION CHECKLIST — `finding` category ONLY

For `category: finding`, before writing the body, walk this checklist explicitly. If ANY item triggers, **abort writing and ask the user how to handle it**. Do not silently sanitize and proceed.

- [ ] Real client names anywhere in prose, code, screenshots, or filenames
- [ ] Real domains or IPs outside RFC1918 (10/8, 172.16/12, 192.168/16) — including in `curl` examples, HTTP headers, certificate CNs
- [ ] Internal hostnames matching `*.local`, `*.corp`, `*.lan`, `*.internal`, or other obvious internal TLDs
- [ ] Real employee names, usernames, or email addresses (including in stack traces and git blame)
- [ ] CVE disclosure timing specific enough to identify the client (e.g. "patched two days after our report on 2026-03-14")
- [ ] Stack traces containing internal filesystem paths (`/home/{realname}/...`, `C:\Users\{realname}\...`, internal package namespaces)
- [ ] Sector + region + tech stack combination small enough to re-identify in a small market (e.g. "Slovak energy provider running SAP IS-U on AIX" — that's one company)

For writeups/notes this checklist is advisory, not blocking. For findings it is blocking.

Replacement conventions when the user approves sanitization:
- Client → `Acme` or `$CLIENT`
- Real internal domain → `corp.example`
- IPs → RFC5737 (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) or RFC1918
- Employee names → role labels (`the SOC analyst`, `the sysadmin`)

### 4. EXIF stripping (cover + body images)

Every image under `public/images/{slug}/` must have metadata stripped before commit. Instruct the user to run, from project root:

```bash
exiftool -all= public/images/{slug}/*.png
exiftool -all= public/images/{slug}/*.jpg 2>/dev/null || true
```

Do not run this automatically — the skill ends with the instruction. The user owns the filesystem state. If `exiftool` is missing, point them at `apt install libimage-exiftool-perl` (Kali/Ubuntu host).

### 5. Code blocks — Shiki fencing

Every fenced block gets a language tag. No bare ` ``` `. Use:

- `bash` for shell sessions (prompt-stripped, runnable)
- `powershell` for PS (use `curl.exe`, not `curl`, per the PowerShell convention already established in your environment)
- `http` for raw requests/responses
- `python`, `c`, `rust`, `go`, `js`, `ts` for source
- `text` for ASCII output that has no real language (banners, ls output, tree)
- `diff` for patches

For terminal output mixed with input, prefer two separate blocks (input `bash`, output `text`) over one block with leading `$`.

### 6. Findings — `<Finding>` MDX component

`category: finding` posts use the `<Finding>` component for each individual finding inside the body. One component per distinct issue. Schema:

```mdx
<Finding
  severity="Critical | High | Medium | Low | Informational"
  cvss="9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)"
  vector="Network | Adjacent | Local | Physical"
  cwe="CWE-89"
>
  **Overview**

  Prose paragraph.

  **Impact**

  Prose paragraph.

  **Recommendations**

  Prose paragraph or short list.
</Finding>
```

Per your formatting preference: Overview/Impact/Recommendations use bold (no backticks), titles concise. CVSS value contains both score and full vector string. Include MITRE ATT&CK technique IDs and CWE references; for CWES-grade findings add a credible professional reference at the end of Recommendations.

### 7. HTB writeup gate — verify `box_status: Retired`

For any post tagged Hack The Box (slug prefix `htb-`, or HTB in title/tags), **box status must be Retired before publishing**. Active-box writeups violate HTB ToS.

Verification — do this before setting `draft: false`, not at draft time:

1. Search `hackthebox.com` for the box name.
2. Confirm the box is in the Retired Machines list, not the Active Machines list.
3. Only then write `box_status: Retired` in frontmatter.

If the box is still active, the post stays at `draft: true` with a comment in the file:

```mdx
{/* DO NOT PUBLISH — box still active as of YYYY-MM-DD. Re-check retirement before flipping draft. */}
```

CTF writeups (non-HTB) skip this gate but should still confirm the event has ended.

### 8. Draft default — `draft: true` always

Every new post is created with `draft: true`. The skill never sets `draft: false` on creation, even if the user says "publish it now". The user flips the flag manually after:

- Convention scan re-checked against rendered preview
- Redaction checklist (if finding) signed off
- EXIF stripped on all images
- HTB retirement verified (if applicable)
- `npm run build` succeeds locally

When responding after creating the file, end with a short checklist of what the user still needs to do before flipping `draft: false`. Do not flip it for them.

## File skeleton

```mdx
---
title: "..."
date: 2026-MM-DD
category: writeup
tags: [htb, linux, web]
difficulty: medium
box_status: Retired
excerpt: "..."
cover: /images/{slug}/cover.png
draft: true
---

import Finding from '@/components/Finding.astro'

Opening paragraph — what the box/finding/topic is, why it's interesting. No "In this post I will..." preamble.

## Recon

...
```

## Out of scope

- Editing existing posts (use normal file edits)
- Generating cover images (Mike handles separately)
- Pushing to git or deploying (manual step)
- Filling in `<Finding>` content from real engagement data without explicit user paste (Claude does not invent CVSS vectors)