import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Message } from '@/types'
import { logger } from '@/store/logger-store'
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/language-utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    logger.info('Chat request received')
    const { messages, language } = await request.json()
    const lastMessage = messages[messages.length - 1]
    
    // Use the detected language from the last message
    const detectedLanguage = lastMessage.language || 'en'
    
    logger.info('Processing messages:', { messages, detectedLanguage })

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: 'system', 
          content: `You are Jarvis, an AI assistant. Respond in ${SUPPORTED_LANGUAGES[detectedLanguage as LanguageCode]}. Keep responses natural and conversational.` 
        },
        ...messages.map((msg: Message) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 150,
      stream: false
    })

    const reply = response.choices[0].message

    const responseMessage = {
      role: 'assistant',
      content: reply.content,
      language: detectedLanguage,
      timestamp: new Date().toISOString()
    }

    logger.info('Sending response:', responseMessage)

    return NextResponse.json({ message: responseMessage })

  } catch (error) {
    logger.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    )
  }
} 