import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureSeeded } from "@/lib/data/ensure-seed";
import { getVisionStatement } from "@/lib/data/queries";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { VisionBanner } from "@/components/dashboard/vision-banner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureSeeded();
  const vision = await getVisionStatement();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-60">
        <VisionBanner statement={vision} />
        <main
          className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-6"
          style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
