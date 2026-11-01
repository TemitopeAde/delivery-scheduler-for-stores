import React from 'react';
import { Box, SectionHelper } from '@wix/design-system';
import { TextField, ToggleField, type SectionProps } from './fields';

export const NotificationsSection = ({ value, update }: SectionProps) => {
  const n = value.notificationSettings;
  const set = (patch: Partial<typeof n>) => update({ notificationSettings: { ...n, ...patch } });
  return (
    <Box direction="vertical" gap="SP4">
      <SectionHelper skin="warning" title="Email delivery isn't active yet">
        These preferences are saved now, but no emails are sent until the Wix email API this app will use has been
        verified for your site. Orders that need attention always appear on the Overview and Orders pages.
      </SectionHelper>
      <ToggleField label="Customer: order scheduled" checked={n.customerScheduled} onChange={(customerScheduled) => set({ customerScheduled })} />
      <ToggleField label="Merchant: new scheduled order" checked={n.merchantNewOrder} onChange={(merchantNewOrder) => set({ merchantNewOrder })} />
      <ToggleField label="Customer: schedule changed by you" checked={n.scheduleChanged} onChange={(scheduleChanged) => set({ scheduleChanged })} />
      <ToggleField label="Merchant: schedule needs review" checked={n.needsReview} onChange={(needsReview) => set({ needsReview })} />
      <ToggleField label="Merchant: upcoming fulfilment summary" checked={n.upcomingSummary} onChange={(upcomingSummary) => set({ upcomingSummary })} />
      <TextField label="Merchant notification email" value={n.merchantEmail} maxLength={254} placeholder="orders@yourstore.com" onChange={(merchantEmail) => set({ merchantEmail })} />
    </Box>
  );
};
