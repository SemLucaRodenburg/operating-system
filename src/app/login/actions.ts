"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function sendMagicLink(
  _prevState: { status: "idle" | "sent" | "error"; message?: string },
  formData: FormData
): Promise<{ status: "idle" | "sent" | "error"; message?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const redirect = String(formData.get("redirect") ?? "/");

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Vul een geldig e-mailadres in." };
  }

  const supabase = await createClient();
  const originHeader = (await headers()).get("origin");
  const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "sent", message: `Check je inbox op ${email} voor de inloglink.` };
}
