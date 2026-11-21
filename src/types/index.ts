export type LanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'mr'
  | 'ta'
  | 'te'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'or'
  | 'pa'
  | 'as'
  | 'ur'
  | 'mai'
  | 'sat'
  | 'ks'
  | 'ne'
  | 'kok'
  | 'sd'
  | 'doi'
  | 'mni'
  | 'brx'
  | 'sa';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export type MatchType = 'EXACT' | 'VARIANT' | 'SIMILAR' | 'DIFFERENT';

export type PlatformId =
  | 'pricebite'
  | 'swiggy'
  | 'zomato'
  | 'blinkit'
  | 'zepto'
  | 'dominos'
  | 'kfc'
  | 'instamart'
  | 'zeptocafe';

export type ThemeMode = 'dark' | 'light';

export interface PriceBreakdown {
  basePrice: number;
  discount: number;
  couponDiscount: number;
  bankDiscount: number;
  deliveryFee: number;
  platformFee: number;
  packagingFee: number;
  taxes: number;
  finalPayablePrice: number;
  cashback: number;
  effectiveCost: number;
  savingsVsHighest?: number;
  savingsVsNextCheapest?: number;
}

export interface IngestionMetadata {
  source: 'LIVE_NETWORK' | 'L1_CACHE' | 'L2_CACHE' | 'SYNTHETIC_FALLBACK';
  latencyMs: number;
  fetchedAt: number;
  ttlRemainingSeconds?: number;
  circuitState?: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export interface PlatformResult {
  platformId: PlatformId;
  platformName: string;
  platformLogo: string;
  rating: number;
  ratingCount: number;
  deliveryTimeMinutes: number;
  inStock: boolean;
  orderUrl: string;
  priceBreakdown: PriceBreakdown;
  appliedCoupons?: string[];
  appliedBankOffers?: string[];
  isDirectAppOrder?: boolean;
  ingestionMeta?: IngestionMetadata;
}

export interface ProductComparisonItem {
  id: string;
  name: string;
  category: 'food' | 'grocery' | 'restaurant';
  restaurantOrBrand: string;
  quantity: string;
  imageUrl: string;
  description: string;
  isVeg?: boolean;
  matchType: MatchType;
  matchScore: number;
  matchNotes: string;
  semanticSimilarity?: number;
  lexicalSimilarity?: number;
  portionCongruence?: number;
  detectedSynonyms?: string[];
  platformResults: PlatformResult[];
  cheapestPlatformId: PlatformId;
  fastestPlatformId: PlatformId;
  bestValuePlatformId: PlatformId;
  bestRewardsPlatformId: PlatformId;
  smartPickPlatformId: PlatformId;
}

export interface RestaurantPlatformDetails {
  platformId: PlatformId;
  platformName: string;
  platformLogo: string;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  avgCostForTwo: number;
  hasFreeDelivery: boolean;
  activeOffers: string[];
}

export interface RestaurantComparison {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  rating: number;
  area: string;
  availablePlatforms: RestaurantPlatformDetails[];
  cheapestPlatformId: PlatformId;
  category?: string;
  distanceKm?: number;
  isPureVeg?: boolean;
  featuredDishes?: string[];
  isDirectPartner?: boolean;
  zoneTag?: string;
}

export interface PINCodeDetails {
  pinCode: string;
  area: string;
  district: string;
  state: string;
  recommendedLanguage: LanguageCode;
  languageNativeName: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentLowestPrice: number;
  pinCode: string;
  createdAt: string;
  active: boolean;
}

export interface PlatformOffer {
  id: string;
  platformId: PlatformId | 'all';
  title: string;
  discountAmount: number;
  minOrderValue: number;
  couponCode?: string;
  bankName?: string;
  cashbackAmount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  platformId: PlatformId;
  platformName: string;
  platformLogo: string;
  price: number;
  quantity: number;
  imageUrl: string;
  restaurantName: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Delivered' | 'In Transit' | 'Preparing';
  deliveryPinCode: string;
  deliveryAddress: string;
  paymentMethod: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
  currentPinCode: string;
  savedAddresses: string[];
  preferredLanguage: LanguageCode;
  totalSavingsAmount: number;
  comparedSearchesCount: number;
  favoriteProductIds: string[];
  alerts: PriceAlert[];
  cart: CartItem[];
  pastOrders: OrderRecord[];
}

export interface PriceHistoryPoint {
  date: string;
  lowestPrice: number;
  averagePrice: number;
  highestPrice: number;
}

export interface DealBotMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickActions?: string[];
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
}

export interface CryptographicProof {
  algorithm: string;
  signatureHex: string;
  publicKeyFingerprint: string;
  timestamp: number;
  nonce: string;
  payloadHash: string;
  isValid: boolean;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: number;
  type: 'KEY_GEN' | 'ORDER_SIGN' | 'SIG_VERIFY' | 'ENCRYPT_PII' | 'FILE_HASH' | 'KEY_ROTATE' | 'DATA_PURGE';
  description: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  meta?: Record<string, any>;
}

export interface SecurityStatus {
  healthScore: number;
  isTwoFactorEnabled: boolean;
  isBiometricsEnabled: boolean;
  publicKeyFingerprint: string;
  lastRotatedAt: number;
  activeSessionId: string;
  eventsCount: number;
}

