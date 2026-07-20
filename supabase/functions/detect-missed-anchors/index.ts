// Draait kort na middernacht UTC (zie README voor de pg_cron-planning).
// Maakt een zichtbare "consequence"-rij aan voor elk dagelijks anker dat
// gisteren niet is afgevinkt.
import { getAdminClient } from "../_shared/supabase-admin.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = getAdminClient();

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  const { data: anchors, error: habitsError } = await supabase
    .from("habits")
    .select("id, user_id, name")
    .eq("anchor", true)
    .eq("cadence", "daily")
    .eq("active", true);
  if (habitsError) throw habitsError;

  if (!anchors || anchors.length === 0) {
    return Response.json({ created: 0 });
  }

  const anchorIds = anchors.map((a) => a.id as string);

  const { data: doneLogs, error: logsError } = await supabase
    .from("habit_logs")
    .select("habit_id")
    .eq("date", yesterdayKey)
    .eq("done", true)
    .in("habit_id", anchorIds);
  if (logsError) throw logsError;

  const doneHabitIds = new Set((doneLogs ?? []).map((l) => l.habit_id as string));
  const missed = anchors.filter((a) => !doneHabitIds.has(a.id as string));

  if (missed.length === 0) {
    return Response.json({ created: 0 });
  }

  // Voorkom dubbele rijen als deze functie per ongeluk twee keer draait voor dezelfde dag.
  const { data: existing, error: existingError } = await supabase
    .from("consequences")
    .select("source_habit_id")
    .eq("date", yesterdayKey)
    .in(
      "source_habit_id",
      missed.map((m) => m.id as string)
    );
  if (existingError) throw existingError;

  const alreadyLogged = new Set((existing ?? []).map((c) => c.source_habit_id as string));
  const toInsert = missed
    .filter((m) => !alreadyLogged.has(m.id as string))
    .map((m) => ({
      user_id: m.user_id as string,
      source_habit_id: m.id as string,
      date: yesterdayKey,
      description: `Anker gemist: "${m.name}" op ${yesterdayKey}`,
      resolved: false,
    }));

  if (toInsert.length === 0) {
    return Response.json({ created: 0 });
  }

  const { error: insertError } = await supabase.from("consequences").insert(toInsert);
  if (insertError) throw insertError;

  return Response.json({ created: toInsert.length });
});
