-- Apply only after the deployment containing the permanent redirects is READY.
-- Keep the previous URL in publicationSlugAliases.
begin;
update public.publications set slug='bir-film-izleyicisine-haksizlik-edebilir-mi'
where slug='bir-film-izleyicisine-haks-zl-k-edebilir-mi'
and title='Bir Film İzleyicisine Haksızlık Edebilir mi?'
and not exists(select 1 from public.publications where slug='bir-film-izleyicisine-haksizlik-edebilir-mi');
commit;
