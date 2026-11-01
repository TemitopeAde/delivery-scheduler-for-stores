import React from 'react';
import { Box, DatePicker, Dropdown, FormField, Text } from '@wix/design-system';
import { useController, type Control } from '@wix/patterns/form';
import { buildSlotWindows, openingIntervals } from '../../../../../lib/engine/slots';
import type { FulfilmentMethod, Settings } from '../../../../../lib/schemas';
import { minutesToHHmm } from '../../../../../lib/time/zoned';
import type { ScheduledOrder } from '../dashboard-api';
import { getMethodLabel, pickedDateToLocal } from '../labels';
import { useDashboardI18n } from '../LanguageContext';
import type { OrderFormFields } from './OrderEntityPage';

export interface RescheduleValue {
  method: FulfilmentMethod | null;
  localDate: string | null;
  slotId: string | null;
}

function toPickerDate(localDate: string | null): Date | undefined {
  if (!localDate) return undefined;
  const [y = 1970, m = 1, d = 1] = localDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const RescheduleFields = ({
  control,
  order,
  settings,
}: {
  control: Control<OrderFormFields>;
  order: ScheduledOrder;
  settings: Settings;
}) => {
  const { t } = useDashboardI18n();
  const { field } = useController({
    name: 'reschedule',
    control,
    defaultValue: { method: order.fulfilmentMethod, localDate: order.localDate, slotId: order.slotId },
  });
  const value = field.value;
  const methods = (['delivery', 'pickup'] as const).filter((m) =>
    m === 'delivery' ? settings.delivery.enabled : settings.pickup.enabled,
  );
  const slots =
    value.method && value.localDate
      ? buildSlotWindows(settings, openingIntervals(settings, value.method, value.localDate).intervals)
      : [];

  return (
    <Box direction="vertical" gap="SP4">
      <FormField label={t('orderDetail.method')}>
        <Dropdown
          selectedId={value.method ?? undefined}
          placeholder={t('orderDetail.chooseMethod')}
          options={methods.map((m) => ({ id: m, value: getMethodLabel(m, t) }))}
          onSelect={(o) => field.onChange({ ...value, method: o.id === 'pickup' ? 'pickup' : 'delivery', slotId: null })}
        />
      </FormField>
      <FormField label={t('orders.colScheduled')}>
        <DatePicker
          width="100%"
          value={toPickerDate(value.localDate)}
          onChange={(date) => field.onChange({ ...value, localDate: pickedDateToLocal(date) ?? null, slotId: null })}
        />
      </FormField>
      <FormField label={t('orderDetail.chooseSlot')}>
        {slots.length === 0 ? (
          <Text size="small" secondary>
            {value.localDate ? t('settings.closed') : t('orderDetail.chooseDate')}
          </Text>
        ) : (
          <Dropdown
            selectedId={value.slotId ?? undefined}
            placeholder={t('orderDetail.chooseSlot')}
            options={slots.map((s) => ({
              id: s.slotId,
              value:
                settings.slots.labels[s.slotId] ??
                (s.slotId === 'day' ? t('orderDetail.anyTime') : `${minutesToHHmm(s.startMinutes)}–${minutesToHHmm(s.endMinutes)}`),
            }))}
            onSelect={(o) => field.onChange({ ...value, slotId: String(o.id) })}
          />
        )}
      </FormField>
    </Box>
  );
};
