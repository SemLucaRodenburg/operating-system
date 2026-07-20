"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2 } from "lucide-react";
import { sendMagicLink } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [state, formAction, pending] = useActionState(sendMagicLink, {
    status: "idle" as const,
  });

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
      {state.status === "sent" ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <p className="text-sm text-foreground">{state.message}</p>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="redirect" value={redirect} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jij@voorbeeld.nl"
                autoComplete="email"
                required
                className="pl-9"
              />
            </div>
          </div>
          {state.status === "error" && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Bezig met versturen..." : "Stuur inloglink"}
          </Button>
        </form>
      )}
    </div>
  );
}
