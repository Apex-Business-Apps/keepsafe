import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = async (name) => JSON.parse(await readFile(join(__dirname, 'fixtures', name), 'utf8'));
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'product', 'products', 'recall', 'recalls', 'due', 'hazard', 'risk']);
const normalizeText = (value = '') => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const tokenize = (value = '') => [...new Set(normalizeText(value).split(/\s+/).flatMap((token) => token.length > 3 && token.endsWith('s') ? [token, token.slice(0, -1)] : [token]).filter((token) => token.length >= 2 && !STOP_WORDS.has(token)))];
const cleanBarcode = (value = '') => { const digits = String(value).replace(/\D/g, ''); return digits.length >= 8 && digits.length <= 14 ? digits : null; };
const intersection = (left, right) => left.filter((token) => new Set(right).has(token));
function matchRecall(item, recall) {
  const matchedBrandTokens = intersection(tokenize(item.brand), tokenize(recall.brand || recall.title));
  const nameTokens = tokenize(item.name);
  const matchedModelTokens = [...new Set([...intersection(nameTokens, tokenize(recall.model)), ...intersection(nameTokens, tokenize(recall.title))])];
  const itemBarcode = cleanBarcode(item.barcode);
  const matchedBarcode = itemBarcode && (recall.affected_barcodes || []).map(cleanBarcode).includes(itemBarcode) ? itemBarcode : null;
  let score = 0; const reasons = [];
  if (matchedBarcode) { score += 80; reasons.push(`barcode ${matchedBarcode}`); }
  if (matchedBrandTokens.length) { score += Math.min(35, matchedBrandTokens.length * 18); reasons.push(`brand tokens: ${matchedBrandTokens.join(', ')}`); }
  if (matchedModelTokens.length) { score += Math.min(45, matchedModelTokens.length * 15); reasons.push(`product/model tokens: ${matchedModelTokens.join(', ')}`); }
  const matched = Boolean(matchedBarcode || (matchedBrandTokens.length && matchedModelTokens.length && score >= 50));
  return { matched, match_score: matched ? Math.min(score, 100) : 0, match_reason: matched ? reasons.join('; ') : 'No barcode match or brand+product token evidence' };
}

const items = await fixture('sample-items.json');
const recalls = await fixture('sample-recalls.json');
const expected = await fixture('expected-match-outcomes.json');
let failures = 0;
for (const outcome of expected) {
  const item = items.find((row) => row.id === outcome.item_id);
  const recall = recalls.find((row) => row.id === outcome.recall_id);
  const result = matchRecall(item, recall);
  if (result.matched !== outcome.matched) { console.error(`Mismatch ${outcome.item_id}/${outcome.recall_id}: expected matched=${outcome.matched}, got ${result.matched}`); failures++; continue; }
  if (outcome.matched && result.match_score < outcome.min_score) { console.error(`Low score ${outcome.item_id}/${outcome.recall_id}: ${result.match_score}`); failures++; }
  for (const fragment of outcome.reasonIncludes || []) {
    if (!result.match_reason.includes(fragment)) { console.error(`Missing reason fragment "${fragment}" for ${outcome.item_id}/${outcome.recall_id}: ${result.match_reason}`); failures++; }
  }
}
if (failures) process.exit(1);
console.log(`Recall matching validation passed (${expected.length} outcomes).`);
