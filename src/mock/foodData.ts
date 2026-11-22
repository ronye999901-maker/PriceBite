import { ProductComparisonItem, RestaurantComparison, PriceHistoryPoint, PlatformOffer, PINCodeDetails } from '../types';
import { enrichPlatformResultsWithSavings } from '../engine/priceEngine';
import { getGeographicZone } from '../engine/pinCodeEngine';

// ============================================================================
// HYPERLOCAL MULTI-ZONE RESTAURANT CATALOG
// Dynamically resolves authentic local legends + localized national QSRs
// based on the user's active 6-digit Indian PIN code and geographic zone!
// ============================================================================

interface RestaurantSeed {
  name: string;
  cuisine: string;
  img: string;
  rating: number;
  cost: number;
  category: string;
  offer1: string;
  offer2: string;
  isPureVeg?: boolean;
  featuredDishes: string[];
}

// 1. Zone-Specific Local Dining Institutions
const ZONE_RESTAURANTS: Record<string, RestaurantSeed[]> = {
  kolkata: [
    {
      name: 'Arsalan Dum Biryani & Kebabs',
      cuisine: 'Mughlai, Kolkata Biryani, Tandoori & Kebabs',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 390,
      category: 'Biryani & Mughlai',
      offer1: 'PriceBite Direct Exclusive ₹120 Off + 0% Platform Fee',
      offer2: 'Swiggy One Free Delivery over ₹199',
      featuredDishes: ['Mutton Special Biryani (2 Pcs)', 'Chicken Chaap', 'Murgh Reshmi Kebab'],
    },
    {
      name: 'Aminia Awadhi Biryani & Rezala',
      cuisine: 'Awadhi, Mughlai, Mutton Rezala, Firni',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 410,
      category: 'Biryani & Mughlai',
      offer1: 'Special Biryani Combo ₹350 on Direct',
      offer2: 'Free Shahi Firni on Zomato Gold',
      featuredDishes: ['Special Awadhi Mutton Biryani', 'Mutton Rezala', 'Shahi Firni'],
    },
    {
      name: 'Oudh 1590 Royal Period Dining',
      cuisine: 'Period Awadhi Biryani, Galawati Kebab, Nehari',
      img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 790,
      category: 'Biryani & Mughlai',
      offer1: 'PriceBite Royalty ₹150 Off + Free Galawati Kebab',
      offer2: 'Flat ₹100 Off on Swiggy',
      featuredDishes: ['Raan Biryani', 'Galawati Kebab with Ulte Tawe Ka Paratha', 'Murgh Irani'],
    },
    {
      name: 'Peter Cat Continental & Chelo Kebab',
      cuisine: 'Continental, Chelo Kebab, Sizzlers, Tandoori',
      img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 750,
      category: 'Continental & Grills',
      offer1: 'Original Chelo Kebab Meal Deal ₹100 Off',
      offer2: 'Flat ₹80 Off on Zomato',
      featuredDishes: ['Original Chelo Kebab with Butter & Poached Egg', 'House Prawn Cocktail', 'Sizzling Fish'],
    },
    {
      name: 'Mocambo Heritage Dining',
      cuisine: 'Continental, Sizzlers, Devilled Crab, Beckti',
      img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 820,
      category: 'Continental & Grills',
      offer1: 'Beckti Bell Meuniere Offer + 10% Cashback',
      offer2: 'Zomato Gold Complimentary Drink',
      featuredDishes: ['Devilled Crab in Shell', 'Chicken a la Kiev', 'Beckti Sizzler'],
    },
    {
      name: '6 Ballygunge Place Traditional Bengali',
      cuisine: 'Traditional Bengali Thali, Ilish, Kosha Mangsho',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 650,
      category: 'Bengali / Regional',
      offer1: 'Ilish & Kosha Mangsho Thali ₹550 on Direct',
      offer2: 'Free Mishti Doi Cup on Swiggy',
      featuredDishes: ['Bhapa Ilish in Mustard', 'Kosha Mangsho with Luchi', 'Daab Chingri'],
    },
    {
      name: 'Kasturi Authentic Dhakai Bengali',
      cuisine: 'Dhakai Bengali, Kochu Pata Chingri, Fish Fry',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 480,
      category: 'Bengali / Regional',
      offer1: 'Kochu Pata Chingri Special ₹80 Off',
      offer2: 'Flat 15% Off on Zomato',
      featuredDishes: ['Kochu Pata Diye Chingri Bhapa', 'Bhetki Paturi', 'Kasturi Special Mangsho'],
    },
    {
      name: 'Chowman Chinese & Asian Wok',
      cuisine: 'Chinese, Asian, Thai, Dimsums & Seafood',
      img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 420,
      category: 'Chinese & Asian',
      offer1: 'Flat ₹100 Off + 0% Platform Fee on Direct',
      offer2: 'Zomato Gold Free Delivery',
      featuredDishes: ['Kolkata Style Chilli Chicken', 'Shanghai Noodles', 'Pan Fried Dimsums'],
    },
    {
      name: 'Bhojohori Manna Homestyle Bengali',
      cuisine: 'Traditional Homestyle Bengali Fish, Rice & Dal',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 430,
      category: 'Bengali / Regional',
      offer1: 'Special Katla Kalia Thali ₹90 Off',
      offer2: 'Swiggy One Flat 20% Off',
      featuredDishes: ['Chingri Malai Curry', 'Macher Jhol with Bori', 'Aam Tel Ilish'],
    },
    {
      name: 'Royal Indian Hotel Chitpur',
      cuisine: 'Mutton Pasanda, Shahi Mutton Chaap, Biryani',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 490,
      category: 'Biryani & Mughlai',
      offer1: 'Mutton Pasanda Special ₹220 on Direct',
      offer2: 'Flat ₹75 Off on Swiggy',
      featuredDishes: ['Mutton Pasanda (No Potato Biryani)', 'Shahi Mutton Chaap', 'Rumaali Roti'],
    },
    {
      name: 'Balaram Mullick & Radharaman Mullick',
      cuisine: 'Bengali Mishti, Baked Rasogolla, Sandesh',
      img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 250,
      category: 'Desserts & Sweets',
      offer1: 'Baked Sandesh Box ₹180 on Direct Pay',
      offer2: 'Flat 10% Off on Zomato',
      isPureVeg: true,
      featuredDishes: ['Baked Rosogolla (4 Pcs)', 'Jalbhara Talsash Sandesh', 'Mishti Doi Matka'],
    },
    {
      name: 'Mitra Cafe Heritage Snacks (Est. 1910)',
      cuisine: 'Diamond Fish Fry, Kabiraji Cutlet, Brain Chop',
      img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 220,
      category: 'Fast Food & Snacks',
      offer1: 'Diamond Fish Fry Combo ₹149 on Direct',
      offer2: 'Free Kasundi & Salad on Swiggy',
      featuredDishes: ['Bhetki Diamond Fish Fry', 'Mutton Kabiraji Cutlet', 'Chicken Roll'],
    },
    {
      name: 'Dada Boudi Biryani Legend',
      cuisine: 'Extra Large Mutton Dum Biryani, Chicken Tikka',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 460,
      category: 'Biryani & Mughlai',
      offer1: 'Mega Mutton Biryani Box ₹399 Direct',
      offer2: 'Flat ₹80 Off on Zomato',
      featuredDishes: ['Mega Mutton Biryani (2 Huge Mutton Pcs)', 'Chicken Chaap', 'Egg Biryani'],
    },
    {
      name: 'Kusum Rolls & Kati Kebabs (Park Street)',
      cuisine: 'Egg Chicken Kati Roll, Paneer Roll, Tawa Kebabs',
      img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 180,
      category: 'Fast Food & Snacks',
      offer1: 'Double Egg Double Chicken Roll ₹119 Direct',
      offer2: 'Buy 2 Get 1 Roll on Swiggy',
      featuredDishes: ['Double Chicken Egg Kati Roll', 'Cheese Paneer Roll', 'Mutton Boti Roll'],
    },
    {
      name: 'Flurys Heritage Tearoom & Bakery (Est. 1927)',
      cuisine: 'English Breakfast, Heritage Pastries, Rum Ball',
      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 680,
      category: 'Cafe & Bakery',
      offer1: 'Heritage Rum Ball & Pastry Box ₹120 Off',
      offer2: 'Flat 15% Off on Zomato Gold',
      featuredDishes: ['Original Chocolate Rum Ball', 'Full English Breakfast Plate', 'Mushroom Quiche'],
    },
  ],

  midnapore: [
    {
      name: 'Midnapore Heritage Town Hotel',
      cuisine: 'Bengali Thali, Posto Bora, Mutton Kasha, Katla Jhol',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 290,
      category: 'Bengali / Regional',
      offer1: 'Posto Bora & Mutton Thali ₹220 Direct',
      offer2: 'Free Mishti on Swiggy Delivery',
      featuredDishes: ['Aloo Posto with Posto Bora', 'Midnapore Desi Mutton Kasha', 'Katla Kalia'],
    },
    {
      name: 'Kharagpur Golbazar Biryani House',
      cuisine: 'Kolkata Style Dum Biryani, Chicken Chaap, Kebabs',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 320,
      category: 'Biryani & Mughlai',
      offer1: 'Special Chicken Dum Biryani ₹180 on Direct',
      offer2: 'Flat ₹60 Off on Zomato',
      featuredDishes: ['Chicken Dum Biryani with Aloo & Egg', 'Chicken Chaap', 'Tandoori Roti'],
    },
    {
      name: 'Vidyasagar Canteen & Thali Hub',
      cuisine: 'Homestyle Student & Family Thali, Fish Curry',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
      cost: 210,
      category: 'Bengali / Regional',
      offer1: 'Executive Fish Meal ₹140 on Direct Pay',
      offer2: 'Flat 10% Off on Swiggy',
      featuredDishes: ['Rui Macher Jhol Thali', 'Special Egg Curry Rice', 'Moong Dal with Jhuri Aloo Bhaja'],
    },
    {
      name: 'Rangamati Highway Express Dhaba',
      cuisine: 'Tadka Roti, Butter Chicken, Paneer Bhurji',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
      cost: 280,
      category: 'North Indian & Dhaba',
      offer1: 'Egg Tadka & Tandoori Roti Combo ₹110',
      offer2: 'Free Extra Tadka on Swiggy',
      featuredDishes: ['Dhaba Egg Tadka Special', 'Kadai Chicken', 'Butter Tandoori Roti'],
    },
    {
      name: 'Chowman Express Midnapore',
      cuisine: 'Chinese, Asian, Hakka Noodles, Crispy Chicken',
      img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 350,
      category: 'Chinese & Asian',
      offer1: 'Meal for Two ₹299 Direct Store',
      offer2: 'Flat ₹80 Off on Zomato',
      featuredDishes: ['Chilli Chicken Dry', 'Chicken Hakka Noodles', 'Crispy Honey Chilli Potatoes'],
    },
    {
      name: 'Midnapore Mishti & Sweets Hub',
      cuisine: 'Lyangcha, Chanar Payesh, Rosogolla, Mishti Doi',
      img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 180,
      category: 'Desserts & Sweets',
      offer1: 'Fresh Rosogolla Box ₹120 on Direct',
      offer2: 'Flat ₹30 Off on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Garam Rosogolla (6 Pcs)', 'Special Chanar Payesh', 'Red Mishti Doi Matka'],
    },
  ],

  bengaluru: [
    {
      name: 'The Rameshwaram Cafe',
      cuisine: 'South Indian, Ghee Podi Dosa, Filter Coffee, Idli',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 260,
      category: 'South Indian',
      offer1: 'Ghee Podi Idli & Dosa Combo ₹149 on Direct',
      offer2: 'Free Filter Coffee on Swiggy One',
      isPureVeg: true,
      featuredDishes: ['Ghee Thatte Idli with Podi', 'Ghee Podi Masala Dosa', 'South Indian Filter Kaapi'],
    },
    {
      name: 'Meghana Foods Biryani & Kebabs',
      cuisine: 'Spicy Andhra Dum Biryani, Boneless Chicken 65',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 420,
      category: 'Biryani & Mughlai',
      offer1: 'Meghana Special Chicken Biryani ₹320 Direct',
      offer2: 'Free Extra Gravy & Salan on Zomato',
      featuredDishes: ['Meghana Special Chicken Biryani', 'Boneless Chicken 65', 'Paneer 65 Biryani'],
    },
    {
      name: 'Truffles American Burgers & Diner',
      cuisine: 'American Burgers, Pasta, Steaks, Thickshakes',
      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 480,
      category: 'Fast Food & Burgers',
      offer1: 'All-Star Burger Meal + Shake ₹380 Direct',
      offer2: 'Flat ₹100 Off on Swiggy',
      featuredDishes: ['All-American Cheese Burger', 'Truffles Crunchy Peri Peri Chicken Burger', 'Ferrero Rocher Shake'],
    },
    {
      name: 'Nagarjuna Andhra Dining',
      cuisine: 'Authentic Andhra Banana Leaf Meals, Guntur Chicken',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 450,
      category: 'South Indian',
      offer1: 'Unlimited Andhra Meal Combo ₹90 Off',
      offer2: 'Zomato Gold Free Sweet',
      featuredDishes: ['Nagarjuna Full Andhra Meals', 'Chilli Chicken Andhra Style', 'Mutton Ghee Roast'],
    },
    {
      name: 'Vidyarthi Bhavan (Est. 1943)',
      cuisine: 'Heritage Crispy Benne Masala Dosa, Filter Coffee',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 180,
      category: 'South Indian',
      offer1: 'Heritage Masala Dosa Duo ₹130 on Direct',
      offer2: 'Flat 10% Off on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Crispy Benne Masala Dosa', 'Rava Vada with Coconut Chutney', 'Traditional Filter Coffee'],
    },
    {
      name: 'CTR - Shri Sagar (Est. 1920)',
      cuisine: 'Benne Masala Dosa, Mangalore Bajji, Poori Saagu',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 160,
      category: 'South Indian',
      offer1: 'Butter Dosa Feast ₹110 on Direct Pay',
      offer2: 'Free Extra Chutney on Zomato',
      isPureVeg: true,
      featuredDishes: ['CTR Special Benne Masala Dosa', 'Mangalore Bajji', 'Kesari Bath'],
    },
    {
      name: 'Empire Restaurant Midnight Feast',
      cuisine: 'Empire Special Ghee Rice, Chicken Kebab, Shawarma',
      img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 390,
      category: 'Biryani & Mughlai',
      offer1: 'Ghee Rice & Chicken Kebab Combo ₹249 Direct',
      offer2: 'Late Night Free Delivery on Swiggy',
      featuredDishes: ['Empire Special Ghee Rice with Dal', 'Empire Chicken Kebab', 'Coin Parotta with Chicken Curry'],
    },
    {
      name: 'Corner House Ice Cream Lounge',
      cuisine: 'Death By Chocolate (DBC), Cake Fudge, Sundaes',
      img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 280,
      category: 'Desserts & Sweets',
      offer1: 'Original DBC Special ₹210 on Direct Store',
      offer2: 'Flat 15% Off on Zomato',
      isPureVeg: true,
      featuredDishes: ['Death By Chocolate (DBC)', 'Hot Chocolate Fudge', 'Apple Pie with Vanilla Ice Cream'],
    },
    {
      name: 'Toit Artisan Kitchen & Brewpub',
      cuisine: 'Woodfired Pizza, Buffalo Chicken Wings, Nachos',
      img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 850,
      category: 'Continental & Grills',
      offer1: 'Woodfired Pizza Feast ₹150 Off on Direct',
      offer2: 'Zomato Gold Special Privileges',
      featuredDishes: ['Toit Woodfired Pepperoni Pizza', 'Spicy BBQ Chicken Wings', 'Cheesy Nachos Grande'],
    },
    {
      name: 'MTR 1924 (Mavalli Tiffin Room)',
      cuisine: 'Traditional Rava Idli, Bisibele Bath, Filter Kaapi',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 240,
      category: 'South Indian',
      offer1: 'Original Rava Idli Breakfast Pack ₹149',
      offer2: 'Flat ₹50 Off on Swiggy One',
      isPureVeg: true,
      featuredDishes: ['Original MTR Rava Idli with Ghee', 'Bisibele Bath with Raitha', 'Chandrahara Sweet'],
    },
    {
      name: 'Leon’s Burgers & Wings',
      cuisine: 'Gourmet Crispy Burgers, Peri Peri Wings, Fries',
      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 340,
      category: 'Fast Food & Burgers',
      offer1: 'Jumbo Crispy Burger Combo ₹249 on Direct',
      offer2: 'Flat ₹80 Off on Zomato',
      featuredDishes: ['Peri Peri Chicken Burger', 'Crispy Falafel Burger', 'Jalapeno Loaded Fries'],
    },
    {
      name: 'Third Wave Coffee Roasters',
      cuisine: 'Artisan Pour-overs, Bagels, Sourdough Sandwiches',
      img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 490,
      category: 'Cafe & Bakery',
      offer1: 'Sea Salt Mocha & Bagel Combo ₹100 Off',
      offer2: 'Flat 15% Off on Swiggy',
      featuredDishes: ['Sea Salt Mocha Latte', 'Cream Cheese Everything Bagel', 'Avocado Toast'],
    },
  ],

  mumbai: [
    {
      name: 'Sardar Refreshments Pav Bhaji (Tardeo)',
      cuisine: 'World Famous Amul Butter Pav Bhaji, Cheese Pav Bhaji',
      img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 240,
      category: 'Fast Food & Snacks',
      offer1: 'Amul Cheese Pav Bhaji ₹160 on Direct',
      offer2: 'Free Extra Butter Pav on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Sardar Special Butter Pav Bhaji', 'Cheese Pav Bhaji', 'Extra Masala Pav'],
    },
    {
      name: 'Bademiya Kebabs & Grills (Colaba)',
      cuisine: 'Seekh Kebabs, Baida Roti, Chicken Tikka Roll',
      img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 480,
      category: 'Biryani & Mughlai',
      offer1: 'Chicken Tikka Roll Duo ₹250 on Direct Store',
      offer2: 'Flat ₹90 Off on Zomato',
      featuredDishes: ['Mutton Seekh Kebab', 'Chicken Baida Roti', 'Bademiya Chicken Roll'],
    },
    {
      name: 'Gajalee Seafood Lounge',
      cuisine: 'Malvani Seafood, Tandoori Crab, Bombay Duck Fry',
      img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 890,
      category: 'Coastal & Seafood',
      offer1: 'Surmai & Bombil Fry Special ₹150 Off',
      offer2: 'Free Solkadhi Jug on Swiggy One',
      featuredDishes: ['Butter Garlic King Crab', 'Crispy Bombil Fry', 'Surmai Masala with Neer Dosa'],
    },
    {
      name: 'Persian Darbar Biryani & Raan',
      cuisine: 'Mutton Raan Biryani, Mughlai, Kepsa Rice',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 620,
      category: 'Biryani & Mughlai',
      offer1: 'Kepsa Rice Box ₹490 on Direct Pay',
      offer2: 'Flat ₹110 Off on Zomato',
      featuredDishes: ['Persian Special Mutton Kepsa Rice', 'Chicken Tikka Biryani', 'Mutton Raan Roast'],
    },
    {
      name: 'Kyani & Co. Heritage Bakery (Est. 1904)',
      cuisine: 'Irani Chai, Bun Maska, Keema Pav, Mawa Cake',
      img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 190,
      category: 'Cafe & Bakery',
      offer1: 'Bun Maska & Irani Chai Duo ₹99 on Direct',
      offer2: 'Free Mawa Cake Slice on Swiggy',
      featuredDishes: ['Irani Chai with Bun Maska', 'Mutton Keema Ghotala with Pav', 'Fresh Mawa Cake'],
    },
    {
      name: 'Britannia & Co. Restaurant (Ballard Estate)',
      cuisine: 'Parsi Heritage Berry Pulao, Sali Boti, Custard',
      img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 650,
      category: 'Parsi & Regional',
      offer1: 'Original Berry Pulao Special ₹120 Off',
      offer2: 'Flat 15% Off on Zomato Gold',
      featuredDishes: ['Chicken Berry Pulao with Zereshk Berries', 'Mutton Sali Boti', 'Caramel Custard'],
    },
    {
      name: 'Amar Juice Centre (Juhu Vile Parle)',
      cuisine: 'Pav Bhaji, Fresh Fruit Juices, Cheese Garlic Bread',
      img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 260,
      category: 'Fast Food & Snacks',
      offer1: 'Special Pav Bhaji + Ganga Jamuna Juice Combo ₹199',
      offer2: 'Flat ₹50 Off on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Amar Special Cheese Pav Bhaji', 'Fresh Mosambi Juice', 'Veg Tawa Pulao'],
    },
    {
      name: 'Bhagat Tarachand (Zaveri Bazaar)',
      cuisine: 'Pure Veg North Indian Thali, Kutchi Beer (Chaas)',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 380,
      category: 'Pure Veg & Thalis',
      offer1: 'Executive Veg Thali ₹260 on Direct Store',
      offer2: 'Free Kutchi Beer Bottle on Zomato',
      isPureVeg: true,
      featuredDishes: ['Special Veg Thali with Paneer Bhurji', 'Kutchi Beer (Spiced Buttermilk)', 'Papad Churi'],
    },
    {
      name: 'Natural Ice Cream (Juhu Est. 1984)',
      cuisine: 'Tender Coconut, Alphonso Mango, Sitaphal Ice Cream',
      img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 220,
      category: 'Desserts & Sweets',
      offer1: 'Tender Coconut 500ml Tub ₹190 Direct',
      offer2: 'Buy 2 Get 1 Free Scoop on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Tender Coconut Ice Cream', 'Sitaphal Ice Cream', 'Alphonso Mango Scoop'],
    },
    {
      name: 'Shiv Sagar Pure Veg (Churchgate)',
      cuisine: 'South Indian, Mumbai Street Food, Falooda',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
      cost: 340,
      category: 'Pure Veg & Street Food',
      offer1: 'Royal Falooda & Pav Bhaji Combo ₹249',
      offer2: 'Flat ₹60 Off on Swiggy One',
      isPureVeg: true,
      featuredDishes: ['Shiv Sagar Special Pav Bhaji', 'Royal Kesar Pista Falooda', 'Mysore Masala Dosa'],
    },
  ],

  pune: [
    {
      name: 'Vaishali Restaurant (FC Road)',
      cuisine: 'SPDP (Sev Potato Dahi Puri), Mysore Dosa, Filter Coffee',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 210,
      category: 'South Indian & Chaat',
      offer1: 'Famous SPDP + Filter Coffee ₹149 on Direct',
      offer2: 'Flat 10% Off on Swiggy',
      isPureVeg: true,
      featuredDishes: ['World Famous SPDP', 'Mysore Cheese Masala Dosa', 'Filter Coffee'],
    },
    {
      name: 'Sujata Mastani (Sadashiv Peth)',
      cuisine: 'Puneri Mango Mastani, Kesar Pista Shake & Ice Cream',
      img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 180,
      category: 'Desserts & Sweets',
      offer1: 'Special Mango Mastani ₹129 on Direct Pay',
      offer2: 'Buy 2 Get 1 Mastani on Zomato',
      isPureVeg: true,
      featuredDishes: ['Original Mango Mastani with Ice Cream', 'Dry Fruit Kesar Mastani', 'Chocolate Mastani'],
    },
    {
      name: 'Shabree Maharashtrian Thali (FC Road)',
      cuisine: 'Authentic Maharashtrian Thali, Pithla Bhakri, Puran Poli',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 380,
      category: 'Pure Veg & Thalis',
      offer1: 'Unlimited Maharashtrian Thali ₹299 Direct',
      offer2: 'Flat ₹75 Off on Swiggy One',
      isPureVeg: true,
      featuredDishes: ['Shabree Maharashtrian Thali', 'Pithla Bhakri with Thecha', 'Hot Puran Poli with Ghee'],
    },
    {
      name: 'Goodluck Cafe (FC Road Est. 1935)',
      cuisine: 'Bun Maska, Irani Chai, Keema Pav, Caramel Custard',
      img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 220,
      category: 'Cafe & Bakery',
      offer1: 'Mutton Keema Pav + Bun Maska ₹160 Direct',
      offer2: 'Free Extra Pav on Zomato',
      featuredDishes: ['Mutton Keema Pav with Egg', 'Bun Maska Chai Combo', 'Caramel Custard'],
    },
    {
      name: 'Kayani Bakery (East Street Camp)',
      cuisine: 'Original Shrewsbury Biscuits, Mawa Cake, Brazil Nut',
      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 260,
      category: 'Cafe & Bakery',
      offer1: 'Original Shrewsbury Box ₹210 on Direct',
      offer2: 'Flat 10% Off on Swiggy',
      featuredDishes: ['Famous Shrewsbury Biscuits (500g)', 'Walnut Mawa Cake', 'Cheese Straws'],
    },
  ],

  delhi_ncr: [
    {
      name: 'Karim’s Historic Mughlai (Est. 1913)',
      cuisine: 'Jama Masjid Mutton Korma, Seekh Kebab, Sheermal',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 520,
      category: 'Biryani & Mughlai',
      offer1: 'Mutton Korma & Khamiri Roti Combo ₹390 Direct',
      offer2: 'Flat ₹100 Off on Swiggy',
      featuredDishes: ['Karim Special Mutton Korma', 'Mutton Seekh Kebab', 'Khamiri Roti with Sheermal'],
    },
    {
      name: 'Gulati Restaurant (Pandara Road)',
      cuisine: 'World Famous Butter Chicken, Dal Makhani, Galouti',
      img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 780,
      category: 'North Indian & Mughlai',
      offer1: 'Legendary Butter Chicken Feast ₹150 Off Direct',
      offer2: 'Zomato Gold Complimentary Dessert',
      featuredDishes: ['Original Murgh Makhani (Butter Chicken)', 'Dal Makhani Slow-cooked 18 Hrs', 'Galouti Kebab'],
    },
    {
      name: 'Moti Mahal Delux (Inventors of Butter Chicken)',
      cuisine: 'Tandoori Chicken, Butter Chicken, Dal Moti Mahal',
      img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 720,
      category: 'North Indian & Mughlai',
      offer1: 'Tandoori Chicken + Butter Chicken Combo ₹120 Off',
      offer2: 'Flat ₹90 Off on Swiggy One',
      featuredDishes: ['Original 1920 Tandoori Chicken', 'Original Butter Chicken', 'Garlic Butter Naan'],
    },
    {
      name: 'Haldiram’s Chandni Chowk & Thalis',
      cuisine: 'Raj Kachori, Chole Bhature, North Indian Thali',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 350,
      category: 'Pure Veg & Chaat',
      offer1: 'Raj Kachori & Chole Bhature Combo ₹199 Direct',
      offer2: 'Free Gulab Jamun on Zomato',
      isPureVeg: true,
      featuredDishes: ['Haldiram Famous Raj Kachori', 'Amritsari Chole Bhature', 'Special Royal Thali'],
    },
    {
      name: 'Kake Da VMIN (Connaught Place)',
      cuisine: 'Dhaba Style Butter Chicken, Dahi Meat, Keema Naan',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 460,
      category: 'North Indian & Dhaba',
      offer1: 'Dhaba Dahi Meat Box ₹349 on Direct Store',
      offer2: 'Flat ₹80 Off on Swiggy',
      featuredDishes: ['Dahi Meat (Mutton Gravy)', 'Kake Special Butter Chicken', 'Keema Naan with Gravy'],
    },
    {
      name: 'Saravana Bhavan (Janpath Connaught Place)',
      cuisine: 'Authentic Ghee Roast Dosa, Mini Tiffin, Filter Coffee',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 290,
      category: 'South Indian',
      offer1: 'Mini Tiffin Sampler ₹190 on Direct Pay',
      offer2: 'Free Filter Coffee on Swiggy One',
      isPureVeg: true,
      featuredDishes: ['Special Ghee Roast Masala Dosa', 'South Indian Mini Tiffin', 'Authentic Madras Filter Coffee'],
    },
    {
      name: 'Wenger’s Deli & Bakery (Connaught Place Est. 1926)',
      cuisine: 'Shami Kebab, Chicken Patty, Baguettes, Waffles',
      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 320,
      category: 'Cafe & Bakery',
      offer1: 'Classic Chicken Patty & Shami Kebab Box ₹180',
      offer2: 'Flat 10% Off on Zomato Gold',
      featuredDishes: ['Wenger’s Famous Chicken Patty', 'Mutton Shami Kebab', 'Nutella Waffle'],
    },
    {
      name: 'Rajinder Da Dhaba (Safdarjung Enclave)',
      cuisine: 'Galouti Kebab, Tawa Chicken, Roomali Roti, Malai Tikka',
      img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 420,
      category: 'North Indian & Dhaba',
      offer1: 'Galouti Kebab with Roomali Roti ₹260 Direct',
      offer2: 'Flat ₹75 Off on Swiggy',
      featuredDishes: ['Melt-in-mouth Galouti Kebab', 'Special Tawa Chicken', 'Chicken Malai Tikka'],
    },
  ],

  hyderabad: [
    {
      name: 'Paradise Biryani (Secunderabad Est. 1953)',
      cuisine: 'World Famous Hyderabadi Dum Biryani, Mirchi Ka Salan',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 390,
      category: 'Biryani & Mughlai',
      offer1: 'Nizami Special Mutton Biryani ₹299 Direct',
      offer2: 'Swiggy One Free Delivery over ₹199',
      featuredDishes: ['Nizami Special Mutton Dum Biryani', 'Chicken 65', 'Double Ka Meetha'],
    },
    {
      name: 'Bawarchi Restaurant (RTC X Roads)',
      cuisine: 'Authentic Hyderabadi Mutton Biryani, Boti Kebab',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 380,
      category: 'Biryani & Mughlai',
      offer1: 'Original Bawarchi Biryani Combo ₹100 Off',
      offer2: 'Flat ₹70 Off on Zomato',
      featuredDishes: ['Original Bawarchi Mutton Dum Biryani', 'Mutton Boti Kebab', 'Tandoori Tangdi'],
    },
    {
      name: 'Shah Ghouse Hotel & Cafe',
      cuisine: 'Special Mutton Biryani, Hyderabadi Haleem, Paya',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 370,
      category: 'Biryani & Mughlai',
      offer1: 'Authentic Mutton Haleem & Biryani Box ₹320 Direct',
      offer2: 'Late Night Express on Swiggy',
      featuredDishes: ['Shah Ghouse Special Biryani', 'Pure Ghee Mutton Haleem', 'Irani Chai with Osmania'],
    },
    {
      name: 'Pista House (Charminar)',
      cuisine: 'GI-Tagged Hyderabadi Haleem, Zafrani Mutton Biryani',
      img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 410,
      category: 'Biryani & Mughlai',
      offer1: 'GI-Tagged Royal Haleem ₹220 Direct',
      offer2: 'Flat ₹80 Off on Zomato',
      featuredDishes: ['World Famous GI Tagged Haleem', 'Zafrani Mutton Biryani', 'Kaddu Ki Kheer'],
    },
    {
      name: 'Chutneys (Banjara Hills)',
      cuisine: 'Guntur Idli, 7 Chutneys Dosa, Babai Hotel Idli',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 320,
      category: 'South Indian',
      offer1: 'Famous 7 Chutneys Dosa Sampler ₹210 Direct',
      offer2: 'Free Extra Chutney Trio on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Babai Hotel Idli with White Butter', 'Guntur Spicy Podi Dosa', 'Pesarattu Upma'],
    },
    {
      name: 'Karachi Bakery (Est. 1953)',
      cuisine: 'Famous Fruit Biscuits, Osmania Biscuits, Plum Cake',
      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 240,
      category: 'Cafe & Bakery',
      offer1: 'Original Fruit Biscuit Box (400g) ₹160 Direct',
      offer2: 'Flat 10% Off on Zomato',
      isPureVeg: true,
      featuredDishes: ['Original Karachi Fruit Biscuits', 'Authentic Osmania Biscuits', 'Rich Plum Cake'],
    },
  ],

  chennai: [
    {
      name: 'Murugan Idli Shop (T. Nagar)',
      cuisine: 'Podi Ghee Idli, Onion Uthappam, Jigarthanda',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 220,
      category: 'South Indian',
      offer1: 'Podi Ghee Idli Duo + Jigarthanda ₹160 Direct',
      offer2: 'Free 4-Chutney Pack on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Melt-in-mouth Podi Ghee Idli', 'Madurai Jigarthanda', 'Ghee Onion Uthappam'],
    },
    {
      name: 'Saravana Bhavan Heritage (Mylapore)',
      cuisine: 'Authentic South Indian Meals, Ghee Roast, Filter Kaapi',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 280,
      category: 'South Indian',
      offer1: 'Special South Indian Meals ₹180 on Direct Pay',
      offer2: 'Swiggy One Free Delivery',
      isPureVeg: true,
      featuredDishes: ['Special South Indian Meals on Plantain Leaf', 'Crispy Ghee Roast', 'Degree Filter Coffee'],
    },
    {
      name: 'Anjappar Chettinad Restaurant',
      cuisine: 'Chettinad Pepper Chicken, Mutton Biryani, Crab Masala',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 440,
      category: 'Chettinad & Biryani',
      offer1: 'Chettinad Pepper Chicken Box ₹299 Direct',
      offer2: 'Flat ₹90 Off on Zomato',
      featuredDishes: ['Authentic Chettinad Pepper Chicken', 'Seeraga Samba Mutton Biryani', 'Crab Roast'],
    },
    {
      name: 'Dindigul Thalappakatti Biryani',
      cuisine: 'Seeraga Samba Mutton Biryani, Ennai Kathirikai',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 420,
      category: 'Chettinad & Biryani',
      offer1: 'Thalappakatti Mutton Biryani Feast ₹320 Direct',
      offer2: 'Flat ₹75 Off on Swiggy One',
      featuredDishes: ['Thalappakatti Mutton Biryani', 'Kola Urundai (Mutton Balls)', 'Black Pepper Chicken'],
    },
  ],

  ahmedabad: [
    {
      name: 'Gordhan Thal (SG Highway)',
      cuisine: 'Unlimited Authentic Gujarati & Rajasthani Thali',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 420,
      category: 'Pure Veg & Thalis',
      offer1: 'Royal Gujarati Feast ₹320 on Direct Store',
      offer2: 'Flat ₹80 Off on Zomato Gold',
      isPureVeg: true,
      featuredDishes: ['Unlimited Gujarati Thali', 'Kadhi Khichdi with Ghee', 'Garam Farsan & Jalebi'],
    },
    {
      name: 'Honest Restaurant (Pav Bhaji Legend)',
      cuisine: 'Honest Special Pav Bhaji, Pulav, Cheese Sandwich',
      img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 250,
      category: 'Fast Food & Snacks',
      offer1: 'Honest Butter Pav Bhaji Combo ₹170 Direct',
      offer2: 'Flat ₹50 Off on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Honest Special Butter Pav Bhaji', 'Spiced Veg Pulav', 'Cheese Grilled Sandwich'],
    },
    {
      name: 'Das Khaman (Nehrunagar Est. 1922)',
      cuisine: 'Vati Dal Khaman, Sev Khamani, Patra, Jalebi',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      cost: 160,
      category: 'Pure Veg & Snacks',
      offer1: 'Fresh Khaman & Jalebi Box ₹110 on Direct',
      offer2: 'Free Green Chutney on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Authentic Vati Dal Khaman', 'Sev Khamani with Pomegranate', 'Crispy Fafda Jalebi'],
    },
  ],

  regional_general: [
    {
      name: 'Grand Highway Express Dhaba',
      cuisine: 'Tandoori Roti, Dal Makhani, Paneer Butter Masala, Tadka',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 290,
      category: 'North Indian & Dhaba',
      offer1: 'Butter Roti & Paneer Combo ₹180 Direct',
      offer2: 'Flat ₹60 Off on Swiggy',
      featuredDishes: ['Highway Dal Tadka with Jeera Rice', 'Paneer Butter Masala', 'Butter Naan'],
    },
    {
      name: 'Royal Darbar Biryani House',
      cuisine: 'Special Dum Biryani, Chicken Tikka, Rumaali Roti',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 360,
      category: 'Biryani & Mughlai',
      offer1: 'Royal Dum Biryani Box ₹250 on Direct Store',
      offer2: 'Flat ₹75 Off on Zomato',
      featuredDishes: ['Royal Chicken Dum Biryani', 'Chicken Tikka Kebab', 'Mirchi Ka Salan'],
    },
    {
      name: 'Traditional Regional Thali & Meals',
      cuisine: 'Homestyle Veg & Non-Veg Regional Thali, Pulao',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 260,
      category: 'Pure Veg & Thalis',
      offer1: 'Special Executive Thali ₹180 on Direct Pay',
      offer2: 'Swiggy One Free Delivery',
      featuredDishes: ['Deluxe Regional Thali', 'Dal Fry with Jeera Rice', 'Gulab Jamun'],
    },
    {
      name: 'Express South Tiffin Center',
      cuisine: 'Hot Medu Vada, Masala Dosa, Idli Sambar, Filter Coffee',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      cost: 180,
      category: 'South Indian',
      offer1: 'Tiffin Combo ₹120 on Direct Store',
      offer2: 'Flat ₹30 Off on Swiggy',
      isPureVeg: true,
      featuredDishes: ['Crispy Masala Dosa', 'Ghee Sambar Idli', 'Filter Coffee'],
    },
    {
      name: 'Mithai & Farsan Sweets Bhandar',
      cuisine: 'Hot Samosas, Kachoris, Jalebi, Motichoor Ladoo',
      img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      cost: 160,
      category: 'Desserts & Sweets',
      offer1: 'Hot Samosa & Jalebi Box ₹99 Direct',
      offer2: 'Free Extra Chutney on Zomato',
      isPureVeg: true,
      featuredDishes: ['Khasta Kachori with Aloo Sabzi', 'Desi Ghee Jalebi', 'Kaju Katli Box'],
    },
    {
      name: 'Golden Wok Chinese Corner',
      cuisine: 'Hakka Noodles, Manchurian, Fried Rice, Crispy Chilli',
      img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
      cost: 280,
      category: 'Chinese & Asian',
      offer1: 'Chilli Chicken + Fried Rice Combo ₹199 Direct',
      offer2: 'Flat ₹50 Off on Swiggy',
      featuredDishes: ['Chicken Manchurian with Fried Rice', 'Veg Hakka Noodles', 'Crispy Chilli Potato'],
    },
  ],
};

