-- Mirrorly database setup. Paste all of this into Supabase > SQL Editor > New query, then click Run.

-- 1. One row per saved try-on.
create table if not exists public.tryons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  result_path text not null,
  category text not null check (category in ('top', 'bottom', 'dress')),
  model_used text not null,
  created_at timestamptz not null default now()
);

-- 2. Row-level security: each person sees and changes only their own try-ons.
alter table public.tryons enable row level security;

drop policy if exists "read own tryons" on public.tryons;
create policy "read own tryons" on public.tryons for select using (auth.uid() = user_id);

drop policy if exists "add own tryons" on public.tryons;
create policy "add own tryons" on public.tryons for insert with check (auth.uid() = user_id);

drop policy if exists "delete own tryons" on public.tryons;
create policy "delete own tryons" on public.tryons for delete using (auth.uid() = user_id);

-- 3. Private image storage. Each person has a folder named after their user id.
insert into storage.buckets (id, name, public)
values ('tryons', 'tryons', false)
on conflict (id) do nothing;

drop policy if exists "read own images" on storage.objects;
create policy "read own images" on storage.objects for select
  using (bucket_id = 'tryons' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "upload own images" on storage.objects;
create policy "upload own images" on storage.objects for insert
  with check (bucket_id = 'tryons' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "delete own images" on storage.objects;
create policy "delete own images" on storage.objects for delete
  using (bucket_id = 'tryons' and (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Let logged-in users use the table (newer projects need this explicitly).
grant select, insert, delete on public.tryons to authenticated;
