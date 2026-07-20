import { createClient } from "@/lib/supabase/server";
import type {
  Domain,
  Goal,
  Habit,
  HabitLog,
  Consequence,
  Milestone,
  Checkin,
  Metric,
} from "@/lib/supabase/types";

export async function getVisionStatement(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("vision").select("statement").maybeSingle();
  // `as` cast works around a TS instantiation bug in @supabase/postgrest-js where
  // `.select()` collapses to `never` once a Database type has ~10+ tables.
  return (data as unknown as { statement: string } | null)?.statement ?? null;
}

export async function getDomains(): Promise<Domain[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("domains")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getHabits(): Promise<Habit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("habits")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getHabitLogsInRange(
  fromDate: string,
  toDate: string
): Promise<HabitLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("habit_logs")
    .select("*")
    .gte("date", fromDate)
    .lte("date", toDate);
  return (data as HabitLog[]) ?? [];
}

export async function getMilestoneProgress(): Promise<
  Pick<Milestone, "goal_id" | "done">[]
> {
  const supabase = await createClient();
  const { data } = await supabase.from("milestones").select("goal_id, done");
  // `as` cast works around a TS instantiation bug in @supabase/postgrest-js where
  // `.select()` collapses to `never` once a Database type has ~10+ tables.
  return (data ?? []) as unknown as Pick<Milestone, "goal_id" | "done">[];
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("goals").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getMilestonesForGoal(goalId: string): Promise<Milestone[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("milestones")
    .select("*")
    .eq("goal_id", goalId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getDomainById(id: string): Promise<Domain | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("domains").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getCheckinsForDate(date: string): Promise<Checkin[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("checkins").select("*").eq("date", date);
  return data ?? [];
}

export async function getMetricsInRange(
  key: string,
  fromDate: string,
  toDate: string
): Promise<{ date: string; value: number | null }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("metrics")
    .select("*")
    .eq("key", key)
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: true });
  const rows = (data ?? []) as unknown as Metric[];
  return rows.map((m) => ({ date: m.date, value: m.value }));
}

export async function getOpenConsequences(): Promise<Consequence[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("consequences")
    .select("*")
    .eq("resolved", false)
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getAllConsequences(limit = 50): Promise<Consequence[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("consequences")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  return data ?? [];
}
