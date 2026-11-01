import { appInstances } from '@wix/app-management';
import { emailTransmissions } from '@wix/email-transmissions';
import { auth } from '@wix/essentials';
import type { ScheduledOrder } from './scheduled-orders-repo';
import { loadSettings } from './settings-repo';

export type ScheduleNotificationKind = 'merchantNewOrder' | 'scheduleChanged' | 'needsReview';

type NotificationInput = {
  kind: ScheduleNotificationKind;
  order: ScheduledOrder;
  idempotencyKey: string;
  reason?: string | undefined;
};

const APP_NAME = 'Delivery Scheduler';
const LOG_PREFIX = '[Delivery Scheduler]';

const SUBJECTS: Record<ScheduleNotificationKind, string> = {
  merchantNewOrder: 'New scheduled order',
  scheduleChanged: 'Scheduled order changed',
  needsReview: 'Scheduled order needs review',
};

const getText = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export const escapeNotificationHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export function buildScheduleNotificationHtml(input: {
  heading: string;
  order: Pick<ScheduledOrder, 'orderId' | 'orderNumber' | 'fulfilmentMethod' | 'localDate' | 'slotLabelSnapshot' | 'timezone' | 'scheduleStatus' | 'itemSummarySnapshot'>;
  reason?: string | undefined;
}): string {
  const orderNumber = getText(input.order.orderNumber) || input.order.orderId;
  const schedule = input.order.localDate
    ? `${input.order.localDate}${input.order.slotLabelSnapshot ? ` · ${input.order.slotLabelSnapshot}` : ''}`
    : 'No schedule selected';
  const rows: Array<[string, string]> = [
    ['Order', orderNumber],
    ['Fulfilment', getText(input.order.fulfilmentMethod)],
    ['Schedule', schedule],
    ['Time zone', getText(input.order.timezone)],
    ['Status', getText(input.order.scheduleStatus)],
    ['Items', getText(input.order.itemSummarySnapshot)],
    ['Reason', getText(input.reason)],
  ];
  const details = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<li><strong>${escapeNotificationHtml(label)}:</strong> ${escapeNotificationHtml(value)}</li>`)
    .join('');
  return [
    '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#222">',
    `<h2>${escapeNotificationHtml(input.heading)}</h2>`,
    `<ul>${details}</ul>`,
    '<p>This notification was sent by Delivery Scheduler.</p>',
    '</body></html>',
  ].join('');
}

async function getSiteOwnerEmail(): Promise<string> {
  const getAppInstance = auth.elevate(appInstances.getAppInstance);
  const { site } = await getAppInstance();
  return getText(site?.ownerInfo?.email).toLowerCase();
}

export async function sendScheduleNotification(input: NotificationInput): Promise<boolean> {
  try {
    const settings = await loadSettings();
    if (!settings.notificationSettings[input.kind]) return false;

    const ownerEmail = await getSiteOwnerEmail();
    if (!ownerEmail) {
      console.warn(`${LOG_PREFIX} Site owner email is unavailable for schedule notification`);
      return false;
    }

    const subject = SUBJECTS[input.kind];
    const send = auth.elevate(emailTransmissions.sendEmailTransmission);
    await send(
      {
        emailSubject: subject,
        emailHtmlContent: buildScheduleNotificationHtml({
          heading: subject,
          order: input.order,
          reason: input.reason,
        }),
        senderName: APP_NAME,
        toRecipients: [{ emailAddress: ownerEmail }],
        type: 'TRANSACTIONAL',
      },
      { idempotencyKey: input.idempotencyKey },
    );
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to send ${input.kind} schedule notification`,
      error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
