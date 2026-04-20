'use client'

import { useEffect, useRef, useState } from 'react'
import { Article, Tag } from '@/types'
import toast from 'react-hot-toast'

interface TagModalProps {
  article: Article
  allTags: Tag[]
  onClose: () => void
  onUpdate: (tags: Tag[]) => void
}

export default function TagModal({ article, allTags, onClose, onUpdate }: TagModalProps) {
  const [articleTags, setArticleTags] = useState<Tag[]>(article.tags ?? [])
  const [newTagName, setNewTagName] = useState('')
  const [creating, setCreating] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function toggleTag(tag: Tag) {
    const hasTag = articleTags.some((t) => t.id === tag.id)
    try {
      const res = await fetch(`/api/articles/${article.id}/tags`, {
        method: hasTag ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId: tag.id }),
      })
      if (res.ok) {
        const updated = hasTag
          ? articleTags.filter((t) => t.id !== tag.id)
          : [...articleTags, tag]
        setArticleTags(updated)
        onUpdate(updated)
      }
    } catch {
      toast.error('Failed to update tag')
    }
  }

  async function createTag() {
    if (!newTagName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        allTags.push(data)
        await toggleTag(data)
        setNewTagName('')
      } else {
        toast.error(data.error ?? 'Failed to create tag')
      }
    } catch {
      toast.error('Failed to create tag')
    } finally {
      setCreating(false)
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
        className="w-full max-w-sm rounded-xl p-5 shadow-2xl"
        style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Tags</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map((tag) => {
            const active = articleTags.some((t) => t.id === tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: active ? tag.color : 'transparent',
                  border: `1px solid ${tag.color}`,
                  color: active ? '#fff' : tag.color,
                }}
              >
                {tag.name}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createTag() }}
            className="flex-1 rounded-md px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: '#0f1117',
              border: '1px solid #2a2d3a',
              color: '#e5e7eb',
            }}
          />
          <button
            onClick={createTag}
            disabled={creating || !newTagName.trim()}
            className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: '#4f8ef7', color: '#fff' }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
