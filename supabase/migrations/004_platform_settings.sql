-- Configurações globais da plataforma (linha única)
CREATE TABLE platform_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name              TEXT NOT NULL DEFAULT 'Skale QR Menu',
  brand_name            TEXT NOT NULL DEFAULT 'Skale Club',
  default_primary_color TEXT NOT NULL DEFAULT '#000000',
  default_accent_color  TEXT NOT NULL DEFAULT '#FF5722',
  menu_footer_brand     TEXT NOT NULL DEFAULT 'Skale QR Menu',
  landing               JSONB NOT NULL DEFAULT '{}',
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Garante que só exista uma linha
CREATE UNIQUE INDEX platform_settings_singleton ON platform_settings ((true));

-- Insere defaults com todo o conteúdo da landing page
INSERT INTO platform_settings (landing) VALUES ('{
  "hero": {
    "badge": "Cardápio digital para restaurantes",
    "heading": "Seu cardápio no celular",
    "heading_highlight": "com um QR Code",
    "subheading": "Crie seu cardápio digital em minutos, gere um QR Code e deixe seus clientes pedindo pelo WhatsApp. Sem app, sem complicação.",
    "cta_primary": "Começar grátis",
    "cta_secondary": "Ver como funciona"
  },
  "how_it_works": {
    "title": "Como funciona",
    "subtitle": "Em 3 passos simples você já está no ar",
    "steps": [
      {"step": "01", "icon": "📋", "title": "Cadastre seu cardápio", "desc": "Crie categorias e adicione seus produtos com fotos, descrições e preços no painel de controle."},
      {"step": "02", "icon": "🎨", "title": "Personalize o visual", "desc": "Adicione seu logotipo, cores do restaurante e informações de contato para deixar com a sua cara."},
      {"step": "03", "icon": "📱", "title": "Gere e imprima o QR Code", "desc": "Com um clique gere seu QR Code único. Coloque nas mesas e deixe seus clientes acessarem na hora."}
    ]
  },
  "features": {
    "title": "Tudo que você precisa",
    "subtitle": "Funcionalidades pensadas para restaurantes",
    "items": [
      {"icon": "🔗", "title": "Link único por restaurante", "desc": "Cada cliente tem seu próprio endereço de cardápio digital."},
      {"icon": "📲", "title": "Pedido pelo WhatsApp", "desc": "O cliente clica no produto e já abre o WhatsApp pronto para pedir."},
      {"icon": "🎨", "title": "Branding personalizado", "desc": "Logo, cores e identidade visual do seu restaurante."},
      {"icon": "📊", "title": "Contagem de scans", "desc": "Veja quantas vezes seu QR Code foi escaneado."},
      {"icon": "🔍", "title": "Busca no cardápio", "desc": "Clientes encontram qualquer produto em segundos."},
      {"icon": "⚡", "title": "Sem instalar app", "desc": "Tudo abre direto no navegador do celular, sem fricção."}
    ]
  },
  "pricing": {
    "title": "Planos simples",
    "subtitle": "Comece grátis, escale quando precisar",
    "plans": [
      {"name": "Free", "price": "R$ 0", "period": "/mês", "desc": "Para começar", "features": ["Cardápio digital", "QR Code gerado", "Até 20 produtos", "Branding básico"], "cta": "Começar grátis", "highlight": false},
      {"name": "Pro", "price": "R$ 49", "period": "/mês", "desc": "Para crescer", "features": ["Tudo do Free", "Produtos ilimitados", "Branding completo", "Analytics de scans", "Suporte prioritário"], "cta": "Assinar Pro", "highlight": true},
      {"name": "Enterprise", "price": "R$ 149", "period": "/mês", "desc": "Para redes", "features": ["Tudo do Pro", "Múltiplas unidades", "Domínio próprio", "Onboarding dedicado", "SLA garantido"], "cta": "Falar com vendas", "highlight": false}
    ]
  },
  "cta": {
    "heading": "Pronto para digitalizar\nseu cardápio?",
    "text": "Crie sua conta agora e tenha seu QR Code em menos de 5 minutos.",
    "button": "Criar conta grátis"
  },
  "footer": {
    "copyright": "Skale Club. Todos os direitos reservados."
  }
}');

-- Trigger updated_at
CREATE TRIGGER platform_settings_updated_at BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_settings_public_read" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "platform_settings_superadmin_write" ON platform_settings FOR ALL USING (is_superadmin());
