import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchMetaFromUrl } from '@/lib/rss';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const tag = searchParams.get('tag');
  const type = searchParams.get('type');
  const saved = searchParams.get('saved');
  const archived = searchParams.get('archived');
  const q = searchParams.get('q');

  let query = supabase
    .from('articles')
    .select(`
      *,
      article_tags (
        tags (*)
      )
    `)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (archived === 'false') {
    query = query.eq('is_archived', false);
  } else if (archived === 'true') {
    query = query.eq('is_archived', true);
  }

  if (saved === 'true') {
    query = query.eq('is_saved', true);
  }

  if (source) {
    query = query.eq('source_name', source);
  }

  if (type) {
    query = query.eq('source_type', type);
  }

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let articles = (data || []).map((article: Record<string, unknown>) => {
    const articleTags = ((article.article_tags as Array<{ tags: unknown }>) || [])
      .map((at) => at.tags)
      .filter(Boolean);
    return { ...article, article_tags: undefined, tags: articleTags };
  });

  if (tag) {
    articles = articles.filter((article) =>
      (article.tags as Array<{ name: string }>).some((t) => t.name === tag)
    );
  }

  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, title: providedTitle, source_name: providedSourceName } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let title = providedTitle;
  let description: string | null = null;

  if (!title) {
    const meta = await fetchMetaFromUrl(url);
    title = meta.title || url;
    description = meta.description;
  }

  const source_name = providedSourceName || new URL(url).hostname.replace('www.', '');

  const { data, error } = await supabase
    .from('articles')
    .insert({
      title,
      url,
      source_name,
      source_type: 'manual',
      description,
      published_at: new Date().toISOString(),
    })
    .select(`*, article_tags(tags(*))`)
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Article with this URL already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const article = {
    ...data,
    article_tags: undefined,
    tags: (data.article_tags || []).map((at: { tags: unknown }) => at.tags).filter(Boolean),
  };

  return NextResponse.json({ article }, { status: 201 });
}
