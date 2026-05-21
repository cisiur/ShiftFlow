/**
 * RevenueCat purchases service — React Native implementation.
 *
 * SDK: react-native-purchases (already installed)
 * Plugin: "react-native-purchases" in app.json (already added)
 *
 * RevenueCat dashboard setup required:
 *  - Entitlement ID : "ShiftFlow Pro"
 *  - Products       : "monthly", "yearly", "lifetime"
 *  - Offering       : "default" containing those three packages
 *
 * Env var: EXPO_PUBLIC_REVENUECAT_API_KEY
 *
 * NOTE: react-native-purchases is a native module — works only in EAS/standalone builds.
 * In Expo Go / dev without the key, falls back to mock prices gracefully.
 */

import { Config } from '@/constants/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductPeriod = 'monthly' | 'yearly';

export interface ProductInfo {
  identifier:   string;
  title:        string;
  description:  string;
  priceString:  string;
  price:        number;
  currencyCode: string;
  period:       ProductPeriod;
}

export interface PurchaseResult {
  success:   boolean;
  isPremium: boolean;
  error?:    string;
}

// ─── Entitlement identifier ───────────────────────────────────────────────────
// Must match exactly what you created in the RevenueCat dashboard.

const ENTITLEMENT_ID = 'ShiftFlow Pro';

// ─── RC SDK lazy-import ───────────────────────────────────────────────────────

async function getRC() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-purchases');
    return (mod.default ?? mod) as typeof import('react-native-purchases').default;
  } catch {
    return null;
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

let _initialised    = false;
let _usingMockProducts = false; // true when RC returned no offerings → mock prices shown

export async function initialisePurchases(): Promise<void> {
  if (_initialised) return;

  const apiKey = Config.revenueCatApiKey;
  if (!apiKey) {
    console.warn('[Purchases] EXPO_PUBLIC_REVENUECAT_API_KEY not set — mock mode');
    return;
  }

  const RC = await getRC();
  if (!RC) {
    console.warn('[Purchases] react-native-purchases not available (Expo Go / web)');
    return;
  }

  try {
    RC.configure({ apiKey });
    _initialised = true;
    console.log('[Purchases] RevenueCat initialised');
  } catch (err) {
    console.error('[Purchases] initialisation error:', err);
  }
}

// ─── Offerings ────────────────────────────────────────────────────────────────

export async function getOfferings(): Promise<ProductInfo[]> {
  const RC = await getRC();
  if (!RC || !_initialised) {
    _usingMockProducts = true;
    return getMockProducts();
  }

  try {
    const offerings = await RC.getOfferings();
    const current = offerings.current;
    if (!current || current.availablePackages.length === 0) {
      _usingMockProducts = true;
      return getMockProducts();
    }
    _usingMockProducts = false;

    return current.availablePackages.map(pkg => {
      const p = pkg.product;

      let period: ProductPeriod;
      if (
        pkg.packageType === 'ANNUAL' ||
        p.identifier.toLowerCase().includes('year') ||
        p.identifier.toLowerCase().includes('annual')
      ) {
        period = 'yearly';
      } else {
        period = 'monthly';
      }

      return {
        identifier:   p.identifier,
        title:        p.title,
        description:  p.description,
        priceString:  p.priceString,
        price:        p.price,
        currencyCode: p.currencyCode,
        period,
      } satisfies ProductInfo;
    });
  } catch (err) {
    console.error('[Purchases] getOfferings error:', err);
    _usingMockProducts = true;
    return getMockProducts();
  }
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export async function purchaseProduct(identifier: string): Promise<PurchaseResult> {
  const RC = await getRC();
  if (!RC || !_initialised || _usingMockProducts) {
    // mock — RC not available or no products configured in Play Store yet
    await new Promise(r => setTimeout(r, 1200));
    return { success: true, isPremium: true };
  }

  try {
    const offerings = await RC.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      p => p.product.identifier === identifier,
    );
    if (!pkg) return { success: false, isPremium: false, error: 'Product not found' };

    const { customerInfo } = await RC.purchasePackage(pkg);
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPremium };
  } catch (err: any) {
    if (err?.userCancelled) return { success: false, isPremium: false };
    console.error('[Purchases] purchase error:', err);
    return { success: false, isPremium: false, error: err?.message ?? 'Purchase failed' };
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<PurchaseResult> {
  const RC = await getRC();
  if (!RC || !_initialised) {
    return { success: false, isPremium: false, error: 'Store not available in this build' };
  }

  try {
    const customerInfo = await RC.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPremium };
  } catch (err: any) {
    console.error('[Purchases] restore error:', err);
    return { success: false, isPremium: false, error: err?.message ?? 'Restore failed' };
  }
}

// ─── Entitlement check ────────────────────────────────────────────────────────

export async function checkPremiumEntitlement(): Promise<boolean> {
  const RC = await getRC();
  if (!RC || !_initialised) return false;

  try {
    const info = await RC.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

// ─── RC status ───────────────────────────────────────────────────────────────
// Returns true only when RC was successfully initialised with a real API key.
// Use this to decide whether entitlement results are authoritative.

export function isRCInitialised(): boolean {
  return _initialised;
}

// ─── Customer Center ─────────────────────────────────────────────────────────
// Shows RevenueCat's built-in subscription management UI (cancel, refund, etc.)

export async function presentCustomerCenter(): Promise<void> {
  const RC = await getRC();
  if (!RC || !_initialised) {
    throw new Error('Customer Center is not available in this build.');
  }

  try {
    // presentCustomerCenter is available in react-native-purchases v7+
    if (typeof (RC as any).presentCustomerCenter === 'function') {
      await (RC as any).presentCustomerCenter();
    } else {
      throw new Error('Customer Center requires a newer version of react-native-purchases.');
    }
  } catch (err: any) {
    throw new Error(err?.message ?? 'Could not open Customer Center');
  }
}

// ─── Mock products ────────────────────────────────────────────────────────────

function getMockProducts(): ProductInfo[] {
  return [
    {
      identifier:   'monthly',
      title:        'ShiftFlow Pro Monthly',
      description:  'Full access, billed monthly',
      priceString:  '$4.99',
      price:        4.99,
      currencyCode: 'USD',
      period:       'monthly',
    },
    {
      identifier:   'yearly',
      title:        'ShiftFlow Pro Yearly',
      description:  'Full access — save 33%',
      priceString:  '$39.99',
      price:        39.99,
      currencyCode: 'USD',
      period:       'yearly',
    },
  ];
}
