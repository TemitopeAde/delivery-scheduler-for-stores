import { checkout } from '@wix/ecom';
import { auth } from '@wix/essentials';
import { WIX_STORES_APP_ID } from '../constants';
import { withRetry } from './data';
import { AppError } from './errors';
import { log } from './log';

export interface PurchaseItem {
  productId: string;
  quantity: number;
  name: string;
}

export interface CheckoutContext {
  checkoutId: string;
  purchaseFlowId: string | null;
  completed: boolean;
  items: PurchaseItem[];
}

/**
 * Checkout API v1 is deprecated in favour of Cart V2 (removal announced for
 * 1 Feb 2027). It is the only documented way to resolve the `checkoutId` the
 * checkout-page plugin receives into its line items and `purchaseFlowId`, so it
 * is isolated here. See docs/WIX-API-VERIFICATION.md for the migration blocker.
 */
const elevatedGetCheckout = auth.elevate(checkout.getCheckout);

export function storesItems(
  lineItems: Array<{
    quantity?: number | null;
    catalogReference?: { catalogItemId?: string | null; appId?: string | null } | null;
    productName?: { original?: string | null } | null;
  }>,
): PurchaseItem[] {
  return lineItems.flatMap((li) => {
    const productId = li.catalogReference?.catalogItemId;
    if (!productId || li.catalogReference?.appId !== WIX_STORES_APP_ID) return [];
    return [{ productId, quantity: li.quantity ?? 1, name: li.productName?.original ?? '' }];
  });
}

/** Resolves the checkout server-side; the browser never supplies products or flow IDs. */
export async function resolveCheckout(checkoutId: string): Promise<CheckoutContext> {
  try {
    const result = await withRetry(() => elevatedGetCheckout(checkoutId), 2);
    return {
      checkoutId,
      purchaseFlowId: result.purchaseFlowId ?? null,
      completed: result.completed === true,
      items: storesItems(result.lineItems ?? []),
    };
  } catch (error) {
    log.error('checkout.resolve', error, { checkoutId });
    throw new AppError('CHECKOUT_NOT_FOUND', 'This checkout could not be found.');
  }
}
