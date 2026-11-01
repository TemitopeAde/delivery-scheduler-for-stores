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
import { METHOD_LABELS } from '../labels';
import { SectionTabs } from '../SectionTabs';

function prepLabel(minutes: number): string {
  if (minutes === 0) return 'None';
  if (minutes % (60 * 24) === 0) return `${minutes / (60 * 24)} day(s)`;
  if (minutes % 60 === 0) return `${minutes / 60} hour(s)`;
  return `${minutes} min`;
}

export const ProductRulesCollectionPage = () => {
  const { navigateToEntityPage } = usePatternsNavigate<ProductRule>();
  const openNew = () => navigateToEntityPage({ path: '/product-rules/new' });

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
    fetchErrorMessage: ({ err }) => (err instanceof Error ? err.message : 'Failed to load product rules'),
  });

  return (
    <CollectionPage>
      <CollectionPage.Header
        title={{ text: 'Product rules' }}
        subtitle={{ text: 'Preparation time, allowed methods and required scheduling per product (Pro).' }}
        primaryAction={<PrimaryActions label="Add product rule" onClick={openNew} />}
      />
      <CollectionPage.Content>
        <Box direction="vertical" gap="SP4">
          <SectionTabs />
          <Table
            state={state}
            horizontalScroll
            search={<CollectionSearch placeholder="Search by product name" />}
            emptyState={
              <CollectionEmptyState
                title="No product rules yet"
                subtitle="Without rules, every product follows your general schedule."
                addNewCta={{ text: 'Add product rule', onClick: openNew }}
              />
            }
            noResultsState={<CollectionNoResultsState title="No rules match" subtitle="Search matches part of a product name." />}
            errorState={(err, { retry }) => (
              <CollectionErrorState
                title="Couldn't load product rules"
                subtitle={err instanceof Error ? err.message : String(err)}
                action={{ text: 'Retry', onClick: retry }}
              />
            )}
            onRowClick={(rule) => navigateToEntityPage({ path: `/product-rules/${rule.productId}`, entity: rule })}
            columns={[
              { id: 'name', title: 'Product', render: (r) => r.productName || r.productId, mobile: { column: 'first', order: 1 } },
              {
                id: 'enabled',
                title: 'Status',
                width: '110px',
                render: (r) => (
                  <Badge size="small" skin={r.enabled ? 'success' : 'neutralLight'}>{r.enabled ? 'Active' : 'Off'}</Badge>
                ),
              },
              { id: 'prep', title: 'Preparation', width: '130px', render: (r) => prepLabel(r.preparationMinutes) },
              { id: 'methods', title: 'Methods', render: (r) => r.allowedFulfilmentMethods.map((m) => METHOD_LABELS[m]).join(', ') },
              { id: 'required', title: 'Scheduling', width: '120px', render: (r) => (r.requiredScheduling ? 'Required' : 'Optional') },
              { id: 'hours', title: 'Custom hours', width: '120px', render: (r) => (r.customWorkingHours ? 'Yes' : 'No') },
            ]}
          />
        </Box>
      </CollectionPage.Content>
    </CollectionPage>
  );
};
