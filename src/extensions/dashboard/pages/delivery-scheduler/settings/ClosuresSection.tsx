import React from 'react';
import { Box, DatePicker, FormField, IconButton, Input, Text, TextButton } from '@wix/design-system';
import { Add, Delete } from '@wix/wix-ui-icons-common/lazy';
import { displayDate, pickedDateToLocal } from '../labels';
import { DateListEditor } from './DateListEditor';
import type { SectionProps } from './fields';

const toPicker = (localDate: string) => {
  const [y = 1970, m = 1, d = 1] = localDate.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const ClosuresSection = ({ value, update }: SectionProps) => {
  const today = pickedDateToLocal(new Date()) ?? '2026-01-01';
  return (
    <Box direction="vertical" gap="SP5">
      <FormField label="Blocked dates (all methods)">
        <DateListEditor value={value.blockedDates} onChange={(blockedDates) => update({ blockedDates })} />
      </FormField>

      <FormField label="Yearly holidays" infoContent="Repeat every year on the same month and day (MM-DD).">
        <Box direction="vertical" gap="SP2">
          {value.holidayRules.map((rule, index) => (
            <Box key={index} gap="SP2" verticalAlign="middle">
              <Box width="200px">
                <Input size="small" value={rule.name} placeholder="Holiday name" maxLength={80} ariaLabel="Holiday name"
                  onChange={(e) => update({ holidayRules: value.holidayRules.map((r, i) => (i === index ? { ...r, name: e.target.value } : r)) })} />
              </Box>
              <Box width="90px">
                <Input size="small" value={rule.monthDay} placeholder="12-25" ariaLabel="Month and day"
                  onChange={(e) => update({ holidayRules: value.holidayRules.map((r, i) => (i === index ? { ...r, monthDay: e.target.value } : r)) })} />
              </Box>
              <IconButton size="small" ariaLabel="Remove holiday" onClick={() => update({ holidayRules: value.holidayRules.filter((_, i) => i !== index) })}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <TextButton size="small" prefixIcon={<Add />} onClick={() => update({ holidayRules: [...value.holidayRules, { name: '', monthDay: '12-25' }] })}>
            Add holiday
          </TextButton>
        </Box>
      </FormField>

      <FormField label="Vacation / closure periods" infoContent="Closures always win over special opening hours and product rules.">
        <Box direction="vertical" gap="SP2">
          {value.vacationRanges.map((range, index) => {
            const set = (patch: Partial<typeof range>) =>
              update({ vacationRanges: value.vacationRanges.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
            return (
              <Box key={index} gap="SP2" verticalAlign="middle">
                <Box width="150px"><DatePicker width="100%" value={toPicker(range.start)} onChange={(d) => set({ start: pickedDateToLocal(d) ?? range.start })} /></Box>
                <Text size="small">to</Text>
                <Box width="150px"><DatePicker width="100%" value={toPicker(range.end)} onChange={(d) => set({ end: pickedDateToLocal(d) ?? range.end })} /></Box>
                <Box width="180px"><Input size="small" value={range.label} placeholder="Label (optional)" maxLength={80} ariaLabel="Closure label" onChange={(e) => set({ label: e.target.value })} /></Box>
                <IconButton size="small" ariaLabel={`Remove closure ${displayDate(range.start)}`} onClick={() => update({ vacationRanges: value.vacationRanges.filter((_, i) => i !== index) })}>
                  <Delete />
                </IconButton>
              </Box>
            );
          })}
          <TextButton size="small" prefixIcon={<Add />} onClick={() => update({ vacationRanges: [...value.vacationRanges, { start: today, end: today, label: '' }] })}>
            Add closure
          </TextButton>
        </Box>
      </FormField>
    </Box>
  );
};
