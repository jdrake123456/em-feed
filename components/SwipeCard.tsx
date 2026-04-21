'use client'

import { useEffect, useState } from 'react'
import { Article, Tag } from '@/types'
import SummaryPanel from './SummaryPanel'
import TagModal from './TagModal'

interface SwipeCardProps {
  article: Article
  tags: Tag[]
  position: { current: number; total: number }
  exitDir: 'left' | 'right' | 'down' | null
  onSave: () => void
  onArchive: () => void
  onSkip: () => void
  onTagsChange: () => void
  onUpdate: (updated: Article) => void
}

export default function SwipeCard({
  article,
  tags,
  position,
  exitDir,
  onSave,
  onArchive,
  onSkip,
  onTagsChange,
  onUpdate,
}: SwipeCardProps) {
  const [showTagModal, setShowTagModal] = useState(false)
  const [localArticle, setLocalArticle] = useState(article)

  // Sync if parent swaps to a new article
  useEffect(() => {
    setLocalArticle(article)
  }, [article.id])

  // Keyboard handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (showTagModal) return
      if (e.key === 'ArrowRight') onSave()
      else if (e.key === 'ArrowLeft') onArchive()
      else if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        onSkip()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onSave, onArchive, onSkip, showTagModal])

  function formatDate(d: string | null) {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return '' }
  }

  const typeColors: Record<string, string> = {
    blog: '#4f8ef7',
    journal: '#a855f7',
    manual: '#f97316',
    podcast: '#10b981',
    other: '#6b7280',
  }

  const animClass =
    exitDir === 'left' ? 'animate-slide-left' :
    exitDir === 'right' ? 'animate-slide-right' :
    exitDir === 'down' ? 'animate-slide-down' : ''

  return (
    <>
      <div className={`w-full max-w-xl mx-auto flex flex-col ${animClass}`}>
        {/* Card */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}
        >
          {/* Top row: metadata + progress */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${typeColors[localArticle.source_type] ?? '#6b7280'}20`,
                  color: typeColors[localArticle.source_type] ?? '#6b7280',
                }}
              >
                {localArticle.source_type}
              </span>
              <span className="text-xs text-gray-500">{localArticle.source_name}</span>
              {localArticle.published_at && (
                <span className="text-xs text-gray-600">{formatDate(localArticle.published_at)}</span>
              )}
            </div>
            <span className="text-xs text-gray-600 shrink-0 tabular-nums">
              {position.current} / {position.total}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold text-gray-100 leading-snug">
            {localArticle.title}
          </h2>

          {/* Description */}
          {localArticle.description && (
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
              {localArticle.description}
            </p>
          )}

          {/* Tags */}
          {localArticle.tags && localArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {localArticle.tags.map(tag => (
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

          {/* AI Summary */}
          <SummaryPanel
            article={localArticle}
            onSummaryGenerated={summary => {
              const updated = { ...localArticle, summary, summary_generated_at: new Date().toISOString() }
              setLocalArticle(updated)
              onUpdate(updated)
            }}
          />

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowTagModal(true)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              + tag
            </button>
            <a
              href={localArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              Open article
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={onArchive}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
            style={{ border: '1px solid #2a2d3a', color: '#f97316' }}
            title="Archive  (←)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Archive
          </button>

          <button
            onClick={onSkip}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
            style={{ border: '1px solid #2a2d3a', color: '#6b7280' }}
            title="Skip  (↓)"
          >
            Skip
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
            style={{ border: '1px solid #2a2d3a', color: '#4f8ef7' }}
            title="Save  (→)"
          >
            Save
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-gray-700 mt-3">
          ← archive &nbsp;·&nbsp; ↓ skip &nbsp;·&nbsp; → save
        </p>
      </div>

      {showTagModal && (
        <TagModal
          article={localArticle}
          allTags={tags}
          onClose={() => setShowTagModal(false)}
          onUpdate={updatedTags => {
            const updated = { ...localArticle, tags: updatedTags }
            setLocalArticle(updated)
            onUpdate(updated)
            onTagsChange()
          }}
        />
      )}
    </>
  )
}
