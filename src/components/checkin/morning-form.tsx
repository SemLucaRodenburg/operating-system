"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Sunrise, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveMorningCheckin, type TopTask } from "@/app/(app)/check-in/actions";
import type { Goal } from "@/lib/supabase/types";

export function MorningForm({
  date,
  goals,
  initialIntention,
  initialTopTasks,
}: {
  date: string;
  goals: Goal[];
  initialIntention: string;
  initialTopTasks: TopTask[];
}) {
  const [intention, setIntention] = useState(initialIntention);
  const [tasks, setTasks] = useState<TopTask[]>(() => {
    const base = [...initialTopTasks];
    while (base.length < 3) base.push({ title: "", goal_id: null });
    return base.slice(0, 3);
  });
  const [pending, startTransition] = useTransition();

  function updateTask(index: number, patch: Partial<TopTask>) {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function handleSave() {
    startTransition(async () => {
      await saveMorningCheckin(date, intention, tasks);
      toast.success("Ochtend check-in opgeslagen");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sunrise className="h-4 w-4" />
        Start je dag met intentie
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="intention">Intentie voor vandaag</Label>
        <Textarea
          id="intention"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="Waar wil je dat deze dag om draait?"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Top 3 taken</Label>
        {tasks.map((task, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-border/60 p-3">
            <Input
              value={task.title}
              onChange={(e) => updateTask(i, { title: e.target.value })}
              placeholder={`Taak ${i + 1}`}
            />
            <Select
              value={task.goal_id ?? "none"}
              onValueChange={(value) =>
                updateTask(i, { goal_id: value === "none" ? null : value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Koppel aan doel (optioneel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Geen doel</SelectItem>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={pending} className="w-full sm:w-fit">
        <Check className="h-4 w-4" />
        {pending ? "Opslaan..." : "Ochtend check-in opslaan"}
      </Button>
    </div>
  );
}
