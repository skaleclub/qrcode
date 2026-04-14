-- Migration 009: Multiple menus support

CREATE TABLE menus (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  language    TEXT NOT NULL DEFAULT 'en',
  purpose     TEXT NOT NULL DEFAULT 'restaurant',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Add menu_id to categories and products
ALTER TABLE categories ADD COLUMN menu_id UUID REFERENCES menus(id) ON DELETE CASCADE;
ALTER TABLE products   ADD COLUMN menu_id UUID REFERENCES menus(id) ON DELETE CASCADE;

-- Create a default menu for every existing tenant
INSERT INTO menus (tenant_id, name, slug, language, purpose, is_active, is_default, position)
SELECT id, 'Main Menu', 'main', 'en', 'restaurant', true, true, 0
FROM tenants;

-- Assign existing categories to their tenant's default menu
UPDATE categories c
SET menu_id = m.id
FROM menus m
WHERE m.tenant_id = c.tenant_id AND m.is_default = true;

-- Assign existing products to their tenant's default menu
UPDATE products p
SET menu_id = m.id
FROM menus m
WHERE m.tenant_id = p.tenant_id AND m.is_default = true;

-- RLS
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active menus" ON menus
  FOR SELECT USING (is_active = true);

CREATE POLICY "Tenant members manage menus" ON menus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND tenant_id = menus.tenant_id
        AND role IN ('store-admin', 'store-staff', 'superadmin')
    )
  );
