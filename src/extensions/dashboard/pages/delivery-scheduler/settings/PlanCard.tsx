import React from 'react';
import { Badge, Box, Text } from '@wix/design-system';
import type { Entitlement } from '../dashboard-api';
import { useDashboardI18n } from '../LanguageContext';

export const PlanCard = ({ entitlement }: { entitlement: Entitlement | null }) => {
  const { t, locale } = useDashboardI18n();
  if (!entitlement) return null;
  const pro = entitlement.plan === 'pro';

  const proFeatures = [
    t('plan.f1'),
    t('plan.f2'),
    t('plan.f3'),
    t('plan.f4'),
    t('plan.f5'),
    t('plan.f6'),
  ];

  return (
    <Box direction="vertical" gap="SP3">
      <Box gap="SP2" verticalAlign="middle">
        <Text weight="bold">{t('plan.current')}</Text>
        <Badge size="small" skin={pro ? 'premium' : 'neutralLight'}>
          {pro ? t('plan.pro') : t('plan.basic')}
        </Badge>
      </Box>
      {!entitlement.verified && (
        <Text size="small" skin="error">{t('plan.unverified')}</Text>
      )}
      {entitlement.expiresAt && (
        <Text size="small" secondary>
          {t('plan.renews', { date: new Date(entitlement.expiresAt).toLocaleDateString(locale) })}
        </Text>
      )}
      {!pro && (
        <>
          <Text size="small">{t('plan.proAdds')}</Text>
          <Box direction="vertical" gap="SP1">
            {proFeatures.map((f) => (
              <Text key={f} size="small">• {f}</Text>
            ))}
          </Box>
          <Text size="small" secondary>{t('plan.upgradeNote')}</Text>
        </>
      )}
    </Box>
  );
};
