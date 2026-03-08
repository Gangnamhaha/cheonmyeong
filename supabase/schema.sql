-- 천명(天命) Database Schema
-- Run this in Supabase SQL Editor after creating a project

-- Users (email/password registrations)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Credits
CREATE TABLE IF NOT EXISTS credits (
  user_id TEXT PRIMARY KEY,
  total INTEGER DEFAULT 3,
  used INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free',
  last_refill DATE DEFAULT CURRENT_DATE
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
  payment_provider TEXT DEFAULT 'portone',
  billing_key TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Payments (audit log for all payment attempts)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  payment_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'canceled')),
  payment_provider TEXT DEFAULT 'portone',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- Daily Fortunes (60-group caching for Task 8)
CREATE TABLE IF NOT EXISTS daily_fortunes (
  id SERIAL PRIMARY KEY,
  group_index INTEGER NOT NULL CHECK (group_index BETWEEN 0 AND 59),
  fortune_date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_index, fortune_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_fortunes_date ON daily_fortunes(fortune_date);

-- Analytics events (lightweight server-side tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);

-- Push notification tokens (for Task 7)
CREATE TABLE IF NOT EXISTS push_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  platform TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);

-- Credit merge audit log (for Task 12)
CREATE TABLE IF NOT EXISTS credit_merges (
  id SERIAL PRIMARY KEY,
  guest_email TEXT NOT NULL,
  member_user_id TEXT NOT NULL,
  credits_merged INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin user profiles (tracking registered users for admin dashboard)
CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit adjustment history (admin actions)
CREATE TABLE IF NOT EXISTS credit_adjustments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_credit_adjustments_user ON credit_adjustments(user_id);

-- Customer inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied')),
  reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- Analysis stats counters
CREATE TABLE IF NOT EXISTS analysis_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_analyses INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_analysis_stats (
  stat_date DATE PRIMARY KEY,
  count INTEGER DEFAULT 0
);
