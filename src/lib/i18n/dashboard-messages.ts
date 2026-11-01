import type { SupportedLocale } from './languages';

export type DashboardMessageKey =
  // Nav
  | 'nav.overview'
  | 'nav.orders'
  | 'nav.productRules'
  | 'nav.settings'
  | 'nav.help'
  | 'nav.language'
  // Overview
  | 'overview.title'
  | 'overview.subtitle'
  | 'overview.addToCheckout'
  | 'overview.addingToCheckout'
  | 'overview.addedToCheckout'
  | 'overview.addFailed'
  | 'overview.loadError'
  | 'overview.deliveriesToday'
  | 'overview.pickupsToday'
  | 'overview.pendingReview'
  | 'overview.nextSlot'
  | 'overview.nextSlotNone'
  | 'overview.todayOrders'
  | 'overview.viewAllOrders'
  | 'overview.noOrdersToday'
  | 'overview.colOrder'
  | 'overview.colCustomer'
  | 'overview.colMethod'
  | 'overview.colSlot'
  | 'overview.colStatus'
  | 'overview.finishSetup'
  | 'overview.finishSetupDesc'
  | 'overview.openSettings'
  | 'overview.schedulingOff'
  | 'overview.schedulingOffDesc'
  | 'overview.widgetNotPlaced'
  | 'overview.widgetNotPlacedDesc'
  | 'overview.attentionNeeded'
  | 'overview.reviewOrders'
  | 'overview.attentionDesc'
  | 'overview.todayWithDate'
  | 'overview.next7Days'
  | 'overview.deliveries7Days'
  | 'overview.pickups7Days'
  | 'overview.missingScheduleCount'
  | 'overview.slotsNearCapacity'
  | 'overview.slotsNearCapacitySub'
  | 'overview.noSlotsNearCapacity'
  | 'overview.colDate'
  | 'overview.colRemaining'
  | 'overview.full'
  | 'overview.refresh'
  | 'overview.offlineTitle'
  | 'overview.offlineDesc'
  // Offline banner
  | 'offline.title'
  | 'offline.description'
  | 'offline.cta'
  // Orders
  | 'orders.title'
  | 'orders.subtitle'
  | 'orders.exportCsv'
  | 'orders.exporting'
  | 'orders.exportFailed'
  | 'orders.updateStatus'
  | 'orders.searchPlaceholder'
  | 'orders.emptyTitle'
  | 'orders.emptySubtitle'
  | 'orders.noResultsTitle'
  | 'orders.noResultsSubtitle'
  | 'orders.errorTitle'
  | 'orders.retry'
  | 'orders.colOrder'
  | 'orders.colCustomer'
  | 'orders.colMethod'
  | 'orders.colScheduled'
  | 'orders.colStatus'
  | 'orders.colPayment'
  | 'orders.colFulfillment'
  | 'orders.filterMethod'
  | 'orders.filterScheduleStatus'
  | 'orders.filterOrderStatus'
  | 'orders.filterPaymentStatus'
  | 'orders.filterFulfillmentStatus'
  | 'orders.filterScheduledDate'
  | 'orders.bulkUpdated'
  | 'orders.bulkFailed'
  // Order Detail
  | 'orderDetail.title'
  | 'orderDetail.fulfilmentTitle'
  | 'orderDetail.fulfilmentSubtitle'
  | 'orderDetail.rescheduleTitle'
  | 'orderDetail.rescheduleSubtitle'
  | 'orderDetail.summaryTitle'
  | 'orderDetail.merchantNotes'
  | 'orderDetail.notesLimit'
  | 'orderDetail.statusField'
  | 'orderDetail.statusFieldInfo'
  | 'orderDetail.chooseStatus'
  | 'orderDetail.chooseMethod'
  | 'orderDetail.chooseDate'
  | 'orderDetail.chooseSlot'
  | 'orderDetail.rescheduleCancelled'
  | 'orderDetail.scheduledFor'
  | 'orderDetail.notScheduled'
  | 'orderDetail.method'
  | 'orderDetail.customer'
  | 'orderDetail.items'
  | 'orderDetail.statusLine'
  | 'orderDetail.reservation'
  | 'orderDetail.none'
  | 'orderDetail.lastSynced'
  | 'orderDetail.openWixOrder'
  | 'orderDetail.saveSuccess'
  | 'orderDetail.saveError'
  | 'orderDetail.anyTime'
  // Product Rules
  | 'productRules.title'
  | 'productRules.subtitle'
  | 'productRules.addRule'
  | 'productRules.searchPlaceholder'
  | 'productRules.emptyTitle'
  | 'productRules.emptySubtitle'
  | 'productRules.noResultsTitle'
  | 'productRules.noResultsSubtitle'
  | 'productRules.errorTitle'
  | 'productRules.colProduct'
  | 'productRules.colPrep'
  | 'productRules.colMethods'
  | 'productRules.colRequired'
  | 'productRules.colStatus'
  | 'productRules.both'
  | 'productRules.active'
  | 'productRules.disabled'
  | 'productRules.none'
  | 'productRules.required'
  | 'productRules.optional'
  | 'productRules.days'
  | 'productRules.hours'
  | 'productRules.minutes'
  | 'productRules.newRuleTitle'
  | 'productRules.editRuleTitle'
  | 'productRules.productSection'
  | 'productRules.ruleSection'
  | 'productRules.chooseProduct'
  | 'productRules.ruleActive'
  | 'productRules.ruleActiveInfo'
  | 'productRules.extraPrep'
  | 'productRules.allowedMethods'
  | 'productRules.requireScheduling'
  | 'productRules.customHours'
  | 'productRules.saveSuccess'
  | 'productRules.saveError'
  | 'productRules.searchProduct'
  | 'productRules.noProductsFound'
  | 'productRules.changeProduct'
  // Settings
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.saveSuccess'
  | 'settings.saveError'
  | 'settings.general'
  | 'settings.schedule'
  | 'settings.closures'
  | 'settings.delivery'
  | 'settings.pickup'
  | 'settings.notifications'
  | 'settings.appearance'
  | 'settings.reset'
  | 'settings.resetSubtitle'
  | 'settings.resetButton'
  | 'settings.previewTitle'
  | 'settings.previewNote'
  | 'settings.planTitle'
  | 'settings.enabled'
  | 'settings.enabledInfo'
  | 'settings.requirement'
  | 'settings.reqAll'
  | 'settings.reqSelected'
  | 'settings.reqOptional'
  | 'settings.timezone'
  | 'settings.timezoneInfo'
  | 'settings.holdMinutes'
  | 'settings.holdMinutesInfo'
  | 'settings.minNotice'
  | 'settings.maxDaysAhead'
  | 'settings.sameDay'
  | 'settings.cutoff'
  | 'settings.cutoffInfo'
  | 'settings.cutoffTime'
  | 'settings.customerChooses'
  | 'settings.modeSlots'
  | 'settings.modeDateOnly'
  | 'settings.slotInterval'
  | 'settings.slotIntervalInfo'
  | 'settings.slotBuffer'
  | 'settings.slotCapacity'
  | 'settings.customSlotLabels'
  | 'settings.customSlotLabelsInfo'
  | 'settings.offerDelivery'
  | 'settings.offerPickup'
  | 'settings.bothMethodsInfo'
  | 'settings.pickupLocationName'
  | 'settings.pickupAddress'
  | 'settings.pickupInstructions'
  | 'settings.deliveryNote'
  | 'settings.weeklyHours'
  | 'settings.specialHours'
  | 'settings.blockedDates'
  | 'settings.blockedDatesMethod'
  | 'settings.dailyCapacity'
  | 'settings.yearlyHolidays'
  | 'settings.yearlyHolidaysInfo'
  | 'settings.holidayName'
  | 'settings.monthDay'
  | 'settings.addHoliday'
  | 'settings.vacations'
  | 'settings.vacationsInfo'
  | 'settings.closureLabel'
  | 'settings.addClosure'
  | 'settings.to'
  | 'settings.emailWarningTitle'
  | 'settings.emailWarning'
  | 'settings.notifCustomerScheduled'
  | 'settings.notifMerchantNewOrder'
  | 'settings.notifScheduleChanged'
  | 'settings.notifNeedsReview'
  | 'settings.notifUpcomingSummary'
  | 'settings.merchantEmail'
  | 'settings.font'
  | 'settings.fontNote'
  | 'settings.fontSize'
  | 'settings.fontWeight'
  | 'settings.customColors'
  | 'settings.customColorsInfo'
  | 'settings.colorText'
  | 'settings.colorBg'
  | 'settings.colorBorder'
  | 'settings.colorAccent'
  | 'settings.colorAccentText'
  | 'settings.radius'
  | 'settings.spacing'
  | 'settings.slotStyle'
  | 'settings.slotStyleFilled'
  | 'settings.slotStyleOutline'
  | 'settings.defaultLang'
  | 'settings.dateFormat'
  | 'settings.timeFormat'
  | 'settings.time12'
  | 'settings.time24'
  | 'settings.customText'
  | 'settings.customTextInfo'
  | 'settings.closed'
  | 'settings.noDates'
  | 'settings.noSpecialHours'
  | 'settings.addDate'
  | 'settings.addSpecialHours'
  | 'settings.addHours'
  | 'settings.remove'
  // Plan Card
  | 'plan.current'
  | 'plan.basic'
  | 'plan.pro'
  | 'plan.unverified'
  | 'plan.renews'
  | 'plan.proAdds'
  | 'plan.upgradeNote'
  | 'plan.f1'
  | 'plan.f2'
  | 'plan.f3'
  | 'plan.f4'
  | 'plan.f5'
  | 'plan.f6'
  // Help & Diagnostics
  | 'help.title'
  | 'help.subtitle'
  | 'help.runReconcile'
  | 'help.reconcileRunning'
  | 'help.reconcileSuccess'
  | 'help.reconcileFailed'
  | 'help.loadErrorTitle'
  | 'help.retry'
  | 'help.failedEvents'
  | 'help.deadLetter'
  | 'help.pendingHolds'
  | 'help.reservationsReview'
  | 'help.settingsRevision'
  | 'help.settingsNotActive'
  | 'help.settingsNotActiveInfo'
  | 'help.lastEvent'
  | 'help.noEvents'
  | 'help.failedCardTitle'
  | 'help.failedCardSubtitle'
  | 'help.noFailures'
  | 'help.colEvent'
  | 'help.colOrder'
  | 'help.colAttempts'
  | 'help.colLastAttempt'
  | 'help.colError'
  | 'help.howItWorks'
  | 'help.howItWorks1'
  | 'help.howItWorks2'
  | 'help.howItWorks3'
  | 'help.howItWorks4'
  | 'help.colStatus'
  | 'help.colReceived'
  // Common / Statuses / Methods
  | 'common.save'
  | 'common.saving'
  | 'common.cancel'
  | 'common.retry'
  | 'common.none'
  | 'common.na'
  | 'common.delivery'
  | 'common.pickup'
  | 'common.scheduled'
  | 'common.preparing'
  | 'common.ready'
  | 'common.outForDelivery'
  | 'common.completed'
  | 'common.needsReview'
  | 'common.missingSchedule'
  | 'common.cancelled'
  | 'common.initialized'
  | 'common.approved'
  | 'common.pending'
  | 'common.canceled'
  | 'common.rejected'
  | 'common.notPaid'
  | 'common.paid'
  | 'common.partiallyPaid'
  | 'common.partiallyRefunded'
  | 'common.refunded'
  | 'common.pendingMerchant'
  | 'common.notFulfilled'
  | 'common.partiallyFulfilled'
  | 'common.fulfilled'
  | 'common.monday'
  | 'common.tuesday'
  | 'common.wednesday'
  | 'common.thursday'
  | 'common.friday'
  | 'common.saturday'
  | 'common.sunday';

