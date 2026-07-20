// Draait op een vast moment overdag (zie README voor de pg_cron-planning).
// Stuurt een push naar iedereen die nog minstens één dagelijks anker moet
// afvinken vandaag.
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

  const { data: anchors, error: habitsError } = await supabase
    .from("habits")
    .select("id, user_id")
    .eq("anchor", true)
    .eq("cadence", "daily")
    .eq("active", true)
    .in("user_id", userIds);
  if (habitsError) throw habitsError;

  const anchorIds = (anchors ?? []).map((a) => a.id as string);
  if (anchorIds.length === 0) {
    return Response.json({ sent: 0, failed: 0, skipped: userIds.length });
  }

  const { data: doneLogs, error: logsError } = await supabase
    .from("habit_logs")
    .select("habit_id")
    .eq("date", today)
    .eq("done", true)
    .in("habit_id", anchorIds);
  if (logsError) throw logsError;

  const doneHabitIds = new Set((doneLogs ?? []).map((l) => l.habit_id as string));
  const usersWithOpenAnchors = new Set(
    (anchors ?? [])
      .filter((a) => !doneHabitIds.has(a.id as string))
      .map((a) => a.user_id as string)
  );

  const result = await notifyUsers([...usersWithOpenAnchors], {
    title: "Nog openstaande ankers",
    body: "Je hebt vandaag nog niet al je ankers afgevinkt.",
    url: "/",
    tag: "anchor-reminder",
  });

  return Response.json({
    ...result,
    skipped: userIds.length - usersWithOpenAnchors.size,
  });
});
