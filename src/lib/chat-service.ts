import { openai } from './openai'
import type { Message } from '@/types'
import { createConversation, addMessageToConversation } from './db-actions'

export async function processMessage(
  userId: string,
  message: Message,
  conversationId?: string
) {
  try {
    let currentConversationId: string;

    // If no conversation ID, create a new conversation
    if (!conversationId) {
      const conversation = await createConversation(userId, message)
      currentConversationId = conversation.id
    } else {
      currentConversationId = conversationId
      // Add message to existing conversation
      await addMessageToConversation(currentConversationId, message)
    }

    // Process with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{
        role: message.role,
        content: message.content
      }],
      temperature: 0.7,
      max_tokens: 500,
    })

    const assistantMessage: Message = {
      role: 'assistant',
      content: completion.choices[0].message.content || '',
      timestamp: new Date().toISOString()
    }

    // Add assistant's response to conversation
    await addMessageToConversation(currentConversationId, assistantMessage)

    return {
      message: assistantMessage,
      conversationId: currentConversationId
    }
  } catch (error) {
    console.error('Error processing message:', error)
    throw error
  }
} 