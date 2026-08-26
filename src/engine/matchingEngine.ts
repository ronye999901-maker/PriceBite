import { MatchType } from '../types';

export interface MatchingResult {
  matchType: MatchType;
  matchScore: number;
  matchNotes: string;
}

export function evaluateProductMatch(
  query: string,
  targetName: string,
  targetBrandOrRestaurant: string,
  targetQuantity?: string,
  category?: string,
  description?: string
): MatchingResult {
  const q = query.toLowerCase().trim();
  if (!q) {
    return {
      matchType: 'EXACT',
      matchScore: 100,
      matchNotes: '✅ Exact Match: All products displayed.',
    };
  }

  const tName = targetName.toLowerCase().trim();
  const tBrand = targetBrandOrRestaurant.toLowerCase().trim();
  const tCat = (category || '').toLowerCase().trim();
  const tDesc = (description || '').toLowerCase().trim();

  // Full text haystack
  const haystack = `${tName} ${tBrand} ${tCat} ${tDesc}`;

  // Check query tokens
  const queryTokens = q.split(/\s+/).filter(Boolean);
  const matchedTokens = queryTokens.filter((token) => haystack.includes(token));

  // Strict Exclusion: If NONE of the user query words are in the product title, brand, category or description, it's NOT a match at all!
  if (matchedTokens.length === 0) {
    return {
      matchType: 'DIFFERENT',
      matchScore: 0,
      matchNotes: '❌ Unrelated Item: Query terms do not match this product.',
    };
  }

  // Exact Match Check
  if (tName.includes(q) || q.includes(tName)) {
    return {
      matchType: 'EXACT',
      matchScore: 98,
      matchNotes: '✅ Exact Match: Identical item name and specifications matched across platforms.',
    };
  }

  // Portion / Variant Check
  const portionKeywords = ['full', 'half', 'small', 'medium', 'large', 'family', 'combo', '500g', '1kg', 'pc', 'pcs', 'bowl'];
  const hasVariantWord = portionKeywords.some((w) => tName.includes(w) || (targetQuantity && targetQuantity.toLowerCase().includes(w)));

  if (matchedTokens.length >= Math.ceil(queryTokens.length / 2)) {
    if (hasVariantWord) {
      return {
        matchType: 'VARIANT',
        matchScore: 88,
        matchNotes: '⚡ Variant Match: Same dish recipe, portion size or combo pack variant.',
      };
    }

    return {
      matchType: 'SIMILAR',
      matchScore: 75,
      matchNotes: '⚠️ Similar Product: Relevant search match from equivalent brand/restaurant.',
    };
  }

  return {
    matchType: 'DIFFERENT',
    matchScore: 0,
    matchNotes: '❌ Unrelated Item: Search terms failed similarity threshold.',
  };
}
