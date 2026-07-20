"use client";

import { useTransition } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveConsequence } from "@/app/(app)/instellingen/consequences-actions";
import type { Consequence } from "@/lib/supabase/types";

export function ConsequenceAlert({ items }: { items: Consequence[] }) {
  const [pending, startTransition] = useTransition();

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-semibold">
          {items.length} openstaande consequentie{items.length > 1 ? "s" : ""}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-background/40 px-3 py-2"
          >
            <div>
              <p className="text-sm">{c.description}</p>
              <p className="text-xs text-muted-foreground">{c.date}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await resolveConsequence(c.id);
                })
              }
            >
              <Check className="h-3.5 w-3.5" />
              Ingelost
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
