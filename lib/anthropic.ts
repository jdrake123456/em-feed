import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateSummary(title: string, description: string | null): Promise<string> {
  const content = description
    ? `Title: ${title}\n\nAbstract/Excerpt:\n${description}`
    : `Title: ${title}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system:
      'You are a clinical educator summarizing medical literature for emergency medicine physicians. Be precise, use clinical language, avoid filler. Structure your response with these exact headers on their own lines: Background:, Methods:, Results:, Limitations:. Each section should be 1-2 sentences maximum.',
    messages: [
      {
        role: 'user',
        content: `Please summarize the following for an emergency physician:\n\n${content}`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic')
  return block.text
}