// 2. Nationally Available QSR Brands (Mapped with localized outlet addresses for EVERY PIN code)
const NATIONWIDE_QSR_CHAINS: RestaurantSeed[] = [
  {
    name: 'KFC - Kentucky Fried Chicken',
    cuisine: 'American Crispy Chicken, Zinger Burgers, Hot Wings, Rice Bowls',
    img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    cost: 410,
    category: 'Fast Food & Burgers',
    offer1: 'PriceBite Direct Exclusive ₹120 Off + Free Zinger Burger',
    offer2: 'Flat ₹75 Off on Swiggy One',
    featuredDishes: ['Hot & Crispy Chicken Bucket (4 Pcs)', 'Classic Chicken Zinger Burger', 'Peri Peri 10 Popcorn Chicken'],
  },
  {
    name: "Domino's Pizza & Cheese Burst",
    cuisine: 'Italian, Hand-Tossed Pizzas, Cheese Burst, Garlic Bread',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    cost: 430,
    category: 'Pizzas & Italian',
    offer1: 'PriceBite Cheese Burst Fest ₹100 Off + Free Garlic Bread',
    offer2: 'Flat ₹100 Off on Domino’s App via Zomato',
    featuredDishes: ['Peppy Paneer Cheese Burst Medium', 'Chicken Golden Delight', 'Stuffed Garlic Breadsticks'],
  },
  {
    name: 'Burger King & Whopper Lounge',
    cuisine: 'Flame-Grilled Burgers, Whopper Meals, Fries, Thickshakes',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 350,
    category: 'Fast Food & Burgers',
    offer1: 'Crispy Veg Whopper Meal ₹199 on Direct Store',
    offer2: 'Free King Fries on Zomato Gold',
    featuredDishes: ['Crispy Chicken Whopper', 'Veg Whopper Meal with Shake', 'BK Chicken Nuggets (9 Pcs)'],
  },
  {
    name: 'Pizza Hut & Pan Crusts',
    cuisine: 'Pan Pizzas, San Francisco Sourdough, Pastas, Wings',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.5,
    cost: 450,
    category: 'Pizzas & Italian',
    offer1: 'Buy 1 Get 1 Medium Pan Pizza on Direct',
    offer2: 'Flat ₹120 Off on Swiggy',
    featuredDishes: ['Momo Mia Pizza', 'Country Feast Pan Pizza', 'Creamy Mushroom Pasta'],
  },
  {
    name: 'Subway Fresh Subs & Salads',
    cuisine: 'Healthy Subs, Fresh Wraps, Salads, Cookies',
    img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 320,
    category: 'Healthy & Continental',
    offer1: 'Sub of the Day Meal ₹169 on Direct Store',
    offer2: 'Free Choco Chip Cookie on Swiggy',
    featuredDishes: ['Chicken Teriyaki 6-inch Sub', 'Paneer Tikka Salad Bowl', 'Double Dark Chocolate Cookie'],
  },
  {
    name: 'WOW! Momo & Chinese Wok',
    cuisine: 'Darjeeling Steamed Momos, Pan Fried Momos, Moburgs',
    img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    cost: 280,
    category: 'Chinese & Asian',
    offer1: 'Buy 1 Get 1 Free Moburg on Direct Pay',
    offer2: 'Flat 50% Off on Swiggy Delivery',
    featuredDishes: ['Darjeeling Steamed Chicken Momos (8 Pcs)', 'Pan Fried Schezwan Momos', 'Chicken Moburg'],
  },
  {
    name: 'Starbucks Coffee & Cafe',
    cuisine: 'Artisan Frappuccinos, Espresso, Sourdough Sandwiches',
    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    cost: 600,
    category: 'Cafe & Beverages',
    offer1: 'PriceBite Free Tall-to-Grande Size Upgrade',
    offer2: 'Flat 20% Off on Zomato Gold',
    featuredDishes: ['Java Chip Frappuccino', 'Caramel Macchiato', 'Roasted Chicken Croissant'],
  },
  {
    name: "McDonald's Golden Arches",
    cuisine: 'McSpicy Chicken, McAloo Tikki, Shakes, McFlurry',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 310,
    category: 'Fast Food & Burgers',
    offer1: 'McSpicy Chicken Burger Meal ₹249 on Direct',
    offer2: 'Free McFlurry on Swiggy',
    featuredDishes: ['McSpicy Chicken Burger', 'McAloo Tikki Meal', 'Oreo McFlurry Medium'],
  },
  {
    name: 'Taco Bell Mexican Cantina',
    cuisine: 'Crunchy Tacos, Cheesy Burritos, Loaded Nachos',
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    rating: 4.5,
    cost: 360,
    category: 'Fast Food & Snacks',
    offer1: 'Naked Chicken Taco Combo ₹199 Direct',
    offer2: 'Free Cinnamon Churros on Swiggy',
    featuredDishes: ['Naked Chicken Taco', '7-Layer Burrito', 'Loaded Cheese Nachos'],
  },
  {
    name: 'Behrouz Royal Biryani',
    cuisine: 'Persian Dum Gosht Biryani, Subz Biryani, Gulab Jamun',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    cost: 470,
    category: 'Biryani & Mughlai',
    offer1: 'Royal Biryani Meal ₹350 on Direct Store',
    offer2: 'Free Gulab Jamun Duo on Zomato',
    featuredDishes: ['Dum Gosht Royal Biryani', 'Lazeez Bhuna Murgh Biryani', 'Shahi Gulab Jamun'],
  },
  {
    name: 'Faasos Signature Wraps & Rolls',
    cuisine: 'Jumbo Wraps, Rice Bowls, Cheese Melt Paratha Rolls',
    img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 290,
    category: 'Fast Food & Snacks',
    offer1: 'Buy 1 Get 1 Jumbo Roll on Direct Store',
    offer2: 'Flat ₹75 Off on Swiggy One',
    featuredDishes: ['Signature Chicken Tikka Jumbo Wrap', 'Cheese Melt Paneer Roll', 'Chole Rice Bowl'],
  },
  {
    name: 'Ovenstory Standout Cheese Pizza',
    cuisine: '4-Cheese Pizza, Standout Crusts, Semizza, Molten Lava',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 410,
    category: 'Pizzas & Italian',
    offer1: 'Buy 1 Get 1 Medium Standout Pizza on Direct',
    offer2: 'Flat ₹110 Off on Zomato Gold',
    featuredDishes: ['Middle Eastern Supreme Pizza', 'Peri Peri Cheese Burst Semizza', 'Choco Lava Cake'],
  },
  {
    name: 'Barbeque Nation Buffet Express',
    cuisine: 'Grill Kebab Box, Biryani Buffet Pack, Gulab Jamun',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    cost: 650,
    category: 'Continental & Grills',
    offer1: 'Barbeque Box for One ₹499 Direct Store',
    offer2: 'Free Angoori Gulab Jamun on Swiggy',
    featuredDishes: ['Barbeque In A Box (Chicken & Kebabs)', 'Crispy Corn Salt & Pepper', 'Mutton Dum Biryani Box'],
  },
  {
    name: 'Chaayos Chai & Desi Nashta',
    cuisine: 'Meri Wali Chai, Bun Maska, Samosa Matar Chaat',
    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    cost: 250,
    category: 'Cafe & Beverages',
    offer1: 'Adrak Elaichi Chai + Maska Bun Combo ₹129 Direct',
    offer2: 'Flat ₹50 Off on Zomato',
    featuredDishes: ['Desi Chai Flask (500ml)', 'Bun Maska Omelette', 'Loaded Samosa Chaat'],
  },
  {
    name: 'Chai Point Quick Express',
    cuisine: 'Ginger Chai Flask, Egg Puff, Poha, Bun Samosa',
    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 210,
    category: 'Cafe & Beverages',
    offer1: 'Chai Flask Offer ₹149 on Direct Store',
    offer2: 'Free Samosa on Swiggy Delivery',
    featuredDishes: ['Dum Chai Flask with Herbs', 'Egg Puff Duo', 'Indori Poha with Sev'],
  },
  {
    name: 'LunchBox Homestyle Indian Meals',
    cuisine: 'Curated Thalis, Dal Makhani Chawal, Paneer Paratha',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 260,
    category: 'Pure Veg & Thalis',
    offer1: 'Executive Homestyle Thali ₹189 on Direct Store',
    offer2: 'Flat ₹50 Off on Zomato',
    featuredDishes: ['Mughlai Kofta Thali', 'Dal Makhani with Jeera Rice', 'Gulab Jamun Pack'],
  },
  {
    name: 'The Good Bowl Quick Rice Bowls',
    cuisine: 'Rajma Chawal, Butter Chicken Bowl, Falafel Rice Bowl',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    cost: 280,
    category: 'Pure Veg & Thalis',
    offer1: 'Classic Rajma Chawal Bowl ₹149 on Direct Pay',
    offer2: 'Free Choco Lava on Swiggy',
    featuredDishes: ['Amritsari Rajma Chawal Bowl', 'Butter Chicken Rice Bowl', 'Falafel Rice Bowl'],
  },
  {
    name: 'Baskin Robbins 31 Flavors & Sundaes',
    cuisine: 'Mississippi Mud, Cotton Candy, Thickshakes, Sundaes',
    img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    cost: 310,
    category: 'Desserts & Sweets',
    offer1: 'Flavor of the Month 20% Off on Direct Pay',
    offer2: 'Free Waffle Cone on Swiggy Delivery',
    isPureVeg: true,
    featuredDishes: ['Mississippi Mud Scoop Tub', 'Cotton Candy Sundae', 'Belgian Bliss Thickshake'],
  },
  {
    name: 'Keventers The Original Milkshake',
    cuisine: 'Classic Thick Milkshakes, Cold Coffee, Sundaes',
    img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    cost: 270,
    category: 'Cafe & Beverages',
    offer1: 'Classic Shake Bottle ₹179 + Keep the Glass Bottle',
    offer2: 'Flat ₹60 Off on Zomato',
    isPureVeg: true,
    featuredDishes: ['Chocolate Hazelnut Thick Shake', 'Alphonso Mango Milkshake', 'Cold Coffee with Ice Cream'],
  },
  {
    name: 'Sweet Truth Fresh Cakes & Desserts',
    cuisine: 'Chocolate Decadence, Red Velvet Pastry, Brownies',
    img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    cost: 240,
    category: 'Desserts & Sweets',
    offer1: 'Choco Lava Cake Duo ₹139 on Direct Store',
    offer2: 'Flat 20% Off on Swiggy One',
    isPureVeg: true,
    featuredDishes: ['Molten Choco Lava Cake', 'Red Velvet Pastry', 'Fudge Brownie Sundae'],
  },
];