export type DashboardMessages = Record<DashboardMessageKey, string>;

export const DASHBOARD_EN: DashboardMessages = {
  'nav.overview': 'Overview',
  'nav.orders': 'Orders',
  'nav.productRules': 'Product rules',
  'nav.settings': 'Settings',
  'nav.help': 'Help & diagnostics',
  'nav.language': 'Language',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': "Today's fulfilment at a glance.",
  'overview.addToCheckout': 'Add to checkout',
  'overview.addingToCheckout': 'Adding to checkout…',
  'overview.addedToCheckout': 'Added to your checkout page.',
  'overview.addFailed': 'Could not add the widget. It may already be on your checkout page.',
  'overview.loadError': 'Failed to load the overview',
  'overview.deliveriesToday': "Today's deliveries",
  'overview.pickupsToday': "Today's pickups",
  'overview.pendingReview': 'Pending review',
  'overview.nextSlot': 'Next slot',
  'overview.nextSlotNone': 'None today',
  'overview.todayOrders': "Today's scheduled orders",
  'overview.viewAllOrders': 'View all orders',
  'overview.noOrdersToday': 'No orders scheduled for today yet.',
  'overview.colOrder': 'Order',
  'overview.colCustomer': 'Customer',
  'overview.colMethod': 'Method',
  'overview.colSlot': 'Slot',
  'overview.colStatus': 'Status',
  'overview.finishSetup': 'Finish setup',
  'overview.finishSetupDesc': 'Set your time zone, hours and methods, then turn scheduling on. Checkout is never blocked until you do.',
  'overview.openSettings': 'Open settings',
  'overview.schedulingOff': 'Scheduling is off',
  'overview.schedulingOffDesc': "Customers can't choose a time and checkout isn't validated.",
  'overview.widgetNotPlaced': 'The checkout widget isn’t on your site',
  'overview.widgetNotPlacedDesc': 'Customers choose their time in the delivery step of checkout. Add the widget there to start collecting schedules.',
  'overview.attentionNeeded': 'Orders need attention',
  'overview.reviewOrders': 'Review orders',
  'overview.attentionDesc': '{needs} order(s) need review and {missing} required order(s) arrived without a schedule.',
  'overview.todayWithDate': 'Today ({date})',
  'overview.next7Days': 'Next 7 days',
  'overview.deliveries7Days': 'Deliveries (7 days)',
  'overview.pickups7Days': 'Pickups (7 days)',
  'overview.missingScheduleCount': 'Missing a schedule',
  'overview.slotsNearCapacity': 'Slots near capacity',
  'overview.slotsNearCapacitySub': 'Next 7 days · {timezone}',
  'overview.noSlotsNearCapacity': 'No slots are at or near capacity.',
  'overview.colDate': 'Date',
  'overview.colRemaining': 'Remaining',
  'overview.full': 'Full',
  'overview.refresh': 'Refresh',
  'overview.offlineTitle': "You're offline",
  'overview.offlineDesc': 'Data on this page may be out of date. It refreshes when your connection returns.',
  'offline.title': 'Scheduling is currently turned off',
  'offline.description': 'Customers cannot choose a delivery or pickup time at checkout until scheduling is turned on.',
  'offline.cta': 'Turn on in Settings',
  'orders.title': 'Scheduled orders',
  'orders.subtitle': 'Manage and update customer delivery and pickup times.',
  'orders.exportCsv': 'Export CSV',
  'orders.exporting': 'Exporting…',
  'orders.exportFailed': 'Failed to export orders',
  'orders.updateStatus': 'Update status',
  'orders.searchPlaceholder': 'Search by order # or customer name',
  'orders.emptyTitle': 'No scheduled orders yet',
  'orders.emptySubtitle': 'When customers choose a delivery or pickup time at checkout, their orders appear here.',
  'orders.noResultsTitle': 'No orders match your filters',
  'orders.noResultsSubtitle': 'Try widening the date range or clearing filters.',
  'orders.errorTitle': "Couldn't load orders",
  'orders.retry': 'Retry',
  'orders.colOrder': 'Order',
  'orders.colCustomer': 'Customer',
  'orders.colMethod': 'Method',
  'orders.colScheduled': 'Scheduled time',
  'orders.colStatus': 'Schedule status',
  'orders.colPayment': 'Payment',
  'orders.colFulfillment': 'Fulfilment',
  'orders.filterMethod': 'Method',
  'orders.filterScheduleStatus': 'Schedule status',
  'orders.filterOrderStatus': 'Order status',
  'orders.filterPaymentStatus': 'Payment status',
  'orders.filterFulfillmentStatus': 'Fulfillment status',
  'orders.filterScheduledDate': 'Scheduled date',
  'orders.bulkUpdated': 'Updated {count} order(s)',
  'orders.bulkFailed': 'Failed to update orders',
  'orderDetail.title': 'Scheduled order',
  'orderDetail.fulfilmentTitle': 'Fulfilment',
  'orderDetail.fulfilmentSubtitle': "Changes apply to the app's scheduling record only.",
  'orderDetail.rescheduleTitle': 'Reschedule',
  'orderDetail.rescheduleSubtitle': 'Capacity for the new time is reserved before the old time is released.',
  'orderDetail.summaryTitle': 'Order',
  'orderDetail.merchantNotes': 'Merchant notes',
  'orderDetail.notesLimit': 'Keep notes under 2000 characters',
  'orderDetail.statusField': 'Fulfilment status',
  'orderDetail.statusFieldInfo': 'Schedule the order (or restore it) before changing its status.',
  'orderDetail.chooseStatus': 'Choose a status',
  'orderDetail.chooseMethod': 'Choose a method',
  'orderDetail.chooseDate': 'Choose a date',
  'orderDetail.chooseSlot': 'Choose a time slot',
  'orderDetail.rescheduleCancelled': 'This order was canceled and can no longer be rescheduled.',
  'orderDetail.scheduledFor': 'Scheduled for',
  'orderDetail.notScheduled': 'Not scheduled',
  'orderDetail.method': 'Method',
  'orderDetail.customer': 'Customer',
  'orderDetail.items': 'Items',
  'orderDetail.statusLine': 'Order / payment / fulfillment',
  'orderDetail.reservation': 'Reservation',
  'orderDetail.none': 'None',
  'orderDetail.lastSynced': 'Last synced',
  'orderDetail.openWixOrder': 'Open Wix order',
  'orderDetail.saveSuccess': 'Scheduling updated',
  'orderDetail.saveError': 'Failed to update the order',
  'orderDetail.anyTime': 'Any time',
  'productRules.title': 'Product rules',
  'productRules.subtitle': 'Preparation time, allowed methods and required scheduling per product (Pro).',
  'productRules.addRule': 'Add product rule',
  'productRules.searchPlaceholder': 'Search by product name',
  'productRules.emptyTitle': 'No product rules yet',
  'productRules.emptySubtitle': 'Without rules, every product follows your general schedule.',
  'productRules.noResultsTitle': 'No rules match',
  'productRules.noResultsSubtitle': 'Search matches part of a product name.',
  'productRules.errorTitle': "Couldn't load product rules",
  'productRules.colProduct': 'Product',
  'productRules.colPrep': 'Preparation time',
  'productRules.colMethods': 'Allowed methods',
  'productRules.colRequired': 'Scheduling',
  'productRules.colStatus': 'Status',
  'productRules.both': 'Both',
  'productRules.active': 'Active',
  'productRules.disabled': 'Disabled',
  'productRules.none': 'None',
  'productRules.required': 'Required',
  'productRules.optional': 'Optional',
  'productRules.days': '{count} day(s)',
  'productRules.hours': '{count} hour(s)',
  'productRules.minutes': '{count} min',
  'productRules.newRuleTitle': 'New product rule',
  'productRules.editRuleTitle': 'Edit product rule',
  'productRules.productSection': 'Product',
  'productRules.ruleSection': 'Rule settings',
  'productRules.chooseProduct': 'Choose a product',
  'productRules.ruleActive': 'Rule active',
  'productRules.ruleActiveInfo': 'While inactive, this product follows the general schedule.',
  'productRules.extraPrep': 'Extra preparation time (hours)',
  'productRules.allowedMethods': 'Allowed fulfilment methods',
  'productRules.requireScheduling': 'Always require scheduling when this product is in cart',
  'productRules.customHours': 'Custom available hours for this product',
  'productRules.saveSuccess': 'Product rule saved',
  'productRules.saveError': 'Failed to save the product rule',
  'productRules.searchProduct': 'Search store products…',
  'productRules.noProductsFound': 'No products found',
  'productRules.changeProduct': 'Change',
  'settings.title': 'Settings',
  'settings.subtitle': 'Delivery, pickup, capacity and how the checkout widget looks.',
  'settings.saveSuccess': 'Settings saved',
  'settings.saveError': 'Failed to save the settings',
  'settings.general': 'General',
  'settings.schedule': 'Schedule & capacity',
  'settings.closures': 'Closures & holidays',
  'settings.delivery': 'Delivery',
  'settings.pickup': 'Pickup',
  'settings.notifications': 'Notifications',
  'settings.appearance': 'Appearance & text',
  'settings.reset': 'Reset',
  'settings.resetSubtitle': 'Restore every setting except the time zone to its default. Nothing is saved until you click Save.',
  'settings.resetButton': 'Reset to defaults',
  'settings.previewTitle': 'Customer preview',
  'settings.previewNote': 'Sample dates from your current settings. Checkout colors apply when custom colors are off.',
  'settings.planTitle': 'Plan',
  'settings.enabled': 'Scheduling enabled',
  'settings.enabledInfo': 'While off, the checkout widget is hidden and checkout is never blocked.',
  'settings.requirement': 'Scheduling requirement',
  'settings.reqAll': 'Required for all orders with store products',
  'settings.reqSelected': 'Required only for products with a rule that requires it',
  'settings.reqOptional': 'Optional',
  'settings.timezone': 'Store time zone',
  'settings.timezoneInfo': "All dates, cut-offs and capacity use this zone, never the customer's browser zone.",
  'settings.holdMinutes': 'Hold a selected time for (minutes)',
  'settings.holdMinutesInfo': 'Capacity is reserved while the customer finishes checkout, then released if no order arrives.',
  'settings.minNotice': 'Minimum notice (hours)',
  'settings.maxDaysAhead': 'Book up to (days ahead)',
  'settings.sameDay': 'Allow same-day orders',
  'settings.cutoff': 'Daily cut-off time',
  'settings.cutoffInfo': 'Orders placed after this time are treated as if placed the next day.',
  'settings.cutoffTime': 'Cut-off (HH:mm, store time)',
  'settings.customerChooses': 'Customer chooses',
  'settings.modeSlots': 'Specific time slots',
  'settings.modeDateOnly': 'Date only (no time slots)',
  'settings.slotInterval': 'Time slot length (minutes)',
  'settings.slotIntervalInfo': 'Changes slot start times; customer hold reservations are kept.',
  'settings.slotBuffer': 'Buffer between slots (minutes)',
  'settings.slotCapacity': 'Orders per slot (0 = unlimited)',
  'settings.customSlotLabels': 'Custom slot labels',
  'settings.customSlotLabelsInfo': 'Replaces the HH:mm display with a friendly name like "Morning delivery".',
  'settings.offerDelivery': 'Offer delivery',
  'settings.offerPickup': 'Offer pickup',
  'settings.bothMethodsInfo': 'Offering both delivery and pickup is a Pro feature.',
  'settings.pickupLocationName': 'Pickup location name',
  'settings.pickupAddress': 'Pickup address',
  'settings.pickupInstructions': 'Pickup instructions',
  'settings.deliveryNote': 'Delivery note shown to customers',
  'settings.weeklyHours': 'Weekly hours',
  'settings.specialHours': 'Special hours for specific dates',
  'settings.blockedDates': 'Blocked dates',
  'settings.blockedDatesMethod': 'Blocked dates ({method} only)',
  'settings.dailyCapacity': 'Orders per day (0 = unlimited)',
  'settings.yearlyHolidays': 'Yearly holidays',
  'settings.yearlyHolidaysInfo': 'Repeat every year on the same month and day (MM-DD).',
  'settings.holidayName': 'Holiday name',
  'settings.monthDay': 'Month and day',
  'settings.addHoliday': 'Add holiday',
  'settings.vacations': 'Vacation / closure periods',
  'settings.vacationsInfo': 'Closures always win over special opening hours and product rules.',
  'settings.closureLabel': 'Label (optional)',
  'settings.addClosure': 'Add closure period',
  'settings.to': 'to',
  'settings.emailWarningTitle': "Email delivery isn't active yet",
  'settings.emailWarning': 'These preferences are saved now, but no emails are sent until the Wix email API this app will use has been verified for your site. Orders that need attention always appear on the Overview and Orders pages.',
  'settings.notifCustomerScheduled': 'Customer: order scheduled',
  'settings.notifMerchantNewOrder': 'Merchant: new scheduled order',
  'settings.notifScheduleChanged': 'Customer: schedule changed by you',
  'settings.notifNeedsReview': 'Merchant: schedule needs review',
  'settings.notifUpcomingSummary': 'Merchant: upcoming fulfilment summary',
  'settings.merchantEmail': 'Merchant notification email',
  'settings.font': 'Font',
  'settings.fontNote': 'Web-safe fonts only, so the widget never waits for a font download at checkout.',
  'settings.fontSize': 'Font size (px)',
  'settings.fontWeight': 'Font weight',
  'settings.customColors': 'Use my own colors',
  'settings.customColorsInfo': 'When off, the widget follows the colors and corner radius of your checkout theme.',
  'settings.colorText': 'Text',
  'settings.colorBg': 'Background',
  'settings.colorBorder': 'Borders',
  'settings.colorAccent': 'Accent (selected)',
  'settings.colorAccentText': 'Text on accent',
  'settings.radius': 'Corner radius (px)',
  'settings.spacing': 'Spacing (px)',
  'settings.slotStyle': 'Selected slot style',
  'settings.slotStyleFilled': 'Filled',
  'settings.slotStyleOutline': 'Outline',
  'settings.defaultLang': 'Default language',
  'settings.dateFormat': 'Date format',
  'settings.timeFormat': 'Time format',
  'settings.time12': '12-hour',
  'settings.time24': '24-hour',
  'settings.customText': 'Custom text ({locale})',
  'settings.customTextInfo': 'Leave a field blank to use the default text.',
  'settings.closed': 'Closed',
  'settings.noDates': 'No dates',
  'settings.noSpecialHours': 'No special hours',
  'settings.addDate': 'Add a date',
  'settings.addSpecialHours': 'Add special hours',
  'settings.addHours': 'Add hours',
  'settings.remove': 'Remove',
  'plan.current': 'Current plan',
  'plan.basic': 'Basic',
  'plan.pro': 'Pro',
  'plan.unverified': "We couldn't confirm your plan right now, so Basic limits apply.",
  'plan.renews': 'Renews or ends {date}.',
  'plan.proAdds': 'Pro adds:',
  'plan.upgradeNote': 'To upgrade, open Delivery Scheduler from Manage Apps in your site dashboard and choose Upgrade.',
  'plan.f1': 'Delivery and pickup together',
  'plan.f2': 'Product preparation times, methods and custom hours',
  'plan.f3': 'Per-slot and per-day capacity',
  'plan.f4': 'Booking more than 30 days ahead',
  'plan.f5': 'Custom slot labels and customer-facing text',
  'plan.f6': 'CSV export',
  'help.title': 'Help & diagnostics',
  'help.subtitle': 'Integration health, failed order events and recovery.',
  'help.runReconcile': 'Run reconciliation',
  'help.reconcileRunning': 'Reconciling…',
  'help.reconcileSuccess': 'Released {holds} expired hold(s); recovered {recovered} of {total} failed event(s).',
  'help.reconcileFailed': 'Reconciliation failed. Please try again.',
  'help.loadErrorTitle': "Couldn't load diagnostics",
  'help.retry': 'Retry',
  'help.failedEvents': 'Failed order events',
  'help.deadLetter': 'Events that stopped retrying',
  'help.pendingHolds': 'Active checkout holds',
  'help.reservationsReview': 'Reservations needing review',
  'help.settingsRevision': 'Settings revision',
  'help.settingsNotActive': 'Settings are not active',
  'help.settingsNotActiveInfo': 'Settings have never been saved, or the stored settings no longer pass validation. Open Settings and save to fix this.',
  'help.lastEvent': 'Last processed order event',
  'help.noEvents': 'No order events received yet',
  'help.failedCardTitle': 'Failed events',
  'help.failedCardSubtitle': 'Run reconciliation to retry them against the current order.',
  'help.noFailures': 'No failures.',
  'help.colEvent': 'Event',
  'help.colOrder': 'Order',
  'help.colAttempts': 'Attempts',
  'help.colLastAttempt': 'Last attempt',
  'help.colError': 'Error',
  'help.howItWorks': 'How it works',
  'help.howItWorks1': 'Customers pick a time in the delivery step of checkout. The time is held for a few minutes while they pay.',
  'help.howItWorks2': 'When Wix creates the order, the hold is confirmed against it. Canceled orders release their capacity.',
  'help.howItWorks3': 'If scheduling is required, checkout is blocked until a valid time is chosen.',
  'help.howItWorks4': 'Data: the app stores only scheduling records (no payment details). Uninstalling the app removes its collections from your site.',
  'help.colStatus': 'Status',
  'help.colReceived': 'Received',
  'common.save': 'Save',
  'common.saving': 'Saving…',
  'common.cancel': 'Cancel',
  'common.retry': 'Retry',
  'common.none': 'None',
  'common.na': '—',
  'common.delivery': 'Delivery',
  'common.pickup': 'Pickup',
  'common.scheduled': 'Scheduled',
  'common.preparing': 'Preparing',
  'common.ready': 'Ready',
  'common.outForDelivery': 'Out for delivery',
  'common.completed': 'Completed',
  'common.needsReview': 'Needs review',
  'common.missingSchedule': 'Missing schedule',
  'common.cancelled': 'Cancelled',
  'common.initialized': 'Initialized',
  'common.approved': 'Approved',
  'common.pending': 'Pending',
  'common.canceled': 'Canceled',
  'common.rejected': 'Rejected',
  'common.notPaid': 'Not paid',
  'common.paid': 'Paid',
  'common.partiallyPaid': 'Partially paid',
  'common.partiallyRefunded': 'Partially refunded',
  'common.refunded': 'Refunded',
  'common.pendingMerchant': 'Pending merchant',
  'common.notFulfilled': 'Not fulfilled',
  'common.partiallyFulfilled': 'Partially fulfilled',
  'common.fulfilled': 'Fulfilled',
  'common.monday': 'Monday',
  'common.tuesday': 'Tuesday',
  'common.wednesday': 'Wednesday',
  'common.thursday': 'Thursday',
  'common.friday': 'Friday',
  'common.saturday': 'Saturday',
  'common.sunday': 'Sunday',
};

