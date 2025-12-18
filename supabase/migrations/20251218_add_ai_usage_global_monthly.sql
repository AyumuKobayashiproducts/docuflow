-- ============================================================================
-- AI usage (global): 月次のAI呼び出し回数をプロジェクト全体で追跡する
-- ============================================================================
-- 目的:
--  - デモ/個人運用で「請求の上振れ」を防ぐため、全体の月次上限を強制する
--  - 原子的な消費（consume）を DB 関数で提供する
-- ============================================================================

create table if not exists public.ai_usage_global_monthly (
  month_start date primary key,
  calls integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint ai_usage_global_monthly_calls_check check (calls >= 0)
);

comment on table public.ai_usage_global_monthly is '月次AI呼び出し回数（プロジェクト全体）';
comment on column public.ai_usage_global_monthly.month_start is '月初日（YYYY-MM-01）';
comment on column public.ai_usage_global_monthly.calls is '当月のAI呼び出し回数';

alter table public.ai_usage_global_monthly enable row level security;

-- 原子的な消費: limit を渡して増分できるか判定し、成功時のみカウントを増やす
create or replace function public.consume_ai_usage_global(
  p_limit integer,
  p_count integer
)
returns table (
  allowed boolean,
  calls integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month_start date := date_trunc('month', now())::date;
  v_current integer := 0;
begin
  if p_count is null or p_count <= 0 then
    return query select true, 0;
    return;
  end if;

  -- upsert base row (so FOR UPDATE works)
  insert into public.ai_usage_global_monthly (month_start, calls)
  values (v_month_start, 0)
  on conflict (month_start) do nothing;

  select calls into v_current
    from public.ai_usage_global_monthly
    where month_start = v_month_start
    for update;

  if p_limit is not null and p_limit >= 0 then
    if v_current + p_count > p_limit then
      return query select false, v_current;
      return;
    end if;
  end if;

  update public.ai_usage_global_monthly
    set calls = calls + p_count,
        updated_at = now()
    where month_start = v_month_start;

  select calls into v_current
    from public.ai_usage_global_monthly
    where month_start = v_month_start;

  return query select true, v_current;
end;
$$;


