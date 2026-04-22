'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4 | 5

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'bar', label: 'Bar' },
  { value: 'cafe', label: 'Café' },
  { value: 'pizzaria', label: 'Pizzaria' },
  { value: 'lanchonete', label: 'Lanchonete' },
  { value: 'padaria', label: 'Padaria' },
  { value: 'sorveteria', label: 'Sorveteria' },
  { value: 'other', label: 'Outro' },
]

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuUrl, setMenuUrl] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('restaurant')
  const [responsibleName, setResponsibleName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [menuName, setMenuName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: companyName,
        business_type: businessType,
        responsible_name: responsibleName,
        phone,
        address,
        menu_name: menuName,
        category_name: categoryName,
        product_name: productName,
        product_price: parseFloat(productPrice) || 0,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Erro ao criar restaurante')
      setLoading(false)
      return
    }

    setMenuUrl(`/${data.tenant_slug}/${data.menu_slug}`)
    setStep(5)
    setLoading(false)
  }

  const inputClass =
    'w-full px-4 py-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400'
  const primaryBtn =
    'flex-1 bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors'
  const secondaryBtn =
    'px-5 py-3 rounded-xl text-sm font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-zinc-900">XmartMenu</span>
              {step <= TOTAL_STEPS && (
                <span className="text-xs text-zinc-400">Passo {step} de {TOTAL_STEPS}</span>
              )}
            </div>
            {step <= TOTAL_STEPS && (
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                  style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Passo 1: Dados da Empresa */}
          {step === 1 && (
            <div>
              <h1 className="text-xl font-bold text-zinc-900 mb-1">Bem-vindo!</h1>
              <p className="text-sm text-zinc-500 mb-6">
                Vamos configurar seu cardápio digital. Primeiro, nos conte sobre seu negócio.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Nome da Empresa *
                  </label>
                  <input
                    autoFocus
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Ex: Pizzaria do João"
                    className={inputClass}
                    onKeyDown={e => e.key === 'Enter' && companyName.trim() && setStep(2)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Área de Atuação *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BUSINESS_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setBusinessType(type.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors text-left ${
                          businessType === type.value
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!companyName.trim()}
                className={`mt-6 w-full ${primaryBtn}`}
              >
                Continuar
              </button>
            </div>
          )}

          {/* Passo 2: Informações de Contato */}
          {step === 2 && (
            <div>
              <h1 className="text-xl font-bold text-zinc-900 mb-1">Informações de Contato</h1>
              <p className="text-sm text-zinc-500 mb-6">
                Essas informações podem aparecer no seu cardápio.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Nome do Responsável *
                  </label>
                  <input
                    autoFocus
                    value={responsibleName}
                    onChange={e => setResponsibleName(e.target.value)}
                    placeholder="Seu nome completo"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Endereço
                  </label>
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className={secondaryBtn}>
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!responsibleName.trim()}
                  className={primaryBtn}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Passo 3: Nome do Cardápio */}
          {step === 3 && (
            <div>
              <h1 className="text-xl font-bold text-zinc-900 mb-1">Seu Cardápio Digital</h1>
              <p className="text-sm text-zinc-500 mb-6">
                Dê um nome para o seu cardápio. Você pode criar mais cardápios depois.
              </p>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Nome do Cardápio *
                </label>
                <input
                  autoFocus
                  value={menuName}
                  onChange={e => setMenuName(e.target.value)}
                  placeholder='Ex: Cardápio Principal'
                  className={inputClass}
                  onKeyDown={e => e.key === 'Enter' && menuName.trim() && setStep(4)}
                />
                <p className="text-xs text-zinc-400 mt-2">
                  Sugestões: &quot;Cardápio Principal&quot;, &quot;Happy Hour&quot;, &quot;Delivery&quot;
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className={secondaryBtn}>
                  Voltar
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!menuName.trim()}
                  className={primaryBtn}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Passo 4: Primeiro Produto */}
          {step === 4 && (
            <div>
              <h1 className="text-xl font-bold text-zinc-900 mb-1">Seu Primeiro Produto</h1>
              <p className="text-sm text-zinc-500 mb-6">
                Cadastre uma categoria e o primeiro produto do seu cardápio.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Nome da Categoria *
                  </label>
                  <input
                    autoFocus
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    placeholder="Ex: Pizzas, Bebidas, Entradas"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Nome do Produto *
                  </label>
                  <input
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="Ex: Pizza Margherita"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Preço
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 select-none">
                      R$
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productPrice}
                      onChange={e => setProductPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
                  {error}
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className={secondaryBtn}>
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !categoryName.trim() || !productName.trim()}
                  className={primaryBtn}
                >
                  {loading ? 'Criando seu cardápio...' : 'Finalizar'}
                </button>
              </div>
            </div>
          )}

          {/* Passo 5: Sucesso */}
          {step === 5 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-zinc-900 mb-2">Cardápio criado!</h1>
              <p className="text-sm text-zinc-500 mb-6">
                Seu cardápio digital está pronto. Veja como ficou ou adicione mais produtos.
              </p>
              {menuUrl && (
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 font-mono hover:bg-zinc-100 transition-colors break-all"
                >
                  <svg className="w-4 h-4 shrink-0 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {typeof window !== 'undefined' ? window.location.origin : ''}{menuUrl}
                </a>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/menu/products')}
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Adicionar mais produtos
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-white text-zinc-700 py-3 rounded-xl text-sm font-semibold border border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  Ir para o dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
