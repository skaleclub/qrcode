import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'
import { slugify } from '@/lib/utils'

async function getTenantId() {
  const effective = await getEffectiveTenant()
  return effective?.tenantId ?? null
}

export async function GET() {
  const tenantId = await getTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data } = await supabase
    .from('menus')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('position')

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const tenantId = await getTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, language = 'en', purpose = 'restaurant', description } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const slug = slugify(name)
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('menus').select('id').eq('tenant_id', tenantId).eq('slug', slug).single()

  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

  const { data, error } = await supabase
    .from('menus')
    .insert({ tenant_id: tenantId, name: name.trim(), slug: finalSlug, language, purpose, description: description ?? null })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
