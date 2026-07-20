"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleHabitLog } from "@/app/(app)/gewoontes/actions";

export function HabitDayCell({
  habitId,
  date,
  done,
  disabled,
  size = "md",
  label,
}: {
  habitId: string;
  date: string;
  done: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      title={date}
      onClick={() =>
        startTransition(async () => {
          await toggleHabitLog(habitId, date, !done);
        })
      }
      className={cn(
        "flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-md transition-all duration-150 active:scale-90",
        size === "md" ? "h-8 w-8" : "h-2.5 w-2.5 rounded-[3px]",
        done
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/40"
          : "bg-muted text-muted-foreground hover:bg-accent",
        disabled && "opacity-30",
        pending && "opacity-60"
      )}
    >
      {size === "md" &&
        (done ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          label && <span className="text-[9px] leading-none">{label}</span>
        ))}
    </button>
  );
}
