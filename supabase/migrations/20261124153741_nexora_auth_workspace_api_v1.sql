alter table public.businesses
  add column if not exists currency char(3) not null default 'USD',
  add column if not exists country char(2) not null default 'US',
  add column if not exists timezone text not null default 'UTC',
  add column if not exists business_email text,
  add column if not exists logo_url text;

create or replace function public.create_business_invitation_v2(
  p_business_id uuid,
  p_email text,
  p_role text
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_role text := lower(btrim(coalesce(p_role, '')));
  v_token text;
  v_id uuid;
  v_expires timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.has_business_role(p_business_id, array['owner','admin']) then
    raise exception 'Only owners and admins can invite workspace members' using errcode = '42501';
  end if;
  if v_email = '' or char_length(v_email) > 254 or position('@' in v_email) < 2 then
    raise exception 'A valid email address is required' using errcode = '22023';
  end if;
  if v_role not in ('admin','manager','staff') then
    raise exception 'Role must be admin, manager, or staff' using errcode = '22023';
  end if;
  if v_role = 'admin' and not public.has_business_role(p_business_id, array['owner']) then
    raise exception 'Only the workspace owner can invite an admin' using errcode = '42501';
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  update public.business_invitations
  set revoked_at = now()
  where business_id = p_business_id
    and email = v_email
    and accepted_at is null
    and revoked_at is null;

  insert into public.business_invitations(business_id,email,role,token_hash,invited_by)
  values (
    p_business_id, v_email, v_role,
    encode(extensions.digest(convert_to(v_token,'UTF8'),'sha256'),'hex'),
    v_user_id
  )
  returning id, business_invitations.expires_at into v_id, v_expires;

  return query select v_id, v_token, v_expires;
end;
$$;

revoke all on function public.create_business_invitation_v2(uuid,text,text) from public, anon;
grant execute on function public.create_business_invitation_v2(uuid,text,text) to authenticated;
revoke all on function public.create_business(text) from public, anon;
grant execute on function public.create_business(text) to authenticated;
revoke all on function public.accept_business_invitation(text) from public, anon;
grant execute on function public.accept_business_invitation(text) to authenticated;
revoke all on function public.create_business_invitation(uuid,text,text,text) from public, anon, authenticated;
