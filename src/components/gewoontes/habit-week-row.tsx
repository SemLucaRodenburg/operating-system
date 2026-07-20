import { Flame } from "lucide-react";
import { format, isAfter, startOfDay } from "date-fns";
import { HabitDayCell } from "./habit-day-cell";
import type { Habit, HabitLog } from "@/lib/supabase/types";
import { computeDailyStreak, isHabitDoneOn } from "@/lib/data/habit-stats";

const DAY_LABELS = ["M", "D", "W", "D", "V", "Z", "Z"];

export function HabitWeekRow({
  habit,
  weekDates,
  logs,
  today,
}: {
  habit: Habit;
  weekDates: Date[];
  logs: HabitLog[];
  today: Date;
}) {
  const streak = habit.cadence === "daily" ? computeDailyStreak(logs, today) : 0;
  const doneThisWeek = logs.filter((l) => l.done).length;

  return (
    <li className="flex items-center gap-3 surface-card px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{habit.name}</p>
        <p className="text-xs text-muted-foreground">
          {habit.cadence === "weekly"
            ? `${doneThisWeek}/${habit.weekly_target ?? 1} deze week`
            : habit.kind === "avoid"
              ? "Vermijden"
              : "Dagelijks"}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        {weekDates.map((date, i) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const future = isAfter(startOfDay(date), startOfDay(today));
          return (
            <HabitDayCell
              key={dateKey}
              habitId={habit.id}
              date={dateKey}
              done={isHabitDoneOn(logs, habit.id, dateKey)}
              disabled={future}
              label={DAY_LABELS[i]}
            />
          );
        })}
      </div>

      {streak > 0 && (
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
          <Flame className="h-3.5 w-3.5" />
          {streak}
        </div>
      )}
    </li>
  );
}
