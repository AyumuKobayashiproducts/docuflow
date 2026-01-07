-- ============================================================================
-- Fix RLS recursion on organization_members / organization_invitations (42P17)
-- ============================================================================
-- Problem:
--   Some policies referenced public.organization_members from within RLS policies
--   on the same table, which causes:
--     ERROR: 42P17: infinite recursion detected in policy for relation "organization_members"
--
-- Solution:
--   Introduce SECURITY DEFINER helper functions with row_security = off, then
--   rewrite policies to call those helpers instead of querying the table inside
--   the policy expression.
-- ============================================================================

-- Helper: check if a user has any membership in an org
create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = p_org_id
      and user_id = p_user_id
  );
$$;

-- Helper: check if a user has one of the roles in an org
create or replace function public.is_org_role(p_org_id uuid, p_user_id uuid, p_roles text[])
returns boolean
language sql
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = p_org_id
      and user_id = p_user_id
      and role = any(p_roles)
  );
$$;

revoke all on function public.is_org_member(uuid, uuid) from public;
grant execute on function public.is_org_member(uuid, uuid) to authenticated;

revoke all on function public.is_org_role(uuid, uuid, text[]) from public;
grant execute on function public.is_org_role(uuid, uuid, text[]) to authenticated;

-- ============================================================================
-- organization_members: rewrite policies
-- ============================================================================

drop policy if exists "Users can view own memberships" on public.organization_members;
drop policy if exists "Owners can manage memberships" on public.organization_members;
drop policy if exists "Org members can view memberships" on public.organization_members;
drop policy if exists "Owner/admin can add members" on public.organization_members;
drop policy if exists "Owner can update member roles" on public.organization_members;
drop policy if exists "Owner/admin can remove members" on public.organization_members;

-- SELECT: org members can view membership list
create policy "Org members can view memberships"
on public.organization_members for select
using (
  auth.uid() is not null
  and public.is_org_member(organization_members.organization_id, auth.uid())
);

-- INSERT: owner/admin can add members
-- - owner: can add admin/member
-- - admin: can add member only
create policy "Owner/admin can add members"
on public.organization_members for insert
with check (
  auth.uid() is not null
  and (
    public.is_org_role(organization_members.organization_id, auth.uid(), array['owner'])
    or (
      public.is_org_role(organization_members.organization_id, auth.uid(), array['admin'])
      and organization_members.role = 'member'
    )
  )
);

-- UPDATE: owner can change role of non-owner members (cannot set to owner)
create policy "Owner can update member roles"
on public.organization_members for update
using (
  auth.uid() is not null
  and organization_members.role <> 'owner'
  and public.is_org_role(organization_members.organization_id, auth.uid(), array['owner'])
)
with check (
  auth.uid() is not null
  and organization_members.role in ('admin', 'member')
);

-- DELETE: owner can remove non-owner members; admin can remove member only.
-- Also prevent removing self at DB level.
create policy "Owner/admin can remove members"
on public.organization_members for delete
using (
  auth.uid() is not null
  and organization_members.user_id <> auth.uid()
  and (
    public.is_org_role(organization_members.organization_id, auth.uid(), array['owner'])
    or (
      organization_members.role = 'member'
      and public.is_org_role(organization_members.organization_id, auth.uid(), array['admin'])
    )
  )
);

-- ============================================================================
-- organization_invitations: rewrite policies
-- ============================================================================

drop policy if exists "Users can view invitations for their orgs" on public.organization_invitations;
drop policy if exists "Owners can manage invitations" on public.organization_invitations;
drop policy if exists "Owner/admin can view invitations" on public.organization_invitations;
drop policy if exists "Owner/admin can manage invitations" on public.organization_invitations;

-- SELECT: owner/admin can view invitations
create policy "Owner/admin can view invitations"
on public.organization_invitations for select
using (
  auth.uid() is not null
  and public.is_org_role(organization_invitations.organization_id, auth.uid(), array['owner','admin'])
);

-- INSERT: owner/admin can create invitations
-- - owner: can invite admin/member
-- - admin: can invite member only
create policy "Owner/admin can create invitations"
on public.organization_invitations for insert
with check (
  auth.uid() is not null
  and (
    public.is_org_role(organization_invitations.organization_id, auth.uid(), array['owner'])
    or (
      public.is_org_role(organization_invitations.organization_id, auth.uid(), array['admin'])
      and organization_invitations.role = 'member'
    )
  )
);

-- UPDATE: owner/admin can update invitations (admin: member only)
create policy "Owner/admin can update invitations"
on public.organization_invitations for update
using (
  auth.uid() is not null
  and (
    public.is_org_role(organization_invitations.organization_id, auth.uid(), array['owner'])
    or (
      public.is_org_role(organization_invitations.organization_id, auth.uid(), array['admin'])
      and organization_invitations.role = 'member'
    )
  )
)
with check (
  auth.uid() is not null
  and (
    public.is_org_role(organization_invitations.organization_id, auth.uid(), array['owner'])
    or (
      public.is_org_role(organization_invitations.organization_id, auth.uid(), array['admin'])
      and organization_invitations.role = 'member'
    )
  )
);

-- DELETE: owner/admin can delete invitations (admin: member only)
create policy "Owner/admin can delete invitations"
on public.organization_invitations for delete
using (
  auth.uid() is not null
  and (
    public.is_org_role(organization_invitations.organization_id, auth.uid(), array['owner'])
    or (
      public.is_org_role(organization_invitations.organization_id, auth.uid(), array['admin'])
      and organization_invitations.role = 'member'
    )
  )
);



