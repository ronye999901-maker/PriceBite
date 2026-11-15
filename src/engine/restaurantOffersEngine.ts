/**
 * Mock engine that provides promotional offers for a restaurant.
 * In a real implementation this would query the platform adapters (Swiggy, Zomato, etc.)
 * for restaurant‑level deals (e.g., "₹200 off", "50% off", "Free Delivery").
 */
export interface RestaurantOffer {
  /** Short label displayed as a badge */
  label: string;
  /** Optional expiry date (ISO string) – currently unused */
  expiresAt?: string;
}

/** Returns a static list of offers for demonstration purposes. */
export async function getRestaurantOffers(_restaurantId: string): Promise<RestaurantOffer[]> {
  // Mock data – you can extend this mapping by restaurantId if needed.
  return [
    { label: '₹200 off' },
    { label: '50% off' },
    { label: 'Free Delivery' },
    { label: 'Buy 1 Get 1 Free' },
  ];
}
