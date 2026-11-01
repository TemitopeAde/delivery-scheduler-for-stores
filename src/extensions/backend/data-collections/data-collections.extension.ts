import { extensions } from '@wix/astro/builders'

import settingsCollection from './settings';

import productRulesCollection from './product-rules';

import reservationsCollection from './reservations';

import scheduledOrdersCollection from './scheduled-orders';

import eventLogCollection from './event-log';

import slotLocksCollection from './slot-locks';

export default extensions.dataCollections({
  id: '94657c15-817f-4669-8ad7-a156d4812290',
  name: 'Data Collections',
  collections: [
    settingsCollection,
    productRulesCollection,
    reservationsCollection,
    scheduledOrdersCollection,
    eventLogCollection,
    slotLocksCollection
  ],
});
