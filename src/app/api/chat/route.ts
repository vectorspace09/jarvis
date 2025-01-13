import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Message } from '@/types'
import { logger } from '@/store/logger-store'
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/language-utils'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions' 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Fix the message type
const mapToOpenAIMessage = (msg: Message): ChatCompletionMessageParam => ({
  role: msg.role as 'user' | 'assistant' | 'system',
  content: msg.content
})

export async function POST(request: Request) {
  try {
    logger.info('Chat request received')
    const { messages, language } = await request.json()
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const systemPrompt: ChatCompletionMessageParam = {
      role: 'system',
      content: `You are Jarvis, a friendly and intelligent AI assistant. Keep these guidelines in mind:
- Be conversational and natural, like a helpful friend
- Keep responses concise and direct
- Maintain context from previous messages
- If you don't understand something, ask for clarification naturally
- Match the user's tone and energy level
- Respond in ${SUPPORTED_LANGUAGES[language as LanguageCode] || 'English'}
- Don't say "feel free to ask" repeatedly
- Don't mention being an AI unless relevant
- Remember previous context in the conversation`
    }

    logger.info('Sending to OpenAI:', { messages: messages })

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        systemPrompt,
        ...messages.map(mapToOpenAIMessage)
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    })

    const reply = response.choices[0].message
    logger.info('OpenAI response:', reply)

    const responseMessage = {
      role: 'assistant',
      content: reply.content,
      language: language,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({ message: responseMessage })

  } catch (error) {
    logger.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 