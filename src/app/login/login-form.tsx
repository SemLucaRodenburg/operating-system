"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { signIn, signUp, type AuthFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialState: AuthFormState = { status: "idle" };

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
      <Tabs defaultValue="signin">
        <TabsList className="w-full">
          <TabsTrigger value="signin" className="flex-1">
            Inloggen
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">
            Account aanmaken
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-5">
          <form action={signInAction} className="flex flex-col gap-4">
            <input type="hidden" name="redirect" value={redirect} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="signin-email">E-mailadres</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="jij@voorbeeld.nl"
                  autoComplete="email"
                  required
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signin-password">Wachtwoord</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-9"
                />
              </div>
            </div>
            {signInState.status === "error" && (
              <p className="text-sm text-destructive">{signInState.message}</p>
            )}
            <Button type="submit" disabled={signInPending} className="w-full">
              {signInPending ? "Bezig..." : "Inloggen"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-5">
          <form action={signUpAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-email">E-mailadres</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="jij@voorbeeld.nl"
                  autoComplete="email"
                  required
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-password">Wachtwoord</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">Minstens 8 tekens.</p>
            </div>
            {signUpState.status === "error" && (
              <p className="text-sm text-destructive">{signUpState.message}</p>
            )}
            <Button type="submit" disabled={signUpPending} className="w-full">
              {signUpPending ? "Bezig..." : "Account aanmaken"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
