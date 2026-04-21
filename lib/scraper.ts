const PRIVATE_IP_RE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.)/

// Returns the main body text of an article URL, or null on failure.
// Caps at 15,000 chars (~3,750 tokens) — enough for a full blog post.
export async function fetchArticleText(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    if (PRIVATE_IP_RE.test(parsed.hostname)) return null

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EMFeed/1.0; +https://em-feed.vercel.app)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return null
    const html = await res.text()
    return extractBodyText(html)
  } catch {
    return null
  }
}

function extractBodyText(html: string): string | null {
  // Strip noise sections
  let stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  // Prefer semantic content containers
  const article = stripped.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1]
  const main = stripped.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]
  const content = article ?? main ?? stripped

  const text = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 15000)

  return text.length > 200 ? text : null
}
