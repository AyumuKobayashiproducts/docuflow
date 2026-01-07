-- ============================================================================
-- Fix: AI usage RPCs can fail with "column reference \"calls\" is ambiguous"
-- ============================================================================
-- In PL/pgSQL, OUT parameters are visible as identifiers inside SQL statements.
-- When a table column has the same name (calls), statements like:
--   select calls into v_current ...
-- can become ambiguous.
--
-- We qualify column references with table aliases to make this robust.
-- ============================================================================

-- 1) consume_ai_usage (scoped: personal / organization)
create or replace function public.consume_ai_usage(
  p_user_id uuid,
  p_organization_id uuid,
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
  v_scope_type text;
  v_scope_id uuid;
begin
  if p_count is null or p_count <= 0 then
    return query select true, 0;
    return;
  end if;

  -- ensure exactly one scope key is present
  if (p_user_id is null and p_organization_id is null) or (p_user_id is not null and p_organization_id is not null) then
    raise exception 'invalid ai usage scope';
  end if;

  if p_organization_id is not null then
    v_scope_type := 'organization';
    v_scope_id := p_organization_id;
  else
    v_scope_type := 'personal';
    v_scope_id := p_user_id;
  end if;

  if p_limit is null or p_limit < 0 then
    -- unlimited
    insert into public.ai_usage_monthly (month_start, scope_type, scope_id, calls)
    values (v_month_start, v_scope_type, v_scope_id, p_count)
    on conflict (month_start, scope_type, scope_id)
    do update set calls = public.ai_usage_monthly.calls + excluded.calls,
                  updated_at = now();

    select m.calls into v_current
      from public.ai_usage_monthly m
      where m.month_start = v_month_start
        and m.scope_type = v_scope_type
        and m.scope_id = v_scope_id;

    return query select true, v_current;
    return;
  end if;

  -- upsert base row (so FOR UPDATE works)
  insert into public.ai_usage_monthly (month_start, scope_type, scope_id, calls)
  values (v_month_start, v_scope_type, v_scope_id, 0)
  on conflict (month_start, scope_type, scope_id) do nothing;

  select m.calls into v_current
    from public.ai_usage_monthly m
    where m.month_start = v_month_start
      and m.scope_type = v_scope_type
      and m.scope_id = v_scope_id
    for update;

  if v_current + p_count > p_limit then
    return query select false, v_current;
    return;
  end if;

  update public.ai_usage_monthly m
    set calls = m.calls + p_count,
        updated_at = now()
    where m.month_start = v_month_start
      and m.scope_type = v_scope_type
      and m.scope_id = v_scope_id;

  select m.calls into v_current
    from public.ai_usage_monthly m
    where m.month_start = v_month_start
      and m.scope_type = v_scope_type
      and m.scope_id = v_scope_id;

  return query select true, v_current;
end;
$$;


-- 2) consume_ai_usage_global (project-wide)
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

  select g.calls into v_current
    from public.ai_usage_global_monthly g
    where g.month_start = v_month_start
    for update;

  if p_limit is not null and p_limit >= 0 then
    if v_current + p_count > p_limit then
      return query select false, v_current;
      return;
    end if;
  end if;

  update public.ai_usage_global_monthly g
    set calls = g.calls + p_count,
        updated_at = now()
    where g.month_start = v_month_start;

  select g.calls into v_current
    from public.ai_usage_global_monthly g
    where g.month_start = v_month_start;

  return query select true, v_current;
end;
$$;


