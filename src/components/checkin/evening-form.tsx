"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Moon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveEveningCheckin } from "@/app/(app)/check-in/actions";

const MOODS = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

export function EveningForm({
  date,
  initialReflection,
  initialScreenNote,
  initialWeight,
  initialMood,
}: {
  date: string;
  initialReflection: string;
  initialScreenNote: string;
  initialWeight: number | null;
  initialMood: number | null;
}) {
  const [reflection, setReflection] = useState(initialReflection);
  const [screenNote, setScreenNote] = useState(initialScreenNote);
  const [weight, setWeight] = useState(initialWeight != null ? String(initialWeight) : "");
  const [mood, setMood] = useState<number | null>(initialMood);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const weightNum = weight.trim() === "" ? null : parseFloat(weight);
      await saveEveningCheckin(date, reflection, screenNote, weightNum, mood);
      toast.success("Avond check-in opgeslagen");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Moon className="h-4 w-4" />
        Sluit je dag af en reflecteer
      </div>

      <div className="flex flex-col gap-2">
        <Label>Hoe voelde vandaag?</Label>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-colors",
                mood === m.value
                  ? "border-primary bg-primary/15"
                  : "border-border/60 bg-card/60 hover:bg-accent"
              )}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reflection">Reflectie</Label>
        <Textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Wat ging goed vandaag? Wat hield je tegen?"
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="screen-note">Gamen / schermtijd</Label>
        <Textarea
          id="screen-note"
          value={screenNote}
          onChange={(e) => setScreenNote(e.target.value)}
          placeholder="Hoeveel tijd, en met wie/solo?"
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="weight">Gewicht (kg) — wekelijks</Label>
        <Input
          id="weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="bv. 82.4"
          className="w-32"
        />
      </div>

      <Button onClick={handleSave} disabled={pending} className="w-full sm:w-fit">
        <Check className="h-4 w-4" />
        {pending ? "Opslaan..." : "Avond check-in opslaan"}
      </Button>
    </div>
  );
}
