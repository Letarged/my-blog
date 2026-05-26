/**
 * Centralized MDX component registry.
 * Import from this file in any page that renders MDX content.
 *
 * Usage in [slug].astro:
 *   import { mdxComponents } from '../../components/mdx';
 *   <Content components={mdxComponents} />
 */

import CodeBlock from './mdx/CodeBlock.astro';
import Finding   from './mdx/Finding.astro';
import Callout   from './mdx/Callout.astro';
import Spoiler   from './mdx/Spoiler.astro';
import Figure    from './Figure.astro';

export const mdxComponents = {
	pre:     CodeBlock,
	Finding,
	Callout,
	Spoiler,
	Figure,
} as const;
