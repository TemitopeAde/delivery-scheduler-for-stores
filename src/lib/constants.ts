export const APP_ID = '0127f604-ab9e-4ae2-bc21-b74bb2578a00';
export const APP_NAMESPACE = '@admin14744/delivery-scheduler-for-stores';

export const COLLECTIONS = {
  settings: `${APP_NAMESPACE}/settings`,
  productRules: `${APP_NAMESPACE}/product-rules`,
  reservations: `${APP_NAMESPACE}/reservations`,
  scheduledOrders: `${APP_NAMESPACE}/scheduled-orders`,
  eventLog: `${APP_NAMESPACE}/event-log`,
  slotLocks: `${APP_NAMESPACE}/slot-locks`,
} as const;

export const SETTINGS_ITEM_ID = 'site-settings';
export const SETTINGS_SCHEMA_VERSION = 1;

/** Wix Stores catalog app ID as documented for eCommerce catalog references. */
export const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';

/** Checkout page host widget, documented in the Checkout Page site-plugin article. */
export const CHECKOUT_PLUGIN_PLACEMENT = {
  appDefinitionId: '1380b703-ce81-ff05-f115-39571d94dfcd',
  widgetId: '14fd5970-8072-c276-1246-058b79e70c1a',
  slotId: 'checkout:delivery-step:options:after',
} as const;

/** Site plugin extension ID (from delivery-scheduler-picker.extension.ts). */
export const SITE_PLUGIN_ID = '8d61bd95-6f51-437b-93b8-2ddc19354a7b';

/**
 * Dev Center package names that unlock Pro features. Must match the plan names
 * configured under the app's pricing plans; anything else resolves to Basic.
 */
export const PRO_PACKAGE_NAMES: readonly string[] = ['pro'];

export const BASIC_MAX_DAYS_AHEAD = 30;
export const MAX_DAYS_AHEAD_LIMIT = 365;
export const MAX_AVAILABILITY_RANGE_DAYS = 62;
export const EVENT_MAX_ATTEMPTS = 5;
