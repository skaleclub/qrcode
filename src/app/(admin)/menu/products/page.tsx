export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { getEffectiveTenant } from '@/lib/get-effective-tenant'
import ProductsClient from './ProductsClient'

export default async function ProductsPage() {
  const supabase = await createClient()
  const effective = await getEffectiveTenant()
  const tenantId = effective!.tenantId

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(id, name)')
      .eq('tenant_id', tenantId)
      .order('position'),
    supabase
      .from('categories')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('position'),
  ])

  return (
    <ProductsClient
      products={products ?? []}
      categories={categories ?? []}
      tenantId={tenantId}
    />
  )
}
