import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger } from '@/store/logger-store'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as Blob

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    const audioFile = new File([audio], 'audio.wav', {
      type: 'audio/wav'
    })

    logger.info('Transcribing audio')
    
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json'
    })

    logger.info('Transcription result:', response)

    return NextResponse.json({ 
      text: response.text,
      detectedLanguage: response.language || 'en'  // Default to English if no language detected
    })
  } catch (error) {
    logger.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
} 