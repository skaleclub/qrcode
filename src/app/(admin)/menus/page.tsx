export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'
import MenusClient from './MenusClient'

export default async function MenusPage() {
  const supabase = await createClient()
  const { tenantId } = (await getEffectiveTenant())!
  const { data: menus } = await supabase.from('menus').select('*').eq('tenant_id', tenantId).order('position')
  return <MenusClient menus={menus ?? []} />
}
