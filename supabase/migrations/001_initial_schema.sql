-- ================================================================
-- Migration: 001_initial_schema.sql
-- Mini Storefront – Initial Schema
-- ================================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  description    text,
  price          numeric(12,0) NOT NULL CHECK (price >= 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_published   boolean NOT NULL DEFAULT false,
  category_id    uuid NOT NULL REFERENCES categories(id),
  image_url      text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Trigger: auto-update updated_at on products row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text NOT NULL UNIQUE,
  customer_name    text NOT NULL,
  customer_email   text NOT NULL CHECK (customer_email ~* '^[^@]+@[^@]+\.[^@]+$'),
  delivery_address text NOT NULL,
  total_amount     numeric(15,0) NOT NULL CHECK (total_amount >= 0),
  payment_method   text NOT NULL CHECK (payment_method IN ('COD', 'CARD')),
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_reference_number ON orders(reference_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 4. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  unit_price   numeric(12,0) NOT NULL CHECK (unit_price >= 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. Payment Details (CARD only; never store PAN or CVV)
CREATE TABLE IF NOT EXISTS payment_details (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  cardholder_name  text NOT NULL,
  card_last4       char(4) NOT NULL CHECK (card_last4 ~ '^[0-9]{4}$'),
  exp_month        smallint NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
  exp_year         smallint NOT NULL CHECK (exp_year >= 2026)
);
CREATE INDEX IF NOT EXISTS idx_payment_details_order_id ON payment_details(order_id);

-- ================================================================
-- Row Level Security
-- ================================================================
-- Create Supabase-compatible roles if they don't exist (local dev)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END $$;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_details ENABLE ROW LEVEL SECURITY;

-- Public storefront reads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories_public_read'
  ) THEN
    CREATE POLICY "categories_public_read"
      ON categories FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_public_read'
  ) THEN
    CREATE POLICY "products_public_read"
      ON products FOR SELECT TO anon USING (is_published = true);
  END IF;
END $$;

-- orders, order_items, payment_details: no anon/authenticated policies
-- All writes go through service role (bypasses RLS)

-- ================================================================
-- Seed Data (development only)
-- Remove or guard with environment check before production
-- ================================================================
INSERT INTO categories (name, slug) VALUES
  ('Áo', 'ao'),
  ('Quần', 'quan'),
  ('Phụ kiện', 'phu-kien')
ON CONFLICT (slug) DO NOTHING;

-- 6 published products, 1 unpublished
WITH cats AS (
  SELECT id, slug FROM categories WHERE slug IN ('ao', 'quan', 'phu-kien')
)
INSERT INTO products (name, description, price, stock_quantity, is_published, category_id)
SELECT * FROM (VALUES
  ('Áo Thun Basic',    'Áo thun cotton 100%, form rộng thoải mái', 150000, 50, true,  (SELECT id FROM cats WHERE slug = 'ao')),
  ('Áo Polo Classic',  'Áo polo cổ bẻ, chất liệu pique',          250000, 30, true,  (SELECT id FROM cats WHERE slug = 'ao')),
  ('Áo Khoác Denim',   'Áo khoác jean nhẹ, phù hợp mùa thu',      450000,  5, false, (SELECT id FROM cats WHERE slug = 'ao')),
  ('Quần Jeans Slim',  'Quần jean ống đứng, co dãn nhẹ',           380000, 20, true,  (SELECT id FROM cats WHERE slug = 'quan')),
  ('Quần Kaki Cargo',  'Quần kaki nhiều túi, kiểu dáng cargo',     320000, 15, true,  (SELECT id FROM cats WHERE slug = 'quan')),
  ('Nón Bucket',       'Nón bucket vải canvas, chống nắng',        120000, 40, true,  (SELECT id FROM cats WHERE slug = 'phu-kien')),
  ('Túi Tote Canvas',  'Túi tote vải canvas in logo, đựng A4',     180000, 25, true,  (SELECT id FROM cats WHERE slug = 'phu-kien'))
) AS v(name, description, price, stock_quantity, is_published, category_id)
ON CONFLICT DO NOTHING;
