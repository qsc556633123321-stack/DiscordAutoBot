-- KU HUB Data Architecture Sprint 01
-- DRAFT ONLY: reviewed schema proposal. Do not apply automatically.
-- Discord snowflakes are stored as text to preserve exact identity.

begin;
create extension if not exists pgcrypto;

create table if not exists public.guilds (
  discord_guild_id text primary key,
  name text not null,
  governance_rule_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  canonical_game_id text primary key,
  display_name text not null,
  aliases jsonb not null default '[]'::jsonb,
  layout_profile text not null check (layout_profile in ('full', 'compact', 'voice_only')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guild_games (
  discord_guild_id text not null references public.guilds(discord_guild_id) on delete cascade,
  canonical_game_id text not null references public.games(canonical_game_id),
  status text not null default 'active' check (status in ('active', 'archived')),
  tier text not null default 'other',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (discord_guild_id, canonical_game_id)
);

create table if not exists public.channel_bindings (
  discord_channel_id text primary key,
  discord_guild_id text not null references public.guilds(discord_guild_id) on delete cascade,
  canonical_key text not null,
  canonical_game_id text references public.games(canonical_game_id),
  parent_discord_channel_id text,
  channel_type text not null,
  desired_name text not null,
  lifecycle text not null default 'persistent',
  rule_version text not null,
  source_snapshot_hash text,
  permission_fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discord_guild_id, canonical_key)
);

create table if not exists public.role_bindings (
  discord_role_id text primary key,
  discord_guild_id text not null references public.guilds(discord_guild_id) on delete cascade,
  canonical_role_key text not null,
  canonical_game_id text references public.games(canonical_game_id),
  desired_name text not null,
  rule_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discord_guild_id, canonical_role_key)
);

create table if not exists public.game_suggestions (
  id uuid primary key default gen_random_uuid(),
  discord_guild_id text not null references public.guilds(discord_guild_id) on delete cascade,
  canonical_game_id text references public.games(canonical_game_id),
  submitted_by_discord_user_id text not null,
  submitted_name text not null,
  normalized_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'duplicate')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discord_guild_id, normalized_name, status)
);

create table if not exists public.suggestion_reviews (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.game_suggestions(id) on delete cascade,
  reviewer_discord_user_id text not null,
  decision text not null check (decision in ('approved', 'rejected', 'duplicate')),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.cleanup_plans (
  id uuid primary key default gen_random_uuid(),
  discord_guild_id text not null references public.guilds(discord_guild_id) on delete cascade,
  snapshot_hash text not null,
  rule_version text not null,
  plan_fingerprint text not null,
  status text not null check (status in ('draft', 'pending_approval', 'approved', 'executing', 'completed', 'failed', 'superseded')),
  requested_by_discord_user_id text not null,
  approved_by_discord_user_id text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discord_guild_id, plan_fingerprint)
);

create table if not exists public.cleanup_actions (
  id uuid primary key default gen_random_uuid(),
  cleanup_plan_id uuid not null references public.cleanup_plans(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  action_type text not null,
  target_discord_channel_id text,
  target_discord_role_id text,
  expected_state jsonb not null default '{}'::jsonb,
  requested_state jsonb not null default '{}'::jsonb,
  rollback_state jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'rolled_back', 'partial_rollback')),
  failure_code text,
  failure_detail text,
  completed_at timestamptz,
  unique (cleanup_plan_id, sequence)
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  discord_guild_id text not null references public.guilds(discord_guild_id) on delete cascade,
  actor_discord_user_id text,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  correlation_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists guild_games_game_idx on public.guild_games (canonical_game_id);
create index if not exists channel_bindings_guild_game_idx on public.channel_bindings (discord_guild_id, canonical_game_id);
create index if not exists role_bindings_guild_game_idx on public.role_bindings (discord_guild_id, canonical_game_id);
create index if not exists suggestions_guild_status_idx on public.game_suggestions (discord_guild_id, status, created_at desc);
create index if not exists reviews_suggestion_idx on public.suggestion_reviews (suggestion_id, created_at desc);
create index if not exists cleanup_plans_guild_status_idx on public.cleanup_plans (discord_guild_id, status, created_at desc);
create index if not exists cleanup_actions_plan_status_idx on public.cleanup_actions (cleanup_plan_id, status, sequence);
create index if not exists audit_logs_guild_created_idx on public.audit_logs (discord_guild_id, created_at desc);

commit;
