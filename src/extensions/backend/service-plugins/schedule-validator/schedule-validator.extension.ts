import { extensions } from '@wix/astro/builders'

export default extensions.ecomValidations({
  id: '118e60fa-e84d-4f19-a832-fa9482815394',
  name: 'schedule-validator',
  validateInCart: false,
  source: './extensions/backend/service-plugins/schedule-validator/schedule-validator.ts',
});
