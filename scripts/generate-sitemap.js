#!/usr/bin/env node

/**
 * Sitemap Generator for KeepSafe
 * Run with: npm run build:sitemap
 * 
 * Generates sitemap.xml with core URLs and dynamic recall pages from Supabase
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOMAIN = 'https://keepsafe.icu';
const TODAY = new Date().toISOString().split('T')[0];

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aljdaazlgjcfwirqfjuc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsamRhYXpsZ2pjZndpcnFmanVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzQyNTgsImV4cCI6MjA3NDkxMDI1OH0.3unSDygHU4GybMIgGYuPOuJ4UzTNVf2TbsltIQ0hXhA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Core static routes
const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.8', changefreq: 'monthly' },
  { path: '/auth', priority: '0.5', changefreq: 'monthly' },
  { path: '/recalls', priority: '0.9', changefreq: 'daily' },
];

async function generateSitemap() {
  try {
    // Fetch recalls from Supabase
    const { data: recalls, error } = await supabase
      .from('recalls')
      .select('brand, model, published_date')
      .order('published_date', { ascending: false })
      .limit(50000); // Sitemap limit

    if (error) {
      console.error('Error fetching recalls:', error);
    }

    // Build brand index
    const brands = new Set();
    const recallUrls = [];

    if (recalls && recalls.length > 0) {
      recalls.forEach(recall => {
        brands.add(recall.brand);
        recallUrls.push({
          path: `/recalls/${recall.brand}/${recall.model}`,
          lastmod: recall.published_date || TODAY,
          priority: '0.7',
          changefreq: 'weekly'
        });
      });
    }

    // Add brand index pages
    const brandUrls = Array.from(brands).map(brand => ({
      path: `/recalls/${brand}`,
      lastmod: TODAY,
      priority: '0.8',
      changefreq: 'weekly'
    }));

    const allUrls = [...routes, ...brandUrls, ...recallUrls];

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(route => `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${route.lastmod || TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

    // Write to public/sitemap.xml
    const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
    writeFileSync(outputPath, sitemap, 'utf8');

    console.log('✓ Sitemap generated successfully at public/sitemap.xml');
    console.log(`✓ Core URLs: ${routes.length}`);
    console.log(`✓ Brand pages: ${brandUrls.length}`);
    console.log(`✓ Recall pages: ${recallUrls.length}`);
    console.log(`✓ Total URLs: ${allUrls.length}`);
    console.log(`✓ Last updated: ${TODAY}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
