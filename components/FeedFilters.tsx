'use client'

import { ArticleFilters, Source, Tag } from '@/types'

interface FeedFiltersProps {
  filters: ArticleFilters
  onChange: (filters: ArticleFilters) => void
  sources: Source[]
  tags: Tag[]
}

export default function FeedFilters({ filters, onChange, sources, tags }: FeedFiltersProps) {
  function set(partial: Partial<ArticleFilters>) {
    onChange({ ...filters, ...partial })
  }

  const selectStyle = {
    backgroundColor: '#1a1d27',
    border: '1px solid #2a2d3a',
    color: '#e5e7eb',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '13px',
    outline: 'none',
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search titles..."
        value={filters.search ?? ''}
        onChange={(e) => set({ search: e.target.value })}
        style={{
          ...selectStyle,
          flexGrow: 1,
          minWidth: '160px',
        }}
      />

      {/* Source */}
      <select
        value={filters.source ?? ''}
        onChange={(e) => set({ source: e.target.value || undefined })}
        style={selectStyle}
      >
        <option value="">All sources</option>
        {sources.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Type */}
      <select
        value={filters.type ?? ''}
        onChange={(e) => set({ type: (e.target.value as ArticleFilters['type']) || undefined })}
        style={selectStyle}
      >
        <option value="">All types</option>
        <option value="blog">Blog</option>
        <option value="journal">Journal</option>
        <option value="podcast">Podcast</option>
        <option value="other">Other</option>
        <option value="manual">Manual</option>
      </select>

      {/* Tag */}
      <select
        value={filters.tag ?? ''}
        onChange={(e) => set({ tag: e.target.value || undefined })}
        style={selectStyle}
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Saved toggle */}
      <button
        onClick={() => set({ saved: filters.saved ? undefined : true })}
        style={{
          ...selectStyle,
          cursor: 'pointer',
          color: filters.saved ? '#4f8ef7' : '#6b7280',
          borderColor: filters.saved ? '#4f8ef7' : '#2a2d3a',
        }}
      >
        Saved only
      </button>
    </div>
  )
}
