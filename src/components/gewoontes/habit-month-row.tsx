import { format, isAfter, startOfDay } from "date-fns";
import { HabitDayCell } from "./habit-day-cell";
import type { Habit, HabitLog } from "@/lib/supabase/types";
import { isHabitDoneOn } from "@/lib/data/habit-stats";

export function HabitMonthRow({
  habit,
  monthDates,
  logs,
  today,
}: {
  habit: Habit;
  monthDates: Date[];
  logs: HabitLog[];
  today: Date;
}) {
  const doneCount = logs.filter((l) => l.done).length;

  return (
    <li className="surface-card px-3.5 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="truncate text-sm font-medium">{habit.name}</p>
        <span className="shrink-0 text-xs text-muted-foreground">{doneCount}x</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {monthDates.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const future = isAfter(startOfDay(date), startOfDay(today));
          return (
            <HabitDayCell
              key={dateKey}
              habitId={habit.id}
              date={dateKey}
              done={isHabitDoneOn(logs, habit.id, dateKey)}
              disabled={future}
              size="sm"
            />
          );
        })}
      </div>
    </li>
  );
}
