import { describe, expect, it } from 'vitest';
import {
  buildLifecycleEmailHtml,
} from '../src/backend/notify-lifecycle-event';
import { buildLifecycleSheetRecord } from '../src/backend/lifecycle-sheet-record';
import { buildScheduleNotificationHtml } from '../src/lib/server/schedule-notifications';
import {
  deliverLifecycleSheetRecord,
  getLifecycleSheetsConfig,
} from '../src/backend/lifecycle-sheet-delivery';

describe('lifecycle sheet records', () => {
  it('produces the same event ID for a timestamped redelivery', async () => {
    const event = {
      data: { operationTimeStamp: '2026-11-01T12:00:00.000Z', vendorProductId: 'pro' },
      metadata: { instanceId: 'instance-1' },
    };

    const first = await buildLifecycleSheetRecord('PaidPlanPurchased', event, null);
    const second = await buildLifecycleSheetRecord('PaidPlanPurchased', event, null);

    expect(first.eventId).toBe(second.eventId);
    expect(first.snapshotStatus).toBe('unavailable');
    expect(first.instanceId).toBe('instance-1');
  });

  it('includes enriched site and billing details when available', async () => {
    const record = await buildLifecycleSheetRecord(
      'PaidPlanChanged',
      { data: { previousVendorProductId: 'starter', vendorProductId: 'pro' } },
      {
        instance: {
          appName: 'Delivery Scheduler',
          appVersion: '1.0.0',
          instanceId: 'instance-2',
          billing: { packageName: 'pro', autoRenewing: true, freeTrialInfo: { status: 'ENDED' } },
        },
        site: { siteDisplayName: 'Demo Store', siteId: 'site-1', url: 'https://example.com' },
      },
    );

    expect(record.snapshotStatus).toBe('available');
    expect(record.siteName).toBe('Demo Store');
    expect(record.currentPlanId).toBe('pro');
    expect(record.previousPlanId).toBe('starter');
  });
});

describe('lifecycle Sheets delivery', () => {
  it('accepts only Google Apps Script exec URLs with a secret', async () => {
    await expect(getLifecycleSheetsConfig(async () => ({
      LIFECYCLE_SHEETS_WEBHOOK_URL: 'https://script.google.com/macros/s/test/exec',
      LIFECYCLE_SHEETS_WEBHOOK_SECRET: 'secret',
    }))).resolves.toEqual({
      endpoint: 'https://script.google.com/macros/s/test/exec',
      secret: 'secret',
    });

    await expect(getLifecycleSheetsConfig(async () => ({
      LIFECYCLE_SHEETS_WEBHOOK_URL: 'https://example.com/webhook',
      LIFECYCLE_SHEETS_WEBHOOK_SECRET: 'secret',
    }))).rejects.toThrow('Google Apps Script');
  });

  it('rejects failed or unacknowledged webhook responses', async () => {
    const record = { eventId: 'event-1', eventType: 'AppInstalled' };
    const failed = async () => new Response('nope', { status: 500 });
    const unacknowledged = async () => new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(deliverLifecycleSheetRecord({ endpoint: 'https://script.google.com/macros/s/test/exec', secret: 'secret' }, record, failed))
      .rejects.toThrow('HTTP 500');
    await expect(deliverLifecycleSheetRecord({ endpoint: 'https://script.google.com/macros/s/test/exec', secret: 'secret' }, record, unacknowledged))
      .rejects.toThrow('did not acknowledge');
  });
});

describe('lifecycle email formatting', () => {
  it('escapes HTML values and omits empty rows', () => {
    const html = buildLifecycleEmailHtml([
      ['Site name', '<Demo & Store>'],
      ['Empty', ''],
    ], '[Delivery Scheduler] App installed');

    expect(html).toContain('&lt;Demo &amp; Store&gt;');
    expect(html).not.toContain('<Demo & Store>');
    expect(html).not.toContain('<strong>Empty</strong>');
  });
});

describe('schedule email formatting', () => {
  it('includes schedule details and escapes merchant-visible values', () => {
    const html = buildScheduleNotificationHtml({
      heading: 'New scheduled order',
      reason: 'Review <capacity>',
      order: {
        orderId: 'order-1',
        orderNumber: '1001',
        fulfilmentMethod: 'delivery',
        localDate: '2026-11-12',
        slotLabelSnapshot: '09:00 - 11:00',
        timezone: 'America/Los_Angeles',
        scheduleStatus: 'scheduled',
        itemSummarySnapshot: '<Gift box>',
      },
    });

    expect(html).toContain('1001');
    expect(html).toContain('2026-11-12');
    expect(html).toContain('Review &lt;capacity&gt;');
    expect(html).toContain('&lt;Gift box&gt;');
  });
});
