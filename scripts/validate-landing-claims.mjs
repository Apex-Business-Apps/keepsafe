import { readFile } from 'node:fs/promises';

const files = ['src/pages/Landing.tsx', 'README.md', 'src/utils/webVitals.ts'];
const banned = [/10,000\+/, /99\.9%/, /500\+\s*Happy/i, /Happy Families/i, /Items Protected/i, /INP ≤ 200ms/i, /INP < 200ms/i];
let failures = 0;
for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const pattern of banned) {
    if (pattern.test(text)) { console.error(`Unverified or misleading claim in ${file}: ${pattern}`); failures++; }
  }
}
if (failures) process.exit(1);
console.log('Landing/trust-claim validation passed.');
