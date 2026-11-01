import type { DayAvailability, SlotAvailability } from '../lib/engine/types';
import { format, isRtl, type MessageKey, type Messages } from '../lib/i18n/messages';
import type { FulfilmentMethod } from '../lib/schemas';
import type { PublicHold } from '../lib/server/holds';
import type { WidgetPayload } from '../lib/server/widget-config';
import { addDays, weekdayOf } from '../lib/time/zoned';
import {
  escapeHtml as e,
  firstDayOfWeek,
  formatDate,
  formatMonth,
  formatTimeRange,
  timeZoneLabel,
  weekdayNames,
} from './format';
import { themeVariables, type SlotBrand } from './styles';

export type ViewStatus = 'loading' | 'ready' | 'saving' | 'error' | 'offline';

export interface ViewModel {
  payload: WidgetPayload;
  status: ViewStatus;
  method: FulfilmentMethod | null;
  month: string;
  focusedDate: string | null;
  selectedDate: string | null;
  hold: PublicHold | null;
  editing: boolean;
  errorKey: MessageKey | null;
  compact: boolean;
  brand: SlotBrand | null;
}

const WEEKDAY_INDEX = { sun: 7, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 } as const;

function slotLabel(vm: ViewModel, slot: { label: string | null; startUtc: string; endUtc: string; slotId: string }) {
  const { payload } = vm;
  if (slot.label) return slot.label;
  if (slot.slotId === 'day') return payload.messages['slot.allDay'];
  return formatTimeRange(slot.startUtc, slot.endUtc, payload.timezone, payload.locale, payload.hourCycle);
}

function holdTimeText(vm: ViewModel, hold: PublicHold): string {
  const m = vm.payload.messages;
  const date = formatDate(hold.localDate, vm.payload.locale, vm.payload.dateStyle);
  if (hold.slotId === 'day' || !hold.slotStartUtc || !hold.slotEndUtc) {
    return format(m['selection.confirmedDateOnly'], { date });
  }
  const label =
    vm.payload.availability?.days
      .find((d) => d.date === hold.localDate)
      ?.slots.find((s) => s.slotId === hold.slotId)?.label ?? null;
  const time = label ?? formatTimeRange(hold.slotStartUtc, hold.slotEndUtc, hold.timezone, vm.payload.locale, vm.payload.hourCycle);
  return format(m['selection.confirmed'], { date, time });
}

function renderMethods(vm: ViewModel): string {
  const m = vm.payload.messages;
  const offered = vm.payload.methods.filter((x) => x.available);
  if (offered.length < 2) return '';
  const buttons = offered
    .map(
      (x) =>
        `<button type="button" class="ds-btn" role="radio" aria-checked="${vm.method === x.method}" data-action="method" data-method="${x.method}">${e(m[`method.${x.method}`])}</button>`,
    )
    .join('');
  return `<fieldset><legend>${e(m['method.legend'])}</legend><div class="ds-row" role="radiogroup">${buttons}</div></fieldset>`;
}

function dayAriaLabel(vm: ViewModel, date: string, day: DayAvailability | undefined): string {
  const m = vm.payload.messages;
  const text = formatDate(date, vm.payload.locale, 'full');
  if (day?.available) return text;
  const reasonKey = day?.reason ? (`reason.${day.reason}` as MessageKey) : 'calendar.unavailable';
  return `${text}, ${m[reasonKey in m ? reasonKey : 'calendar.unavailable']}`;
}

