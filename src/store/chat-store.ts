import { create } from 'zustand'
import type { Message } from '@/types'
import { logger } from '@/store/logger-store'
import { audioQueue } from '@/lib/audio-queue'
import { detectLanguage } from '@/lib/language-utils'
import { useVoiceStore } from './voice-store'
import { ConversationManager } from '@/lib/voice/conversation-manager'

interface ChatState {
  messages: Message[]
  context: {
    lastTopic?: string
    userPreferences?: Record<string, any>
    conversationHistory?: string[]
  }
  isProcessing: boolean
  currentConversationId: string | null
  addMessage: (message: Message) => void
  processMessage: (message: Message, speak?: boolean) => Promise<void>
  setProcessing: (processing: boolean) => void
  setConversationId: (id: string) => void
  reset: () => void
  processMessageStream: (message: Message) => Promise<Message | null>
  currentLanguage: string
  setLanguage: (language: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  context: {},
  isProcessing: false,
  currentConversationId: null,
  addMessage: (message) => {
    logger.info('ChatStore - Before adding message:', {
      message,
      currentMessages: get().messages
    })
    
    set(state => {
      const newMessages = [...state.messages, message]
      logger.info('ChatStore - After adding message:', {
        newMessages,
        messageCount: newMessages.length
      })
      
      return { 
        messages: newMessages,
        context: {
          ...state.context,
          lastTopic: message.content,
          conversationHistory: newMessages.slice(-5).map(m => m.content)
        }
      }
    })
  },
  processMessage: async (message, speak = true) => {
    const conversationManager = ConversationManager.getInstance()
    
    set((state) => ({ 
      messages: [...state.messages, message],
      isProcessing: true 
    }))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...get().messages, message],
          language: message.language || 'en'
        }),
      })

      if (!response.ok) throw new Error('Failed to process message')

      const { message: reply } = await response.json()
      set((state) => ({ 
        messages: [...state.messages, reply],
        isProcessing: false
      }))

      // Use conversation manager to handle speech
      if (speak) {
        await conversationManager.processResponse(reply.content)
      }
    } catch (error) {
      logger.error('Error processing message:', error)
      set({ isProcessing: false })
    }
  },
  setProcessing: (processing) => set({ isProcessing: processing }),
  setConversationId: (id) => set({ currentConversationId: id }),
  reset: () => set({ messages: [], currentConversationId: null }),
  processMessageStream: async (message): Promise<Message | null> => {
    // Detect language from the message content
    const detectedLanguage = detectLanguage(message.content)
    message.language = detectedLanguage // Set the detected language

    set((state) => ({ 
      messages: [...state.messages, message],
      isProcessing: true,
      currentLanguage: detectedLanguage
    }))

    try {
      logger.info('User message:', message)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...get().messages, message],
          language: detectedLanguage
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        logger.error('Chat API error:', errorData)
        throw new Error('Failed to process message')
      }

      const data = await response.json()
      logger.info('Agent response:', data.message)
      
      // Update messages first
      set((state) => ({
        messages: [...state.messages, data.message],
        isProcessing: false
      }))

      // Then synthesize speech
      try {
        logger.info('Starting speech synthesis')
        const voiceSettings = useVoiceStore.getState()
        
        const speechResponse = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: data.message.content,
            language: detectedLanguage,
            settings: {
              voice: voiceSettings.voice,
              style: voiceSettings.style,
              emotion: voiceSettings.emotion,
              speed: voiceSettings.speed,
              volume: voiceSettings.volume,
              pitch: voiceSettings.pitch,
              stability: voiceSettings.stability,
              clarity: voiceSettings.clarity
            }
          })
        })

        if (speechResponse.ok) {
          const audioBlob = await speechResponse.blob()
          const audio = new Audio(URL.createObjectURL(audioBlob))
          await audio.play()
          logger.info('Audio playback started')
        } else {
          const errorText = await speechResponse.text()
          logger.error('Speech synthesis failed:', errorText)
        }
      } catch (speechError) {
        logger.error('Speech synthesis error:', speechError)
      }

      // Return the assistant's message
      return data.message

    } catch (error) {
      logger.error('Error processing message:', error)
      set({ isProcessing: false })
      return null
    }
  },
  currentLanguage: 'en',
  setLanguage: (language) => set({ currentLanguage: language }),
})) 