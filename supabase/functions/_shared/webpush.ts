import webpush from "npm:web-push@3";

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:noreply@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY ontbreken.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

/** Stuurt een push-notificatie; verwijdert de subscription bij een 404/410 (verlopen). */
export async function sendPush(
  subscription: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<{ ok: boolean; expired: boolean }> {
  ensureConfigured();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );
    return { ok: true, expired: false };
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    const expired = statusCode === 404 || statusCode === 410;
    if (!expired) {
      console.error(`Push naar ${subscription.endpoint} mislukt:`, err);
    }
    return { ok: false, expired };
  }
}
