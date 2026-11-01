import type { orders } from '@wix/ecom';
import { orders as ordersApi } from '@wix/ecom';
import { auth } from '@wix/essentials';
import { DATE_ONLY_SLOT_ID } from '../engine/slots';
import type { Settings } from '../schemas';
import { storesItems, type PurchaseItem } from './checkout-context';
import { log } from './log';

const elevatedGetOrder = auth.elevate(ordersApi.getOrder);

/** Current authoritative order state, so out-of-order events never apply stale data. */
export async function fetchOrder(orderId: string): Promise<orders.Order | null> {
  try {
    return await elevatedGetOrder(orderId);
  } catch (error) {
    log.error('order.fetch', error, { orderId });
    return null;
  }
}

export function orderItems(order: orders.Order): PurchaseItem[] {
  return storesItems(order.lineItems ?? []);
}

export interface OrderSnapshot {
  orderNumber: string;
  orderStatusSnapshot: string;
  paymentStatusSnapshot: string;
  fulfillmentStatusSnapshot: string;
  customerDisplayName: string;
  itemSummarySnapshot: string;
  productIds: string[];
  source: string;
}

/** Only what the fulfilment dashboard needs: no emails, addresses, phones or payment data. */
export function orderSnapshot(order: orders.Order): OrderSnapshot {
  const contact = order.billingInfo?.contactDetails ?? order.recipientInfo?.contactDetails;
  const name = [contact?.firstName, contact?.lastName].filter(Boolean).join(' ').trim();
  const lines = (order.lineItems ?? []).map(
    (li) => `${li.quantity ?? 1}× ${li.productName?.translated ?? li.productName?.original ?? ''}`.trim(),
  );
  return {
    orderNumber: order.number ?? '',
    orderStatusSnapshot: order.status ?? '',
    paymentStatusSnapshot: order.paymentStatus ?? '',
    fulfillmentStatusSnapshot: order.fulfillmentStatus ?? '',
    customerDisplayName: name.slice(0, 120),
    itemSummarySnapshot: lines.join(', ').slice(0, 500),
    productIds: orderItems(order).map((i) => i.productId),
    source: order.channelInfo?.type ?? '',
  };
}

/** Plain-text slot label stored on the record so later settings changes do not rewrite history. */
export function slotLabelSnapshot(settings: Settings, slotId: string): string {
  const custom = settings.slots.labels[slotId];
  if (custom) return custom;
  if (slotId === DATE_ONLY_SLOT_ID) return '';
  const match = /^(\d{2})(\d{2})-(\d{2})(\d{2})$/.exec(slotId);
  return match ? `${match[1]}:${match[2]}–${match[3]}:${match[4]}` : slotId;
}
