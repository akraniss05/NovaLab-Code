
-- LiveryLab Academy Studio: non-destructive extensions (2026-11-07)
create table if not exists public.academy_portfolio_projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(btrim(title)) between 3 and 100),
 description text not null default '' check (char_length(description)<=2500),
 category text not null default 'coding' check(category in ('coding','blender','web','fivem','other')),
 technologies text[] not null default '{}',
 project_url text not null default '' check (char_length(project_url)<=500),
 featured boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists academy_portfolio_user_created_idx on public.academy_portfolio_projects(user_id,created_at desc);
alter table public.academy_portfolio_projects enable row level security;
drop policy if exists "ll_portfolio_read_own" on public.academy_portfolio_projects;
create policy "ll_portfolio_read_own" on public.academy_portfolio_projects for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "ll_portfolio_insert_own" on public.academy_portfolio_projects;
create policy "ll_portfolio_insert_own" on public.academy_portfolio_projects for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists "ll_portfolio_update_own" on public.academy_portfolio_projects;
create policy "ll_portfolio_update_own" on public.academy_portfolio_projects for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
drop policy if exists "ll_portfolio_delete_own" on public.academy_portfolio_projects;
create policy "ll_portfolio_delete_own" on public.academy_portfolio_projects for delete to authenticated using(user_id=(select auth.uid()));

create table if not exists public.academy_studio_settings(
 user_id uuid primary key references auth.users(id) on delete cascade,
 prefs jsonb not null default '{}'::jsonb check (jsonb_typeof(prefs)='object' and pg_column_size(prefs)<20000),
 updated_at timestamptz not null default now()
);
alter table public.academy_studio_settings enable row level security;
drop policy if exists "ll_studio_select_own" on public.academy_studio_settings;
create policy "ll_studio_select_own" on public.academy_studio_settings for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists "ll_studio_insert_own" on public.academy_studio_settings;
create policy "ll_studio_insert_own" on public.academy_studio_settings for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists "ll_studio_update_own" on public.academy_studio_settings;
create policy "ll_studio_update_own" on public.academy_studio_settings for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create table if not exists public.academy_lesson_notes(
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null references public.ll_lesson_index(id) on delete cascade,
 body text not null default '' check (char_length(body)<=12000),
 updated_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
alter table public.academy_lesson_notes enable row level security;
drop policy if exists "ll_notes_select_own" on public.academy_lesson_notes;
create policy "ll_notes_select_own" on public.academy_lesson_notes for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists "ll_notes_insert_own" on public.academy_lesson_notes;
create policy "ll_notes_insert_own" on public.academy_lesson_notes for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists "ll_notes_update_own" on public.academy_lesson_notes;
create policy "ll_notes_update_own" on public.academy_lesson_notes for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
drop policy if exists "ll_notes_delete_own" on public.academy_lesson_notes;
create policy "ll_notes_delete_own" on public.academy_lesson_notes for delete to authenticated using(user_id=(select auth.uid()));

grant select,insert,update,delete on public.academy_portfolio_projects,public.academy_studio_settings,public.academy_lesson_notes to authenticated;
revoke all on public.academy_portfolio_projects,public.academy_studio_settings,public.academy_lesson_notes from anon;
