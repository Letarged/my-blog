// ─── Two-axis tag taxonomy ────────────────────────────────────────────────────
// Domain tags describe the *target area* (web, AD, cloud, …).
// Technique tags describe the *attack class* (sqli, rce, privesc, …).
//
// This file is the single source of truth. Import DOMAIN_TAG_SLUGS and
// TECHNIQUE_TAG_SLUGS into content.config.ts to derive Zod enums, and
// import TAG_META into pages for label/description/ref rendering.

export type TagAxis = 'domain' | 'technique';

export interface TagMeta {
	label:       string;
	axis:        TagAxis;
	description: string;
	/** Optional MITRE ATT&CK or CWE link shown on the tag detail page. */
	ref?:        { label: string; url: string };
}

// ─── Domain slugs (max 15) ───────────────────────────────────────────────────

export const DOMAIN_TAG_SLUGS = [
	'web',
	'network',
	'active-directory',
	'linux',
	'windows',
	'cloud',
	'mobile',
	'iot',
	'crypto',
	'forensics',
	'reversing',
	'osint',
	'api',
	'container',
	'database',
] as const;

export type DomainTagSlug = (typeof DOMAIN_TAG_SLUGS)[number];

// ─── Technique slugs (max 15) ────────────────────────────────────────────────

export const TECHNIQUE_TAG_SLUGS = [
	'sqli',
	'xss',
	'rce',
	'privesc',
	'lfi',
	'ssrf',
	'xxe',
	'ssti',
	'auth-bypass',
	'deserialization',
	'path-traversal',
	'command-injection',
	'buffer-overflow',
	'brute-force',
	'lateral-movement',
] as const;

export type TechniqueTagSlug = (typeof TECHNIQUE_TAG_SLUGS)[number];

export type TagSlug = DomainTagSlug | TechniqueTagSlug;

// ─── Full metadata record ─────────────────────────────────────────────────────

