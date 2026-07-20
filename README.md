# Levens-OS

Persoonlijke productiviteits- en levensdoelen-app. Next.js (App Router) + TypeScript +
Tailwind + shadcn/ui, met Supabase als backend (Postgres, Auth, RLS) en optioneel de
Anthropic Claude API voor AI-features.

## Status

Fase 1, 2, 3, 5 en 6 zijn af; fase 4 is bewust overgeslagen:

- **Fase 1 — Fundament**: project-scaffold, Supabase-integratie, datamodel + RLS,
  magic-link login, app-shell (sidebar/bottom-nav, visie-banner, dark theme).
- **Fase 2 — Kernschermen**: Vandaag-dashboard, Doelen (lijst + detail met
  mijlpalen), Gewoontes (week-/maandgrid met streaks), Check-in (ochtend/avond).
- **Fase 3 — Inzichten**: grafieken voor consistentie, gewicht, uren per domein,
  streak-lengtes en doelvoortgang (Recharts).
- **Fase 4 — AI**: **bewust nog niet gebouwd/uitgeschakeld** — dit vereist een
  betaalde Anthropic API-key (kosten per gebruik). Activeer dit pas zodra je daar
  een budget voor hebt vastgesteld.
- **Fase 5 — PWA & push**: manifest + service worker (installeerbaar, ook op
  iPhone via "Zet op beginscherm"), web-push opt-in in Instellingen, en Supabase
  Edge Functions + pg_cron voor geplande herinneringen.
- **Fase 6 — Consequenties & polish**: automatische detectie van gemiste
  dagelijkse ankers (Edge Function + pg_cron) die een zichtbare "schuld"-rij
  aanmaakt, volledig consequentie-beheer in Instellingen (lijst, handmatig
  toevoegen, inlossen), en een grote voortgangs-hero op het dashboard.

## 1. Supabase-project opzetten

