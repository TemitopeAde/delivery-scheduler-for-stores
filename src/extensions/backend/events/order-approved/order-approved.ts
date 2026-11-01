import { orders } from '@wix/ecom';
import { processOrderEvent } from '../../../../lib/server/order-sync';

export default orders.onOrderApproved(async (event) => {
  await processOrderEvent({
    eventId: event.metadata._id ?? `${event.data.order?._id ?? 'unknown'}:approved`,
    eventType: 'order.approved',
    order: event.data.order,
  });
});
