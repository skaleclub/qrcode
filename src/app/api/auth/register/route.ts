import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, password } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  if (!phone?.trim()) return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
  if (!password || password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('already registered')) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!data.user) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })

  const service = await createServiceClient()
  await service.from('profiles').upsert({
    id: data.user.id,
    role: 'customer',
    full_name: name.trim(),
    phone: phone.trim(),
  }, { onConflict: 'id' })

  return NextResponse.json({ ok: true })
}
