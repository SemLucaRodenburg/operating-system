import { Progress } from "@/components/ui/progress";
import type { GoalProgressDatum } from "@/lib/data/insights";

export function GoalProgressList({ data }: { data: GoalProgressDatum[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Geen actieve doelen.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((g) => (
        <li key={g.title}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {g.domainColor && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: g.domainColor }}
                />
              )}
              <span className="truncate text-sm">{g.title}</span>
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-primary">
              {g.pct}%
            </span>
          </div>
          <Progress value={g.pct} className="h-2" />
        </li>
      ))}
    </ul>
  );
}
