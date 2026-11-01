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
  FULFILLMENT_STATUS_LABELS,
  METHOD_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SCHEDULE_STATUS_LABELS,
  SCHEDULE_STATUS_SKINS,
  displayDate,
  label,
  pickedDateToLocal,
} from '../labels';
import { SectionTabs } from '../SectionTabs';
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
  const [currentFilters, setCurrentFilters] = React.useState<OrdersFilters>({});

  const state = useTableCollection<ScheduledOrder, OrderFilters>({
    queryName: 'scheduled-orders',
    paginationMode: 'cursor',
    itemKey: (o) => o.orderId,
    itemName: (o) => `Order #${o.orderNumber || o.orderId}`,
    filters: ORDER_FILTERS,
    // Every declared filter and the search term reach the server-side query here.
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
    fetchErrorMessage: ({ err }) => (err instanceof Error ? err.message : 'Failed to load orders'),
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
            ? 'CSV export is a Pro feature.'
            : 'Export failed. Please try again.',
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
        message: `${result.updated.length} updated${result.skipped.length ? `, ${result.skipped.length} skipped (unscheduled or cancelled)` : ''}.`,
        type: result.skipped.length ? 'warning' : 'success',
      });
      void state.collection.refreshAllPages();
    } catch (error) {
      console.error('Bulk status failed', error);
      dashboard.showToast({ message: 'Could not update the selected orders.', type: 'error' });
    }
  };

  return (
    <CollectionPage>
      <CollectionPage.Header
        title={{ text: 'Scheduled orders' }}
        subtitle={{ text: 'Grouped by scheduled date and time. Changes here affect scheduling records only, never the Wix order.' }}
        secondaryActions={
          <SecondaryActions label="Export CSV" prefixIcon={<Download />} onClick={exportCsv} disabled={exporting} />
        }
      />
      <CollectionPage.Content>
        <Box direction="vertical" gap="SP4">
          <SectionTabs />
          <Table
            state={state}
            horizontalScroll
            search={<CollectionSearch placeholder="Search order number, order ID or customer" />}
            filters={
              <CollectionToolbarFilters>
                <DateRangeFilter filter={scheduledDateFilter} accordionItemProps={{ label: 'Scheduled date' }} />
                <MultiSelectCheckboxFilter filter={methodFilter} collection={methodOptions} toolbarItemProps={{ label: 'Method' }} accordionItemProps={{ label: 'Method' }} />
                <MultiSelectCheckboxFilter filter={scheduleStatusFilter} collection={scheduleOptions} toolbarItemProps={{ label: 'Schedule status' }} accordionItemProps={{ label: 'Schedule status' }} />
                <MultiSelectCheckboxFilter filter={orderStatusFilter} collection={orderOptions} accordionItemProps={{ label: 'Order status' }} />
                <MultiSelectCheckboxFilter filter={paymentStatusFilter} collection={paymentOptions} accordionItemProps={{ label: 'Payment status' }} />
                <MultiSelectCheckboxFilter filter={fulfillmentStatusFilter} collection={fulfillmentOptions} accordionItemProps={{ label: 'Fulfillment status' }} />
              </CollectionToolbarFilters>
            }
            bulkActionToolbar={({ selectedValues }) => (
              <MultiBulkActionToolbar
                primaryActionItems={[
                  { label: 'Mark ready', prefixIcon: <Confirm />, onClick: () => void markStatus(selectedValues, 'ready') },
                  { label: 'Mark completed', prefixIcon: <Confirm />, onClick: () => void markStatus(selectedValues, 'completed') },
                ]}
              />
            )}
            emptyState={
              <CollectionEmptyState
                title="No scheduled orders yet"
                subtitle="Orders appear here once customers choose a delivery or pickup time at checkout."
              />
            }
            noResultsState={
              <CollectionNoResultsState
                title="No orders match"
                subtitle="Search matches an exact order number or ID, or part of a customer name. Try clearing filters."
              />
            }
            errorState={(err, { retry }) => (
              <CollectionErrorState
                title="Couldn't load orders"
                subtitle={err instanceof Error ? err.message : String(err)}
                action={{ text: 'Retry', onClick: retry }}
              />
            )}
            onRowClick={(order) => navigateToEntityPage({ path: `/orders/${order.orderId}`, entity: order })}
            columns={[
              {
                id: 'schedule',
                title: 'Scheduled for',
                width: '200px',
                mobile: { column: 'first', order: 1 },
                render: (o) =>
                  o.localDate ? (
                    <Box direction="vertical">
                      <Text size="small" weight="bold">{displayDate(o.localDate)}</Text>
                      <Text size="tiny" secondary>{o.slotLabelSnapshot || 'Any time'}</Text>
                    </Box>
                  ) : (
                    <Text size="small" secondary>Not scheduled</Text>
                  ),
              },
              { id: 'number', title: 'Order', width: '90px', render: (o) => `#${o.orderNumber || '—'}` },
              { id: 'customer', title: 'Customer', render: (o) => o.customerDisplayName || '—', mobile: { column: 'second' } },
              { id: 'method', title: 'Method', width: '100px', render: (o) => (o.fulfilmentMethod ? METHOD_LABELS[o.fulfilmentMethod] : '—') },
              {
                id: 'status',
                title: 'Schedule status',
                width: '160px',
                render: (o) => (
                  <Badge size="small" skin={SCHEDULE_STATUS_SKINS[o.scheduleStatus]}>
                    {SCHEDULE_STATUS_LABELS[o.scheduleStatus]}
                  </Badge>
                ),
              },
              { id: 'items', title: 'Items', render: (o) => o.itemSummarySnapshot || '—' },
              { id: 'order', title: 'Order status', width: '120px', render: (o) => label(ORDER_STATUS_LABELS, o.orderStatusSnapshot) },
              { id: 'payment', title: 'Payment', width: '120px', render: (o) => label(PAYMENT_STATUS_LABELS, o.paymentStatusSnapshot) },
              { id: 'fulfillment', title: 'Fulfillment', width: '130px', render: (o) => label(FULFILLMENT_STATUS_LABELS, o.fulfillmentStatusSnapshot) },
              { id: 'notes', title: 'Notes', render: (o) => o.merchantNotes || '—' },
              { id: 'source', title: 'Source', width: '100px', render: (o) => o.source || '—' },
            ]}
          />
        </Box>
      </CollectionPage.Content>
    </CollectionPage>
  );
};
