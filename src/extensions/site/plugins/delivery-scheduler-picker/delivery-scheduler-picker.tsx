import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { httpClient } from '@wix/essentials';
import reactToWebComponent from 'react-to-webcomponent';
import { DEFAULT_SETTINGS } from '../../../../lib/defaults';
import { format, resolveMessages, type MessageKey } from '../../../../lib/i18n/messages';
import type { FulfilmentMethod } from '../../../../lib/schemas';
import type { PublicHold } from '../../../../lib/server/holds';
import type { WidgetPayload } from '../../../../lib/server/widget-config';
import { addDays } from '../../../../lib/time/zoned';
import { formatDate } from '../../../../widget/format';
import { renderPreviewHtml } from '../../../../widget/preview';
import { renderPlaceholder, renderWidget, type ViewModel } from '../../../../widget/render';
import { WIDGET_CSS, type SlotBrand } from '../../../../widget/styles';

const ERROR_KEYS: Record<string, MessageKey> = {
  SLOT_FULL: 'error.slotFull',
  SLOT_UNAVAILABLE: 'error.slotUnavailable',
  STALE_SETTINGS: 'error.stale',
};

class WidgetApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
  }
}

const API_TIMEOUT_MS = 12_000;
const APP_ORIGIN = new URL(import.meta.url).origin;
const WIDGET_LOG_PREFIX = '[Delivery Scheduler]';

function widgetLog(event: string, fields: Record<string, unknown> = {}): void {
  try {
    console.info(`${WIDGET_LOG_PREFIX} ${event} ${JSON.stringify(fields)}`);
  } catch {
    console.info(`${WIDGET_LOG_PREFIX} ${event}`);
  }
}

function shortId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function isBrand(value: unknown): value is SlotBrand {
  return !!value && typeof value === 'object' && 'backgroundColor' in value && 'textColor' in value;
}

