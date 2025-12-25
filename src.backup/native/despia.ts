// Despia-native helpers for RevenueCat purchases and iapSuccess binding
// Frontend-only; backend-agnostic. Uses despia-native directly without custom wrappers beyond helper functions.

import despia from 'despia-native';

/**
 * Environment detection: Despia UA contains "despia" (e.g., despia-iphone, despia-ipad, despia-android).
 * Use this to provide safe web fallbacks when not running inside Despia.
 */
export function isDespiaEnv(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent?.toLowerCase().includes('despia') ?? false;
}

export type IapSuccessPayload = {
  planID: string;
  transactionID: string;
  subreceipts: unknown; // JSON string or object
};

declare global {
  interface Window {
    iapSuccess?: (p: IapSuccessPayload) => void;
  }
}

/**
 * Start a native purchase via Despia → RevenueCat.
 * productId: Store product identifier (from server-driven offerings).
 * userId:    Your app user ID (external_id in RevenueCat).
 */
export async function startNativePurchase(
  productId: string,
  userId: string,
  opts?: { onWebFallback?: () => void | Promise<void> }
) {
  if (!isDespiaEnv()) {
    // Not in Despia: do not invoke native IAP. Offer a safe web fallback if provided.
    if (opts?.onWebFallback) await opts.onWebFallback();
    return;
  }

  try {
    // Optional: detect store location to influence UI policy (e.g., whether to show secondary web checkout)
    await despia('getstorelocation://', ['storeLocation']);
  } catch {
    // Non-fatal
  }

  await despia(
    `revenuecat://purchase?external_id=${encodeURIComponent(userId)}&product=${encodeURIComponent(productId)}`
  );
}

let _iapBound = false;
/**
 * Bind a global iapSuccess handler exactly once. Despia may invoke this after purchase or on app start.
 * Do not unlock solely on this hint—wait for server-confirmed entitlement using the provided getter.
 */
export function bindIapSuccessOnce(getEntitlements: () => Promise<{ active?: boolean } | null>) {
  if (_iapBound) return; _iapBound = true;

  window.iapSuccess = async ({ planID, transactionID, subreceipts }: IapSuccessPayload) => {
    try {
      const current = await getEntitlements();
      if (current?.active) return;

      const receipts = typeof subreceipts === 'string' ? safeParseJSON(subreceipts as string) : subreceipts;
      void receipts; // available for logging/diagnostics if desired

      // Optionally show optimistic UI while we wait for webhook -> server -> realtime sync
      const confirmed = await waitForSubscriptionConfirm(getEntitlements, { timeoutMs: 15000, intervalMs: 1500 });

      if (!confirmed) {
        // Expose a manual "Refresh Purchases" control in your UI to re-check later.
      }
    } catch (err) {
      // Degrade gracefully; allow manual refresh of entitlements.
      console.error('iapSuccess handler error', err);
    }
  };
}

function safeParseJSON(s: string) { try { return JSON.parse(s); } catch { return s; } }

async function waitForSubscriptionConfirm(
  getEntitlements: () => Promise<{ active?: boolean } | null>,
  opts: { timeoutMs: number; intervalMs: number }
) {
  const start = Date.now();
  while (Date.now() - start < opts.timeoutMs) {
    const ent = await getEntitlements();
    if (ent?.active) return true;
    await new Promise(r => setTimeout(r, opts.intervalMs));
  }
  return false;
}

// Direct Despia variables (read directly, no wrappers):
// const deviceId = (despia as any).uuid;
// const playerId = (despia as any).onesignalplayerid;
// Send these to your backend after login to link device and push identities.

// Example bootstrap usage (e.g., in App.tsx):
// useEffect(() => {
//   bindIapSuccessOnce(() => getEntitlementsFromYourServer());
// }, []);
