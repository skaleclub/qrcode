'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function CopyMenuUrl({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`)
  }, [path])

  const handleCopy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  if (!url) return null

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-md">
      <div className="relative flex-1 flex items-center w-full">
        <input
          type="text"
          readOnly
          value={url}
          className="w-full bg-white border border-zinc-200 text-zinc-800 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block px-3 py-2.5 pr-10"
        />
        <button
          onClick={handleCopy}
          className="absolute right-2 p-1.5 text-zinc-500 hover:text-zinc-900 bg-white rounded-md transition-colors"
          title="Copiar URL"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>
      </div>
      <Link
        href={url}
        target="_blank"
        className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors shrink-0 w-full sm:w-auto text-sm"
      >
        <ExternalLink size={16} />
        Abrir
      </Link>
    </div>
  )
}
