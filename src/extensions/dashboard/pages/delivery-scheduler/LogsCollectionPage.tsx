import React from 'react';
import { Badge } from '@wix/design-system';
import {
  CollectionEmptyState,
  CollectionErrorState,
  CollectionNoResultsState,
  CollectionSearch,
  Table,
  useTableCollection,
} from '@wix/patterns';
import { CollectionPage } from '@wix/patterns/page';
import type { CheckoutLog } from './dashboard-api';
import { api } from './dashboard-api';
import { useDashboardI18n } from './LanguageContext';

const PAGE_SIZE = 50;

function displayTimestamp(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(locale);
}

export const LogsCollectionPage = () => {
  const { t, locale } = useDashboardI18n();
  const state = useTableCollection<CheckoutLog, Record<string, never>>({
    queryName: 'checkout-logs',
    paginationMode: 'cursor',
    itemKey: (item) => item.id,
    itemName: (item) => `${item.operation} ${item.createdAt}`,
    filters: {},
    limit: PAGE_SIZE,
    fetchData: async (query) => {
      const page = await api.listLogs(query.limit, query.cursor ? Number(query.cursor) : 0, query.search);
      return { items: page.logs, cursor: page.nextCursor === null ? undefined : String(page.nextCursor) };
    },
    fetchErrorMessage: ({ err }) => (err instanceof Error ? err.message : t('logs.errorTitle')),
  });

  return (
    <CollectionPage>
      <CollectionPage.Header
        title={{ text: t('logs.title') }}
        subtitle={{ text: t('logs.subtitle') }}
      />
      <CollectionPage.Content>
        <Table
          state={state}
          horizontalScroll
          search={<CollectionSearch placeholder={t('logs.searchPlaceholder')} />}
          emptyState={<CollectionEmptyState title={t('logs.emptyTitle')} subtitle={t('logs.emptySubtitle')} />}
          noResultsState={<CollectionNoResultsState title={t('logs.noResultsTitle')} subtitle={t('logs.noResultsSubtitle')} />}
          errorState={(error, { retry }) => (
            <CollectionErrorState
              title={t('logs.errorTitle')}
              subtitle={error instanceof Error ? error.message : String(error)}
              action={{ text: t('logs.retry'), onClick: retry }}
            />
          )}
          columns={[
            {
              id: 'createdAt',
              title: t('logs.colDate'),
              width: '190px',
              mobile: { column: 'first', order: 1 },
              render: (item) => displayTimestamp(item.createdAt, locale),
            },
            {
              id: 'operation',
              title: t('logs.colEvent'),
              width: '190px',
              mobile: { column: 'second' },
              render: (item) => item.operation || '—',
            },
            {
              id: 'outcome',
              title: t('logs.colOutcome'),
              width: '120px',
              render: (item) => (
                <Badge size="small" skin={item.outcome === 'success' ? 'success' : 'danger'}>
                  {item.outcome || '—'}
                </Badge>
              ),
            },
            {
              id: 'reason',
              title: t('logs.colReason'),
              width: '200px',
              render: (item) => item.reason || '—',
            },
            {
              id: 'errorCode',
              title: t('logs.colError'),
              width: '150px',
              render: (item) => item.errorCode || '—',
            },
            {
              id: 'requestId',
              title: t('logs.colRequestId'),
              width: '220px',
              render: (item) => item.requestId || '—',
            },
          ]}
        />
      </CollectionPage.Content>
    </CollectionPage>
  );
};
