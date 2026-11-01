import React from 'react';
import { dashboard } from '@wix/dashboard';
import { Badge, Box, Text } from '@wix/design-system';
import {
  CollectionEmptyState,
  CollectionErrorState,
  CollectionNoResultsState,
  CollectionSearch,
  CollectionToolbarFilters,
  DateRangeFilter,
  MultiBulkActionToolbar,
  MultiSelectCheckboxFilter,
  SecondaryActions,
  Table,
  useStaticListFilterCollection,
  useTableCollection,
} from '@wix/patterns';
import { CollectionPage } from '@wix/patterns/page';
import { usePatternsNavigate } from '@wix/patterns/router';
import { Confirm, Download } from '@wix/wix-ui-icons-common/lazy';
import { api, DashboardApiError, type OrdersFilters, type ScheduledOrder } from '../dashboard-api';
import {
  SCHEDULE_STATUS_SKINS,
  displayDate,
  getMethodLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getFulfillmentStatusLabel,
  getScheduleStatusLabel,
  pickedDateToLocal,
} from '../labels';
import { SectionTabs } from '../SectionTabs';
import { useDashboardI18n } from '../LanguageContext';
import {
  FULFILLMENT_STATUS_OPTIONS,
  ORDER_FILTERS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SCHEDULE_STATUS_OPTIONS,
  fulfillmentStatusFilter,
  methodFilter,
  orderStatusFilter,
  paymentStatusFilter,
  scheduleStatusFilter,
  scheduledDateFilter,
  type OrderFilters,
} from './filters';

const PAGE_SIZE = 25;

