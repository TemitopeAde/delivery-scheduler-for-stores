import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'slot-locks';

// Private: every read and write goes through authenticated, elevated backend code.
export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Delivery Scheduler Capacity Locks',
  displayField: 'scopeKey',
  fields: [
    { key: 'scopeKey', type: 'TEXT', displayName: 'Scope' },
    { key: 'kind', type: 'TEXT', displayName: 'Kind' },
    { key: 'method', type: 'TEXT', displayName: 'Fulfilment Method' },
    { key: 'localDate', type: 'TEXT', displayName: 'Local Date' },
    { key: 'slotId', type: 'TEXT', displayName: 'Slot ID' },
    { key: 'reservationId', type: 'TEXT', displayName: 'Reservation ID' },
    { key: 'expiresAt', type: 'DATETIME', displayName: 'Expires At' },
  ],
  dataPermissions: { itemRead: 'PRIVILEGED', itemInsert: 'PRIVILEGED', itemUpdate: 'PRIVILEGED', itemRemove: 'PRIVILEGED' },
  indexes: [{ fields: [{ path: 'scopeKey' }] }, { fields: [{ path: 'localDate' }, { path: 'method' }] }],
  initialData: [],
} satisfies DataCollection;
