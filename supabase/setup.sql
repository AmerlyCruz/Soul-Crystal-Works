create table if not exists public.admin_users (
  email text primary key,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint admin_users_email_format check (position('@' in email) > 1)
);

create table if not exists public.site_content (
  slug text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'site_content_content_is_object'
  ) then
    alter table public.site_content
      add constraint site_content_content_is_object
      check (jsonb_typeof(content) = 'object');
  end if;
end;
$$;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where is_active = true
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.touch_site_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on public.site_content;

create trigger site_content_set_updated_at
before update on public.site_content
for each row
execute function public.touch_site_content_updated_at();

revoke all on public.admin_users from anon, authenticated;
revoke all on public.site_content from anon, authenticated;

grant select on public.site_content to anon;
grant select, insert, update on public.site_content to authenticated;

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.site_content force row level security;

insert into public.admin_users (email)
values ('amecruz334@gmail.com')
on conflict (email) do update
set is_active = true;

insert into public.site_content (slug, content)
values ('primary', '{}'::jsonb)
on conflict (slug) do nothing;

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
on public.site_content
for select
to anon, authenticated
using (slug = 'primary');

drop policy if exists "Admin write site content" on public.site_content;
drop policy if exists "Admin insert site content" on public.site_content;
create policy "Admin insert site content"
on public.site_content
for insert
to authenticated
with check (
  slug = 'primary'
  and public.is_site_admin()
);

drop policy if exists "Admin update site content" on public.site_content;
create policy "Admin update site content"
on public.site_content
for update
to authenticated
using (
  slug = 'primary'
  and public.is_site_admin()
)
with check (
  slug = 'primary'
  and public.is_site_admin()
);