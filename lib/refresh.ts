import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchFeedItems } from '@/lib/rss';
import { Source } from '@/types';

export async function runRefresh() {
  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true);

  if (sourcesError) {
    return NextResponse.json({ error: sourcesError.message }, { status: 500 });
  }

  if (!sources || sources.length === 0) {
    return NextResponse.json({ message: 'No active sources', newCount: 0 });
  }

  let totalNew = 0;
  const errors: string[] = [];

  for (const source of sources as Source[]) {
    const items = await fetchFeedItems(source);

    if (items.length === 0) {
      errors.push(`No items from ${source.name}`);
      continue;
    }

    const toInsert = items.map(item => ({
      title: item.title,
      url: item.url,
      source_name: item.source_name,
      source_type: item.source_type,
      description: item.description,
      published_at: item.published_at,
    }));

    const batchSize = 50;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { data: inserted, error: insertError } = await supabase
        .from('articles')
        .upsert(batch, { onConflict: 'url', ignoreDuplicates: true })
        .select('id');

      if (insertError) {
        console.error(`Error inserting batch for ${source.name}:`, insertError.message);
        errors.push(`Insert error for ${source.name}: ${insertError.message}`);
      } else {
        totalNew += (inserted || []).length;
      }
    }

    await supabase
      .from('sources')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', source.id);
  }

  return NextResponse.json({
    message: 'Refresh complete',
    newCount: totalNew,
    sourcesProcessed: sources.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
