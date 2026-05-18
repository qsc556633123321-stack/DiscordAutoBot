create table if not exists public.dashboard_sessions (
  id text primary key,
  access_token text not null,
  refresh_token text,
  expires_at bigint,
  user_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.panel_drafts (
  guild_id text not null,
  channel_id text not null,
  panel_type text not null default 'custom',
  title text not null default '',
  content text not null default '',
  color text not null default '#5865F2',
  buttons text not null default '',
  footer text not null default '',
  image text not null default '',
  message_id text,
  updated_at timestamptz not null default now(),
  primary key (guild_id, channel_id)
);

create table if not exists public.ai_cleanup_suggestions (
  id bigserial primary key,
  guild_id text not null,
  channel_name text,
  suggested_category text,
  confidence text,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists panel_drafts_guild_id_idx on public.panel_drafts (guild_id);
create index if not exists ai_cleanup_suggestions_guild_id_idx on public.ai_cleanup_suggestions (guild_id, created_at desc);
