import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, Checkbox, FormField, NumberInput, Text, ToggleSwitch } from '@wix/design-system';
import { EntityPage, useEntityPage, useEntityPageContext } from '@wix/patterns';
import { useController, useForm } from '@wix/patterns/form';
import { DEFAULT_SETTINGS_INPUT } from '../../../../../lib/defaults';
import {
  productRuleInputSchema,
  type FulfilmentMethod,
  type ProductRule,
  type WeekHours,
} from '../../../../../lib/schemas';
import { api } from '../dashboard-api';
import { getMethodLabel } from '../labels';
import { WeekHoursEditor } from '../settings/WeekHoursEditor';
import { ProductPicker } from './ProductPicker';
import { useDashboardI18n } from '../LanguageContext';

type RuleFormFields = {
  product: { id: string; name: string } | null;
  enabled: boolean;
  preparationHours: number;
  methods: FulfilmentMethod[];
  requiredScheduling: boolean;
  restrictHours: boolean;
  hours: WeekHours;
};

export const ProductRuleEntityPage = () => {
  const { id } = useParams<{ id?: string }>();
  const form = useForm<RuleFormFields>();
  const { t } = useDashboardI18n();

  const state = useEntityPage<ProductRule, RuleFormFields>({
    parentPath: '/product-rules',
    isNewEntity: () => !id,
    form,
    fetch: async () => ({ entity: id ? (await api.getRule(id)).rule : undefined }),
    onSave: async () => {
      const v = form.getValues();
      const product = v.product;
      if (!product) throw new Error(t('productRules.chooseProduct'));
      const input = productRuleInputSchema.parse({
        productId: product.id,
        productName: product.name,
        enabled: v.enabled,
        preparationMinutes: Math.round(v.preparationHours * 60),
        allowedFulfilmentMethods: v.methods,
        requiredScheduling: v.requiredScheduling,
        customWorkingHours: v.restrictHours ? v.hours : null,
      });
      return { updatedEntity: (await api.saveRule(input)).rule };
    },
    saveSuccessToast: t('productRules.saveSuccess'),
    saveErrorToast: (err) => (err instanceof Error ? err.message : t('productRules.saveError')),
  });

  return (
    <EntityPage state={state}>
      <EntityPage.Header title={{ text: id ? t('productRules.editRuleTitle') : t('productRules.newRuleTitle') }} />
      <EntityPage.Content>
        <EntityPage.MainContent>
          <Card>
            <Card.Header title={t('productRules.productSection')} />
            <Card.Divider />
            <Card.Content>
              <ProductFields isNew={!id} />
            </Card.Content>
          </Card>
          <Card>
            <Card.Header
              title={t('productRules.customHours')}
              subtitle={t('productRules.ruleActiveInfo')}
            />
            <Card.Divider />
            <Card.Content>
              <HoursFields />
            </Card.Content>
          </Card>
        </EntityPage.MainContent>
      </EntityPage.Content>
    </EntityPage>
  );
};

const ProductFields = ({ isNew }: { isNew: boolean }) => {
  const page = useEntityPageContext<ProductRule, RuleFormFields>();
  const { t } = useDashboardI18n();
  const rule = page.entity;
  const control = page.form.control;
  const product = useController({
    name: 'product',
    control,
    defaultValue: rule ? { id: rule.productId, name: rule.productName } : null,
    rules: { validate: (v) => (v ? true : t('productRules.chooseProduct')) },
  });
  const enabled = useController({ name: 'enabled', control, defaultValue: rule?.enabled ?? true });
  const prep = useController({
    name: 'preparationHours',
    control,
    defaultValue: rule ? rule.preparationMinutes / 60 : 0,
    rules: { min: { value: 0, message: '0' } },
  });
  const methods = useController({
    name: 'methods',
    control,
    defaultValue: rule?.allowedFulfilmentMethods ?? ['delivery', 'pickup'],
    rules: { validate: (v) => (v.length > 0 ? true : t('productRules.allowedMethods')) },
  });
  const required = useController({ name: 'requiredScheduling', control, defaultValue: rule?.requiredScheduling ?? true });

  const toggleMethod = (method: FulfilmentMethod, on: boolean) =>
    methods.field.onChange(on ? [...new Set([...methods.field.value, method])] : methods.field.value.filter((m) => m !== method));

  return (
    <Box direction="vertical" gap="SP4">
      {isNew ? (
        <FormField label={t('productRules.productSection')} required status={product.fieldState.error ? 'error' : undefined} statusMessage={product.fieldState.error?.message}>
          <ProductPicker value={product.field.value} onChange={product.field.onChange} />
        </FormField>
      ) : (
        <Text weight="bold">{rule?.productName || rule?.productId}</Text>
      )}
      <FormField label={t('productRules.ruleActive')} labelPlacement="right">
        <ToggleSwitch checked={enabled.field.value} onChange={(e) => enabled.field.onChange(e.target.checked)} />
      </FormField>
      <FormField label={t('productRules.extraPrep')} status={prep.fieldState.error ? 'error' : undefined} statusMessage={prep.fieldState.error?.message}>
        <NumberInput min={0} max={1440} step={0.5} value={prep.field.value} onChange={(v) => prep.field.onChange(v ?? 0)} />
      </FormField>
      <FormField label={t('productRules.allowedMethods')} status={methods.fieldState.error ? 'error' : undefined} statusMessage={methods.fieldState.error?.message}>
        <Box gap="SP4">
          {(['delivery', 'pickup'] as const).map((m) => (
            <Checkbox key={m} checked={methods.field.value.includes(m)} onChange={(e) => toggleMethod(m, e.target.checked)}>
              {getMethodLabel(m, t)}
            </Checkbox>
          ))}
        </Box>
      </FormField>
      <FormField label={t('productRules.requireScheduling')} labelPlacement="right">
        <ToggleSwitch checked={required.field.value} onChange={(e) => required.field.onChange(e.target.checked)} />
      </FormField>
    </Box>
  );
};

const HoursFields = () => {
  const page = useEntityPageContext<ProductRule, RuleFormFields>();
  const { t } = useDashboardI18n();
  const rule = page.entity;
  const restrict = useController({
    name: 'restrictHours',
    control: page.form.control,
    defaultValue: !!rule?.customWorkingHours,
  });
  const hours = useController({
    name: 'hours',
    control: page.form.control,
    defaultValue: rule?.customWorkingHours ?? DEFAULT_SETTINGS_INPUT.delivery.workingHours,
  });
  return (
    <Box direction="vertical" gap="SP4">
      <FormField label={t('productRules.customHours')} labelPlacement="right">
        <ToggleSwitch checked={restrict.field.value} onChange={(e) => restrict.field.onChange(e.target.checked)} />
      </FormField>
      {restrict.field.value && <WeekHoursEditor value={hours.field.value} onChange={hours.field.onChange} />}
    </Box>
  );
};
