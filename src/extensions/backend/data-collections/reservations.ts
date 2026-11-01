import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'reservations';

// Private: every read and write goes through authenticated, elevated backend code.
export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Delivery Scheduler Reservations',
  displayField: 'reservationId',
  fields: [
    { key: 'reservationId', type: 'TEXT', displayName: 'Reservation ID' },
    { key: 'orderId', type: 'TEXT', displayName: 'Order ID' },
    { key: 'checkoutId', type: 'TEXT', displayName: 'Checkout ID' },
    { key: 'purchaseFlowId', type: 'TEXT', displayName: 'Purchase Flow ID' },
    { key: 'idempotencyKey', type: 'TEXT', displayName: 'Idempotency Key' },
    { key: 'fulfilmentMethod', type: 'TEXT', displayName: 'Fulfilment Method' },
    { key: 'localDate', type: 'TEXT', displayName: 'Local Date' },
    { key: 'slotId', type: 'TEXT', displayName: 'Slot ID' },
    { key: 'slotStartUtc', type: 'DATETIME', displayName: 'Slot Start (UTC)' },
    { key: 'slotEndUtc', type: 'DATETIME', displayName: 'Slot End (UTC)' },
    { key: 'timezone', type: 'TEXT', displayName: 'Time Zone' },
    { key: 'status', type: 'TEXT', displayName: 'Status' },
    { key: 'expiresAt', type: 'DATETIME', displayName: 'Expires At' },
    { key: 'settingsRevision', type: 'NUMBER', displayName: 'Settings Revision' },
    { key: 'lockIds', type: 'ARRAY_STRING', displayName: 'Lock IDs' },
    { key: 'createdAt', type: 'DATETIME', displayName: 'Created At' },
    { key: 'updatedAt', type: 'DATETIME', displayName: 'Updated At' },
  ],
  dataPermissions: { itemRead: 'PRIVILEGED', itemInsert: 'PRIVILEGED', itemUpdate: 'PRIVILEGED', itemRemove: 'PRIVILEGED' },
  indexes: [{ fields: [{ path: 'checkoutId' }] }, { fields: [{ path: 'purchaseFlowId' }] }, { fields: [{ path: 'idempotencyKey' }], unique: true }],
  initialData: [],
} satisfies DataCollection;
