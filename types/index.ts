export interface Article {
  id: string
  title: string
  url: string
  source_name: string
  source_type: 'blog' | 'journal' | 'manual'
  published_at: string | null
  description: string | null
  summary: string | null
  summary_generated_at: string | null
  is_saved: boolean
  is_archived: boolean
  is_read: boolean
  created_at: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  color: string
  is_predefined: boolean
  created_at: string
}

export interface Source {
  id: string
  name: string
  url: string
  type: 'blog' | 'journal' | 'podcast' | 'other'
  is_active: boolean
  last_fetched_at: string | null
  created_at: string
}

export interface ArticleFilters {
  source?: string
  tag?: string
  type?: 'blog' | 'journal' | 'podcast' | 'other' | 'manual' | ''
  saved?: boolean
  search?: string
}
