import { orders } from '@wix/ecom';
import { processOrderEvent } from '../../../../lib/server/order-sync';

export default orders.onOrderCanceled(async (event) => {
  await processOrderEvent({
    eventId: event.metadata._id ?? `${event.data.order?._id ?? 'unknown'}:canceled`,
    eventType: 'order.canceled',
    order: event.data.order,
  });
});
