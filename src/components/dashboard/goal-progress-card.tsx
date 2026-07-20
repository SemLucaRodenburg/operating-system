import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { Goal, Domain } from "@/lib/supabase/types";
import { goalProgressPct } from "@/lib/data/habit-stats";

export function GoalProgressCard({
  goal,
  domain,
  milestoneProgress,
}: {
  goal: Goal;
  domain: Domain | undefined;
  milestoneProgress?: { done: number; total: number };
}) {
  const pct =
    goal.type === "milestones" && milestoneProgress
      ? milestoneProgress.total > 0
        ? Math.round((milestoneProgress.done / milestoneProgress.total) * 100)
        : 0
      : goalProgressPct(goal.current_value, goal.target_value);

  return (
    <Link
      href={`/doelen/${goal.id}`}
      className="surface-card-interactive block p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {domain && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: domain.color }}
            />
          )}
          <p className="truncate text-sm font-medium">{goal.title}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
          {pct}%
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      {goal.type === "milestones" && milestoneProgress && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {milestoneProgress.done}/{milestoneProgress.total} mijlpalen
        </p>
      )}
      {goal.type === "numeric" && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {goal.current_value} / {goal.target_value} {goal.unit}
        </p>
      )}
    </Link>
  );
}