// Helper to create translations with complete coverage and fallback to English
function createTranslation(overrides: Partial<DashboardMessages>): DashboardMessages {
  return { ...DASHBOARD_EN, ...overrides };
}

export const DASHBOARD_ES = createTranslation({
  'nav.overview': 'Resumen',
  'nav.orders': 'Pedidos',
  'nav.productRules': 'Reglas de producto',
  'nav.settings': 'Ajustes',
  'nav.help': 'Ayuda y diagnóstico',
  'nav.language': 'Idioma',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'El cumplimiento de hoy de un vistazo.',
  'overview.addToCheckout': 'Añadir al checkout',
  'overview.addingToCheckout': 'Añadiendo al checkout…',
  'overview.addedToCheckout': 'Añadido a tu página de checkout.',
  'overview.addFailed': 'No se pudo añadir el widget. Puede que ya esté en tu página de checkout.',
  'overview.loadError': 'Error al cargar el resumen',
  'overview.deliveriesToday': 'Entregas de hoy',
  'overview.pickupsToday': 'Recogidas de hoy',
  'overview.pendingReview': 'Pendiente de revisión',
  'overview.nextSlot': 'Siguiente horario',
  'overview.nextSlotNone': 'Ninguno hoy',
  'overview.todayOrders': 'Pedidos programados para hoy',
  'overview.viewAllOrders': 'Ver todos los pedidos',
  'overview.noOrdersToday': 'No hay pedidos programados para hoy todavía.',
  'overview.colOrder': 'Pedido',
  'overview.colCustomer': 'Cliente',
  'overview.colMethod': 'Método',
  'overview.colSlot': 'Franja horaria',
  'overview.colStatus': 'Estado',
  'offline.title': 'La programación está desactivada',
  'offline.description': 'Los clientes no pueden elegir fecha y hora de entrega o recogida en el checkout hasta que se active la programación.',
  'offline.cta': 'Activar en Ajustes',
  'orders.title': 'Pedidos programados',
  'orders.subtitle': 'Gestiona y actualiza los horarios de entrega y recogida de los clientes.',
  'orders.exportCsv': 'Exportar CSV',
  'orders.exporting': 'Exportando…',
  'orders.exportFailed': 'Error al exportar pedidos',
  'orders.updateStatus': 'Actualizar estado',
  'orders.searchPlaceholder': 'Buscar por nº de pedido o nombre de cliente',
  'orders.emptyTitle': 'No hay pedidos programados todavía',
  'orders.emptySubtitle': 'Cuando los clientes elijan una fecha y hora al tramitar el pedido, sus pedidos aparecerán aquí.',
  'orders.noResultsTitle': 'Ningún pedido coincide con tus filtros',
  'orders.noResultsSubtitle': 'Prueba a ampliar el rango de fechas o limpiar los filtros.',
  'orders.errorTitle': 'No se pudieron cargar los pedidos',
  'orders.retry': 'Reintentar',
  'orders.colOrder': 'Pedido',
  'orders.colCustomer': 'Cliente',
  'orders.colMethod': 'Método',
  'orders.colScheduled': 'Hora programada',
  'orders.colStatus': 'Estado de entrega',
  'orders.colPayment': 'Pago',
  'orders.colFulfillment': 'Preparación',
  'orders.filterMethod': 'Método',
  'orders.filterScheduleStatus': 'Estado de entrega',
  'orders.filterOrderStatus': 'Estado del pedido',
  'orders.filterPaymentStatus': 'Estado del pago',
  'orders.filterFulfillmentStatus': 'Estado de preparación',
  'orders.filterScheduledDate': 'Fecha programada',
  'orders.bulkUpdated': 'Se actualizaron {count} pedido(s)',
  'orders.bulkFailed': 'Error al actualizar los pedidos',
  'orderDetail.title': 'Pedido programado',
  'orderDetail.fulfilmentTitle': 'Cumplimiento',
  'orderDetail.fulfilmentSubtitle': 'Los cambios solo se aplican al registro de programación de la app.',
  'orderDetail.rescheduleTitle': 'Reprogramar',
  'orderDetail.rescheduleSubtitle': 'La capacidad para el nuevo horario se reserva antes de liberar el anterior.',
  'orderDetail.summaryTitle': 'Pedido',
  'orderDetail.merchantNotes': 'Notas internas',
  'orderDetail.notesLimit': 'Mantén las notas en menos de 2000 caracteres',
  'orderDetail.statusField': 'Estado de cumplimiento',
  'orderDetail.statusFieldInfo': 'Programa el pedido (o restáuralo) antes de cambiar su estado.',
  'orderDetail.chooseStatus': 'Elige un estado',
  'orderDetail.chooseMethod': 'Elige un método',
  'orderDetail.chooseDate': 'Elige una fecha',
  'orderDetail.chooseSlot': 'Elige una franja horaria',
  'orderDetail.rescheduleCancelled': 'Este pedido fue cancelado y ya no se puede reprogramar.',
  'orderDetail.scheduledFor': 'Programado para',
  'orderDetail.notScheduled': 'No programado',
  'orderDetail.method': 'Método',
  'orderDetail.customer': 'Cliente',
  'orderDetail.items': 'Artículos',
  'orderDetail.statusLine': 'Pedido / pago / preparación',
  'orderDetail.reservation': 'Reserva',
  'orderDetail.none': 'Ninguna',
  'orderDetail.lastSynced': 'Última sincronización',
  'orderDetail.openWixOrder': 'Abrir pedido en Wix',
  'orderDetail.saveSuccess': 'Programación actualizada',
  'orderDetail.saveError': 'Error al actualizar el pedido',
  'orderDetail.anyTime': 'Cualquier hora',
  'productRules.title': 'Reglas de producto',
  'productRules.subtitle': 'Tiempo de preparación, métodos permitidos y programación obligatoria por producto (Pro).',
  'productRules.addRule': 'Añadir regla de producto',
  'productRules.searchPlaceholder': 'Buscar por nombre de producto',
  'productRules.emptyTitle': 'No hay reglas de producto todavía',
  'productRules.emptySubtitle': 'Sin reglas, todos los productos siguen tu horario general.',
  'productRules.noResultsTitle': 'Ninguna regla coincide',
  'productRules.noResultsSubtitle': 'La búsqueda coincide con partes del nombre del producto.',
  'productRules.errorTitle': 'No se pudieron cargar las reglas de producto',
  'productRules.colProduct': 'Producto',
  'productRules.colPrep': 'Tiempo de preparación',
  'productRules.colMethods': 'Métodos permitidos',
  'productRules.colRequired': 'Programación',
  'productRules.colStatus': 'Estado',
  'productRules.both': 'Ambos',
  'productRules.active': 'Activa',
  'productRules.disabled': 'Desactivada',
  'productRules.none': 'Ninguno',
  'productRules.days': '{count} día(s)',
  'productRules.hours': '{count} hora(s)',
  'productRules.minutes': '{count} min',
  'productRules.newRuleTitle': 'Nueva regla de producto',
  'productRules.editRuleTitle': 'Editar regla de producto',
  'productRules.productSection': 'Producto',
  'productRules.ruleSection': 'Ajustes de la regla',
  'productRules.chooseProduct': 'Elige un producto',
  'productRules.ruleActive': 'Regla activa',
  'productRules.ruleActiveInfo': 'Mientras esté inactiva, este producto sigue el horario general.',
  'productRules.extraPrep': 'Tiempo de preparación adicional (horas)',
  'productRules.allowedMethods': 'Métodos de entrega permitidos',
  'productRules.requireScheduling': 'Requerir siempre programación cuando este producto esté en el carrito',
  'productRules.customHours': 'Horario personalizado para este producto',
  'productRules.saveSuccess': 'Regla de producto guardada',
  'productRules.saveError': 'Error al guardar la regla de producto',
  'productRules.searchProduct': 'Buscar productos de la tienda…',
  'productRules.noProductsFound': 'No se encontraron productos',
  'productRules.changeProduct': 'Cambiar',
  'settings.title': 'Ajustes',
  'settings.subtitle': 'Entrega, recogida, capacidad y apariencia del widget en el checkout.',
  'settings.saveSuccess': 'Ajustes guardados',
  'settings.saveError': 'Error al guardar los ajustes',
  'settings.general': 'General',
  'settings.schedule': 'Horarios y capacidad',
  'settings.closures': 'Cierres y festivos',
  'settings.delivery': 'Entrega',
  'settings.pickup': 'Recogida',
  'settings.notifications': 'Notificaciones',
  'settings.appearance': 'Apariencia y textos',
  'settings.reset': 'Restablecer',
  'settings.resetSubtitle': 'Restablece todos los ajustes a los valores predeterminados excepto la zona horaria.',
  'settings.resetButton': 'Restablecer a valores por defecto',
  'settings.previewTitle': 'Vista previa para el cliente',
  'settings.previewNote': 'Fechas de muestra según tu configuración actual.',
  'settings.planTitle': 'Plan',
  'settings.enabled': 'Programación activada',
  'settings.enabledInfo': 'Mientras esté desactivada, el widget de checkout no será visible.',
  'settings.requirement': 'Requisito de programación',
  'settings.reqAll': 'Obligatorio para todos los pedidos con productos',
  'settings.reqSelected': 'Obligatorio solo para productos con regla que lo exija',
  'settings.reqOptional': 'Opcional',
  'settings.timezone': 'Zona horaria de la tienda',
  'settings.timezoneInfo': 'Todas las fechas y límites se calculan en esta zona.',
  'settings.holdMinutes': 'Retener horario seleccionado durante (minutos)',
  'settings.holdMinutesInfo': 'La capacidad se reserva mientras el cliente completa el pago.',
  'settings.minNotice': 'Antelación mínima (horas)',
  'settings.maxDaysAhead': 'Reservar hasta (días por adelantado)',
  'settings.sameDay': 'Permitir pedidos para el mismo día',
  'settings.cutoff': 'Hora límite diaria para pedidos',
  'settings.cutoffInfo': 'Los pedidos tras esta hora se tratan como pedidos para el día siguiente.',
  'settings.cutoffTime': 'Hora límite (HH:mm, hora de la tienda)',
  'settings.customerChooses': 'El cliente elige',
  'settings.modeSlots': 'Franjas horarias específicas',
  'settings.modeDateOnly': 'Solo fecha (sin franjas horarias)',
  'settings.slotInterval': 'Duración de la franja (minutos)',
  'settings.slotIntervalInfo': 'Cambia la hora de inicio de las franjas.',
  'settings.slotBuffer': 'Margen entre franjas (minutos)',
  'settings.slotCapacity': 'Capacidad por franja (0 = ilimitada)',
  'settings.customSlotLabels': 'Etiquetas personalizadas para franjas',
  'settings.customSlotLabelsInfo': 'Reemplaza el horario HH:mm por un nombre como "Entrega de mañana".',
  'settings.offerDelivery': 'Ofrecer entrega',
  'settings.offerPickup': 'Ofrecer recogida',
  'settings.bothMethodsInfo': 'Ofrecer entrega y recogida a la vez es una función Pro.',
  'settings.pickupLocationName': 'Nombre del punto de recogida',
  'settings.pickupAddress': 'Dirección de recogida',
  'settings.pickupInstructions': 'Instrucciones para la recogida',
  'settings.deliveryNote': 'Nota de entrega para los clientes',
  'settings.weeklyHours': 'Horario semanal',
  'settings.specialHours': 'Horarios especiales para fechas concretas',
  'settings.blockedDates': 'Fechas bloqueadas',
  'settings.blockedDatesMethod': 'Fechas bloqueadas (solo {method})',
  'settings.dailyCapacity': 'Pedidos máximos por día (0 = ilimitado)',
  'settings.yearlyHolidays': 'Festivos anuales',
  'settings.yearlyHolidaysInfo': 'Se repiten cada año en el mismo mes y día (MM-DD).',
  'settings.holidayName': 'Nombre del festivo',
  'settings.monthDay': 'Mes y día',
  'settings.addHoliday': 'Añadir festivo',
  'settings.vacations': 'Periodos de vacaciones / cierre',
  'settings.vacationsInfo': 'Los cierres tienen prioridad sobre cualquier otro horario.',
  'settings.closureLabel': 'Etiqueta (opcional)',
  'settings.addClosure': 'Añadir periodo de cierre',
  'settings.to': 'hasta',
  'settings.emailWarningTitle': 'El envío de emails aún no está activo',
  'settings.emailWarning': 'Estas preferencias quedan guardadas, pero los correos se activarán en una versión futura.',
  'settings.notifCustomerScheduled': 'Cliente: pedido programado',
  'settings.notifMerchantNewOrder': 'Vendedor: nuevo pedido programado',
  'settings.notifScheduleChanged': 'Cliente: horario modificado por el vendedor',
  'settings.notifNeedsReview': 'Vendedor: pedido necesita revisión',
  'settings.notifUpcomingSummary': 'Vendedor: resumen de próximas entregas',
  'settings.merchantEmail': 'Correo de notificaciones del vendedor',
  'settings.font': 'Tipografía',
  'settings.fontNote': 'Fuentes web estándar seguras para un checkout ultrarrápido.',
  'settings.fontSize': 'Tamaño de fuente (px)',
  'settings.fontWeight': 'Grosor de fuente',
  'settings.customColors': 'Usar mis propios colores',
  'settings.customColorsInfo': 'Si está desactivado, hereda los colores del tema de checkout.',
  'settings.colorText': 'Texto',
  'settings.colorBg': 'Fondo',
  'settings.colorBorder': 'Bordes',
  'settings.colorAccent': 'Color de énfasis (seleccionado)',
  'settings.colorAccentText': 'Texto sobre énfasis',
  'settings.radius': 'Radio de borde (px)',
  'settings.spacing': 'Espaciado (px)',
  'settings.slotStyle': 'Estilo de franja seleccionada',
  'settings.slotStyleFilled': 'Relleno',
  'settings.slotStyleOutline': 'Contorno',
  'settings.defaultLang': 'Idioma predeterminado',
  'settings.dateFormat': 'Formato de fecha',
  'settings.timeFormat': 'Formato de hora',
  'settings.time12': '12 horas',
  'settings.time24': '24 horas',
  'settings.customText': 'Texto personalizado ({locale})',
  'settings.customTextInfo': 'Deja el campo en blanco para usar el texto por defecto.',
  'settings.closed': 'Cerrado',
  'settings.noDates': 'Sin fechas',
  'settings.noSpecialHours': 'Sin horarios especiales',
  'settings.addDate': 'Añadir fecha',
  'settings.addSpecialHours': 'Añadir horario especial',
  'settings.addHours': 'Añadir horas',
  'settings.remove': 'Eliminar',
  'plan.current': 'Plan actual',
  'plan.basic': 'Básico',
  'plan.pro': 'Pro',
  'plan.unverified': 'No pudimos verificar tu plan; aplican los límites Básicos.',
  'plan.renews': 'Renueva o finaliza el {date}.',
  'plan.proAdds': 'Pro incluye:',
  'plan.upgradeNote': 'Para mejorar, abre Delivery Scheduler en Administrar apps y elige Mejorar.',
  'plan.f1': 'Entrega y recogida simultáneas',
  'plan.f2': 'Tiempos de preparación y métodos por producto',
  'plan.f3': 'Capacidad por franja y por día',
  'plan.f4': 'Reservas con más de 30 días de antelación',
  'plan.f5': 'Etiquetas personalizadas y textos editables',
  'plan.f6': 'Exportación a CSV',
  'help.title': 'Ayuda y diagnóstico',
  'help.subtitle': 'Salud de la integración, eventos fallidos y recuperación.',
  'help.runReconcile': 'Ejecutar reconciliación',
  'help.reconcileRunning': 'Reconciliando…',
  'help.reconcileSuccess': 'Se liberaron {holds} reservas expiradas; recuperados {recovered} de {total} eventos.',
  'help.reconcileFailed': 'Error en la reconciliación. Inténtalo de nuevo.',
  'help.loadErrorTitle': 'No se pudo cargar el diagnóstico',
  'help.retry': 'Reintentar',
  'help.failedEvents': 'Eventos de pedidos fallidos',
  'help.deadLetter': 'Eventos sin más reintentos',
  'help.pendingHolds': 'Reservas activas en checkout',
  'help.reservationsReview': 'Reservas que necesitan revisión',
  'help.settingsRevision': 'Revisión de ajustes',
  'help.settingsNotActive': 'Los ajustes no están activos',
  'help.settingsNotActiveInfo': 'Los ajustes nunca se han guardado o no pasan la validación.',
  'help.lastEvent': 'Último evento procesado',
  'help.noEvents': 'No hay eventos recibidos todavía',
  'help.failedCardTitle': 'Eventos fallidos',
  'help.failedCardSubtitle': 'Ejecuta la reconciliación para reintentarlos contra el pedido actual.',
  'help.noFailures': 'Sin fallos.',
  'help.colEvent': 'Evento',
  'help.colOrder': 'Pedido',
  'help.colAttempts': 'Intentos',
  'help.colLastAttempt': 'Último intento',
  'help.colError': 'Error',
  'common.save': 'Guardar',
  'common.saving': 'Guardando…',
  'common.cancel': 'Cancelar',
  'common.retry': 'Reintentar',
  'common.none': 'Ninguno',
  'common.na': '—',
  'common.delivery': 'Entrega',
  'common.pickup': 'Recogida',
  'common.scheduled': 'Programado',
  'common.preparing': 'En preparación',
  'common.ready': 'Listo',
  'common.outForDelivery': 'En reparto',
  'common.completed': 'Completado',
  'common.needsReview': 'Requiere revisión',
  'common.missingSchedule': 'Sin horario',
  'common.cancelled': 'Cancelado',
  'common.initialized': 'Iniciado',
  'common.approved': 'Aprobado',
  'common.pending': 'Pendiente',
  'common.canceled': 'Cancelado',
  'common.rejected': 'Rechazado',
  'common.notPaid': 'No pagado',
  'common.paid': 'Pagado',
  'common.partiallyPaid': 'Parcialmente pagado',
  'common.partiallyRefunded': 'Reembolsado parcialmente',
  'common.refunded': 'Reembolsado',
  'common.pendingMerchant': 'Pendiente del comerciante',
  'common.notFulfilled': 'No preparado',
  'common.partiallyFulfilled': 'Parcialmente preparado',
  'common.fulfilled': 'Preparado',
  'common.monday': 'Lunes',
  'common.tuesday': 'Martes',
  'common.wednesday': 'Miércoles',
  'common.thursday': 'Jueves',
  'common.friday': 'Viernes',
  'common.saturday': 'Sábado',
  'common.sunday': 'Domingo',
});

