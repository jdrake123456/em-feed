'use client'

import { useState } from 'react'
import { Source } from '@/types'
import toast from 'react-hot-toast'

interface SourceListProps {
  sources: Source[]
  onUpdate: (id: string, changes: Partial<Source>) => void
  onDelete: (id: string) => void
}

export default function SourceList({ sources, onUpdate, onDelete }: SourceListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function toggleActive(source: Source) {
    try {
      const res = await fetch(`/api/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: \!source.is_active }),
      })
      if (res.ok) {
        onUpdate(source.id, { is_active: \!source.is_active })
      }
    } catch {
      toast.error('Update failed')
    }
  }

  async function deleteSource(id: string) {
    if (\!confirm('Remove this source? Articles already fetched will remain.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete(id)
        toast.success('Source removed')
      }
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  function formatDate(dateStr: string | null) {
    if (\!dateStr) return 'Never'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    } catch { return 'Unknown' }
  }

  const typeColor = { blog: '#4f8ef7', journal: '#a855f7' }

  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <div
          key={source.id}
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{
            backgroundColor: '#1a1d27',
            border: '1px solid #2a2d3a',
            opacity: source.is_active ? 1 : 0.5,
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium text-gray-200 truncate">{source.name}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded shrink-0"
                style={{
                  backgroundColor: `${typeColor[source.type]}20`,
                  color: typeColor[source.type],
                }}
              >
                {source.type}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate">{source.url}</p>
            <p className="text-xs text-gray-600 mt-0.5">Last fetched: {formatDate(source.last_fetched_at)}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle active */}
            <button
              onClick={() => toggleActive(source)}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              style={{ backgroundColor: source.is_active ? '#4f8ef7' : '#374151' }}
              title={source.is_active ? 'Disable' : 'Enable'}
            >
              <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                style={{ transform: source.is_active ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteSource(source.id)}
              disabled={deleting === source.id}
              className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
