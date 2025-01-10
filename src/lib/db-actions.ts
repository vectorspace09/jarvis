import { supabase } from './database'
import type { Message, Task, Reminder } from '@/types'

export async function createConversation(userId: string, initialMessage: Message) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      messages: [initialMessage],
      context: {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addMessageToConversation(
  conversationId: string,
  message: Message
) {
  // First get the current conversation
  const { data: conversation, error: fetchError } = await supabase
    .from('conversations')
    .select('messages')
    .eq('id', conversationId)
    .single()

  if (fetchError) throw fetchError

  // Then update with the new message
  const { data, error } = await supabase
    .from('conversations')
    .update({
      messages: [...(conversation?.messages || []), message]
    })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createTask(userId: string, task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      ...task
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createReminder(userId: string, reminder: Partial<Reminder>) {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      ...reminder
    })
    .select()
    .single()

  if (error) throw error
  return data
} 