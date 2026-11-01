import React from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard } from '@wix/dashboard';
import { Box, Button, Card, Loader, Page, SectionHelper, StatisticsWidget, Table, Text } from '@wix/design-system';
import { PageWrapper } from '@wix/patterns';
import { CHECKOUT_PLUGIN_PLACEMENT, SITE_PLUGIN_ID } from '../../../../../lib/constants';
import { api, type Overview } from '../dashboard-api';
import { getMethodLabel, displayDate } from '../labels';
import { SectionTabs } from '../SectionTabs';
import { OfflineNotice } from './OfflineNotice';
import { useDashboardI18n } from '../LanguageContext';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const { t, locale } = useDashboardI18n();
  const [data, setData] = React.useState<Overview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      setData(await api.overview());
    } catch (err) {
      console.error('Overview failed', err);
      setError(err instanceof Error ? err.message : t('overview.loadError'));
    }
  }, [t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const addToCheckout = async () => {
    setAdding(true);
    try {
      await dashboard.addSitePlugin(SITE_PLUGIN_ID, { placement: CHECKOUT_PLUGIN_PLACEMENT });
      dashboard.showToast({ message: t('overview.addedToCheckout'), type: 'success' });
      await load();
    } catch (err) {
      console.error('addSitePlugin failed', err);
      dashboard.showToast({ message: t('overview.addFailed'), type: 'warning' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <PageWrapper>
      <Page>
        <Page.Header
          title={t('overview.title')}
          subtitle={t('overview.subtitle')}
          actionsBar={
            data?.widgetPlacement !== 'placed' ? (
              <Button onClick={() => void addToCheckout()} disabled={adding} prefixIcon={adding ? <Loader size="tiny" /> : undefined}>
                {adding ? t('overview.addingToCheckout') : t('overview.addToCheckout')}
              </Button>
            ) : undefined
          }
        />
        <Page.Content>
          <Box direction="vertical" gap="SP4">
            <SectionTabs />
            {error && (
              <SectionHelper skin="danger" title={t('overview.loadError')} actionText={t('common.retry')} onAction={() => void load()}>
                {error}
              </SectionHelper>
            )}
            {!data && !error && (
              <Box align="center" padding="SP6">
                <Loader size="small" />
              </Box>
            )}
            {data && (
              <>
                {!data.configured && (
                  <SectionHelper skin="standard" title={t('overview.finishSetup')} actionText={t('overview.openSettings')} onAction={() => navigate('/settings')}>
                    {t('overview.finishSetupDesc')}
                  </SectionHelper>
                )}
                {data.configured && !data.enabled && (
                  <SectionHelper skin="warning" title={t('overview.schedulingOff')} actionText={t('overview.openSettings')} onAction={() => navigate('/settings')}>
                    {t('overview.schedulingOffDesc')}
                  </SectionHelper>
                )}
                {data.widgetPlacement !== 'placed' && (
                  <SectionHelper
                    skin={data.widgetPlacement === 'unknown' ? 'standard' : 'warning'}
                    title={t('overview.widgetNotPlaced')}
                  >
                    {t('overview.widgetNotPlacedDesc')}
                  </SectionHelper>
                )}
                {(data.counts.needsReview > 0 || data.counts.missingSchedule > 0) && (
                  <SectionHelper skin="danger" title={t('overview.attentionNeeded')} actionText={t('overview.reviewOrders')} onAction={() => navigate('/orders')}>
                    {t('overview.attentionDesc', { needs: data.counts.needsReview, missing: data.counts.missingSchedule })}
                  </SectionHelper>
                )}
                <Card>
                  <StatisticsWidget
                    items={[
                      { value: String(data.counts.today), description: t('overview.todayWithDate', { date: displayDate(data.today, locale) }) },
                      { value: String(data.counts.upcoming), description: t('overview.next7Days') },
                      { value: String(data.counts.delivery), description: t('overview.deliveries7Days') },
                      { value: String(data.counts.pickup), description: t('overview.pickups7Days') },
                      { value: String(data.counts.missingSchedule), description: t('overview.missingScheduleCount') },
                    ]}
                  />
                </Card>
                <Card>
                  <Card.Header title={t('overview.slotsNearCapacity')} subtitle={t('overview.slotsNearCapacitySub', { timezone: data.timezone })} />
                  <Card.Divider />
                  {data.nearCapacity.length === 0 ? (
                    <Card.Content>
                      <Text size="small" secondary>{t('overview.noSlotsNearCapacity')}</Text>
                    </Card.Content>
                  ) : (
                    <Table
                      data={data.nearCapacity}
                      columns={[
                        { title: t('overview.colDate'), render: (r) => displayDate(r.date, locale) },
                        { title: t('overview.colSlot'), render: (r) => r.slotId },
                        { title: t('overview.colMethod'), render: (r) => getMethodLabel(r.method, t) },
                        { title: t('overview.colRemaining'), render: (r) => (r.remaining === 0 ? t('overview.full') : String(r.remaining)) },
                      ]}
                    >
                      <Table.Content />
                    </Table>
                  )}
                </Card>
                <Box gap="SP2">
                  <Button onClick={() => navigate('/orders')}>{t('overview.viewAllOrders')}</Button>
                  <Button priority="secondary" onClick={() => void load()}>{t('overview.refresh')}</Button>
                </Box>
              </>
            )}
            <OfflineNotice />
          </Box>
        </Page.Content>
      </Page>
    </PageWrapper>
  );
};
