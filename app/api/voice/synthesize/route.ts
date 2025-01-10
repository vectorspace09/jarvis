import { NextResponse } from 'next/server'
import { logger } from '@/store/logger-store'
import type { LanguageCode } from '@/lib/language-utils'
import type { VoiceSettings } from '@/types/voice'
import { detectEmotion } from '@/lib/emotion-detector'

const VOICE_MAP: Record<LanguageCode, Record<string, string>> = {
  en: {
    female: "21m00Tcm4TlvDq8ikWAM",  // Rachel
    male: "ErXwobaYiN019PkySvjV",    // Antoni
    british: "pNInz6obpgDQGcFmaJgB", // Harry
    american: "EXAVITQu4vr4xnSDxMaL" // Josh
  },
  hi: {
    default: "AZnzlk1XvdvUeBnXmlld" // Hindi voice
  },
  ur: {
    default: "AZnzlk1XvdvUeBnXmlld" // Using Hindi voice for Urdu
  }
}

export async function POST(request: Request) {
  try {
    const { 
      text, 
      language = 'en',
      settings
    }: { 
      text: string
      language: LanguageCode
      settings: VoiceSettings
    } = await request.json()
    
    if (!text?.trim()) {
      logger.warn('Empty text received for synthesis')
      return new Response(null)
    }

    // Detect emotion if not specified
    const emotion = settings.emotion || detectEmotion(text)
    
    // Get voice ID based on language and voice type
    const voiceId = VOICE_MAP[language]?.[settings.voice] || 
                   VOICE_MAP[language]?.default ||
                   VOICE_MAP.en.male

    // Calculate speed multiplier
    const speedMultiplier = {
      'very-slow': 0.5,
      'slow': 0.75,
      'normal': 1.0,
      'fast': 1.25,
      'very-fast': 1.5
    }[settings.speed]

    logger.info('Synthesizing speech:', {
      language,
      emotion,
      voiceId,
      settings
    })

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.clarity,
          style: settings.style === 'natural' ? 0.5 : 
                 settings.style === 'formal' ? 0.8 :
                 settings.style === 'casual' ? 0.3 : 0.5,
          speaking_rate: speedMultiplier,
          pitch: settings.pitch
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