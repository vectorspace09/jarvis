-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    email text unique,
    name text,
    preferences jsonb default '{}'::jsonb
);

-- Conversations table
create table public.conversations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text,
    messages jsonb[] default array[]::jsonb[],
    context jsonb default '{}'::jsonb
);

-- Tasks table
create table public.tasks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade,
    title text not null,
    description text,
    due_date timestamp with time zone,
    status text default 'pending',
    priority text default 'medium',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

-- Reminders table
create table public.reminders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade,
    task_id uuid references public.tasks(id) on delete cascade,
    message text not null,
    reminder_time timestamp with time zone not null,
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    triggered_at timestamp with time zone
); 