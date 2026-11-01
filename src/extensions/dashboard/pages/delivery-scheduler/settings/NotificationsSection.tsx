import React from 'react';
import { Box, SectionHelper } from '@wix/design-system';
import { TextField, ToggleField, type SectionProps } from './fields';
import { useDashboardI18n } from '../LanguageContext';

export const NotificationsSection = ({ value, update }: SectionProps) => {
  const { t } = useDashboardI18n();
  const n = value.notificationSettings;
  const set = (patch: Partial<typeof n>) => update({ notificationSettings: { ...n, ...patch } });

  return (
    <Box direction="vertical" gap="SP4">
      <SectionHelper skin="warning" title={t('settings.emailWarningTitle')}>
        {t('settings.emailWarning')}
      </SectionHelper>
      <ToggleField label={t('settings.notifCustomerScheduled')} checked={n.customerScheduled} onChange={(customerScheduled) => set({ customerScheduled })} />
      <ToggleField label={t('settings.notifMerchantNewOrder')} checked={n.merchantNewOrder} onChange={(merchantNewOrder) => set({ merchantNewOrder })} />
      <ToggleField label={t('settings.notifScheduleChanged')} checked={n.scheduleChanged} onChange={(scheduleChanged) => set({ scheduleChanged })} />
      <ToggleField label={t('settings.notifNeedsReview')} checked={n.needsReview} onChange={(needsReview) => set({ needsReview })} />
      <ToggleField label={t('settings.notifUpcomingSummary')} checked={n.upcomingSummary} onChange={(upcomingSummary) => set({ upcomingSummary })} />
      <TextField label={t('settings.merchantEmail')} value={n.merchantEmail} maxLength={254} placeholder="orders@yourstore.com" onChange={(merchantEmail) => set({ merchantEmail })} />
    </Box>
  );
};
