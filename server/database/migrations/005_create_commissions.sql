-- Migration 005: Create commissions table
-- Run AFTER 003_create_orders.sql
-- A commission record is created automatically when an order is marked 'completed'

CREATE TABLE IF NOT EXISTS commissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID UNIQUE NOT NULL REFERENCES orders(id),
  producer_id UUID NOT NULL REFERENCES users(id),
  order_total NUMERIC(10,2) NOT NULL,
  rate        NUMERIC(5,4) NOT NULL DEFAULT 0.0300, -- 3.00%
  amount      NUMERIC(10,2) NOT NULL,               -- order_total * rate
  status      VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'invoiced', 'paid')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_producer ON commissions(producer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status   ON commissions(status);