1. Maak een project aan op [supabase.com](https://supabase.com).
2. Ga naar **Project Settings → API** en kopieer:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (alléén server-side/Edge
     Functions, nooit in de client)
3. Ga naar **Authentication → Providers** en zorg dat **Email** aanstaat met
   "Confirm email" naar wens (magic link werkt met of zonder).
4. Ga naar **Authentication → URL Configuration** en zet de Site URL en Redirect
   URLs op je lokale en productie-domein, bv.:
   - `http://localhost:3000/auth/callback`
   - `https://jouw-domein.nl/auth/callback`

## 2. Migraties draaien

Met de [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase login
npx supabase link --project-ref <jouw-project-ref>
npx supabase db push
```

Dit voert `0001_init.sql` (datamodel + RLS), `0002_seed_function.sql`
(seed-functie) en `0003_ai_reviews_unique.sql` (constraint voor toekomstige
AI-reviews) uit. De seed-data (visie, domeinen, doelen, ankers, gewoontes) wordt
automatisch ingeladen bij je eerste bezoek na inloggen — de app roept dan
éénmalig de Postgres-functie `seed_levens_os()` aan.

**`0004_cron_reminders.sql` en `0005_cron_missed_anchors.sql` draai je apart**,
pas nadat je de placeholders erin hebt vervangen door je eigen project-URL en
service-role key (zie stap 6) — plak die twee bestanden in de **SQL Editor** in
het Supabase-dashboard in plaats van via `db push`, zodat de service-role key
niet in git terechtkomt.

## 3. Environment variables

```bash
cp .env.example .env.local
```

Vul in: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, en de VAPID-keys voor push
(zie stap 6). `ANTHROPIC_API_KEY` is optioneel en pas nodig als je zelf AI-features
toevoegt.

## 4. Lokaal draaien

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), log in met je e-mailadres via
de magic link, en de app seedt automatisch je persoonlijke content.

## 5. Deployen naar Vercel

1. Push de repo naar GitHub.
2. Importeer het project in [Vercel](https://vercel.com/new).
3. Zet dezelfde environment variables als in `.env.local` in de Vercel
   project-instellingen (Production + Preview) — **plus** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   als je push gebruikt.
4. Zet `NEXT_PUBLIC_SITE_URL` op je productie-domein en voeg
   `https://jouw-domein.nl/auth/callback` toe aan de Supabase Redirect URLs.
5. Koppel je eigen domeinnaam via Vercel → Settings → Domains.

## 6. PWA & push instellen

1. **VAPID-keys genereren**:

   ```bash
   npx web-push generate-vapid-keys
   ```

   Zet de public key in `.env.local` én Vercel als `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
   en bewaar de private key voor stap 3 (Edge Function secrets) —zet die **niet**
   in `.env.local`/Vercel, alleen server-side in Supabase.

2. **Push aanzetten**: log in op de gedeployde app → Instellingen → zet
   "Push-meldingen" aan. De browser vraagt om toestemming en de subscription
   wordt opgeslagen in `push_subscriptions`.

3. **Edge Functions deployen** (sturen de daadwerkelijke pushes en detecteren
   gemiste ankers):

   ```bash
   npx supabase functions deploy morning-checkin-reminder
   npx supabase functions deploy anchor-reminder
   npx supabase functions deploy evening-checkin-reminder
   npx supabase functions deploy weekly-review-reminder
   npx supabase functions deploy detect-missed-anchors

   npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:jij@voorbeeld.nl
   ```

   (`SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` zijn al automatisch beschikbaar
   binnen Edge Functions.)

4. **Plannen met pg_cron**: open `supabase/migrations/0004_cron_reminders.sql`
   én `0005_cron_missed_anchors.sql`, vul in beide je eigen project-URL en
   `service_role` key in op de plek van de placeholders, en voer ze uit in de
   **SQL Editor** van het Supabase-dashboard (niet via `db push`, zodat de
   service-role key niet in git terechtkomt). Samen plannen ze: ochtend-,
   anker- en avond-herinnering, de zondagse weekreview-herinnering, en de
   dagelijkse detectie van gemiste ankers (die de consequenties in
   Instellingen vult). Pas de UTC-tijden aan naar je eigen tijdzone.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript + Tailwind CSS v4 +
  shadcn/ui + lucide-react
- **Supabase**: Postgres, Auth (email magic link), Row Level Security, Edge
  Functions, pg_cron
- **Recharts** voor grafieken
- **PWA**: manifest + service worker + web-push/VAPID
- **Anthropic Claude API**: nog niet geactiveerd (optioneel, kost per gebruik —
  zie Status hierboven)

## Projectstructuur

```
src/app/
  login/                  Magic-link login
  auth/callback/          OAuth/magic-link callback route
  (app)/                  Ingelogde app-shell (sidebar, bottom-nav, visie-banner)
    page.tsx              Vandaag (dashboard)
    doelen/                Doelen (lijst + detail)
    gewoontes/              Gewoontes (week-/maandgrid)
    check-in/               Check-in (ochtend/avond)
    inzichten/              Inzichten (grafieken)
    ai/                     AI (placeholder — zie Status)
    instellingen/           Instellingen (push-toggle, consequenties-beheer)
src/lib/supabase/         Browser/server/middleware Supabase-clients + types
src/lib/data/              Server-side data queries + habit/streak/insights-berekeningen
src/components/pwa/        Service-worker registratie + push-toggle
src/components/instellingen/ Consequenties-beheer
public/sw.js                Service worker (offline fallback + push + notificatieklikken)
supabase/migrations/       SQL-migraties (schema, RLS, seed-functie, cron)
supabase/functions/        Edge Functions: push-herinneringen + gemiste-ankers-detectie
```

## Bekende TypeScript-workaround

`src/lib/supabase/types.ts` bevat 11 tabellen. Vanaf ongeveer dat aantal loopt
`@supabase/postgrest-js`'s generic-inferentie voor `.upsert()`/`.insert()`/
`.update()` en kolom-specifieke `.select()`-calls tegen een instantiatie-limiet
aan en valt terug op `never`. De workaround (een expliciet getypeerde
`TablesInsert<"tabel">`/`TablesUpdate<"tabel">`-variabele, gevolgd door een
`as never`-cast bij de aanroep zelf) staat toegepast in `src/lib/data/queries.ts`
en de diverse `actions.ts`-bestanden — volg dat patroon bij nieuwe mutaties of
partial-column selects.
