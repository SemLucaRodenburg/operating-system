"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/supabase/types";

// `as never` casts work around a TS instantiation bug in @supabase/postgrest-js
// where `.update()` generic overload resolution collapses to `never` once a
// Database type has ~10+ tables. Payloads stay fully typed via TablesUpdate<>.
export async function toggleMilestone(id: string, done: boolean, goalId: string) {
  const supabase = await createClient();
  const payload: TablesUpdate<"milestones"> = { done };

  const { error } = await supabase.from("milestones").update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/doelen/${goalId}`);
  revalidatePath("/doelen");
  revalidatePath("/");
}

export async function updateGoalValue(goalId: string, currentValue: number) {
  const supabase = await createClient();
  const payload: TablesUpdate<"goals"> = { current_value: currentValue };

  const { error } = await supabase.from("goals").update(payload as never).eq("id", goalId);
  if (error) throw new Error(error.message);

  revalidatePath(`/doelen/${goalId}`);
  revalidatePath("/doelen");
  revalidatePath("/");
}

export async function updateGoalStatus(
  goalId: string,
  status: "active" | "done" | "paused" | "archived"
) {
  const supabase = await createClient();
  const payload: TablesUpdate<"goals"> = { status };

  const { error } = await supabase.from("goals").update(payload as never).eq("id", goalId);
  if (error) throw new Error(error.message);

  revalidatePath(`/doelen/${goalId}`);
  revalidatePath("/doelen");
  revalidatePath("/");
}
