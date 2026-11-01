import React from 'react';
import { Box, FormField, Input, Text } from '@wix/design-system';
import { BASIC_MAX_DAYS_AHEAD } from '../../../../../lib/constants';
import { buildSlotWindows } from '../../../../../lib/engine/slots';
import { DEFAULT_SETTINGS } from '../../../../../lib/defaults';
import { WEEKDAYS } from '../../../../../lib/schemas';
import { minutesToHHmm } from '../../../../../lib/time/zoned';
import { NumberField, SelectField, ToggleField, proLabel, type SectionProps } from './fields';

/** Distinct slot IDs the current weekly hours produce, for labelling. */
function slotIds(value: SectionProps['value']) {
  const settings = { ...DEFAULT_SETTINGS, ...value };
  const seen = new Map<string, string>();
  for (const config of [value.delivery, value.pickup]) {
    for (const day of WEEKDAYS) {
      for (const w of buildSlotWindows(settings, config.workingHours[day])) {
        seen.set(w.slotId, `${minutesToHHmm(w.startMinutes)}–${minutesToHHmm(w.endMinutes)}`);
      }
    }
  }
  return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 48);
}

export const ScheduleSection = ({ value, update, plan }: SectionProps) => {
  const slots = value.slots;
  const setSlots = (patch: Partial<typeof slots>) => update({ slots: { ...slots, ...patch } });
  const isPro = plan === 'pro';
  return (
    <Box direction="vertical" gap="SP4">
      <NumberField
        label="Minimum notice (hours)"
        value={value.minNoticeMinutes / 60}
        min={0}
        max={1440}
        step={0.5}
        onChange={(h) => update({ minNoticeMinutes: Math.round(h * 60) })}
      />
      <NumberField
        label={proLabel('Book up to (days ahead)', plan, value.maxDaysAhead > BASIC_MAX_DAYS_AHEAD)}
        value={value.maxDaysAhead}
        min={0}
        max={isPro ? 365 : BASIC_MAX_DAYS_AHEAD}
        onChange={(maxDaysAhead) => update({ maxDaysAhead })}
      />
      <ToggleField label="Allow same-day orders" checked={value.sameDayEnabled} onChange={(sameDayEnabled) => update({ sameDayEnabled })} />
      <ToggleField
        label="Daily cut-off time"
        checked={value.cutoff.enabled}
        onChange={(enabled) => update({ cutoff: { ...value.cutoff, enabled } })}
        info="Orders placed after this time are treated as if placed the next day."
      />
      {value.cutoff.enabled && (
        <FormField label="Cut-off (HH:mm, store time)">
          <Box width="120px">
            <Input value={value.cutoff.time} onChange={(e) => update({ cutoff: { ...value.cutoff, time: e.target.value } })} />
          </Box>
        </FormField>
      )}
      <SelectField
        label="Customer chooses"
        value={slots.mode}
        options={[
          { id: 'timeslots', label: 'A date and a time slot' },
          { id: 'dateOnly', label: 'A date only' },
        ]}
        onChange={(mode) => setSlots({ mode })}
      />
      {slots.mode === 'timeslots' && (
        <>
          <NumberField label="Slot length (minutes)" value={slots.durationMinutes} min={15} max={720} step={15} onChange={(durationMinutes) => setSlots({ durationMinutes, intervalMinutes: Math.max(slots.intervalMinutes, durationMinutes) })} />
          <NumberField label="New slot every (minutes)" value={slots.intervalMinutes} min={slots.durationMinutes} max={720} step={15} onChange={(intervalMinutes) => setSlots({ intervalMinutes })} />
          <NumberField label="Buffer between slots (minutes)" value={slots.bufferMinutes} min={0} max={240} step={5} onChange={(bufferMinutes) => setSlots({ bufferMinutes })} />
        </>
      )}
      <NumberField
        label={proLabel('Orders per slot (0 = unlimited)', plan, true)}
        value={slots.defaultCapacity}
        min={0}
        max={100000}
        disabled={!isPro}
        onChange={(defaultCapacity) => setSlots({ defaultCapacity })}
      />
      {slots.mode === 'timeslots' && (
        <FormField label={proLabel('Slot labels', plan, true)} infoContent="Optional customer-facing names, e.g. “Morning”. Leave blank to show the time.">
          <Box direction="vertical" gap="SP2">
            {slotIds(value).map(([id, time]) => (
              <Box key={id} gap="SP2" verticalAlign="middle">
                <Box width="110px"><Text size="small">{time}</Text></Box>
                <Box width="220px">
                  <Input
                    size="small"
                    disabled={!isPro}
                    value={slots.labels[id] ?? ''}
                    placeholder={time}
                    maxLength={60}
                    ariaLabel={`Label for ${time}`}
                    onChange={(e) => {
                      const labels = { ...slots.labels };
                      if (e.target.value) labels[id] = e.target.value;
                      else delete labels[id];
                      setSlots({ labels });
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </FormField>
      )}
    </Box>
  );
};
