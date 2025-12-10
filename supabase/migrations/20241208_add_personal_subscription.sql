-- ============================================================================
-- 個人ユーザー向けサブスクリプション管理の追加
-- ============================================================================
-- user_settings テーブルにサブスクリプション関連カラムを追加
-- ============================================================================

alter table public.user_settings
  add column if not exists subscription_plan text not null default 'free' 
    check (subscription_plan in ('free', 'pro', 'team', 'enterprise')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists billing_email text,
  add column if not exists subscription_status text 
    check (subscription_status in ('active', 'canceled', 'past_due', 'trialing') or subscription_status is null),
  add column if not exists current_period_end timestamptz;

comment on column public.user_settings.subscription_plan is '個人ユーザーのサブスクリプションプラン: free / pro / team / enterprise';
comment on column public.user_settings.stripe_customer_id is 'Stripe 上の customer ID（個人ユーザー用）';
comment on column public.user_settings.stripe_subscription_id is 'Stripe 上の subscription ID（個人ユーザー用）';
comment on column public.user_settings.billing_email is '請求先メールアドレス（Stripe Checkout で入力されたもの）';
comment on column public.user_settings.subscription_status is 'サブスクリプション状態: active / canceled / past_due / trialing';
comment on column public.user_settings.current_period_end is '現在の請求期間の終了日時';

-- インデックス追加
create index if not exists user_settings_subscription_plan_idx
  on public.user_settings (subscription_plan);

create index if not exists user_settings_stripe_customer_id_idx
  on public.user_settings (stripe_customer_id)
  where stripe_customer_id is not null;

