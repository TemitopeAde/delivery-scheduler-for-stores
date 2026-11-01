import React from 'react';
import { Dropdown, FormField } from '@wix/design-system';
import { useController, type Control } from '@wix/patterns/form';
import { MERCHANT_SCHEDULE_STATUSES, type MerchantScheduleStatus } from '../../../../../lib/schemas';
import { getScheduleStatusLabel } from '../labels';
import { useDashboardI18n } from '../LanguageContext';
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
  const { t } = useDashboardI18n();
  const { field } = useController({ name: 'scheduleStatus', control, defaultValue });
  return (
    <FormField
      label={t('orderDetail.statusField')}
      infoContent={disabled ? t('orderDetail.statusFieldInfo') : undefined}
    >
      <Dropdown
        disabled={disabled}
        placeholder={t('orderDetail.chooseStatus')}
        selectedId={field.value || undefined}
        options={MERCHANT_SCHEDULE_STATUSES.map((s) => ({ id: s, value: getScheduleStatusLabel(s, t) }))}
        onSelect={(option) => field.onChange(String(option.id))}
      />
    </FormField>
  );
};
