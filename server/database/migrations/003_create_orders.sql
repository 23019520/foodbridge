-- Migration 003: Create orders table
-- Run AFTER 001_create_users.sql

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id      UUID NOT NULL REFERENCES users(id),
  producer_id      UUID NOT NULL REFERENCES users(id),
  status           VARCHAR(20) DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  delivery_type    VARCHAR(20) CHECK (delivery_type IN ('delivery', 'collection')),
  delivery_address TEXT,
  consumer_note    TEXT,
  contact_number   VARCHAR(20),
  total_amount     NUMERIC(10,2) NOT NULL,
  reference        VARCHAR(20) UNIQUE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_consumer ON orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_producer ON orders(producer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