function renderCalendar(vm: ViewModel): string {
  const availability = vm.payload.availability;
  if (!availability) return '';
  const m = vm.payload.messages;
  const byDate = new Map(availability.days.map((d) => [d.date, d]));
  const firstDay = firstDayOfWeek(vm.payload.locale);
  const monthStart = `${vm.month}-01`;
  const offset = (WEEKDAY_INDEX[weekdayOf(monthStart)] - firstDay + 7) % 7;
  const gridStart = addDays(monthStart, -offset);
  const names = weekdayNames(vm.payload.locale, firstDay);
  const focus = vm.focusedDate ?? vm.selectedDate ?? availability.days.find((d) => d.available)?.date ?? monthStart;

  const rows: string[] = [];
  for (let week = 0; week < 6; week += 1) {
    const cells: string[] = [];
    for (let i = 0; i < 7; i += 1) {
      const date = addDays(gridStart, week * 7 + i);
      if (!date.startsWith(vm.month)) {
        cells.push('<td></td>');
        continue;
      }
      const day = byDate.get(date);
      const available = day?.available === true;
      const classes = ['ds-day', available ? 'is-available' : '', date === availability.today ? 'is-today' : '']
        .filter(Boolean)
        .join(' ');
      cells.push(
        `<td role="gridcell"><button type="button" class="${classes}" data-action="date" data-date="${date}" tabindex="${date === focus ? 0 : -1}" aria-selected="${date === vm.selectedDate}" aria-disabled="${!available}" aria-label="${e(dayAriaLabel(vm, date, day))}">${Number(date.slice(8))}</button></td>`,
      );
    }
    if (week >= 4 && cells.every((c) => c === '<td></td>')) break;
    rows.push(`<tr>${cells.join('')}</tr>`);
  }

  const canPrev = vm.month > availability.today.slice(0, 7);
  const canNext = vm.month < availability.latestDate.slice(0, 7);
  const header = names.map((n) => `<th scope="col" abbr="${e(n.long)}">${e(n.short)}</th>`).join('');
  return `<div class="ds-cal">
    <div class="ds-cal-head">
      <button type="button" class="ds-btn" data-action="prev-month" aria-label="${e(m['calendar.previousMonth'])}" ${canPrev ? '' : 'aria-disabled="true"'}>‹</button>
      <span class="ds-cal-title" id="ds-month">${e(formatMonth(vm.month, vm.payload.locale))}</span>
      <button type="button" class="ds-btn" data-action="next-month" aria-label="${e(m['calendar.nextMonth'])}" ${canNext ? '' : 'aria-disabled="true"'}>›</button>
    </div>
    <table class="ds-grid" role="grid" aria-labelledby="ds-month"><thead><tr>${header}</tr></thead><tbody>${rows.join('')}</tbody></table>
  </div>`;
}

function renderSlot(vm: ViewModel, slot: SlotAvailability): string {
  const m = vm.payload.messages;
  const selected = vm.hold?.localDate === vm.selectedDate && vm.hold?.slotId === slot.slotId;
  let sub = '';
  if (!slot.available) {
    const key = slot.reason === 'fully_booked' ? 'slot.full' : (`reason.${slot.reason ?? 'closed'}` as MessageKey);
    sub = m[key in m ? key : 'calendar.unavailable'];
  } else if (vm.payload.showRemaining && slot.remaining !== null) {
    sub = format(m['slot.remaining'], { count: slot.remaining });
  }
  return `<button type="button" class="ds-btn" role="radio" aria-checked="${selected}" aria-disabled="${!slot.available}" data-action="slot" data-slot="${e(slot.slotId)}">${e(slotLabel(vm, slot))}${sub ? `<span class="ds-slot-sub">${e(sub)}</span>` : ''}</button>`;
}

function renderSlots(vm: ViewModel): string {
  if (!vm.selectedDate || vm.payload.slotMode === 'dateOnly') return '';
  const day = vm.payload.availability?.days.find((d) => d.date === vm.selectedDate);
  if (!day) return '';
  const m = vm.payload.messages;
  return `<fieldset><legend>${e(m['time.label'])} — ${e(formatDate(day.date, vm.payload.locale, vm.payload.dateStyle))}</legend>
    <div class="ds-slots" role="radiogroup">${day.slots.map((s) => renderSlot(vm, s)).join('')}</div></fieldset>`;
}

