export * from './database'
export * from './supabase'
export * from './next-themes' 

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  language?: string
} 