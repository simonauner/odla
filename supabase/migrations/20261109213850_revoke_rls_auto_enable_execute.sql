-- Supabases "automatic RLS" skapar public.rls_auto_enable() (event trigger-funktion).
-- Den ska bara köras av event-triggern, aldrig via /rest/v1/rpc.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
