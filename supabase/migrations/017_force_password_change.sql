-- Migration 017: force first password change for provisioned accounts

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
