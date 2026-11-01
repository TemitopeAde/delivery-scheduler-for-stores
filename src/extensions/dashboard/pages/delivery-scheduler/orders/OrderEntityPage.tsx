import React from 'react';
import { useParams } from 'react-router-dom';
import { dashboard } from '@wix/dashboard';
import { pages } from '@wix/ecom/dashboard';
import { Badge, Box, Card, InputArea, FormField, Text, TextButton } from '@wix/design-system';
import { EntityPage, useEntityPage, useEntityPageContext } from '@wix/patterns';
import { useController, useForm } from '@wix/patterns/form';
import { MERCHANT_SCHEDULE_STATUSES, type MerchantScheduleStatus, type Settings } from '../../../../../lib/schemas';
import { api, type OrderDetail, type ScheduledOrder } from '../dashboard-api';
import {
  SCHEDULE_STATUS_SKINS,
  displayDate,
  getMethodLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getFulfillmentStatusLabel,
  getScheduleStatusLabel,
} from '../labels';
import { RescheduleFields, type RescheduleValue } from './RescheduleFields';
import { StatusField } from './StatusField';
import { useDashboardI18n } from '../LanguageContext';

export type OrderFormFields = {
  scheduleStatus: MerchantScheduleStatus | '';
  merchantNotes: string;
  reschedule: RescheduleValue;
};

type Loaded = OrderDetail & { settings: Settings };

export const OrderEntityPage = () => {
  const { id } = useParams<{ id?: string }>();
  const form = useForm<OrderFormFields>();
  const { t } = useDashboardI18n();

  const state = useEntityPage<Loaded, OrderFormFields>({
    parentPath: '/orders',
    isNewEntity: () => false,
    form,
    fetch: async () => {
      if (!id) throw new Error('Missing order ID');
      const [detail, { settings }] = await Promise.all([api.getOrder(id), api.getSettings()]);
      return { entity: { ...detail, settings } };
    },
    onSave: async ({ entity }) => {
      if (!id || !entity) throw new Error('Order not loaded');
      const values = form.getValues();
      const current = entity.order;
      const patch: Record<string, unknown> = {};
      if (values.scheduleStatus && values.scheduleStatus !== current.scheduleStatus) {
        patch.scheduleStatus = values.scheduleStatus;
      }
      if (values.merchantNotes !== current.merchantNotes) patch.merchantNotes = values.merchantNotes;
      const r = values.reschedule;
      if (
        r.method &&
        r.localDate &&
        r.slotId &&
        (r.method !== current.fulfilmentMethod || r.localDate !== current.localDate || r.slotId !== current.slotId)
      ) {
        patch.reschedule = { method: r.method, localDate: r.localDate, slotId: r.slotId };
      }
      if (Object.keys(patch).length === 0) return { updatedEntity: entity };
      const { order } = await api.patchOrder(id, patch);
      return { updatedEntity: { ...entity, order } };
    },
    saveSuccessToast: t('orderDetail.saveSuccess'),
    saveErrorToast: (err) => (err instanceof Error ? err.message : t('orderDetail.saveError')),
  });

  return (
    <EntityPage state={state}>
      <EntityPage.Header title={{ text: t('orderDetail.title') }} />
      <EntityPage.Content>
        <EntityPage.MainContent>
          <Card>
            <Card.Header title={t('orderDetail.fulfilmentTitle')} subtitle={t('orderDetail.fulfilmentSubtitle')} />
            <Card.Divider />
            <Card.Content>
              <FulfilmentFields />
            </Card.Content>
          </Card>
          <Card>
            <Card.Header title={t('orderDetail.rescheduleTitle')} subtitle={t('orderDetail.rescheduleSubtitle')} />
            <Card.Divider />
            <Card.Content>
              <RescheduleSection />
            </Card.Content>
          </Card>
        </EntityPage.MainContent>
        <EntityPage.AdditionalContent>
          <Card>
            <Card.Header title={t('orderDetail.summaryTitle')} />
            <Card.Divider />
            <Card.Content>
              <OrderSummary />
            </Card.Content>
          </Card>
        </EntityPage.AdditionalContent>
      </EntityPage.Content>
    </EntityPage>
  );
};

