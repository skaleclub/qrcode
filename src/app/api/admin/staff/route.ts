import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'

async function assertStoreAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const effective = await getEffectiveTenant()
  if (!effective) return null
  return { supabase, tenantId: effective.tenantId }
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function GET() {
  const ctx = await assertStoreAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = await createServiceClient()
  const { data } = await service
    .from('profiles')
    .select('id, full_name, phone, created_at')
    .eq('tenant_id', ctx.tenantId)
    .eq('role', 'store-staff')
    .order('created_at', { ascending: false })

  // Fetch emails from auth.users
  const ids = (data ?? []).map(p => p.id)
  const staffWithEmail = await Promise.all(
    ids.map(async (id) => {
      const { data: u } = await service.auth.admin.getUserById(id)
      const profile = data!.find(p => p.id === id)!
      return { ...profile, email: u.user?.email ?? null }
    })
  )

  return NextResponse.json(staffWithEmail)
}

export async function POST(request: Request) {
  const ctx = await assertStoreAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email } = body
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const service = await createServiceClient()
  const tempPassword = generatePassword()

  const { data: userData, error: userError } = await service.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: name.trim() },
  })

  if (userError) {
    if (userError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 409 })
    }
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  if (userData.user) {
    await service.from('profiles').upsert({
      id: userData.user.id,
      tenant_id: ctx.tenantId,
      role: 'store-staff',
      full_name: name.trim(),
    }, { onConflict: 'id' })
  }

  return NextResponse.json({ ok: true, credentials: { email, password: tempPassword } }, { status: 201 })
}
