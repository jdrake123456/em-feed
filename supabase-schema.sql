-- Run this entire file in the Supabase SQL Editor for your project.

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('blog', 'journal', 'manual', 'podcast', 'other')),
  published_at TIMESTAMPTZ,
  description TEXT,
  summary TEXT,
  summary_generated_at TIMESTAMPTZ,
  is_saved BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#4f8ef7',
  is_predefined BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article-tag junction
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Sources table
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blog', 'journal', 'podcast', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predefined tags
INSERT INTO tags (name, color, is_predefined) VALUES
  ('Airway', '#ef4444', TRUE),
  ('Resuscitation', '#f97316', TRUE),
  ('Toxicology', '#a855f7', TRUE),
  ('Trauma', '#dc2626', TRUE),
  ('Ultrasound', '#3b82f6', TRUE),
  ('Cardiology', '#ec4899', TRUE),
  ('Neurology', '#14b8a6', TRUE),
  ('Pediatrics', '#84cc16', TRUE),
  ('Critical Care', '#f59e0b', TRUE),
  ('Procedures', '#6366f1', TRUE);

-- Indexes for common queries
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_is_saved ON articles(is_saved) WHERE is_saved = TRUE;
CREATE INDEX idx_articles_is_archived ON articles(is_archived);
CREATE INDEX idx_articles_source_name ON articles(source_name);

-- Row Level Security
-- Enables RLS on all tables (blocks direct anon API access by default),
-- then grants full access so the app works. Tighten when auth is added.
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full access" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON article_tags FOR ALL USING (true) WITH CHECK (true);
