"use client"

import { ReactNode } from 'react'
import { useChatStore } from '@/stores/chat-store'

export function StoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
} 