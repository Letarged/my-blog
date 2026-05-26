# Post Authoring Cheatsheet

## Frontmatter

```yaml
---
title: "Lab: Machine Name"          # ≤90 chars; use "Lab:" prefix for HTB/CTF
date: 2026-01-15
category: writeup                   # writeup | finding | note
difficulty: easy                    # easy | medium | hard | insane (writeup only)
box_status: retired                 # active | retired | n/a (writeup only)
domainTags: [linux, web]            # ≥1 for writeup/finding — see TAGS.md
techniqueTags: [sqli, privesc]      # optional but recommended
excerpt: "One-sentence summary."    # ≤200 chars; shown in post cards
cover: /images/covers/name.png      # optional; strip EXIF before committing
draft: true                         # set false when ready to publish
---
```

## MDX Components

```mdx
<!-- Inline code block with filename label -->
```bash filename="enumerate.sh"
nmap -sV -sC -p- 10.10.x.x
```

<!-- Vulnerability finding card -->
<Finding severity="high" title="SQLi in login endpoint" cvss={8.1} cwe="CWE-89">
Description prose goes here.
</Finding>

<!-- Callout types: note | warning | danger | tip | opsec -->
<Callout type="opsec">
Replace all hostnames with target.htb before publishing.
</Callout>

<!-- Reveal-on-click spoiler -->
<Spoiler label="Foothold hint">
Check the Apache version banner.
</Spoiler>

<!-- Figure with optional caption -->
<Figure src="/images/covers/example.png" alt="Screenshot" caption="Login page" />
```

## OPSEC Rules

- No real client names, hostnames, or IP ranges
- Use `target.htb` and `10.10.x.x` as placeholders
- Run `bash scripts/strip-exif.mjs` before committing any images
- Blur credentials/tokens in screenshots
