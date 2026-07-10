export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { listAllAuthUsers } from '@/lib/admin/list-auth-users'
import TenantsClient from './TenantsClient'

export default async function TenantsPage() {
  const service = await createServiceClient()

  const [{ data: tenants }, authUsers, { data: profiles }] = await Promise.all([
    service.from('tenants').select('id, name, slug, plan, is_active, created_at, tenant_settings(logo_url)').order('created_at', { ascending: false }),
    listAllAuthUsers(service),
    service.from('profiles').select('id, role, tenant_id, full_name'),
  ])

  const authMap = new Map(authUsers.map(u => [u.id, u]))
  // Index profiles once instead of scanning the full profiles list per tenant
  // and per unassigned user (was O(tenants × profiles) + O(users × profiles)).
  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))
  const adminProfileByTenant = new Map<string, NonNullable<typeof profiles>[number]>()
  for (const p of profiles ?? []) {
    if (p.tenant_id && (p.role === 'store-admin' || p.role === 'admin') && !adminProfileByTenant.has(p.tenant_id)) {
      adminProfileByTenant.set(p.tenant_id, p)
    }
  }

  // Build combined list: each client = tenant + admin user
  const clients = (tenants ?? []).map(tenant => {
    const profile = adminProfileByTenant.get(tenant.id) ?? null
    const authUser = profile ? authMap.get(profile.id) : null
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      is_active: tenant.is_active,
      created_at: tenant.created_at,
      logo_url: ((tenant.tenant_settings as unknown as Array<{ logo_url: string | null }> | null)?.[0]?.logo_url) ?? null,
      // user data
      user_id: profile?.id ?? null,
      email: authUser?.email ?? null,
      full_name: profile?.full_name ?? null,
      provider: (authUser?.app_metadata?.provider as string) ?? 'email',
    }
  })

  // Users without a tenant, for example Google login without assignment.
  const unassigned = authUsers
    .filter(u => {
      const profile = profileById.get(u.id)
      return !profile?.tenant_id && profile?.role !== 'superadmin'
    })
    .map(u => ({
      id: null,
      name: null,
      slug: null,
      plan: null,
      is_active: null,
      created_at: u.created_at,
      logo_url: null,
      user_id: u.id,
      email: u.email ?? null,
      full_name: (u.user_metadata?.full_name as string) ?? null,
      provider: (u.app_metadata?.provider as string) ?? 'email',
    }))

  return <TenantsClient clients={[...clients, ...unassigned]} />
}
