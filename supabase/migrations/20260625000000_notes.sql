create table notes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  topic_id   text        not null,
  content_json jsonb     not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, topic_id)
);

alter table notes enable row level security;

create policy "Users manage their own notes"
  on notes
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index notes_user_topic_idx on notes(user_id, topic_id);
