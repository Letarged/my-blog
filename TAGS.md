# Tag Taxonomy

Posts are tagged across two independent axes. Every post can carry multiple tags
from either axis, but at least one **domain tag** is required for `writeup` and
`finding` posts.

The full slug lists and metadata live in **`src/lib/tags.ts`** — edit that file to
add, rename, or retire tags. `src/content.config.ts` imports those slug arrays to
generate the Zod enums, so validation stays in sync automatically.

---

## Axis 1 — Domain (target area)

Describes *what* was targeted. Choose the technology or environment the finding
lives in, not the mechanism used to exploit it.

| Slug | Label | Reference | Description |
|---|---|---|---|
| `web` | Web Applications | [ATT&CK T1190](https://attack.mitre.org/techniques/T1190/) | HTTP services, browser-based targets, REST/GraphQL endpoints |
| `network` | Network Services | [ATT&CK T1046](https://attack.mitre.org/techniques/T1046/) | TCP/UDP services, protocol abuse, traffic interception |
| `active-directory` | Active Directory | [ATT&CK TA0006](https://attack.mitre.org/tactics/TA0006/) | Windows domain — Kerberos, LDAP, ACL, GPO attacks |
| `linux` | Linux Systems | [ATT&CK TA0004](https://attack.mitre.org/tactics/TA0004/) | Linux privesc, SUID/SGID, cron, kernel exploits |
| `windows` | Windows Systems | [ATT&CK TA0004](https://attack.mitre.org/tactics/TA0004/) | Windows internals — tokens, DLL hijacking, UAC bypass |
| `cloud` | Cloud Infrastructure | [ATT&CK TA0040](https://attack.mitre.org/tactics/TA0040/) | AWS/Azure/GCP IAM, IMDS, public storage |
| `mobile` | Mobile Applications | — | Android APK / iOS IPA analysis |
| `iot` | IoT / Embedded | — | Firmware, UART/JTAG, hardcoded credentials |
| `crypto` | Cryptography | [CWE-310](https://cwe.mitre.org/data/definitions/310.html) | Weak ciphers, TLS misconfig, padding oracles |
| `forensics` | Forensics & DFIR | [ATT&CK TA0043](https://attack.mitre.org/tactics/TA0043/) | Disk/memory analysis, log triage, incident response |
| `reversing` | Reverse Engineering | — | Disassembly, decompilation, binary patching |
| `osint` | OSINT | [ATT&CK TA0043](https://attack.mitre.org/tactics/TA0043/) | Passive recon, metadata, subdomain enumeration |
| `api` | API Security | [ATT&CK T1190](https://attack.mitre.org/techniques/T1190/) | REST/GraphQL/gRPC — BOLA, mass assignment, OAuth |
| `container` | Containers & K8s | [ATT&CK T1610](https://attack.mitre.org/techniques/T1610/) | Docker breakout, K8s RBAC, namespace escape |
| `database` | Databases | [CWE-200](https://cwe.mitre.org/data/definitions/200.html) | NoSQL injection, unauthenticated Redis/Elastic |

---

## Axis 2 — Technique (attack class)

Describes *how* the vulnerability is exploited. Use the most specific technique
slug that applies. Stack multiple technique tags if a finding chains methods.

| Slug | Label | CWE / Reference | Description |
|---|---|---|---|
| `sqli` | SQL Injection | [CWE-89](https://cwe.mitre.org/data/definitions/89.html) | Error-based, UNION, blind, time-based |
| `xss` | Cross-Site Scripting | [CWE-79](https://cwe.mitre.org/data/definitions/79.html) | Reflected, stored, DOM-based |
| `rce` | Remote Code Execution | [CWE-94](https://cwe.mitre.org/data/definitions/94.html) | CVE exploits, web shells, deserialization chains |
| `privesc` | Privilege Escalation | [CWE-269](https://cwe.mitre.org/data/definitions/269.html) | SUID, sudo, service misconfig, token impersonation |
| `lfi` | File Inclusion | [CWE-98](https://cwe.mitre.org/data/definitions/98.html) | LFI/RFI, log poisoning, RCE via LFI |
| `ssrf` | Server-Side Request Forgery | [CWE-918](https://cwe.mitre.org/data/definitions/918.html) | Internal service probe, IMDS abuse |
| `xxe` | XML External Entity | [CWE-611](https://cwe.mitre.org/data/definitions/611.html) | File read, SSRF, blind XXE |
| `ssti` | Template Injection | [CWE-1336](https://cwe.mitre.org/data/definitions/1336.html) | Jinja2, Twig, Freemarker, Pebble |
| `auth-bypass` | Authentication Bypass | [CWE-287](https://cwe.mitre.org/data/definitions/287.html) | JWT confusion, type juggling, default creds |
| `deserialization` | Insecure Deserialization | [CWE-502](https://cwe.mitre.org/data/definitions/502.html) | Java gadget chains, PHP object injection, pickle |
| `path-traversal` | Path Traversal | [CWE-22](https://cwe.mitre.org/data/definitions/22.html) | `../` sequences, URL encoding bypass, zip slip |
| `command-injection` | Command Injection | [CWE-77](https://cwe.mitre.org/data/definitions/77.html) | Shell metacharacter injection, argument injection |
| `buffer-overflow` | Buffer Overflow | [CWE-120](https://cwe.mitre.org/data/definitions/120.html) | Stack/heap overflows, ROP, binary exploitation |
| `brute-force` | Brute Force | [CWE-307](https://cwe.mitre.org/data/definitions/307.html) | Password spraying, credential stuffing |
| `lateral-movement` | Lateral Movement | [ATT&CK TA0008](https://attack.mitre.org/tactics/TA0008/) | PtH, PtT, WMI/RDP, SSH agent forwarding |

---

## Authoring Guidelines

### When to use which axis

- A **domain tag** answers: *"What system or technology was the target?"*
- A **technique tag** answers: *"What class of vulnerability or method was used?"*

A single post should almost always have at least one of each. Example: an HTB box
where you chain SQLi into a reverse shell on Linux → `domainTags: [linux, web]` +
`techniqueTags: [sqli, rce]`.

### Stacking rules

- Use **multiple domain tags** when the attack pivots across environments
  (e.g. web initial access → AD lateral movement → Linux privesc).
- Use **multiple technique tags** when findings are genuinely separate
  (e.g. SQLi in login + SSTI in admin panel). Don't tag every sub-step.
- Prefer specificity: `sqli` over nothing, but don't add `rce` just because
  SQLi could theoretically lead to it — add it only if you demonstrate RCE.

### Frontmatter examples

**HTB writeup — Linux box, SQLi to root:**
```yaml
category: writeup
difficulty: easy
box_status: retired
domainTags: [linux, web]
techniqueTags: [sqli, privesc]
```

**Engagement finding — SSRF in cloud environment:**
```yaml
category: finding
domainTags: [cloud, api]
techniqueTags: [ssrf]
```

**TIL note — Active Directory technique:**
```yaml
category: note
domainTags: [active-directory]
techniqueTags: [lateral-movement]
```

**Notes-only post with no specific technique (rare):**
```yaml
category: note
domainTags: [osint]
# techniqueTags: []  ← omit or leave empty; not required for notes
```

### Adding a new tag

1. Decide which axis it belongs to.
2. Add the slug to `DOMAIN_TAG_SLUGS` or `TECHNIQUE_TAG_SLUGS` in `src/lib/tags.ts`.
3. Add a corresponding entry to `TAG_META` (label, axis, description, optional ref).
4. Run `astro check` — the Zod enum updates automatically; any post using the new
   slug will now validate correctly.

### Retiring a tag

Remove the slug from the `_SLUGS` array and the `TAG_META` entry. Any post still
using that slug will fail `astro check` with a Zod validation error — a convenient
way to find and update affected posts before merging.
