import { computeAvailability } from '../lib/engine/availability';
import { resolveMessages } from '../lib/i18n/messages';
import type { Settings } from '../lib/schemas';
import type { WidgetPayload } from '../lib/server/widget-config';
import { addDays, wallClockAt } from '../lib/time/zoned';
import { renderWidget, type ViewModel } from './render';
import { WIDGET_CSS } from './styles';

/** A realistic, data-free rendering of the customer widget for the settings preview and the editor. */
export function previewPayload(settings: Settings, locale: string): WidgetPayload {
  const now = new Date();
  const method = settings.delivery.enabled || !settings.pickup.enabled ? 'delivery' : 'pickup';
  const today = wallClockAt(now, settings.timezone).localDate;
  const preview: Settings = { ...settings, configured: true, enabled: true };
  const availability = computeAvailability({
    settings: preview,
    method,
    productRules: [],
    from: today,
    to: addDays(today, 41),
    now,
    usage: { slotCount: () => 0, dayCount: () => 0 },
    plan: 'pro',
  });
  return {
    enabled: true,
    required: settings.requiredMode !== 'optional',
    settingsRevision: settings.settingsRevision,
    timezone: settings.timezone,
    slotMode: settings.slots.mode,
    showRemaining: settings.slots.defaultCapacity > 0,
    holdMinutes: settings.holdMinutes,
    methods: [
      { method: 'delivery', available: settings.delivery.enabled, reason: null },
      { method: 'pickup', available: settings.pickup.enabled, reason: null },
    ],
    availability,
    appearance: settings.appearance,
    locale,
    dateStyle: settings.translations.dateStyle,
    hourCycle: settings.translations.hourCycle,
    messages: resolveMessages(locale, settings.translations.overrides),
    pickup: settings.pickup.enabled
      ? {
          locationName: settings.pickup.locationName,
          locationAddress: settings.pickup.locationAddress,
          instructions: settings.pickup.instructions,
        }
      : null,
    deliveryNote: settings.delivery.note,
    currentHold: null,
  };
}

export function renderPreviewHtml(settings: Settings, locale: string): string {
  const payload = previewPayload(settings, locale);
  const firstOpen = payload.availability?.days.find((d) => d.available);
  const vm: ViewModel = {
    payload,
    status: 'ready',
    method: payload.availability?.method ?? null,
    month: (firstOpen?.date ?? payload.availability?.today ?? '2026-01-01').slice(0, 7),
    focusedDate: firstOpen?.date ?? null,
    selectedDate: firstOpen?.date ?? null,
    hold: null,
    editing: true,
    errorKey: null,
    compact: false,
    brand: null,
  };
  return `<style>${WIDGET_CSS.replace(':host{display:block}', '')}</style>${renderWidget(vm)}`;
}
