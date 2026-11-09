-- Supabases "automatic RLS" skapar public.rls_auto_enable() (event trigger-funktion).
-- Den ska bara köras av event-triggern, aldrig via /rest/v1/rpc.
-- The function only exists in the hosted project, not in local Supabase.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