export const TAG_META: Record<TagSlug, TagMeta> = {

	// ── Domain ────────────────────────────────────────────────────────────────

	'web': {
		label:       'Web Applications',
		axis:        'domain',
		description: 'HTTP services, browser-based targets, REST/GraphQL endpoints, and web-layer attacks against server-side logic.',
		ref: { label: 'ATT&CK T1190', url: 'https://attack.mitre.org/techniques/T1190/' },
	},
	'network': {
		label:       'Network Services',
		axis:        'domain',
		description: 'TCP/UDP service exploitation, protocol abuse, traffic interception, and network-level pivoting between segments.',
		ref: { label: 'ATT&CK T1046', url: 'https://attack.mitre.org/techniques/T1046/' },
	},
	'active-directory': {
		label:       'Active Directory',
		axis:        'domain',
		description: 'Windows domain attacks — Kerberoasting, AS-REP roasting, ACL abuse, GPO misconfiguration, and intra-domain lateral movement.',
		ref: { label: 'ATT&CK TA0006', url: 'https://attack.mitre.org/tactics/TA0006/' },
	},
	'linux': {
		label:       'Linux Systems',
		axis:        'domain',
		description: 'Linux privilege escalation, kernel exploits, SUID/SGID abuse, cron job misconfiguration, and weak service permissions.',
		ref: { label: 'ATT&CK TA0004', url: 'https://attack.mitre.org/tactics/TA0004/' },
	},
	'windows': {
		label:       'Windows Systems',
		axis:        'domain',
		description: 'Windows internals exploitation — token impersonation, registry abuse, DLL hijacking, UAC bypass, and named pipe attacks.',
		ref: { label: 'ATT&CK TA0004', url: 'https://attack.mitre.org/tactics/TA0004/' },
	},
	'cloud': {
		label:       'Cloud Infrastructure',
		axis:        'domain',
		description: 'AWS, Azure, and GCP misconfigurations — IAM privilege escalation, instance metadata service abuse, and public storage exposure.',
		ref: { label: 'ATT&CK TA0040', url: 'https://attack.mitre.org/tactics/TA0040/' },
	},
	'mobile': {
		label:       'Mobile Applications',
		axis:        'domain',
		description: 'Android APK and iOS IPA analysis — insecure data storage, traffic interception, exported components, and runtime manipulation.',
	},
	'iot': {
		label:       'IoT / Embedded',
		axis:        'domain',
		description: 'Firmware extraction and analysis, UART/JTAG interfaces, hardcoded credentials, and embedded system attack surfaces.',
	},
	'crypto': {
		label:       'Cryptography',
		axis:        'domain',
		description: 'Weak cipher analysis, PKI vulnerabilities, TLS misconfiguration, padding oracle attacks, and key management failures.',
		ref: { label: 'CWE-310', url: 'https://cwe.mitre.org/data/definitions/310.html' },
	},
	'forensics': {
		label:       'Forensics & DFIR',
		axis:        'domain',
		description: 'Disk image and memory analysis, log triage, malware artefact identification, and incident response procedures.',
		ref: { label: 'ATT&CK TA0043', url: 'https://attack.mitre.org/tactics/TA0043/' },
	},
	'reversing': {
		label:       'Reverse Engineering',
		axis:        'domain',
		description: 'Binary disassembly, decompilation, anti-debug bypass, executable patching, and static/dynamic analysis workflows.',
	},
	'osint': {
		label:       'OSINT',
		axis:        'domain',
		description: 'Open-source reconnaissance — subdomain enumeration, metadata extraction, social footprinting, and passive recon techniques.',
		ref: { label: 'ATT&CK TA0043', url: 'https://attack.mitre.org/tactics/TA0043/' },
	},
	'api': {
		label:       'API Security',
		axis:        'domain',
		description: 'REST, GraphQL, and gRPC vulnerabilities — broken object-level authorisation, mass assignment, OAuth flaws, and API enumeration.',
		ref: { label: 'ATT&CK T1190', url: 'https://attack.mitre.org/techniques/T1190/' },
	},
	'container': {
		label:       'Containers & K8s',
		axis:        'domain',
		description: 'Docker breakout, Kubernetes RBAC abuse, privileged container escape, service account token theft, and namespace traversal.',
		ref: { label: 'ATT&CK T1610', url: 'https://attack.mitre.org/techniques/T1610/' },
	},
	'database': {
		label:       'Databases',
		axis:        'domain',
		description: 'Direct database exposure, NoSQL injection, Redis/ElasticSearch unauthenticated access, and credential-free data exfiltration.',
		ref: { label: 'CWE-200', url: 'https://cwe.mitre.org/data/definitions/200.html' },
	},

	// ── Technique ─────────────────────────────────────────────────────────────

	'sqli': {
		label:       'SQL Injection',
		axis:        'technique',
		description: 'Manipulating SQL queries via unsanitised input — error-based, UNION-based, blind boolean, and time-based variants.',
		ref: { label: 'CWE-89', url: 'https://cwe.mitre.org/data/definitions/89.html' },
	},
	'xss': {
		label:       'Cross-Site Scripting',
		axis:        'technique',
		description: 'Injecting client-side scripts — reflected, stored, and DOM-based XSS chains leading to session hijacking or credential phishing.',
		ref: { label: 'CWE-79', url: 'https://cwe.mitre.org/data/definitions/79.html' },
	},
	'rce': {
		label:       'Remote Code Execution',
		axis:        'technique',
		description: 'Achieving arbitrary code execution on a remote target via CVE exploits, web shells, or deserialization gadget chains.',
		ref: { label: 'CWE-94', url: 'https://cwe.mitre.org/data/definitions/94.html' },
	},
	'privesc': {
		label:       'Privilege Escalation',
		axis:        'technique',
		description: 'Elevating from low-privileged access to root or SYSTEM — SUID binaries, sudo rules, weak service configs, token impersonation.',
		ref: { label: 'CWE-269', url: 'https://cwe.mitre.org/data/definitions/269.html' },
	},
	'lfi': {
		label:       'File Inclusion',
		axis:        'technique',
		description: 'Local and remote file inclusion flaws — reading arbitrary files, log poisoning, and RCE escalation via LFI chains.',
		ref: { label: 'CWE-98', url: 'https://cwe.mitre.org/data/definitions/98.html' },
	},
	'ssrf': {
		label:       'Server-Side Request Forgery',
		axis:        'technique',
		description: 'Forcing a server to issue requests to internal resources — cloud metadata services, internal APIs, and out-of-band exfiltration.',
		ref: { label: 'CWE-918', url: 'https://cwe.mitre.org/data/definitions/918.html' },
	},
	'xxe': {
		label:       'XML External Entity',
		axis:        'technique',
		description: 'Exploiting XML parsers to read local files, probe internal hosts, or trigger SSRF via external entity references.',
		ref: { label: 'CWE-611', url: 'https://cwe.mitre.org/data/definitions/611.html' },
	},
	'ssti': {
		label:       'Template Injection',
		axis:        'technique',
		description: 'Server-side template injection — Jinja2, Twig, Freemarker, and Pebble engines evaluated with attacker-controlled input.',
		ref: { label: 'CWE-1336', url: 'https://cwe.mitre.org/data/definitions/1336.html' },
	},
	'auth-bypass': {
		label:       'Authentication Bypass',
		axis:        'technique',
		description: 'Circumventing login and session controls — JWT algorithm confusion, type juggling, default credentials, and logic flaws.',
		ref: { label: 'CWE-287', url: 'https://cwe.mitre.org/data/definitions/287.html' },
	},
	'deserialization': {
		label:       'Insecure Deserialization',
		axis:        'technique',
		description: 'Exploiting deserialisation of untrusted data — Java gadget chains, PHP object injection, Python pickle and YAML exploits.',
		ref: { label: 'CWE-502', url: 'https://cwe.mitre.org/data/definitions/502.html' },
	},
	'path-traversal': {
		label:       'Path Traversal',
		axis:        'technique',
		description: 'Reading or writing files outside the intended directory via `../` sequences, URL encoding bypasses, and zip-slip variants.',
		ref: { label: 'CWE-22', url: 'https://cwe.mitre.org/data/definitions/22.html' },
	},
	'command-injection': {
		label:       'Command Injection',
		axis:        'technique',
		description: 'Injecting OS commands through unsanitised input — shell metacharacter injection, argument injection, and blind variants.',
		ref: { label: 'CWE-77', url: 'https://cwe.mitre.org/data/definitions/77.html' },
	},
	'buffer-overflow': {
		label:       'Buffer Overflow',
		axis:        'technique',
		description: 'Memory corruption via buffer overflows — stack and heap overflows, return-oriented programming, and binary exploit development.',
		ref: { label: 'CWE-120', url: 'https://cwe.mitre.org/data/definitions/120.html' },
	},
	'brute-force': {
		label:       'Brute Force',
		axis:        'technique',
		description: 'Credential stuffing, password spraying, rate-limit bypass, and dictionary attacks against authentication endpoints.',
		ref: { label: 'CWE-307', url: 'https://cwe.mitre.org/data/definitions/307.html' },
	},
	'lateral-movement': {
		label:       'Lateral Movement',
		axis:        'technique',
		description: 'Moving through a network from an initial foothold — pass-the-hash, pass-the-ticket, WMI/RDP abuse, and SSH agent forwarding.',
		ref: { label: 'ATT&CK TA0008', url: 'https://attack.mitre.org/tactics/TA0008/' },
	},
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * All tags for a given axis, sorted alphabetically by label.
 */
export function getTagsByAxis(axis: TagAxis): Array<[TagSlug, TagMeta]> {
	return (Object.entries(TAG_META) as Array<[TagSlug, TagMeta]>)
		.filter(([, meta]) => meta.axis === axis)
		.sort(([, a], [, b]) => a.label.localeCompare(b.label));
}
