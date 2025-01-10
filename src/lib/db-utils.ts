import { supabase } from './database'
import type { Task, Reminder } from '@/types'

export async function getUpcomingReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .gte('reminder_time', new Date().toISOString())
    .order('reminder_time', { ascending: true })
    .limit(5)

  if (error) throw error
  return data
}

export async function getActiveTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress'])
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

export async function markReminderAsTriggered(reminderId: string) {
  const { error } = await supabase
    .from('reminders')
    .update({
      status: 'triggered',
      triggered_at: new Date().toISOString()
    })
    .eq('id', reminderId)

  if (error) throw error
} 