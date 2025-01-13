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

    if (!audio || !(audio instanceof Blob)) {
      logger.error('Invalid audio format received');
      return NextResponse.json(
        { error: 'Invalid audio format' },
        { status: 400 }
      );
    }

    logger.info('Received audio for transcription:', {
      size: audio.size,
      type: audio.type
    });

    const audioFile = new File([audio], 'audio.wav', {
      type: audio.type || 'audio/webm'
    })

    logger.info('Transcribing audio...')
    
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      temperature: 0.2,
      language: 'en'
    })

    logger.info('Transcription result:', response)

    return NextResponse.json({ 
      text: response.text,
      detectedLanguage: response.language || 'en',
      confidence: 0.9
    })
  } catch (error) {
    logger.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 