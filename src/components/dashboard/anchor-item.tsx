"use client";

import { useTransition } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleHabitLog } from "@/app/(app)/gewoontes/actions";
import type { Habit } from "@/lib/supabase/types";

interface AnchorItemProps {
  habit: Habit;
  date: string;
  done: boolean;
  streak: number;
  weekLabel?: string;
}

export function AnchorItem({ habit, date, done, streak, weekLabel }: AnchorItemProps) {
  const [pending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleHabitLog(habit.id, date, checked);
    });
  }

  return (
    <li
      className={cn(
        "flex items-center gap-3 surface-card px-3.5 py-3",
        done && "border-primary/40 bg-primary/10",
        pending && "opacity-60"
      )}
    >
      <Checkbox
        checked={done}
        disabled={pending}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        className="h-5 w-5"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "text-foreground")}>
          {habit.name}
        </p>
        {weekLabel && (
          <p className="text-xs text-muted-foreground">{weekLabel}</p>
        )}
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
