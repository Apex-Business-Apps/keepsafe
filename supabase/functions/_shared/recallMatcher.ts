export interface RecallLike {
  id?: number;
  title?: string | null;
  brand?: string | null;
  model?: string | null;
  url?: string | null;
  source?: string | null;
  source_system?: string | null;
  source_url?: string | null;
  published_date?: string | null;
  normalized_brand_tokens?: string[] | null;
  normalized_model_tokens?: string[] | null;
  normalized_name_tokens?: string[] | null;
  affected_barcodes?: string[] | null;
}

export interface ItemLike {
  id?: string;
  name?: string | null;
  brand?: string | null;
  barcode?: string | null;
  serial_number?: string | null;
}

export interface MatchEvidence {
  matched: boolean;
  match_score: number;
  match_reason: string;
  matched_brand_tokens: string[];
  matched_model_tokens: string[];
  matched_barcode: string | null;
  source_system: string | null;
  source_url: string | null;
  published_date: string | null;
}

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'product', 'products', 'recall', 'recalls', 'due', 'hazard', 'risk']);

export function normalizeText(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(value?: string | null): string[] {
  const seen = new Set<string>();
  for (const token of normalizeText(value).split(/\s+/)) {
    if (token.length < 2 || STOP_WORDS.has(token)) continue;
    seen.add(token);
    if (token.length > 3 && token.endsWith('s')) seen.add(token.slice(0, -1));
  }
  return [...seen];
}

export function cleanBarcode(value?: string | null): string | null {
  const digits = (value || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 14 ? digits : null;
}

export function stableSourceId(sourceSystem: string, url: string, title: string): string {
  return `${sourceSystem}:${normalizeText(url || title).replace(/\s+/g, '-').slice(0, 180)}`;
}

export async function fingerprintRecord(parts: Array<string | null | undefined>): Promise<string> {
  const input = parts.map((part) => normalizeText(part)).join('|');
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function intersection(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((token) => rightSet.has(token));
}

export function matchRecall(item: ItemLike, recall: RecallLike): MatchEvidence {
  const itemBrandTokens = tokenize(item.brand);
  const itemNameTokens = tokenize(item.name);
  const recallBrandTokens = recall.normalized_brand_tokens?.length ? recall.normalized_brand_tokens : tokenize(recall.brand);
  const recallModelTokens = recall.normalized_model_tokens?.length ? recall.normalized_model_tokens : tokenize(recall.model);
  const recallNameTokens = recall.normalized_name_tokens?.length ? recall.normalized_name_tokens : tokenize(recall.title);
  const itemBarcode = cleanBarcode(item.barcode);
  const recallBarcodes = (recall.affected_barcodes || []).map(cleanBarcode).filter(Boolean) as string[];

  const matchedBrandTokens = intersection(itemBrandTokens, recallBrandTokens.length ? recallBrandTokens : recallNameTokens);
  const matchedModelTokens = [...new Set([
    ...intersection(itemNameTokens, recallModelTokens),
    ...intersection(itemNameTokens, recallNameTokens),
  ])];
  const matchedBarcode = itemBarcode && recallBarcodes.includes(itemBarcode) ? itemBarcode : null;

  let score = 0;
  const reasons: string[] = [];

  if (matchedBarcode) {
    score += 80;
    reasons.push(`barcode ${matchedBarcode}`);
  }
  if (matchedBrandTokens.length > 0) {
    score += Math.min(35, matchedBrandTokens.length * 18);
    reasons.push(`brand token${matchedBrandTokens.length > 1 ? 's' : ''}: ${matchedBrandTokens.join(', ')}`);
  }
  if (matchedModelTokens.length > 0) {
    score += Math.min(45, matchedModelTokens.length * 15);
    reasons.push(`product/model token${matchedModelTokens.length > 1 ? 's' : ''}: ${matchedModelTokens.join(', ')}`);
  }

  // Require either exact barcode or cross-field textual evidence to avoid brand-only false positives.
  const matched = Boolean(matchedBarcode || (matchedBrandTokens.length > 0 && matchedModelTokens.length > 0 && score >= 50));

  return {
    matched,
    match_score: matched ? Math.min(score, 100) : 0,
    match_reason: matched ? reasons.join('; ') : 'No barcode match or brand+product token evidence',
    matched_brand_tokens: matched ? matchedBrandTokens : [],
    matched_model_tokens: matched ? matchedModelTokens : [],
    matched_barcode: matchedBarcode,
    source_system: recall.source_system || recall.source || null,
    source_url: recall.source_url || recall.url || null,
    published_date: recall.published_date || null,
  };
}
