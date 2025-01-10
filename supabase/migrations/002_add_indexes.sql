-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON public.reminders(task_id);

-- Add row level security policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own data"
  ON public.users
  FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can only access their own conversations"
  ON public.conversations
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own tasks"
  ON public.tasks
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own reminders"
  ON public.reminders
  FOR ALL
  USING (auth.uid() = user_id); 