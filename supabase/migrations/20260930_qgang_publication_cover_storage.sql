-- Publication cover storage. Live project applied via migration API on 2026-09-30.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('qgang-publications','qgang-publications',true,8388608,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "publication covers public read" on storage.objects;
create policy "publication covers public read" on storage.objects for select using (bucket_id='qgang-publications');
drop policy if exists "publication covers authenticated upload" on storage.objects;
create policy "publication covers authenticated upload" on storage.objects for insert to authenticated with check (bucket_id='qgang-publications' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "publication covers owner update" on storage.objects;
create policy "publication covers owner update" on storage.objects for update to authenticated using (bucket_id='qgang-publications' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='qgang-publications' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "publication covers owner delete" on storage.objects;
create policy "publication covers owner delete" on storage.objects for delete to authenticated using (bucket_id='qgang-publications' and (storage.foldername(name))[1]=auth.uid()::text);
