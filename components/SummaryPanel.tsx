'use client'

import { useState } from 'react'
import { Article } from '@/types'
import toast from 'react-hot-toast'

interface SummaryPanelProps {
  article: Article
  onSummaryGenerated: (summary: string) => void
}

export default function SummaryPanel({ article, onSummaryGenerated }: SummaryPanelProps) {
  const [loading, setLoading] = useState(false)

  async function generateSummary() {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${article.id}/summarize`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        onSummaryGenerated(data.summary)
        toast.success('Summary generated')
      } else {
        toast.error(data.error ?? 'Failed to generate summary')
      }
    } catch {
      toast.error('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  if (article.summary) {
    return (
      <div
        className="mt-3 rounded-md p-3 text-sm leading-relaxed space-y-2"
        style={{ backgroundColor: '#111420', border: '1px solid #2a2d3a' }}
      >
        {article.summary.split('\n').map((line, i) => {
          const isHeader = /^(Background|Methods|Results|Limitations):/.test(line)
          return line.trim() ? (
            <p key={i} className={isHeader ? 'font-semibold text-gray-200' : 'text-gray-400'}>
              {line}
            </p>
          ) : null
        })}
        <p className="text-xs text-gray-600 pt-1">
          Generated {article.summary_generated_at ? new Date(article.summary_generated_at).toLocaleDateString() : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <button
        onClick={generateSummary}
        disabled={loading}
        className="text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        style={{
          backgroundColor: 'rgba(79,142,247,0.1)',
          border: '1px solid rgba(79,142,247,0.3)',
          color: '#4f8ef7',
        }}
      >
        {loading ? 'Generating...' : 'Generate AI Summary'}
      </button>
    </div>
  )
}