function renderContext(vm: ViewModel): string {
  const { payload } = vm;
  const m = payload.messages;
  const lines = [format(m['timezone.note'], { timezone: timeZoneLabel(payload.timezone, payload.locale) })];
  if (vm.method === 'pickup' && payload.pickup) {
    lines.push(format(m['pickup.location'], { location: payload.pickup.locationName }));
    if (payload.pickup.locationAddress) lines.push(payload.pickup.locationAddress);
    if (payload.pickup.instructions) lines.push(payload.pickup.instructions);
  }
  if (vm.method === 'delivery' && payload.deliveryNote) lines.push(payload.deliveryNote);
  return lines.map((l) => `<p class="ds-muted">${e(l)}</p>`).join('');
}

function renderStatus(vm: ViewModel): string {
  const m = vm.payload.messages;
  if (vm.status === 'offline') return `<div class="ds-alert" role="status">${e(m['state.offline'])}</div>`;
  if (vm.status === 'loading') return `<p class="ds-muted" role="status"><span class="ds-spinner" aria-hidden="true"></span>${e(m['state.loading'])}</p>`;
  if (vm.status === 'saving') return `<p class="ds-muted" role="status"><span class="ds-spinner" aria-hidden="true"></span>${e(m['state.saving'])}</p>`;
  if (vm.status === 'error' || vm.errorKey) {
    return `<div class="ds-alert" data-tone="error" role="alert">${e(m[vm.errorKey ?? 'state.error'])} <button type="button" class="ds-link" data-action="retry">${e(m['state.retry'])}</button></div>`;
  }
  return '';
}

function renderHeader(vm: ViewModel): string {
  const m = vm.payload.messages;
  const tag = vm.payload.required ? m['widget.required'] : m['widget.optional'];
  return `<div class="ds-head"><h3 class="ds-title">${e(m['widget.title'])}</h3><span class="ds-tag">${e(tag)}</span></div>
    ${m['widget.subtitle'] ? `<p class="ds-muted">${e(m['widget.subtitle'])}</p>` : ''}
    ${m['widget.helper'] ? `<p class="ds-muted">${e(m['widget.helper'])}</p>` : ''}`;
}

function renderSummary(vm: ViewModel, hold: PublicHold, showChange: boolean): string {
  const m = vm.payload.messages;
  const removing = vm.status === 'saving';
  return `<div class="ds-summary"><span>${e(holdTimeText(vm, hold))}</span><span class="ds-row">${
    showChange ? `<button type="button" class="ds-link" data-action="change">${e(m['selection.change'])}</button>` : ''
  }<button type="button" class="ds-btn" data-action="remove" aria-disabled="${removing}" aria-busy="${removing}">${
    removing ? '<span class="ds-spinner" aria-hidden="true"></span>' : ''
  }${e(m['selection.remove'])}</button></span></div>`;
}

export function renderWidget(vm: ViewModel): string {
  const { payload } = vm;
  const dir = isRtl(payload.locale) ? 'rtl' : 'ltr';
  const shell = (body: string) =>
    `<div class="ds ${payload.appearance.slotStyle === 'filled' ? 'ds-filled' : ''}" dir="${dir}" lang="${e(payload.locale)}" style="${themeVariables(payload.appearance, vm.brand)}"><div class="ds-inner">${body}</div></div>`;

  if (vm.compact) return vm.hold ? shell(renderSummary(vm, vm.hold, false)) : '';
  if (vm.hold && !vm.editing) {
    return shell(`${renderHeader(vm)}${renderSummary(vm, vm.hold, true)}${renderContext(vm)}${renderStatus(vm)}`);
  }

  const availability = payload.availability;
  const noDates = availability !== null && !availability.days.some((d) => d.available);
  return shell(`${renderHeader(vm)}${renderMethods(vm)}
    ${vm.method && availability ? renderContext(vm) : ''}
    ${noDates && vm.status === 'ready' ? `<div class="ds-alert" role="status">${e(payload.messages['state.empty'])}</div>` : ''}
    ${vm.method && availability && !noDates ? renderCalendar(vm) + renderSlots(vm) : ''}
    ${renderStatus(vm)}`);
}

export function renderPlaceholder(messages: Messages, text: MessageKey): string {
  return `<div class="ds"><p class="ds-muted" role="status"><span class="ds-spinner" aria-hidden="true"></span>${e(messages[text])}</p></div>`;
}