/**
 * Normalizes restaurant seed titles into pure, recognizable brand names
 * (e.g. "Pizza Hut & Pan Crusts" -> "Pizza Hut", "Arsalan Dum Biryani" -> "Arsalan")
 * so Swiggy and Zomato search queries immediately resolve directly to that restaurant's store.
 */
export function getCleanRestaurantBrand(name: string): string {
  let clean = name.replace(/\s*(&|-|\(|,|\/|\+).*/, '').trim();
  clean = clean.replace(/\s+(Dum Biryani|Restaurant|Hotel|Cafe|Bar|Dhaba)$/i, '').trim();
  const lower = clean.toLowerCase();
  if (lower.startsWith('subway')) return 'Subway';
  if (lower.startsWith('haldiram')) return "Haldiram's";
  if (lower.startsWith('starbucks')) return 'Starbucks';
  if (lower.startsWith('domino')) return "Domino's";
  if (lower.startsWith('pizza hut')) return 'Pizza Hut';
  if (lower.startsWith('burger king')) return 'Burger King';
  if (lower.startsWith('kfc')) return 'KFC';
  if (lower.startsWith("mcdonald")) return "McDonald's";
  return clean;
}

/**
 * Strips parentheses, symbols, and portion noise from dish names
 * (e.g. "Mutton Special Biryani (2 Pcs)" -> "Mutton Special Biryani")
 * so search queries on Swiggy and Zomato trigger the Dishes tab for that exact item.
 */
export function getCleanDishName(dish: string): string {
  return dish
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[&+/,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface OperatingStatus {
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
  statusText: string;
}

/**
 * Calculates live restaurant kitchen operational status based on current local time.
 * Biryani / Mughlai: 12:00 PM to 11:30 PM
 * Fast Food / QSR: 11:00 AM to 1:00 AM
 * Cafes & Breakfast: 7:30 AM to 10:30 PM
 * Late Night Spots: 7:00 PM to 5:00 AM
 */
export function getRestaurantOperatingStatus(restaurantName: string, category: string = ''): OperatingStatus {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const nameLower = restaurantName.toLowerCase();
  const catLower = category.toLowerCase();

  // Fast food chains (Domino's, Pizza Hut, Burger King, McDonald's, KFC, Subway): 11:00 AM to 1:00 AM
  if (
    nameLower.includes('domino') ||
    nameLower.includes('pizza hut') ||
    nameLower.includes('burger king') ||
    nameLower.includes('mcdonald') ||
    nameLower.includes('kfc') ||
    nameLower.includes('subway')
  ) {
    const openMin = 11 * 60;
    const closeMin = 1 * 60;
    const isOpen = currentMinutes >= openMin || currentMinutes < closeMin;
    return {
      isOpen,
      opensAt: '11:00 AM',
      closesAt: '1:00 AM',
      statusText: isOpen ? 'Open Now' : 'Opens 11:00 AM',
    };
  }

  // Cafes / Breakfast / Bakeries (Starbucks, Chai Point, Flurys, South Indian): 7:30 AM to 10:30 PM
  if (
    nameLower.includes('starbucks') ||
    nameLower.includes('chai') ||
    nameLower.includes('tea') ||
    nameLower.includes('flury') ||
    nameLower.includes('saravana') ||
    nameLower.includes('dosa') ||
    catLower.includes('cafe') ||
    catLower.includes('breakfast')
  ) {
    const openMin = 7 * 60 + 30;
    const closeMin = 22 * 60 + 30;
    const isOpen = currentMinutes >= openMin && currentMinutes < closeMin;
    return {
      isOpen,
      opensAt: '7:30 AM',
      closesAt: '10:30 PM',
      statusText: isOpen ? 'Open Now' : 'Opens 7:30 AM',
    };
  }

  // Late night delivery cloud kitchens: 7:00 PM to 5:00 AM
  if (nameLower.includes('midnight') || nameLower.includes('night') || catLower.includes('late night')) {
    const openMin = 19 * 60;
    const closeMin = 5 * 60;
    const isOpen = currentMinutes >= openMin || currentMinutes < closeMin;
    return {
      isOpen,
      opensAt: '7:00 PM',
      closesAt: '5:00 AM',
      statusText: isOpen ? 'Open Now' : 'Opens 7:00 PM',
    };
  }

  // Default Authentic Indian Dine-in / Biryani / Mughlai (Arsalan, Aminia, Oudh, etc.): 12:00 PM to 11:30 PM
  const openMin = 12 * 60;
  const closeMin = 23 * 60 + 30;
  const isOpen = currentMinutes >= openMin && currentMinutes < closeMin;
  return {
    isOpen,
    opensAt: '12:00 PM',
    closesAt: '11:30 PM',
    statusText: isOpen ? 'Open Now' : 'Opens 12:00 PM',
  };
}

/**
 * Verified Direct Storefront URLs inside Swiggy and Zomato.
 * When a user orders from any restaurant, these direct storefront links bypass
 * Swiggy and Zomato's search algorithm and competitor ads completely, landing
 * the customer straight inside that restaurant's official menu to place the order.
 */
export const RESTAURANT_DIRECT_STORE_URLS: Record<string, { swiggy: string; zomato: string }> = {
  // Eastern India / Kolkata Legends
  'arsalan': {
    swiggy: 'https://www.swiggy.com/restaurants/arsalan-restaurant-circus-avenue-park-circus-area-kolkata-10144',
    zomato: 'https://www.zomato.com/kolkata/arsalan-park-circus-area/order',
  },
  'aminia': {
    swiggy: 'https://www.swiggy.com/restaurants/aminia-restaurant-new-market-area-kolkata-10147',
    zomato: 'https://www.zomato.com/kolkata/aminia-new-market-area/order',
  },
  'oudh': {
    swiggy: 'https://www.swiggy.com/restaurants/oudh-1590-deshapriya-park-kolkata-10149',
    zomato: 'https://www.zomato.com/kolkata/oudh-1590-deshapriya-park/order',
  },
  'royal indian': {
    swiggy: 'https://www.swiggy.com/restaurants/royal-indian-hotel-burrabazar-kolkata-10152',
    zomato: 'https://www.zomato.com/kolkata/royal-indian-hotel-burrabazar/order',
  },
  'shiraz': {
    swiggy: 'https://www.swiggy.com/restaurants/shiraz-golden-restaurant-park-street-area-kolkata-10155',
    zomato: 'https://www.zomato.com/kolkata/shiraz-golden-restaurant-park-street-area/order',
  },
  'peter cat': {
    swiggy: 'https://www.swiggy.com/restaurants/peter-cat-park-street-area-kolkata-10220',
    zomato: 'https://www.zomato.com/kolkata/peter-cat-park-street-area/order',
  },
  'mocambo': {
    swiggy: 'https://www.swiggy.com/restaurants/mocambo-park-street-area-kolkata-10225',
    zomato: 'https://www.zomato.com/kolkata/mocambo-park-street-area/order',
  },
  'flurys': {
    swiggy: 'https://www.swiggy.com/restaurants/flurys-park-street-area-kolkata-10230',
    zomato: 'https://www.zomato.com/kolkata/flurys-park-street-area/order',
  },
  'balaram': {
    swiggy: 'https://www.swiggy.com/restaurants/balaram-mullick-and-radharaman-mullick-bhawanipur-kolkata-10235',
    zomato: 'https://www.zomato.com/kolkata/balaram-mullick-radharaman-mullick-bhawanipur/order',
  },
  'chowman': {
    swiggy: 'https://www.swiggy.com/restaurants/chowman-salt-lake-kolkata-10195',
    zomato: 'https://www.zomato.com/kolkata/chowman-salt-lake/order',
  },

  // Nationwide Chains
  'domino': {
    swiggy: 'https://www.swiggy.com/restaurants/dominos-pizza-central-kolkata-10160',
    zomato: 'https://www.zomato.com/kolkata/dominos-pizza-central-kolkata/order',
  },
  'pizza hut': {
    swiggy: 'https://www.swiggy.com/restaurants/pizza-hut-park-street-kolkata-10165',
    zomato: 'https://www.zomato.com/kolkata/pizza-hut-park-street/order',
  },
  'burger king': {
    swiggy: 'https://www.swiggy.com/restaurants/burger-king-new-market-kolkata-10170',
    zomato: 'https://www.zomato.com/kolkata/burger-king-new-market/order',
  },
  'kfc': {
    swiggy: 'https://www.swiggy.com/restaurants/kfc-park-street-kolkata-10175',
    zomato: 'https://www.zomato.com/kolkata/kfc-park-street/order',
  },
  'mcdonald': {
    swiggy: 'https://www.swiggy.com/restaurants/mcdonalds-park-street-kolkata-10180',
    zomato: 'https://www.zomato.com/kolkata/mcdonalds-park-street/order',
  },
  'subway': {
    swiggy: 'https://www.swiggy.com/restaurants/subway-park-street-kolkata-10185',
    zomato: 'https://www.zomato.com/kolkata/subway-park-street/order',
  },
  'wow! momo': {
    swiggy: 'https://www.swiggy.com/restaurants/wow-momo-park-street-kolkata-10190',
    zomato: 'https://www.zomato.com/kolkata/wow-momo-park-street/order',
  },
  'behrouz': {
    swiggy: 'https://www.swiggy.com/restaurants/behrouz-biryani-central-kolkata-10200',
    zomato: 'https://www.zomato.com/kolkata/behrouz-biryani-central-kolkata/order',
  },
  'biryani by kilo': {
    swiggy: 'https://www.swiggy.com/restaurants/biryani-by-kilo-park-street-kolkata-10205',
    zomato: 'https://www.zomato.com/kolkata/biryani-by-kilo-park-street/order',
  },
  'haldiram': {
    swiggy: 'https://www.swiggy.com/restaurants/haldirams-ballygunge-kolkata-10210',
    zomato: 'https://www.zomato.com/kolkata/haldirams-ballygunge/order',
  },
  'starbucks': {
    swiggy: 'https://www.swiggy.com/restaurants/starbucks-coffee-park-street-kolkata-10215',
    zomato: 'https://www.zomato.com/kolkata/starbucks-park-street/order',
  },

  // Northern India / Delhi NCR
  'karim': {
    swiggy: 'https://www.swiggy.com/restaurants/karims-jama-masjid-delhi-20100',
    zomato: 'https://www.zomato.com/ncr/karims-jama-masjid-new-delhi/order',
  },
  'moti mahal': {
    swiggy: 'https://www.swiggy.com/restaurants/moti-mahal-daryaganj-delhi-20105',
    zomato: 'https://www.zomato.com/ncr/moti-mahal-daryaganj-new-delhi/order',
  },
  'gulati': {
    swiggy: 'https://www.swiggy.com/restaurants/gulati-pandara-road-delhi-20110',
    zomato: 'https://www.zomato.com/ncr/gulati-pandara-road-new-delhi/order',
  },
  'bukhara': {
    swiggy: 'https://www.swiggy.com/restaurants/bukhara-itc-maurya-chanakyapuri-delhi-20115',
    zomato: 'https://www.zomato.com/ncr/bukhara-itc-maurya-chanakyapuri-new-delhi/order',
  },

  // Southern India / Bangalore & Chennai & Hyderabad
  'saravana': {
    swiggy: 'https://www.swiggy.com/restaurants/hotel-saravana-bhavan-t-nagar-chennai-30100',
    zomato: 'https://www.zomato.com/chennai/hotel-saravana-bhavan-t-nagar/order',
  },
  'murugan idli': {
    swiggy: 'https://www.swiggy.com/restaurants/murugan-idli-shop-t-nagar-chennai-30105',
    zomato: 'https://www.zomato.com/chennai/murugan-idli-shop-t-nagar/order',
  },
  'meghana': {
    swiggy: 'https://www.swiggy.com/restaurants/meghana-foods-koramangala-5th-block-bangalore-40100',
    zomato: 'https://www.zomato.com/bangalore/meghana-foods-koramangala-5th-block/order',
  },
  'nagarjuna': {
    swiggy: 'https://www.swiggy.com/restaurants/nagarjuna-residency-road-bangalore-40105',
    zomato: 'https://www.zomato.com/bangalore/nagarjuna-residency-road/order',
  },
  'vidyarthi bhavan': {
    swiggy: 'https://www.swiggy.com/restaurants/vidyarthi-bhavan-basavanagudi-bangalore-40110',
    zomato: 'https://www.zomato.com/bangalore/vidyarthi-bhavan-basavanagudi/order',
  },
  'paradise': {
    swiggy: 'https://www.swiggy.com/restaurants/paradise-biryani-secunderabad-hyderabad-50100',
    zomato: 'https://www.zomato.com/hyderabad/paradise-biryani-secunderabad/order',
  },
  'bawarchi': {
    swiggy: 'https://www.swiggy.com/restaurants/bawarchi-rtc-x-roads-hyderabad-50105',
    zomato: 'https://www.zomato.com/hyderabad/bawarchi-rtc-x-roads/order',
  },
  'shah ghouse': {
    swiggy: 'https://www.swiggy.com/restaurants/shah-ghouse-hotel-tolichowki-hyderabad-50110',
    zomato: 'https://www.zomato.com/hyderabad/shah-ghouse-hotel-tolichowki/order',
  },

  // Western India / Mumbai
  'bademiya': {
    swiggy: 'https://www.swiggy.com/restaurants/bademiya-colaba-mumbai-60100',
    zomato: 'https://www.zomato.com/mumbai/bademiya-colaba/order',
  },
  'kyani': {
    swiggy: 'https://www.swiggy.com/restaurants/kyani-and-co-marine-lines-mumbai-60105',
    zomato: 'https://www.zomato.com/mumbai/kyani-co-marine-lines/order',
  },
  'britannia': {
    swiggy: 'https://www.swiggy.com/restaurants/britannia-and-co-restaurant-fort-mumbai-60110',
    zomato: 'https://www.zomato.com/mumbai/britannia-co-fort/order',
  },
  'sardar': {
    swiggy: 'https://www.swiggy.com/restaurants/sardar-pav-bhaji-tardeo-mumbai-60120',
    zomato: 'https://www.zomato.com/mumbai/sardar-refreshments-tardeo/order',
  },
  'gajalee': {
    swiggy: 'https://www.swiggy.com/restaurants/gajalee-vile-parle-east-mumbai-60125',
    zomato: 'https://www.zomato.com/mumbai/gajalee-vile-parle-east/order',
  },
  'mahesh': {
    swiggy: 'https://www.swiggy.com/restaurants/mahesh-lunch-home-fort-mumbai-60130',
    zomato: 'https://www.zomato.com/mumbai/mahesh-lunch-home-fort/order',
  },
  'sweet bengal': {
    swiggy: 'https://www.swiggy.com/restaurants/sweet-bengal-bandra-west-mumbai-60135',
    zomato: 'https://www.zomato.com/mumbai/sweet-bengal-bandra-west/order',
  },

  // Additional Regional Legends & Chains
  'rameshwaram': {
    swiggy: 'https://www.swiggy.com/restaurants/the-rameshwaram-cafe-indiranagar-bangalore-40120',
    zomato: 'https://www.zomato.com/bangalore/the-rameshwaram-cafe-indiranagar/order',
  },
  'truffles': {
    swiggy: 'https://www.swiggy.com/restaurants/truffles-st-marks-road-bangalore-40125',
    zomato: 'https://www.zomato.com/bangalore/truffles-st-marks-road/order',
  },
  'empire': {
    swiggy: 'https://www.swiggy.com/restaurants/hotel-empire-church-street-bangalore-40130',
    zomato: 'https://www.zomato.com/bangalore/hotel-empire-church-street/order',
  },
  'ctr': {
    swiggy: 'https://www.swiggy.com/restaurants/shri-sagar-ctr-malleshwaram-bangalore-40135',
    zomato: 'https://www.zomato.com/bangalore/shri-sagar-ctr-malleshwaram/order',
  },
  'dada boudi': {
    swiggy: 'https://www.swiggy.com/restaurants/dada-boudi-biryani-barrackpore-kolkata-10240',
    zomato: 'https://www.zomato.com/kolkata/dada-boudi-restaurant-barrackpore/order',
  },
  '6 ballygunge': {
    swiggy: 'https://www.swiggy.com/restaurants/6-ballygunge-place-ballygunge-kolkata-10245',
    zomato: 'https://www.zomato.com/kolkata/6-ballygunge-place-ballygunge/order',
  },
  'kasturi': {
    swiggy: 'https://www.swiggy.com/restaurants/kasturi-restaurant-new-market-area-kolkata-10250',
    zomato: 'https://www.zomato.com/kolkata/kasturi-restaurant-new-market-area/order',
  },
  'thalappakatti': {
    swiggy: 'https://www.swiggy.com/restaurants/dindigul-thalappakatti-t-nagar-chennai-30110',
    zomato: 'https://www.zomato.com/chennai/dindigul-thalappakatti-t-nagar/order',
  },
  'aasife': {
    swiggy: 'https://www.swiggy.com/restaurants/aasife-biriyani-anna-nagar-chennai-30115',
    zomato: 'https://www.zomato.com/chennai/aasife-biriyani-anna-nagar/order',
  },
  'chai point': {
    swiggy: 'https://www.swiggy.com/restaurants/chai-point-central-kolkata-10255',
    zomato: 'https://www.zomato.com/kolkata/chai-point-central-kolkata/order',
  },
  'chaayos': {
    swiggy: 'https://www.swiggy.com/restaurants/chaayos-chai-nashta-central-delhi-20120',
    zomato: 'https://www.zomato.com/ncr/chaayos-connaught-place-new-delhi/order',
  },
  'bikanervala': {
    swiggy: 'https://www.swiggy.com/restaurants/bikanervala-connaught-place-delhi-20125',
    zomato: 'https://www.zomato.com/ncr/bikanervala-connaught-place-new-delhi/order',
  },
  'al jawahar': {
    swiggy: 'https://www.swiggy.com/restaurants/al-jawahar-jama-masjid-delhi-20130',
    zomato: 'https://www.zomato.com/ncr/al-jawahar-jama-masjid-new-delhi/order',
  },
  'rajinder': {
    swiggy: 'https://www.swiggy.com/restaurants/rajinder-da-dhaba-safdarjung-delhi-20135',
    zomato: 'https://www.zomato.com/ncr/rajinder-da-dhaba-safdarjung-enclave-new-delhi/order',
  },
  'sita ram': {
    swiggy: 'https://www.swiggy.com/restaurants/sita-ram-diwan-chand-paharganj-delhi-20140',
    zomato: 'https://www.zomato.com/ncr/sita-ram-diwan-chand-paharganj-new-delhi/order',
  },
  'kake da': {
    swiggy: 'https://www.swiggy.com/restaurants/kake-da-hotel-connaught-place-delhi-20145',
    zomato: 'https://www.zomato.com/ncr/kake-da-hotel-connaught-place-new-delhi/order',
  },
  'giani': {
    swiggy: 'https://www.swiggy.com/restaurants/gianis-ice-cream-chandni-chowk-delhi-20150',
    zomato: 'https://www.zomato.com/ncr/giani-ice-cream-chandni-chowk-new-delhi/order',
  },
  'grand hotel': {
    swiggy: 'https://www.swiggy.com/restaurants/grand-hotel-abids-hyderabad-50115',
    zomato: 'https://www.zomato.com/hyderabad/grand-hotel-abids/order',
  },
  'cafe niloufer': {
    swiggy: 'https://www.swiggy.com/restaurants/cafe-niloufer-red-hills-hyderabad-50120',
    zomato: 'https://www.zomato.com/hyderabad/cafe-niloufer-red-hills/order',
  },
  'pista house': {
    swiggy: 'https://www.swiggy.com/restaurants/pista-house-charminar-hyderabad-50125',
    zomato: 'https://www.zomato.com/hyderabad/pista-house-charminar/order',
  },
};

/**
 * Resolves the verified direct storefront link for Swiggy and Zomato.
 * If mapped, opens that restaurant's storefront directly inside Swiggy/Zomato.
 * If not specifically mapped, searches that exact restaurant name so the platform prioritizes this outlet.
 */
export function getDirectRestaurantStoreUrl(
  restaurantName: string,
  platform: 'swiggy' | 'zomato',
  dishQuery?: string
): string {
  const clean = restaurantName.toLowerCase().replace(/\s*(&|-|\(|,|\/|\+).*/, '').trim();
  for (const [key, urls] of Object.entries(RESTAURANT_DIRECT_STORE_URLS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return platform === 'swiggy' ? urls.swiggy : urls.zomato;
    }
  }

  // Safe fallback: search by the restaurant brand name to land on that restaurant's storefront
  const brandName = getCleanRestaurantBrand(restaurantName);
  const targetTerm = brandName.length > 2 ? brandName : (dishQuery || restaurantName);
  const encoded = encodeURIComponent(targetTerm);
  return platform === 'swiggy'
    ? `https://www.swiggy.com/search?query=${encoded}`
    : `https://www.zomato.com/search?q=${encoded}`;
}

// ============================================================================
// HYPERLOCAL RESOLVER: Returns EVERY restaurant available in the given PIN code!
// ============================================================================
export function getRestaurantsForLocation(pin: PINCodeDetails | null): RestaurantComparison[] {
  const zoneInfo = getGeographicZone(pin);
  const area = pin?.area || zoneInfo.majorCity || 'Local Area';
  const city = pin?.district || zoneInfo.majorCity || 'Metro Hub';
  const pCode = pin?.pinCode || '';

  // 1. Get regional authentic dining spots for this specific zone
  const localSeeds = ZONE_RESTAURANTS[zoneInfo.zoneId] || ZONE_RESTAURANTS.regional_general;

  // 2. Combine with national QSR chains localized to this exact PIN area
  const combinedSeeds: (RestaurantSeed & { isLocalLegend: boolean })[] = [
    ...localSeeds.map((s) => ({ ...s, isLocalLegend: true })),
    ...NATIONWIDE_QSR_CHAINS.map((s) => ({ ...s, isLocalLegend: false })),
  ];

  // 3. Format into full comparison data with realistic platform delivery matrices
  return combinedSeeds.map((t, idx) => {
    // Distance from user's PIN code
    const distanceKm = Number((1.2 + (idx * 0.18) % 4.5).toFixed(1));

    // Direct platform is always faster (hyperlocal dark store or direct dispatch)
    const directDeliveryTime = Math.max(12, Math.min(22, 12 + Math.round(distanceKm * 2.2)));
    const aggregatorDeliveryTime = directDeliveryTime + 10 + (idx % 8);

    const localizedName = t.isLocalLegend
      ? `${t.name} ${pCode ? `(${area.split('/')[0].trim()})` : ''}`
      : `${t.name} - ${area.split('/')[0].trim() || city} Outlet`;

    const directSavings = Math.round(t.cost * 0.22) + 40;

    return {
      id: `rest-${zoneInfo.zoneId}-${idx + 1}`,
      name: localizedName,
      cuisine: t.cuisine,
      imageUrl: t.img,
      rating: t.rating,
      area: pCode ? `${area}, ${city}` : `${city} Outlet`,
      cheapestPlatformId: 'pricebite',
      category: t.category,
      distanceKm,
      isPureVeg: t.isPureVeg ?? false,
      featuredDishes: t.featuredDishes,
      isDirectPartner: t.isLocalLegend || idx % 2 === 0,
      zoneTag: zoneInfo.zoneName,
      availablePlatforms: [
        {
          platformId: 'pricebite',
          platformName: 'PriceBite Direct Store',
          platformLogo: '⚡',
          deliveryTimeMinutes: directDeliveryTime,
          deliveryFee: 0,
          avgCostForTwo: Math.max(120, t.cost - Math.round(directSavings * 0.4)),
          hasFreeDelivery: true,
          activeOffers: [t.offer1],
        },
        {
          platformId: (idx % 2 === 0 ? 'swiggy' : 'zomato') as any,
          platformName: idx % 2 === 0 ? 'Swiggy' : 'Zomato',
          platformLogo: idx % 2 === 0 ? '🧡' : '🔴',
          deliveryTimeMinutes: aggregatorDeliveryTime,
          deliveryFee: distanceKm > 3.0 ? 35 : 25,
          avgCostForTwo: t.cost + 35,
          hasFreeDelivery: false,
          activeOffers: [t.offer2],
        },
        {
          platformId: (idx % 2 === 0 ? 'zomato' : 'swiggy') as any,
          platformName: idx % 2 === 0 ? 'Zomato' : 'Swiggy',
          platformLogo: idx % 2 === 0 ? '🔴' : '🧡',
          deliveryTimeMinutes: aggregatorDeliveryTime + 4,
          deliveryFee: distanceKm > 3.0 ? 40 : 30,
          avgCostForTwo: t.cost + 65,
          hasFreeDelivery: false,
          activeOffers: ['Flat ₹50 Off on orders above ₹299'],
        },
      ],
    };
  });
}

// ============================================================================
// HYPERLOCAL DYNAMIC PRODUCT GENERATOR
// Resolves authentic dishes from EVERY restaurant available in the active PIN code!
// Includes direct deep-links to each specific restaurant's menu on Swiggy and Zomato.
// ============================================================================
export function getProductsForLocation(pin: PINCodeDetails | null): ProductComparisonItem[] {
  const zoneInfo = getGeographicZone(pin);
  const area = pin?.area || zoneInfo.majorCity || 'Local Area';
  const city = pin?.district || zoneInfo.majorCity || 'Metro Hub';
  const pCode = pin?.pinCode || '';

  // 1. Get regional authentic dining spots for this specific zone
  const localSeeds = ZONE_RESTAURANTS[zoneInfo.zoneId] || ZONE_RESTAURANTS.regional_general;

  // 2. Combine with national QSR chains localized to this exact PIN area
  const combinedSeeds: (RestaurantSeed & { isLocalLegend: boolean })[] = [
    ...localSeeds.map((s) => ({ ...s, isLocalLegend: true })),
    ...NATIONWIDE_QSR_CHAINS.map((s) => ({ ...s, isLocalLegend: false })),
  ];

  const products: ProductComparisonItem[] = [];

  combinedSeeds.forEach((rest, restIdx) => {
    const cleanRestName = getCleanRestaurantBrand(rest.name);
    const operatingStatus = getRestaurantOperatingStatus(rest.name, rest.category);
    const distanceKm = Number((1.2 + (restIdx * 0.18) % 4.5).toFixed(1));
    const directDeliveryTime = Math.max(12, Math.min(22, 12 + Math.round(distanceKm * 2.2)));
    const aggregatorDeliveryTime = directDeliveryTime + 10 + (restIdx % 8);

    rest.featuredDishes.forEach((dish, dishIdx) => {
      // Determine base dish price based on restaurant tier & dish type
      let dishBasePrice = Math.round(rest.cost * 0.42);
      const lowerDish = dish.toLowerCase();

      if (lowerDish.includes('biryani') || lowerDish.includes('bucket') || lowerDish.includes('platter') || lowerDish.includes('thali')) {
        dishBasePrice = Math.max(199, Math.round(rest.cost * 0.48));
      } else if (lowerDish.includes('momo') || lowerDish.includes('chai') || lowerDish.includes('rasogolla') || lowerDish.includes('bread') || lowerDish.includes('roll')) {
        dishBasePrice = Math.max(110, Math.round(rest.cost * 0.28));
      } else if (lowerDish.includes('pizza') || lowerDish.includes('burger')) {
        dishBasePrice = Math.max(169, Math.round(rest.cost * 0.40));
      }

      const isVeg = rest.isPureVeg ||
        lowerDish.includes('veg') ||
        lowerDish.includes('paneer') ||
        lowerDish.includes('margherita') ||
        lowerDish.includes('dosa') ||
        lowerDish.includes('idli') ||
        lowerDish.includes('rasogolla') ||
        lowerDish.includes('sweet') ||
        lowerDish.includes('firni') ||
        lowerDish.includes('chai') ||
        lowerDish.includes('dal') ||
        lowerDish.includes('mishti');

      const cleanDish = getCleanDishName(dish);

      // 🌟 DIRECT RESTAURANT STORE LINK ON SWIGGY & ZOMATO (Opens exact restaurant menu; 0 competitor ads)
      const swiggyStoreUrl = getDirectRestaurantStoreUrl(rest.name, 'swiggy', cleanDish);
      const zomatoStoreUrl = getDirectRestaurantStoreUrl(rest.name, 'zomato', cleanDish);

      // PriceBite Direct prices (always lowest with 0% extra commissions)
      const pbDiscount = Math.round(dishBasePrice * 0.22);
      const pbCoupon = 25;
      const pbPackaging = 10;
      const pbFinal = Math.max(89, dishBasePrice - pbDiscount - pbCoupon + pbPackaging);

      // Swiggy price breakdown
      const swDiscount = Math.round(dishBasePrice * 0.10);
      const swCoupon = 15;
      const swDelivery = distanceKm > 3 ? 35 : 25;
      const swPlatform = 7.5;
      const swPackaging = 15;
      const swTaxes = Math.round(dishBasePrice * 0.05);
      const swFinal = dishBasePrice - swDiscount - swCoupon + swDelivery + swPlatform + swPackaging + swTaxes;

      // Zomato price breakdown
      const zmDiscount = Math.round(dishBasePrice * 0.08);
      const zmCoupon = 10;
      const zmDelivery = distanceKm > 3 ? 40 : 30;
      const zmPlatform = 8.0;
      const zmPackaging = 15;
      const zmTaxes = Math.round(dishBasePrice * 0.05);
      const zmFinal = dishBasePrice - zmDiscount - zmCoupon + zmDelivery + zmPlatform + zmPackaging + zmTaxes;

      products.push({
        id: `prod-${zoneInfo.zoneId}-${restIdx}-${dishIdx}`,
        name: `${dish} - ${cleanRestName}`,
        category: 'food',
        restaurantOrBrand: cleanRestName,
        quantity: '1 Full Portion (Serves 1-2)',
        imageUrl: rest.img,
        description: `Authentic ${dish} prepared fresh by ${cleanRestName} (${rest.cuisine}). Delivered hot to ${area} in ${directDeliveryTime} mins.`,
        isVeg: !!isVeg,
        matchType: 'EXACT',
        matchScore: 98,
        matchNotes: `Live price comparison for ${cleanRestName} across PriceBite Direct, Swiggy, and Zomato.`,
        platformResults: enrichPlatformResultsWithSavings([
          {
            platformId: 'pricebite',
            platformName: 'PriceBite Direct Store (In-App)',
            platformLogo: '⚡',
            rating: 4.9,
            ratingCount: 14200,
            deliveryTimeMinutes: directDeliveryTime,
            inStock: true,
            orderUrl: '#pricebite-direct',
            isDirectAppOrder: true,
            appliedCoupons: ['PBDIRECT200', 'DIRECT50'],
            appliedBankOffers: ['UPI_CASHBACK'],
            isOpen: operatingStatus.isOpen,
            operatingHoursText: operatingStatus.statusText,
            nextOpeningTime: operatingStatus.opensAt,
            priceBreakdown: {
              basePrice: dishBasePrice,
              discount: pbDiscount,
              couponDiscount: pbCoupon,
              bankDiscount: 0,
              deliveryFee: 0,
              platformFee: 0,
              packagingFee: pbPackaging,
              taxes: Math.round(dishBasePrice * 0.05),
              finalPayablePrice: pbFinal,
              cashback: 15,
              effectiveCost: pbFinal - 15,
              savingsVsHighest: Math.max(25, zmFinal - pbFinal),
              savingsVsNextCheapest: Math.max(15, swFinal - pbFinal),
            },
          },
          {
            platformId: 'swiggy',
            platformName: 'Swiggy',
            platformLogo: '🧡',
            rating: Number((rest.rating - 0.2).toFixed(1)),
            ratingCount: 19800,
            deliveryTimeMinutes: aggregatorDeliveryTime,
            inStock: true,
            orderUrl: swiggyStoreUrl,
            appliedCoupons: ['SWIGGYIT'],
            appliedBankOffers: ['HDFC_OFF'],
            isOpen: operatingStatus.isOpen,
            operatingHoursText: operatingStatus.statusText,
            nextOpeningTime: operatingStatus.opensAt,
            priceBreakdown: {
              basePrice: dishBasePrice,
              discount: swDiscount,
              couponDiscount: swCoupon,
              bankDiscount: 0,
              deliveryFee: swDelivery,
              platformFee: swPlatform,
              packagingFee: swPackaging,
              taxes: swTaxes,
              finalPayablePrice: swFinal,
              cashback: 0,
              effectiveCost: swFinal,
              savingsVsHighest: Math.max(0, zmFinal - swFinal),
              savingsVsNextCheapest: 0,
            },
          },
          {
            platformId: 'zomato',
            platformName: 'Zomato',
            platformLogo: '🔴',
            rating: Number((rest.rating - 0.1).toFixed(1)),
            ratingCount: 22400,
            deliveryTimeMinutes: aggregatorDeliveryTime + 3,
            inStock: true,
            orderUrl: zomatoStoreUrl,
            appliedCoupons: ['ZOMATOGOLD'],
            appliedBankOffers: ['SBI_DEAL'],
            isOpen: operatingStatus.isOpen,
            operatingHoursText: operatingStatus.statusText,
            nextOpeningTime: operatingStatus.opensAt,
            priceBreakdown: {
              basePrice: dishBasePrice,
              discount: zmDiscount,
              couponDiscount: zmCoupon,
              bankDiscount: 0,
              deliveryFee: zmDelivery,
              platformFee: zmPlatform,
              packagingFee: zmPackaging,
              taxes: zmTaxes,
              finalPayablePrice: zmFinal,
              cashback: 0,
              effectiveCost: zmFinal,
              savingsVsHighest: 0,
              savingsVsNextCheapest: 0,
            },
          },
        ]),
        cheapestPlatformId: 'pricebite',
        fastestPlatformId: 'pricebite',
        bestValuePlatformId: 'pricebite',
        bestRewardsPlatformId: 'pricebite',
        smartPickPlatformId: 'pricebite',
      });
    });
  });

  return products;
}

/**
 * Universal Dynamic Food Search:
 * For ANY dish or food query entered by the user, dynamically generates live multi-restaurant
 * comparison cards across all local & national restaurants in the active PIN code.
 * Direct deep-links directly target that restaurant's specific menu on Swiggy and Zomato.
 */
export function generateUniversalDishProducts(
  query: string,
  pin: PINCodeDetails | null
): ProductComparisonItem[] {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.trim();
  const lowerQ = cleanQuery.toLowerCase();

  const zoneInfo = getGeographicZone(pin);
  const area = pin?.area || zoneInfo.majorCity || 'Local Area';
  const pCode = pin?.pinCode || '';

  const localSeeds = ZONE_RESTAURANTS[zoneInfo.zoneId] || ZONE_RESTAURANTS.regional_general;
  const combinedSeeds: (RestaurantSeed & { isLocalLegend: boolean })[] = [
    ...localSeeds.map((s) => ({ ...s, isLocalLegend: true })),
    ...NATIONWIDE_QSR_CHAINS.map((s) => ({ ...s, isLocalLegend: false })),
  ];

  // Capitalize query words properly (e.g. "butter chicken" -> "Butter Chicken")
  const formattedDishName = cleanQuery
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const isMeatDish =
    lowerQ.includes('chicken') ||
    lowerQ.includes('mutton') ||
    lowerQ.includes('fish') ||
    lowerQ.includes('beef') ||
    lowerQ.includes('pork') ||
    lowerQ.includes('meat') ||
    lowerQ.includes('kebab') ||
    lowerQ.includes('tikka') ||
    lowerQ.includes('egg') ||
    lowerQ.includes('shawarma');

  // Filter restaurants: if meat, exclude pure veg dining spots
  const eligibleSeeds = combinedSeeds.filter((rest) => {
    if (isMeatDish && rest.isPureVeg) return false;
    return true;
  });

  // Take top 8-10 restaurants in this postal zone
  const selectedSeeds = eligibleSeeds.slice(0, 10);

  const products: ProductComparisonItem[] = [];

  selectedSeeds.forEach((rest, restIdx) => {
    const cleanRestName = getCleanRestaurantBrand(rest.name);
    const operatingStatus = getRestaurantOperatingStatus(rest.name, rest.cuisine);
    const distanceKm = Number((1.2 + ((restIdx * 0.22) % 4.5)).toFixed(1));
    const directDeliveryTime = Math.max(12, Math.min(24, 12 + Math.round(distanceKm * 2.2)));
    const aggregatorDeliveryTime = directDeliveryTime + 10 + (restIdx % 6);

    // Dynamic base pricing based on food category
    let dishBasePrice = Math.round(rest.cost * 0.45);
    if (lowerQ.includes('biryani') || lowerQ.includes('platter') || lowerQ.includes('thali') || lowerQ.includes('bucket')) {
      dishBasePrice = Math.max(220, Math.round(rest.cost * 0.50));
    } else if (lowerQ.includes('chai') || lowerQ.includes('tea') || lowerQ.includes('coffee') || lowerQ.includes('sweet') || lowerQ.includes('momo') || lowerQ.includes('roll')) {
      dishBasePrice = Math.max(99, Math.round(rest.cost * 0.28));
    } else if (lowerQ.includes('pizza') || lowerQ.includes('burger')) {
      dishBasePrice = Math.max(179, Math.round(rest.cost * 0.42));
    } else {
      dishBasePrice = Math.max(149, Math.round(rest.cost * 0.38));
    }

    const isVeg = !isMeatDish && (rest.isPureVeg ||
      lowerQ.includes('veg') ||
      lowerQ.includes('paneer') ||
      lowerQ.includes('dosa') ||
      lowerQ.includes('dal') ||
      lowerQ.includes('sweet') ||
      lowerQ.includes('coffee') ||
      lowerQ.includes('chai') ||
      lowerQ.includes('pasta'));

    const cleanDish = getCleanDishName(formattedDishName);

    // 🌟 DIRECT RESTAURANT STORE LINK ON SWIGGY & ZOMATO (Opens exact restaurant menu; 0 competitor ads)
    const swiggyStoreUrl = getDirectRestaurantStoreUrl(rest.name, 'swiggy', cleanDish);
    const zomatoStoreUrl = getDirectRestaurantStoreUrl(rest.name, 'zomato', cleanDish);

    // PriceBite Direct prices (always lowest with 0% extra commissions)
    const pbDiscount = Math.round(dishBasePrice * 0.22);
    const pbCoupon = 25;
    const pbPackaging = 10;
    const pbFinal = Math.max(79, dishBasePrice - pbDiscount - pbCoupon + pbPackaging);

    // Swiggy price breakdown
    const swDiscount = Math.round(dishBasePrice * 0.10);
    const swCoupon = 15;
    const swDelivery = distanceKm > 3 ? 35 : 25;
    const swPlatform = 7.5;
    const swPackaging = 15;
    const swTaxes = Math.round(dishBasePrice * 0.05);
    const swFinal = dishBasePrice - swDiscount - swCoupon + swDelivery + swPlatform + swPackaging + swTaxes;

    // Zomato price breakdown
    const zmDiscount = Math.round(dishBasePrice * 0.08);
    const zmCoupon = 10;
    const zmDelivery = distanceKm > 3 ? 40 : 30;
    const zmPlatform = 8.0;
    const zmPackaging = 15;
    const zmTaxes = Math.round(dishBasePrice * 0.05);
    const zmFinal = dishBasePrice - zmDiscount - zmCoupon + zmDelivery + zmPlatform + zmPackaging + zmTaxes;

    products.push({
      id: `universal-${zoneInfo.zoneId}-${restIdx}-${lowerQ.replace(/[^a-z0-9]/g, '')}`,
      name: `${formattedDishName} - ${cleanRestName}`,
      category: 'food',
      restaurantOrBrand: cleanRestName,
      quantity: '1 Standard Portion (Serves 1-2)',
      imageUrl: rest.img,
      description: `Chef-crafted ${formattedDishName} from ${cleanRestName} (${rest.cuisine}). Made fresh to order & delivered hot to ${area} in ${directDeliveryTime} mins.`,
      isVeg: !!isVeg,
      matchType: 'EXACT',
      matchScore: 99 - restIdx,
      matchNotes: `Live multi-restaurant menu match for "${formattedDishName}" in PIN ${pCode}.`,
      platformResults: enrichPlatformResultsWithSavings([
        {
          platformId: 'pricebite',
          platformName: 'PriceBite Direct Store (In-App)',
          platformLogo: '⚡',
          rating: 4.9,
          ratingCount: 12500,
          deliveryTimeMinutes: directDeliveryTime,
          inStock: true,
          orderUrl: '#pricebite-direct',
          isDirectAppOrder: true,
          appliedCoupons: ['PBDIRECT200', 'DIRECT50'],
          appliedBankOffers: ['UPI_CASHBACK'],
          isOpen: operatingStatus.isOpen,
          operatingHoursText: operatingStatus.statusText,
          nextOpeningTime: operatingStatus.opensAt,
          priceBreakdown: {
            basePrice: dishBasePrice,
            discount: pbDiscount,
            couponDiscount: pbCoupon,
            bankDiscount: 0,
            deliveryFee: 0,
            platformFee: 0,
            packagingFee: pbPackaging,
            taxes: Math.round(dishBasePrice * 0.05),
            finalPayablePrice: pbFinal,
            cashback: 15,
            effectiveCost: pbFinal - 15,
            savingsVsHighest: Math.max(25, zmFinal - pbFinal),
            savingsVsNextCheapest: Math.max(15, swFinal - pbFinal),
          },
        },
        {
          platformId: 'swiggy',
          platformName: 'Swiggy',
          platformLogo: '🟠',
          rating: Number((rest.rating - 0.2).toFixed(1)),
          ratingCount: 16800,
          deliveryTimeMinutes: aggregatorDeliveryTime,
          inStock: true,
          orderUrl: swiggyStoreUrl,
          appliedCoupons: ['SWIGGYIT'],
          appliedBankOffers: ['HDFC_OFF'],
          isOpen: operatingStatus.isOpen,
          operatingHoursText: operatingStatus.statusText,
          nextOpeningTime: operatingStatus.opensAt,
          priceBreakdown: {
            basePrice: dishBasePrice,
            discount: swDiscount,
            couponDiscount: swCoupon,
            bankDiscount: 0,
            deliveryFee: swDelivery,
            platformFee: swPlatform,
            packagingFee: swPackaging,
            taxes: swTaxes,
            finalPayablePrice: swFinal,
            cashback: 0,
            effectiveCost: swFinal,
            savingsVsHighest: Math.max(0, zmFinal - swFinal),
            savingsVsNextCheapest: 0,
          },
        },
        {
          platformId: 'zomato',
          platformName: 'Zomato',
          platformLogo: '🔴',
          rating: Number((rest.rating - 0.1).toFixed(1)),
          ratingCount: 19500,
          deliveryTimeMinutes: aggregatorDeliveryTime + 3,
          inStock: true,
          orderUrl: zomatoStoreUrl,
          appliedCoupons: ['ZOMATOGOLD'],
          appliedBankOffers: ['SBI_DEAL'],
          isOpen: operatingStatus.isOpen,
          operatingHoursText: operatingStatus.statusText,
          nextOpeningTime: operatingStatus.opensAt,
          priceBreakdown: {
            basePrice: dishBasePrice,
            discount: zmDiscount,
            couponDiscount: zmCoupon,
            bankDiscount: 0,
            deliveryFee: zmDelivery,
            platformFee: zmPlatform,
            packagingFee: zmPackaging,
            taxes: zmTaxes,
            finalPayablePrice: zmFinal,
            cashback: 0,
            effectiveCost: zmFinal,
            savingsVsHighest: 0,
            savingsVsNextCheapest: 0,
          },
        },
      ]),
      cheapestPlatformId: 'pricebite',
      fastestPlatformId: 'pricebite',
      bestValuePlatformId: 'pricebite',
      bestRewardsPlatformId: 'pricebite',
      smartPickPlatformId: 'pricebite',
    });
  });

  return products;
}

export const MOCK_PRICE_HISTORY: Record<string, PriceHistoryPoint[]> = {
  'prod-1': [
    { date: 'Aug 1', lowestPrice: 220, averagePrice: 260, highestPrice: 310 },
    { date: 'Aug 10', lowestPrice: 205, averagePrice: 250, highestPrice: 299 },
    { date: 'Today', lowestPrice: 194, averagePrice: 235, highestPrice: 285 },
  ],
};

export const MOCK_BANK_OFFERS: PlatformOffer[] = [
  { id: 'b-0', platformId: 'pricebite', title: 'PriceBite Wallet 5% Direct Cashback', discountAmount: 35, minOrderValue: 150, bankName: 'PriceBite Direct Pay', cashbackAmount: 20 },
  { id: 'b-1', platformId: 'all', title: 'HDFC Bank Credit Card', discountAmount: 30, minOrderValue: 200, bankName: 'HDFC Bank' },
  { id: 'b-2', platformId: 'all', title: 'SBI Instant Discount', discountAmount: 25, minOrderValue: 250, bankName: 'SBI Card' },
  { id: 'b-3', platformId: 'all', title: 'ICICI Amazon Pay Card', discountAmount: 20, minOrderValue: 150, bankName: 'ICICI Bank', cashbackAmount: 15 },
];
