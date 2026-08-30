import webPush from "web-push";

// Initialize VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(appUrl, vapidPublicKey, vapidPrivateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

/**
 * Send a push notification to a subscription.
 */
export async function sendPushNotification(
  subscription: webPush.PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Subscription expired or invalid — should remove from DB
      console.warn("Push subscription expired:", statusCode);
    } else {
      console.error("Failed to send push notification:", error);
    }
    return false;
  }
}

/**
 * Check if push notifications are configured.
 */
export function isPushConfigured(): boolean {
  return Boolean(vapidPublicKey && vapidPrivateKey);
}
