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
}
