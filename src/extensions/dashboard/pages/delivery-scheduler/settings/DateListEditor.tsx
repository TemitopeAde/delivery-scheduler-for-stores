import React from 'react';
import { Box, DatePicker, IconButton, Input, Text, TextButton } from '@wix/design-system';
import { Add, Delete } from '@wix/wix-ui-icons-common/lazy';
import type { TimeInterval } from '../../../../../lib/schemas';
import { displayDate, pickedDateToLocal } from '../labels';
import { useDashboardI18n } from '../LanguageContext';

const toPicker = (localDate: string) => {
  const [y = 1970, m = 1, d = 1] = localDate.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** A sorted list of blocked dates. */
export const DateListEditor = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => {
  const { t, locale } = useDashboardI18n();
  return (
    <Box direction="vertical" gap="SP2">
      {value.length === 0 && <Text size="small" secondary>{t('settings.noDates')}</Text>}
      {value.map((date) => (
        <Box key={date} gap="SP2" verticalAlign="middle">
          <Text size="small">{displayDate(date, locale)}</Text>
          <IconButton size="small" ariaLabel={`${t('settings.remove')} ${date}`} onClick={() => onChange(value.filter((d) => d !== date))}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Box width="220px">
        <DatePicker
          width="100%"
          placeholderText={t('settings.addDate')}
          onChange={(date) => {
            const local = pickedDateToLocal(date);
            if (local && !value.includes(local)) onChange([...value, local].sort());
          }}
        />
      </Box>
    </Box>
  );
};

export interface DateOverride {
  date: string;
  intervals: TimeInterval[];
}

/** Date-specific opening hours; no intervals means closed that day. */
export const DateOverridesEditor = ({
  value,
  onChange,
}: {
  value: DateOverride[];
  onChange: (v: DateOverride[]) => void;
}) => {
  const { t } = useDashboardI18n();
  const set = (index: number, next: DateOverride) => onChange(value.map((o, i) => (i === index ? next : o)));
  return (
    <Box direction="vertical" gap="SP3">
      {value.length === 0 && <Text size="small" secondary>{t('settings.noSpecialHours')}</Text>}
      {value.map((override, index) => (
        <Box key={`${override.date}-${index}`} gap="SP2" verticalAlign="top">
          <Box width="160px">
            <DatePicker width="100%" value={toPicker(override.date)} onChange={(d) => set(index, { ...override, date: pickedDateToLocal(d) ?? override.date })} />
          </Box>
          <Box direction="vertical" gap="SP1">
            {override.intervals.length === 0 && <Text size="small" secondary>{t('settings.closed')}</Text>}
            {override.intervals.map((interval, i) => (
              <Box key={i} gap="SP1" verticalAlign="middle">
                <Box width="80px">
                  <Input size="small" value={interval.start} ariaLabel={t('settings.weeklyHours')} onChange={(e) => set(index, { ...override, intervals: override.intervals.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)) })} />
                </Box>
                <Text size="small">–</Text>
                <Box width="80px">
                  <Input size="small" value={interval.end} ariaLabel={t('settings.weeklyHours')} onChange={(e) => set(index, { ...override, intervals: override.intervals.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)) })} />
                </Box>
                <IconButton size="small" ariaLabel={t('settings.remove')} onClick={() => set(index, { ...override, intervals: override.intervals.filter((_, j) => j !== i) })}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <TextButton size="small" prefixIcon={<Add />} onClick={() => set(index, { ...override, intervals: [...override.intervals, { start: '09:00', end: '17:00' }] })}>
              {t('settings.addHours')}
            </TextButton>
          </Box>
          <IconButton size="small" ariaLabel={t('settings.remove')} onClick={() => onChange(value.filter((_, i) => i !== index))}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <TextButton
        size="small"
        prefixIcon={<Add />}
        onClick={() => onChange([...value, { date: pickedDateToLocal(new Date()) ?? '2026-01-01', intervals: [] }])}
      >
        {t('settings.addSpecialHours')}
      </TextButton>
    </Box>
  );
};
