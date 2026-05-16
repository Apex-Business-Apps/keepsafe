import { readFileSync } from 'node:fs';

const config = readFileSync('supabase/config.toml', 'utf8');
const cors = readFileSync('supabase/functions/_shared/cors.ts', 'utf8');
const migration = readFileSync('supabase/migrations/20260514120000_recall_intelligence_security_alignment.sql', 'utf8');

const mustBeJwtTrue = ['lookup-upc', 'extract-receipt', 'register-push', 'check-recalls', 'track-event'];
for (const fn of mustBeJwtTrue) {
  const block = `[functions.${fn}]`;
  if (!config.includes(`${block}\nverify_jwt = true`)) {
    throw new Error(`verify_jwt must be true for ${fn}`);
  }
}
if (!config.includes('[functions.health]\nverify_jwt = false')) {
  throw new Error('health must remain public (verify_jwt = false)');
}

const forbidden = ["'*'", 'https://keepsafe.lovable.app'];
for (const token of forbidden) {
  if (cors.includes(token)) {
    throw new Error(`Authenticated CORS defaults must not include ${token}`);
  }
}
for (const required of ['http://localhost:5173', 'http://localhost:8080', 'https://keepsafe.icu']) {
  if (!cors.includes(required)) {
    throw new Error(`Missing required allowed origin: ${required}`);
  }
}

const policyChecks = [
  'CREATE POLICY "Users can view own receipts"',
  'CREATE POLICY "Users can upload own receipts"',
  'CREATE POLICY "Users can update own receipts"',
  'CREATE POLICY "Users can delete own receipts"',
  "bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]",
];
for (const check of policyChecks) {
  if (!migration.includes(check)) {
    throw new Error(`Missing storage ownership policy check: ${check}`);
  }
}

console.log('Edge security validation passed.');
