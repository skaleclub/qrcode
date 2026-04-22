-- Migration 016: store-staff can read tenant data but cannot mutate menu/catalog/qrcode resources

-- CATEGORIES
DROP POLICY IF EXISTS "categories_admin" ON categories;
DROP POLICY IF EXISTS "categories_tenant_read" ON categories;
DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
DROP POLICY IF EXISTS "categories_admin_update" ON categories;
DROP POLICY IF EXISTS "categories_admin_delete" ON categories;

CREATE POLICY "categories_tenant_read" ON categories
  FOR SELECT USING (
    tenant_id = auth_tenant_id() OR is_superadmin()
  );

CREATE POLICY "categories_admin_insert" ON categories
  FOR INSERT WITH CHECK (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

CREATE POLICY "categories_admin_update" ON categories
  FOR UPDATE USING (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  )
  WITH CHECK (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

CREATE POLICY "categories_admin_delete" ON categories
  FOR DELETE USING (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

-- PRODUCTS
DROP POLICY IF EXISTS "products_admin" ON products;
DROP POLICY IF EXISTS "products_tenant_read" ON products;
DROP POLICY IF EXISTS "products_admin_insert" ON products;
DROP POLICY IF EXISTS "products_admin_update" ON products;
DROP POLICY IF EXISTS "products_admin_delete" ON products;

CREATE POLICY "products_tenant_read" ON products
  FOR SELECT USING (
    tenant_id = auth_tenant_id() OR is_superadmin()
  );

CREATE POLICY "products_admin_insert" ON products
  FOR INSERT WITH CHECK (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

CREATE POLICY "products_admin_update" ON products
  FOR UPDATE USING (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  )
  WITH CHECK (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

CREATE POLICY "products_admin_delete" ON products
  FOR DELETE USING (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

-- QR CODES
DROP POLICY IF EXISTS "qrcodes_admin" ON qr_codes;
DROP POLICY IF EXISTS "qrcodes_tenant_read" ON qr_codes;
DROP POLICY IF EXISTS "qrcodes_admin_insert" ON qr_codes;
DROP POLICY IF EXISTS "qrcodes_admin_update" ON qr_codes;
DROP POLICY IF EXISTS "qrcodes_admin_delete" ON qr_codes;

CREATE POLICY "qrcodes_tenant_read" ON qr_codes
  FOR SELECT USING (
    tenant_id = auth_tenant_id() OR is_superadmin()
  );

CREATE POLICY "qrcodes_admin_insert" ON qr_codes
  FOR INSERT WITH CHECK (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

CREATE POLICY "qrcodes_admin_update" ON qr_codes
  FOR UPDATE USING (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  )
  WITH CHECK (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

CREATE POLICY "qrcodes_admin_delete" ON qr_codes
  FOR DELETE USING (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );

-- MENUS
DROP POLICY IF EXISTS "Tenant members manage menus" ON menus;
DROP POLICY IF EXISTS "tenant_members_read_menus" ON menus;
DROP POLICY IF EXISTS "store_admin_manage_menus" ON menus;

CREATE POLICY "tenant_members_read_menus" ON menus
  FOR SELECT USING (
    tenant_id = auth_tenant_id() OR is_superadmin()
  );

CREATE POLICY "store_admin_manage_menus" ON menus
  FOR ALL USING (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  )
  WITH CHECK (
    is_superadmin() OR (
      tenant_id = auth_tenant_id()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'store-admin'
      )
    )
  );
