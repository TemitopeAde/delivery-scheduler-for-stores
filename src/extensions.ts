import { app } from '@wix/astro/builders';

import dataCollections from './extensions/backend/data-collections/data-collections.extension.ts';

import scheduleValidator from './extensions/backend/service-plugins/schedule-validator/schedule-validator.extension.ts';

import orderCreated from './extensions/backend/events/order-created/order-created.extension.ts';

import orderApproved from './extensions/backend/events/order-approved/order-approved.extension.ts';

import orderCanceled from './extensions/backend/events/order-canceled/order-canceled.extension.ts';

import deliverySchedulerPicker from './extensions/site/plugins/delivery-scheduler-picker/delivery-scheduler-picker.extension.ts';

import deliveryScheduler from './extensions/dashboard/pages/delivery-scheduler/delivery-scheduler.extension.ts';

export default app().use(dataCollections).use(scheduleValidator).use(orderCreated).use(orderApproved).use(orderCanceled).use(deliverySchedulerPicker).use(deliveryScheduler);
