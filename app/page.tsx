'use client';

import { useEffect, useState, useCallback } from 'react';
import { Article, ArticleFilters, Source, Tag } from '@/types';
import FeedCard from '@/components/FeedCard';
import FeedFiltersBar from '@/components/FeedFilters';
import AddURLModal from '@/components/AddURLModal';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.source) params.set('source', filters.source);
      if (filters.tag) params.set('tag', filters.tag);
      if (filters.type) params.set('type', filters.type);
      if (filters.saved) params.set('saved', 'true');
      if (filters.search) params.set('q', filters.search);
      params.set('archived', 'false');

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch articles');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/tags');
      if (!res.ok) return;
      const data = await res.json();
      setTags(data.tags || []);
    } catch {
      // silent
    }
  }, []);

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch('/api/sources');
      if (!res.ok) return;
      const data = await res.json();
      setSources(data.sources || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchTags();
    fetchSources();
  }, [fetchTags, fetchSources]);

  const handleArticleUpdate = useCallback((updated: Article) => {
    setArticles(prev =>
      prev.map(a => (a.id === updated.id ? { ...a, ...updated } : a))
    );
  }, []);

  const handleArticleRemove = useCallback((id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleAddArticle = useCallback((article: Article) => {
    setArticles(prev => [article, ...prev]);
    setShowAddModal(false);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#e2e8f0]">Feed</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-sm px-3 py-1.5 bg-[#4f8ef7] text-white rounded-md hover:bg-[#3b7de8] transition-colors"
        >
          + Add URL
        </button>
      </div>

      <FeedFiltersBar
        filters={filters}
        onChange={setFilters}
        sources={sources}
        tags={tags}
      />

      {loading ? (
        <div className="flex flex-col gap-3 mt-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-[#1a1d27] rounded-xl p-4 animate-pulse"
              style={{ height: '120px' }}
            />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-[#6b7280]">
          <p className="text-lg font-medium text-[#94a3b8]">No articles found</p>
          <p className="text-sm mt-1">
            {Object.values(filters).some(v => v)
              ? 'Try adjusting your filters'
              : 'Click "Refresh Feed" in the navbar to fetch articles'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {articles.map(article => (
            <FeedCard
              key={article.id}
              article={article}
              tags={tags}
              onUpdate={handleArticleUpdate}
              onRemove={handleArticleRemove}
              onTagsChange={fetchTags}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddURLModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAddArticle}
        />
      )}
    </div>
  );
}
