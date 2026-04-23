-- Migration 002: Add user_id to orders for authenticated order history
-- Run this after 001_initial_schema.sql

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Allow authenticated users to read their own orders
DROP POLICY IF EXISTS "orders_user_read" ON orders;
CREATE POLICY "orders_user_read"
  ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());
