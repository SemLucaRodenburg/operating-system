"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MorningForm } from "./morning-form";
import { EveningForm } from "./evening-form";
import type { TopTask } from "@/app/(app)/check-in/actions";
import type { Goal } from "@/lib/supabase/types";

export function CheckinTabs({
  date,
  goals,
  morning,
  evening,
}: {
  date: string;
  goals: Goal[];
  morning: { intention: string; topTasks: TopTask[] };
  evening: {
    reflection: string;
    screenNote: string;
    weight: number | null;
    mood: number | null;
  };
}) {
  const [defaultTab] = useState(() => (new Date().getHours() >= 15 ? "evening" : "morning"));

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="morning" className="flex-1 sm:flex-none">
          Ochtend
        </TabsTrigger>
        <TabsTrigger value="evening" className="flex-1 sm:flex-none">
          Avond
        </TabsTrigger>
      </TabsList>

      <TabsContent value="morning" className="mt-5">
        <MorningForm
          date={date}
          goals={goals}
          initialIntention={morning.intention}
          initialTopTasks={morning.topTasks}
        />
      </TabsContent>

      <TabsContent value="evening" className="mt-5">
        <EveningForm
          date={date}
          initialReflection={evening.reflection}
          initialScreenNote={evening.screenNote}
          initialWeight={evening.weight}
          initialMood={evening.mood}
        />
      </TabsContent>
    </Tabs>
  );
}
