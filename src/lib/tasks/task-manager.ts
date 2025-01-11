import { supabase } from '@/lib/supabase';
import { logger } from '@/store/logger-store';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority } from '@/types/tasks';
import { NotificationManager } from '@/lib/notifications/notification-manager';

export class TaskManager {
  private static instance: TaskManager;
  private notificationManager: NotificationManager;

  private constructor() {
    this.notificationManager = new NotificationManager();
  }

  static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  async createTask(input: CreateTaskInput, conversationId?: string): Promise<Task> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          title: input.title,
          description: input.description,
          priority: input.priority || 'medium',
          due_date: input.dueDate?.toISOString(),
          tags: input.tags,
          metadata: input.metadata
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Task created:', { taskId: data.id, title: input.title });
      return this.mapTaskFromDB(data);
    } catch (error) {
      logger.error('Failed to create task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          status: updates.status,
          due_date: updates.dueDate?.toISOString(),
          completed_at: updates.status === 'completed' ? new Date().toISOString() : null,
          tags: updates.tags,
          metadata: updates.metadata
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Task updated:', { taskId, updates });
      return this.mapTaskFromDB(data);
    } catch (error) {
      logger.error('Failed to update task:', error);
      throw error;
    }
  }

  async getTasksByConversation(conversationId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select()
        .eq('conversation_id', conversationId);

      if (error) throw error;
      return data.map(this.mapTaskFromDB);
    } catch (error) {
      logger.error('Failed to get tasks by conversation:', error);
      throw error;
    }
  }

  async getPendingTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select()
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data.map(this.mapTaskFromDB);
    } catch (error) {
      logger.error('Failed to get pending tasks:', error);
      throw error;
    }
  }

  private mapTaskFromDB(data: any): Task {
    return {
      id: data.id,
      userId: data.user_id,
      conversationId: data.conversation_id,
      title: data.title,
      description: data.description,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      metadata: data.metadata,
      tags: data.tags
    };
  }
} 