-- ============================================================
-- PriceBite: Local Gems Hub — Restaurant & Dish Tables
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table: local_restaurants
-- Submitted by restaurant owners, approved by admin
CREATE TABLE IF NOT EXISTS public.local_restaurants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  area            TEXT NOT NULL,
  pin_code        TEXT NOT NULL,
  cuisine         TEXT NOT NULL DEFAULT 'Local / Homestyle',
  owner_name      TEXT NOT NULL,
  owner_phone     TEXT NOT NULL,
  owner_email     TEXT,
  is_pure_veg     BOOLEAN NOT NULL DEFAULT false,
  delivery_minutes INT NOT NULL DEFAULT 25,
  image_url       TEXT DEFAULT 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  status          TEXT NOT NULL DEFAULT 'pending',
  -- status values: 'pending' | 'approved' | 'rejected'
  admin_note      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Table: local_dishes
-- Dishes belonging to a local_restaurant
CREATE TABLE IF NOT EXISTS public.local_dishes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.local_restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price           NUMERIC(8,2) NOT NULL,
  is_veg          BOOLEAN NOT NULL DEFAULT true,
  portion         TEXT NOT NULL DEFAULT '1 Plate',
  is_available    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast PIN-based lookups
CREATE INDEX IF NOT EXISTS idx_local_restaurants_pin ON public.local_restaurants(pin_code);
CREATE INDEX IF NOT EXISTS idx_local_restaurants_status ON public.local_restaurants(status);
CREATE INDEX IF NOT EXISTS idx_local_dishes_restaurant ON public.local_dishes(restaurant_id);

-- Enable Row Level Security
ALTER TABLE public.local_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_dishes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved restaurants and their dishes
CREATE POLICY "Approved restaurants are publicly readable"
  ON public.local_restaurants FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Dishes of approved restaurants are publicly readable"
  ON public.local_dishes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.local_restaurants r
      WHERE r.id = restaurant_id AND r.status = 'approved'
    )
  );

-- Policy: Anyone can INSERT (submit) a new restaurant (pending)
CREATE POLICY "Anyone can submit a local restaurant"
  ON public.local_restaurants FOR INSERT
  WITH CHECK (status = 'pending');

-- Policy: Anyone can INSERT dishes for their restaurant
CREATE POLICY "Anyone can submit dishes for a restaurant"
  ON public.local_dishes FOR INSERT
  WITH CHECK (true);

-- Policy: Admin can UPDATE status (approve/reject)
-- (In practice this uses service role key on the admin panel)
CREATE POLICY "Service role can update restaurant status"
  ON public.local_restaurants FOR UPDATE
  USING (true);
