import React from 'react';
import { Dropdown, FormField } from '@wix/design-system';
import { useController, type Control } from '@wix/patterns/form';
import { MERCHANT_SCHEDULE_STATUSES, type MerchantScheduleStatus } from '../../../../../lib/schemas';
import { SCHEDULE_STATUS_LABELS } from '../labels';
import type { OrderFormFields } from './OrderEntityPage';

export const StatusField = ({
  control,
  defaultValue,
  disabled,
}: {
  control: Control<OrderFormFields>;
  defaultValue: MerchantScheduleStatus | '';
  disabled: boolean;
}) => {
  const { field } = useController({ name: 'scheduleStatus', control, defaultValue });
  return (
    <FormField
      label="Fulfilment status"
      infoContent={disabled ? 'Schedule the order (or restore it) before changing its status.' : undefined}
    >
      <Dropdown
        disabled={disabled}
        placeholder="Choose a status"
        selectedId={field.value || undefined}
        options={MERCHANT_SCHEDULE_STATUSES.map((s) => ({ id: s, value: SCHEDULE_STATUS_LABELS[s] }))}
        onSelect={(option) => field.onChange(String(option.id))}
      />
    </FormField>
  );
};
