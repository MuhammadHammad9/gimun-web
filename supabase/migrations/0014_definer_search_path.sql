-- SECURITY DEFINER functions run with their owner's rights, so their name
-- lookup must not be steerable. They already pin search_path to public; this
-- also names pg_temp explicitly, last, so a temporary table or function can
-- never shadow a public one (PostgreSQL otherwise searches pg_temp first).
-- Every definer function in public is covered, including any added later
-- by hand before this ran.
do $$
declare f regprocedure;
begin
  for f in
    select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = public, pg_temp', f);
  end loop;
end $$;
