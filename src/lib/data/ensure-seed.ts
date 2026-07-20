import { createClient } from "@/lib/supabase/server";

export async function ensureSeeded() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("domains")
    .select("id", { count: "exact", head: true });

  if (!count) {
    await supabase.rpc("seed_levens_os");
  }
}
