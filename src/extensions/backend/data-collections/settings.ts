import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'settings';

// Private: every read and write goes through authenticated, elevated backend code.
export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Delivery Scheduler Settings',
  displayField: 'timezone',
  fields: [
    { key: 'schemaVersion', type: 'NUMBER', displayName: 'Schema Version' },
    { key: 'settingsRevision', type: 'NUMBER', displayName: 'Settings Revision' },
    { key: 'enabled', type: 'BOOLEAN', displayName: 'Enabled' },
    { key: 'requiredMode', type: 'TEXT', displayName: 'Required Mode' },
    { key: 'timezone', type: 'TEXT', displayName: 'Time Zone' },
    { key: 'fulfilmentMethods', type: 'OBJECT', displayName: 'Fulfilment Methods', objectOptions: { fields: [] } },
    { key: 'minNoticeMinutes', type: 'NUMBER', displayName: 'Minimum Notice (min)' },
    { key: 'maxDaysAhead', type: 'NUMBER', displayName: 'Max Days Ahead' },
    { key: 'sameDayEnabled', type: 'BOOLEAN', displayName: 'Same Day Enabled' },
    { key: 'cutoffRules', type: 'OBJECT', displayName: 'Cut-off Rules', objectOptions: { fields: [] } },
    { key: 'slotRules', type: 'OBJECT', displayName: 'Slot Rules', objectOptions: { fields: [] } },
    { key: 'blockedDates', type: 'ARRAY_STRING', displayName: 'Blocked Dates' },
    { key: 'holidayRules', type: 'OBJECT', displayName: 'Holiday Rules', objectOptions: { fields: [] } },
    { key: 'vacationRanges', type: 'OBJECT', displayName: 'Vacation Ranges', objectOptions: { fields: [] } },
    { key: 'holdMinutes', type: 'NUMBER', displayName: 'Hold Minutes' },
    { key: 'appearance', type: 'OBJECT', displayName: 'Appearance', objectOptions: { fields: [] } },
    { key: 'translations', type: 'OBJECT', displayName: 'Translations', objectOptions: { fields: [] } },
    { key: 'notificationSettings', type: 'OBJECT', displayName: 'Notification Settings', objectOptions: { fields: [] } },
    { key: 'createdAt', type: 'DATETIME', displayName: 'Created At' },
    { key: 'updatedAt', type: 'DATETIME', displayName: 'Updated At' },
  ],
  dataPermissions: { itemRead: 'PRIVILEGED', itemInsert: 'PRIVILEGED', itemUpdate: 'PRIVILEGED', itemRemove: 'PRIVILEGED' },
  indexes: [],
  initialData: [],
} satisfies DataCollection;
