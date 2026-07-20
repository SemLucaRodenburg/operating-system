-- Plant de push-herinneringen via pg_cron + pg_net.
--
-- BELANGRIJK: vul hieronder je eigen project-URL en service-role key in
-- voordat je deze migratie uitvoert (zie README § PWA & push). Draai dit
-- bestand het makkelijkst los in de Supabase SQL Editor nadat je de
-- placeholders hebt vervangen, in plaats van via `supabase db push`, zodat
-- je de service-role key niet in git hoeft te zetten.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Vervang deze twee waarden:
--   project_url:    https://<project-ref>.supabase.co/functions/v1
--   service_role:   je service_role key (Project Settings → API)
do $$
declare
  project_url text := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1';
  service_role text := 'YOUR-SERVICE-ROLE-KEY';
begin
  -- Ochtend check-in herinnering — dagelijks 07:00 UTC
  perform cron.schedule(
    'morning-checkin-reminder',
    '0 7 * * *',
    format(
      $c$select net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s', 'Content-Type', 'application/json')
      )$c$,
      project_url || '/morning-checkin-reminder',
      service_role
    )
  );

  -- Anker-herinnering — dagelijks 18:00 UTC
  perform cron.schedule(
    'anchor-reminder',
    '0 18 * * *',
    format(
      $c$select net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s', 'Content-Type', 'application/json')
      )$c$,
      project_url || '/anchor-reminder',
      service_role
    )
  );

  -- Avond check-in herinnering — dagelijks 21:00 UTC
  perform cron.schedule(
    'evening-checkin-reminder',
    '0 21 * * *',
    format(
      $c$select net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s', 'Content-Type', 'application/json')
      )$c$,
      project_url || '/evening-checkin-reminder',
      service_role
    )
  );

  -- Wekelijkse review herinnering — zondag 19:00 UTC
  perform cron.schedule(
    'weekly-review-reminder',
    '0 19 * * 0',
    format(
      $c$select net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s', 'Content-Type', 'application/json')
      )$c$,
      project_url || '/weekly-review-reminder',
      service_role
    )
  );
end $$;

-- Om een schedule te verwijderen: select cron.unschedule('morning-checkin-reminder');
-- Pas de UTC-tijden aan naar je eigen tijdzone (bv. Europe/Amsterdam is UTC+1/+2).
