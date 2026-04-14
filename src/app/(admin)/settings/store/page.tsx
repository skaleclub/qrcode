export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'
import StoreClient from './StoreClient'

export default async function StorePage() {
  const supabase = await createClient()
  const effective = await getEffectiveTenant()
  const { tenantId } = effective!

  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  return <StoreClient settings={settings} tenantId={tenantId} />
}
