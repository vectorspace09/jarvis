export interface User {
  id: string
  created_at: string
  email: string | null
  name: string | null
  preferences: UserPreferences
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  voice_id?: string
  notification_preferences?: {
    email?: boolean
    push?: boolean
    sound?: boolean
  }
}

export interface Conversation {
  id: string
  user_id: string
  created_at: string
  title: string | null
  messages: Message[]
  context: ConversationContext
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  language?: string
}

export interface ConversationContext {
  last_topic?: string
  referenced_tasks?: string[]
  user_preferences?: Record<string, any>
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  completed_at: string | null
}

export interface Reminder {
  id: string
  user_id: string
  task_id: string | null
  message: string
  reminder_time: string
  status: 'pending' | 'triggered' | 'cancelled'
  created_at: string
  triggered_at: string | null
} 