export const DASHBOARD_FR = createTranslation({
  'nav.overview': 'Aperçu',
  'nav.orders': 'Commandes',
  'nav.productRules': 'Règles produits',
  'nav.settings': 'Paramètres',
  'nav.help': 'Aide & diagnostics',
  'nav.language': 'Langue',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Vos livraisons et retraits du jour en un coup d’œil.',
  'overview.addToCheckout': 'Ajouter au paiement',
  'overview.addingToCheckout': 'Ajout en cours…',
  'overview.addedToCheckout': 'Ajouté à votre page de paiement.',
  'overview.addFailed': 'Impossible d’ajouter le widget. Il est peut-être déjà présent.',
  'overview.loadError': 'Échec du chargement de l’aperçu',
  'overview.deliveriesToday': 'Livraisons du jour',
  'overview.pickupsToday': 'Retraits du jour',
  'overview.pendingReview': 'En attente de révision',
  'overview.nextSlot': 'Prochain créneau',
  'overview.nextSlotNone': 'Aucun aujourd’hui',
  'overview.todayOrders': 'Commandes planifiées aujourd’hui',
  'overview.viewAllOrders': 'Voir toutes les commandes',
  'overview.noOrdersToday': 'Aucune commande planifiée pour aujourd’hui.',
  'overview.colOrder': 'Commande',
  'overview.colCustomer': 'Client',
  'overview.colMethod': 'Mode',
  'overview.colSlot': 'Créneau',
  'overview.colStatus': 'Statut',
  'offline.title': 'La planification est actuellement désactivée',
  'offline.description': 'Les clients ne peuvent pas choisir de créneau au paiement tant que la planification est coupée.',
  'offline.cta': 'Activer dans les Paramètres',
  'orders.title': 'Commandes planifiées',
  'orders.subtitle': 'Gérez et mettez à jour les horaires de livraison et de retrait.',
  'orders.exportCsv': 'Exporter en CSV',
  'orders.exporting': 'Exportation…',
  'orders.exportFailed': 'Échec de l’export des commandes',
  'orders.updateStatus': 'Mettre à jour le statut',
  'orders.searchPlaceholder': 'Rechercher par nº de commande ou nom client',
  'orders.emptyTitle': 'Aucune commande planifiée pour le moment',
  'orders.emptySubtitle': 'Lorsque les clients choisissent un créneau, leurs commandes apparaissent ici.',
  'orders.noResultsTitle': 'Aucune commande ne correspond aux filtres',
  'orders.noResultsSubtitle': 'Essayez d’élargir la plage de dates ou d’effacer les filtres.',
  'orders.errorTitle': 'Impossible de charger les commandes',
  'orders.retry': 'Réessayer',
  'orders.colOrder': 'Commande',
  'orders.colCustomer': 'Client',
  'orders.colMethod': 'Mode',
  'orders.colScheduled': 'Heure planifiée',
  'orders.colStatus': 'Statut planification',
  'orders.colPayment': 'Paiement',
  'orders.colFulfillment': 'Traitement',
  'orders.filterMethod': 'Mode',
  'orders.filterScheduleStatus': 'Statut planification',
  'orders.filterOrderStatus': 'Statut de commande',
  'orders.filterPaymentStatus': 'Statut du paiement',
  'orders.filterFulfillmentStatus': 'Statut du traitement',
  'orders.filterScheduledDate': 'Date planifiée',
  'orders.bulkUpdated': '{count} commande(s) mise(s) à jour',
  'orders.bulkFailed': 'Échec de la mise à jour des commandes',
  'orderDetail.title': 'Commande planifiée',
  'orderDetail.fulfilmentTitle': 'Traitement',
  'orderDetail.fulfilmentSubtitle': 'Les modifications ne s’appliquent qu’à la planification de l’app.',
  'orderDetail.rescheduleTitle': 'Reprogrammer',
  'orderDetail.rescheduleSubtitle': 'La capacité du nouveau créneau est réservée avant de libérer l’ancien.',
  'orderDetail.summaryTitle': 'Commande',
  'orderDetail.merchantNotes': 'Notes internes',
  'orderDetail.notesLimit': 'Moins de 2000 caractères',
  'orderDetail.statusField': 'Statut de traitement',
  'orderDetail.statusFieldInfo': 'Planifiez la commande avant de modifier son statut.',
  'orderDetail.chooseStatus': 'Choisir un statut',
  'orderDetail.chooseMethod': 'Choisir un mode',
  'orderDetail.chooseDate': 'Choisir une date',
  'orderDetail.chooseSlot': 'Choisir un créneau',
  'orderDetail.rescheduleCancelled': 'Cette commande a été annulée et ne peut plus être reprogrammée.',
  'orderDetail.scheduledFor': 'Planifié pour',
  'orderDetail.notScheduled': 'Non planifié',
  'orderDetail.method': 'Mode',
  'orderDetail.customer': 'Client',
  'orderDetail.items': 'Articles',
  'orderDetail.statusLine': 'Commande / paiement / traitement',
  'orderDetail.reservation': 'Réservation',
  'orderDetail.none': 'Aucune',
  'orderDetail.lastSynced': 'Dernière synchro',
  'orderDetail.openWixOrder': 'Ouvrir la commande Wix',
  'orderDetail.saveSuccess': 'Planification mise à jour',
  'orderDetail.saveError': 'Échec de la mise à jour',
  'orderDetail.anyTime': 'À tout moment',
  'settings.title': 'Paramètres',
  'settings.subtitle': 'Livraison, retrait, capacité et apparence du widget au paiement.',
  'settings.saveSuccess': 'Paramètres enregistrés',
  'settings.saveError': 'Échec de l’enregistrement des paramètres',
  'settings.general': 'Général',
  'settings.schedule': 'Horaires & capacité',
  'settings.closures': 'Fermetures & jours fériés',
  'settings.delivery': 'Livraison',
  'settings.pickup': 'Retrait',
  'settings.notifications': 'Notifications',
  'settings.appearance': 'Apparence & textes',
  'settings.reset': 'Réinitialiser',
  'settings.resetSubtitle': 'Restaure tous les paramètres par défaut sauf le fuseau horaire.',
  'settings.resetButton': 'Rétablir les valeurs par défaut',
  'settings.previewTitle': 'Aperçu client',
  'settings.previewNote': 'Dates d’exemple selon vos paramètres actuels.',
  'settings.planTitle': 'Forfait',
  'settings.enabled': 'Planification activée',
  'settings.enabledInfo': 'Lorsque désactivé, le widget est masqué au paiement.',
  'settings.requirement': 'Obligation de planification',
  'settings.reqAll': 'Obligatoire pour toutes les commandes de produits',
  'settings.reqSelected': 'Obligatoire uniquement pour les produits avec règle dédiée',
  'settings.reqOptional': 'Optionnel',
  'settings.timezone': 'Fuseau horaire de la boutique',
  'settings.timezoneInfo': 'Toutes les heures et limites sont calculées selon ce fuseau.',
  'settings.holdMinutes': 'Conserver le créneau sélectionné pendant (minutes)',
  'settings.holdMinutesInfo': 'Le créneau est réservé le temps que le client termine sa commande.',
  'settings.minNotice': 'Délai de prévenance minimum (heures)',
  'settings.maxDaysAhead': 'Réservation à l’avance (jours max)',
  'settings.sameDay': 'Autoriser les commandes le jour même',
  'settings.cutoff': 'Heure limite journalière',
  'settings.cutoffInfo': 'Les commandes passées après cette heure comptent pour le lendemain.',
  'settings.cutoffTime': 'Heure limite (HH:mm, heure boutique)',
  'settings.customerChooses': 'Le client choisit',
  'settings.modeSlots': 'Créneaux horaires précis',
  'settings.modeDateOnly': 'Date uniquement (sans créneau horaire)',
  'settings.slotInterval': 'Durée du créneau (minutes)',
  'settings.slotIntervalInfo': 'Modifie les heures de début des créneaux.',
  'settings.slotBuffer': 'Intervalle tampon entre créneaux (minutes)',
  'settings.slotCapacity': 'Commandes par créneau (0 = illimité)',
  'settings.customSlotLabels': 'Noms personnalisés de créneaux',
  'settings.customSlotLabelsInfo': 'Remplace HH:mm par un intitulé comme "Livraison du matin".',
  'settings.offerDelivery': 'Proposer la livraison',
  'settings.offerPickup': 'Proposer le retrait',
  'settings.bothMethodsInfo': 'Proposer livraison et retrait simultanément requiert le forfait Pro.',
  'settings.pickupLocationName': 'Nom du point de retrait',
  'settings.pickupAddress': 'Adresse de retrait',
  'settings.pickupInstructions': 'Instructions de retrait',
  'settings.deliveryNote': 'Note de livraison affichée aux clients',
  'settings.weeklyHours': 'Horaires hebdomadaires',
  'settings.specialHours': 'Horaires spécifiques pour certaines dates',
  'settings.blockedDates': 'Dates bloquées',
  'settings.blockedDatesMethod': 'Dates bloquées ({method} uniquement)',
  'settings.dailyCapacity': 'Commandes par jour (0 = illimité)',
  'settings.yearlyHolidays': 'Jours fériés annuels',
  'settings.yearlyHolidaysInfo': 'Répétés chaque année le même jour (MM-JJ).',
  'settings.holidayName': 'Nom du jour férié',
  'settings.monthDay': 'Mois et jour',
  'settings.addHoliday': 'Ajouter un jour férié',
  'settings.vacations': 'Périodes de congés / fermeture',
  'settings.vacationsInfo': 'Les fermetures prévalent toujours sur les autres horaires.',
  'settings.closureLabel': 'Libellé (optionnel)',
  'settings.addClosure': 'Ajouter une période de fermeture',
  'settings.to': 'au',
  'settings.defaultLang': 'Langue par défaut',
  'settings.dateFormat': 'Format de date',
  'settings.timeFormat': 'Format de l’heure',
  'settings.time12': '12 heures',
  'settings.time24': '24 heures',
  'settings.customText': 'Texte personnalisé ({locale})',
  'settings.customTextInfo': 'Laissez vide pour utiliser le texte par défaut.',
  'settings.closed': 'Fermé',
  'settings.noDates': 'Aucune date',
  'settings.noSpecialHours': 'Aucun horaire spécial',
  'settings.addDate': 'Ajouter une date',
  'settings.addSpecialHours': 'Ajouter des horaires spéciaux',
  'settings.addHours': 'Ajouter des heures',
  'settings.remove': 'Supprimer',
  'common.save': 'Enregistrer',
  'common.saving': 'Enregistrement…',
  'common.cancel': 'Annuler',
  'common.retry': 'Réessayer',
  'common.none': 'Aucun',
  'common.na': '—',
  'common.delivery': 'Livraison',
  'common.pickup': 'Retrait',
  'common.scheduled': 'Planifié',
  'common.preparing': 'En préparation',
  'common.ready': 'Prêt',
  'common.outForDelivery': 'En cours de livraison',
  'common.completed': 'Terminé',
  'common.needsReview': 'À réviser',
  'common.missingSchedule': 'Sans créneau',
  'common.cancelled': 'Annulé',
  'common.paid': 'Payé',
  'common.notPaid': 'Non payé',
  'common.fulfilled': 'Traité',
  'common.notFulfilled': 'Non traité',
  'common.monday': 'Lundi',
  'common.tuesday': 'Mardi',
  'common.wednesday': 'Mercredi',
  'common.thursday': 'Jeudi',
  'common.friday': 'Vendredi',
  'common.saturday': 'Samedi',
  'common.sunday': 'Dimanche',
});

