import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSummary } from '@/lib/anthropic';
import { fetchArticleText } from '@/lib/scraper';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, url, description, summary')
    .eq('id', id)
    .single();

  if (fetchError || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const force = new URL(request.url).searchParams.get('force') === 'true';

  if (article.summary && !force) {
    return NextResponse.json({ summary: article.summary });
  }

  try {
    const fullText = await fetchArticleText(article.url);
    const summary = await generateSummary(article.title, fullText ?? article.description);

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        summary,
        summary_generated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate summary';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
