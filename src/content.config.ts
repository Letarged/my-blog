import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { DOMAIN_TAG_SLUGS, TECHNIQUE_TAG_SLUGS } from './lib/tags';

// ─── Taxonomy Zod enums ───────────────────────────────────────────────────────
// Derived from the canonical slug arrays in lib/tags.ts so there is a single
// source of truth — add a new slug there, it automatically validates here.

export const domainTagEnum    = z.enum(DOMAIN_TAG_SLUGS);
export const techniqueTagEnum = z.enum(TECHNIQUE_TAG_SLUGS);

// ─── Posts collection schema ──────────────────────────────────────────────────
const postSchema = z
	.object({
		title:         z.string().min(1),
		date:          z.coerce.date(),
		category:      z.enum(['writeup', 'finding', 'note']),
		domainTags:    z.array(domainTagEnum).default([]),
		techniqueTags: z.array(techniqueTagEnum).default([]),
		difficulty:    z.enum(['easy', 'medium', 'hard', 'insane']).optional(),
		box_status:    z.enum(['active', 'retired', 'n/a']).optional(),
		excerpt:       z.string().max(200),
		cover:         z.string().nullable().optional(),
		draft:         z.boolean().default(false),
	})
	.superRefine((data, ctx) => {
		if (data.category === 'writeup') {
			if (!data.difficulty) {
				ctx.addIssue({
					code: 'custom',
					path: ['difficulty'],
					message: 'difficulty is required for writeup posts',
				});
			}
			if (!data.box_status) {
				ctx.addIssue({
					code: 'custom',
					path: ['box_status'],
					message: 'box_status is required for writeup posts',
				});
			}
		} else {
			if (data.difficulty !== undefined) {
				ctx.addIssue({
					code: 'custom',
					path: ['difficulty'],
					message: 'difficulty must not be set for non-writeup posts',
				});
			}
			if (data.box_status !== undefined) {
				ctx.addIssue({
					code: 'custom',
					path: ['box_status'],
					message: 'box_status must not be set for non-writeup posts',
				});
			}
		}

		// Writeups and findings should describe the target domain.
		if (
			(data.category === 'writeup' || data.category === 'finding') &&
			data.domainTags.length === 0
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['domainTags'],
				message: 'At least one domain tag is required for writeup and finding posts',
			});
		}
	});

export type PostFrontmatter = z.infer<typeof postSchema>;

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: postSchema,
});

export const collections = { posts };
