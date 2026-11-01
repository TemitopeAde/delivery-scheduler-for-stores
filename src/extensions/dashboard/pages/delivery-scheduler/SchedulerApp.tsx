import React from 'react';
import { withDashboard } from '@wix/patterns';
import { WixPatternsProvider } from '@wix/patterns/provider';
import { PatternsReactRoute, PatternsReactRouter } from '@wix/patterns/router';
import { LanguageProvider } from './LanguageContext';
import { OverviewPage } from './overview/OverviewPage';
import { OrdersCollectionPage } from './orders/OrdersCollectionPage';
import { OrderEntityPage } from './orders/OrderEntityPage';
import { ProductRulesCollectionPage } from './product-rules/ProductRulesCollectionPage';
import { ProductRuleEntityPage } from './product-rules/ProductRuleEntityPage';
import { SettingsPageView } from './settings/SettingsPageView';
import { HelpPage } from './help/HelpPage';

// The provider is a parent of everything that reads the collection or the router.
export const SchedulerApp = withDashboard(() => (
  <WixPatternsProvider>
    <LanguageProvider>
      <PatternsReactRouter>
        <PatternsReactRoute type="other" path="/" element={<OverviewPage />} />
        <PatternsReactRoute type="collection" path="/orders" element={<OrdersCollectionPage />} />
        <PatternsReactRoute type="editEntity" path="/orders/:id" element={<OrderEntityPage />} />
        <PatternsReactRoute type="collection" path="/product-rules" element={<ProductRulesCollectionPage />} />
        <PatternsReactRoute type="createEntity" path="/product-rules/new" element={<ProductRuleEntityPage />} />
        <PatternsReactRoute type="editEntity" path="/product-rules/:id" element={<ProductRuleEntityPage />} />
        <PatternsReactRoute type="other" path="/settings" element={<SettingsPageView />} />
        <PatternsReactRoute type="other" path="/help" element={<HelpPage />} />
      </PatternsReactRouter>
    </LanguageProvider>
  </WixPatternsProvider>
));
