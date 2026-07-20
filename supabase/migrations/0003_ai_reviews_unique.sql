-- Eén AI-review per periode per dag: opnieuw genereren overschrijft de vorige.
alter table public.ai_reviews
  add constraint ai_reviews_user_period_date_key unique (user_id, period, date);
