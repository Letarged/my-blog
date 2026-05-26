#!/usr/bin/env node
/**
 * scripts/strip-exif.mjs
 *
 * Recursively walks public/images/ and re-encodes jpg/jpeg/png/webp files
 * in-place using sharp. Sharp drops all EXIF/IPTC/XMP metadata during any
 * re-encode by default — no explicit withoutMetadata() call is required.
 *
 * Run as the first step of the build script so dist/ is always clean:
 *   node scripts/strip-exif.mjs && astro check && astro build
 *
 * Dependencies: sharp (already in package.json dependencies)
 */

import { readdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = new URL('../public/images', import.meta.url).pathname;
const SUPPORTED  = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * Recursively collect all image file paths under a directory.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function collectImages(dir) {
	let results = [];
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		// Directory doesn't exist yet — skip silently (normal before first image)
		console.warn(`[strip-exif] ${dir} not found — skipping.`);
		return results;
	}
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			results = results.concat(await collectImages(full));
		} else if (entry.isFile() && SUPPORTED.has(extname(entry.name).toLowerCase())) {
			results.push(full);
		}
	}
	return results;
}

/**
 * Re-encode a single image in-place, stripping all metadata.
 * @param {string} filePath
 */
async function stripExif(filePath) {
	const ext = extname(filePath).toLowerCase();
	const img = sharp(filePath);

	// Re-encode without calling .withMetadata() → EXIF is stripped automatically.
	// Write to a buffer first to avoid reading and writing the same fd simultaneously.
	let output;
	if (ext === '.png')       output = img.png({ compressionLevel: 8 });
	else if (ext === '.webp') output = img.webp({ quality: 85 });
	else                      output = img.jpeg({ quality: 88, progressive: true });

	const buf = await output.toBuffer();
	await writeFile(filePath, buf);
	console.log(`[strip-exif] stripped: ${filePath}`);
}

async function main() {
	const images = await collectImages(IMAGES_DIR);
	if (images.length === 0) {
		console.log('[strip-exif] No images found in public/images/ — nothing to do.');
		return;
	}
	console.log(`[strip-exif] Processing ${images.length} image(s)…`);
	for (const img of images) {
		await stripExif(img);
	}
	console.log('[strip-exif] Done.');
}

main().catch((err) => {
	console.error('[strip-exif] Fatal:', err);
	process.exit(1);
});
