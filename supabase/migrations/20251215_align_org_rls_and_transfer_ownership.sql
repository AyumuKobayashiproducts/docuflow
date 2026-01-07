-- ============================================================================
-- Align organization RBAC (owner/admin/member) with RLS policies
-- and add a safe ownership transfer function (security definer).
-- ============================================================================

-- 1) organization_members: allow org members to view membership list
drop policy if exists "Users can view own memberships" on public.organization_members;
drop policy if exists "Owners can manage memberships" on public.organization_members;
drop policy if exists "Org members can view memberships" on public.organization_members;
drop policy if exists "Owner/admin can add members" on public.organization_members;
drop policy if exists "Owner can update member roles" on public.organization_members;
drop policy if exists "Owner/admin can remove members" on public.organization_members;

create policy "Org members can view memberships"
on public.organization_members for select
using (
  auth.uid() is not null
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.user_id = auth.uid()
  )
);

-- Insert: owner/admin can add members
-- - owner: can add admin/member
-- - admin: can add member only
create policy "Owner/admin can add members"
on public.organization_members for insert
with check (
  auth.uid() is not null
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.user_id = auth.uid()
      and (
        m.role = 'owner'
        or (m.role = 'admin' and organization_members.role = 'member')
      )
  )
);

-- Update: owner can change role of non-owner members (cannot set to owner)
create policy "Owner can update member roles"
on public.organization_members for update
using (
  auth.uid() is not null
  and organization_members.role <> 'owner'
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  )
)
with check (
  auth.uid() is not null
  and organization_members.role in ('admin', 'member')
);

-- Delete: owner can remove non-owner members; admin can remove member only.
-- Also prevent removing self at DB level.
create policy "Owner/admin can remove members"
on public.organization_members for delete
using (
  auth.uid() is not null
  and organization_members.user_id <> auth.uid()
  and (
    exists (
      select 1
      from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
    or (
      organization_members.role = 'member'
      and exists (
        select 1
        from public.organization_members m
        where m.organization_id = organization_members.organization_id
          and m.user_id = auth.uid()
          and m.role = 'admin'
      )
    )
  )
);

-- 2) organization_invitations: align with app behavior
drop policy if exists "Users can view invitations for their orgs" on public.organization_invitations;
drop policy if exists "Owners can manage invitations" on public.organization_invitations;
drop policy if exists "Owner/admin can view invitations" on public.organization_invitations;
drop policy if exists "Owner/admin can manage invitations" on public.organization_invitations;

-- Only owner/admin can view invitations (avoid email leakage to members)
create policy "Owner/admin can view invitations"
on public.organization_invitations for select
using (
  auth.uid() is not null
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_invitations.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

-- Insert/update/delete invitations:
-- - owner: can manage all invitation roles
-- - admin: can manage member invitations only
create policy "Owner/admin can manage invitations"
on public.organization_invitations for all
using (
  auth.uid() is not null
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_invitations.organization_id
      and m.user_id = auth.uid()
      and (
        m.role = 'owner'
        or (m.role = 'admin' and organization_invitations.role = 'member')
      )
  )
)
with check (
  auth.uid() is not null
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_invitations.organization_id
      and m.user_id = auth.uid()
      and (
        m.role = 'owner'
        or (m.role = 'admin' and organization_invitations.role = 'member')
      )
  )
);

-- 3) Ownership transfer function (for future RLS-based flow)
-- NOTE: This expects auth.uid() to be the current owner_id.
create or replace function public.transfer_organization_ownership(
  p_organization_id uuid,
  p_new_owner_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_actor uuid := auth.uid();
  v_current_owner uuid;
  v_is_member boolean := false;
begin
  if v_actor is null then
    raise exception 'not authenticated';
  end if;

  select o.owner_id into v_current_owner
  from public.organizations o
  where o.id = p_organization_id;

  if v_current_owner is null then
    raise exception 'organization not found';
  end if;

  if v_current_owner <> v_actor then
    raise exception 'only current owner can transfer ownership';
  end if;

  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_organization_id
      and m.user_id = p_new_owner_id
  ) into v_is_member;

  if not v_is_member then
    raise exception 'new owner must be an organization member';
  end if;

  -- Update member roles
  update public.organization_members
  set role = 'admin'
  where organization_id = p_organization_id
    and user_id = v_actor
    and role = 'owner';

  update public.organization_members
  set role = 'owner'
  where organization_id = p_organization_id
    and user_id = p_new_owner_id;

  -- Update organizations.owner_id
  update public.organizations
  set owner_id = p_new_owner_id,
      updated_at = now()
  where id = p_organization_id;
end;
$func$;

revoke all on function public.transfer_organization_ownership(uuid, uuid) from public;
grant execute on function public.transfer_organization_ownership(uuid, uuid) to authenticated;


