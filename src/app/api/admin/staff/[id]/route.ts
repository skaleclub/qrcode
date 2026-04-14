import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'

interface Props { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const effective = await getEffectiveTenant()
  if (!effective) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = await createServiceClient()

  // Verify this staff member belongs to the current tenant
  const { data: profile } = await service
    .from('profiles')
    .select('id, role, tenant_id')
    .eq('id', id)
    .single()

  if (!profile || profile.tenant_id !== effective.tenantId || profile.role !== 'store-staff') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await service.from('profiles').update({ role: 'customer', tenant_id: null }).eq('id', id)

  return NextResponse.json({ ok: true })
}
