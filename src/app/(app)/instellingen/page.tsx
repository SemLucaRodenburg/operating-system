import { Settings } from "lucide-react";
import { PushToggle } from "@/components/pwa/push-toggle";
import { ConsequencesManager } from "@/components/instellingen/consequences-manager";
import { getAllConsequences } from "@/lib/data/queries";
import { PageHeader } from "@/components/ui/page-header";

export default async function InstellingenPage() {
  const consequences = await getAllConsequences();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Beheer" title="Instellingen" />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Notificaties</h2>
        <PushToggle />
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-muted-foreground">Consequenties</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Bij een gemist dagelijks anker verschijnt hier automatisch een zichtbare
          &ldquo;schuld&rdquo; — geen echte straf, wel oncomfortabele feedback
          totdat je hem inlost.
        </p>
        <ConsequencesManager initial={consequences} />
      </section>

      <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Visie, ankers en gewoontes beheren via de UI (nu nog via Supabase direct)
          staat gepland als vervolg.
        </p>
      </section>
    </div>
  );
}
