import { BasePlatformAdapter, RawPlatformItem } from './BaseAdapter';
import { PlatformId } from '../../types';

export class PriceBiteDirectAdapter extends BasePlatformAdapter {
  platformId: PlatformId = 'pricebite';
  platformName = 'PriceBite Direct Store (In-App)';
  platformLogo = '⚡';

  async fetchProductPrice(productQuery: string, pinCode: string): Promise<RawPlatformItem | null> {
    return {
      id: `pricebite-${Date.now()}`,
      name: productQuery,
      restaurantOrBrand: 'PriceBite Direct Partner Kitchen',
      basePrice: 249,
      discount: 60,
      deliveryFee: 10,
      platformFee: 0,
      packagingFee: 10,
      tax: 8,
      cashback: 15,
      deliveryTimeMinutes: 15,
      rating: 4.9,
      ratingCount: 9400,
      inStock: true,
      orderUrl: '#pricebite-direct',
      applicableCoupons: ['PRICEBITE_DIRECT'],
      applicableBankOffers: ['PRICEBITE_5_CASHBACK'],
    };
  }
}

export class SwiggyAdapter extends BasePlatformAdapter {
  platformId: PlatformId = 'swiggy';
  platformName = 'Swiggy';
  platformLogo = '🧡';

  async fetchProductPrice(productQuery: string, pinCode: string): Promise<RawPlatformItem | null> {
    return {
      id: `swiggy-${Date.now()}`,
      name: productQuery,
      restaurantOrBrand: 'Local Swiggy Outlet',
      basePrice: 249,
      discount: 50,
      deliveryFee: 20,
      platformFee: 6,
      packagingFee: 15,
      tax: 12,
      cashback: 25,
      deliveryTimeMinutes: 18,
      rating: 4.7,
      ratingCount: 5200,
      inStock: true,
      orderUrl: `https://www.swiggy.com/search?query=${encodeURIComponent(productQuery)}`,
      applicableCoupons: ['SWIGGY50'],
      applicableBankOffers: ['HDFC_CARD'],
    };
  }
}

export class ZomatoAdapter extends BasePlatformAdapter {
  platformId: PlatformId = 'zomato';
  platformName = 'Zomato';
  platformLogo = '🔴';

  async fetchProductPrice(productQuery: string, pinCode: string): Promise<RawPlatformItem | null> {
    return {
      id: `zomato-${Date.now()}`,
      name: productQuery,
      restaurantOrBrand: 'Local Zomato Outlet',
      basePrice: 249,
      discount: 30,
      deliveryFee: 25,
      platformFee: 6,
      packagingFee: 10,
      tax: 14,
      cashback: 15,
      deliveryTimeMinutes: 20,
      rating: 4.6,
      ratingCount: 4800,
      inStock: true,
      orderUrl: `https://www.zomato.com/search?q=${encodeURIComponent(productQuery)}`,
      applicableCoupons: ['ZOMATO20'],
      applicableBankOffers: ['SBI_INSTANT'],
    };
  }
}

export class BlinkitAdapter extends BasePlatformAdapter {
  platformId: PlatformId = 'blinkit';
  platformName = 'Blinkit';
  platformLogo = '🟡';

  async fetchProductPrice(productQuery: string, pinCode: string): Promise<RawPlatformItem | null> {
    return {
      id: `blinkit-${Date.now()}`,
      name: productQuery,
      restaurantOrBrand: 'Blinkit DarkStore',
      basePrice: 54,
      discount: 0,
      deliveryFee: 10,
      platformFee: 3,
      packagingFee: 0,
      tax: 0,
      cashback: 5,
      deliveryTimeMinutes: 7,
      rating: 4.9,
      ratingCount: 8900,
      inStock: true,
      orderUrl: `https://blinkit.com/search?q=${encodeURIComponent(productQuery)}`,
      applicableCoupons: [],
      applicableBankOffers: [],
    };
  }
}

export class ZeptoAdapter extends BasePlatformAdapter {
  platformId: PlatformId = 'zepto';
  platformName = 'Zepto';
  platformLogo = '💜';

  async fetchProductPrice(productQuery: string, pinCode: string): Promise<RawPlatformItem | null> {
    return {
      id: `zepto-${Date.now()}`,
      name: productQuery,
      restaurantOrBrand: 'Zepto DarkStore',
      basePrice: 54,
      discount: 0,
      deliveryFee: 14,
      platformFee: 4,
      packagingFee: 0,
      tax: 0,
      cashback: 2,
      deliveryTimeMinutes: 9,
      rating: 4.8,
      ratingCount: 7500,
      inStock: true,
      orderUrl: `https://www.zepto.com/search?q=${encodeURIComponent(productQuery)}`,
      applicableCoupons: [],
      applicableBankOffers: [],
    };
  }
}

export class DominosAdapter extends BasePlatformAdapter {
  platformId: PlatformId = 'dominos';
  platformName = "Domino's Direct";
  platformLogo = '🍕';

  async fetchProductPrice(productQuery: string, pinCode: string): Promise<RawPlatformItem | null> {
    return {
      id: `dominos-${Date.now()}`,
      name: productQuery,
      restaurantOrBrand: "Domino's Pizza",
      basePrice: 349,
      discount: 70,
      deliveryFee: 0,
      platformFee: 0,
      packagingFee: 15,
      tax: 15,
      cashback: 30,
      deliveryTimeMinutes: 20,
      rating: 4.8,
      ratingCount: 8400,
      inStock: true,
      orderUrl: 'https://pizzaonline.dominos.co.in/',
      applicableCoupons: ['DOMINOS50'],
      applicableBankOffers: ['AMEX_SPECIAL'],
    };
  }
}

export class KFCAdapter extends BasePlatformAdapter {
  platformId: PlatformId = 'kfc';
  platformName = 'KFC Official App';
  platformLogo = '🍗';

  async fetchProductPrice(productQuery: string, pinCode: string): Promise<RawPlatformItem | null> {
    return {
      id: `kfc-${Date.now()}`,
      name: productQuery,
      restaurantOrBrand: 'KFC Store',
      basePrice: 450,
      discount: 100,
      deliveryFee: 0,
      platformFee: 0,
      packagingFee: 15,
      tax: 20,
      cashback: 40,
      deliveryTimeMinutes: 20,
      rating: 4.7,
      ratingCount: 6200,
      inStock: true,
      orderUrl: 'https://online.kfc.co.in/',
      applicableCoupons: ['KFC100'],
      applicableBankOffers: [],
    };
  }
}
