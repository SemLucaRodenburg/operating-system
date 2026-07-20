// Draait elke zondagavond (zie README voor de pg_cron-planning).
// Herinnert alle gebruikers met een push-subscription aan hun wekelijkse
// review (Inzichten-pagina doornemen, week reflecteren).
import { getAdminClient } from "../_shared/supabase-admin.ts";
import { notifyUsers } from "../_shared/notify.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = getAdminClient();
  const { data: subscribedUsers, error } = await supabase
    .from("push_subscriptions")
    .select("user_id");
  if (error) throw error;

  const userIds = [...new Set((subscribedUsers ?? []).map((r) => r.user_id as string))];

  const result = await notifyUsers(userIds, {
    title: "Wekelijkse review",
    body: "Neem je week door: bekijk je Inzichten en reflecteer op wat wel en niet werkte.",
    url: "/inzichten",
    tag: "weekly-review",
  });

  return Response.json(result);
});
