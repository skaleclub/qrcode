-- Migration 006: Add phone field to profiles for customer registration
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
