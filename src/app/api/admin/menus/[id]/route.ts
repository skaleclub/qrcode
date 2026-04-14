import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'

interface Props { params: Promise<{ id: string }> }

async function assertOwnership(menuId: string) {
  const effective = await getEffectiveTenant()
  if (!effective) return null
  const supabase = await createClient()
  const { data } = await supabase.from('menus').select('id, is_default, tenant_id').eq('id', menuId).single()
  if (!data || data.tenant_id !== effective.tenantId) return null
  return { supabase, menu: data }
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const ctx = await assertOwnership(id)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const allowed = ['name', 'language', 'purpose', 'description', 'is_active', 'is_default', 'position']
  const update: Record<string, unknown> = {}
  for (const key of allowed) if (key in body) update[key] = body[key]

  // If setting as default, unset others
  if (update.is_default === true) {
    await ctx.supabase.from('menus').update({ is_default: false }).eq('tenant_id', ctx.menu.tenant_id)
  }

  const { data, error } = await ctx.supabase.from('menus').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params
  const ctx = await assertOwnership(id)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (ctx.menu.is_default) return NextResponse.json({ error: 'Cannot delete the default menu' }, { status: 400 })

  await ctx.supabase.from('menus').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
