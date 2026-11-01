import React from 'react';
import { dashboard } from '@wix/dashboard';
import { Box, Button, Card, Loader, Page, SectionHelper, StatisticsWidget, Table, Text } from '@wix/design-system';
import { PageWrapper } from '@wix/patterns';
import { api, type Diagnostics } from '../dashboard-api';
import { OfflineNotice } from '../overview/OfflineNotice';
import { SectionTabs } from '../SectionTabs';

export const HelpPage = () => {
  const [data, setData] = React.useState<Diagnostics | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [working, setWorking] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      setData(await api.diagnostics());
    } catch (err) {
      console.error('Diagnostics failed', err);
      setError(err instanceof Error ? err.message : 'Failed to load diagnostics');
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const reconcile = async () => {
    setWorking(true);
    try {
      const result = await api.reconcile();
      const recovered = result.retried.filter((r) => r.status === 'processed' || r.status === 'skipped').length;
      dashboard.showToast({
        message: `Released ${result.expiredHolds} expired hold(s); recovered ${recovered} of ${result.retried.length} failed event(s).`,
        type: 'success',
      });
      await load();
    } catch (err) {
      console.error('Reconcile failed', err);
      dashboard.showToast({ message: 'Reconciliation failed. Please try again.', type: 'error' });
    } finally {
      setWorking(false);
    }
  };

  return (
    <PageWrapper>
      <Page>
        <Page.Header
          title="Help & diagnostics"
          subtitle="Integration health, failed order events and recovery."
          actionsBar={
            <Button onClick={() => void reconcile()} disabled={working} prefixIcon={working ? <Loader size="tiny" /> : undefined}>
              Run reconciliation
            </Button>
          }
        />
        <Page.Content>
          <Box direction="vertical" gap="SP4">
            <SectionTabs />
            {error && (
              <SectionHelper skin="danger" title="Couldn't load diagnostics" actionText="Retry" onAction={() => void load()}>
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
                      { value: String(data.failedEvents), description: 'Failed order events' },
                      { value: String(data.deadLetterEvents), description: 'Events that stopped retrying' },
                      { value: String(data.pendingHolds), description: 'Active checkout holds' },
                      { value: String(data.reservationsNeedingReview), description: 'Reservations needing review' },
                      { value: `r${data.settingsRevision}`, description: 'Settings revision' },
                    ]}
                  />
                </Card>
                {!data.configured && (
                  <SectionHelper skin="warning" title="Settings are not active">
                    Settings have never been saved, or the stored settings no longer pass validation. Open Settings and save to fix this.
                  </SectionHelper>
                )}
                <Card>
                  <Card.Header
                    title="Last processed order event"
                    subtitle={data.lastProcessedEvent ? `${data.lastProcessedEvent.eventType} · ${new Date(data.lastProcessedEvent.receivedAt).toLocaleString()}` : 'No order events received yet'}
                  />
                </Card>
                <Card>
                  <Card.Header title="Failed events" subtitle="Run reconciliation to retry them against the current order." />
                  <Card.Divider />
                  {data.failures.length === 0 ? (
                    <Card.Content><Text size="small" secondary>No failures.</Text></Card.Content>
                  ) : (
                    <Table
                      data={data.failures}
                      columns={[
                        { title: 'Event', render: (f) => f.eventType },
                        { title: 'Order ID', render: (f) => f.orderId ?? '—' },
                        { title: 'Status', render: (f) => f.processingStatus },
                        { title: 'Attempts', render: (f) => String(f.attemptCount) },
                        { title: 'Error code', render: (f) => f.lastErrorCode ?? '—' },
                        { title: 'Received', render: (f) => new Date(f.receivedAt).toLocaleString() },
                      ]}
                    >
                      <Table.Content />
                    </Table>
                  )}
                </Card>
                <Card>
                  <Card.Header title="How it works" />
                  <Card.Divider />
                  <Card.Content>
                    <Box direction="vertical" gap="SP2">
                      <Text size="small">Customers pick a time in the delivery step of checkout. The time is held for a few minutes while they pay.</Text>
                      <Text size="small">When Wix creates the order, the hold is confirmed against it. Canceled orders release their capacity.</Text>
                      <Text size="small">If scheduling is required, checkout is blocked until a valid time is chosen.</Text>
                      <Text size="small">Data: the app stores only scheduling records (no payment details). Uninstalling the app removes its collections from your site.</Text>
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
