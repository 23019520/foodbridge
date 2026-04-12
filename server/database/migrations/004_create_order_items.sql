-- Migration 004: Create order_items table
-- Run AFTER 002_create_listings.sql and 003_create_orders.sql
-- Stores a price/title SNAPSHOT so order history stays accurate even if listings change

CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id),
  title      VARCHAR(150) NOT NULL,  -- snapshot at time of purchase
  price      NUMERIC(10,2) NOT NULL, -- snapshot at time of purchase
  quantity   INTEGER NOT NULL DEFAULT 1,
  image_url  TEXT                    -- snapshot of first image
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_listing ON order_items(listing_id);
