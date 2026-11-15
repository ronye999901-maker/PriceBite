/**
 * Simple mock menu engine for PriceBite Direct.
 * In a real implementation this would call the platform adapters (Swiggy, Zomato, etc.)
 * to fetch the full menu for a given restaurant ID.
 */
export interface MenuDish {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  offers?: { label: string; expiresAt?: string }[];
}

export interface MenuCategory {
  id: string;
  name: string;
  dishes: MenuDish[];
}

/**
 * Returns a static mock menu for demonstration purposes.
 * The `restaurantId` is currently ignored – you can extend this to map IDs.
 */
export async function getMenuForRestaurant(_restaurantId: string): Promise<MenuCategory[]> {
  // Mock data mimicking a typical restaurant menu with offers
  return [
    {
      id: 'cat-1',
      name: 'Starters',
      dishes: [
        {
          id: 'dish-1',
          name: 'Paneer Tikka',
          description: 'Grilled cottage cheese cubes marinated in spices.',
          price: 149,
          originalPrice: 199,
          imageUrl: 'https://images.unsplash.com/photo-1601924582975-2c4327b88b74?w=400&auto=format&fit=crop&q=80',
          offers: [{ label: '₹50 off' }],
        },
        {
          id: 'dish-2',
          name: 'Chicken 65',
          description: 'Spicy deep‑fried chicken bites.',
          price: 179,
          originalPrice: 229,
          imageUrl: 'https://images.unsplash.com/photo-1598511723989-1f03a7b1cde7?w=400&auto=format&fit=crop&q=80',
          offers: [{ label: '20% off' }],
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Main Course',
      dishes: [
        {
          id: 'dish-3',
          name: 'Butter Chicken',
          description: 'Creamy tomato‑based chicken curry.',
          price: 299,
          originalPrice: 399,
          imageUrl: 'https://images.unsplash.com/photo-1617191516195-6e395aa1a44c?w=400&auto=format&fit=crop&q=80',
          offers: [{ label: '₹100 off' }, { label: 'Free Dessert' }],
        },
        {
          id: 'dish-4',
          name: 'Veg Biryani',
          description: 'Fragrant basmati rice with mixed veg.',
          price: 219,
          originalPrice: 259,
          imageUrl: 'https://images.unsplash.com/photo-1601924583060-3cf3ccfb0bf7?w=400&auto=format&fit=crop&q=80',
          offers: [{ label: '15% off' }],
        },
      ],
    },
    {
      id: 'cat-3',
      name: 'Desserts',
      dishes: [
        {
          id: 'dish-5',
          name: 'Gulab Jamun',
          description: 'Milk‑solid deep‑fried sweets soaked in syrup.',
          price: 99,
          originalPrice: 129,
          imageUrl: 'https://images.unsplash.com/photo-1587049352860-602d092b2f80?w=400&auto=format&fit=crop&q=80',
          offers: [{ label: 'Buy 1 Get 1 Free' }],
        },
      ],
    },
  ];
}
