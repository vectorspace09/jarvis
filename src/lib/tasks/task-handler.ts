import { TaskManager } from './task-manager';
import { logger } from '@/store/logger-store';
import type { CreateTaskInput, Task, TaskStatus } from '@/types/tasks';

export class TaskHandler {
  private static instance: TaskHandler;
  private taskManager: TaskManager;

  private constructor() {
    this.taskManager = TaskManager.getInstance();
  }

  static getInstance(): TaskHandler {
    if (!TaskHandler.instance) {
      TaskHandler.instance = new TaskHandler();
    }
    return TaskHandler.instance;
  }

  async handleTaskCommand(command: {
    action: 'create' | 'update' | 'complete' | 'list';
    taskInput?: CreateTaskInput;
    taskId?: string;
    status?: TaskStatus;
    conversationId: string;
  }): Promise<{
    success: boolean;
    message: string;
    tasks?: Task[];
    task?: Task;
  }> {
    try {
      switch (command.action) {
        case 'create':
          if (!command.taskInput) {
            throw new Error('Task input required for creation');
          }
          const task = await this.taskManager.createTask(command.taskInput, command.conversationId);
          return {
            success: true,
            message: `Created task: ${task.title}`,
            task
          };

        case 'update':
          if (!command.taskId) {
            throw new Error('Task ID required for update');
          }
          const updatedTask = await this.taskManager.updateTask(command.taskId, {
            status: command.status
          });
          return {
            success: true,
            message: `Updated task: ${updatedTask.title}`,
            task: updatedTask
          };

        case 'complete':
          if (!command.taskId) {
            throw new Error('Task ID required for completion');
          }
          const completedTask = await this.taskManager.updateTask(command.taskId, {
            status: 'completed'
          });
          return {
            success: true,
            message: `Completed task: ${completedTask.title}`,
            task: completedTask
          };

        case 'list':
          const tasks = await this.taskManager.getPendingTasks();
          return {
            success: true,
            message: `Found ${tasks.length} pending tasks`,
            tasks
          };

        default:
          throw new Error('Unknown task action');
      }
    } catch (error) {
      logger.error('Task command failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Task operation failed'
      };
    }
  }

  async parseNaturalLanguage(text: string): Promise<{
    action: 'create' | 'update' | 'complete' | 'list';
    taskInput?: CreateTaskInput;
    confidence: number;
  }> {
    // We'll implement this later with OpenAI's function calling
    // For now, return a basic parsing
    if (text.toLowerCase().includes('create') || text.toLowerCase().includes('add')) {
      return {
        action: 'create',
        taskInput: {
          title: text.replace(/create|add/i, '').trim(),
          priority: 'medium'
        },
        confidence: 0.8
      };
    }

    if (text.toLowerCase().includes('list') || text.toLowerCase().includes('show')) {
      return {
        action: 'list',
        confidence: 0.9
      };
    }

    return {
      action: 'list',
      confidence: 0.5
    };
  }
} 