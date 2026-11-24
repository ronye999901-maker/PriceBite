import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Live User Profile Sync Function
export async function syncUserProfileToCloud(profile: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentPinCode?: string;
  totalSavings?: number;
}) {
  if (!supabase) {
    console.warn('Supabase is not initialized. Check your .env file credentials.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          current_pincode: profile.currentPinCode || '',
          total_savings: profile.totalSavings || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      console.error('❌ Supabase Profile Sync Error:', error.message);
    } else {
      console.log('✅ Live User Profile Synced to Supabase Cloud:', profile.name, profile.email);
    }
    return data;
  } catch (err) {
    console.error('❌ Supabase Profile Sync Exception:', err);
    return null;
  }
}

// Live Order Creation Sync Function
export async function createDirectOrderInCloud(order: {
  orderId: string;
  userId?: string;
  items: any[];
  totalAmount: number;
  deliveryPinCode?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
}) {
  if (!supabase) return null;

  try {
    let targetUserId = order.userId || 'user-1';

    // Verify if targetUserId exists in profiles table to prevent FK 23503 error
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!existingProfile) {
      // Create user profile for targetUserId to satisfy foreign key constraint
      await supabase
        .from('profiles')
        .upsert(
          {
            id: targetUserId,
            name: targetUserId.includes('@') ? targetUserId.split('@')[0] : 'PriceBite Customer',
            email: targetUserId.includes('@') ? targetUserId : `${targetUserId}@pricebite.in`,
            phone: '+91 98765 43210',
            current_pincode: order.deliveryPinCode || '700156',
            total_savings: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: order.orderId,
        user_id: targetUserId,
        items: order.items,
        total_amount: order.totalAmount,
        delivery_pincode: order.deliveryPinCode || '',
        delivery_address: order.deliveryAddress || '',
        payment_method: order.paymentMethod || 'UPI',
        status: 'Preparing',
      })
      .select();

    if (error) {
      console.error('❌ Supabase Order Creation Error:', error.message);
    } else {
      console.log('✅ Live Order Synced to Supabase Cloud:', order.orderId);
    }
    return data;
  } catch (err) {
    console.error('❌ Supabase Order Exception:', err);
    return null;
  }
}

// Fetch User-Specific Orders from Supabase
export async function fetchUserOrdersFromCloud(userId: string) {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase Fetch Orders Error:', error.message);
      return [];
    }

    return (data || []).map((o: any) => ({
      id: o.order_id,
      date: new Date(o.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: o.items || [],
      totalAmount: o.total_amount || 0,
      status: o.status || 'Preparing',
      deliveryPinCode: o.delivery_pincode || '',
      deliveryAddress: o.delivery_address || '',
      paymentMethod: o.payment_method || 'UPI',
    }));
  } catch (err) {
    console.error('❌ Supabase Fetch Orders Exception:', err);
    return [];
  }
}

// ============================================================
// LOCAL GEMS HUB — Supabase Functions
// ============================================================

export interface LocalDishDB {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  is_veg: boolean;
  portion: string;
  is_available: boolean;
}

export interface LocalRestaurantDB {
  id: string;
  name: string;
  area: string;
  pin_code: string;
  cuisine: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  is_pure_veg: boolean;
  delivery_minutes: number;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  dishes?: LocalDishDB[];
}

