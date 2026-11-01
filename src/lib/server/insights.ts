import { auth } from '@wix/essentials';
import { plugins } from '@wix/site-plugins';
import { SITE_PLUGIN_ID } from '../constants';
import { computeAvailability } from '../engine/availability';
import { log } from './log';
import { addDays, wallClockAt } from '../time/zoned';
import { FULFILMENT_METHODS, type ScheduleStatus } from '../schemas';
import { resolveEntitlement } from './entitlements';
import {
  countByProcessingStatus,
  lastProcessedEntry,
  listByStatus,
} from './event-log-repo';
import { loadUsage } from './lock-store';
import { countByStatus } from './reservations-repo';
import { allScheduledOrders, countScheduledOrders, type ScheduledOrder } from './scheduled-orders-repo';
import { loadSettings } from './settings-repo';

const ACTIVE_STATUSES: ScheduleStatus[] = ['scheduled', 'preparing', 'ready', 'out_for_delivery'];

const elevatedPlacementStatus = auth.elevate(plugins.getPlacementStatus);

/** Whether the checkout widget is placed in a slot; 'unknown' when the scope is missing or the call fails. */
async function widgetPlacement(): Promise<'placed' | 'not_placed' | 'unknown'> {
  try {
    const { placementStatuses = [] } = await elevatedPlacementStatus();
    const status = placementStatuses.find((p) => p.pluginId === SITE_PLUGIN_ID);
    return status?.placedInSlot ? 'placed' : 'not_placed';
  } catch (error) {
    log.error('plugin.placementStatus', error);
    return 'unknown';
  }
}

export async function overview(now = new Date()) {
  log.info('dashboard.overview.start');
  const [settings, entitlement, placement] = await Promise.all([
    loadSettings(),
    resolveEntitlement(now),
    widgetPlacement(),
  ]);
  log.info('dashboard.overview.context.loaded', {
    configured: settings.configured,
    enabled: settings.enabled,
    timezone: settings.timezone,
    plan: entitlement.plan,
    widgetPlacement: placement,
  });
  const today = wallClockAt(now, settings.timezone).localDate;
  const weekEnd = addDays(today, 7);

  const [todayCount, upcomingCount, deliveryCount, pickupCount, missingCount, reviewCount] =
    await Promise.all([
      countScheduledOrders({ localDate: today, statuses: ACTIVE_STATUSES }),
      countScheduledOrders({ from: addDays(today, 1), to: weekEnd, statuses: ACTIVE_STATUSES }),
      countScheduledOrders({ from: today, to: weekEnd, method: 'delivery', statuses: ACTIVE_STATUSES }),
      countScheduledOrders({ from: today, to: weekEnd, method: 'pickup', statuses: ACTIVE_STATUSES }),
      countScheduledOrders({ statuses: ['missing'] }),
      countScheduledOrders({ statuses: ['needs_review'] }),
    ]);

  // Slots at or above 80% of capacity in the next 7 days.
  const nearCapacity: Array<{ method: string; date: string; slotId: string; remaining: number }> = [];
  if (settings.configured && settings.slots.defaultCapacity > 0) {
    for (const method of FULFILMENT_METHODS) {
      const usage = await loadUsage(method, today, weekEnd, now);
      const result = computeAvailability({
        settings,
        method,
        productRules: [],
        from: today,
        to: weekEnd,
        now,
        usage,
        plan: entitlement.plan,
      });
      for (const day of result.days) {
        for (const slot of day.slots) {
          if (slot.remaining !== null && slot.remaining <= settings.slots.defaultCapacity * 0.2) {
            nearCapacity.push({ method, date: day.date, slotId: slot.slotId, remaining: slot.remaining });
          }
        }
      }
    }
  }

  log.info('dashboard.overview.complete', {
    today,
    countToday: todayCount,
    countUpcoming: upcomingCount,
    countDelivery: deliveryCount,
    countPickup: pickupCount,
  });

  return {
    today,
    timezone: settings.timezone,
    configured: settings.configured,
    enabled: settings.enabled,
    plan: entitlement.plan,
    widgetPlacement: placement,
    counts: {
      today: todayCount,
      upcoming: upcomingCount,
      delivery: deliveryCount,
      pickup: pickupCount,
      missingSchedule: missingCount,
      needsReview: reviewCount,
    },
    nearCapacity: nearCapacity.slice(0, 20),
  };
}

export async function diagnostics() {
  const [settings, failedCount, deadCount, lastProcessed, failures, heldCount, reviewHolds] =
    await Promise.all([
      loadSettings(),
      countByProcessingStatus(['failed']),
      countByProcessingStatus(['dead_letter']),
      lastProcessedEntry(),
      listByStatus(['failed', 'dead_letter'], 25),
      countByStatus('held'),
      countByStatus('needs_review'),
    ]);
  return {
    settingsRevision: settings.settingsRevision,
    configured: settings.configured,
    lastProcessedEvent: lastProcessed,
    failedEvents: failedCount,
    deadLetterEvents: deadCount,
    pendingHolds: heldCount,
    reservationsNeedingReview: reviewHolds,
    failures,
  };
}

const CSV_COLUMNS: Array<[string, (o: ScheduledOrder) => string]> = [
  ['Order number', (o) => o.orderNumber],
  ['Order ID', (o) => o.orderId],
  ['Customer', (o) => o.customerDisplayName],
  ['Method', (o) => o.fulfilmentMethod ?? ''],
  ['Date', (o) => o.localDate ?? ''],
  ['Slot', (o) => o.slotLabelSnapshot || o.slotId || ''],
  ['Time zone', (o) => o.timezone],
  ['Schedule status', (o) => o.scheduleStatus],
  ['Order status', (o) => o.orderStatusSnapshot],
  ['Payment status', (o) => o.paymentStatusSnapshot],
  ['Fulfillment status', (o) => o.fulfillmentStatusSnapshot],
  ['Items', (o) => o.itemSummarySnapshot],
  ['Notes', (o) => o.merchantNotes],
];

function csvCell(value: string): string {
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function exportCsv(query: Parameters<typeof allScheduledOrders>[0]): Promise<string> {
  const rows = await allScheduledOrders(query);
  const header = CSV_COLUMNS.map(([name]) => csvCell(name)).join(',');
  const body = rows.map((o) => CSV_COLUMNS.map(([, get]) => csvCell(get(o))).join(','));
  return [header, ...body].join('\r\n');
}
