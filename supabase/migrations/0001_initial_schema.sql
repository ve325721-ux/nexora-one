-- Nexora One initial schema. Test in a non-production Supabase project first.
create extension if not exists pgcrypto;

create type public.organization_role as enum ('owner', 'admin', 'member');
create type public.customer_status as enum ('lead', 'active', 'archived');
create type public.project_status as enum ('planned', 'active', 'on_hold', 'completed', 'cancelled');
create type public.task_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type public.invoice_status as enum ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  currency char(3) not null default 'USD',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (organization_id, id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  email text, phone text, company_name text,
  status public.customer_status not null default 'lead',
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text,
  status public.project_status not null default 'planned',
  start_date date, due_date date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, customer_id) references public.customers(organization_id, id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  status public.task_status not null default 'todo',
  due_date date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, project_id) references public.projects(organization_id, id)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null,
  invoice_number text not null,
  currency char(3) not null default 'USD',
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  tax_amount numeric(14,2) not null default 0 check (tax_amount >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number),
  unique (organization_id, id),
  foreign key (organization_id, customer_id) references public.customers(organization_id, id)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  invoice_id uuid not null,
  description text not null check (char_length(trim(description)) between 1 and 300),
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) generated always as (round(quantity * unit_price, 2)) stored,
  created_at timestamptz not null default now(),
  foreign key (organization_id, invoice_id) references public.invoices(organization_id, id) on delete cascade
);

create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  invoice_id uuid not null,
  amount numeric(14,2) not null check (amount > 0),
  method text not null default 'other' check (method in ('cash', 'bank_transfer', 'card', 'other')),
  payment_date date not null default current_date,
  reference text,
  recorded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (organization_id, invoice_id) references public.invoices(organization_id, id)
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index memberships_user_id_idx on public.memberships(user_id);
create index customers_org_created_idx on public.customers(organization_id, created_at desc);
create index projects_org_status_idx on public.projects(organization_id, status);
create index tasks_org_project_idx on public.tasks(organization_id, project_id);
create index invoices_org_status_idx on public.invoices(organization_id, status);
create index payments_org_invoice_idx on public.payment_records(organization_id, invoice_id);
create index activity_org_created_idx on public.activity_events(organization_id, created_at desc);

-- Membership helpers are SECURITY DEFINER to avoid recursive membership RLS checks.
create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = target_org and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles public.organization_role[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = target_org
      and m.user_id = (select auth.uid())
      and m.role = any(allowed_roles)
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, public.organization_role[]) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.organization_role[]) to authenticated;

-- Create organization and initial owner membership atomically.
create or replace function public.create_organization(org_name text, org_slug text, org_currency text default 'USD')
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  new_org_id uuid;
  clean_currency text := upper(coalesce(org_currency, 'USD'));
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(org_name)) not between 1 and 120 then raise exception 'Invalid organization name'; end if;
  if org_slug !~ '^[a-z0-9-]{3,60}$' then raise exception 'Invalid organization slug'; end if;
  if clean_currency !~ '^[A-Z]{3}$' then raise exception 'Invalid currency code'; end if;

  insert into public.organizations(name, slug, currency, created_by)
  values (trim(org_name), org_slug, clean_currency, auth.uid())
  returning id into new_org_id;

  insert into public.memberships(organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  return new_org_id;
end;
$$;
revoke all on function public.create_organization(text, text, text) from public;
grant execute on function public.create_organization(text, text, text) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payment_records enable row level security;
alter table public.activity_events enable row level security;

create policy profiles_select_self on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy organizations_select_member on public.organizations for select to authenticated using (public.is_org_member(id));
create policy organizations_update_admin on public.organizations for update to authenticated
using (public.has_org_role(id, array['owner','admin']::public.organization_role[]))
with check (public.has_org_role(id, array['owner','admin']::public.organization_role[]));

create policy memberships_select_member on public.memberships for select to authenticated using (public.is_org_member(organization_id));
-- Membership writes are intentionally unavailable through direct client table access.
-- Add a reviewed invitation/role-management RPC before implementing team administration.

create policy customers_select_member on public.customers for select to authenticated using (public.is_org_member(organization_id));
create policy customers_insert_member on public.customers for insert to authenticated with check (public.is_org_member(organization_id) and created_by = (select auth.uid()));
create policy customers_update_member on public.customers for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy customers_delete_admin on public.customers for delete to authenticated using (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));

create policy projects_select_member on public.projects for select to authenticated using (public.is_org_member(organization_id));
create policy projects_insert_member on public.projects for insert to authenticated with check (public.is_org_member(organization_id) and created_by = (select auth.uid()));
create policy projects_update_member on public.projects for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy projects_delete_admin on public.projects for delete to authenticated using (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));

create policy tasks_select_member on public.tasks for select to authenticated using (public.is_org_member(organization_id));
create policy tasks_insert_member on public.tasks for insert to authenticated with check (public.is_org_member(organization_id) and created_by = (select auth.uid()));
create policy tasks_update_member on public.tasks for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy tasks_delete_admin on public.tasks for delete to authenticated using (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));

create policy invoices_select_member on public.invoices for select to authenticated using (public.is_org_member(organization_id));
create policy invoices_insert_admin on public.invoices for insert to authenticated with check (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]) and created_by = (select auth.uid()));
create policy invoices_update_admin on public.invoices for update to authenticated using (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));
create policy invoices_delete_owner on public.invoices for delete to authenticated using (public.has_org_role(organization_id, array['owner']::public.organization_role[]));

create policy invoice_items_select_member on public.invoice_items for select to authenticated using (public.is_org_member(organization_id));
create policy invoice_items_write_admin on public.invoice_items for all to authenticated
using (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]))
with check (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));

create policy payments_select_member on public.payment_records for select to authenticated using (public.is_org_member(organization_id));
create policy payments_insert_admin on public.payment_records for insert to authenticated with check (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]) and recorded_by = (select auth.uid()));
create policy payments_update_admin on public.payment_records for update to authenticated using (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));
create policy payments_delete_owner on public.payment_records for delete to authenticated using (public.has_org_role(organization_id, array['owner']::public.organization_role[]));

create policy activity_select_member on public.activity_events for select to authenticated using (public.is_org_member(organization_id));
create policy activity_insert_member on public.activity_events for insert to authenticated with check (public.is_org_member(organization_id) and actor_id = (select auth.uid()));

grant select, update on public.profiles to authenticated;
grant select, update on public.organizations to authenticated;
grant select on public.memberships to authenticated;
grant select, insert, update, delete on public.customers, public.projects, public.tasks, public.invoices, public.invoice_items, public.payment_records to authenticated;
grant select, insert on public.activity_events to authenticated;
