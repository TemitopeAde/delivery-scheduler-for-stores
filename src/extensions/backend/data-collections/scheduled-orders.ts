import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'scheduled-orders';

// Private: every read and write goes through authenticated, elevated backend code.
export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Delivery Scheduler Orders',
  displayField: 'orderNumber',
  fields: [
    { key: 'orderId', type: 'TEXT', displayName: 'Order ID' },
    { key: 'orderNumber', type: 'TEXT', displayName: 'Order Number' },
    { key: 'reservationId', type: 'TEXT', displayName: 'Reservation ID' },
    { key: 'fulfilmentMethod', type: 'TEXT', displayName: 'Fulfilment Method' },
    { key: 'localDate', type: 'TEXT', displayName: 'Local Date' },
    { key: 'slotId', type: 'TEXT', displayName: 'Slot ID' },
    { key: 'slotLabelSnapshot', type: 'TEXT', displayName: 'Slot Label' },
    { key: 'slotStartUtc', type: 'DATETIME', displayName: 'Slot Start (UTC)' },
    { key: 'slotEndUtc', type: 'DATETIME', displayName: 'Slot End (UTC)' },
    { key: 'timezone', type: 'TEXT', displayName: 'Time Zone' },
    { key: 'scheduleStatus', type: 'TEXT', displayName: 'Schedule Status' },
    { key: 'orderStatusSnapshot', type: 'TEXT', displayName: 'Order Status' },
    { key: 'paymentStatusSnapshot', type: 'TEXT', displayName: 'Payment Status' },
    { key: 'fulfillmentStatusSnapshot', type: 'TEXT', displayName: 'Fulfillment Status' },
    { key: 'customerDisplayName', type: 'TEXT', displayName: 'Customer' },
    { key: 'itemSummarySnapshot', type: 'TEXT', displayName: 'Items' },
    { key: 'productIds', type: 'ARRAY_STRING', displayName: 'Product IDs' },
    { key: 'merchantNotes', type: 'TEXT', displayName: 'Merchant Notes' },
    { key: 'source', type: 'TEXT', displayName: 'Source' },
    { key: 'lastSyncedAt', type: 'DATETIME', displayName: 'Last Synced At' },
    { key: 'createdAt', type: 'DATETIME', displayName: 'Created At' },
    { key: 'updatedAt', type: 'DATETIME', displayName: 'Updated At' },
  ],
  dataPermissions: { itemRead: 'PRIVILEGED', itemInsert: 'PRIVILEGED', itemUpdate: 'PRIVILEGED', itemRemove: 'PRIVILEGED' },
  indexes: [{ fields: [{ path: 'localDate', order: 'ASC' }, { path: 'slotId', order: 'ASC' }] }, { fields: [{ path: 'scheduleStatus' }] }],
  initialData: [],
} satisfies DataCollection;
