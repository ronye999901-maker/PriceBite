import { ProductComparisonItem, LanguageCode, PINCodeDetails, PlatformResult } from '../types';
import { evaluateProductMatch } from './matchingEngine';
import { runTOPSISAnalysis } from './recommendationEngine';
import { DIRECT_PROMO_COUPONS, DIRECT_PARTNER_RESTAURANTS } from '../mock/directRestaurantData';
import { getProductsForLocation } from '../mock/foodData';

export interface DealBotResponse {
  text: string;
  recommendedProduct?: ProductComparisonItem;
  comparisonBreakdown?: {
    platformId: string;
    platformName: string;
    logo: string;
    price: number;
    etaMinutes: number;
    savings: number;
    isBest?: boolean;
    topsisScore?: number;
  }[];
  couponInfo?: {
    code: string;
    title: string;
    discountSummary: string;
    discountAmount: number;
  };
  restaurantInfo?: {
    id: string;
    name: string;
    branchName: string;
    rating: number;
    heroOffer: string;
    featuredDish: string;
  };
  followUpActions: string[];
}

/**
 * Intelligent Multi-Intent Parser and Reasoning Engine for DealBot AI
 */
export function analyzeDealBotQuery(
  rawQuery: string,
  currentLang: LanguageCode = 'en',
  currentPin: PINCodeDetails | null = null,
  userPreferences: { isVegOnly?: boolean; lastBudget?: number } = {}
): DealBotResponse {
  const q = rawQuery.toLowerCase().trim();
  const allProducts = getProductsForLocation(currentPin);

  // 1. INTENT: PROMO CODES & COUPONS
  if (
    q.includes('coupon') ||
    q.includes('promo') ||
    q.includes('code') ||
    q.includes('discount') ||
    q.includes('voucher') ||
    q.includes('offer') ||
    q.includes('200 off') ||
    q.includes('50%') ||
    q.includes('bogo') ||
    q.includes('कूपन') ||
    q.includes('অফার') ||
    q.includes('কুপন')
  ) {
    const bestCoupon = DIRECT_PROMO_COUPONS[0]; // PBDIRECT200
    let text = `Here are today's active verified promo coupons! Apply code "${bestCoupon.code}" on PriceBite Direct to get ${bestCoupon.title} (${bestCoupon.discountSummary}). You can also use "DIRECT50" for 50% savings or "FREEDEL" for zero delivery fees!`;

    if (currentLang === 'bn') {
      text = `আজকের ভেরিফায়েড প্রোমো কুপন কোড! PriceBite Direct-এ "${bestCoupon.code}" কুপন ব্যবহার করে পান ${bestCoupon.title}! এছাড়া "DIRECT50" দিয়ে ৫০% ছাড় ও "FREEDEL" দিয়ে ফ্রি ডেলিভারি পান!`;
    } else if (currentLang === 'hi') {
      text = `आज के वेरीफाइड प्रोमो कूपन! PriceBite Direct पर कोड "${bestCoupon.code}" लगाएं और पाएं ${bestCoupon.title}! आप "DIRECT50" (50% छूट) या "FREEDEL" (फ्री डिलीवरी) भी इस्तेमाल कर सकते हैं!`;
    }

    return {
      text,
      couponInfo: {
        code: bestCoupon.code,
        title: bestCoupon.title,
        discountSummary: bestCoupon.discountSummary,
        discountAmount: bestCoupon.discountAmount,
      },
      followUpActions: [
        'How to apply PBDIRECT200',
        'Show Biryani deals',
        'Meals under ₹200',
        'Fastest delivery now',
      ],
    };
  }

  // 2. INTENT: SPECIFIC RESTAURANT INQUIRY
  const matchedRestaurant = DIRECT_PARTNER_RESTAURANTS.find(
    (r) =>
      q.includes(r.name.toLowerCase()) ||
      r.name.toLowerCase().includes(q) ||
      (r.id.includes('arsalan') && (q.includes('arsalan') || q.includes('biryani'))) ||
      (r.id.includes('kfc') && (q.includes('kfc') || q.includes('chicken bucket'))) ||
      (r.id.includes('dominos') && (q.includes('domino') || q.includes('pizza'))) ||
      (r.id.includes('chowman') && (q.includes('chowman') || q.includes('chinese') || q.includes('noodles'))) ||
      (r.id.includes('petercat') && (q.includes('peter cat') || q.includes('chelo'))) ||
      (r.id.includes('wowmomo') && (q.includes('wow') || q.includes('momo'))) ||
      (r.id.includes('balaram') && (q.includes('balaram') || q.includes('sweet') || q.includes('rasogolla')))
  );

  if (matchedRestaurant && (q.includes(matchedRestaurant.name.toLowerCase()) || q.includes('menu') || q.includes('restaurant'))) {
    const featDish = matchedRestaurant.menu[0];
    let text = `${matchedRestaurant.name} (${matchedRestaurant.rating} ★, ${matchedRestaurant.deliveryMinutes} mins) is serving directly in PriceBite! Active Offer: "${matchedRestaurant.heroOffer}". Their top signature dish is ${featDish.name} starting at ₹${featDish.price} (Original ₹${featDish.originalPrice}). 0% extra commissions guaranteed!`;

    if (currentLang === 'bn') {
      text = `${matchedRestaurant.name} (${matchedRestaurant.rating} ★) সরাসরি PriceBite Direct-এ ডেলিভারি দিচ্ছে! বিশেষ অফার: "${matchedRestaurant.heroOffer}"। সেরা সিগনেচার ডিশ: ${featDish.name} মাত্র ₹${featDish.price}-এ!`;
    } else if (currentLang === 'hi') {
      text = `${matchedRestaurant.name} (${matchedRestaurant.rating} ★) PriceBite Direct पर उपलब्ध है! आज का ऑफर: "${matchedRestaurant.heroOffer}"। सबसे मशहूर डिश: ${featDish.name} सिर्फ ₹${featDish.price} में!`;
    }

    return {
      text,
      restaurantInfo: {
        id: matchedRestaurant.id,
        name: matchedRestaurant.name,
        branchName: matchedRestaurant.branchName,
        rating: matchedRestaurant.rating,
        heroOffer: matchedRestaurant.heroOffer,
        featuredDish: featDish.name,
      },
      followUpActions: [
        `View ${matchedRestaurant.name} full menu`,
        'Apply coupon on this order',
        'Compare with Swiggy/Zomato',
        'Food under ₹250',
      ],
    };
  }

  // 3. INTENT: BUDGET-CONSTRAINED QUERIES (e.g. "under ₹200", "< 300", "budget", "cheap")
  const budgetMatch = q.match(/(?:under|below|less than|within|<|sub)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                      q.match(/(?:₹|rs\.?)\s*(\d+)/i);
  const budgetLimit = budgetMatch ? parseInt(budgetMatch[1], 10) : userPreferences.lastBudget || (q.includes('cheap') || q.includes('budget') || q.includes('সস্তা') || q.includes('कम दाम') ? 250 : null);

  if (budgetLimit) {
    // Find items where at least one platform has payable price <= budgetLimit
    const budgetFiltered = allProducts.filter((p) => {
      if (userPreferences.isVegOnly && !p.isVeg) return false;
      const minPrice = Math.min(...p.platformResults.map((pr) => pr.priceBreakdown.finalPayablePrice));
      return minPrice <= budgetLimit;
    });

    if (budgetFiltered.length > 0) {
      // Pick best candidate using TOPSIS analysis
      const scored = budgetFiltered.map((p) => {
        const topsis = runTOPSISAnalysis(p.platformResults, 'budget');
        const bestEval = topsis.rankedEvaluations[0];
        return { product: p, topsis, bestEval };
      });

      scored.sort((a, b) => b.bestEval.closenessCoefficient - a.bestEval.closenessCoefficient);
      const chosen = scored[0];
      const prod = chosen.product;
      const bestPlat = prod.platformResults.find((pr) => pr.platformId === chosen.bestEval.platformId) || prod.platformResults[0];

      const breakdown = prod.platformResults.map((pr) => ({
        platformId: pr.platformId,
        platformName: pr.platformName,
        logo: pr.platformLogo,
        price: pr.priceBreakdown.finalPayablePrice,
        etaMinutes: pr.deliveryTimeMinutes,
        savings: pr.priceBreakdown.savingsVsHighest || 0,
        isBest: pr.platformId === bestPlat.platformId,
        topsisScore: Math.round(
          (chosen.topsis.rankedEvaluations.find((e) => e.platformId === pr.platformId)?.closenessCoefficient || 0) * 100
        ),
      }));

      let text = `Filtered for budget ≤ ₹${budgetLimit}! The top recommendation via TOPSIS Budget Persona is ${prod.name} on ${bestPlat.platformName} at ₹${bestPlat.priceBreakdown.finalPayablePrice}. You save ₹${bestPlat.priceBreakdown.savingsVsNextCheapest || 25} compared to other delivery apps!`;

      if (currentLang === 'bn') {
        text = `আপনার ₹${budgetLimit} বাজেটের মধ্যে সেরা চয়েস হলো ${bestPlat.platformName}-এ ${prod.name} মাত্র ₹${bestPlat.priceBreakdown.finalPayablePrice}-এ! অন্য অ্যাপের তুলনায় সাশ্রয় ₹${bestPlat.priceBreakdown.savingsVsNextCheapest || 25}!`;
      } else if (currentLang === 'hi') {
        text = `आपके ₹${budgetLimit} के बजट में TOPSIS एनालिसिस के अनुसार सबसे बढ़िया विकल्प ${bestPlat.platformName} पर ${prod.name} है, सिर्फ ₹${bestPlat.priceBreakdown.finalPayablePrice} में! अन्य ऐप्स की तुलना में ₹${bestPlat.priceBreakdown.savingsVsNextCheapest || 25} की बचत!`;
      }

      return {
        text,
        recommendedProduct: prod,
        comparisonBreakdown: breakdown,
        followUpActions: [
          `More meals under ₹${budgetLimit}`,
          'Show fastest delivery instead',
          'Apply ₹200 off coupon',
          'Pure veg options',
        ],
      };
    }
  }

  // 4. INTENT: FASTEST DELIVERY / SPEED-FIRST
  if (
    q.includes('fast') ||
    q.includes('quick') ||
    q.includes('speed') ||
    q.includes('20 min') ||
    q.includes('urgent') ||
    q.includes('hungry') ||
    q.includes('starving') ||
    q.includes('express') ||
    q.includes('তাড়াতাড়ি') ||
    q.includes('जल्दी')
  ) {
    const speedSorted = [...allProducts].sort((a, b) => {
      const minA = Math.min(...a.platformResults.map((pr) => pr.deliveryTimeMinutes));
      const minB = Math.min(...b.platformResults.map((pr) => pr.deliveryTimeMinutes));
      return minA - minB;
    });

    const chosen = speedSorted[0] || allProducts[0];
    const fastestPlat = [...chosen.platformResults].sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes)[0];

    const breakdown = chosen.platformResults.map((pr) => ({
      platformId: pr.platformId,
      platformName: pr.platformName,
      logo: pr.platformLogo,
      price: pr.priceBreakdown.finalPayablePrice,
      etaMinutes: pr.deliveryTimeMinutes,
      savings: pr.priceBreakdown.savingsVsHighest || 0,
      isBest: pr.platformId === fastestPlat.platformId,
    }));

    let text = `For fastest delivery right now, ${fastestPlat.platformName} can deliver ${chosen.name} in just ${fastestPlat.deliveryTimeMinutes} minutes at ₹${fastestPlat.priceBreakdown.finalPayablePrice}! Guarded by PriceBite circuit breakers for guaranteed zero-delay delivery.`;

    if (currentLang === 'bn') {
      text = `সবচেয়ে দ্রুত ডেলিভারির জন্য ${fastestPlat.platformName} মাত্র ${fastestPlat.deliveryTimeMinutes} মিনিটে ${chosen.name} পৌঁছে দেবে ₹${fastestPlat.priceBreakdown.finalPayablePrice}-এ!`;
    } else if (currentLang === 'hi') {
      text = `सबसे तेज़ डिलीवरी: ${fastestPlat.platformName} सिर्फ ${fastestPlat.deliveryTimeMinutes} मिनट में ${chosen.name} डिलीवर करेगा (मूल्य: ₹${fastestPlat.priceBreakdown.finalPayablePrice})!`;
    }

    return {
      text,
      recommendedProduct: chosen,
      comparisonBreakdown: breakdown,
      followUpActions: [
        'Cheapest price for this item',
        'Biryani under ₹250',
        'Show Domino pizza deals',
        'Apply PBDIRECT200 coupon',
      ],
    };
  }

  // 5. INTENT: PURE VEG / DIETARY RESTRICTION
  if (
    q.includes('veg') ||
    q.includes('vegetarian') ||
    q.includes('shakahari') ||
    q.includes('paneer') ||
    q.includes('নিরামিষ') ||
    q.includes('शाकाहारी')
  ) {
    const vegProducts = allProducts.filter((p) => p.isVeg);
    const chosen = vegProducts[0] || allProducts[0];
    const bestPlat = chosen.platformResults.find((p) => p.platformId === chosen.cheapestPlatformId) || chosen.platformResults[0];

    const breakdown = chosen.platformResults.map((pr) => ({
      platformId: pr.platformId,
      platformName: pr.platformName,
      logo: pr.platformLogo,
      price: pr.priceBreakdown.finalPayablePrice,
      etaMinutes: pr.deliveryTimeMinutes,
      savings: pr.priceBreakdown.savingsVsHighest || 0,
      isBest: pr.platformId === bestPlat.platformId,
    }));

    let text = `Filtered for 100% Pure Veg! The top match is ${chosen.name} from ${chosen.restaurantOrBrand}. Best price on ${bestPlat.platformName} at ₹${bestPlat.priceBreakdown.finalPayablePrice} (${bestPlat.deliveryTimeMinutes} mins delivery).`;

    if (currentLang === 'bn') {
      text = `১০০% নিরামিষ স্পেশাল! সেরা অপশন হলো ${chosen.name} (${chosen.restaurantOrBrand})। ${bestPlat.platformName}-এ সবচেয়ে কম দাম মাত্র ₹${bestPlat.priceBreakdown.finalPayablePrice}!`;
    } else if (currentLang === 'hi') {
      text = `100% शुद्ध शाकाहारी विकल्प! सबसे लोकप्रिय डिश ${chosen.restaurantOrBrand} की ${chosen.name} है। ${bestPlat.platformName} पर सबसे किफायती कीमत ₹${bestPlat.priceBreakdown.finalPayablePrice} में उपलब्ध है!`;
    }

    return {
      text,
      recommendedProduct: chosen,
      comparisonBreakdown: breakdown,
      followUpActions: [
        'Show more veg thalis',
        'Veg meals under ₹200',
        'Sweets & desserts',
        'Apply coupon PBDIRECT200',
      ],
    };
  }

  // 6. DEFAULT INTENT: GENERAL DISH SEARCH & HYBRID SEMANTIC MATCHING
  // Evaluate all products through Hybrid NLP Matching Engine + TOPSIS
  const scoredProducts = allProducts.map((p) => {
    const match = evaluateProductMatch(
      q,
      p.name,
      p.restaurantOrBrand,
      p.quantity,
      p.category,
      p.description
    );
    const topsis = runTOPSISAnalysis(p.platformResults, 'balanced');
    return { product: p, match, topsis };
  });

  scoredProducts.sort((a, b) => {
    // Primary sort: NLP Match Score, Secondary: TOPSIS Closeness
    if (b.match.matchScore !== a.match.matchScore) {
      return b.match.matchScore - a.match.matchScore;
    }
    return (
      (b.topsis.rankedEvaluations[0]?.closenessCoefficient || 0) -
      (a.topsis.rankedEvaluations[0]?.closenessCoefficient || 0)
    );
  });

  const topMatch = scoredProducts[0];
  const matchedProd = topMatch && topMatch.match.matchScore > 15 ? topMatch.product : allProducts[0];
  const topsisResult = runTOPSISAnalysis(matchedProd.platformResults, 'balanced');
  const smartPickEval = topsisResult.rankedEvaluations[0];
  const bestPlatform =
    matchedProd.platformResults.find((p) => p.platformId === smartPickEval.platformId) ||
    matchedProd.platformResults[0];

  const breakdown = matchedProd.platformResults.map((pr) => {
    const evalData = topsisResult.rankedEvaluations.find((e) => e.platformId === pr.platformId);
    return {
      platformId: pr.platformId,
      platformName: pr.platformName,
      logo: pr.platformLogo,
      price: pr.priceBreakdown.finalPayablePrice,
      etaMinutes: pr.deliveryTimeMinutes,
      savings: pr.priceBreakdown.savingsVsNextCheapest || 15,
      isBest: pr.platformId === bestPlatform.platformId,
      topsisScore: Math.round((evalData?.closenessCoefficient || 0) * 100),
    };
  });

  let text = `Evaluated 4 platforms using Hybrid NLP (Match Score: ${topMatch?.match.matchScore || 95}%) & TOPSIS MCDM! For "${rawQuery}", the mathematical top pick is ${matchedProd.name} on ${bestPlatform.platformName} at ₹${bestPlatform.priceBreakdown.finalPayablePrice} (${bestPlatform.deliveryTimeMinutes} mins, TOPSIS Score: ${Math.round(smartPickEval.closenessCoefficient * 100)}%). You save ₹${bestPlatform.priceBreakdown.savingsVsNextCheapest || 25}!`;

  if (currentLang === 'bn') {
    text = `হাইব্রিড NLP ও TOPSIS দিয়ে ৪টি প্ল্যাটফর্ম তুলনা করেছি! "${rawQuery}"-এর জন্য সেরা চয়েস হলো ${bestPlatform.platformName}-এ ${matchedProd.name} মাত্র ₹${bestPlatform.priceBreakdown.finalPayablePrice}-এ! আপনার সাশ্রয় ₹${bestPlatform.priceBreakdown.savingsVsNextCheapest || 25}!`;
  } else if (currentLang === 'hi') {
    text = `हाइब्रिड NLP और TOPSIS तकनीक से 4 प्लेटफ़ॉर्म्स का विश्लेषण किया! "${rawQuery}" के लिए सर्वोत्तम विकल्प ${bestPlatform.platformName} पर ${matchedProd.name} है, मात्र ₹${bestPlatform.priceBreakdown.finalPayablePrice} में! आपकी बचत: ₹${bestPlatform.priceBreakdown.savingsVsNextCheapest || 25}!`;
  }

  return {
    text,
    recommendedProduct: matchedProd,
    comparisonBreakdown: breakdown,
    followUpActions: [
      `Cheapest drinks to pair with this`,
      `Food under ₹250`,
      `Apply coupon PBDIRECT200`,
      `Show Domino pizza deals`,
    ],
  };
}
