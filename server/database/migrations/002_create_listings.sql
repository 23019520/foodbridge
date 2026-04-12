-- Migration 002: Create listings table
-- Run AFTER 001_create_users.sql

CREATE TABLE IF NOT EXISTS listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    VARCHAR(50) NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  location    VARCHAR(100),
  images      TEXT[] DEFAULT '{}',
  status      VARCHAR(20) DEFAULT 'available'
                CHECK (status IN ('available', 'sold_out', 'seasonal', 'inactive')),
  order_count INTEGER DEFAULT 0,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_producer ON listings(producer_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status   ON listings(status);

-- Full-text search index on title + description
CREATE INDEX IF NOT EXISTS idx_listings_search
  ON listings
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));
