import { orders } from '@wix/ecom';
import { processOrderEvent } from '../../../../lib/server/order-sync';

export default orders.onOrderCreated(async (event) => {
  await processOrderEvent({
    eventId: event.metadata._id ?? `${event.entity._id ?? 'unknown'}:created`,
    eventType: 'order.created',
    order: event.entity,
  });
});
