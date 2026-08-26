import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, OrderRecord, PriceAlert } from '../types';

export const supabaseService = {
  // 1. 👤 User Profile Sync
  async syncUserProfile(profile: UserProfile) {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          current_pincode: profile.currentPinCode,
          total_savings: profile.totalSavingsAmount,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase User Profile Sync Fallback:', err);
      return null;
    }
  },

  // 2. 📦 Save New Order Receipt
  async createOrder(order: OrderRecord, userId: string) {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_id: order.id,
          user_id: userId,
          items: order.items,
          total_amount: order.totalAmount,
          status: order.status,
          delivery_pincode: order.deliveryPinCode,
          delivery_address: order.deliveryAddress,
          payment_method: order.paymentMethod,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase Order Creation Fallback:', err);
      return null;
    }
  },

  // 3. 📜 Fetch Past Orders History
  async fetchPastOrders(userId: string): Promise<OrderRecord[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.order_id,
        date: new Date(row.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        items: row.items,
        totalAmount: Number(row.total_amount),
        status: row.status,
        deliveryPinCode: row.delivery_pincode,
        deliveryAddress: row.delivery_address,
        paymentMethod: row.payment_method,
      }));
    } catch (err) {
      console.warn('Supabase Fetch Orders Fallback:', err);
      return null;
    }
  },

  // 4. 🔔 Create Price Drop Alert
  async createPriceAlert(alert: PriceAlert, userId: string) {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: userId,
          product_id: alert.productId,
          product_name: alert.productName,
          target_price: alert.targetPrice,
          current_lowest_price: alert.currentLowestPrice,
          pincode: alert.pinCode,
          active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase Price Alert Fallback:', err);
      return null;
    }
  },

  // 5. 📡 Subscribe to Live Order Status (Realtime WebSockets)
  subscribeToOrderStatus(orderId: string, onStatusChange: (status: string) => void) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const client = supabase;
    const channel = client
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            onStatusChange(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  },
};
