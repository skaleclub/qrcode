-- Migration 008: Add WhatsApp orders toggle to tenant_settings
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS whatsapp_orders_enabled BOOLEAN NOT NULL DEFAULT false;
