-- Public reading metadata only; authors, internal change reasons and revision history stay protected.
grant select(number,parent_rule_id,section_number,updated_at,basis_rule_id,basis_revision)
 on public.regulations to anon;
create policy "guests read published codex provisions" on public.regulations
 for select to anon using (
 kind in ('KURAL','İLKE','YÖNERGE')
 and status<>'taslak' and published_at<=now()
 );
