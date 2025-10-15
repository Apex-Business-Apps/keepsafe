// Icon dimension validation script
// Run with: node scripts/check-icons.js

import { readFileSync, existsSync } from "fs";
import { createCanvas, loadImage } from "canvas";

const expected = {
  "public/icons/pwa-192x192.png": [192, 192],
  "public/icons/pwa-512x512.png": [512, 512],
  "public/icons/icon-maskable-192.png": [192, 192],
  "public/icons/icon-maskable-512.png": [512, 512],
  "public/icons/apple-touch-icon-180x180.png": [180, 180],
  "public/icons/favicon-32.png": [32, 32],
  "public/icons/favicon-16.png": [16, 16],
  "public/icons/icon-48.png": [48, 48],
  "public/icons/icon-72.png": [72, 72],
  "public/icons/icon-96.png": [96, 96],
  "public/icons/icon-128.png": [128, 128],
  "public/icons/icon-144.png": [144, 144],
  "public/icons/icon-152.png": [152, 152],
  "public/icons/icon-167.png": [167, 167],
  "public/icons/icon-180.png": [180, 180],
  "public/icons/icon-192.png": [192, 192],
  "public/icons/icon-256.png": [256, 256],
  "public/icons/icon-384.png": [384, 384],
  "public/icons/icon-512.png": [512, 512],
};

let errors = 0;

for (const [path, [w, h]] of Object.entries(expected)) {
  // Check if file exists
  if (!existsSync(path)) {
    console.error(`❌ Missing file: ${path}`);
    errors++;
    continue;
  }

  try {
    const buf = readFileSync(path);
    
    // Check file size (warn if over 300 KB)
    const sizeKB = buf.length / 1024;
    if (sizeKB > 300) {
      console.warn(`⚠️  Large file: ${path} (${sizeKB.toFixed(2)} KB)`);
    }

    const img = await loadImage(buf);
    
    // Check dimensions
    if (img.width !== w || img.height !== h) {
      console.error(
        `❌ Icon dimension mismatch: ${path} (${img.width}x${img.height}) != ${w}x${h}`
      );
      errors++;
    } else {
      console.log(`✅ ${path} - ${w}x${h}`);
    }
  } catch (err) {
    console.error(`❌ Error loading ${path}: ${err.message}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ ${errors} error(s) found`);
  process.exit(1);
} else {
  console.log("\n✅ Icon pack OK - All icons validated successfully!");
  process.exit(0);
}
