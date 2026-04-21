'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Article, Tag } from '@/types'
import SwipeCard from '@/components/SwipeCard'
import AddURLModal from '@/components/AddURLModal'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDir, setExitDir] = useState<'left' | 'right' | 'down' | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const acting = useRef(false)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/articles?archived=false')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setArticles(data.articles || [])
      setCurrentIndex(0)
    } catch {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/tags')
      if (!res.ok) return
      const data = await res.json()
      setTags(data.tags || [])
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchArticles()
    fetchTags()
  }, [fetchArticles, fetchTags])

  function animate(dir: 'left' | 'right' | 'down', callback: () => void) {
    if (acting.current) return
    acting.current = true
    setExitDir(dir)
    setTimeout(() => {
      setExitDir(null)
      setCurrentIndex(i => i + 1)
      acting.current = false
      callback()
    }, 280)
  }

  const article = articles[currentIndex]

  async function handleSave() {
    if (!article) return
    animate('right', () => {})
    await fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_saved: true, is_read: true }),
    })
  }

  async function handleArchive() {
    if (!article) return
    animate('left', () => {})
    await fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: true, is_read: true }),
    })
  }

  function handleSkip() {
    if (!article) return
    animate('down', () => {})
    fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    })
  }

  function handleUpdate(updated: Article) {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a))
  }

  function handleAddArticle(added: Article) {
    setArticles(prev => [added, ...prev])
    setCurrentIndex(0)
    setShowAddModal(false)
  }

  const total = articles.length
  const remaining = total - currentIndex

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div
          className="w-full max-w-xl rounded-xl p-5 animate-pulse"
          style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a', height: '320px' }}
        />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <p className="text-2xl font-semibold text-gray-300">All caught up!</p>
        <p className="text-sm text-gray-600">No more articles in your feed.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={fetchArticles}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#4f8ef7', color: '#fff' }}
          >
            Refresh Feed
          </button>
          <Link
            href="/saved"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
            style={{ border: '1px solid #2a2d3a', color: '#94a3b8' }}
          >
            View Saved →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-medium text-gray-500">
          {remaining} article{remaining !== 1 ? 's' : ''} remaining
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-sm px-3 py-1.5 rounded-md transition-colors"
          style={{ backgroundColor: '#4f8ef7', color: '#fff' }}
        >
          + Add URL
        </button>
      </div>

      <SwipeCard
        article={article}
        tags={tags}
        position={{ current: currentIndex + 1, total }}
        exitDir={exitDir}
        onSave={handleSave}
        onArchive={handleArchive}
        onSkip={handleSkip}
        onTagsChange={fetchTags}
        onUpdate={handleUpdate}
      />

      {showAddModal && (
        <AddURLModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAddArticle}
        />
      )}
    </div>
  )
}
