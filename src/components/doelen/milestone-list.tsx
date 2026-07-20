"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleMilestone } from "@/app/(app)/doelen/actions";
import type { Milestone } from "@/lib/supabase/types";

export function MilestoneList({
  milestones,
  goalId,
}: {
  milestones: Milestone[];
  goalId: string;
}) {
  const [pending, startTransition] = useTransition();

  if (milestones.length === 0) {
    return <p className="text-sm text-muted-foreground">Geen mijlpalen ingesteld.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {milestones.map((m) => (
        <li
          key={m.id}
          className={cn(
            "flex items-center gap-3 surface-card px-3.5 py-3",
            m.done && "border-primary/40 bg-primary/10",
            pending && "opacity-60"
          )}
        >
          <Checkbox
            checked={m.done}
            disabled={pending}
            onCheckedChange={(checked) =>
              startTransition(async () => {
                await toggleMilestone(m.id, checked === true, goalId);
              })
            }
            className="h-5 w-5"
          />
          <span className={cn("text-sm", m.done && "text-muted-foreground line-through")}>
            {m.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
