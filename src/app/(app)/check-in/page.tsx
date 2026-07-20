import { format } from "date-fns";
import { getGoals, getCheckinsForDate } from "@/lib/data/queries";
import { CheckinTabs } from "@/components/checkin/checkin-tabs";
import { PageHeader } from "@/components/ui/page-header";
import type { TopTask } from "./actions";

export default async function CheckInPage() {
  const today = format(new Date(), "yyyy-MM-dd");

  const [goals, checkins] = await Promise.all([getGoals(), getCheckinsForDate(today)]);

  const morningRow = checkins.find((c) => c.type === "morning");
  const eveningRow = checkins.find((c) => c.type === "evening");
  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={format(new Date(), "EEEE d MMMM")} title="Check-in" />

      <CheckinTabs
        date={today}
        goals={activeGoals}
        morning={{
          intention: morningRow?.intention ?? "",
          topTasks: (morningRow?.top_tasks as TopTask[] | undefined) ?? [],
        }}
        evening={{
          reflection: eveningRow?.reflection ?? "",
          screenNote: eveningRow?.screen_note ?? "",
          weight: eveningRow?.weight_kg ?? null,
          mood: eveningRow?.mood ?? null,
        }}
      />
    </div>
  );
}
