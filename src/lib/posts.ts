import { getCollection, type CollectionEntry } from 'astro:content';
import type { TagSlug } from './tags';

export type Post         = CollectionEntry<'posts'>;
export type PostCategory = Post['data']['category'];

const isDev = import.meta.env.DEV;

/**
 * All non-draft posts sorted newest-first.
 * In dev mode, drafts are included so authors can preview them.
 */
export async function getPublishedPosts(): Promise<Post[]> {
	const all = await getCollection('posts', ({ data }) =>
		isDev ? true : !data.draft,
	);
	return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Published posts for a specific category, sorted newest-first.
 */
export async function getPublishedByCategory(cat: PostCategory): Promise<Post[]> {
	const all = await getCollection('posts', ({ data }) => {
		const notDraft = isDev ? true : !data.draft;
		return notDraft && data.category === cat;
	});
	return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Published posts that carry the given taxonomy tag (domain or technique),
 * sorted newest-first.
 */
export async function getPublishedByTaxonomyTag(slug: TagSlug): Promise<Post[]> {
	const all = await getCollection('posts', ({ data }) => {
		const notDraft = isDev ? true : !data.draft;
		const allTags  = [...data.domainTags, ...data.techniqueTags] as string[];
		return notDraft && allTags.includes(slug);
	});
	return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Post counts for every taxonomy tag that has at least one published post.
 * Returns a Map keyed by tag slug — tags with zero posts are absent.
 */
export async function getTagPostCounts(): Promise<Map<TagSlug, number>> {
	const all    = await getPublishedPosts();
	const counts = new Map<TagSlug, number>();
	for (const post of all) {
		for (const tag of [...post.data.domainTags, ...post.data.techniqueTags] as TagSlug[]) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return counts;
}

/** True when a post is a draft. Use in layouts to conditionally render [DRAFT] badge. */
export function isDraft(post: Post): boolean {
	return post.data.draft;
}

/**
 * Estimate reading time from raw post body text.
 * Assumes ~200 words per minute. Returns a formatted string e.g. "4 min read".
 */
export function estimateReadTime(body: string | undefined): string {
	if (!body) return '';
	const words   = body.trim().split(/\s+/).length;
	const minutes = Math.max(1, Math.ceil(words / 200));
	return `${minutes} min read`;
}
