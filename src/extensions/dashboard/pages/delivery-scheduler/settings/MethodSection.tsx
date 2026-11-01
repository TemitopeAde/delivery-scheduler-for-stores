import React from 'react';
import { Box, FormField } from '@wix/design-system';
import type { SettingsInput } from '../../../../../lib/schemas';
import { DateListEditor, DateOverridesEditor } from './DateListEditor';
import { NumberField, TextField, ToggleField, proLabel, type SectionProps } from './fields';
import { WeekHoursEditor } from './WeekHoursEditor';

type MethodKey = 'delivery' | 'pickup';

export const MethodSection = ({ value, update, plan, method }: SectionProps & { method: MethodKey }) => {
  const config = value[method];
  const set = (patch: Partial<SettingsInput[MethodKey]>) =>
    method === 'delivery'
      ? update({ delivery: { ...value.delivery, ...patch } })
      : update({ pickup: { ...value.pickup, ...patch } });
  const otherEnabled = method === 'delivery' ? value.pickup.enabled : value.delivery.enabled;

  return (
    <Box direction="vertical" gap="SP4">
      <ToggleField
        label={proLabel(method === 'delivery' ? 'Offer delivery' : 'Offer pickup', plan, otherEnabled)}
        checked={config.enabled}
        onChange={(enabled) => set({ enabled })}
        info={plan === 'pro' ? undefined : 'Offering both delivery and pickup is a Pro feature.'}
      />
      {method === 'pickup' && (
        <>
          <TextField label="Pickup location name" value={value.pickup.locationName} maxLength={120} onChange={(locationName) => set({ locationName })} />
          <TextField label="Pickup address" value={value.pickup.locationAddress} maxLength={300} onChange={(locationAddress) => set({ locationAddress })} />
          <TextField label="Pickup instructions" multiline value={value.pickup.instructions} maxLength={500} onChange={(instructions) => set({ instructions })} />
        </>
      )}
      {method === 'delivery' && (
        <TextField label="Delivery note shown to customers" multiline value={value.delivery.note} maxLength={500} onChange={(note) => set({ note })} />
      )}
      <FormField label="Weekly hours">
        <WeekHoursEditor value={config.workingHours} onChange={(workingHours) => set({ workingHours })} />
      </FormField>
      <FormField label="Special hours for specific dates">
        <DateOverridesEditor value={config.dateOverrides} onChange={(dateOverrides) => set({ dateOverrides })} />
      </FormField>
      <FormField label={`Blocked dates (${method} only)`}>
        <DateListEditor value={config.blockedDates} onChange={(blockedDates) => set({ blockedDates })} />
      </FormField>
      <NumberField
        label={proLabel('Orders per day (0 = unlimited)', plan, true)}
        value={config.dailyCapacity}
        min={0}
        max={100000}
        disabled={plan !== 'pro'}
        onChange={(dailyCapacity) => set({ dailyCapacity })}
      />
    </Box>
  );
};
