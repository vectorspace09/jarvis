import { NextResponse } from 'next/server'
import { logger } from '@/store/logger-store'
import type { LanguageCode } from '@/lib/language-utils'

// Map of language codes to ElevenLabs voice IDs
const VOICE_MAP: Record<LanguageCode, string> = {
  en: "21m00Tcm4TlvDq8ikWAM", // Rachel - English
  hi: "AZnzlk1XvdvUeBnXmlld", // Priya - Hindi
  ur: "AZnzlk1XvdvUeBnXmlld", // Use Hindi voice for Urdu (similar phonetics)
}

export async function POST(request: Request) {
  try {
    const { text, language = 'en' } = await request.json()
    
    if (!text?.trim()) {
      logger.warn('Empty text received for synthesis')
      return new Response(null)
    }

    const voiceId = VOICE_MAP[language as LanguageCode] || VOICE_MAP.en
    logger.info(`Synthesizing speech in ${language}:`, text)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2", // Use multilingual model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      logger.error('ElevenLabs API error:', errorData)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error('Empty audio response')
    }

    logger.info('Successfully synthesized speech')

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    logger.error('Speech synthesis error:', error)
    return NextResponse.json(
      { error: 'Failed to synthesize speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 