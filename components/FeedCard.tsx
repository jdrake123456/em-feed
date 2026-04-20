'use client'

import { useState } from 'react'
import { Article, Tag } from '@/types'
import SummaryPanel from './SummaryPanel'
import TagModal from './TagModal'
import toast from 'react-hot-toast'

interface FeedCardProps {
  article: Article
  allTags: Tag[]
  onUpdate: (updated: Partial<Article> & { id: string }) => void
}

export default function FeedCard({ article, allTags, onUpdate }: FeedCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [localArticle, setLocalArticle] = useState(article)

  async function patch(fields: Partial<Article>) {
    try {
      const res = await fetch(`/api/articles/${localArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        const updated = { ...localArticle, ...fields }
        setLocalArticle(updated)
        onUpdate({ id: localArticle.id, ...fields })
      }
    } catch {
      toast.error('Update failed')
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }

  const typeColors: Record<string, string> = {
    blog: '#4f8ef7',
    journal: '#a855f7',
    manual: '#f97316',
  }

  return (
    <>
      <div
        className="rounded-lg mb-3 overflow-hidden transition-all"
        style={{
          backgroundColor: '#1a1d27',
          border: '1px solid #2a2d3a',
          borderLeft: !localArticle.is_read ? '3px solid #4f8ef7' : '1px solid #2a2d3a',
        }}
      >
        {/* Card header — clickable to expand */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => {
            setExpanded((v) => !v)
            if (!localArticle.is_read) patch({ is_read: true })
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${typeColors[localArticle.source_type]}20`,
                  color: typeColors[localArticle.source_type],
                }}
              >
                {localArticle.source_type}
              </span>
              <span className="text-xs text-gray-500">{localArticle.source_name}</span>
              {localArticle.published_at && (
                <span className="text-xs text-gray-600">{formatDate(localArticle.published_at)}</span>
              )}
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-100 leading-snug mb-2">
            {localArticle.title}
          </h3>

          {!expanded && localArticle.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {localArticle.description}
            </p>
          )}

          {/* Tags */}
          {localArticle.tags && localArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {localArticle.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    border: `1px solid ${tag.color}40`,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-2">
            {localArticle.description && (
              <p className="text-sm text-gray-400 leading-relaxed mb-2">
                {localArticle.description}
              </p>
            )}
            <SummaryPanel
              article={localArticle}
              onSummaryGenerated={(summary) => {
                const updated = { ...localArticle, summary, summary_generated_at: new Date().toISOString() }
                setLocalArticle(updated)
                onUpdate({ id: localArticle.id, summary })
              }}
            />
          </div>
        )}

        {/* Action bar */}
        <div
          className="flex items-center gap-1 px-4 py-2"
          style={{ borderTop: '1px solid #2a2d3a' }}
        >
          {/* Save */}
          <button
            onClick={() => patch({ is_saved: !localArticle.is_saved })}
            title={localArticle.is_saved ? 'Unsave' : 'Save'}
            className="p-1.5 rounded transition-colors hover:bg-white/5"
            style={{ color: localArticle.is_saved ? '#4f8ef7' : '#6b7280' }}
          >
            <svg className="w-4 h-4" fill={localArticle.is_saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Archive */}
          <button
            onClick={() => patch({ is_archived: !localArticle.is_archived })}
            title={localArticle.is_archived ? 'Unarchive' : 'Archive'}
            className="p-1.5 rounded transition-colors hover:bg-white/5"
            style={{ color: localArticle.is_archived ? '#f97316' : '#6b7280' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>

          {/* Tags */}
          <button
            onClick={() => setShowTagModal(true)}
            title="Add tags"
            className="p-1.5 rounded transition-colors hover:bg-white/5"
            style={{ color: '#6b7280' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>

          {/* Open link */}
          <a
            href={localArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open article"
            className="p-1.5 rounded transition-colors hover:bg-white/5 ml-auto"
            style={{ color: '#6b7280' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {showTagModal && (
        <TagModal
          article={localArticle}
          allTags={allTags}
          onClose={() => setShowTagModal(false)}
          onUpdate={(tags) => {
            const updated = { ...localArticle, tags }
            setLocalArticle(updated)
            onUpdate({ id: localArticle.id, tags })
          }}
        />
      )}
    </>
  )
}
