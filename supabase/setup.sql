create table if not exists public.site_content (
  slug text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

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

grant select on public.site_content to anon;
grant select, insert, update on public.site_content to authenticated;

alter table public.site_content enable row level security;

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
on public.site_content
for select
to anon, authenticated
using (slug = 'primary');

drop policy if exists "Admin write site content" on public.site_content;
create policy "Admin write site content"
on public.site_content
for all
to authenticated
using (auth.email() = 'amecruz334@gmail.com')
with check (auth.email() = 'amecruz334@gmail.com');