import React from 'react';
import { Badge, Box } from '@wix/design-system';
import {
  CollectionEmptyState,
  CollectionErrorState,
  CollectionNoResultsState,
  CollectionSearch,
  PrimaryActions,
  Table,
  useTableCollection,
} from '@wix/patterns';
import { CollectionPage } from '@wix/patterns/page';
import { usePatternsNavigate } from '@wix/patterns/router';
import type { ProductRule } from '../../../../../lib/schemas';
import { api } from '../dashboard-api';
import { getMethodLabel } from '../labels';
import { SectionTabs } from '../SectionTabs';
import { useDashboardI18n } from '../LanguageContext';

export const ProductRulesCollectionPage = () => {
  const { navigateToEntityPage } = usePatternsNavigate<ProductRule>();
  const { t } = useDashboardI18n();
  const openNew = () => navigateToEntityPage({ path: '/product-rules/new' });

  const prepLabel = (minutes: number): string => {
    if (minutes === 0) return t('productRules.none');
    if (minutes % (60 * 24) === 0) return t('productRules.days', { count: minutes / (60 * 24) });
    if (minutes % 60 === 0) return t('productRules.hours', { count: minutes / 60 });
    return t('productRules.minutes', { count: minutes });
  };

  const state = useTableCollection<ProductRule, Record<string, never>>({
    queryName: 'product-rules',
    paginationMode: 'cursor',
    itemKey: (r) => r.productId,
    itemName: (r) => r.productName || r.productId,
    filters: {},
    fetchData: async (query) => {
      const page = await api.listRules(query.limit, query.cursor ? Number(query.cursor) : 0, query.search);
      return { items: page.rules, cursor: page.nextCursor === null ? undefined : String(page.nextCursor) };
    },
    fetchErrorMessage: ({ err }) => (err instanceof Error ? err.message : t('productRules.errorTitle')),
  });

  return (
    <CollectionPage>
      <CollectionPage.Header
        title={{ text: t('productRules.title') }}
        subtitle={{ text: t('productRules.subtitle') }}
        primaryAction={<PrimaryActions label={t('productRules.addRule')} onClick={openNew} />}
      />
      <CollectionPage.Content>
        <Box direction="vertical" gap="SP4">
          <SectionTabs />
          <Table
            state={state}
            horizontalScroll
            search={<CollectionSearch placeholder={t('productRules.searchPlaceholder')} />}
            emptyState={
              <CollectionEmptyState
                title={t('productRules.emptyTitle')}
                subtitle={t('productRules.emptySubtitle')}
                addNewCta={{ text: t('productRules.addRule'), onClick: openNew }}
              />
            }
            noResultsState={<CollectionNoResultsState title={t('productRules.noResultsTitle')} subtitle={t('productRules.noResultsSubtitle')} />}
            errorState={(err, { retry }) => (
              <CollectionErrorState
                title={t('productRules.errorTitle')}
                subtitle={err instanceof Error ? err.message : String(err)}
                action={{ text: t('common.retry'), onClick: retry }}
              />
            )}
            onRowClick={(rule) => navigateToEntityPage({ path: `/product-rules/${rule.productId}`, entity: rule })}
            columns={[
              { id: 'product', title: t('productRules.colProduct'), render: (r) => r.productName || r.productId, mobile: { column: 'first', order: 1 } },
              { id: 'prep', title: t('productRules.colPrep'), render: (r) => prepLabel(r.preparationMinutes) },
              {
                id: 'methods',
                title: t('productRules.colMethods'),
                render: (r) =>
                  r.allowedFulfilmentMethods.length === 2
                    ? t('productRules.both')
                    : r.allowedFulfilmentMethods.map((m) => getMethodLabel(m, t)).join(', ') || t('common.none'),
              },
              {
                id: 'required',
                title: t('productRules.colRequired'),
                render: (r) => (r.requiredScheduling ? t('productRules.required') : t('productRules.optional')),
              },
              {
                id: 'status',
                title: t('productRules.colStatus'),
                render: (r) => (
                  <Badge size="small" skin={r.enabled ? 'success' : 'neutralLight'}>
                    {r.enabled ? t('productRules.active') : t('productRules.disabled')}
                  </Badge>
                ),
              },
            ]}
          />
        </Box>
      </CollectionPage.Content>
    </CollectionPage>
  );
};
