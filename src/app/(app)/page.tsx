import Link from "next/link";
import { format, startOfWeek } from "date-fns";
import { PenLine, ArrowRight } from "lucide-react";
import {
  getDomains,
  getGoals,
  getHabits,
  getHabitLogsInRange,
  getOpenConsequences,
  getMilestoneProgress,
} from "@/lib/data/queries";
import {
  computeDailyStreak,
  habitLogsFor,
  isHabitDoneOn,
} from "@/lib/data/habit-stats";
import { AnchorItem } from "@/components/dashboard/anchor-item";
import { GoalProgressCard } from "@/components/dashboard/goal-progress-card";
import { ConsequenceAlert } from "@/components/dashboard/consequence-alert";
import { TodayProgressHero } from "@/components/dashboard/today-progress-hero";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default async function TodayPage() {
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const weekStartKey = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [domains, goals, habits, logs, consequences, milestoneRows] = await Promise.all([
    getDomains(),
    getGoals(),
    getHabits(),
    getHabitLogsInRange(weekStartKey, todayKey),
    getOpenConsequences(),
    getMilestoneProgress(),
  ]);

  const anchors = habits.filter((h) => h.anchor);
  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 4);

  const dailyAnchors = anchors.filter((h) => h.cadence === "daily");
  const weeklyAnchors = anchors.filter((h) => h.cadence === "weekly");

  const doneToday = dailyAnchors.filter((h) =>
    isHabitDoneOn(logs, h.id, todayKey)
  ).length;

  const bestStreak = dailyAnchors.reduce(
    (max, h) => Math.max(max, computeDailyStreak(habitLogsFor(logs, h.id), today)),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={format(today, "EEEE d MMMM")}
        title="Vandaag"
        action={
          <Button
            render={<Link href="/check-in" />}
            nativeButton={false}
            size="sm"
            className="gap-1.5"
          >
            <PenLine className="h-4 w-4" />
            Check-in
          </Button>
        }
      />

      <TodayProgressHero done={doneToday} total={dailyAnchors.length} bestStreak={bestStreak} />

      <ConsequenceAlert items={consequences} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Ankers van vandaag
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {doneToday}/{dailyAnchors.length}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {dailyAnchors.map((habit) => {
            const habitLogs = habitLogsFor(logs, habit.id);
            return (
              <AnchorItem
                key={habit.id}
                habit={habit}
                date={todayKey}
                done={isHabitDoneOn(logs, habit.id, todayKey)}
                streak={computeDailyStreak(habitLogs, today)}
              />
            );
          })}
          {weeklyAnchors.map((habit) => {
            const habitLogs = habitLogsFor(logs, habit.id);
            const doneThisWeek = habitLogs.filter((l) => l.done).length;
            return (
              <AnchorItem
                key={habit.id}
                habit={habit}
                date={todayKey}
                done={isHabitDoneOn(logs, habit.id, todayKey)}
                streak={0}
                weekLabel={`${doneThisWeek}/${habit.weekly_target ?? 1} deze week`}
              />
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Lopende doelen
          </h2>
          <Link
            href="/doelen"
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            Alle doelen <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {activeGoals.map((goal) => {
            const domain = domains.find((d) => d.id === goal.domain_id);
            const goalMilestones = (milestoneRows ?? []).filter(
              (m) => m.goal_id === goal.id
            );
            return (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                domain={domain}
                milestoneProgress={
                  goal.type === "milestones"
                    ? {
                        done: goalMilestones.filter((m) => m.done).length,
                        total: goalMilestones.length,
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
