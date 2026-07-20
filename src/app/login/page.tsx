import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,theme(colors.indigo.500/25%),transparent_60%)]"
      />

      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-medium italic tracking-tight">Levens-OS</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Structuur, ritme en drive. Eén systeem voor je visie, doelen en gewoontes.
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-xs text-muted-foreground">
        Eerste keer hier? Maak een account aan via het tabblad hierboven.
      </p>
    </div>
  );
}
