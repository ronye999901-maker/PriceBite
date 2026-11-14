import { PlatformResult, PlatformId } from '../types';

/**
 * ==============================================================================
 * 📐 PRICEBITE MCDM RECOMMENDATION ENGINE (TOPSIS MATHEMATICAL FORMULATION)
 * ==============================================================================
 * Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS)
 * Eliminates arbitrary heuristics by projecting multi-criteria vectors into
 * dimensionless Euclidean space and calculating relative closeness C_i* to
 * the Positive Ideal Solution (A+) and Negative Ideal Solution (A-).
 * ==============================================================================
 */

export type DecisionPersona = 'balanced' | 'budget' | 'speed' | 'quality' | 'rewards';

export interface MCDMWeights {
  price: number; // Cost criterion (minimize)
  speed: number; // Cost criterion (minimize)
  rating: number; // Benefit criterion (maximize)
  cashback: number; // Benefit criterion (maximize)
}

export const DEFAULT_PERSONA_WEIGHTS: Record<DecisionPersona, MCDMWeights> = {
  balanced: { price: 0.35, speed: 0.25, rating: 0.25, cashback: 0.15 },
  budget: { price: 0.60, speed: 0.10, rating: 0.10, cashback: 0.20 },
  speed: { price: 0.15, speed: 0.60, rating: 0.15, cashback: 0.10 },
  quality: { price: 0.15, speed: 0.15, rating: 0.60, cashback: 0.10 },
  rewards: { price: 0.20, speed: 0.15, rating: 0.15, cashback: 0.50 },
};

export interface TOPSISPlatformEvaluation {
  platformId: PlatformId;
  platformName: string;
  finalPayablePrice: number;
  deliveryTimeMinutes: number;
  rating: number;
  cashback: number;
  normalizedPrice: number;
  normalizedSpeed: number;
  normalizedRating: number;
  normalizedCashback: number;
  distanceToIdealPositive: number;
  distanceToIdealNegative: number;
  closenessCoefficient: number; // C_i* in [0, 1]
  topsisScorePercent: number; // 0 to 100%
  rank: number;
}

export interface TOPSISResult {
  rankedEvaluations: TOPSISPlatformEvaluation[];
  smartPickId: PlatformId;
  cheapestId: PlatformId;
  fastestId: PlatformId;
  bestValueId: PlatformId;
  bestRewardsId: PlatformId;
  personaUsed: DecisionPersona;
  weightsUsed: MCDMWeights;
  positiveIdealVector: { price: number; speed: number; rating: number; cashback: number };
  negativeIdealVector: { price: number; speed: number; rating: number; cashback: number };
}

export interface RecommendationSummary {
  cheapestId: string;
  fastestId: string;
  bestValueId: string;
  bestRewardsId: string;
  smartPickId: string;
  topsisScore?: number;
}

/**
 * ==============================================================================
 * FULL MATHEMATICAL TOPSIS ENGINE IMPLEMENTATION
 * ==============================================================================
 */
