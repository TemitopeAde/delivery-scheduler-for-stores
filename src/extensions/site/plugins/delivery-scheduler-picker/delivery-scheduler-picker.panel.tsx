import React, { type FC } from 'react';
import { SidePanel, WixDesignSystemProvider, Text, Box } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { getDashboardMessages } from '../../../../lib/i18n/dashboard-messages';

/**
 * All widget settings (hours, capacity, copy, colours) live in the app's
 * dashboard so they are validated server-side and shared with the checkout
 * validator. The editor panel points there.
 */
const Panel: FC = () => {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang?.split('-')[0] || 'en' : 'en';
  const m = getDashboardMessages(lang);

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Header title={m['overview.title']} />
        <SidePanel.Content>
          <Box direction="vertical" gap="12px">
            <Text size="small">
              {m['orders.emptySubtitle']}
            </Text>
            <Text size="small">
              {m['settings.subtitle']}
            </Text>
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
