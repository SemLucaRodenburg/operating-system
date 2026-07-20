"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addConsequence, resolveConsequence } from "@/app/(app)/instellingen/consequences-actions";
import type { Consequence } from "@/lib/supabase/types";

export function ConsequencesManager({ initial }: { initial: Consequence[] }) {
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  const open = initial.filter((c) => !c.resolved);
  const resolved = initial.filter((c) => c.resolved);

  function handleAdd() {
    if (!description.trim()) return;
    startTransition(async () => {
      await addConsequence(description.trim());
      setDescription("");
      toast.success("Consequentie toegevoegd.");
    });
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveConsequence(id);
      toast.success("Ingelost.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Eigen consequentie toevoegen..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" variant="outline" disabled={pending} onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Toevoegen
        </Button>
      </div>

      {open.length === 0 && resolved.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Geen consequenties. Die verschijnen hier automatisch als je een dagelijks
          anker mist, of voeg je eigen toe.
        </p>
      )}

      {open.length > 0 && (
        <ul className="flex flex-col gap-2">
          {open.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="truncate text-sm">{c.description}</p>
                  <p className="text-xs text-muted-foreground">{c.date}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => handleResolve(c.id)}
              >
                <Check className="h-3.5 w-3.5" />
                Ingelost
              </Button>
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Opgelost</p>
          <ul className="flex flex-col gap-1.5">
            {resolved.map((c) => (
              <li
                key={c.id}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground"
                )}
              >
                <span className="truncate line-through">{c.description}</span>
                <span className="shrink-0 text-xs">{c.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
