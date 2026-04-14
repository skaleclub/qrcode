-- Migration 007: Add currency and language to tenant_settings
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';
