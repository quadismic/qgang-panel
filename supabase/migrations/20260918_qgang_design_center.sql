create table if not exists public.design_settings (
  key text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.design_settings enable row level security;
drop policy if exists "design settings public read" on public.design_settings;
create policy "design settings public read" on public.design_settings for select using (true);
drop policy if exists "design settings admin write" on public.design_settings;
create policy "design settings admin write" on public.design_settings for all
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('founder','admin')))
with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('founder','admin')));
insert into public.design_settings(key,settings)
values('active','{"primary":"#a71b18","bone":"#e8ddcb","bronze":"#9a7655","sidebarWidth":182,"sidebarEmblem":58,"heroOverlay":42,"quadWidth":560,"quadTop":0,"loginPanelWidth":510,"loginEmblem":92,"loginOverlay":42,"motto":"Düzen, özgürlüğün en güçlü hâlidir.","systemLine":"SİSTEM\\nİNSANLARLA\\nYAŞAR."}'::jsonb)
on conflict(key) do nothing;
