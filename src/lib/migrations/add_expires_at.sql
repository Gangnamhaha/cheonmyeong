-- Add expires_at column to credits table for pass expiration
ALTER TABLE credits ADD COLUMN IF NOT EXISTS expires_at DATE;
