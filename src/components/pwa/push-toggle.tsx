"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { urlBase64ToUint8Array } from "@/lib/push/vapid";
import { savePushSubscription, deletePushSubscription } from "@/app/(app)/instellingen/push-actions";

export function PushToggle() {
  const [supported] = useState(
    () =>
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
  );
  const [subscribed, setSubscribed] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!supported) return;

    navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      setSubscribed(!!existing);
    });
  }, [supported]);

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        if (checked) {
          const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!publicKey) {
            toast.error("Push is nog niet geconfigureerd (VAPID-key ontbreekt).");
            return;
          }
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast.error("Toestemming voor meldingen geweigerd.");
            return;
          }
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
          });
          const json = subscription.toJSON();
          await savePushSubscription({
            endpoint: json.endpoint!,
            keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
          });
          setSubscribed(true);
          toast.success("Meldingen ingeschakeld.");
        } else {
          const existing = await registration.pushManager.getSubscription();
          if (existing) {
            await deletePushSubscription(existing.endpoint);
            await existing.unsubscribe();
          }
          setSubscribed(false);
          toast.success("Meldingen uitgeschakeld.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Er ging iets mis met de melding-instellingen.");
      }
    });
  }

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground">
        Push-meldingen worden niet ondersteund in deze browser.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 surface-card p-4">
      <div className="flex items-center gap-3">
        {subscribed ? (
          <Bell className="h-4 w-4 text-primary" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">Push-meldingen</p>
          <p className="text-xs text-muted-foreground">
            Ochtend/avond check-in, anker-herinnering en de zondagse weekreview.
          </p>
        </div>
      </div>
      <Switch checked={subscribed} disabled={pending} onCheckedChange={handleToggle} />
    </div>
  );
}
