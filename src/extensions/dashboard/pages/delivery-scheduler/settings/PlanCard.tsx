import React from 'react';
import { Badge, Box, Text } from '@wix/design-system';
import type { Entitlement } from '../dashboard-api';

const PRO_FEATURES = [
  'Delivery and pickup together',
  'Product preparation times, methods and custom hours',
  'Per-slot and per-day capacity',
  'Booking more than 30 days ahead',
  'Custom slot labels and customer-facing text',
  'CSV export',
];

export const PlanCard = ({ entitlement }: { entitlement: Entitlement | null }) => {
  if (!entitlement) return null;
  const pro = entitlement.plan === 'pro';
  return (
    <Box direction="vertical" gap="SP3">
      <Box gap="SP2" verticalAlign="middle">
        <Text weight="bold">Current plan</Text>
        <Badge size="small" skin={pro ? 'premium' : 'neutralLight'}>{pro ? 'Pro' : 'Basic'}</Badge>
      </Box>
      {!entitlement.verified && (
        <Text size="small" skin="error">We couldn't confirm your plan right now, so Basic limits apply.</Text>
      )}
      {entitlement.expiresAt && <Text size="small" secondary>Renews or ends {new Date(entitlement.expiresAt).toLocaleDateString()}.</Text>}
      {!pro && (
        <>
          <Text size="small">Pro adds:</Text>
          <Box direction="vertical" gap="SP1">
            {PRO_FEATURES.map((f) => (
              <Text key={f} size="small">• {f}</Text>
            ))}
          </Box>
          <Text size="small" secondary>To upgrade, open Delivery Scheduler from Manage Apps in your site dashboard and choose Upgrade.</Text>
        </>
      )}
    </Box>
  );
};
