-- Seed-functie: vult Levens-OS met de standaard content voor de ingelogde gebruiker.
-- Wordt eenmalig aangeroepen vanuit de app na de eerste login (idempotent).

create or replace function public.seed_levens_os()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  d_agency uuid;
  d_padel uuid;
  d_sport uuid;
  d_habits uuid;
  g_agency uuid;
  g_padel uuid;
  g_padel2 uuid;
  g_weight uuid;
  g_food uuid;
begin
  if uid is null then
    raise exception 'seed_levens_os: geen ingelogde gebruiker';
  end if;

  -- idempotent: als er al domeinen zijn, stop
  if exists (select 1 from public.domains where user_id = uid) then
    return;
  end if;

  insert into public.users (id, email) values (uid, (select email from auth.users where id = uid))
    on conflict (id) do nothing;

  insert into public.vision (user_id, statement) values (
    uid,
    'Succesvol ondernemer worden op meerdere vlakken. Mijn tijd is nu kostbaar — elke dag moet bijdragen aan de grote visie in plaats van vast te hangen op kleine dingen.'
  ) on conflict (user_id) do nothing;

  -- Domeinen
  insert into public.domains (user_id, name, color, sort_order) values (uid, 'S&F Agency', '#6366f1', 0) returning id into d_agency;
  insert into public.domains (user_id, name, color, sort_order) values (uid, 'Smash Padel Schiedam', '#0ea5e9', 1) returning id into d_padel;
  insert into public.domains (user_id, name, color, sort_order) values (uid, 'Sport & gezondheid', '#22c55e', 2) returning id into d_sport;
  insert into public.domains (user_id, name, color, sort_order) values (uid, 'Gewoontes', '#f59e0b', 3) returning id into d_habits;

  -- Doelen
  insert into public.goals (user_id, domain_id, title, description, type, deadline, status)
    values (uid, d_agency, 'S&F Agency winstgevend maken in 2026',
      'Investering terugverdienen met 2 à 3 klanten.', 'milestones', '2026-12-31', 'active')
    returning id into g_agency;

  insert into public.milestones (goal_id, title, sort_order) values
    (g_agency, 'Eerste klant binnenhalen', 0),
    (g_agency, 'Tweede klant binnenhalen', 1),
    (g_agency, 'Derde klant binnenhalen', 2),
    (g_agency, 'Investering volledig terugverdiend', 3);

  insert into public.goals (user_id, domain_id, title, description, type, deadline, status)
    values (uid, d_padel, 'Bedrijfsplan Smash Padel Schiedam af', null, 'milestones', '2026-12-31', 'active')
    returning id into g_padel;

  insert into public.milestones (goal_id, title, sort_order) values
    (g_padel, 'Marktonderzoek afgerond', 0),
    (g_padel, 'Locatie in kaart gebracht', 1),
    (g_padel, 'Financieel plan af', 2),
    (g_padel, 'Bedrijfsplan compleet', 3);

  insert into public.goals (user_id, domain_id, title, description, type, deadline, status)
    values (uid, d_padel, 'Starten met bouwen/openen', 'Vervolgdoel na het bedrijfsplan.', 'milestones', '2028-02-01', 'paused')
    returning id into g_padel2;

  insert into public.goals (user_id, domain_id, title, type, target_value, current_value, unit, deadline, status)
    values (uid, d_sport, '10 kg afvallen', 'numeric', 10, 0, 'kg', '2026-12-31', 'active')
    returning id into g_weight;

  insert into public.goals (user_id, domain_id, title, type, target_value, current_value, unit, deadline, status)
    values (uid, d_sport, 'Gezonder eten en minder snacken', 'percent', 100, 0, '%', null, 'active')
    returning id into g_food;

  -- Ankers (habits, anchor = true)
  insert into public.habits (user_id, name, kind, cadence, weekly_target, domain_id, anchor, active, sort_order) values
    (uid, '2 uur aan S&F Agency', 'build', 'daily', null, d_agency, true, true, 0),
    (uid, '1 uur Smash Padel Schiedam (onderzoek)', 'build', 'daily', null, d_padel, true, true, 1),
    (uid, 'Opstaan om 06:00', 'build', 'daily', null, d_habits, true, true, 2),
    (uid, 'Uiterlijk 23:00 naar bed', 'build', 'daily', null, d_habits, true, true, 3),
    (uid, 'Sportschool', 'build', 'weekly', 2, d_sport, true, true, 4),
    (uid, 'Padel', 'build', 'weekly', 2, d_sport, true, true, 5);

  -- Overige gewoontes
  insert into public.habits (user_id, name, kind, cadence, weekly_target, domain_id, anchor, active, sort_order) values
    (uid, 'Geen doomscroll voor het slapen', 'avoid', 'daily', null, d_habits, false, true, 6),
    (uid, 'Niet solo-gamen (alleen met vrienden)', 'avoid', 'daily', null, d_habits, false, true, 7),
    (uid, 'Gezond eten / niet snacken', 'avoid', 'daily', null, d_sport, false, true, 8),
    (uid, 'Weekend nuttig benutten', 'build', 'weekly', 1, d_habits, false, true, 9);
end;
$$;
