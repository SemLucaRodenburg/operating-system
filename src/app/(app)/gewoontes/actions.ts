"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/supabase/types";

// `as never` casts below work around a TS instantiation bug in @supabase/postgrest-js
// where `.upsert()`/`.insert()` generic overload resolution collapses to `never` once a
// Database type has ~10+ tables. The payload itself stays fully typed via TablesInsert<>.
export async function toggleHabitLog(habitId: string, date: string, done: boolean) {
  const supabase = await createClient();
  const payload: TablesInsert<"habit_logs"> = { habit_id: habitId, date, done };

  const { error } = await supabase
    .from("habit_logs")
    .upsert(payload as never, { onConflict: "habit_id,date" });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/gewoontes");
}

export async function logHabitValue(
  habitId: string,
  date: string,
  value: number,
  note?: string
) {
  const supabase = await createClient();
  const payload: TablesInsert<"habit_logs"> = {
    habit_id: habitId,
    date,
    done: true,
    value,
    note,
  };

  const { error } = await supabase
    .from("habit_logs")
    .upsert(payload as never, { onConflict: "habit_id,date" });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/gewoontes");
}
