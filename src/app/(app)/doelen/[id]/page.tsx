import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarDays } from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { getGoalById, getMilestonesForGoal, getDomainById } from "@/lib/data/queries";
import { Progress } from "@/components/ui/progress";
import { goalProgressPct } from "@/lib/data/habit-stats";
import { MilestoneList } from "@/components/doelen/milestone-list";
import { GoalValueEditor } from "@/components/doelen/goal-value-editor";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goal = await getGoalById(id);
  if (!goal) notFound();

  const [milestones, domain] = await Promise.all([
    getMilestonesForGoal(goal.id),
    goal.domain_id ? getDomainById(goal.domain_id) : Promise.resolve(null),
  ]);

  const pct =
    goal.type === "milestones"
      ? milestones.length > 0
        ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100)
        : 0
      : goalProgressPct(goal.current_value, goal.target_value);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/doelen"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Doelen
      </Link>

      <header>
        {domain && (
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: domain.color }}
            />
            <span className="text-xs font-medium text-muted-foreground">{domain.name}</span>
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{goal.title}</h1>
        {goal.description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{goal.description}</p>
        )}
        {goal.deadline && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Deadline {format(parseISO(goal.deadline), "d MMMM yyyy", { locale: nl })} (
            {formatDistanceToNow(parseISO(goal.deadline), { locale: nl, addSuffix: true })})
          </div>
        )}
      </header>

      <div className="surface-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Voortgang</span>
          <span className="text-lg font-semibold tabular-nums text-primary">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2.5" />

        {goal.type === "numeric" && (
          <div className="mt-4">
            <GoalValueEditor
              goalId={goal.id}
              currentValue={goal.current_value}
              targetValue={goal.target_value}
              unit={goal.unit}
            />
          </div>
        )}
      </div>

      {goal.type === "milestones" && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Mijlpalen</h2>
          <MilestoneList milestones={milestones} goalId={goal.id} />
        </section>
      )}
    </div>
  );
}
