/**
 * RevenueCat purchases service.
 *
 * Install the SDK first:
 *   npx expo install react-native-purchases
 *
 * Configure in app.json plugins:
 *   "react-native-purchases"
 *
 * Set EXPO_PUBLIC_REVENUECAT_API_KEY in .env.local
 *
 * Entitlement expected in RevenueCat dashboard: "premium"
 * Products:    shiftflow_monthly   (e.g. $4.99/mo)
 *              shiftflow_annual    (e.g. $39.99/yr)
 */

import { Config } from '@/constants/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductInfo {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
  currencyCode: string;
  period: 'monthly' | 'annual';
}

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  error?: string;
}

// ─── RC SDK lazy-import helper ────────────────────────────────────────────────

// We lazy-import so the app still runs without the native module during web/Expo Go
async function getRC() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Purchases = require('react-native-purchases').default;
    return Purchases as import('react-native-purchases').default;
  } catch {
    return null;
  }
}

// ─── SDK initialisation ───────────────────────────────────────────────────────

let _initialised = false;

export async function initialisePurchases(): Promise<void> {
  if (_initialised) return;
  const apiKey = Config.revenueCatApiKey;
  if (!apiKey) {
    console.warn('[Purchases] EXPO_PUBLIC_REVENUECAT_API_KEY not set — using mock mode');
    return;
  }
  const RC = await getRC();
  if (!RC) {
    console.warn('[Purchases] react-native-purchases not available');
    return;
  }
  RC.configure({ apiKey });
  _initialised = true;
}

// ─── Fetch available products ─────────────────────────────────────────────────

export async function getOfferings(): Promise<ProductInfo[]> {
  const RC = await getRC();
  if (!RC || !_initialised) return getMockProducts();

  try {
    const offerings = await RC.getOfferings();
    const current = offerings.current;
    if (!current) return getMockProducts();

    return current.availablePackages.map(pkg => {
      const p = pkg.product;
      const isAnnual =
        pkg.packageType === 'ANNUAL' ||
        p.identifier.includes('annual') ||
        p.identifier.includes('yearly');

      return {
        identifier:   p.identifier,
        title:        p.title,
        description:  p.description,
        priceString:  p.priceString,
        price:        p.price,
        currencyCode: p.currencyCode,
        period:       isAnnual ? 'annual' : 'monthly',
      };
    });
  } catch (err) {
    console.error('[Purchases] getOfferings error:', err);
    return getMockProducts();
  }
}

// ─── Purchase a package ───────────────────────────────────────────────────────

export async function purchaseProduct(identifier: string): Promise<PurchaseResult> {
  const RC = await getRC();
  if (!RC || !_initialised) {
    // mock path — simulate success after short delay
    await new Promise(r => setTimeout(r, 1200));
    return { success: true, isPremium: true };
  }

  try {
    const offerings = await RC.getOfferings();
    const current = offerings.current;
    if (!current) return { success: false, isPremium: false, error: 'No offerings available' };

    const pkg = current.availablePackages.find(p => p.product.identifier === identifier);
    if (!pkg) return { success: false, isPremium: false, error: 'Product not found' };

    const { customerInfo } = await RC.purchasePackage(pkg);
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    return { success: true, isPremium };
  } catch (err: any) {
    // RC throws a specific error when user cancels
    if (err?.userCancelled) return { success: false, isPremium: false };
    console.error('[Purchases] purchaseProduct error:', err);
    return { success: false, isPremium: false, error: err?.message ?? 'Purchase failed' };
  }
}

// ─── Restore purchases ────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<PurchaseResult> {
  const RC = await getRC();
  if (!RC || !_initialised) {
    return { success: false, isPremium: false, error: 'Store not available' };
  }

  try {
    const customerInfo = await RC.restorePurchases();
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    return { success: true, isPremium };
  } catch (err: any) {
    console.error('[Purchases] restorePurchases error:', err);
    return { success: false, isPremium: false, error: err?.message ?? 'Restore failed' };
  }
}

// ─── Check current entitlement ────────────────────────────────────────────────

export async function checkPremiumEntitlement(): Promise<boolean> {
  const RC = await getRC();
  if (!RC || !_initialised) return false;

  try {
    const info = await RC.getCustomerInfo();
    return info.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

// ─── Mock products (shown when RC unavailable) ────────────────────────────────

function getMockProducts(): ProductInfo[] {
  return [
    {
      identifier:  'shiftflow_monthly',
      title:       'ShiftFlow Premium Monthly',
      description: 'Full access to all premium features',
      priceString: '$4.99',
      price:       4.99,
      currencyCode: 'USD',
      period:      'monthly',
    },
    {
      identifier:  'shiftflow_annual',
      title:       'ShiftFlow Premium Annual',
      description: 'Full access — save 33%',
      priceString: '$39.99',
      price:       39.99,
      currencyCode: 'USD',
      period:      'annual',
    },
  ];
}
