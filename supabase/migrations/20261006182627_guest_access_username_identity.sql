-- Do not derive new application profile names from OAuth real-name metadata.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,handle,display_name,role)
 values(new.id,'qg_'||substr(replace(new.id::text,'-',''),1,21),'Q-GANG Kullanıcısı','guest');
 return new;
end$$;
-- Existing authentication metadata and historical names are not erased here.
-- Restrictive policies also deny signed-in platform guests direct record access.
create policy "non guest discipline records" on public.moderation_actions
 as restrictive for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role::text<>'guest')
 );
create policy "non guest legacy discipline records" on public.moderation_legacy_archive
 as restrictive for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role::text<>'guest')
 );
