export * from './database'
export * from './supabase'
export * from './voice' 

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  language?: string
} 