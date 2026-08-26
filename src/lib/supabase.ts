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
