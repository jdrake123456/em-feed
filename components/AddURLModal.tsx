'use client'

import { useEffect, useRef, useState } from 'react'
import { Article } from '@/types'
import toast from 'react-hot-toast'

interface AddURLModalProps {
  onClose: () => void
  onAdded: (article: Article) => void
}

export default function AddURLModal({ onClose, onAdded }: AddURLModalProps) {
  const [url, setUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [loading, setLoading] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleAdd() {
    if (!url.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), source_name: sourceName.trim() || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        onAdded(data.article)
        toast.success('Article added')
        onClose()
      } else {
        toast.error(data.error ?? 'Failed to add article')
      }
    } catch {
      toast.error('Failed to add article')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-xl p-5 shadow-2xl"
        style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Add article</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <input
            ref={inputRef}
            type="url"
            placeholder="Article URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: '#0f1117', border: '1px solid #2a2d3a', color: '#e5e7eb' }}
          />
          <input
            type="text"
            placeholder="Source name (optional)"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            className="w-full rounded-md px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: '#0f1117', border: '1px solid #2a2d3a', color: '#e5e7eb' }}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2.5 rounded-md text-sm text-gray-400 hover:text-white transition-colors"
            style={{ border: '1px solid #2a2d3a' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={loading || !url.trim()}
            className="flex-1 px-3 py-2.5 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: '#4f8ef7', color: '#fff' }}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