export function runTOPSISAnalysis(
  results: PlatformResult[],
  persona: DecisionPersona = 'balanced',
  customWeights?: MCDMWeights
): TOPSISResult {
  if (results.length === 0) {
    return {
      rankedEvaluations: [],
      smartPickId: 'pricebite',
      cheapestId: 'pricebite',
      fastestId: 'pricebite',
      bestValueId: 'pricebite',
      bestRewardsId: 'pricebite',
      personaUsed: persona,
      weightsUsed: DEFAULT_PERSONA_WEIGHTS.balanced,
      positiveIdealVector: { price: 0, speed: 0, rating: 0, cashback: 0 },
      negativeIdealVector: { price: 0, speed: 0, rating: 0, cashback: 0 },
    };
  }

  // Determine criteria weights (Sum of weights normalized to 1.0)
  const baseWeights = customWeights || DEFAULT_PERSONA_WEIGHTS[persona];
  const weightSum = baseWeights.price + baseWeights.speed + baseWeights.rating + baseWeights.cashback;
  const weights: MCDMWeights = {
    price: baseWeights.price / weightSum,
    speed: baseWeights.speed / weightSum,
    rating: baseWeights.rating / weightSum,
    cashback: baseWeights.cashback / weightSum,
  };

  // STEP 1 & 2: Calculate Vector Normalization Denominators: sqrt(sum(x_ij^2))
  let sumSqPrice = 0;
  let sumSqSpeed = 0;
  let sumSqRating = 0;
  let sumSqCashback = 0;

  for (const r of results) {
    const price = Math.max(1, r.priceBreakdown.finalPayablePrice);
    const speed = Math.max(1, r.deliveryTimeMinutes);
    const rating = Math.max(0.1, r.rating);
    const cashback = Math.max(0, r.priceBreakdown.cashback);

    sumSqPrice += price * price;
    sumSqSpeed += speed * speed;
    sumSqRating += rating * rating;
    sumSqCashback += cashback * cashback;
  }

  const denomPrice = Math.sqrt(sumSqPrice) || 1;
  const denomSpeed = Math.sqrt(sumSqSpeed) || 1;
  const denomRating = Math.sqrt(sumSqRating) || 1;
  const denomCashback = Math.sqrt(sumSqCashback) || 1;

  // STEP 3: Compute Weighted Normalized Decision Matrix (v_ij = w_j * r_ij)
  const weightedMatrix = results.map((r) => {
    const rawPrice = Math.max(1, r.priceBreakdown.finalPayablePrice);
    const rawSpeed = Math.max(1, r.deliveryTimeMinutes);
    const rawRating = Math.max(0.1, r.rating);
    const rawCashback = Math.max(0, r.priceBreakdown.cashback);

    const r_price = rawPrice / denomPrice;
    const r_speed = rawSpeed / denomSpeed;
    const r_rating = rawRating / denomRating;
    const r_cashback = rawCashback / denomCashback;

    return {
      platformId: r.platformId,
      platformName: r.platformName,
      rawPrice,
      rawSpeed,
      rawRating,
      rawCashback,
      v_price: r_price * weights.price,
      v_speed: r_speed * weights.speed,
      v_rating: r_rating * weights.rating,
      v_cashback: r_cashback * weights.cashback,
    };
  });

  // STEP 4: Determine Positive Ideal Solution (A+) and Negative Ideal Solution (A-)
  // For cost criteria (price, speed): A+ is MIN, A- is MAX
  // For benefit criteria (rating, cashback): A+ is MAX, A- is MIN
  const vPrices = weightedMatrix.map((m) => m.v_price);
  const vSpeeds = weightedMatrix.map((m) => m.v_speed);
  const vRatings = weightedMatrix.map((m) => m.v_rating);
  const vCashbacks = weightedMatrix.map((m) => m.v_cashback);

  const idealPositive = {
    price: Math.min(...vPrices),
    speed: Math.min(...vSpeeds),
    rating: Math.max(...vRatings),
    cashback: Math.max(...vCashbacks),
  };

  const idealNegative = {
    price: Math.max(...vPrices),
    speed: Math.max(...vSpeeds),
    rating: Math.min(...vRatings),
    cashback: Math.min(...vCashbacks),
  };

  // STEP 5: Calculate Euclidean Distances to Positive (S_i+) and Negative (S_i-) Ideal Solutions
  const evaluations: TOPSISPlatformEvaluation[] = weightedMatrix.map((m) => {
    const dPos = Math.sqrt(
      Math.pow(m.v_price - idealPositive.price, 2) +
      Math.pow(m.v_speed - idealPositive.speed, 2) +
      Math.pow(m.v_rating - idealPositive.rating, 2) +
      Math.pow(m.v_cashback - idealPositive.cashback, 2)
    );

    const dNeg = Math.sqrt(
      Math.pow(m.v_price - idealNegative.price, 2) +
      Math.pow(m.v_speed - idealNegative.speed, 2) +
      Math.pow(m.v_rating - idealNegative.rating, 2) +
      Math.pow(m.v_cashback - idealNegative.cashback, 2)
    );

    // STEP 6: Relative Closeness to Ideal Solution C_i* = S_i- / (S_i+ + S_i-)
    const totalDist = dPos + dNeg;
    const closeness = totalDist > 0 ? dNeg / totalDist : 0.5;

    return {
      platformId: m.platformId,
      platformName: m.platformName,
      finalPayablePrice: m.rawPrice,
      deliveryTimeMinutes: m.rawSpeed,
      rating: m.rawRating,
      cashback: m.rawCashback,
      normalizedPrice: Math.round(m.v_price * 1000) / 1000,
      normalizedSpeed: Math.round(m.v_speed * 1000) / 1000,
      normalizedRating: Math.round(m.v_rating * 1000) / 1000,
      normalizedCashback: Math.round(m.v_cashback * 1000) / 1000,
      distanceToIdealPositive: Math.round(dPos * 1000) / 1000,
      distanceToIdealNegative: Math.round(dNeg * 1000) / 1000,
      closenessCoefficient: Math.round(closeness * 1000) / 1000,
      topsisScorePercent: Math.round(closeness * 100),
      rank: 1, // Will be set after sorting
    };
  });

  // STEP 7: Rank Alternatives by Descending Closeness Coefficient C_i*
  evaluations.sort((a, b) => b.closenessCoefficient - a.closenessCoefficient);
  evaluations.forEach((item, index) => {
    item.rank = index + 1;
  });

  // Identify category-specific winners
  const sortedByPrice = [...results].sort(
    (a, b) => a.priceBreakdown.finalPayablePrice - b.priceBreakdown.finalPayablePrice
  );
  const sortedByTime = [...results].sort(
    (a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes
  );
  const sortedByRewards = [...results].sort(
    (a, b) => b.priceBreakdown.cashback - a.priceBreakdown.cashback
  );

  return {
    rankedEvaluations: evaluations,
    smartPickId: evaluations[0].platformId,
    cheapestId: sortedByPrice[0].platformId,
    fastestId: sortedByTime[0].platformId,
    bestValueId: evaluations[0].platformId,
    bestRewardsId: sortedByRewards[0].platformId,
    personaUsed: persona,
    weightsUsed: weights,
    positiveIdealVector: idealPositive,
    negativeIdealVector: idealNegative,
  };
}

/**
 * Standard recommendation function for backwards-compatibility
 */
export function computeRecommendations(
  results: PlatformResult[],
  persona: DecisionPersona = 'balanced',
  customWeights?: MCDMWeights
): RecommendationSummary {
  const topsis = runTOPSISAnalysis(results, persona, customWeights);

  return {
    cheapestId: topsis.cheapestId,
    fastestId: topsis.fastestId,
    bestValueId: topsis.bestValueId,
    bestRewardsId: topsis.bestRewardsId,
    smartPickId: topsis.smartPickId,
    topsisScore: topsis.rankedEvaluations[0]?.topsisScorePercent || 90,
  };
}
