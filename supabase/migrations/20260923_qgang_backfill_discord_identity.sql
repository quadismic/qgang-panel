insert into public.connected_accounts(user_id,provider,provider_user_id,provider_handle,profile_url,metadata)
select i.user_id,'discord',i.id::text,coalesce(i.identity_data->>'full_name',i.identity_data->>'name',i.identity_data->>'preferred_username',i.identity_data->>'user_name','Discord'),null,jsonb_build_object('avatar',coalesce(i.identity_data->>'avatar_url',i.identity_data->>'picture'))
from auth.identities i where i.provider='discord'
on conflict (user_id,provider) do update set provider_user_id=excluded.provider_user_id,provider_handle=excluded.provider_handle,metadata=excluded.metadata;
