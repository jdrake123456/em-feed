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
  description: string | null
  published_at: string | null
}

export async function fetchFeed(source: Source): Promise<ParsedItem[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items.map((item) => ({
      title: item.title?.trim() ?? 'Untitled',
      url: item.link ?? item.guid ?? '',
      description: stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? null),
      published_at: item.pubDate ?? item.isoDate ?? null,
    })).filter((item) => item.url \!== '')
  } catch (err) {
    console.error(`Failed to fetch feed for ${source.name} (${source.url}):`, err)
    return []
  }
}

function stripHtml(html: string | null): string | null {
  if (\!html) return null
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)
}
