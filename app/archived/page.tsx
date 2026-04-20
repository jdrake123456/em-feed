'use client';

import { useEffect, useState, useCallback } from 'react';
import { Article, Tag } from '@/types';
import FeedCard from '@/components/FeedCard';
import toast from 'react-hot-toast';

export default function ArchivedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles?archived=true');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      toast.error('Failed to load archived articles');
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchArticles();
    fetchTags();
  }, [fetchArticles, fetchTags]);

  const handleArticleUpdate = useCallback((updated: Article) => {
    setArticles(prev => {
      const mapped = prev.map(a => (a.id === updated.id ? { ...a, ...updated } : a));
      return mapped.filter(a => a.is_archived);
    });
  }, []);

  const handleArticleRemove = useCallback((id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#e2e8f0] mb-4">Archived</h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#1a1d27] rounded-xl p-4 animate-pulse" style={{ height: '120px' }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-[#6b7280]">
          <p className="text-lg font-medium text-[#94a3b8]">No archived articles</p>
          <p className="text-sm mt-1">Archive articles from the feed to see them here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
    </div>
  );
}