export const DASHBOARD_DE = createTranslation({
  'nav.overview': 'Übersicht',
  'nav.orders': 'Bestellungen',
  'nav.productRules': 'Produktregeln',
  'nav.settings': 'Einstellungen',
  'nav.help': 'Hilfe & Diagnose',
  'nav.language': 'Sprache',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Die heutigen Lieferungen und Abholungen im Überblick.',
  'overview.addToCheckout': 'Zum Checkout hinzufügen',
  'overview.addingToCheckout': 'Wird hinzugefügt…',
  'overview.addedToCheckout': 'Zur Checkout-Seite hinzugefügt.',
  'overview.addFailed': 'Widget konnte nicht hinzugefügt werden. Eventuell ist es bereits vorhanden.',
  'overview.loadError': 'Übersicht konnte nicht geladen werden',
  'overview.deliveriesToday': 'Heutige Lieferungen',
  'overview.pickupsToday': 'Heutige Abholungen',
  'overview.pendingReview': 'Prüfung erforderlich',
  'overview.nextSlot': 'Nächstes Zeitfenster',
  'overview.nextSlotNone': 'Keines heute',
  'overview.todayOrders': 'Heute geplante Bestellungen',
  'overview.viewAllOrders': 'Alle Bestellungen anzeigen',
  'overview.noOrdersToday': 'Heute noch keine Bestellungen geplant.',
  'overview.colOrder': 'Bestellung',
  'overview.colCustomer': 'Kunde',
  'overview.colMethod': 'Methode',
  'overview.colSlot': 'Zeitfenster',
  'overview.colStatus': 'Status',
  'offline.title': 'Terminplanung ist derzeit deaktiviert',
  'offline.description': 'Kunden können beim Checkout keine Zeit wählen, solange die Planung inaktiv ist.',
  'offline.cta': 'In den Einstellungen aktivieren',
  'orders.title': 'Geplante Bestellungen',
  'orders.subtitle': 'Liefer- und Abholzeiten der Kunden verwalten und anpassen.',
  'orders.exportCsv': 'CSV exportieren',
  'orders.exporting': 'Wird exportiert…',
  'orders.exportFailed': 'Export fehlgeschlagen',
  'orders.updateStatus': 'Status aktualisieren',
  'orders.searchPlaceholder': 'Nach Bestellnummer oder Kundennamen suchen',
  'orders.emptyTitle': 'Noch keine geplanten Bestellungen',
  'orders.emptySubtitle': 'Sobald Kunden beim Checkout ein Zeitfenster wählen, erscheinen die Bestellungen hier.',
  'orders.noResultsTitle': 'Keine Bestellungen entsprechen den Filtern',
  'orders.noResultsSubtitle': 'Versuchen Sie, den Datumsbereich zu erweitern oder Filter zurückzusetzen.',
  'orders.errorTitle': 'Bestellungen konnten nicht geladen werden',
  'orders.retry': 'Erneut versuchen',
  'settings.title': 'Einstellungen',
  'settings.subtitle': 'Lieferung, Abholung, Kapazitäten und Design des Checkout-Widgets.',
  'settings.saveSuccess': 'Einstellungen gespeichert',
  'settings.saveError': 'Speichern fehlgeschlagen',
  'settings.general': 'Allgemein',
  'settings.schedule': 'Öffnungszeiten & Kapazität',
  'settings.closures': 'Schließtage & Feiertage',
  'settings.delivery': 'Lieferung',
  'settings.pickup': 'Abholung',
  'settings.notifications': 'Benachrichtigungen',
  'settings.appearance': 'Design & Texte',
  'settings.reset': 'Zurücksetzen',
  'settings.resetSubtitle': 'Setzt alle Einstellungen außer der Zeitzone auf Standardwerte zurück.',
  'settings.resetButton': 'Auf Standard zurücksetzen',
  'settings.previewTitle': 'Kundenvorschau',
  'settings.previewNote': 'Beispieldaten basierend auf Ihren aktuellen Einstellungen.',
  'settings.planTitle': 'Tarif',
  'settings.enabled': 'Terminplanung aktiviert',
  'settings.defaultLang': 'Standardsprache',
  'settings.dateFormat': 'Datumsformat',
  'settings.timeFormat': 'Zeitformat',
  'settings.time12': '12-Stunden',
  'settings.time24': '24-Stunden',
  'settings.customText': 'Eigener Text ({locale})',
  'settings.closed': 'Geschlossen',
  'settings.noDates': 'Keine Daten',
  'common.save': 'Speichern',
  'common.saving': 'Speichern…',
  'common.cancel': 'Abbrechen',
  'common.retry': 'Erneut versuchen',
  'common.none': 'Keine',
  'common.na': '—',
  'common.delivery': 'Lieferung',
  'common.pickup': 'Abholung',
  'common.scheduled': 'Geplant',
  'common.preparing': 'In Vorbereitung',
  'common.ready': 'Bereit',
  'common.outForDelivery': 'In Zustellung',
  'common.completed': 'Abgeschlossen',
  'common.needsReview': 'Prüfung nötig',
  'common.missingSchedule': 'Ohne Termin',
  'common.cancelled': 'Storniert',
  'common.paid': 'Bezahlt',
  'common.notPaid': 'Nicht bezahlt',
  'common.fulfilled': 'Ausgeführt',
  'common.notFulfilled': 'Nicht ausgeführt',
  'common.monday': 'Montag',
  'common.tuesday': 'Dienstag',
  'common.wednesday': 'Mittwoch',
  'common.thursday': 'Donnerstag',
  'common.friday': 'Freitag',
  'common.saturday': 'Samstag',
  'common.sunday': 'Sonntag',
});

