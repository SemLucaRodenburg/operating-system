"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitWeekRow } from "./habit-week-row";
import { HabitMonthRow } from "./habit-month-row";
import type { Habit, HabitLog } from "@/lib/supabase/types";

export function HabitsView({
  habits,
  logs,
  weekDates,
  monthDates,
  today,
}: {
  habits: Habit[];
  logs: HabitLog[];
  weekDates: string[];
  monthDates: string[];
  today: string;
}) {
  const weekDateObjs = weekDates.map((d) => new Date(d));
  const monthDateObjs = monthDates.map((d) => new Date(d));
  const todayObj = new Date(today);

  const habitLogsFor = (habitId: string) => logs.filter((l) => l.habit_id === habitId);

  return (
    <Tabs defaultValue="week">
      <TabsList>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Maand</TabsTrigger>
      </TabsList>

      <TabsContent value="week" className="mt-4">
        <ul className="flex flex-col gap-2">
          {habits.map((habit) => (
            <HabitWeekRow
              key={habit.id}
              habit={habit}
              weekDates={weekDateObjs}
              logs={habitLogsFor(habit.id)}
              today={todayObj}
            />
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="month" className="mt-4">
        <ul className="flex flex-col gap-2">
          {habits.map((habit) => (
            <HabitMonthRow
              key={habit.id}
              habit={habit}
              monthDates={monthDateObjs}
              logs={habitLogsFor(habit.id)}
              today={todayObj}
            />
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
