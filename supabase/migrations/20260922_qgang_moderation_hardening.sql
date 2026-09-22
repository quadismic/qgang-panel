-- Q-GANG moderation hardening reconciliation.
-- Mirrors the security/finality logic applied to the live project on 2026-09-22.

alter table public.moderation_actions
 add column if not exists issuer_role public.qgang_role;

update public.moderation_actions a
set issuer_role=p.role
from public.profiles p
where p.id=a.moderator_id and a.issuer_role is null;

alter table public.moderation_actions alter column issuer_role set not null;

create or replace function public.qgang_set_moderation_finality()
returns trigger language plpgsql security definer set search_path=public as $$
declare actor_role public.qgang_role; target_role public.qgang_role;
begin
 select role into actor_role from public.profiles where id=new.moderator_id;
 if new.moderator_id <> auth.uid() then raise exception 'invalid_moderator'; end if;
 select role into target_role from public.profiles where id=new.target_user_id;
 if target_role is null or new.target_user_id=new.moderator_id then raise exception 'invalid_target'; end if;
 if (actor_role='moderator' and target_role in ('moderator','admin','founder'))
 or (actor_role='admin' and target_role in ('admin','founder'))
 or actor_role not in ('moderator','admin','founder') then raise exception 'forbidden_target'; end if;
 if actor_role='moderator' and new.action not in ('warning','restriction','mute') then raise exception 'forbidden_action'; end if;
 new.issuer_role:=actor_role;
 if actor_role='founder' then new.finality_status:='final';new.finalized_at:=coalesce(new.finalized_at,now());
 else new.finality_status:='pending_review';new.finalized_at:=null; end if;
 return new;
end $$;

create or replace function public.qgang_finalize_moderation_action()
returns trigger language plpgsql security definer set search_path=public as $$
declare actor_role public.qgang_role;admin_ok boolean;founder_ok boolean;revoked boolean;
begin
 select issuer_role into actor_role from public.moderation_actions where id=new.action_id;
 select exists(select 1 from public.moderation_reviews where action_id=new.action_id and decision='revoke') into revoked;
 if revoked then update public.moderation_actions set finality_status='revoked',status='revoked',finalized_at=now() where id=new.action_id;return new;end if;
 select exists(select 1 from public.moderation_reviews where action_id=new.action_id and reviewer_role='admin' and decision='approve') into admin_ok;
 select exists(select 1 from public.moderation_reviews where action_id=new.action_id and reviewer_role='founder' and decision='approve') into founder_ok;
 if actor_role='moderator' and admin_ok and founder_ok then update public.moderation_actions set finality_status='final',finalized_at=now() where id=new.action_id;
 elsif actor_role='admin' and founder_ok then update public.moderation_actions set finality_status='final',finalized_at=now() where id=new.action_id;end if;
 return new;
end $$;

create or replace function public.qgang_apply_appeal_result()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.status='open' and new.status='accepted' then
  update public.moderation_actions set status='revoked',finality_status='revoked',finalized_at=coalesce(finalized_at,now()) where id=new.action_id;
 end if;
 return new;
end $$;

revoke execute on function public.qgang_set_moderation_finality() from public,anon,authenticated;
revoke execute on function public.qgang_finalize_moderation_action() from public,anon,authenticated;
revoke execute on function public.qgang_apply_appeal_result() from public,anon,authenticated;
grant execute on function public.qgang_set_moderation_finality() to postgres,service_role;
grant execute on function public.qgang_finalize_moderation_action() to postgres,service_role;
grant execute on function public.qgang_apply_appeal_result() to postgres,service_role;
