-- Create interactions table
create table interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  conversation_id uuid not null,
  prompt text not null,
  response jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table interactions enable row level security;

-- Create policies
create policy "Users can view their own interactions" on interactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own interactions if under limit" on interactions
  for insert with check (
    auth.uid() = user_id AND 
    (select count(*) from interactions where user_id = auth.uid()) < 4
  );

create policy "Users can update their own interactions" on interactions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own interactions" on interactions
  for delete using (auth.uid() = user_id);
