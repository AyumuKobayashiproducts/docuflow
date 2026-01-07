-- ============================================================================
-- Core tables (documents / versions / comments / activity_logs / user_settings)
-- ============================================================================
-- This migration must run BEFORE:
-- - 20241205_add_pgvector.sql (adds embedding to documents)
-- - 20241205_enable_rls.sql (enables RLS on core tables)
-- - 20241206_add_organizations.sql (adds organization_id to core tables)
-- - 20241206_add_notifications.sql (references documents/comments)
-- ============================================================================

-- UUID generator used across tables
create extension if not exists pgcrypto with schema public;

-- ============================================================================
-- user_settings
-- ============================================================================
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- UI / app settings
  ai_auto_summary_on_new boolean not null default true,
  ai_auto_summary_on_upload boolean not null default true,
  default_share_expires_in text not null default '7', -- "7" / "30" / "none"
  default_sort text not null default 'desc',          -- "desc" / "asc" / "pinned"
  default_show_archived boolean not null default false,
  default_shared_only boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_settings is 'ユーザーごとの設定（+個人サブスク情報は後続マイグレーションで追加）。';

-- ============================================================================
-- documents
-- ============================================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  category text,
  raw_content text not null,
  summary text,
  tags text[] not null default '{}',

  is_favorite boolean not null default false,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,

  share_token text,
  share_expires_at timestamptz,

  created_at timestamptz not null default now()
);

comment on table public.documents is 'ユーザーが作成したドキュメント本体。';
comment on column public.documents.share_token is '共有リンク用トークン（NULLなら共有無効）。';

create index if not exists documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

create index if not exists documents_share_token_idx
  on public.documents (share_token)
  where share_token is not null;

-- ============================================================================
-- document_versions
-- ============================================================================
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  category text,
  raw_content text,
  summary text,
  tags text[] not null default '{}',

  created_at timestamptz not null default now()
);

comment on table public.document_versions is 'ドキュメントの簡易バージョン履歴（スナップショット）。';

create index if not exists document_versions_document_id_created_at_idx
  on public.document_versions (document_id, created_at desc);

create index if not exists document_versions_user_id_created_at_idx
  on public.document_versions (user_id, created_at desc);

-- ============================================================================
-- activity_logs
-- ============================================================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  action text not null,
  document_id uuid references public.documents(id) on delete set null,
  document_title text,
  metadata jsonb,

  created_at timestamptz not null default now()
);

comment on table public.activity_logs is '監査・UI表示用のアクティビティログ。';

create index if not exists activity_logs_user_id_created_at_idx
  on public.activity_logs (user_id, created_at desc);

-- ============================================================================
-- document_comments
-- ============================================================================
create table if not exists public.document_comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

comment on table public.document_comments is 'ドキュメントに紐づくコメント。';

create index if not exists document_comments_document_id_created_at_idx
  on public.document_comments (document_id, created_at asc);

create index if not exists document_comments_user_id_created_at_idx
  on public.document_comments (user_id, created_at desc);



