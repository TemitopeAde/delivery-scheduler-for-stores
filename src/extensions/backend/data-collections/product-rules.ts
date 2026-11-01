import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'product-rules';

// Private: every read and write goes through authenticated, elevated backend code.
export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Delivery Scheduler Product Rules',
  displayField: 'productName',
  fields: [
    { key: 'productId', type: 'TEXT', displayName: 'Product ID' },
    { key: 'productName', type: 'TEXT', displayName: 'Product Name' },
    { key: 'enabled', type: 'BOOLEAN', displayName: 'Enabled' },
    { key: 'preparationMinutes', type: 'NUMBER', displayName: 'Preparation (min)' },
    { key: 'allowedFulfilmentMethods', type: 'ARRAY_STRING', displayName: 'Allowed Methods' },
    { key: 'requiredScheduling', type: 'BOOLEAN', displayName: 'Scheduling Required' },
    { key: 'customWorkingHours', type: 'OBJECT', displayName: 'Custom Working Hours', objectOptions: { fields: [] } },
    { key: 'createdAt', type: 'DATETIME', displayName: 'Created At' },
    { key: 'updatedAt', type: 'DATETIME', displayName: 'Updated At' },
  ],
  dataPermissions: { itemRead: 'PRIVILEGED', itemInsert: 'PRIVILEGED', itemUpdate: 'PRIVILEGED', itemRemove: 'PRIVILEGED' },
  indexes: [],
  initialData: [],
} satisfies DataCollection;
