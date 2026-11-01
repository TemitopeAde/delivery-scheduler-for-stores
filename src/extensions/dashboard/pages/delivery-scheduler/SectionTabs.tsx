import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Tabs } from '@wix/design-system';
import { useDashboardI18n } from './LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { DashboardMessageKey } from '../../../../lib/i18n/dashboard-messages';

interface SectionDef {
  id: string;
  titleKey: DashboardMessageKey;
}

const SECTIONS: readonly SectionDef[] = [
  { id: '/', titleKey: 'nav.overview' },
  { id: '/orders', titleKey: 'nav.orders' },
  { id: '/product-rules', titleKey: 'nav.productRules' },
  { id: '/settings', titleKey: 'nav.settings' },
  { id: '/help', titleKey: 'nav.help' },
] as const;

/** Section navigation shared by every route; the active tab follows the router path. */
export const SectionTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useDashboardI18n();

  const active =
    [...SECTIONS].reverse().find((s) => s.id !== '/' && pathname.startsWith(s.id))?.id ?? '/';

  return (
    <Box align="space-between" verticalAlign="middle" width="100%" marginBottom="SP3">
      <Tabs
        items={SECTIONS.map((s) => ({ id: s.id, title: t(s.titleKey) }))}
        activeId={active}
        type="compactSide"
        onClick={(item) => navigate(String(item.id))}
      />
      <LanguageSwitcher />
    </Box>
  );
};
