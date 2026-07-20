import { addDays, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek } from "date-fns";
import { getHabits, getHabitLogsInRange } from "@/lib/data/queries";
import { HabitsView } from "@/components/gewoontes/habits-view";
import { PageHeader } from "@/components/ui/page-header";

export default async function GewoontesPage() {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const monthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekDates = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  const [habits, logs] = await Promise.all([
    getHabits(),
    getHabitLogsInRange(format(monthStart, "yyyy-MM-dd"), format(monthEnd, "yyyy-MM-dd")),
  ]);

  const anchors = habits.filter((h) => h.anchor);
  const others = habits.filter((h) => !h.anchor);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Ritme" title="Gewoontes" />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Ankers</h2>
        <HabitsView
          habits={anchors}
          logs={logs}
          weekDates={weekDates.map((d) => format(d, "yyyy-MM-dd"))}
          monthDates={monthDates.map((d) => format(d, "yyyy-MM-dd"))}
          today={format(today, "yyyy-MM-dd")}
        />
      </section>

      {others.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Overige gewoontes
          </h2>
          <HabitsView
            habits={others}
            logs={logs}
            weekDates={weekDates.map((d) => format(d, "yyyy-MM-dd"))}
            monthDates={monthDates.map((d) => format(d, "yyyy-MM-dd"))}
            today={format(today, "yyyy-MM-dd")}
          />
        </section>
      )}
    </div>
  );
}
