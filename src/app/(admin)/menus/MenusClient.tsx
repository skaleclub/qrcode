'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const PURPOSES = ['restaurant','bar','cafe','hotel','salon','retail','other']
const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'pt', label: 'Portuguese' },
  { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' }, { value: 'it', label: 'Italian' },
]

interface Menu { id: string; name: string; slug: string; language: string; purpose: string; description: string | null; is_active: boolean; is_default: boolean; position: number }

export default function MenusClient({ menus: initial, tenantSlug, activeMenuId }: { menus: Menu[]; tenantSlug: string; activeMenuId: string | null }) {
  const [menus, setMenus] = useState(initial)
  const [selectedMenuId, setSelectedMenuId] = useState(activeMenuId)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', language: 'en', purpose: 'restaurant', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const router = useRouter()

  const input = 'w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const res = await fetch('/api/admin/menus', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setMenus(m => [...m, data]); setCreating(false); setForm({ name: '', language: 'en', purpose: 'restaurant', description: '' })
    setLoading(false)
  }

  async function handleToggle(menu: Menu, field: 'is_active' | 'is_default') {
    const update = { [field]: !menu[field] }
    const res = await fetch(`/api/admin/menus/${menu.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(update) })
    const data = await res.json()
    if (res.ok) {
      if (field === 'is_default') setMenus(m => m.map(x => ({ ...x, is_default: x.id === menu.id })))
      else setMenus(m => m.map(x => x.id === menu.id ? { ...x, ...data } : x))
    }
  }

  async function handleDelete() {
    if (!confirmId) return
    const res = await fetch(`/api/admin/menus/${confirmId}`, { method: 'DELETE' })
    if (res.ok) setMenus(m => m.filter(x => x.id !== confirmId))
    else { const d = await res.json(); setError(d.error) }
    setConfirmId(null)
  }

  async function selectMenu(menuId: string) {
    const res = await fetch('/api/admin/menus/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu_id: menuId }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Failed to select menu')
      return
    }

    setSelectedMenuId(menuId)
  }

  return (
    <div className="p-8 max-w-3xl">
      <ConfirmDialog open={!!confirmId} title="Delete menu" message="Delete this menu? All categories and products in it will also be deleted." onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-900">Menus</h1><p className="text-sm text-zinc-500 mt-1">{menus.length} menu(s)</p></div>
        <button onClick={() => setCreating(c => !c)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">+ New menu</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700 flex justify-between">{error}<button onClick={() => setError(null)}>✕</button></div>}

      {creating && (
        <form onSubmit={handleCreate} className="bg-white border border-zinc-200 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">New menu</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-zinc-600 mb-1">Name *</label><input required className={input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dinner Menu" /></div>
            <div><label className="block text-xs font-medium text-zinc-600 mb-1">Purpose</label>
              <select className={input} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}>
                {PURPOSES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-zinc-600 mb-1">Language</label>
              <select className={input} value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-zinc-600 mb-1">Description</label><input className={input} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{loading ? 'Creating...' : 'Create menu'}</button>
            <button type="button" onClick={() => setCreating(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {menus.map(menu => (
          <div key={menu.id} className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-zinc-900">{menu.name}</p>
                {menu.is_default && <span className="text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-full">Default</span>}
                {selectedMenuId === menu.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Editing</span>}
                {!menu.is_active && <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">Inactive</span>}
              </div>
              <p className="text-xs text-zinc-400 mt-1">/{menu.slug} · {menu.language.toUpperCase()} · {menu.purpose}</p>
              {menu.description && <p className="text-xs text-zinc-500 mt-0.5">{menu.description}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={async () => {
                  await selectMenu(menu.id)
                  router.push('/menu/categories')
                }}
                className="text-xs px-3 py-1.5 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
              >
                Manage items
              </button>
              <Link
                href={`/${tenantSlug}${menu.is_default ? '' : `/${menu.slug}`}`}
                target="_blank"
                className="text-xs px-3 py-1.5 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50"
              >
                View menu
              </Link>
              {!menu.is_default && (
                <button onClick={() => handleToggle(menu, 'is_default')} className="text-xs px-3 py-1.5 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50">Set default</button>
              )}
              <button onClick={() => handleToggle(menu, 'is_active')} className="text-xs px-3 py-1.5 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50">{menu.is_active ? 'Deactivate' : 'Activate'}</button>
              {!menu.is_default && (
                <button onClick={() => setConfirmId(menu.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
