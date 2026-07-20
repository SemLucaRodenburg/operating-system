import type { Habit, HabitLog } from "@/lib/supabase/types";
import { addDays, format, parseISO, startOfWeek, isSameWeek } from "date-fns";

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Aaneengesloten streak in dagen, terugtellend vanaf vandaag (of gisteren als vandaag nog niet gedaan is). */
export function computeDailyStreak(logs: HabitLog[], today: Date): number {
  const doneDates = new Set(
    logs.filter((l) => l.done).map((l) => l.date)
  );

  let streak = 0;
  let cursor = today;

  if (!doneDates.has(toDateKey(today))) {
    cursor = addDays(today, -1);
  }

  while (doneDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function weekProgress(
  logs: HabitLog[],
  today: Date
): { done: number; target: number } {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const done = logs.filter(
    (l) => l.done && isSameWeek(parseISO(l.date), weekStart, { weekStartsOn: 1 })
  ).length;
  return { done, target: 0 };
}

export function isHabitDoneOn(logs: HabitLog[], habitId: string, date: string): boolean {
  return logs.some((l) => l.habit_id === habitId && l.date === date && l.done);
}

export function habitLogsFor(logs: HabitLog[], habitId: string): HabitLog[] {
  return logs.filter((l) => l.habit_id === habitId);
}

export function goalProgressPct(current: number, target: number | null): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export type { Habit };
