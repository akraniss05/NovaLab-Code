-- LiveryLab Academy · account-owned code drafts, originally deployed via Supabase migration v32_code_drafts
-- Additive account-owned code drafts. Existing course progress remains untouched.
create table if not exists public.academy_code_drafts (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  content text not null default '',
  step smallint not null default 1 check (step between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id),
  constraint draft_size check (octet_length(content) <= 20000)
);
create index if not exists academy_code_drafts_recent on public.academy_code_drafts(user_id,updated_at desc);
alter table public.academy_code_drafts enable row level security;
grant select,insert,update,delete on public.academy_code_drafts to authenticated;
drop policy if exists drafts_read_own on public.academy_code_drafts;
create policy drafts_read_own on public.academy_code_drafts for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists drafts_insert_own on public.academy_code_drafts;
create policy drafts_insert_own on public.academy_code_drafts for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists drafts_update_own on public.academy_code_drafts;
create policy drafts_update_own on public.academy_code_drafts for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists drafts_delete_own on public.academy_code_drafts;
create policy drafts_delete_own on public.academy_code_drafts for delete to authenticated using ((select auth.uid())=user_id);
;
