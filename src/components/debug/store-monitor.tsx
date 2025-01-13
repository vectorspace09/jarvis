"use client"

import { useEffect } from 'react'
import { useChatStore } from '@/store/chat-store'
import { logger } from '@/store/logger-store'

export function StoreMonitor() {
  const messages = useChatStore((state) => {
    logger.info('StoreMonitor - Current messages:', state.messages)
    return state.messages
  })
  
  useEffect(() => {
    logger.info('StoreMonitor - Messages updated:', messages)
  }, [messages])
  
  return null
} 