export const DASHBOARD_PT = createTranslation({
  'nav.overview': 'Visão Geral',
  'nav.orders': 'Encomendas',
  'nav.productRules': 'Regras de produtos',
  'nav.settings': 'Definições',
  'nav.help': 'Ajuda & diagnóstico',
  'nav.language': 'Idioma',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Entregas e recolhas de hoje resumidas.',
  'overview.addToCheckout': 'Adicionar ao checkout',
  'overview.addingToCheckout': 'A adicionar…',
  'overview.addedToCheckout': 'Adicionado à sua página de checkout.',
  'overview.loadError': 'Erro ao carregar a visão geral',
  'overview.deliveriesToday': 'Entregas de hoje',
  'overview.pickupsToday': 'Recolhas de hoje',
  'overview.pendingReview': 'Pendente de revisão',
  'overview.nextSlot': 'Próximo horário',
  'overview.nextSlotNone': 'Nenhum hoje',
  'overview.todayOrders': 'Encomendas agendadas para hoje',
  'overview.viewAllOrders': 'Ver todas as encomendas',
  'overview.noOrdersToday': 'Nenhuma encomenda agendada para hoje.',
  'offline.title': 'O agendamento está desativado',
  'offline.description': 'Os clientes não podem selecionar horários de entrega no checkout enquanto o agendamento estiver desligado.',
  'offline.cta': 'Ativar nas Definições',
  'orders.title': 'Encomendas agendadas',
  'orders.subtitle': 'Faça a gestão dos horários de entrega e recolha dos clientes.',
  'orders.exportCsv': 'Exportar CSV',
  'orders.exporting': 'A exportar…',
  'settings.title': 'Definições',
  'settings.subtitle': 'Entrega, recolha, capacidade e aparência do widget no checkout.',
  'settings.saveSuccess': 'Definições guardadas',
  'settings.saveError': 'Falha ao guardar as definições',
  'settings.general': 'Geral',
  'settings.schedule': 'Horários & capacidade',
  'settings.closures': 'Encerramentos & feriados',
  'settings.delivery': 'Entrega',
  'settings.pickup': 'Recolha',
  'settings.notifications': 'Notificações',
  'settings.appearance': 'Aparência & textos',
  'settings.defaultLang': 'Idioma padrão',
  'common.save': 'Guardar',
  'common.saving': 'A guardar…',
  'common.cancel': 'Cancelar',
  'common.delivery': 'Entrega',
  'common.pickup': 'Recolha',
  'common.scheduled': 'Agendado',
  'common.preparing': 'Em preparação',
  'common.ready': 'Pronto',
  'common.outForDelivery': 'Em distribuição',
  'common.completed': 'Concluído',
  'common.cancelled': 'Cancelado',
  'common.monday': 'Segunda-feira',
  'common.tuesday': 'Terça-feira',
  'common.wednesday': 'Quarta-feira',
  'common.thursday': 'Quinta-feira',
  'common.friday': 'Sexta-feira',
  'common.saturday': 'Sábado',
  'common.sunday': 'Domingo',
});

