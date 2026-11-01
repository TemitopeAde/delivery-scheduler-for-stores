import { extensions } from '@wix/astro/builders'

export default extensions.sitePlugin({
  id: '8d61bd95-6f51-437b-93b8-2ddc19354a7b',
  name: 'Delivery Scheduler',
  marketData: {
    name: 'Delivery Scheduler',
    description: 'Lets customers choose a delivery or pickup date and time during checkout.',
    logoUrl: '{{BASE_URL}}/delivery-scheduler-app-icon.png',
  },
  // Legacy `placements` format: this builder version has no `placementsSlotIds`.
  // This delivery-step options slot exposes deliveryStepState and
  // disableContinueButton to the plugin.
  placements: [{
    appDefinitionId: '1380b703-ce81-ff05-f115-39571d94dfcd',
    widgetId: '14fd5970-8072-c276-1246-058b79e70c1a',
    slotId: 'checkout:delivery-step:options:after',
  }],
  installation: { autoAdd: true },
  tagName: 'delivery-scheduler-picker',
  element: './extensions/site/plugins/delivery-scheduler-picker/delivery-scheduler-picker.tsx',
  settings: './extensions/site/plugins/delivery-scheduler-picker/delivery-scheduler-picker.panel.tsx',
});
