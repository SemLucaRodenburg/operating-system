-- Plant de automatische consequentie-detectie via pg_cron + pg_net.
--
-- BELANGRIJK: net als 0004_cron_reminders.sql moet je hieronder je eigen
-- project-URL en service-role key invullen voordat je dit uitvoert. Draai dit
-- bestand los in de Supabase SQL Editor (niet via `db push`) zodat de
-- service-role key niet in git terechtkomt.

do $$
declare
  project_url text := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1';
  service_role text := 'YOUR-SERVICE-ROLE-KEY';
begin
  -- Detecteer gemiste ankers van de afgelopen dag — dagelijks 00:10 UTC
  perform cron.schedule(
    'detect-missed-anchors',
    '10 0 * * *',
    format(
      $c$select net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s', 'Content-Type', 'application/json')
      )$c$,
      project_url || '/detect-missed-anchors',
      service_role
    )
  );
end $$;

-- Om te verwijderen: select cron.unschedule('detect-missed-anchors');
