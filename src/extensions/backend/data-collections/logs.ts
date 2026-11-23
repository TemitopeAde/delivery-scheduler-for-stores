import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'logs';

// Private: checkout plugin writes are performed by elevated backend code.
export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Delivery Scheduler Logs',
  displayField: 'operation',
  fields: [
    { key: 'operation', type: 'TEXT', displayName: 'Operation' },
    { key: 'outcome', type: 'TEXT', displayName: 'Outcome' },
    { key: 'reason', type: 'TEXT', displayName: 'Reason' },
    { key: 'requestId', type: 'TEXT', displayName: 'Request ID' },
    { key: 'purchaseFlowId', type: 'TEXT', displayName: 'Purchase Flow ID' },
    { key: 'source', type: 'TEXT', displayName: 'Source' },
    { key: 'reservationId', type: 'TEXT', displayName: 'Reservation ID' },
    { key: 'errorCode', type: 'TEXT', displayName: 'Error Code' },
    { key: 'createdAt', type: 'DATETIME', displayName: 'Created At' },
  ],
  dataPermissions: { itemRead: 'PRIVILEGED', itemInsert: 'PRIVILEGED', itemUpdate: 'PRIVILEGED', itemRemove: 'PRIVILEGED' },
  indexes: [{ fields: [{ path: 'createdAt', order: 'DESC' }] }],
  initialData: [],
} satisfies DataCollection;
