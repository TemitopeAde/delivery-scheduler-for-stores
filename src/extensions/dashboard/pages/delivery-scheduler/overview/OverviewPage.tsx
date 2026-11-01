import React from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard } from '@wix/dashboard';
import { Box, Button, Card, Loader, Page, SectionHelper, StatisticsWidget, Table, Text } from '@wix/design-system';
import { PageWrapper } from '@wix/patterns';
import { CHECKOUT_PLUGIN_PLACEMENT, SITE_PLUGIN_ID } from '../../../../../lib/constants';
import { api, type Overview } from '../dashboard-api';
import { METHOD_LABELS, displayDate } from '../labels';
import { SectionTabs } from '../SectionTabs';
import { OfflineNotice } from './OfflineNotice';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const [data, setData] = React.useState<Overview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      setData(await api.overview());
    } catch (err) {
      console.error('Overview failed', err);
      setError(err instanceof Error ? err.message : 'Failed to load the overview');
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const addToCheckout = async () => {
    setAdding(true);
    try {
      await dashboard.addSitePlugin(SITE_PLUGIN_ID, { placement: CHECKOUT_PLUGIN_PLACEMENT });
      dashboard.showToast({ message: 'Added to your checkout page.', type: 'success' });
      await load();
    } catch (err) {
      console.error('addSitePlugin failed', err);
      dashboard.showToast({ message: 'Could not add the widget. It may already be on your checkout page.', type: 'warning' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <PageWrapper>
      <Page>
        <Page.Header
          title="Delivery Scheduler"
          subtitle="Today's fulfilment at a glance."
          actionsBar={
            data?.widgetPlacement !== 'placed' ? (
              <Button onClick={() => void addToCheckout()} disabled={adding} prefixIcon={adding ? <Loader size="tiny" /> : undefined}>
                {adding ? 'Adding to checkout…' : 'Add to checkout'}
              </Button>
            ) : undefined
          }
        />
        <Page.Content>
          <Box direction="vertical" gap="SP4">
            <SectionTabs />
            {error && (
              <SectionHelper skin="danger" title="Couldn't load the overview" actionText="Retry" onAction={() => void load()}>
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
                  <SectionHelper skin="standard" title="Finish setup" actionText="Open settings" onAction={() => navigate('/settings')}>
                    Set your time zone, hours and methods, then turn scheduling on. Checkout is never blocked until you do.
                  </SectionHelper>
                )}
                {data.configured && !data.enabled && (
                  <SectionHelper skin="warning" title="Scheduling is off" actionText="Open settings" onAction={() => navigate('/settings')}>
                    Customers can't choose a time and checkout isn't validated.
                  </SectionHelper>
                )}
                {data.widgetPlacement !== 'placed' && (
                  <SectionHelper
                    skin={data.widgetPlacement === 'unknown' ? 'standard' : 'warning'}
                    title={data.widgetPlacement === 'unknown' ? 'Check the checkout widget' : 'The checkout widget isn’t on your site'}
                  >
                    Customers choose their time in the delivery step of checkout. Add the widget there to start collecting schedules.
                  </SectionHelper>
                )}
                {(data.counts.needsReview > 0 || data.counts.missingSchedule > 0) && (
                  <SectionHelper skin="danger" title="Orders need attention" actionText="Review orders" onAction={() => navigate('/orders')}>
                    {data.counts.needsReview} order(s) need review and {data.counts.missingSchedule} required order(s) arrived without a schedule.
                  </SectionHelper>
                )}
                <Card>
                  <StatisticsWidget
                    items={[
                      { value: String(data.counts.today), description: `Today (${displayDate(data.today)})` },
                      { value: String(data.counts.upcoming), description: 'Next 7 days' },
                      { value: String(data.counts.delivery), description: 'Deliveries (7 days)' },
                      { value: String(data.counts.pickup), description: 'Pickups (7 days)' },
                      { value: String(data.counts.missingSchedule), description: 'Missing a schedule' },
                    ]}
                  />
                </Card>
                <Card>
                  <Card.Header title="Slots near capacity" subtitle={`Next 7 days · ${data.timezone}`} />
                  <Card.Divider />
                  {data.nearCapacity.length === 0 ? (
                    <Card.Content>
                      <Text size="small" secondary>No slots are at or near capacity.</Text>
                    </Card.Content>
                  ) : (
                    <Table
                      data={data.nearCapacity}
                      columns={[
                        { title: 'Date', render: (r) => displayDate(r.date) },
                        { title: 'Slot', render: (r) => r.slotId },
                        { title: 'Method', render: (r) => (r.method === 'pickup' ? METHOD_LABELS.pickup : METHOD_LABELS.delivery) },
                        { title: 'Remaining', render: (r) => (r.remaining === 0 ? 'Full' : String(r.remaining)) },
                      ]}
                    >
                      <Table.Content />
                    </Table>
                  )}
                </Card>
                <Box gap="SP2">
                  <Button onClick={() => navigate('/orders')}>View orders</Button>
                  <Button priority="secondary" onClick={() => void load()}>Refresh</Button>
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
