import React from 'react';
import { withDashboard } from '@wix/patterns';
import { WixPatternsProvider } from '@wix/patterns/provider';
import { PatternsReactRoute, PatternsReactRouter } from '@wix/patterns/router';
import { DashboardLayout } from './DashboardLayout';
import { LanguageProvider } from './LanguageContext';
import { OverviewPage } from './overview/OverviewPage';
import { OrdersCollectionPage } from './orders/OrdersCollectionPage';
import { OrderEntityPage } from './orders/OrderEntityPage';
import { ProductRulesCollectionPage } from './product-rules/ProductRulesCollectionPage';
import { ProductRuleEntityPage } from './product-rules/ProductRuleEntityPage';
import { SettingsPageView } from './settings/SettingsPageView';
import { HelpPage } from './help/HelpPage';
import { LogsCollectionPage } from './LogsCollectionPage';

// The provider is a parent of everything that reads the collection or the router.
export const SchedulerApp = withDashboard(() => (
  <WixPatternsProvider>
    <LanguageProvider>
      <PatternsReactRouter>
        <PatternsReactRoute type="other" path="/" element={<DashboardLayout><OverviewPage /></DashboardLayout>} />
        <PatternsReactRoute type="collection" path="/orders" element={<DashboardLayout><OrdersCollectionPage /></DashboardLayout>} />
        <PatternsReactRoute type="editEntity" path="/orders/:id" element={<DashboardLayout><OrderEntityPage /></DashboardLayout>} />
        <PatternsReactRoute type="collection" path="/product-rules" element={<DashboardLayout><ProductRulesCollectionPage /></DashboardLayout>} />
        <PatternsReactRoute type="createEntity" path="/product-rules/new" element={<DashboardLayout><ProductRuleEntityPage /></DashboardLayout>} />
        <PatternsReactRoute type="editEntity" path="/product-rules/:id" element={<DashboardLayout><ProductRuleEntityPage /></DashboardLayout>} />
        <PatternsReactRoute type="other" path="/settings" element={<DashboardLayout><SettingsPageView /></DashboardLayout>} />
        <PatternsReactRoute type="collection" path="/logs" element={<DashboardLayout><LogsCollectionPage /></DashboardLayout>} />
        <PatternsReactRoute type="other" path="/help" element={<DashboardLayout><HelpPage /></DashboardLayout>} />
      </PatternsReactRouter>
    </LanguageProvider>
  </WixPatternsProvider>
));
