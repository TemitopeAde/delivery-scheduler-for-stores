import React from 'react';
import { Box, FormField } from '@wix/design-system';
import type { SettingsInput } from '../../../../../lib/schemas';
import { DateListEditor, DateOverridesEditor } from './DateListEditor';
import { NumberField, TextField, ToggleField, proLabel, type SectionProps } from './fields';
import { WeekHoursEditor } from './WeekHoursEditor';
import { useDashboardI18n } from '../LanguageContext';

type MethodKey = 'delivery' | 'pickup';

export const MethodSection = ({ value, update, plan, method }: SectionProps & { method: MethodKey }) => {
  const { t } = useDashboardI18n();
  const config = value[method];
  const set = (patch: Partial<SettingsInput[MethodKey]>) =>
    method === 'delivery'
      ? update({ delivery: { ...value.delivery, ...patch } })
      : update({ pickup: { ...value.pickup, ...patch } });
  const otherEnabled = method === 'delivery' ? value.pickup.enabled : value.delivery.enabled;

  return (
    <Box direction="vertical" gap="SP4">
      <ToggleField
        label={proLabel(method === 'delivery' ? t('settings.offerDelivery') : t('settings.offerPickup'), plan, otherEnabled)}
        checked={config.enabled}
        onChange={(enabled) => set({ enabled })}
        info={plan === 'pro' ? undefined : t('settings.bothMethodsInfo')}
      />
      {method === 'pickup' && (
        <>
          <TextField label={t('settings.pickupLocationName')} value={value.pickup.locationName} maxLength={120} onChange={(locationName) => set({ locationName })} />
          <TextField label={t('settings.pickupAddress')} value={value.pickup.locationAddress} maxLength={300} onChange={(locationAddress) => set({ locationAddress })} />
          <TextField label={t('settings.pickupInstructions')} multiline value={value.pickup.instructions} maxLength={500} onChange={(instructions) => set({ instructions })} />
        </>
      )}
      {method === 'delivery' && (
        <TextField label={t('settings.deliveryNote')} multiline value={value.delivery.note} maxLength={500} onChange={(note) => set({ note })} />
      )}
      <FormField label={t('settings.weeklyHours')}>
        <WeekHoursEditor value={config.workingHours} onChange={(workingHours) => set({ workingHours })} />
      </FormField>
      <FormField label={t('settings.specialHours')}>
        <DateOverridesEditor value={config.dateOverrides} onChange={(dateOverrides) => set({ dateOverrides })} />
      </FormField>
      <FormField label={t('settings.blockedDatesMethod', { method: method === 'delivery' ? t('common.delivery') : t('common.pickup') })}>
        <DateListEditor value={config.blockedDates} onChange={(blockedDates) => set({ blockedDates })} />
      </FormField>
      <NumberField
        label={proLabel(t('settings.dailyCapacity'), plan, true)}
        value={config.dailyCapacity}
        min={0}
        max={100000}
        disabled={plan !== 'pro'}
        onChange={(dailyCapacity) => set({ dailyCapacity })}
      />
    </Box>
  );
};
