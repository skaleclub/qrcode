-- Adiciona suporte a tags customizadas por tenant
ALTER TABLE tenant_settings
  ADD COLUMN IF NOT EXISTS custom_tags TEXT[] DEFAULT ARRAY['Vegetariano', 'Vegano', 'Sem Glúten', 'Picante', 'Destaque do chef'];
