import { ProductComparisonItem, LanguageCode, PINCodeDetails } from '../types';
import { evaluateProductMatch } from './matchingEngine';
import { DIRECT_PROMO_COUPONS, DIRECT_PARTNER_RESTAURANTS } from '../mock/directRestaurantData';
import { getProductsForLocation, generateUniversalDishProducts } from '../mock/foodData';

export interface DealBotResponse {
  text: string;
  recommendedProduct?: ProductComparisonItem;
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
  followUpActions?: string[];
}

/**
 * Clean, direct, and intelligent conversational response engine.
 * Answers exactly what the user asks without unsolicited spam.
 */
export function analyzeDealBotQuery(
  rawQuery: string,
  currentLang: LanguageCode = 'en',
  currentPin: PINCodeDetails | null = null
): DealBotResponse {
  const q = rawQuery.toLowerCase().trim();
  const allProducts = getProductsForLocation(currentPin);

  // 1. GREETINGS & CASUAL CONVERSATION (Direct & friendly, no dish spam)
  if (
    /^(hi|hello|hey|hola|namaste|good\s*(morning|afternoon|evening)|yo|sup)\b/i.test(q) ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey'
  ) {
    let text = "Hello! How can I help you today? You can ask me for food suggestions, compare prices between Swiggy and Zomato, or find active discount coupons.";
    if (currentLang === 'bn') {
      text = "নমস্কার! আমি আপনাকে কীভাবে সাহায্য করতে পারি? খাবারের সন্ধান, দামের তুলনা বা ডিসকাউন্ট কুপন জানতে আমাকে যেকোনো প্রশ্ন করতে পারেন।";
    } else if (currentLang === 'hi') {
      text = "नमस्ते! मैं आपकी क्या मदद कर सकता हूँ? आप मुझसे खाने के सुझाव, स्विगी और ज़ोमैटो के दामों की तुलना, या डिस्काउंट कूपन के बारे में पूछ सकते हैं।";
    }
    return {
      text,
      followUpActions: ['🍗 Best Biryani under ₹250', '🏷️ Show active coupons', '⚡ Fastest delivery < 20m', '🌱 Pure Veg options'],
    };
  }

  // 2. WHO ARE YOU / WHAT CAN YOU DO / ABOUT APP
  if (
    q.includes('who are you') ||
    q.includes('what are you') ||
    q.includes('what can you do') ||
    q.includes('what is dealbot') ||
    q.includes('who created you') ||
    q.includes('who made you')
  ) {
    return {
      text: "I am DealBot, PriceBite's intelligent food assistant. I compare live food prices across Swiggy, Zomato, and PriceBite Direct, help you find meals within your budget, and give you active discount promo codes.",
      followUpActions: ['How does PriceBite save money?', 'Show active coupons', 'Find meals under ₹200'],
    };
  }

  // 3. HOW DOES PRICEBITE WORK / WHY CHEAPER / PLATFORM FEES
  if (
    q.includes('how does it work') ||
    q.includes('how pricebite works') ||
    q.includes('how do you save') ||
    q.includes('why cheaper') ||
    q.includes('platform fee') ||
    q.includes('commission') ||
    q.includes('swiggy vs zomato') ||
    q.includes('compare apps')
  ) {
    return {
      text: "Swiggy and Zomato typically charge ₹5-₹15 platform fees, packaging markups, and delivery surge. PriceBite Direct connects you directly to partner kitchens with 0% extra commission, saving you 20% to 45% on identical meals.",
      followUpActions: ['Show active coupons', 'Top partner restaurants', 'Chicken Biryani under ₹250'],
    };
  }

  // 4. COUPONS & DISCOUNTS (Direct answer with the exact coupon code)
  if (
    q.includes('coupon') ||
    q.includes('promo') ||
    q.includes('code') ||
    q.includes('discount') ||
    q.includes('voucher') ||
    q.includes('offer') ||
    q.includes('200 off') ||
    q.includes('50%') ||
    q.includes('free delivery') ||
    q.includes('কুপন') ||
    q.includes('অফার')
  ) {
    // If user asked for 200 off
    if (q.includes('200') || q.includes('flat')) {
      const c = DIRECT_PROMO_COUPONS.find((x) => x.code === 'PBDIRECT200') || DIRECT_PROMO_COUPONS[0];
      return {
        text: `Use coupon code **${c.code}** to get flat ₹200 off on orders above ₹499 on PriceBite Direct.`,
        couponInfo: {
          code: c.code,
          title: c.title,
          discountSummary: c.discountSummary,
          discountAmount: c.discountAmount,
        },
        followUpActions: ['Show 50% off coupon', 'Free delivery coupon', 'Biryani under ₹250'],
      };
    }

    // If user asked for 50%
    if (q.includes('50%') || q.includes('half')) {
      const c = DIRECT_PROMO_COUPONS.find((x) => x.code === 'DIRECT50') || DIRECT_PROMO_COUPONS[1];
      return {
        text: `Use coupon code **${c.code}** to get 50% off up to ₹150 on all partner kitchen meals on PriceBite Direct.`,
        couponInfo: {
          code: c.code,
          title: c.title,
          discountSummary: c.discountSummary,
          discountAmount: c.discountAmount,
        },
        followUpActions: ['Show ₹200 off coupon', 'Free delivery coupon'],
      };
    }

    // General coupon inquiry
    const topCoupon = DIRECT_PROMO_COUPONS[0];
    return {
      text: `Today's best coupon is **${topCoupon.code}** for flat ₹200 off on orders above ₹499. You can also use **DIRECT50** for 50% off or **FREEDEL** for zero delivery fees!`,
      couponInfo: {
        code: topCoupon.code,
        title: topCoupon.title,
        discountSummary: topCoupon.discountSummary,
        discountAmount: topCoupon.discountAmount,
      },
      followUpActions: ['Apply PBDIRECT200', 'Show partner restaurants', 'Meals under ₹250'],
    };
  }

  // 5. RESTAURANT SPECIFIC QUESTIONS (Direct answer about that restaurant)
  for (const r of DIRECT_PARTNER_RESTAURANTS) {
    const cleanName = r.name.toLowerCase();
    const shortName = cleanName.split(' ')[0].replace(/[^a-z]/g, '');

    if (q.includes(cleanName) || (shortName.length > 2 && q.includes(shortName))) {
      const topDish = r.menu[0];
      return {
        text: `${r.name} (${r.rating} ★) delivers in about ${r.deliveryMinutes} mins. Active offer: **${r.heroOffer}**. Popular item: **${topDish.name}** at ₹${topDish.price} (Original ₹${topDish.originalPrice}).`,
        restaurantInfo: {
          id: r.id,
          name: r.name,
          branchName: r.branchName,
          rating: r.rating,
          heroOffer: r.heroOffer,
          featuredDish: topDish.name,
        },
        followUpActions: [`Show meals under ₹250`, `Show active coupons`, `Fastest delivery < 20m`],
      };
    }
  }

  // 6. GENERAL FOOD SUGGESTION / WHAT TO EAT / DINNER ADVICE
  if (
    q.includes('what should i eat') ||
    q.includes('what to eat') ||
    q.includes('suggest dinner') ||
    q.includes('suggest lunch') ||
    q.includes('what is good') ||
    q.includes('confused') ||
    q.includes('recommend something')
  ) {
    return {
      text: "Depending on your mood, here are three popular choices:\n• **Biryani:** Special Chicken Dum Biryani from Arsalan (₹199)\n• **Pizza:** Cheese Burst Margherita from Domino's (₹249)\n• **Chinese:** Hakka Noodles & Chilli Chicken from Chowman (₹219)\nWhich cuisine sounds good to you?",
      followUpActions: ['🍗 Biryani options', '🍕 Pizza options', '🥟 Chinese options', '🌱 Pure Veg options'],
    };
  }

  // 7. BUDGET CONSTRAINED FOOD SEARCH (e.g. "under ₹200", "under 250")
  const budgetMatch = q.match(/(?:under|below|less than|within|<)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                      q.match(/(?:₹|rs\.?)\s*(\d+)/i);
  const budgetLimit = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  if (budgetLimit) {
    // Filter items matching budget
    const withinBudget = allProducts.filter((p) => {
      const minP = Math.min(...p.platformResults.map((pr) => pr.priceBreakdown.finalPayablePrice));
      return minP <= budgetLimit;
    });

    if (withinBudget.length > 0) {
      // If user also specified a food keyword (e.g. "biryani under 250")
      let matched = withinBudget[0];
      const keywordScored = withinBudget.map((p) => ({
        product: p,
        score: evaluateProductMatch(q, p.name, p.restaurantOrBrand, p.quantity, p.category, p.description).matchScore,
      }));
      keywordScored.sort((a, b) => b.score - a.score);
      if (keywordScored[0] && keywordScored[0].score > 25) {
        matched = keywordScored[0].product;
      }

      const cheapestPlat = matched.platformResults.find((p) => p.platformId === matched.cheapestPlatformId) || matched.platformResults[0];

      return {
        text: `Under ₹${budgetLimit}, the best option is **${matched.name}** on ${cheapestPlat.platformName} for **₹${cheapestPlat.priceBreakdown.finalPayablePrice}** (${cheapestPlat.deliveryTimeMinutes} mins delivery).`,
        recommendedProduct: matched,
        followUpActions: [`Show coupons for this`, `Show more under ₹${budgetLimit}`, `Fastest delivery`],
      };
    } else {
      return {
        text: `I couldn't find items under ₹${budgetLimit} in this zone. The lowest priced items start around ₹139 (like Steamed Momos or Desserts). Would you like to see those?`,
        followUpActions: ['Show meals under ₹150', 'Show active coupons'],
      };
    }
  }

  // 8. SPEED / FASTEST DELIVERY
  if (q.includes('fast') || q.includes('quick') || q.includes('urgent') || q.includes('speed') || q.includes('20 min') || q.includes('hungry')) {
    const sorted = [...allProducts].sort((a, b) => {
      const minA = Math.min(...a.platformResults.map((pr) => pr.deliveryTimeMinutes));
      const minB = Math.min(...b.platformResults.map((pr) => pr.deliveryTimeMinutes));
      return minA - minB;
    });
    const fastestItem = sorted[0];
    const fastestPlat = [...fastestItem.platformResults].sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes)[0];

    return {
      text: `The fastest option right now is **${fastestItem.name}** on ${fastestPlat.platformName}, arriving in approximately **${fastestPlat.deliveryTimeMinutes} minutes** for ₹${fastestPlat.priceBreakdown.finalPayablePrice}.`,
      recommendedProduct: fastestItem,
      followUpActions: ['Show cheaper options', 'Show active coupons'],
    };
  }

  // 9. PURE VEG / VEGETARIAN
  if (q.includes('pure veg') || q.includes('veg only') || q.includes('vegetarian') || q.includes('shakahari') || q.includes('নিরামিষ')) {
    const vegItems = allProducts.filter((p) => p.isVeg);
    const topVeg = vegItems[0] || allProducts[0];
    const plat = topVeg.platformResults.find((p) => p.platformId === topVeg.cheapestPlatformId) || topVeg.platformResults[0];

    return {
      text: `For Pure Veg, a top pick is **${topVeg.name}** (${topVeg.restaurantOrBrand}) available on ${plat.platformName} at **₹${plat.priceBreakdown.finalPayablePrice}**.`,
      recommendedProduct: topVeg,
      followUpActions: ['Show more veg options', 'Veg meals under ₹200', 'Show active coupons'],
    };
  }

  // 10. SPECIFIC DISH QUERY (e.g. "Biryani", "Pizza", "Momos", "Burger", "Chicken", "Kebab", "Noodles")
  const scored = allProducts.map((p) => {
    const match = evaluateProductMatch(q, p.name, p.restaurantOrBrand, p.quantity, p.category, p.description);
    return { product: p, score: match.matchScore };
  });
  scored.sort((a, b) => b.score - a.score);

  if (scored[0] && scored[0].score >= 35) {
    const matched = scored[0].product;
    const cheapest = matched.platformResults.find((p) => p.platformId === matched.cheapestPlatformId) || matched.platformResults[0];

    return {
      text: `For "${rawQuery}", the cheapest deal is **${matched.name}** on **${cheapest.platformName}** at **₹${cheapest.priceBreakdown.finalPayablePrice}** (You save ₹${cheapest.priceBreakdown.savingsVsNextCheapest || 25} vs competitors).`,
      recommendedProduct: matched,
      followUpActions: [`Show coupons`, `Food under ₹250`, `Fastest delivery < 20m`],
    };
  }

  // Universal dynamic check for any dish in the market
  const universalMatches = generateUniversalDishProducts(rawQuery, currentPin);
  if (universalMatches.length > 0) {
    const matched = universalMatches[0];
    const cheapest = matched.platformResults.find((p) => p.platformId === matched.cheapestPlatformId) || matched.platformResults[0];
    return {
      text: `For "${rawQuery}", top restaurants in your area have it! The best option is **${matched.name}** on **${cheapest.platformName}** for **₹${cheapest.priceBreakdown.finalPayablePrice}**.`,
      recommendedProduct: matched,
      followUpActions: [`Show coupons`, `Food under ₹250`, `Fastest delivery < 20m`],
    };
  }

  // 11. GENERAL FALLBACK (DO NOT DEFAULT TO BIRYANI! Ask clearly and helpfully)
  return {
    text: `I'm not quite sure about "${rawQuery}". You can ask me:\n• A specific dish (e.g. "Chicken Biryani", "Margherita Pizza")\n• A price budget (e.g. "Dinner under ₹250")\n• Today's coupons (e.g. "Show active promo codes")\nWhat are you craving today?`,
    followUpActions: ['🍗 Biryani under ₹250', '🏷️ Show active coupons', '⚡ Fastest delivery < 20m', '🌱 Pure Veg Meals'],
  };
}
