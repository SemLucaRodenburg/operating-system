import { Compass } from "lucide-react";

export function VisionBanner({ statement }: { statement: string | null }) {
  if (!statement) return null;

  return (
    <div
      className="sticky top-0 z-30 border-b border-border/60 bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-transparent px-4 py-3 backdrop-blur-lg md:px-8"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-start gap-2.5">
        <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-snug text-foreground/90 md:text-sm">
          {statement}
        </p>
      </div>
    </div>
  );
}
