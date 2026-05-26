// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://c0rvex.com',

build: {
    inlineStylesheets: 'never',  
  },

  integrations: [
    // Note: MDX component overrides (e.g. pre → CodeBlock) are passed at
    // render time via <Content components={{ pre: CodeBlock }} /> in each
    // page that uses MDX. @astrojs/mdx@5 does not support a global
    // components map in the integration config.
    mdx(),
    sitemap(),
  ],

  // Fonts are self-hosted via @font-face in src/styles/global.css.
  // No fonts[] / fontProviders needed.

  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});
