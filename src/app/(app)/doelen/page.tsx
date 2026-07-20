import { getDomains, getGoals, getMilestoneProgress } from "@/lib/data/queries";
import { GoalProgressCard } from "@/components/dashboard/goal-progress-card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

const STATUS_LABEL: Record<string, string> = {
  active: "Actief",
  done: "Afgerond",
  paused: "Gepauzeerd",
  archived: "Gearchiveerd",
};

export default async function DoelenPage() {
  const [domains, goals, milestoneRows] = await Promise.all([
    getDomains(),
    getGoals(),
    getMilestoneProgress(),
  ]);

  const goalsByDomain = domains.map((domain) => ({
    domain,
    goals: goals.filter((g) => g.domain_id === domain.id),
  }));
  const goalsWithoutDomain = goals.filter((g) => !g.domain_id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Overzicht" title="Doelen" />

      {goalsByDomain
        .filter((g) => g.goals.length > 0)
        .map(({ domain, goals: domainGoals }) => (
          <section key={domain.id}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: domain.color }}
              />
              <h2 className="text-sm font-semibold">{domain.name}</h2>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {domainGoals.map((goal) => {
                const goalMilestones = milestoneRows.filter((m) => m.goal_id === goal.id);
                return (
                  <div key={goal.id} className="relative">
                    <GoalProgressCard
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
                    {goal.status !== "active" && (
                      <Badge
                        variant="secondary"
                        className="absolute right-3 top-3 text-[10px]"
                      >
                        {STATUS_LABEL[goal.status]}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      {goalsWithoutDomain.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Overig</h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {goalsWithoutDomain.map((goal) => (
              <GoalProgressCard key={goal.id} goal={goal} domain={undefined} />
            ))}
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nog geen doelen. Voeg ze toe via Instellingen.
        </p>
      )}
    </div>
  );
}
