import React from 'react';
import { Box, FormField, Input, Text } from '@wix/design-system';
import { BASIC_MAX_DAYS_AHEAD } from '../../../../../lib/constants';
import { buildSlotWindows } from '../../../../../lib/engine/slots';
import { DEFAULT_SETTINGS } from '../../../../../lib/defaults';
import { WEEKDAYS } from '../../../../../lib/schemas';
import { minutesToHHmm } from '../../../../../lib/time/zoned';
import { NumberField, SelectField, ToggleField, proLabel, type SectionProps } from './fields';
import { useDashboardI18n } from '../LanguageContext';

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
  const { t } = useDashboardI18n();
  const slots = value.slots;
  const setSlots = (patch: Partial<typeof slots>) => update({ slots: { ...slots, ...patch } });
  const isPro = plan === 'pro';

  return (
    <Box direction="vertical" gap="SP4">
      <NumberField
        label={t('settings.minNotice')}
        value={value.minNoticeMinutes / 60}
        min={0}
        max={1440}
        step={0.5}
        onChange={(h) => update({ minNoticeMinutes: Math.round(h * 60) })}
      />
      <NumberField
        label={proLabel(t('settings.maxDaysAhead'), plan, value.maxDaysAhead > BASIC_MAX_DAYS_AHEAD)}
        value={value.maxDaysAhead}
        min={0}
        max={isPro ? 365 : BASIC_MAX_DAYS_AHEAD}
        onChange={(maxDaysAhead) => update({ maxDaysAhead })}
      />
      <ToggleField label={t('settings.sameDay')} checked={value.sameDayEnabled} onChange={(sameDayEnabled) => update({ sameDayEnabled })} />
      <ToggleField
        label={t('settings.cutoff')}
        checked={value.cutoff.enabled}
        onChange={(enabled) => update({ cutoff: { ...value.cutoff, enabled } })}
        info={t('settings.cutoffInfo')}
      />
      {value.cutoff.enabled && (
        <FormField label={t('settings.cutoffTime')}>
          <Box width="120px">
            <Input value={value.cutoff.time} onChange={(e) => update({ cutoff: { ...value.cutoff, time: e.target.value } })} />
          </Box>
        </FormField>
      )}
      <SelectField
        label={t('settings.customerChooses')}
        value={slots.mode}
        options={[
          { id: 'timeslots', label: t('settings.modeSlots') },
          { id: 'dateOnly', label: t('settings.modeDateOnly') },
        ]}
        onChange={(mode) => setSlots({ mode })}
      />
      {slots.mode === 'timeslots' && (
        <>
          <NumberField label={t('settings.slotInterval')} value={slots.durationMinutes} min={15} max={720} step={15} onChange={(durationMinutes) => setSlots({ durationMinutes, intervalMinutes: Math.max(slots.intervalMinutes, durationMinutes) })} />
          <NumberField label={t('settings.slotInterval')} value={slots.intervalMinutes} min={slots.durationMinutes} max={720} step={15} onChange={(intervalMinutes) => setSlots({ intervalMinutes })} />
          <NumberField label={t('settings.slotBuffer')} value={slots.bufferMinutes} min={0} max={240} step={5} onChange={(bufferMinutes) => setSlots({ bufferMinutes })} />
        </>
      )}
      <NumberField
        label={proLabel(t('settings.slotCapacity'), plan, true)}
        value={slots.defaultCapacity}
        min={0}
        max={100000}
        disabled={!isPro}
        onChange={(defaultCapacity) => setSlots({ defaultCapacity })}
      />
      {slots.mode === 'timeslots' && (
        <FormField label={proLabel(t('settings.customSlotLabels'), plan, true)} infoContent={t('settings.customSlotLabelsInfo')}>
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