const monthOf = (date: string) => date.slice(0, 7);
const shiftMonth = (month: string, delta: number) => {
  const [y = 1970, m = 1] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

type DeliverySchedulerPickerProps = {
  checkoutId?: string;
  checkoutUpdatedDate?: string;
  deliveryStepState?: string;
  slotBrand?: unknown;
  onRefreshCheckout?: () => void | Promise<void>;
  disableContinueButton?: (disabled: boolean) => void;
};

type VmUpdate = ViewModel | null | ((current: ViewModel | null) => ViewModel | null);

const DeliverySchedulerPicker = ({
  checkoutId = '',
  checkoutUpdatedDate = '',
  deliveryStepState = 'open',
  slotBrand,
  onRefreshCheckout,
  disableContinueButton,
}: DeliverySchedulerPickerProps) => {
  const [vm, setVmState] = useState<ViewModel | null>(null);
  const [loadError, setLoadError] = useState(false);
  const vmRef = useRef<ViewModel | null>(null);
  const propsRef = useRef<DeliverySchedulerPickerProps>({});
  const loadSeqRef = useRef(0);
  const focusAfterRenderRef = useRef<string | null>(null);
  const lastUpdatedDateRef = useRef('');
  const contentRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  propsRef.current = {
    checkoutId,
    checkoutUpdatedDate,
    deliveryStepState,
    slotBrand,
    onRefreshCheckout,
    disableContinueButton,
  };

  const setVm = useCallback((next: VmUpdate) => {
    setVmState((current) => {
      const updated = typeof next === 'function' ? next(current) : next;
      vmRef.current = updated;
      return updated;
    });
  }, []);

  const update = useCallback(
    (patch: Partial<ViewModel>) => {
      setVm((current) => (current ? { ...current, ...patch } : current));
    },
    [setVm],
  );

  const siteLocale = useCallback(() => {
    try {
      const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang?.trim() : '';
      if (htmlLang && htmlLang.length >= 2) return htmlLang;
    } catch {
      // ignore
    }
    return '';
  }, []);

  const announce = useCallback((text: string) => {
    if (!liveRef.current) return;
    liveRef.current.textContent = '';
    window.setTimeout(() => {
      if (liveRef.current) liveRef.current.textContent = text;
    }, 50);
  }, []);

  const load = useCallback(
    async (method: FulfilmentMethod | null, from?: string, preserveSelection = true) => {
      const checkoutIdValue = propsRef.current.checkoutId;
      if (!checkoutIdValue) return;
      const seq = ++loadSeqRef.current;
      widgetLog('availability:start', {
        checkoutId: shortId(checkoutIdValue),
        method,
        from: from ?? null,
        appOrigin: APP_ORIGIN,
        seq,
      });
      if (vmRef.current) update({ status: 'loading' });
      else setLoadError(false);
      try {
        const url = new URL('/api/availability', APP_ORIGIN);
        url.searchParams.set('checkoutId', checkoutIdValue);
        if (method) url.searchParams.set('method', method);
        if (from) url.searchParams.set('from', from);
        const loc = siteLocale();
        if (loc) url.searchParams.set('locale', loc);
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
        let payload: WidgetPayload;
        try {
          const response = await httpClient.fetchWithAuth(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
          });
          widgetLog('availability:response', {
            checkoutId: shortId(checkoutIdValue),
            status: response.status,
            ok: response.ok,
            url: url.toString(),
            seq,
          });
          const body: unknown = await response.json().catch(() => null);
          if (!response.ok) {
            const code =
              body && typeof body === 'object' && 'error' in body
                ? String((body as { error?: { code?: unknown } }).error?.code ?? 'INTERNAL')
                : 'INTERNAL';
            throw new WidgetApiError(code, response.status);
          }
          payload = body as WidgetPayload;
          widgetLog('availability:payload', {
            checkoutId: shortId(checkoutIdValue),
            enabled: payload.enabled,
            required: payload.required,
            method: payload.availability?.method ?? null,
            methods: payload.methods?.map((item) => `${item.method}:${item.available}`).join(',') ?? '',
            days: payload.availability?.days.length ?? 0,
            availableDays: payload.availability?.days.filter((day) => day.available).length ?? 0,
            settingsRevision: payload.settingsRevision,
            seq,
          });
        } catch (error) {
          if (error instanceof WidgetApiError) throw error;
          throw new WidgetApiError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK', 0);
        } finally {
          window.clearTimeout(timer);
        }
        if (seq !== loadSeqRef.current) return;
        const previous = vmRef.current;
        const hold = payload.currentHold;
        const resolvedMethod = payload.availability?.method ?? null;
        const keepDate =
          preserveSelection && previous?.selectedDate && previous.method === resolvedMethod
            ? previous.selectedDate
            : null;
        const selectedDate = keepDate ?? hold?.localDate ?? null;
        const firstOpen = payload.availability?.days.find((day) => day.available)?.date;
        setLoadError(false);
        setVm({
          payload,
          status: navigator.onLine === false ? 'offline' : 'ready',
          method: resolvedMethod,
          month:
            previous && from
              ? previous.month
              : monthOf(selectedDate ?? firstOpen ?? payload.availability?.today ?? '1970-01'),
          focusedDate: preserveSelection ? previous?.focusedDate ?? selectedDate : selectedDate,
          selectedDate,
          hold,
          editing: preserveSelection ? previous?.editing ?? false : true,
          errorKey: previous?.errorKey ?? null,
          compact: false,
          brand: isBrand(propsRef.current.slotBrand) ? propsRef.current.slotBrand : null,
        });
      } catch (error) {
        if (seq !== loadSeqRef.current) return;
        widgetLog('availability:error', {
          checkoutId: shortId(checkoutIdValue),
          error: error instanceof Error ? error.message : String(error),
          seq,
        });
        console.error('Delivery Scheduler: failed to load availability', error);
        if (vmRef.current) update({ status: navigator.onLine === false ? 'offline' : 'error' });
        else setLoadError(true);
      }
    },
    [siteLocale, setVm, update],
  );

  const hold = useCallback(
    async (localDate: string, slotId: string) => {
      const current = vmRef.current;
      const checkoutIdValue = propsRef.current.checkoutId;
      if (!current?.method || current.status === 'saving' || !checkoutIdValue) return;
      update({ status: 'saving', errorKey: null });
      try {
        const url = new URL('/api/reservations/hold', APP_ORIGIN);
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
        let nextHold: PublicHold;
        try {
          const response = await httpClient.fetchWithAuth(url, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              checkoutId: checkoutIdValue,
              method: current.method,
              localDate,
              slotId,
              idempotencyKey: crypto.randomUUID().replace(/-/g, ''),
              settingsRevision: current.payload.settingsRevision,
            }),
          });
          const body: unknown = await response.json().catch(() => null);
          if (!response.ok) {
            const code =
              body && typeof body === 'object' && 'error' in body
                ? String((body as { error?: { code?: unknown } }).error?.code ?? 'INTERNAL')
                : 'INTERNAL';
            throw new WidgetApiError(code, response.status);
          }
          nextHold = (body as { hold: PublicHold }).hold;
        } catch (error) {
          if (error instanceof WidgetApiError) throw error;
          throw new WidgetApiError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK', 0);
        } finally {
          window.clearTimeout(timer);
        }
        update({ hold: nextHold, editing: false, status: 'ready' });
        const messages = current.payload.messages;
        announce(
          `${format(messages['selection.confirmedDateOnly'], { date: formatDate(localDate, current.payload.locale, 'full') })}. ${format(messages['selection.expiresSoon'], { minutes: current.payload.holdMinutes })}`,
        );
        focusAfterRenderRef.current = '[data-action="change"]';
        try {
          const refresh = propsRef.current.onRefreshCheckout;
          if (typeof refresh === 'function') await (refresh as () => unknown)();
        } catch (error) {
          console.error('Delivery Scheduler: checkout refresh failed', error);
        }
      } catch (error) {
        const code = error instanceof WidgetApiError ? error.code : 'INTERNAL';
        const errorKey = ERROR_KEYS[code] ?? 'error.generic';
        update({ status: 'ready', errorKey });
        announce(current.payload.messages[errorKey]);
        if (code in ERROR_KEYS) void load(current.method);
      }
    },
    [announce, load, update],
  );

  const release = useCallback(async () => {
    const current = vmRef.current;
    const checkoutIdValue = propsRef.current.checkoutId;
    const reservationId = current?.hold?.reservationId;
    if (!current || !checkoutIdValue || !reservationId || current.status === 'saving') return;
    update({ status: 'saving', errorKey: null });
    try {
      const url = new URL('/api/reservations/release', APP_ORIGIN);
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      try {
        const response = await httpClient.fetchWithAuth(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutId: checkoutIdValue, reservationId }),
        });
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const code =
            body && typeof body === 'object' && 'error' in body
              ? String((body as { error?: { code?: unknown } }).error?.code ?? 'INTERNAL')
              : 'INTERNAL';
          throw new WidgetApiError(code, response.status);
        }
        widgetLog('release:success', { checkoutId: shortId(checkoutIdValue), reservationId });
      } catch (error) {
        if (error instanceof WidgetApiError) throw error;
        throw new WidgetApiError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK', 0);
      } finally {
        window.clearTimeout(timer);
      }
      announce(current.payload.messages['selection.removed']);
      await load(current.method, undefined, false);
    } catch (error) {
      const code = error instanceof WidgetApiError ? error.code : 'INTERNAL';
      widgetLog('release:error', {
        checkoutId: shortId(checkoutIdValue),
        reservationId,
        error: error instanceof Error ? error.message : String(error),
      });
      update({ status: 'ready', errorKey: ERROR_KEYS[code] ?? 'error.generic' });
    }
  }, [announce, load, update]);

  const selectDate = useCallback(
    (date: string) => {
      const current = vmRef.current;
      if (!current) return;
      const day = current.payload.availability?.days.find((item) => item.date === date);
      if (!day?.available) return;
      focusAfterRenderRef.current =
        current.payload.slotMode === 'dateOnly' ? null : '.ds-slots [aria-disabled="false"]';
      update({ selectedDate: date, focusedDate: date, errorKey: null });
      announce(formatDate(date, current.payload.locale, 'full'));
      if (current.payload.slotMode === 'dateOnly') void hold(date, 'day');
    },
    [announce, hold, update],
  );

  const changeMonth = useCallback(
    (delta: number) => {
      const current = vmRef.current;
      const availability = current?.payload.availability;
      if (!current || !availability) return;
      const month = shiftMonth(current.month, delta);
      if (month < monthOf(availability.today) || month > monthOf(availability.latestDate)) return;
      update({ month, focusedDate: `${month}-01` });
      const lastLoaded = availability.days[availability.days.length - 1]?.date ?? availability.today;
      const firstLoaded = availability.days[0]?.date ?? availability.today;
      const monthEnd = addDays(`${shiftMonth(month, 1)}-01`, -1);
      if (monthEnd > lastLoaded || `${month}-01` < firstLoaded) {
        const from = `${month}-01` < availability.today ? availability.today : `${month}-01`;
        void load(current.method, from);
      }
    },
    [load, update],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-action]');
      if (!target || target.getAttribute('aria-disabled') === 'true') return;
      const current = vmRef.current;
      switch (target.dataset.action) {
        case 'retry':
          setVm((previous) => (previous ? { ...previous, errorKey: null } : null));
          void load(current?.method ?? null);
          return;
        case 'method': {
          const method = target.dataset.method;
          if (current && (method === 'delivery' || method === 'pickup') && method !== current.method) {
            setVm({ ...current, method, selectedDate: null, focusedDate: null, errorKey: null });
            void load(method);
          }
          return;
        }
        case 'date':
          if (target.dataset.date) selectDate(target.dataset.date);
          return;
        case 'slot':
          if (current?.selectedDate && target.dataset.slot) void hold(current.selectedDate, target.dataset.slot);
          return;
        case 'remove':
          void release();
          return;
        case 'prev-month':
          changeMonth(-1);
          return;
        case 'next-month':
          changeMonth(1);
          return;
        case 'change':
          update({ editing: true });
          focusAfterRenderRef.current = '.ds-day[tabindex="0"]';
          return;
        default:
          return;
      }
    },
    [changeMonth, hold, load, release, selectDate, setVm, update],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const date = target?.dataset.date;
      const current = vmRef.current;
      if (!date || !current) return;
      const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      const rtl = getComputedStyle(target).direction === 'rtl';
      let next: string | null = null;
      if (event.key in moves) {
        const delta = moves[event.key] ?? 0;
        next = addDays(date, rtl && Math.abs(delta) === 1 ? -delta : delta);
      } else if (event.key === 'PageUp' || event.key === 'PageDown') {
        const month = shiftMonth(monthOf(date), event.key === 'PageUp' ? -1 : 1);
        next = `${month}-${date.slice(8)}`;
        if (Number.isNaN(new Date(`${next}T00:00:00Z`).getTime()) || !next.startsWith(month)) next = `${month}-01`;
      } else if (event.key === 'Home' || event.key === 'End') {
        next = event.key === 'Home' ? `${monthOf(date)}-01` : addDays(`${shiftMonth(monthOf(date), 1)}-01`, -1);
      } else {
        return;
      }
      event.preventDefault();
      const availability = current.payload.availability;
      if (!availability || next < availability.today || next > availability.latestDate) return;
      if (monthOf(next) !== current.month) changeMonth(monthOf(next) > current.month ? 1 : -1);
      focusAfterRenderRef.current = `[data-date="${next}"]`;
      update({ focusedDate: next });
    },
    [changeMonth, update],
  );

  useEffect(() => {
    // Wix can reuse the same plugin element for a different checkout. Clear
    // the previous checkout's hold and calendar before starting the new load.
    loadSeqRef.current += 1;
    lastUpdatedDateRef.current = '';
    setLoadError(false);
    setVm(null);
    if (checkoutId) void load(null);
  }, [checkoutId, load]);

  useEffect(() => {
    widgetLog('render', {
      checkoutId: checkoutId ? shortId(checkoutId) : null,
      deliveryStepState,
      hasViewModel: !!vm,
      loadError,
      status: vm?.status ?? 'placeholder',
      payloadEnabled: vm?.payload.enabled ?? null,
      method: vm?.method ?? null,
      hasAvailability: !!vm?.payload.availability,
      days: vm?.payload.availability?.days.length ?? 0,
      availableDays: vm?.payload.availability?.days.filter((day) => day.available).length ?? 0,
      compact: !!vm && deliveryStepState === 'summary' && !!vm.hold,
      renderBranch: !checkoutId
        ? 'preview'
        : !vm
          ? loadError
            ? 'load-error'
            : 'loading-placeholder'
          : !vm.payload.enabled
            ? 'disabled-empty'
            : deliveryStepState === 'summary' && vm.hold
              ? vm.hold
                ? 'compact-hold-summary'
                : 'compact-empty'
              : 'full-widget',
    });
  }, [checkoutId, deliveryStepState, loadError, vm]);

  useEffect(() => {
    if (!checkoutUpdatedDate || checkoutUpdatedDate === lastUpdatedDateRef.current) return;
    const first = lastUpdatedDateRef.current === '';
    lastUpdatedDateRef.current = checkoutUpdatedDate;
    const current = vmRef.current;
    if (!first && current && current.status !== 'saving') void load(current.method);
  }, [checkoutUpdatedDate, load]);

  useEffect(() => {
    const onOnline = () => {
      if (vmRef.current) void load(vmRef.current.method);
    };
    const onOffline = () => {
      if (vmRef.current) update({ status: 'offline' });
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [load, update]);

  useEffect(() => {
    // Keep checkout blocked while a required scheduler is loading. Enabling
    // Continue before availability/hold resolution would allow an order to
    // bypass the required schedule.
    const blocked = !!checkoutId && (!vm || (vm.payload.enabled && vm.payload.required && !vm.hold));
    try {
      const continueControl = propsRef.current.disableContinueButton;
      if (typeof continueControl === 'function') {
        continueControl(blocked);
        widgetLog('continue-button', {
          checkoutId: shortId(checkoutId),
          disabled: blocked,
          functionArity: continueControl.length,
        });
      }
    } catch (error) {
      console.error('Delivery Scheduler: continue-button control failed', error);
    }
  }, [checkoutId, disableContinueButton, vm]);

  useEffect(() => {
    const selector = focusAfterRenderRef.current;
    if (!selector) return;
    contentRef.current?.querySelector<HTMLElement>(selector)?.focus();
    focusAfterRenderRef.current = null;
  }, [vm, loadError, deliveryStepState]);

  const activeLocale = vm?.payload.locale ?? siteLocale() ?? DEFAULT_SETTINGS.translations.defaultLocale;
  const messages = vm?.payload.messages ?? resolveMessages(activeLocale, {});
  // Keep the picker visible until the customer has selected a hold. Once a
  // hold exists, Wix may render the delivery step in summary mode and the
  // compact confirmation is appropriate.
  const compact = !!vm && deliveryStepState === 'summary' && !!vm.hold;
  let html: string;
  if (!checkoutId) {
    html = renderPreviewHtml(DEFAULT_SETTINGS, activeLocale);
  } else if (!vm) {
    html = loadError
      ? `<div class="ds"><div class="ds-alert" data-tone="error" role="alert">${messages['state.error']} <button type="button" class="ds-link" data-action="retry">${messages['state.retry']}</button></div></div>`
      : renderPlaceholder(messages, 'state.loading');
  } else if (!vm.payload.enabled) {
    html = '';
  } else {
    html = renderWidget({
      ...vm,
      brand: isBrand(slotBrand) ? slotBrand : null,
      compact,
    });
  }

  return (
    <>
      <style>{WIDGET_CSS}</style>
      <div ref={contentRef} onClick={handleClick} onKeyDown={handleKeyDown} dangerouslySetInnerHTML={{ __html: html }} />
      <div ref={liveRef} className="ds-sr" aria-live="polite" />
    </>
  );
};

export default reactToWebComponent(DeliverySchedulerPicker, React, ReactDOM, {
  shadow: 'open',
  props: {
    checkoutId: 'string',
    checkoutUpdatedDate: 'string',
    deliveryStepState: 'string',
    slotBrand: 'json',
    onRefreshCheckout: 'method',
    disableContinueButton: 'method',
  },
});
