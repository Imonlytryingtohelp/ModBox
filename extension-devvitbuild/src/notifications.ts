/**
 * DevBox Notifications
 * Sends config change notifications to ModBox and webhooks
 */

import type { ConfigChangeNotification } from './types.js';

/**
 * Send notification to ModBox extension via webhook
 * The extension would need to register its webhook URL in DevBox settings
 */
export async function notifyModBoxConfigChange(
  notification: ConfigChangeNotification,
  webhookUrl?: string
): Promise<boolean> {
  if (!webhookUrl) {
    console.log('[DevBox] No webhook URL configured, skipping ModBox notification');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DevBox-Signature': generateSignature(notification),
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      console.error('[DevBox] Webhook notification failed:', response.statusText);
      return false;
    }

    console.log('[DevBox] Config change notification sent to ModBox');
    return true;
  } catch (error) {
    console.error('[DevBox] Error sending webhook notification:', error);
    return false;
  }
}

/**
 * Generate a simple signature for webhook verification
 * In production, use HMAC-SHA256 with a shared secret
 */
function generateSignature(notification: ConfigChangeNotification): string {
  const data = JSON.stringify({
    type: notification.type,
    subreddit: notification.subreddit,
    timestamp: notification.timestamp,
  });
  // Simple base64 encoding - replace with HMAC in production
  return Buffer.from(data).toString('base64');
}

/**
 * Log configuration change for audit trail
 */
export async function logConfigChange(
  subreddit: string,
  action: string,
  changes: Record<string, [unknown, unknown]>, // old value, new value
  modifiedBy: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(`[DevBox Audit] [${timestamp}] ${subreddit} - ${action} by ${modifiedBy}`, changes);
  // In production, persist to database or analytics service
}
