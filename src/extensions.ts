import { app } from '@wix/astro/builders';

import dataCollections from './extensions/backend/data-collections/data-collections.extension.ts';

import scheduleValidator from './extensions/backend/service-plugins/schedule-validator/schedule-validator.extension.ts';

import orderCreated from './extensions/backend/events/order-created/order-created.extension.ts';

import orderApproved from './extensions/backend/events/order-approved/order-approved.extension.ts';

import orderCanceled from './extensions/backend/events/order-canceled/order-canceled.extension.ts';

import orderPaymentStatusUpdated from './extensions/backend/events/order-payment-status-updated/order-payment-status-updated.extension.ts';

import appInstalled from './extensions/backend/events/app-installed/app-installed.extension.ts';

import appRemoved from './extensions/backend/events/app-removed/app-removed.extension.ts';

import paidPlanPurchased from './extensions/backend/events/paid-plan-purchased/paid-plan-purchased.extension.ts';

import paidPlanChanged from './extensions/backend/events/paid-plan-changed/paid-plan-changed.extension.ts';

import paidPlanAutoRenewalCancelled from './extensions/backend/events/paid-plan-auto-renewal-cancelled/paid-plan-auto-renewal-cancelled.extension.ts';

import planConvertedToPaid from './extensions/backend/events/plan-converted-to-paid/plan-converted-to-paid.extension.ts';

import planReactivated from './extensions/backend/events/plan-reactivated/plan-reactivated.extension.ts';

import planTransferred from './extensions/backend/events/plan-transferred/plan-transferred.extension.ts';

import deliverySchedulerPicker from './extensions/site/plugins/delivery-scheduler-picker/delivery-scheduler-picker.extension.ts';

import deliveryScheduler from './extensions/dashboard/pages/delivery-scheduler/delivery-scheduler.extension.ts';

export default app()
  .use(dataCollections)
  .use(scheduleValidator)
  .use(orderCreated)
  .use(orderApproved)
  .use(orderCanceled)
  .use(orderPaymentStatusUpdated)
  .use(appInstalled)
  .use(appRemoved)
  .use(paidPlanPurchased)
  .use(paidPlanChanged)
  .use(paidPlanAutoRenewalCancelled)
  .use(planConvertedToPaid)
  .use(planReactivated)
  .use(planTransferred)
  .use(deliverySchedulerPicker)
  .use(deliveryScheduler);