export const DASHBOARD_IT = createTranslation({
  'nav.overview': 'Panoramica',
  'nav.orders': 'Ordini',
  'nav.productRules': 'Regole prodotto',
  'nav.settings': 'Impostazioni',
  'nav.help': 'Aiuto & diagnostica',
  'nav.language': 'Lingua',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Le consegne e i ritiri di oggi in sintesi.',
  'overview.addToCheckout': 'Aggiungi al checkout',
  'overview.addingToCheckout': 'Aggiunta in corso…',
  'overview.addedToCheckout': 'Aggiunto alla pagina di checkout.',
  'overview.deliveriesToday': 'Consegne di oggi',
  'overview.pickupsToday': 'Ritiri di oggi',
  'overview.pendingReview': 'In attesa di revisione',
  'overview.nextSlot': 'Prossimo orario',
  'overview.nextSlotNone': 'Nessuno oggi',
  'overview.todayOrders': 'Ordini programmati per oggi',
  'overview.viewAllOrders': 'Visualizza tutti gli ordini',
  'offline.title': 'La programmazione è attualmente disattivata',
  'offline.cta': 'Attiva nelle Impostazioni',
  'orders.title': 'Ordini programmati',
  'orders.subtitle': 'Gestisci e aggiorna gli orari di consegna e ritiro dei clienti.',
  'settings.title': 'Impostazioni',
  'settings.saveSuccess': 'Impostazioni salvate',
  'settings.general': 'Generale',
  'settings.schedule': 'Orari & capacità',
  'settings.closures': 'Chiusure & festività',
  'settings.delivery': 'Consegna',
  'settings.pickup': 'Ritiro',
  'settings.notifications': 'Notifiche',
  'settings.appearance': 'Aspetto & testo',
  'settings.defaultLang': 'Lingua predefinita',
  'common.save': 'Salva',
  'common.saving': 'Salvataggio…',
  'common.cancel': 'Annulla',
  'common.delivery': 'Consegna',
  'common.pickup': 'Ritiro',
  'common.scheduled': 'Programmato',
  'common.completed': 'Completato',
  'common.cancelled': 'Annullato',
  'common.monday': 'Lunedì',
  'common.tuesday': 'Martedì',
  'common.wednesday': 'Mercoledì',
  'common.thursday': 'Giovedì',
  'common.friday': 'Venerdì',
  'common.saturday': 'Sabato',
  'common.sunday': 'Domenica',
});

export const DASHBOARD_NL = createTranslation({
  'nav.overview': 'Overzicht',
  'nav.orders': 'Bestellingen',
  'nav.productRules': 'Productregels',
  'nav.settings': 'Instellingen',
  'nav.help': 'Hulp & diagnostiek',
  'nav.language': 'Taal',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'De bezorgingen en afhalingen van vandaag in één oogopslag.',
  'overview.addToCheckout': 'Toevoegen aan checkout',
  'overview.deliveriesToday': 'Bezorgingen vandaag',
  'overview.pickupsToday': 'Afhalingen vandaag',
  'overview.pendingReview': 'Wacht op beoordeling',
  'overview.nextSlot': 'Volgend tijdslot',
  'offline.title': 'Planning is momenteel uitgeschakeld',
  'offline.cta': 'Inschakelen in Instellingen',
  'orders.title': 'Geplande bestellingen',
  'settings.title': 'Instellingen',
  'settings.saveSuccess': 'Instellingen opgeslagen',
  'settings.defaultLang': 'Standaardtaal',
  'common.save': 'Opslaan',
  'common.saving': 'Opslaan…',
  'common.cancel': 'Annuleren',
  'common.delivery': 'Bezorging',
  'common.pickup': 'Afhalen',
  'common.scheduled': 'Gepland',
  'common.completed': 'Voltooid',
  'common.cancelled': 'Geannuleerd',
  'common.monday': 'Maandag',
  'common.tuesday': 'Dinsdag',
  'common.wednesday': 'Woensdag',
  'common.thursday': 'Donderdag',
  'common.friday': 'Vrijdag',
  'common.saturday': 'Zaterdag',
  'common.sunday': 'Zondag',
});

export const DASHBOARD_PL = createTranslation({
  'nav.overview': 'Przegląd',
  'nav.orders': 'Zamówienia',
  'nav.productRules': 'Reguły produktów',
  'nav.settings': 'Ustawienia',
  'nav.help': 'Pomoc i diagnostyka',
  'nav.language': 'Język',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Dzisiejsze dostawy i odbiory w skrócie.',
  'overview.addToCheckout': 'Dodaj do kasy',
  'overview.deliveriesToday': 'Dzisiejsze dostawy',
  'overview.pickupsToday': 'Dzisiejsze odbiory',
  'overview.pendingReview': 'Wymaga przeglądu',
  'offline.title': 'Harmonogram jest obecnie wyłączony',
  'offline.cta': 'Włącz w Ustawieniach',
  'orders.title': 'Zaplanowane zamówienia',
  'settings.title': 'Ustawienia',
  'settings.saveSuccess': 'Ustawienia zapisane',
  'settings.defaultLang': 'Domyślny język',
  'common.save': 'Zapisz',
  'common.saving': 'Zapisywanie…',
  'common.cancel': 'Anuluj',
  'common.delivery': 'Dostawa',
  'common.pickup': 'Odbiór osobisty',
  'common.scheduled': 'Zaplanowano',
  'common.completed': 'Ukończono',
  'common.cancelled': 'Anulowano',
  'common.monday': 'Poniedziałek',
  'common.tuesday': 'Wtorek',
  'common.wednesday': 'Środa',
  'common.thursday': 'Czwartek',
  'common.friday': 'Piątek',
  'common.saturday': 'Sobota',
  'common.sunday': 'Niedziela',
});

export const DASHBOARD_TR = createTranslation({
  'nav.overview': 'Genel Bakış',
  'nav.orders': 'Siparişler',
  'nav.productRules': 'Ürün Kuralları',
  'nav.settings': 'Ayarlar',
  'nav.help': 'Yardım & Tanılama',
  'nav.language': 'Dil',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Bugünkü teslimat ve gel-al durumuna genel bakış.',
  'overview.addToCheckout': 'Ödeme sayfasına ekle',
  'overview.deliveriesToday': 'Bugünkü teslimatlar',
  'overview.pickupsToday': 'Bugünkü gel-al siparişleri',
  'offline.title': 'Zamanlama şu anda kapalı',
  'offline.cta': 'Ayarlardan Etkinleştir',
  'orders.title': 'Planlanmış Siparişler',
  'settings.title': 'Ayarlar',
  'settings.saveSuccess': 'Ayarlar kaydedildi',
  'settings.defaultLang': 'Varsayılan dil',
  'common.save': 'Kaydet',
  'common.saving': 'Kaydediliyor…',
  'common.cancel': 'İptal',
  'common.delivery': 'Teslimat',
  'common.pickup': 'Gel-al',
  'common.scheduled': 'Planlandı',
  'common.completed': 'Tamamlandı',
  'common.cancelled': 'İptal edildi',
  'common.monday': 'Pazartesi',
  'common.tuesday': 'Salı',
  'common.wednesday': 'Çarşamba',
  'common.thursday': 'Perşembe',
  'common.friday': 'Cuma',
  'common.saturday': 'Cumartesi',
  'common.sunday': 'Pazar',
});

export const DASHBOARD_RU = createTranslation({
  'nav.overview': 'Обзор',
  'nav.orders': 'Заказы',
  'nav.productRules': 'Правила для товаров',
  'nav.settings': 'Настройки',
  'nav.help': 'Помощь и диагностика',
  'nav.language': 'Язык',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Доставки и самовывоз на сегодня.',
  'overview.addToCheckout': 'Добавить в чекаут',
  'overview.deliveriesToday': 'Доставок сегодня',
  'overview.pickupsToday': 'Самовывозов сегодня',
  'offline.title': 'Расписание сейчас выключено',
  'offline.cta': 'Включить в Настройках',
  'orders.title': 'Запланированные заказы',
  'settings.title': 'Настройки',
  'settings.saveSuccess': 'Настройки сохранены',
  'settings.defaultLang': 'Язык по умолчанию',
  'common.save': 'Сохранить',
  'common.saving': 'Сохранение…',
  'common.cancel': 'Отмена',
  'common.delivery': 'Доставка',
  'common.pickup': 'Самовывоз',
  'common.scheduled': 'Запланировано',
  'common.completed': 'Выполнено',
  'common.cancelled': 'Отменено',
  'common.monday': 'Понедельник',
  'common.tuesday': 'Вторник',
  'common.wednesday': 'Среда',
  'common.thursday': 'Четверг',
  'common.friday': 'Пятница',
  'common.saturday': 'Суббота',
  'common.sunday': 'Воскресенье',
});

export const DASHBOARD_JA = createTranslation({
  'nav.overview': '概要',
  'nav.orders': '注文一覧',
  'nav.productRules': '商品ルール',
  'nav.settings': '設定',
  'nav.help': 'ヘルプ・診断',
  'nav.language': '言語',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': '本日の配達・受け取り状況',
  'overview.addToCheckout': 'チェックアウトに追加',
  'overview.deliveriesToday': '本日の配達件数',
  'overview.pickupsToday': '本日の店頭受取件数',
  'offline.title': 'スケジュール設定が現在オフです',
  'offline.cta': '設定でオンにする',
  'orders.title': '予約注文一覧',
  'settings.title': '設定',
  'settings.saveSuccess': '設定を保存しました',
  'settings.defaultLang': '既定の言語',
  'common.save': '保存',
  'common.saving': '保存中…',
  'common.cancel': 'キャンセル',
  'common.delivery': '配達',
  'common.pickup': '店頭受け取り',
  'common.scheduled': '予約済み',
  'common.completed': '完了',
  'common.cancelled': 'キャンセル済み',
  'common.monday': '月曜日',
  'common.tuesday': '火曜日',
  'common.wednesday': '水曜日',
  'common.thursday': '木曜日',
  'common.friday': '金曜日',
  'common.saturday': '土曜日',
  'common.sunday': '日曜日',
});

export const DASHBOARD_KO = createTranslation({
  'nav.overview': '개요',
  'nav.orders': '주문 관리',
  'nav.productRules': '상품별 규칙',
  'nav.settings': '설정',
  'nav.help': '도움말 및 진단',
  'nav.language': '언어',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': '오늘의 배송 및 픽업 현황을 한눈에 확인하세요.',
  'overview.addToCheckout': '결제 페이지에 추가',
  'overview.deliveriesToday': '오늘의 배송',
  'overview.pickupsToday': '오늘의 픽업',
  'offline.title': '배송 예약 기능이 꺼져 있습니다',
  'offline.cta': '설정에서 켜기',
  'orders.title': '예약된 주문 목록',
  'settings.title': '설정',
  'settings.saveSuccess': '설정이 저장되었습니다',
  'settings.defaultLang': '기본 언어',
  'common.save': '저장',
  'common.saving': '저장 중…',
  'common.cancel': '취소',
  'common.delivery': '배송',
  'common.pickup': '픽업',
  'common.scheduled': '예약됨',
  'common.completed': '완료됨',
  'common.cancelled': '취소됨',
  'common.monday': '월요일',
  'common.tuesday': '화요일',
  'common.wednesday': '수요일',
  'common.thursday': '목요일',
  'common.friday': '금요일',
  'common.saturday': '토요일',
  'common.sunday': '일요일',
});

export const DASHBOARD_ZH = createTranslation({
  'nav.overview': '概览',
  'nav.orders': '订单管理',
  'nav.productRules': '商品规则',
  'nav.settings': '设置',
  'nav.help': '帮助与诊断',
  'nav.language': '语言',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': '今日配送与自提一览。',
  'overview.addToCheckout': '添加到结账页面',
  'overview.deliveriesToday': '今日配送',
  'overview.pickupsToday': '今日自提',
  'offline.title': '排期功能当前处于关闭状态',
  'offline.cta': '前往设置开启',
  'orders.title': '预约订单',
  'settings.title': '设置',
  'settings.saveSuccess': '设置已保存',
  'settings.defaultLang': '默认语言',
  'common.save': '保存',
  'common.saving': '正在保存…',
  'common.cancel': '取消',
  'common.delivery': '送货上门',
  'common.pickup': '到店自提',
  'common.scheduled': '已预约',
  'common.completed': '已完成',
  'common.cancelled': '已取消',
  'common.monday': '星期一',
  'common.tuesday': '星期二',
  'common.wednesday': '星期三',
  'common.thursday': '星期四',
  'common.friday': '星期五',
  'common.saturday': '星期六',
  'common.sunday': '星期日',
});

