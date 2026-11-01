import { extensions } from '@wix/astro/builders'

export default extensions.dashboardPage({
  id: 'ae323d2d-80a6-4e51-b7df-c559c1c06f05',
  title: 'Delivery Scheduler',
  routePath: 'delivery-scheduler',
  component: './extensions/dashboard/pages/delivery-scheduler/delivery-scheduler.tsx',
  fullPage: false,
  metaData: {
    searchable: true,
    description: 'Manage Delivery Scheduler in your dashboard.',
  },
});
