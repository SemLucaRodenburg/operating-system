"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateGoalValue } from "@/app/(app)/doelen/actions";

export function GoalValueEditor({
  goalId,
  currentValue,
  targetValue,
  unit,
}: {
  goalId: string;
  currentValue: number;
  targetValue: number | null;
  unit: string | null;
}) {
  const [value, setValue] = useState(String(currentValue));
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-28"
      />
      {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      {targetValue != null && (
        <span className="text-sm text-muted-foreground">/ {targetValue} {unit}</span>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const num = parseFloat(value);
            if (!Number.isNaN(num)) await updateGoalValue(goalId, num);
          })
        }
      >
        <Check className="h-3.5 w-3.5" />
        Opslaan
      </Button>
    </div>
  );
}
