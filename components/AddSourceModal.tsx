'use client'

import { useEffect, useRef, useState } from 'react'
import { Source } from '@/types'
import toast from 'react-hot-toast'

interface AddSourceModalProps {
  onClose: () => void
  onAdded: (source: Source) => void
}

export default function AddSourceModal({ onClose, onAdded }: AddSourceModalProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'blog' | 'journal'>('blog')
  const [loading, setLoading] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleAdd() {
    if (\!name.trim() || \!url.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), url: url.trim(), type }),
      })
      const data = await res.json()
      if (res.ok) {
        onAdded(data)
        toast.success('Source added')
        onClose()
      } else {
        toast.error(data.error ?? 'Failed to add source')
      }
    } catch {
      toast.error('Failed to add source')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: '#0f1117',
    border: '1px solid #2a2d3a',
    color: '#e5e7eb',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
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
          <h3 className="font-semibold text-white">Add source</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Source name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="url"
            placeholder="RSS feed URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputStyle}
          />
          <div className="flex gap-2">
            {(['blog', 'journal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize"
                style={{
                  backgroundColor: type === t ? '#4f8ef7' : 'transparent',
                  border: `1px solid ${type === t ? '#4f8ef7' : '#2a2d3a'}`,
                  color: type === t ? '#fff' : '#6b7280',
                }}
              >
                {t}
              </button>
            ))}
          </div>
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
            disabled={loading || \!name.trim() || \!url.trim()}
            className="flex-1 px-3 py-2.5 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: '#4f8ef7', color: '#fff' }}
          >
            {loading ? 'Adding...' : 'Add source'}
          </button>
        </div>
      </div>
    </div>
  )
}
