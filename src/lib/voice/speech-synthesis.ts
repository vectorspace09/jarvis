import { logger } from '@/store/logger-store'

export async function synthesizeSpeech(text: string, language: string) {
  try {
    const response = await fetch('/api/voice/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language })
    })

    if (!response.ok) {
      const error = await response.json()
      logger.error('Speech synthesis failed:', error)
      throw new Error(`Failed to synthesize speech: ${error.message}`)
    }

    return response
  } catch (error) {
    logger.error('Speech synthesis error:', error)
    throw error
  }
} 