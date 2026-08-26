import { PlatformResult, PlatformOffer, PlatformId } from '../../types';

export interface RawPlatformItem {
  id: string;
  name: string;
  restaurantOrBrand: string;
  basePrice: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  packagingFee: number;
  tax: number;
  cashback: number;
  deliveryTimeMinutes: number;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  orderUrl: string;
  applicableCoupons: string[];
  applicableBankOffers: string[];
}

export abstract class BasePlatformAdapter {
  abstract platformId: PlatformId;
  abstract platformName: string;
  abstract platformLogo: string;

  abstract fetchProductPrice(
    productQuery: string,
    pinCode: string
  ): Promise<RawPlatformItem | null>;

  protected calculateBreakdown(raw: RawPlatformItem, selectedBankCard?: string): PlatformResult {
    let couponDiscount = 0;
    if (raw.discount > 0) {
      couponDiscount = Math.min(raw.discount, 50);
    }

    let bankDiscount = 0;
    if (selectedBankCard && raw.applicableBankOffers.length > 0) {
      bankDiscount = 30; // Standard instant bank benefit simulation
    }

    const finalPayablePrice = Math.max(
      0,
      raw.basePrice - raw.discount - couponDiscount - bankDiscount + raw.deliveryFee + raw.platformFee + raw.packagingFee + raw.tax
    );

    const effectiveCost = Math.max(0, finalPayablePrice - raw.cashback);

    return {
      platformId: this.platformId,
      platformName: this.platformName,
      platformLogo: this.platformLogo,
      rating: raw.rating,
      ratingCount: raw.ratingCount,
      deliveryTimeMinutes: raw.deliveryTimeMinutes,
      inStock: raw.inStock,
      orderUrl: raw.orderUrl,
      appliedCoupons: raw.applicableCoupons,
      appliedBankOffers: raw.applicableBankOffers,
      priceBreakdown: {
        basePrice: raw.basePrice,
        discount: raw.discount,
        couponDiscount,
        bankDiscount,
        deliveryFee: raw.deliveryFee,
        platformFee: raw.platformFee,
        packagingFee: raw.packagingFee,
        taxes: raw.tax,
        finalPayablePrice,
        cashback: raw.cashback,
        effectiveCost,
        savingsVsHighest: 0,
        savingsVsNextCheapest: 0,
      },
    };
  }
}
