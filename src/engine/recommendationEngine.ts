import { PlatformResult } from '../types';

export interface RecommendationSummary {
  cheapestId: string;
  fastestId: string;
  bestValueId: string;
  bestRewardsId: string;
  smartPickId: string;
}

export function computeRecommendations(results: PlatformResult[]): RecommendationSummary {
  if (results.length === 0) {
    return {
      cheapestId: '',
      fastestId: '',
      bestValueId: '',
      bestRewardsId: '',
      smartPickId: '',
    };
  }

  // 1. Cheapest (Lowest Final Price)
  const sortedByPrice = [...results].sort(
    (a, b) => a.priceBreakdown.finalPayablePrice - b.priceBreakdown.finalPayablePrice
  );
  const cheapestId = sortedByPrice[0].platformId;

  // 2. Fastest (Lowest delivery time)
  const sortedByTime = [...results].sort(
    (a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes
  );
  const fastestId = sortedByTime[0].platformId;

  // 3. Best Rewards (Highest cashback)
  const sortedByRewards = [...results].sort(
    (a, b) => b.priceBreakdown.cashback - a.priceBreakdown.cashback
  );
  const bestRewardsId = sortedByRewards[0].platformId;

  // 4. Best Value & Smart Pick
  const scoredResults = results.map((r) => {
    // Value score calculation formula
    const ratingBonus = r.rating * 30;
    const pricePenalty = r.priceBreakdown.finalPayablePrice * 0.4;
    const speedPenalty = r.deliveryTimeMinutes * 1.5;
    const cashbackBonus = r.priceBreakdown.cashback * 0.5;
    const valueScore = ratingBonus - pricePenalty - speedPenalty + cashbackBonus;

    return { ...r, valueScore };
  });

  scoredResults.sort((a, b) => b.valueScore - a.valueScore);

  const bestValueId = scoredResults[0].platformId;
  const smartPickId = scoredResults[0].platformId;

  return {
    cheapestId,
    fastestId,
    bestValueId,
    bestRewardsId,
    smartPickId,
  };
}
