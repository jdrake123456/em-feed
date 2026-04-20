'use client';

import { useEffect, useState, useCallback } from 'react';
import { Source } from '@/types';
import SourceList from '@/components/SourceList';
import AddSourceModal from '@/components/AddSourceModal';
import toast from 'react-hot-toast';

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources');
      if (!res.ok) throw new Error('Failed to fetch sources');
      const data = await res.json();
      setSources(data.sources || []);
    } catch {
      toast.error('Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleToggle = useCallback(async (source: Source) => {
    try {
      const res = await fetch(`/api/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !source.is_active }),
      });
      if (!res.ok) throw new Error('Failed to update source');
      const data = await res.json();
      setSources(prev => prev.map(s => (s.id === source.id ? data.source : s)));
    } catch {
      toast.error('Failed to update source');
    }
  }, []);

  const handleDelete = useCallback(async (sourceId: string) => {
    try {
      const res = await fetch(`/api/sources/${sourceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete source');
      setSources(prev => prev.filter(s => s.id !== sourceId));
      toast.success('Source removed');
    } catch {
      toast.error('Failed to remove source');
    }
  }, []);

  const handleAddSource = useCallback((source: Source) => {
    setSources(prev => [...prev, source]);
    setShowAddModal(false);
    toast.success('Source added');
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#e2e8f0]">Sources</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-sm px-3 py-1.5 bg-[#4f8ef7] text-white rounded-md hover:bg-[#3b7de8] transition-colors"
        >
          + Add Source
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#1a1d27] rounded-xl p-4 animate-pulse" style={{ height: '72px' }} />
          ))}
        </div>
      ) : (
        <SourceList
          sources={sources}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {showAddModal && (
        <AddSourceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSource}
        />
      )}
    </div>
  );
}
