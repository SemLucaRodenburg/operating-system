"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

// `as never` casts below work around a TS instantiation bug in @supabase/postgrest-js
// where `.upsert()`/`.insert()`/`.update()` generic overload resolution collapses to
// `never` once a Database type has ~10+ tables. Payloads stay fully typed via TablesInsert<>/TablesUpdate<>.
export async function resolveConsequence(id: string) {
  const supabase = await createClient();
  const payload: TablesUpdate<"consequences"> = { resolved: true };

  const { error } = await supabase
    .from("consequences")
    .update(payload as never)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/instellingen");
}

export async function addConsequence(description: string, sourceHabitId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  const today = new Date().toISOString().slice(0, 10);
  const payload: TablesInsert<"consequences"> = {
    user_id: user.id,
    source_habit_id: sourceHabitId ?? null,
    date: today,
    description,
  };

  const { error } = await supabase.from("consequences").insert(payload as never);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/instellingen");
}
