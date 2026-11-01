import { orders } from '@wix/ecom';
import { processOrderEvent } from '../../../../lib/server/order-sync';
import { getScheduledOrder } from '../../../../lib/server/scheduled-orders-repo';
import { sendScheduleNotification } from '../../../../lib/server/schedule-notifications';

export default orders.onOrderPaymentStatusUpdated(async (event) => {
  const order = event.data.order;
  if (!order || order.paymentStatus !== 'PAID') return;

  const result = await processOrderEvent({
    eventId: event.metadata._id ?? `${order._id ?? 'unknown'}:paid`,
    eventType: 'order.paid',
    order,
  });

  if (result !== 'processed' || !order._id) return;
  const scheduledOrder = await getScheduledOrder(order._id);
  if (!scheduledOrder) return;

  if (scheduledOrder.scheduleStatus === 'missing' || scheduledOrder.scheduleStatus === 'needs_review') {
    await sendScheduleNotification({
      kind: 'needsReview',
      order: scheduledOrder,
      idempotencyKey: `schedule-needs-review:${event.metadata._id ?? order._id}`,
      reason: scheduledOrder.scheduleStatus === 'missing'
        ? 'The paid order does not have a confirmed delivery schedule.'
        : 'The order schedule needs merchant review before capacity can be confirmed.',
    });
    return;
  }

  if (scheduledOrder.localDate) {
    await sendScheduleNotification({
      kind: 'merchantNewOrder',
      order: scheduledOrder,
      idempotencyKey: `schedule-new-order:${event.metadata._id ?? order._id}`,
    });
  }
});
