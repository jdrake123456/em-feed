import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: article_id } = params;
  const body = await request.json();
  const { tag_id } = body;

  if (!tag_id) {
    return NextResponse.json({ error: 'tag_id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('article_tags')
    .insert({ article_id, tag_id });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Tag already assigned' }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: article_id } = params;
  const { searchParams } = new URL(request.url);
  const tag_id = searchParams.get('tag_id');

  if (!tag_id) {
    return NextResponse.json({ error: 'tag_id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('article_tags')
    .delete()
    .eq('article_id', article_id)
    .eq('tag_id', tag_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
