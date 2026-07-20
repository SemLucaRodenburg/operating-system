import { Flame } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/progress-ring";

export function TodayProgressHero({
  done,
  total,
  bestStreak,
}: {
  done: number;
  total: number;
  bestStreak: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/12 via-card/70 to-card/70 p-5 shadow-sm shadow-black/20">
      <ProgressRing pct={pct} size={92} strokeWidth={8} />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ankers voltooid vandaag
        </p>
        <p className="mt-0.5 text-sm text-foreground">
          {done}/{total} dagelijkse ankers afgevinkt
        </p>
        {bestStreak > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-semibold text-warning">
            <Flame className="h-4 w-4" />
            {bestStreak} dagen op rij
          </div>
        )}
      </div>
    </div>
  );
}
