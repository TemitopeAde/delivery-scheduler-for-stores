import React from 'react';
import { dashboard } from '@wix/dashboard';
import { Box, Button, Card, Loader, Page, SectionHelper, StatisticsWidget, Table, Text } from '@wix/design-system';
import { PageWrapper } from '@wix/patterns';
import { api, type Diagnostics } from '../dashboard-api';
import { OfflineNotice } from '../overview/OfflineNotice';
import { SectionTabs } from '../SectionTabs';
import { useDashboardI18n } from '../LanguageContext';

export const HelpPage = () => {
  const { t, locale } = useDashboardI18n();
  const [data, setData] = React.useState<Diagnostics | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [working, setWorking] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      setData(await api.diagnostics());
    } catch (err) {
      console.error('Diagnostics failed', err);
      setError(err instanceof Error ? err.message : t('help.loadErrorTitle'));
    }
  }, [t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const reconcile = async () => {
    setWorking(true);
    try {
      const result = await api.reconcile();
      const recovered = result.retried.filter((r) => r.status === 'processed' || r.status === 'skipped').length;
      dashboard.showToast({
        message: t('help.reconcileSuccess', {
          holds: result.expiredHolds,
          recovered,
          total: result.retried.length,
        }),
        type: 'success',
      });
      await load();
    } catch (err) {
      console.error('Reconcile failed', err);
      dashboard.showToast({ message: t('help.reconcileFailed'), type: 'error' });
    } finally {
      setWorking(false);
    }
  };

  return (
    <PageWrapper>
      <Page>
        <Page.Header
          title={t('help.title')}
          subtitle={t('help.subtitle')}
          actionsBar={
            <Button onClick={() => void reconcile()} disabled={working} prefixIcon={working ? <Loader size="tiny" /> : undefined}>
              {working ? t('help.reconcileRunning') : t('help.runReconcile')}
            </Button>
          }
        />
        <Page.Content>
          <Box direction="vertical" gap="SP4">
            <SectionTabs />
            {error && (
              <SectionHelper skin="danger" title={t('help.loadErrorTitle')} actionText={t('help.retry')} onAction={() => void load()}>
                {error}
              </SectionHelper>
            )}
            {!data && !error && (
              <Box align="center" padding="SP6"><Loader size="small" /></Box>
            )}
            {data && (
              <>
                <Card>
                  <StatisticsWidget
                    items={[
                      { value: String(data.failedEvents), description: t('help.failedEvents') },
                      { value: String(data.deadLetterEvents), description: t('help.deadLetter') },
                      { value: String(data.pendingHolds), description: t('help.pendingHolds') },
                      { value: String(data.reservationsNeedingReview), description: t('help.reservationsReview') },
                      { value: `r${data.settingsRevision}`, description: t('help.settingsRevision') },
                    ]}
                  />
                </Card>
                {!data.configured && (
                  <SectionHelper skin="warning" title={t('help.settingsNotActive')}>
                    {t('help.settingsNotActiveInfo')}
                  </SectionHelper>
                )}
                <Card>
                  <Card.Header
                    title={t('help.lastEvent')}
                    subtitle={data.lastProcessedEvent ? `${data.lastProcessedEvent.eventType} · ${new Date(data.lastProcessedEvent.receivedAt).toLocaleString(locale)}` : t('help.noEvents')}
                  />
                </Card>
                <Card>
                  <Card.Header title={t('help.failedCardTitle')} subtitle={t('help.failedCardSubtitle')} />
                  <Card.Divider />
                  {data.failures.length === 0 ? (
                    <Card.Content><Text size="small" secondary>{t('help.noFailures')}</Text></Card.Content>
                  ) : (
                    <Table
                      data={data.failures}
                      columns={[
                        { title: t('help.colEvent'), render: (f) => f.eventType },
                        { title: t('help.colOrder'), render: (f) => f.orderId ?? '—' },
                        { title: t('help.colStatus'), render: (f) => f.processingStatus },
                        { title: t('help.colAttempts'), render: (f) => String(f.attemptCount) },
                        { title: t('help.colError'), render: (f) => f.lastErrorCode ?? '—' },
                        { title: t('help.colReceived'), render: (f) => new Date(f.receivedAt).toLocaleString(locale) },
                      ]}
                    >
                      <Table.Content />
                    </Table>
                  )}
                </Card>
                <Card>
                  <Card.Header title={t('help.howItWorks')} />
                  <Card.Divider />
                  <Card.Content>
                    <Box direction="vertical" gap="SP2">
                      <Text size="small">{t('help.howItWorks1')}</Text>
                      <Text size="small">{t('help.howItWorks2')}</Text>
                      <Text size="small">{t('help.howItWorks3')}</Text>
                      <Text size="small">{t('help.howItWorks4')}</Text>
                    </Box>
                  </Card.Content>
                </Card>
              </>
            )}
            <OfflineNotice />
          </Box>
        </Page.Content>
      </Page>
    </PageWrapper>
  );
};
