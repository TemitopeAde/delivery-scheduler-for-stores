import type { Plan } from '../engine/types';
import type { ProductRule, Settings } from '../schemas';
import type { PurchaseItem } from './checkout-context';
import { resolveEntitlement } from './entitlements';
import { rulesForProducts } from './product-rules-repo';
import { loadSettings } from './settings-repo';

export interface SchedulingContext {
  settings: Settings;
  plan: Plan;
  rules: ProductRule[];
}

export async function loadSchedulingContext(items: PurchaseItem[]): Promise<SchedulingContext> {
  const [settings, entitlement, rules] = await Promise.all([
    loadSettings(),
    resolveEntitlement(),
    rulesForProducts(items.map((i) => i.productId)),
  ]);
  return { settings, plan: entitlement.plan, rules };
}

/**
 * Whether the purchase needs a schedule. Only Wix Stores items count; a purchase
 * with none of them (e.g. bookings only) is never blocked.
 */
export function isSchedulingRequired(ctx: SchedulingContext, items: PurchaseItem[]): boolean {
  const { settings, plan, rules } = ctx;
  if (!settings.configured || !settings.enabled || items.length === 0) return false;
  switch (settings.requiredMode) {
    case 'all':
      return true;
    case 'selectedProducts':
      // Per-product requirements are a Pro rule; Basic falls back to optional.
      return plan === 'pro' && rules.some((r) => r.enabled && r.requiredScheduling);
    case 'optional':
      return false;
    default: {
      const exhaustive: never = settings.requiredMode;
      return exhaustive;
    }
  }
}
