#!/usr/bin/env node

/**
 * Sitemap Generator for KeepSafe
 * Run with: npm run build:sitemap
 * 
 * Generates sitemap.xml with core URLs and dynamic recall pages
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOMAIN = 'https://keepsafe.icu';
const TODAY = new Date().toISOString().split('T')[0];

// Core static routes
const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.8', changefreq: 'monthly' },
  { path: '/auth', priority: '0.5', changefreq: 'monthly' },
];

// Build sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

// Write to public/sitemap.xml
const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf8');

console.log('✓ Sitemap generated successfully at public/sitemap.xml');
console.log(`✓ Total URLs: ${routes.length}`);
console.log(`✓ Last updated: ${TODAY}`);