const FulfilmentFields = () => {
  const page = useEntityPageContext<Loaded, OrderFormFields>();
  const { t } = useDashboardI18n();
  const order = page.entity?.order;
  const editable = !!order?.localDate && order.scheduleStatus !== 'cancelled';
  const notes = useController({
    name: 'merchantNotes',
    control: page.form.control,
    defaultValue: order?.merchantNotes ?? '',
    rules: { maxLength: { value: 2000, message: t('orderDetail.notesLimit') } },
  });
  return (
    <Box direction="vertical" gap="SP4">
      <StatusField
        control={page.form.control}
        defaultValue={
          order && (MERCHANT_SCHEDULE_STATUSES as readonly string[]).includes(order.scheduleStatus)
            ? (order.scheduleStatus as MerchantScheduleStatus)
            : ''
        }
        disabled={!editable}
      />
      <FormField
        label={t('orderDetail.merchantNotes')}
        status={notes.fieldState.error ? 'error' : undefined}
        statusMessage={notes.fieldState.error?.message}
      >
        <InputArea value={notes.field.value} onChange={(e) => notes.field.onChange(e.target.value)} rows={4} />
      </FormField>
    </Box>
  );
};

const RescheduleSection = () => {
  const page = useEntityPageContext<Loaded, OrderFormFields>();
  const { t } = useDashboardI18n();
  if (!page.entity) return null;
  const { order, settings } = page.entity;
  if (order.scheduleStatus === 'cancelled') {
    return <Text size="small" secondary>{t('orderDetail.rescheduleCancelled')}</Text>;
  }
  return <RescheduleFields control={page.form.control} order={order} settings={settings} />;
};

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box direction="vertical" gap="SP1">
      <Text size="tiny" secondary>{title}</Text>
      <Text size="small">{children}</Text>
    </Box>
  );
}

const OrderSummary = () => {
  const page = useEntityPageContext<Loaded, OrderFormFields>();
  const { t, locale } = useDashboardI18n();
  const order: ScheduledOrder | undefined = page.entity?.order;
  if (!order) return null;
  return (
    <Box direction="vertical" gap="SP3">
      <Box gap="SP2" verticalAlign="middle">
        <Text weight="bold">#{order.orderNumber || '—'}</Text>
        <Badge size="small" skin={SCHEDULE_STATUS_SKINS[order.scheduleStatus]}>
          {getScheduleStatusLabel(order.scheduleStatus, t)}
        </Badge>
      </Box>
      <Row title={t('orderDetail.scheduledFor')}>
        {order.localDate ? `${displayDate(order.localDate, locale)} · ${order.slotLabelSnapshot || t('orderDetail.anyTime')} (${order.timezone})` : t('orderDetail.notScheduled')}
      </Row>
      <Row title={t('orderDetail.method')}>{order.fulfilmentMethod ? getMethodLabel(order.fulfilmentMethod, t) : '—'}</Row>
      <Row title={t('orderDetail.customer')}>{order.customerDisplayName || '—'}</Row>
      <Row title={t('orderDetail.items')}>{order.itemSummarySnapshot || '—'}</Row>
      <Row title={t('orderDetail.statusLine')}>
        {`${getOrderStatusLabel(order.orderStatusSnapshot, t)} · ${getPaymentStatusLabel(order.paymentStatusSnapshot, t)} · ${getFulfillmentStatusLabel(order.fulfillmentStatusSnapshot, t)}`}
      </Row>
      <Row title={t('orderDetail.reservation')}>{page.entity?.reservation ? `${page.entity.reservation.status} · ${page.entity.reservation.reservationId}` : t('orderDetail.none')}</Row>
      <Row title={t('orderDetail.lastSynced')}>{order.lastSyncedAt ? new Date(order.lastSyncedAt).toLocaleString(locale) : '—'}</Row>
      <TextButton onClick={() => dashboard.navigate(pages.orderDetails({ id: order.orderId }))}>
        {t('orderDetail.openWixOrder')}
      </TextButton>
    </Box>
  );
};
