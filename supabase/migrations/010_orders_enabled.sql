-- Migration 010: Add general orders_enabled toggle to tenant_settings
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS orders_enabled BOOLEAN NOT NULL DEFAULT true;
