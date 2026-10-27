import { extensions } from '@wix/astro/builders';

export default extensions.dashboardPage({
  id: '310bf76c-6ae9-4a6b-8ad7-3cc28742e8d2',
  title: 'My Page',
  routePath: '',
  component: './extensions/dashboard/pages/my-page/my-page.tsx',
  fullPage: false,
  metaData: {
    searchable: true,
    description: 'Manage My Page in your dashboard.',
  },
});
