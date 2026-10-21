-- User-requested permanent retirement. Only membership-review objects/data are removed.
-- Historical published privacy versions remain immutable; module-only current publications are withdrawn.
lock table private.membership_review_periods in access exclusive mode;
lock table public.privacy_documents in share row exclusive mode;

do $$ declare d public.privacy_documents; old_body text; clean text; begin
 select * into d from public.privacy_documents where slug='aydinlatma';
 if d.slug is null then return; end if;
 clean=replace(replace(d.draft_body,'<!--qgang-rich:v1--><p>Üyelik değerlendirmeleri</p><p>Dönem kapsamındaki hesap/rumuz, iletişim ve kardeşlik bağına ilişkin somut gözlemler, aidiyet ve üyelik iradesi, değerlendirme gerekçeleri, sınırlı görüşme kayıtları ve kararlar üyelik ilişkisinin incelenmesi için işlenir. Web hesabı olmayan mensuplar ad/rumuz ile dosyaya eklenebilir; gereksiz özel hayat bilgileri kaydedilmez. Değerlendiriciler kendi kayıtlarını; görüşme görevlileri kendi görevlerini; gizli okuma yetkisi ayrıca verilen kadro yalnız bu yetki kapsamında kayıtları görür. Yönetim erişimine yalnız Liderin ayrıca açtığı sınırlı karar metni çıkar. Otomatik puanlama, üyelik/rütbe değişikliği veya disiplin yaptırımı üretilmez. Bu kayıtlar için hukuki sebep ve mevcut sağlayıcıların aktarım şartları yayım öncesi ayrıca değerlendirilir. Başvuru ve düzeltme/silme talepleri mevcut Gizlilik başvuru kanalından iletilir.</p>',''),'

Üyelik değerlendirmeleri
Dönem kapsamındaki hesap/rumuz, iletişim ve kardeşlik bağına ilişkin somut gözlemler, aidiyet ve üyelik iradesi, değerlendirme gerekçeleri, sınırlı görüşme kayıtları ve kararlar üyelik ilişkisinin incelenmesi için işlenir. Web hesabı olmayan mensuplar ad/rumuz ile dosyaya eklenebilir; gereksiz özel hayat bilgileri kaydedilmez. Değerlendiriciler kendi kayıtlarını; görüşme görevlileri kendi görevlerini; gizli okuma yetkisi ayrıca verilen kadro yalnız bu yetki kapsamında kayıtları görür. Yönetim erişimine yalnız Liderin ayrıca açtığı sınırlı karar metni çıkar. Otomatik puanlama, üyelik/rütbe değişikliği veya disiplin yaptırımı üretilmez. Bu kayıtlar için hukuki sebep ve mevcut sağlayıcıların aktarım şartları yayım öncesi ayrıca değerlendirilir. Başvuru ve düzeltme/silme talepleri mevcut Gizlilik başvuru kanalından iletilir.','');
 if clean<>d.draft_body then
  update public.privacy_documents set draft_body=clean,draft_revision=draft_revision+1,updated_at=now() where slug=d.slug;
 end if;
 select body into old_body from public.privacy_document_versions where slug=d.slug and revision=d.published_revision;
 if old_body='<!--qgang-rich:v1--><p>Üyelik değerlendirmeleri</p><p>Dönem kapsamındaki hesap/rumuz, iletişim ve kardeşlik bağına ilişkin somut gözlemler, aidiyet ve üyelik iradesi, değerlendirme gerekçeleri, sınırlı görüşme kayıtları ve kararlar üyelik ilişkisinin incelenmesi için işlenir. Web hesabı olmayan mensuplar ad/rumuz ile dosyaya eklenebilir; gereksiz özel hayat bilgileri kaydedilmez. Değerlendiriciler kendi kayıtlarını; görüşme görevlileri kendi görevlerini; gizli okuma yetkisi ayrıca verilen kadro yalnız bu yetki kapsamında kayıtları görür. Yönetim erişimine yalnız Liderin ayrıca açtığı sınırlı karar metni çıkar. Otomatik puanlama, üyelik/rütbe değişikliği veya disiplin yaptırımı üretilmez. Bu kayıtlar için hukuki sebep ve mevcut sağlayıcıların aktarım şartları yayım öncesi ayrıca değerlendirilir. Başvuru ve düzeltme/silme talepleri mevcut Gizlilik başvuru kanalından iletilir.</p>' or trim(old_body)=trim('

Üyelik değerlendirmeleri
Dönem kapsamındaki hesap/rumuz, iletişim ve kardeşlik bağına ilişkin somut gözlemler, aidiyet ve üyelik iradesi, değerlendirme gerekçeleri, sınırlı görüşme kayıtları ve kararlar üyelik ilişkisinin incelenmesi için işlenir. Web hesabı olmayan mensuplar ad/rumuz ile dosyaya eklenebilir; gereksiz özel hayat bilgileri kaydedilmez. Değerlendiriciler kendi kayıtlarını; görüşme görevlileri kendi görevlerini; gizli okuma yetkisi ayrıca verilen kadro yalnız bu yetki kapsamında kayıtları görür. Yönetim erişimine yalnız Liderin ayrıca açtığı sınırlı karar metni çıkar. Otomatik puanlama, üyelik/rütbe değişikliği veya disiplin yaptırımı üretilmez. Bu kayıtlar için hukuki sebep ve mevcut sağlayıcıların aktarım şartları yayım öncesi ayrıca değerlendirilir. Başvuru ve düzeltme/silme talepleri mevcut Gizlilik başvuru kanalından iletilir.') then
  update public.privacy_documents set published_revision=null,updated_at=now() where slug=d.slug;
 elsif old_body ilike '%Üyelik değerlendirmeleri%' then
  raise exception 'Mixed privacy publication needs targeted review before removal';
 end if;
end $$;

do $$ declare d public.privacy_documents; old_body text; clean text; begin
 select * into d from public.privacy_documents where slug='saklama';
 if d.slug is null then return; end if;
 clean=replace(replace(d.draft_body,'<!--qgang-rich:v1--><p>Üyelik değerlendirmeleri</p><p>Tamamlanan ve iptal edilen dönemlerde kişiyi belirleyen alanlar ve öznel değerlendirme/görüşme metinleri, kurum tarihçesi gerekçesiyle sınırsız saklanmaz. Varsayılan saklama inceleme eşiği kapanıştan itibaren 24 aydır; Lider bunu saklama ayarlarında değiştirir. Bu süre kendiliğinden silme veya uygunluk kararı değildir. Süre dolunca mevcut amaç, yükümlülükler, başvurular ve uyuşmazlık gereksinimi insan tarafından incelenir. Gerekçeli ve süreli bekletme konulabilir. Açık onayla kimlik bağlantıları ve öznel metinler kaldırılır; dönem numarası, süreç adımları ve asgari kurumsal sonuç kayıtları korunur. Yeni dış sağlayıcı veya takip aracı eklenmez.</p>',''),'

Üyelik değerlendirmeleri
Tamamlanan ve iptal edilen dönemlerde kişiyi belirleyen alanlar ve öznel değerlendirme/görüşme metinleri, kurum tarihçesi gerekçesiyle sınırsız saklanmaz. Varsayılan saklama inceleme eşiği kapanıştan itibaren 24 aydır; Lider bunu saklama ayarlarında değiştirir. Bu süre kendiliğinden silme veya uygunluk kararı değildir. Süre dolunca mevcut amaç, yükümlülükler, başvurular ve uyuşmazlık gereksinimi insan tarafından incelenir. Gerekçeli ve süreli bekletme konulabilir. Açık onayla kimlik bağlantıları ve öznel metinler kaldırılır; dönem numarası, süreç adımları ve asgari kurumsal sonuç kayıtları korunur. Yeni dış sağlayıcı veya takip aracı eklenmez.','');
 if clean<>d.draft_body then
  update public.privacy_documents set draft_body=clean,draft_revision=draft_revision+1,updated_at=now() where slug=d.slug;
 end if;
 select body into old_body from public.privacy_document_versions where slug=d.slug and revision=d.published_revision;
 if old_body='<!--qgang-rich:v1--><p>Üyelik değerlendirmeleri</p><p>Tamamlanan ve iptal edilen dönemlerde kişiyi belirleyen alanlar ve öznel değerlendirme/görüşme metinleri, kurum tarihçesi gerekçesiyle sınırsız saklanmaz. Varsayılan saklama inceleme eşiği kapanıştan itibaren 24 aydır; Lider bunu saklama ayarlarında değiştirir. Bu süre kendiliğinden silme veya uygunluk kararı değildir. Süre dolunca mevcut amaç, yükümlülükler, başvurular ve uyuşmazlık gereksinimi insan tarafından incelenir. Gerekçeli ve süreli bekletme konulabilir. Açık onayla kimlik bağlantıları ve öznel metinler kaldırılır; dönem numarası, süreç adımları ve asgari kurumsal sonuç kayıtları korunur. Yeni dış sağlayıcı veya takip aracı eklenmez.</p>' or trim(old_body)=trim('

Üyelik değerlendirmeleri
Tamamlanan ve iptal edilen dönemlerde kişiyi belirleyen alanlar ve öznel değerlendirme/görüşme metinleri, kurum tarihçesi gerekçesiyle sınırsız saklanmaz. Varsayılan saklama inceleme eşiği kapanıştan itibaren 24 aydır; Lider bunu saklama ayarlarında değiştirir. Bu süre kendiliğinden silme veya uygunluk kararı değildir. Süre dolunca mevcut amaç, yükümlülükler, başvurular ve uyuşmazlık gereksinimi insan tarafından incelenir. Gerekçeli ve süreli bekletme konulabilir. Açık onayla kimlik bağlantıları ve öznel metinler kaldırılır; dönem numarası, süreç adımları ve asgari kurumsal sonuç kayıtları korunur. Yeni dış sağlayıcı veya takip aracı eklenmez.') then
  update public.privacy_documents set published_revision=null,updated_at=now() where slug=d.slug;
 elsif old_body ilike '%Üyelik değerlendirmeleri%' then
  raise exception 'Mixed privacy publication needs targeted review before removal';
 end if;
end $$;

insert into public.privacy_governance_events(actor_id,kind,subject,detail)
select id,'feature_retired','membership_reviews',jsonb_build_object('reason','Lider talebiyle üyelik değerlendirme modülü ve bağlı kayıtlar kaldırıldı. Önceki gizlilik yayınları tarihçede korundu.') from public.profiles where role='founder' and not is_suspended order by id limit 1;
delete from public.role_permissions where permission like 'reviews.%';
update public.privacy_settings set retention_rules=retention_rules-'reviews_months' where singleton;

-- Restore the original permission setter and retention snapshot, including their grants.
drop function public.set_role_permission(text,text,boolean);
alter function private.set_role_permission_before_reviews(text,text,boolean) set schema public;
alter function public.set_role_permission_before_reviews(text,text,boolean) rename to set_role_permission;
revoke all on function public.set_role_permission(text,text,boolean) from public,anon;
grant execute on function public.set_role_permission(text,text,boolean) to authenticated;
drop function private.privacy_retention_snapshot();
alter function private.privacy_retention_snapshot_before_reviews() rename to privacy_retention_snapshot;
revoke all on function private.privacy_retention_snapshot() from public,anon,authenticated;

do $$ declare f record; begin
 for f in select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) args from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.proname like 'membership_review_%' order by (n.nspname='public') desc
 loop execute format('drop function %I.%I(%s)',f.nspname,f.proname,f.args); end loop;
end $$;
drop table private.membership_review_releases,private.membership_review_decisions,private.membership_review_interviews,private.membership_review_evaluations,private.membership_review_audit,private.membership_review_reviewers,private.membership_review_subjects,private.membership_review_periods;

create or replace function public.save_privacy_settings(emails text[],rules jsonb,reason text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 if cardinality(emails) not between 1 and 10 or exists(select 1 from unnest(emails) e where e is null or e!~ '^[^[:space:]@<>]+@[^[:space:]@<>]+\.[^[:space:]@<>]+$') or char_length(trim(reason)) not between 10 and 2000 then raise exception 'invalid_settings';end if;
 if rules is null or jsonb_typeof(rules)<>'object' or not (rules ?& array['security_logs_days','notifications_days','aster_days','unused_media_days','requests_years','destruction_audit_years','review_interval_days']) then raise exception 'invalid_retention';end if;
 if exists(select 1 from jsonb_each(rules) e where jsonb_typeof(e.value)<>'number' or e.value::text !~ '^[0-9]+$') then raise exception 'invalid_retention';end if;
 if (rules->>'security_logs_days')::int not between 1 and 365 or (rules->>'notifications_days')::int not between 1 and 365 or (rules->>'aster_days')::int not between 1 and 365 or (rules->>'unused_media_days')::int not between 1 and 90 or (rules->>'requests_years')::int not between 1 and 10 or (rules->>'destruction_audit_years')::int not between 3 and 10 or (rules->>'review_interval_days')::int not between 1 and 180 then raise exception 'invalid_retention';end if;
 update public.privacy_settings set contact_emails=emails,retention_rules=rules,updated_at=now() where singleton;
 insert into public.privacy_governance_events(actor_id,kind,subject,detail) values(auth.uid(),'settings_updated','privacy',jsonb_build_object('reason',trim(reason),'rules',rules,'emails',emails));
end $$;
