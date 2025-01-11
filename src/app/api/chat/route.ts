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
    
    // Get conversation context from previous messages
    const conversationContext = messages.slice(-3) // Last 3 messages for context
    
    const systemPrompt = {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Using GPT-4 for better conversation
      messages: [
        systemPrompt,
        ...conversationContext.map((msg: Message) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6, // Encourage more varied responses
      frequency_penalty: 0.5 // Discourage repetitive phrases
    })

    const reply = response.choices[0].message

    const responseMessage = {
      role: 'assistant',
      content: reply.content,
      language: language,
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