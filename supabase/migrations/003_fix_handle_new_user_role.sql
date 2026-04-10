-- Corrige handle_new_user para definir role='admin' explicitamente
-- Evita depender do DEFAULT da coluna, que pode variar por ambiente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'admin')
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
