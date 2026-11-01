import React from 'react';
import { Box, DatePicker, FormField, IconButton, Input, Text, TextButton } from '@wix/design-system';
import { Add, Delete } from '@wix/wix-ui-icons-common/lazy';
import { displayDate, pickedDateToLocal } from '../labels';
import { DateListEditor } from './DateListEditor';
import type { SectionProps } from './fields';
import { useDashboardI18n } from '../LanguageContext';

const toPicker = (localDate: string) => {
  const [y = 1970, m = 1, d = 1] = localDate.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const ClosuresSection = ({ value, update }: SectionProps) => {
  const { t, locale } = useDashboardI18n();
  const today = pickedDateToLocal(new Date()) ?? '2026-01-01';

  return (
    <Box direction="vertical" gap="SP5">
      <FormField label={t('settings.blockedDates')}>
        <DateListEditor value={value.blockedDates} onChange={(blockedDates) => update({ blockedDates })} />
      </FormField>

      <FormField label={t('settings.yearlyHolidays')} infoContent={t('settings.yearlyHolidaysInfo')}>
        <Box direction="vertical" gap="SP2">
          {value.holidayRules.map((rule, index) => (
            <Box key={index} gap="SP2" verticalAlign="middle">
              <Box width="200px">
                <Input size="small" value={rule.name} placeholder={t('settings.holidayName')} maxLength={80} ariaLabel={t('settings.holidayName')}
                  onChange={(e) => update({ holidayRules: value.holidayRules.map((r, i) => (i === index ? { ...r, name: e.target.value } : r)) })} />
              </Box>
              <Box width="90px">
                <Input size="small" value={rule.monthDay} placeholder="12-25" ariaLabel={t('settings.monthDay')}
                  onChange={(e) => update({ holidayRules: value.holidayRules.map((r, i) => (i === index ? { ...r, monthDay: e.target.value } : r)) })} />
              </Box>
              <IconButton size="small" ariaLabel={t('settings.remove')} onClick={() => update({ holidayRules: value.holidayRules.filter((_, i) => i !== index) })}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <TextButton size="small" prefixIcon={<Add />} onClick={() => update({ holidayRules: [...value.holidayRules, { name: '', monthDay: '12-25' }] })}>
            {t('settings.addHoliday')}
          </TextButton>
        </Box>
      </FormField>

      <FormField label={t('settings.vacations')} infoContent={t('settings.vacationsInfo')}>
        <Box direction="vertical" gap="SP2">
          {value.vacationRanges.map((range, index) => {
            const set = (patch: Partial<typeof range>) =>
              update({ vacationRanges: value.vacationRanges.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
            return (
              <Box key={index} gap="SP2" verticalAlign="middle">
                <Box width="150px"><DatePicker width="100%" value={toPicker(range.start)} onChange={(d) => set({ start: pickedDateToLocal(d) ?? range.start })} /></Box>
                <Text size="small">{t('settings.to')}</Text>
                <Box width="150px"><DatePicker width="100%" value={toPicker(range.end)} onChange={(d) => set({ end: pickedDateToLocal(d) ?? range.end })} /></Box>
                <Box width="180px"><Input size="small" value={range.label} placeholder={t('settings.closureLabel')} maxLength={80} ariaLabel={t('settings.closureLabel')} onChange={(e) => set({ label: e.target.value })} /></Box>
                <IconButton size="small" ariaLabel={`${t('settings.remove')} ${displayDate(range.start, locale)}`} onClick={() => update({ vacationRanges: value.vacationRanges.filter((_, i) => i !== index) })}>
                  <Delete />
                </IconButton>
              </Box>
            );
          })}
          <TextButton size="small" prefixIcon={<Add />} onClick={() => update({ vacationRanges: [...value.vacationRanges, { start: today, end: today, label: '' }] })}>
            {t('settings.addClosure')}
          </TextButton>
        </Box>
      </FormField>
    </Box>
  );
};
