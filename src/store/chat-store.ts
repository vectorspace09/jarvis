import { create } from 'zustand'
import type { Message } from '@/types'
import { logger } from '@/store/logger-store'
import { audioQueue } from '@/lib/audio-queue'
import { detectLanguage } from '@/lib/language-utils'

interface ChatState {
  messages: Message[]
  isProcessing: boolean
  currentConversationId: string | null
  addMessage: (message: Message) => void
  processMessage: (message: Message, speak?: boolean) => Promise<void>
  setProcessing: (processing: boolean) => void
  setConversationId: (id: string) => void
  reset: () => void
  processMessageStream: (message: Message) => Promise<void>
  currentLanguage: string
  setLanguage: (language: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isProcessing: false,
  currentConversationId: null,
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  processMessage: async (message, speak = true) => {
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
          messages: [...get().messages, message]
        }),
      })

      if (!response.ok) throw new Error('Failed to process message')

      const { message: reply } = await response.json()
      set((state) => ({ 
        messages: [...state.messages, reply],
        isProcessing: false
      }))

      // Speak the response if enabled
      if (speak) {
        const speechResponse = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: reply.content }),
        })

        if (speechResponse.ok) {
          const audioBlob = await speechResponse.blob()
          const audio = new Audio(URL.createObjectURL(audioBlob))
          await audio.play()
        }
      }
    } catch (error) {
      console.error('Error processing message:', error)
      set({ isProcessing: false })
    }
  },
  setProcessing: (processing) => set({ isProcessing: processing }),
  setConversationId: (id) => set({ currentConversationId: id }),
  reset: () => set({ messages: [], currentConversationId: null }),
  processMessageStream: async (message) => {
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
        const speechResponse = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: data.message.content,
            language: detectedLanguage,
            voiceType: 'female',  // Default to female voice
            preset: 'natural'     // Default to natural preset
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

    } catch (error) {
      logger.error('Error processing message:', error)
      set({ isProcessing: false })
    }
  },
  currentLanguage: 'en',
  setLanguage: (language) => set({ currentLanguage: language }),
})) 