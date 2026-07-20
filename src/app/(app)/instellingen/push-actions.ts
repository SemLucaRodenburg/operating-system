"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/supabase/types";

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// `as never` cast works around a TS instantiation bug in @supabase/postgrest-js
// where `.upsert()` generic overload resolution collapses to `never` once a
// Database type has ~10+ tables. The payload itself stays fully typed.
export async function savePushSubscription(subscription: PushSubscriptionJSON) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  const payload: TablesInsert<"push_subscriptions"> = {
    user_id: user.id,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  };

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(payload as never, { onConflict: "endpoint" });

  if (error) throw new Error(error.message);
}

export async function deletePushSubscription(endpoint: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw new Error(error.message);
}
