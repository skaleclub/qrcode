import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const {
    company_name,
    business_type = 'restaurant',
    responsible_name,
    phone,
    address,
    menu_name,
    category_name,
    product_name,
    product_price,
  } = body

  if (!company_name?.trim()) return NextResponse.json({ error: 'Nome da empresa é obrigatório' }, { status: 400 })
  if (!menu_name?.trim()) return NextResponse.json({ error: 'Nome do cardápio é obrigatório' }, { status: 400 })
  if (!category_name?.trim()) return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 })
  if (!product_name?.trim()) return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 })

  const service = await createServiceClient()

  // 1. Criar tenant
  let slug = slugify(company_name)
  const { data: existingTenant } = await service.from('tenants').select('id').eq('slug', slug).single()
  if (existingTenant) slug = `${slug}-${Date.now().toString(36)}`

  const { data: tenant, error: tenantError } = await service
    .from('tenants')
    .insert({ name: company_name.trim(), slug, plan: 'free' })
    .select()
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
  }

  // 2. Criar tenant_settings com contato
  await service.from('tenant_settings').insert({
    tenant_id: tenant.id,
    phone: phone?.trim() || null,
    address: address?.trim() || null,
  })

  // 3. Atualizar perfil do usuário
  await service.from('profiles').upsert({
    id: user.id,
    tenant_id: tenant.id,
    role: 'store-admin',
    full_name: responsible_name?.trim() || user.user_metadata?.full_name || null,
    phone: phone?.trim() || null,
  })

  // 4. Criar menu principal
  let menuSlug = slugify(menu_name)
  const { data: existingMenu } = await service
    .from('menus').select('id').eq('tenant_id', tenant.id).eq('slug', menuSlug).single()
  if (existingMenu) menuSlug = `${menuSlug}-${Date.now().toString(36)}`

  const { data: menu, error: menuError } = await service
    .from('menus')
    .insert({
      tenant_id: tenant.id,
      name: menu_name.trim(),
      slug: menuSlug,
      language: 'pt',
      supported_languages: ['pt'],
      purpose: business_type,
      is_active: true,
      is_default: true,
    })
    .select()
    .single()

  if (menuError || !menu) {
    return NextResponse.json({ error: 'Erro ao criar cardápio' }, { status: 500 })
  }

  // 5. Criar primeira categoria
  const { data: category, error: categoryError } = await service
    .from('categories')
    .insert({
      tenant_id: tenant.id,
      menu_id: menu.id,
      name: category_name.trim(),
      position: 0,
      is_active: true,
    })
    .select()
    .single()

  if (categoryError || !category) {
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }

  // 6. Criar primeiro produto
  await service.from('products').insert({
    tenant_id: tenant.id,
    menu_id: menu.id,
    category_id: category.id,
    name: product_name.trim(),
    price: parseFloat(product_price) || 0,
    is_available: true,
    is_featured: false,
    position: 0,
  })

  return NextResponse.json({ tenant_slug: tenant.slug, menu_slug: menu.slug })
}
