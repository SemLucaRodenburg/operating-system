import { Flame, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  getDomains,
  getGoals,
  getHabits,
  getHabitLogsInRange,
  getMetricsInRange,
  getMilestoneProgress,
} from "@/lib/data/queries";
import {
  computeConsistencySeries,
  computeStreaks,
  computeDomainHoursByWeek,
  computeGoalProgress,
} from "@/lib/data/insights";
import { StatTile } from "@/components/inzichten/stat-tile";
import { WeightChart } from "@/components/inzichten/weight-chart";
import { ConsistencyChart } from "@/components/inzichten/consistency-chart";
import { StreakChart } from "@/components/inzichten/streak-chart";
import { DomainHoursChart } from "@/components/inzichten/domain-hours-chart";
import { GoalProgressList } from "@/components/inzichten/goal-progress-list";
import { PageHeader } from "@/components/ui/page-header";

export default async function InzichtenPage() {
  const today = new Date();
  const from90 = format(subDays(today, 89), "yyyy-MM-dd");
  const from30 = format(subDays(today, 29), "yyyy-MM-dd");
  const todayKey = format(today, "yyyy-MM-dd");

  const [domains, goals, habits, logs90, logs30, weightSeries, milestoneRows] =
    await Promise.all([
      getDomains(),
      getGoals(),
      getHabits(),
      getHabitLogsInRange(from90, todayKey),
      getHabitLogsInRange(from30, todayKey),
      getMetricsInRange("weight_kg", from90, todayKey),
      getMilestoneProgress(),
    ]);

  const consistency = computeConsistencySeries(habits, logs30, 30, today);
  const streaks = computeStreaks(habits, logs90, today);
  const domainHours = computeDomainHoursByWeek(domains, habits, logs90, 4, today);
  const goalProgress = computeGoalProgress(goals, domains, milestoneRows);

  const avgConsistency =
    consistency.length > 0
      ? Math.round(consistency.reduce((sum, c) => sum + c.pct, 0) / consistency.length)
      : 0;
  const bestStreak = streaks[0]?.streak ?? 0;
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const doneGoals = goals.filter((g) => g.status === "done").length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Overzicht" title="Inzichten" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={TrendingUp}
          label="Consistentie (30d)"
          value={avgConsistency}
          suffix="%"
        />
        <StatTile icon={Flame} label="Beste streak" value={bestStreak} suffix="dagen" />
        <StatTile icon={Target} label="Actieve doelen" value={activeGoals} />
        <StatTile icon={CheckCircle2} label="Afgeronde doelen" value={doneGoals} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Consistentie — dagelijkse ankers (30 dagen)
        </h2>
        <div className="surface-card p-4">
          <ConsistencyChart data={consistency} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Gewicht over tijd</h2>
        <div className="surface-card p-4">
          <WeightChart data={weightSeries} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Uren per domein per week
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Benaderd op basis van voltooide dagelijkse ankers × de duur in hun naam
          (bv. &ldquo;2 uur aan S&amp;F Agency&rdquo;).
        </p>
        <div className="surface-card p-4">
          <DomainHoursChart data={domainHours} domainNames={domains.map((d) => d.name)} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Streak-lengtes</h2>
          <div className="surface-card p-4">
            <StreakChart data={streaks} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Doelvoortgang</h2>
          <div className="surface-card p-4">
            <GoalProgressList data={goalProgress} />
          </div>
        </section>
      </div>
    </div>
  );
}
