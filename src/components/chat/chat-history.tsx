"use client"

import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/chat-store'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatMessage } from './chat-message'

export function ChatHistory() {
  const messages = useChatStore((state) => state.messages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto max-h-[60vh]">
      <AnimatePresence>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground p-8"
          >
            <p className="text-lg font-medium mb-2">
              Welcome to Jarvis
            </p>
            <p className="text-sm">
              Start speaking or type to begin our conversation
            </p>
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ChatMessage message={message} />
            </motion.div>
          ))
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  )
} 