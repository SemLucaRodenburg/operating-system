// Draait 's avonds (zie README voor de pg_cron-planning).
// Stuurt een push naar iedereen met een push-subscription die vandaag nog
// geen avond check-in heeft ingevuld.
import { getAdminClient } from "../_shared/supabase-admin.ts";
import { notifyUsers } from "../_shared/notify.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = getAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: subscribedUsers, error: subError } = await supabase
    .from("push_subscriptions")
    .select("user_id");
  if (subError) throw subError;

  const userIds = [...new Set((subscribedUsers ?? []).map((r) => r.user_id as string))];
  if (userIds.length === 0) {
    return Response.json({ sent: 0, failed: 0, skipped: 0 });
  }

  const { data: doneToday, error: checkinError } = await supabase
    .from("checkins")
    .select("user_id")
    .eq("type", "evening")
    .eq("date", today)
    .in("user_id", userIds);
  if (checkinError) throw checkinError;

  const doneUserIds = new Set((doneToday ?? []).map((r) => r.user_id as string));
  const targetUserIds = userIds.filter((id) => !doneUserIds.has(id));

  const result = await notifyUsers(targetUserIds, {
    title: "Goedenavond",
    body: "Ronde de dag af met je avond check-in — reflectie, gewicht en schermtijd.",
    url: "/check-in",
    tag: "evening-checkin",
  });

  return Response.json({ ...result, skipped: userIds.length - targetUserIds.length });
});
