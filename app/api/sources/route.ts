import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEFAULT_SOURCES } from '@/lib/default-sources';

export async function GET() {
  const { count, error: countError } = await supabase
    .from('sources')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count === 0) {
    const { error: seedError } = await supabase.from('sources').insert(DEFAULT_SOURCES);
    if (seedError) {
      console.error('Failed to seed default sources:', seedError.message);
    }
  }

  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sources: data || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, url, type } = body;

  if (!name || !url || !type) {
    return NextResponse.json({ error: 'name, url, and type are required' }, { status: 400 });
  }

  if (!['blog', 'journal', 'podcast', 'other'].includes(type)) {
    return NextResponse.json({ error: 'type must be blog, journal, podcast, or other' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sources')
    .insert({ name, url, type })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A source with this URL already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: data }, { status: 201 });
}