export const DASHBOARD_AR = createTranslation({
  'nav.overview': 'نظرة عامة',
  'nav.orders': 'الطلبات',
  'nav.productRules': 'قواعد المنتجات',
  'nav.settings': 'الإعدادات',
  'nav.help': 'المساعدة والتشخيص',
  'nav.language': 'اللغة',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'متابعة مواعيد التوصيل والاستلام لليوم.',
  'overview.addToCheckout': 'إضافة إلى صفحة الدفع',
  'overview.deliveriesToday': 'توصيلات اليوم',
  'overview.pickupsToday': 'طلبات الاستلام اليوم',
  'offline.title': 'جدولة المواعيد معطلة حالياً',
  'offline.cta': 'تفعيل في الإعدادات',
  'orders.title': 'الطلبات المجدولة',
  'settings.title': 'الإعدادات',
  'settings.saveSuccess': 'تم حفظ الإعدادات',
  'settings.defaultLang': 'اللغة الافتراضية',
  'common.save': 'حفظ',
  'common.saving': 'جارٍ الحفظ…',
  'common.cancel': 'إلغاء',
  'common.delivery': 'توصيل',
  'common.pickup': 'استلام',
  'common.scheduled': 'مجدول',
  'common.completed': 'مكتمل',
  'common.cancelled': 'ملغى',
  'common.monday': 'الإثنين',
  'common.tuesday': 'الثلاثاء',
  'common.wednesday': 'الأربعاء',
  'common.thursday': 'الخميس',
  'common.friday': 'الجمعة',
  'common.saturday': 'السبت',
  'common.sunday': 'الأحد',
});

export const DASHBOARD_HE = createTranslation({
  'nav.overview': 'סקירה כללית',
  'nav.orders': 'הזמנות',
  'nav.productRules': 'כללי מוצרים',
  'nav.settings': 'הגדרות',
  'nav.help': 'עזרה ואבחון',
  'nav.language': 'שפה',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'משלוחים ואיסופים להיום במבט מהיר.',
  'overview.addToCheckout': 'הוסף לקופה',
  'overview.deliveriesToday': 'משלוחים היום',
  'overview.pickupsToday': 'איסופים היום',
  'offline.title': 'תזמון משלוחים כבוי כעת',
  'offline.cta': 'הפעל בהגדרות',
  'orders.title': 'הזמנות מתוזמנות',
  'settings.title': 'הגדרות',
  'settings.saveSuccess': 'ההגדרות נשמרו בהצלחה',
  'settings.defaultLang': 'שפת ברירת מחדל',
  'common.save': 'שמור',
  'common.saving': 'שומר…',
  'common.cancel': 'ביטול',
  'common.delivery': 'משלוח',
  'common.pickup': 'איסוף עצמי',
  'common.scheduled': 'מתוזמן',
  'common.completed': 'הושלם',
  'common.cancelled': 'בוטל',
  'common.monday': 'יום שני',
  'common.tuesday': 'יום שלישי',
  'common.wednesday': 'יום רביעי',
  'common.thursday': 'יום חמישי',
  'common.friday': 'יום שישי',
  'common.saturday': 'יום שבת',
  'common.sunday': 'יום ראשון',
});

export const DASHBOARD_HI = createTranslation({
  'nav.overview': 'अवलोकन',
  'nav.orders': 'ऑर्डर',
  'nav.productRules': 'उत्पाद नियम',
  'nav.settings': 'सेटिंग्स',
  'nav.help': 'सहायता और निदान',
  'nav.language': 'भाषा',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'आज की डिलीवरी और पिकअप का संक्षिप्त विवरण।',
  'overview.addToCheckout': 'चेकआउट में जोड़ें',
  'overview.deliveriesToday': 'आज की डिलीवरी',
  'overview.pickupsToday': 'आज के पिकअप',
  'offline.title': 'शेड्यूलिंग वर्तमान में बंद है',
  'offline.cta': 'सेटिंग्स में चालू करें',
  'orders.title': 'शेड्यूल किए गए ऑर्डर',
  'settings.title': 'सेटिंग्स',
  'settings.saveSuccess': 'सेटिंग्स सहेजी गईं',
  'settings.defaultLang': 'डिफ़ॉल्ट भाषा',
  'common.save': 'सहेजें',
  'common.saving': 'सहेजा जा रहा है…',
  'common.cancel': 'रद्द करें',
  'common.delivery': 'डिलीवरी',
  'common.pickup': 'पिकअप',
  'common.scheduled': 'शेड्यूल किया गया',
  'common.completed': 'पूर्ण हुआ',
  'common.cancelled': 'रद्द किया गया',
  'common.monday': 'सोमवार',
  'common.tuesday': 'मंगलवार',
  'common.wednesday': 'बुधवार',
  'common.thursday': 'गुरुवार',
  'common.friday': 'शुक्रवार',
  'common.saturday': 'शनिवार',
  'common.sunday': 'रविवार',
});

export const DASHBOARD_SV = createTranslation({
  'nav.overview': 'Översikt',
  'nav.orders': 'Beställningar',
  'nav.productRules': 'Produktregler',
  'nav.settings': 'Inställningar',
  'nav.help': 'Hjälp & diagnostik',
  'nav.language': 'Språk',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Dagens leveranser och upphämtningar i korthet.',
  'overview.addToCheckout': 'Lägg till i kassan',
  'overview.deliveriesToday': 'Dagens leveranser',
  'overview.pickupsToday': 'Dagens upphämtningar',
  'offline.title': 'Schemaläggning är för närvarande avstängd',
  'offline.cta': 'Aktivera i Inställningar',
  'orders.title': 'Schemalagda beställningar',
  'settings.title': 'Inställningar',
  'settings.saveSuccess': 'Inställningarna sparades',
  'settings.defaultLang': 'Standardspråk',
  'common.save': 'Spara',
  'common.saving': 'Sparar…',
  'common.cancel': 'Avbryt',
  'common.delivery': 'Leverans',
  'common.pickup': 'Upphämtning',
  'common.scheduled': 'Schemalagd',
  'common.completed': 'Slutförd',
  'common.cancelled': 'Avbruten',
  'common.monday': 'Måndag',
  'common.tuesday': 'Tisdag',
  'common.wednesday': 'Onsdag',
  'common.thursday': 'Torsdag',
  'common.friday': 'Fredag',
  'common.saturday': 'Lördag',
  'common.sunday': 'Söndag',
});

export const DASHBOARD_DA = createTranslation({
  'nav.overview': 'Oversigt',
  'nav.orders': 'Ordrer',
  'nav.productRules': 'Produktregler',
  'nav.settings': 'Indstillinger',
  'nav.help': 'Hjælp & diagnostik',
  'nav.language': 'Sprog',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Dagens leveringer og afhentninger på et øjeblik.',
  'overview.addToCheckout': 'Føj til kassen',
  'overview.deliveriesToday': 'Dagens leveringer',
  'overview.pickupsToday': 'Dagens afhentninger',
  'offline.title': 'Planlægning er i øjeblikket slået fra',
  'offline.cta': 'Aktivér i Indstillinger',
  'orders.title': 'Planlagte ordrer',
  'settings.title': 'Indstillinger',
  'settings.saveSuccess': 'Indstillinger gemt',
  'settings.defaultLang': 'Standardsprog',
  'common.save': 'Gem',
  'common.saving': 'Gemmer…',
  'common.cancel': 'Annuller',
  'common.delivery': 'Levering',
  'common.pickup': 'Afhentning',
  'common.scheduled': 'Planlagt',
  'common.completed': 'Gennemført',
  'common.cancelled': 'Annulleret',
  'common.monday': 'Mandag',
  'common.tuesday': 'Tirsdag',
  'common.wednesday': 'Onsdag',
  'common.thursday': 'Torsdag',
  'common.friday': 'Fredag',
  'common.saturday': 'Lørdag',
  'common.sunday': 'Søndag',
});

export const DASHBOARD_NO = createTranslation({
  'nav.overview': 'Oversikt',
  'nav.orders': 'Ordrer',
  'nav.productRules': 'Produktregler',
  'nav.settings': 'Innstillinger',
  'nav.help': 'Hjelp & diagnostikk',
  'nav.language': 'Språk',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Dagens leveringer og hentinger i et øyekast.',
  'overview.addToCheckout': 'Legg til i kassen',
  'overview.deliveriesToday': 'Dagens leveringer',
  'overview.pickupsToday': 'Dagens hentinger',
  'offline.title': 'Tidsplanlegging er for øyeblikket slått av',
  'offline.cta': 'Slå på i Innstillinger',
  'orders.title': 'Planlagte ordrer',
  'settings.title': 'Innstillinger',
  'settings.saveSuccess': 'Innstillinger lagret',
  'settings.defaultLang': 'Standardspråk',
  'common.save': 'Lagre',
  'common.saving': 'Lagrer…',
  'common.cancel': 'Avbryt',
  'common.delivery': 'Levering',
  'common.pickup': 'Henting',
  'common.scheduled': 'Planlagt',
  'common.completed': 'Fullført',
  'common.cancelled': 'Kansellert',
  'common.monday': 'Mandag',
  'common.tuesday': 'Tirsdag',
  'common.wednesday': 'Onsdag',
  'common.thursday': 'Torsdag',
  'common.friday': 'Fredag',
  'common.saturday': 'Lørdag',
  'common.sunday': 'Søndag',
});

export const DASHBOARD_CS = createTranslation({
  'nav.overview': 'Přehled',
  'nav.orders': 'Objednávky',
  'nav.productRules': 'Pravidla produktů',
  'nav.settings': 'Nastavení',
  'nav.help': 'Nápověda a diagnostika',
  'nav.language': 'Jazyk',
  'overview.title': 'Delivery Scheduler',
  'overview.subtitle': 'Dnešní doručení a vyzvednutí na jednom místě.',
  'overview.addToCheckout': 'Přidat do pokladny',
  'overview.deliveriesToday': 'Dnešní doručení',
  'overview.pickupsToday': 'Dnešní vyzvednutí',
  'offline.title': 'Plánování je v tuto chvíli vypnuto',
  'offline.cta': 'Zapnout v Nastavení',
  'orders.title': 'Naplánované objednávky',
  'settings.title': 'Nastavení',
  'settings.saveSuccess': 'Nastavení bylo uloženo',
  'settings.defaultLang': 'Výchozí jazyk',
  'common.save': 'Uložit',
  'common.saving': 'Ukládání…',
  'common.cancel': 'Zrušit',
  'common.delivery': 'Doručení',
  'common.pickup': 'Vyzvednutí',
  'common.scheduled': 'Naplánováno',
  'common.completed': 'Dokončeno',
  'common.cancelled': 'Zrušeno',
  'common.monday': 'Pondělí',
  'common.tuesday': 'Úterý',
  'common.wednesday': 'Středa',
  'common.thursday': 'Čtvrtek',
  'common.friday': 'Pátek',
  'common.saturday': 'Sobota',
  'common.sunday': 'Neděle',
});

export const DASHBOARD_CATALOGUES: Record<SupportedLocale, DashboardMessages> = {
  en: DASHBOARD_EN,
  es: DASHBOARD_ES,
  fr: DASHBOARD_FR,
  de: DASHBOARD_DE,
  pt: DASHBOARD_PT,
  it: DASHBOARD_IT,
  nl: DASHBOARD_NL,
  pl: DASHBOARD_PL,
  tr: DASHBOARD_TR,
  ru: DASHBOARD_RU,
  ja: DASHBOARD_JA,
  ko: DASHBOARD_KO,
  zh: DASHBOARD_ZH,
  ar: DASHBOARD_AR,
  he: DASHBOARD_HE,
  hi: DASHBOARD_HI,
  sv: DASHBOARD_SV,
  da: DASHBOARD_DA,
  no: DASHBOARD_NO,
  cs: DASHBOARD_CS,
};

export function getDashboardMessages(locale: string): DashboardMessages {
  const base = (locale || 'en').split('-')[0]?.toLowerCase() as SupportedLocale;
  return DASHBOARD_CATALOGUES[base] ?? DASHBOARD_EN;
}