/** Submit a new restaurant registration (owner flow). Status = pending. */
export async function submitLocalRestaurant(data: {
  name: string;
  area: string;
  pin_code: string;
  cuisine: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  is_pure_veg: boolean;
  delivery_minutes?: number;
  dishes: Array<{ name: string; price: number; is_veg: boolean; portion: string }>;
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured.' };

  try {
    // Insert restaurant (status = 'pending')
    const { data: rest, error: restErr } = await supabase
      .from('local_restaurants')
      .insert({
        name: data.name,
        area: data.area,
        pin_code: data.pin_code,
        cuisine: data.cuisine,
        owner_name: data.owner_name,
        owner_phone: data.owner_phone,
        owner_email: data.owner_email || '',
        is_pure_veg: data.is_pure_veg,
        delivery_minutes: data.delivery_minutes || 25,
        status: 'pending',
      })
      .select('id')
      .single();

    if (restErr || !rest) {
      console.error('❌ Local restaurant submit error:', restErr?.message);
      return { success: false, error: restErr?.message || 'Failed to submit.' };
    }

    // Insert dishes
    if (data.dishes.length > 0) {
      const dishRows = data.dishes.map((d) => ({
        restaurant_id: rest.id,
        name: d.name,
        price: d.price,
        is_veg: d.is_veg,
        portion: d.portion,
        is_available: true,
      }));
      const { error: dishErr } = await supabase.from('local_dishes').insert(dishRows);
      if (dishErr) {
        console.error('❌ Local dish insert error:', dishErr.message);
      }
    }

    console.log('✅ Local restaurant submitted:', data.name);
    return { success: true };
  } catch (err: any) {
    console.error('❌ submitLocalRestaurant exception:', err);
    return { success: false, error: err?.message || 'Unknown error.' };
  }
}

/** Fetch all approved local restaurants (optionally filter by PIN). */
export async function fetchApprovedLocalRestaurants(pinCode?: string): Promise<LocalRestaurantDB[]> {
  if (!supabase) return [];

  try {
    let query = supabase
      .from('local_restaurants')
      .select('*, dishes:local_dishes(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (pinCode) {
      query = query.eq('pin_code', pinCode);
    }

    const { data, error } = await query;
    if (error) {
      console.error('❌ fetchApprovedLocalRestaurants error:', error.message);
      return [];
    }
    return (data || []) as LocalRestaurantDB[];
  } catch (err) {
    console.error('❌ fetchApprovedLocalRestaurants exception:', err);
    return [];
  }
}

/** Fetch ALL local restaurants for admin (all statuses). */
export async function fetchAllLocalRestaurantsAdmin(): Promise<LocalRestaurantDB[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('local_restaurants')
      .select('*, dishes:local_dishes(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ fetchAllLocalRestaurantsAdmin error:', error.message);
      return [];
    }
    return (data || []) as LocalRestaurantDB[];
  } catch (err) {
    console.error('❌ fetchAllLocalRestaurantsAdmin exception:', err);
    return [];
  }
}

/** Admin: Approve or reject a restaurant. */
export async function updateLocalRestaurantStatus(
  id: string,
  status: 'approved' | 'rejected',
  adminNote?: string
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('local_restaurants')
      .update({ status, admin_note: adminNote || '', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('❌ updateLocalRestaurantStatus error:', error.message);
      return false;
    }
    console.log(`✅ Restaurant ${id} → ${status}`);
    return true;
  } catch (err) {
    console.error('❌ updateLocalRestaurantStatus exception:', err);
    return false;
  }
}

// ============================================================
// Live Price Drop Alert Sync Function
export async function syncPriceAlertToCloud(alert: {
  userId: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentLowestPrice: number;
  pinCode: string;
}) {
  if (!supabase) return null;

  try {
    const targetUserId = alert.userId || 'user-1';

    // Ensure user profile exists in profiles table
    await supabase
      .from('profiles')
      .upsert(
        {
          id: targetUserId,
          name: targetUserId.includes('@') ? targetUserId.split('@')[0] : 'PriceBite Customer',
          email: targetUserId.includes('@') ? targetUserId : `${targetUserId}@pricebite.in`,
          phone: '+91 98765 43210',
          current_pincode: alert.pinCode || '700156',
          total_savings: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: targetUserId,
        product_id: alert.productId,
        product_name: alert.productName,
        target_price: alert.targetPrice,
        current_lowest_price: alert.currentLowestPrice,
        pincode: alert.pinCode,
        active: true,
      })
      .select();

    if (error) {
      console.error('❌ Supabase Price Alert Error:', error.message);
    } else {
      console.log('✅ Live Price Alert Synced to Supabase Cloud:', alert.productName);
    }
    return data;
  } catch (err) {
    console.error('❌ Supabase Price Alert Exception:', err);
    return null;
  }
}
