import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/posts';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: APIContext): Promise<Response> {
	const posts = await getPublishedPosts();

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site!,
		items: posts.map((post) => ({
			title:       post.data.title,
			description: post.data.excerpt,
			pubDate:     post.data.date,
			link:        `/posts/${post.id}/`,
		})),
	});
}
