import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateSummary(title: string, content: string | null): Promise<string> {
  const isFullText = content !== null && content.length > 500
  const label = isFullText ? 'Full article text' : 'Abstract/Excerpt'
  const body = content
    ? `Title: ${title}\n\n${label}:\n${content}`
    : `Title: ${title}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system:
      'You are a clinical educator summarizing medical literature for emergency medicine physicians. ' +
      'Be precise, use clinical language, avoid filler. ' +
      'Structure your response with these exact headers on their own lines: ' +
      'Background:, Key Points:, Clinical Takeaway:, Limitations:. ' +
      'Each section should be 1-3 sentences. ' +
      'If the source is a blog post or editorial, focus on the clinical reasoning and practical takeaways. ' +
      'If the source is a research article, focus on study design, results, and applicability.',
    messages: [
      {
        role: 'user',
        content: `Please summarize the following for an emergency physician:\n\n${body}`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic')
  return block.text
}
