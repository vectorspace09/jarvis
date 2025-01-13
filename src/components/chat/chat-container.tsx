"use client"

import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/chat-store'
import { ChatMessage } from './chat-message'
import { VoiceRecorder } from '../voice/voice-recorder'
import { motion } from 'framer-motion'
import { VoiceSettings } from '../voice/voice-settings'
import { AudioProgress } from '../voice/audio-progress'
import { VoiceErrorBoundary } from '../voice/voice-error-boundary'
import { StoreMonitor } from '../debug/store-monitor'
import { logger } from '@/store/logger-store'

export function ChatContainer() {
  const messages = useChatStore((state) => {
    logger.info('ChatContainer - Getting messages from store:', state.messages)
    return state.messages
  })
  const isProcessing = useChatStore((state) => state.isProcessing)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Add debug render
  logger.info('ChatContainer - Rendering with messages:', messages)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <StoreMonitor />
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to Jarvis</h2>
              <p className="text-muted-foreground">
                Click the microphone button and start speaking to interact with me.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            logger.info('ChatContainer - Rendering message:', message)
            return (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatMessage message={message} />
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Processing your request...
        </div>
      )}

      {/* Voice controls */}
      <div className="p-4 border-t">
        <div className="flex justify-center items-center gap-4">
          <VoiceSettings />
          <VoiceErrorBoundary>
            <VoiceRecorder />
          </VoiceErrorBoundary>
        </div>
      </div>
      
      <AudioProgress />
    </div>
  )
} 