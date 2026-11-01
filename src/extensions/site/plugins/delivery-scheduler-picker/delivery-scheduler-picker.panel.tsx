import React, { type FC } from 'react';
import { SidePanel, WixDesignSystemProvider, Text, Box } from '@wix/design-system';
import '@wix/design-system/styles.global.css';

/**
 * All widget settings (hours, capacity, copy, colours) live in the app's
 * dashboard so they are validated server-side and shared with the checkout
 * validator. The editor panel only points there.
 */
const Panel: FC = () => (
  <WixDesignSystemProvider>
    <SidePanel width="300" height="100vh">
      <SidePanel.Header title="Delivery Scheduler" />
      <SidePanel.Content>
        <Box direction="vertical" gap="12px">
          <Text size="small">
            Customers pick a delivery or pickup time here during checkout. The editor shows a preview with
            sample dates.
          </Text>
          <Text size="small">
            To change opening hours, capacity, labels, colours or fonts, open Delivery Scheduler in your site
            dashboard and go to Settings.
          </Text>
        </Box>
      </SidePanel.Content>
    </SidePanel>
  </WixDesignSystemProvider>
);

export default Panel;
