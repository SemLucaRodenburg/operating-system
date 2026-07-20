import { getAdminClient } from "./supabase-admin.ts";
import { sendPush, type PushSubscriptionRow } from "./webpush.ts";

/** Stuurt een push naar alle subscriptions van de opgegeven user ids en ruimt verlopen subscriptions op. */
export async function notifyUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<{ sent: number; failed: number }> {
  if (userIds.length === 0) return { sent: 0, failed: 0 };

  const supabase = getAdminClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, keys, user_id")
    .in("user_id", userIds);

  if (error) throw new Error(error.message);

  let sent = 0;
  let failed = 0;
  const expiredIds: string[] = [];

  for (const sub of (subscriptions ?? []) as (PushSubscriptionRow & { user_id: string })[]) {
    const result = await sendPush(sub, payload);
    if (result.ok) sent++;
    else {
      failed++;
      if (result.expired) expiredIds.push(sub.id);
    }
  }

  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  return { sent, failed };
}
