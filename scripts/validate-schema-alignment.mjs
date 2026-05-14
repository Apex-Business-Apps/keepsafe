import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const migrationsDir = 'supabase/migrations';
const types = await readFile('src/integrations/supabase/types.ts', 'utf8');
const functionFiles = await readdir('supabase/functions', { withFileTypes: true });
const functionText = (await Promise.all(functionFiles.filter((d) => d.isDirectory()).map(async (d) => {
  try { return await readFile(join('supabase/functions', d.name, 'index.ts'), 'utf8'); } catch { return ''; }
}))).join('\n');
const migrations = (await Promise.all((await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).map((f) => readFile(join(migrationsDir, f), 'utf8')))).join('\n');
const requiredTables = ['items', 'recalls', 'events', 'security_audit_log', 'user_roles', 'upc_cache', 'push_subscriptions', 'item_recall_matches', 'rate_limits'];
const missing = [];
for (const table of requiredTables) {
  if (!new RegExp(`(CREATE TABLE IF NOT EXISTS|CREATE TABLE)\\s+public\\.${table}`, 'i').test(migrations)) missing.push(`migration:${table}`);
  if (!types.includes(`${table}: {`)) missing.push(`types:${table}`);
}
for (const table of ['upc_cache', 'push_subscriptions']) {
  if (!functionText.includes(`from('${table}')`) && !functionText.includes(`from(\"${table}\")`)) missing.push(`function-usage:${table}`);
}
for (const fn of ['extract-receipt', 'lookup-upc', 'register-push', 'check-recalls', 'track-event']) {
  const config = await readFile('supabase/config.toml', 'utf8');
  if (!new RegExp(`\\[functions\\.${fn}\\]\\s+verify_jwt = true`, 'm').test(config)) missing.push(`verify_jwt:${fn}`);
}
if (!/\[functions\.health\]\s+verify_jwt = false/m.test(await readFile('supabase/config.toml', 'utf8'))) missing.push('verify_jwt:health-public');
if (missing.length) { console.error(`Schema alignment validation failed: ${missing.join(', ')}`); process.exit(1); }
console.log('Schema alignment validation passed.');
