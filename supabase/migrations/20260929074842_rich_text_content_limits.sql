-- Formatting occupies storage but must not consume the visible-text allowance.
-- Existing plain values are untouched. No table grants, policies or role rules are widened.
begin;
create or replace function public.qg_content_length(content text)
returns integer language sql immutable strict parallel safe
set search_path = pg_catalog
as $$
  select case when left(content, 20) = '<!--qgang-rich:v1-->' then
    char_length(btrim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(
      substring(content from 21), '<br\s*/?\s*>|</(p|h[234]|li|tr|blockquote)>', E'\n', 'gi'),
      '<[^>]*>', '', 'g'), '&nbsp;|&#160;|&#x[aA]0;', ' ', 'g'),
      '&[a-zA-Z][a-zA-Z0-9]+;|&#[0-9]+;|&#x[0-9a-fA-F]+;', 'x', 'g'), E' \n\r\t'))
    else char_length(content) end
$$;
-- Pure text helper. It exposes no records and runs with the caller's privileges.
revoke all on function public.qg_content_length(text) from public;
grant execute on function public.qg_content_length(text) to anon, authenticated, service_role;

alter table public.profiles drop constraint if exists profiles_bio_check;
alter table public.profiles add constraint profiles_bio_check check (char_length(bio) <= 250000 and public.qg_content_length(bio) <= 280) not valid;
-- Legacy feed tables exist in fresh schema chains but are absent from some deployments.
do $$ begin
  if to_regclass('public.posts') is not null then
    alter table public.posts drop constraint if exists posts_body_check;
    alter table public.posts add constraint posts_body_check check (char_length(body) <= 250000 and public.qg_content_length(body) between 1 and 4000) not valid;
  end if;
  if to_regclass('public.comments') is not null then
    alter table public.comments drop constraint if exists comments_body_check;
    alter table public.comments add constraint comments_body_check check (char_length(body) <= 250000 and public.qg_content_length(body) between 1 and 1500) not valid;
  end if;
end $$;
alter table public.profile_comments drop constraint if exists profile_comments_body_check;
alter table public.profile_comments add constraint profile_comments_body_check check (char_length(body) <= 250000 and public.qg_content_length(body) between 1 and 500) not valid;
alter table public.fund_transactions drop constraint if exists fund_transactions_description_check;
alter table public.fund_transactions add constraint fund_transactions_description_check check (char_length(description) <= 250000 and public.qg_content_length(description) <= 500) not valid;
alter table public.reports drop constraint if exists reports_reason_check;
alter table public.reports add constraint reports_reason_check check (char_length(reason) <= 250000 and public.qg_content_length(reason) between 3 and 500) not valid;
alter table public.moderation_actions drop constraint if exists moderation_actions_reason_check;
alter table public.moderation_actions add constraint moderation_actions_reason_check check (char_length(reason) <= 250000 and public.qg_content_length(reason) between 3 and 500) not valid;
alter table public.moderation_appeals drop constraint if exists moderation_appeals_body_check;
alter table public.moderation_appeals add constraint moderation_appeals_body_check check (char_length(body) <= 250000 and public.qg_content_length(body) between 10 and 1500) not valid;
alter table public.publications drop constraint if exists publications_excerpt_check;
alter table public.publications add constraint publications_excerpt_check check (char_length(excerpt) <= 250000 and public.qg_content_length(excerpt) <= 500) not valid;
alter table public.publications drop constraint if exists publications_body_check;
alter table public.publications add constraint publications_body_check check (char_length(body) <= 250000 and public.qg_content_length(body) <= 50000) not valid;
commit;
