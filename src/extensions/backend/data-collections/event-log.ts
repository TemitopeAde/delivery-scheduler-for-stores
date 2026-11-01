import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'event-log';

// Private: every read and write goes through authenticated, elevated backend code.
export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Delivery Scheduler Event Log',
  displayField: 'eventType',
  fields: [
    { key: 'eventId', type: 'TEXT', displayName: 'Event ID' },
    { key: 'eventType', type: 'TEXT', displayName: 'Event Type' },
    { key: 'orderId', type: 'TEXT', displayName: 'Order ID' },
    { key: 'reservationId', type: 'TEXT', displayName: 'Reservation ID' },
    { key: 'idempotencyKey', type: 'TEXT', displayName: 'Idempotency Key' },
    { key: 'processingStatus', type: 'TEXT', displayName: 'Processing Status' },
    { key: 'attemptCount', type: 'NUMBER', displayName: 'Attempts' },
    { key: 'lastErrorCode', type: 'TEXT', displayName: 'Last Error Code' },
    { key: 'receivedAt', type: 'DATETIME', displayName: 'Received At' },
    { key: 'processedAt', type: 'DATETIME', displayName: 'Processed At' },
  ],
  dataPermissions: { itemRead: 'PRIVILEGED', itemInsert: 'PRIVILEGED', itemUpdate: 'PRIVILEGED', itemRemove: 'PRIVILEGED' },
  indexes: [{ fields: [{ path: 'processingStatus' }, { path: 'receivedAt', order: 'DESC' }] }],
  initialData: [],
} satisfies DataCollection;
