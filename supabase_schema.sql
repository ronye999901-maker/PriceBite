-- ==============================================================================
-- ⚡ PRICEBITE SUPABASE POSTGRESQL DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  current_pincode TEXT,
  total_savings NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ORDERS TABLE (Past Orders & In-App Direct Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Preparing',
  delivery_pincode TEXT,
  delivery_address TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  current_lowest_price NUMERIC NOT NULL,
  pincode TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS CATALOG TABLE (Optional Cloud Product Overrides)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand_or_restaurant TEXT NOT NULL,
  quantity TEXT,
  image_url TEXT,
  description TEXT,
  is_veg BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ & ACCESS POLICIES (For Development & Demonstration)
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public access to orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow public access to price_alerts" ON public.price_alerts FOR ALL USING (true);

-- REALTIME REPLICATION (For Live Order Tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- SAMPLE SEED DATA
INSERT INTO public.profiles (id, name, email, phone, current_pincode, total_savings)
VALUES ('user-1', 'Sayan Chowdhury', 'sayan@pricebite.in', '+91 98765 43210', '700156', 2840)
ON CONFLICT (id) DO NOTHING;
