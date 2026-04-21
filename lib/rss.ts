import Parser from 'rss-parser'
import { Source } from '@/types'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'EMFeed/1.0 (RSS Reader)',
  },
})

export interface ParsedItem {
  title: string
  url: string
  source_name: string
  source_type: string
  description: string | null
  published_at: string | null
}

export async function fetchFeed(source: Source): Promise<ParsedItem[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items.map((item) => ({
      title: item.title?.trim() ?? 'Untitled',
      url: item.link ?? item.guid ?? '',
      source_name: source.name,
      source_type: source.type,
      description: stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? null),
      published_at: item.pubDate ?? item.isoDate ?? null,
    })).filter((item) => item.url !== '')
  } catch (err) {
    console.error(`Failed to fetch feed for ${source.name} (${source.url}):`, err)
    return []
  }
}

// Alias used by refresh route
export const fetchFeedItems = fetchFeed

const PRIVATE_IP_RE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.)/

export async function fetchMetaFromUrl(url: string): Promise<{ title: string | null; description: string | null }> {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return { title: null, description: null }
    if (PRIVATE_IP_RE.test(parsed.hostname)) return { title: null, description: null }
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EMFeed/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    return {
      title: titleMatch ? titleMatch[1].trim() : null,
      description: descMatch ? descMatch[1].trim() : null,
    }
  } catch {
    return { title: null, description: null }
  }
}

function stripHtml(html: string | null): string | null {
  if (!html) return null
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)
}
