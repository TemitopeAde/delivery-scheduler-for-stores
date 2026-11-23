import React from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard } from '@wix/dashboard';
import { Box, Loader, SectionHelper, Text } from '@wix/design-system';
import { Button } from '../../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../../components/ui/card';
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
    <div className="scheduler-overview">
      <header className="scheduler-heading">
        <div><h1>{t('overview.title')}</h1><p>{t('overview.subtitle')}</p></div>
        {data?.widgetPlacement !== 'placed' && <Button onClick={() => void addToCheckout()} disabled={adding}>{adding ? t('overview.addingToCheckout') : t('overview.addToCheckout')}</Button>}
      </header>
      <div className="scheduler-stack">
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
                <div className="scheduler-metrics">
                  {[
                    [data.counts.today, t('overview.todayWithDate', { date: displayDate(data.today, locale) })],
                    [data.counts.upcoming, t('overview.next7Days')],
                    [data.counts.delivery, t('overview.deliveries7Days')],
                    [data.counts.pickup, t('overview.pickups7Days')],
                    [data.counts.missingSchedule, t('overview.missingScheduleCount')],
                  ].map(([value, label]) => <Card key={label}><CardHeader className="pb-2"><CardDescription>{label}</CardDescription></CardHeader><CardContent><div className="scheduler-metric">{value}</div></CardContent></Card>)}
                </div>
                <Card>
                  <CardHeader><CardTitle>{t('overview.slotsNearCapacity')}</CardTitle><CardDescription>{t('overview.slotsNearCapacitySub', { timezone: data.timezone })}</CardDescription></CardHeader>
                  {data.nearCapacity.length === 0 ? (
                    <CardContent>
                      <Text size="small" secondary>{t('overview.noSlotsNearCapacity')}</Text>
                    </CardContent>
                  ) : (
                    <div className="overflow-x-auto"><table className="scheduler-table">
                      <thead><tr>{['overview.colDate', 'overview.colSlot', 'overview.colMethod', 'overview.colRemaining'].map(key => <th key={key} scope="col">{t(key as 'overview.colDate')}</th>)}</tr></thead>
                      <tbody>{data.nearCapacity.map((r, index) => <tr key={`${r.date}-${r.slotId}-${r.method}-${index}`}><td>{displayDate(r.date, locale)}</td><td>{r.slotId}</td><td>{getMethodLabel(r.method, t)}</td><td>{r.remaining === 0 ? t('overview.full') : r.remaining}</td></tr>)}</tbody>
                    </table></div>
                  )}
                </Card>
                <Box gap="SP2">
                  <Button onClick={() => navigate('/orders')}>{t('overview.viewAllOrders')}</Button>
                  <Button variant="outline" onClick={() => void load()}>{t('overview.refresh')}</Button>
                </Box>
              </>
            )}
            <OfflineNotice />
      </div>
    </div>
  );
};
