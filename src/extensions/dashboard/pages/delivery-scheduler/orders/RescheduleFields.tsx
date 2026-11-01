import React from 'react';
import { Box, DatePicker, Dropdown, FormField, Text } from '@wix/design-system';
import { useController, type Control } from '@wix/patterns/form';
import { buildSlotWindows, openingIntervals } from '../../../../../lib/engine/slots';
import type { FulfilmentMethod, Settings } from '../../../../../lib/schemas';
import { minutesToHHmm } from '../../../../../lib/time/zoned';
import type { ScheduledOrder } from '../dashboard-api';
import { METHOD_LABELS, pickedDateToLocal } from '../labels';
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

/**
 * Slot options come from the same pure rules the backend uses, so the merchant
 * only sees times that exist; the server still re-validates and enforces capacity.
 */
export const RescheduleFields = ({
  control,
  order,
  settings,
}: {
  control: Control<OrderFormFields>;
  order: ScheduledOrder;
  settings: Settings;
}) => {
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
      <FormField label="Method">
        <Dropdown
          selectedId={value.method ?? undefined}
          placeholder="Choose a method"
          options={methods.map((m) => ({ id: m, value: METHOD_LABELS[m] }))}
          onSelect={(o) => field.onChange({ ...value, method: o.id === 'pickup' ? 'pickup' : 'delivery', slotId: null })}
        />
      </FormField>
      <FormField label="Date">
        <DatePicker
          width="100%"
          value={toPickerDate(value.localDate)}
          onChange={(date) => field.onChange({ ...value, localDate: pickedDateToLocal(date) ?? null, slotId: null })}
        />
      </FormField>
      <FormField label="Time">
        {slots.length === 0 ? (
          <Text size="small" secondary>
            {value.localDate ? 'Closed on this date for the selected method.' : 'Choose a date first.'}
          </Text>
        ) : (
          <Dropdown
            selectedId={value.slotId ?? undefined}
            placeholder="Choose a time"
            options={slots.map((s) => ({
              id: s.slotId,
              value:
                settings.slots.labels[s.slotId] ??
                (s.slotId === 'day' ? 'Any time' : `${minutesToHHmm(s.startMinutes)}–${minutesToHHmm(s.endMinutes)}`),
            }))}
            onSelect={(o) => field.onChange({ ...value, slotId: String(o.id) })}
          />
        )}
      </FormField>
    </Box>
  );
};
