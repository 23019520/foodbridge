-- Migration 001: Create users table
-- Run with: psql $DATABASE_URL -f database/migrations/001_create_users.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- enables gen_random_uuid()

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('consumer', 'producer', 'admin')),
  phone         VARCHAR(20),
  area          VARCHAR(100),
  bio           TEXT,
  business_name VARCHAR(150),
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
