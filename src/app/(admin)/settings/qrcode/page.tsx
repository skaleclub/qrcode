export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'
import QRCodeClient from './QRCodeClient'

export default async function QRCodePage() {
  const supabase = await createClient()
  const effective = await getEffectiveTenant()
  const { tenantId, slug, name } = effective!

  const { data: qrcodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`

  return (
    <QRCodeClient
      qrcodes={qrcodes ?? []}
      tenantId={tenantId}
      menuUrl={menuUrl}
      tenantName={name}
    />
  )
}
