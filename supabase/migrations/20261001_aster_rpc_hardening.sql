-- QAE RPC hardening: exposed SECURITY DEFINER functions must never be callable anonymously.
revoke execute on function public.qae_is_manager() from anon;
revoke execute on function public.qae_can_invoke() from anon;
revoke execute on function public.qae_create_memory_proposal(text,text,text,text,text) from anon;
revoke execute on function public.qae_review_memory_proposal(uuid,text) from anon;
revoke execute on function public.qae_create_task(text,text,text,text,text) from anon;
revoke execute on function public.qae_claim_task(uuid) from anon;
revoke execute on function public.qae_complete_task(uuid,text,text,text,text) from anon;
revoke execute on function public.qae_fail_task(uuid,text) from anon;
