"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/supabase/types";

export interface TopTask {
  title: string;
  goal_id?: string | null;
  done?: boolean;
}

// `as never` casts work around a TS instantiation bug in @supabase/postgrest-js
// where `.upsert()` generic overload resolution collapses to `never` once a
// Database type has ~10+ tables. Payloads stay fully typed via TablesInsert<>.
export async function saveMorningCheckin(
  date: string,
  intention: string,
  topTasks: TopTask[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  const payload: TablesInsert<"checkins"> = {
    user_id: user.id,
    date,
    type: "morning",
    intention,
    top_tasks: topTasks.filter((t) => t.title.trim().length > 0),
  };

  const { error } = await supabase
    .from("checkins")
    .upsert(payload as never, { onConflict: "user_id,date,type" });

  if (error) throw new Error(error.message);

  revalidatePath("/check-in");
  revalidatePath("/");
}

export async function saveEveningCheckin(
  date: string,
  reflection: string,
  screenNote: string,
  weightKg: number | null,
  mood: number | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  const payload: TablesInsert<"checkins"> = {
    user_id: user.id,
    date,
    type: "evening",
    reflection,
    screen_note: screenNote,
    weight_kg: weightKg,
    mood,
  };

  const { error } = await supabase
    .from("checkins")
    .upsert(payload as never, { onConflict: "user_id,date,type" });

  if (error) throw new Error(error.message);

  if (weightKg != null) {
    const metricPayload: TablesInsert<"metrics"> = {
      user_id: user.id,
      date,
      key: "weight_kg",
      value: weightKg,
    };
    await supabase
      .from("metrics")
      .upsert(metricPayload as never, { onConflict: "user_id,date,key" });
  }

  revalidatePath("/check-in");
  revalidatePath("/");
  revalidatePath("/inzichten");
}
