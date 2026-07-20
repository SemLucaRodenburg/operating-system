import { eachDayOfInterval, format, startOfWeek, subDays } from "date-fns";
import type { Domain, Goal, Habit, HabitLog, Milestone } from "@/lib/supabase/types";
import { computeDailyStreak, toDateKey } from "@/lib/data/habit-stats";

/** Haalt een "X uur"-indicatie uit een habit-naam, valt terug op 1 uur. */
function impliedHours(habitName: string): number {
  const match = habitName.match(/(\d+(?:[.,]\d+)?)\s*uur/i);
  if (!match) return 1;
  return parseFloat(match[1].replace(",", "."));
}

export interface ConsistencyPoint {
  date: string;
  pct: number;
}

/** Percentage dagelijkse ankers afgevinkt, per dag, over het opgegeven venster. */
export function computeConsistencySeries(
  habits: Habit[],
  logs: HabitLog[],
  days: number,
  today: Date
): ConsistencyPoint[] {
  const dailyAnchors = habits.filter((h) => h.anchor && h.cadence === "daily");
  if (dailyAnchors.length === 0) return [];

  const dates = eachDayOfInterval({ start: subDays(today, days - 1), end: today });

  return dates.map((date) => {
    const dateKey = toDateKey(date);
    const doneCount = dailyAnchors.filter((h) =>
      logs.some((l) => l.habit_id === h.id && l.date === dateKey && l.done)
    ).length;
    return { date: dateKey, pct: Math.round((doneCount / dailyAnchors.length) * 100) };
  });
}

export interface StreakDatum {
  habitName: string;
  streak: number;
}

export function computeStreaks(habits: Habit[], logs: HabitLog[], today: Date): StreakDatum[] {
  return habits
    .filter((h) => h.anchor && h.cadence === "daily")
    .map((h) => ({
      habitName: h.name,
      streak: computeDailyStreak(
        logs.filter((l) => l.habit_id === h.id),
        today
      ),
    }))
    .sort((a, b) => b.streak - a.streak);
}

export interface DomainHoursDatum {
  week: string;
  [domainName: string]: string | number;
}

/** Benaderde uren per domein per week, afgeleid uit voltooide dagelijkse ankers × geimpliceerde uren. */
export function computeDomainHoursByWeek(
  domains: Domain[],
  habits: Habit[],
  logs: HabitLog[],
  weeks: number,
  today: Date
): DomainHoursDatum[] {
  const dailyHabitsWithDomain = habits.filter((h) => h.cadence === "daily" && h.domain_id);

  const weekStarts = Array.from({ length: weeks }, (_, i) =>
    startOfWeek(subDays(today, (weeks - 1 - i) * 7), { weekStartsOn: 1 })
  );

  return weekStarts.map((weekStart) => {
    const weekDays = eachDayOfInterval({ start: weekStart, end: subDays(weekStart, -6) }).map(
      toDateKey
    );
    const row: DomainHoursDatum = { week: format(weekStart, "d MMM") };

    for (const domain of domains) {
      const domainHabits = dailyHabitsWithDomain.filter((h) => h.domain_id === domain.id);
      let hours = 0;
      for (const habit of domainHabits) {
        const doneDays = logs.filter(
          (l) => l.habit_id === habit.id && l.done && weekDays.includes(l.date)
        ).length;
        hours += doneDays * impliedHours(habit.name);
      }
      row[domain.name] = Math.round(hours * 10) / 10;
    }

    return row;
  });
}

export interface GoalProgressDatum {
  title: string;
  pct: number;
  domainColor: string | undefined;
}

export function computeGoalProgress(
  goals: Goal[],
  domains: Domain[],
  milestones: Pick<Milestone, "goal_id" | "done">[]
): GoalProgressDatum[] {
  return goals
    .filter((g) => g.status === "active")
    .map((g) => {
      const domain = domains.find((d) => d.id === g.domain_id);
      let pct = 0;
      if (g.type === "milestones") {
        const goalMilestones = milestones.filter((m) => m.goal_id === g.id);
        pct =
          goalMilestones.length > 0
            ? Math.round((goalMilestones.filter((m) => m.done).length / goalMilestones.length) * 100)
            : 0;
      } else if (g.target_value) {
        pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
      }
      return { title: g.title, pct, domainColor: domain?.color };
    });
}