function downloadCsv(csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `scheduled-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export const OrdersCollectionPage = () => {
  const { navigateToEntityPage } = usePatternsNavigate<ScheduledOrder>();
  const { t, locale } = useDashboardI18n();
  const [currentFilters, setCurrentFilters] = React.useState<OrdersFilters>({});

  const state = useTableCollection<ScheduledOrder, OrderFilters>({
    queryName: 'scheduled-orders',
    paginationMode: 'cursor',
    itemKey: (o) => o.orderId,
    itemName: (o) => `${t('orders.colOrder')} #${o.orderNumber || o.orderId}`,
    filters: ORDER_FILTERS,
    fetchData: async (query) => {
      const range = query.filters.scheduledDate;
      const filters: OrdersFilters = {
        ...(query.search ? { search: query.search } : {}),
        ...(pickedDateToLocal(range?.from) ? { from: pickedDateToLocal(range?.from) } : {}),
        ...(pickedDateToLocal(range?.to) ? { to: pickedDateToLocal(range?.to) } : {}),
        method: query.filters.method ?? [],
        scheduleStatus: query.filters.scheduleStatus ?? [],
        orderStatus: query.filters.orderStatus ?? [],
        paymentStatus: query.filters.paymentStatus ?? [],
        fulfillmentStatus: query.filters.fulfillmentStatus ?? [],
      };
      setCurrentFilters(filters);
      const page = await api.listOrders(filters, query.limit, query.cursor ? Number(query.cursor) : 0);
      return {
        items: page.orders,
        cursor: page.nextCursor === null ? undefined : String(page.nextCursor),
      };
    },
    fetchErrorMessage: ({ err }) => (err instanceof Error ? err.message : t('orders.errorTitle')),
    limit: PAGE_SIZE,
  });

  const methodOptions = useStaticListFilterCollection(methodFilter, ['delivery', 'pickup']);
  const scheduleOptions = useStaticListFilterCollection(scheduleStatusFilter, SCHEDULE_STATUS_OPTIONS);
  const orderOptions = useStaticListFilterCollection(orderStatusFilter, ORDER_STATUS_OPTIONS);
  const paymentOptions = useStaticListFilterCollection(paymentStatusFilter, PAYMENT_STATUS_OPTIONS);
  const fulfillmentOptions = useStaticListFilterCollection(fulfillmentStatusFilter, FULFILLMENT_STATUS_OPTIONS);

  const [exporting, setExporting] = React.useState(false);
  const exportCsv = async () => {
    setExporting(true);
    try {
      downloadCsv(await api.exportOrders(currentFilters));
    } catch (error) {
      console.error('Export failed', error);
      dashboard.showToast({
        message:
          error instanceof DashboardApiError && error.code === 'PLAN_REQUIRED'
            ? t('plan.upgradeNote')
            : t('orders.exportFailed'),
        type: 'error',
      });
    } finally {
      setExporting(false);
    }
  };

  const markStatus = async (orders: ScheduledOrder[], status: 'ready' | 'completed') => {
    try {
      const result = await api.bulkStatus(orders.map((o) => o.orderId), status);
      dashboard.showToast({
        message: t('orders.bulkUpdated', { count: result.updated.length }),
        type: result.skipped.length ? 'warning' : 'success',
      });
      void state.collection.refreshAllPages();
    } catch (error) {
      console.error('Bulk status failed', error);
      dashboard.showToast({ message: t('orders.bulkFailed'), type: 'error' });
    }
  };

  return (
    <CollectionPage>
      <CollectionPage.Header
        title={{ text: t('orders.title') }}
        subtitle={{ text: t('orders.subtitle') }}
        secondaryActions={
          <SecondaryActions
            label={exporting ? t('orders.exporting') : t('orders.exportCsv')}
            prefixIcon={<Download />}
            onClick={exportCsv}
            disabled={exporting}
          />
        }
      />
      <CollectionPage.Content>
        <Box direction="vertical" gap="SP4">
          <SectionTabs />
          <Table
            state={state}
            horizontalScroll
            search={<CollectionSearch placeholder={t('orders.searchPlaceholder')} />}
            filters={
              <CollectionToolbarFilters>
                <DateRangeFilter filter={scheduledDateFilter} accordionItemProps={{ label: t('orders.filterScheduledDate') }} />
                <MultiSelectCheckboxFilter filter={methodFilter} collection={methodOptions} toolbarItemProps={{ label: t('orders.filterMethod') }} accordionItemProps={{ label: t('orders.filterMethod') }} />
                <MultiSelectCheckboxFilter filter={scheduleStatusFilter} collection={scheduleOptions} toolbarItemProps={{ label: t('orders.filterScheduleStatus') }} accordionItemProps={{ label: t('orders.filterScheduleStatus') }} />
                <MultiSelectCheckboxFilter filter={orderStatusFilter} collection={orderOptions} accordionItemProps={{ label: t('orders.filterOrderStatus') }} />
                <MultiSelectCheckboxFilter filter={paymentStatusFilter} collection={paymentOptions} accordionItemProps={{ label: t('orders.filterPaymentStatus') }} />
                <MultiSelectCheckboxFilter filter={fulfillmentStatusFilter} collection={fulfillmentOptions} accordionItemProps={{ label: t('orders.filterFulfillmentStatus') }} />
              </CollectionToolbarFilters>
            }
            bulkActionToolbar={({ selectedValues }) => (
              <MultiBulkActionToolbar
                primaryActionItems={[
                  { label: t('common.ready'), prefixIcon: <Confirm />, onClick: () => void markStatus(selectedValues, 'ready') },
                  { label: t('common.completed'), prefixIcon: <Confirm />, onClick: () => void markStatus(selectedValues, 'completed') },
                ]}
              />
            )}
            emptyState={
              <CollectionEmptyState
                title={t('orders.emptyTitle')}
                subtitle={t('orders.emptySubtitle')}
              />
            }
            noResultsState={
              <CollectionNoResultsState
                title={t('orders.noResultsTitle')}
                subtitle={t('orders.noResultsSubtitle')}
              />
            }
            errorState={(err, { retry }) => (
              <CollectionErrorState
                title={t('orders.errorTitle')}
                subtitle={err instanceof Error ? err.message : String(err)}
                action={{ text: t('orders.retry'), onClick: retry }}
              />
            )}
            onRowClick={(order) => navigateToEntityPage({ path: `/orders/${order.orderId}`, entity: order })}
            columns={[
              {
                id: 'schedule',
                title: t('orderDetail.scheduledFor'),
                width: '200px',
                mobile: { column: 'first', order: 1 },
                render: (o) =>
                  o.localDate ? (
                    <Box direction="vertical">
                      <Text size="small" weight="bold">{displayDate(o.localDate, locale)}</Text>
                      <Text size="tiny" secondary>{o.slotLabelSnapshot || t('orderDetail.anyTime')}</Text>
                    </Box>
                  ) : (
                    <Text size="small" secondary>{t('orderDetail.notScheduled')}</Text>
                  ),
              },
              { id: 'number', title: t('orders.colOrder'), width: '90px', render: (o) => `#${o.orderNumber || '—'}` },
              { id: 'customer', title: t('orders.colCustomer'), render: (o) => o.customerDisplayName || '—', mobile: { column: 'second' } },
              { id: 'method', title: t('orders.colMethod'), width: '100px', render: (o) => (o.fulfilmentMethod ? getMethodLabel(o.fulfilmentMethod, t) : '—') },
              {
                id: 'status',
                title: t('orders.colStatus'),
                width: '160px',
                render: (o) => (
                  <Badge size="small" skin={SCHEDULE_STATUS_SKINS[o.scheduleStatus]}>
                    {getScheduleStatusLabel(o.scheduleStatus, t)}
                  </Badge>
                ),
              },
              { id: 'items', title: t('orderDetail.items'), render: (o) => o.itemSummarySnapshot || '—' },
              { id: 'order', title: t('orders.filterOrderStatus'), width: '120px', render: (o) => getOrderStatusLabel(o.orderStatusSnapshot, t) },
              { id: 'payment', title: t('orders.colPayment'), width: '120px', render: (o) => getPaymentStatusLabel(o.paymentStatusSnapshot, t) },
              { id: 'fulfillment', title: t('orders.colFulfillment'), width: '130px', render: (o) => getFulfillmentStatusLabel(o.fulfillmentStatusSnapshot, t) },
              { id: 'notes', title: t('orderDetail.merchantNotes'), render: (o) => o.merchantNotes || '—' },
            ]}
          />
        </Box>
      </CollectionPage.Content>
    </CollectionPage>
  );
};
