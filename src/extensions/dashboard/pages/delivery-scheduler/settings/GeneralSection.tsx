import React from 'react';
import { Box, Dropdown, FormField } from '@wix/design-system';
import { REQUIRED_MODES } from '../../../../../lib/schemas';
import { NumberField, SelectField, ToggleField, proLabel, type SectionProps } from './fields';
import { useDashboardI18n } from '../LanguageContext';

function timeZones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['UTC'];
  }
}

export const GeneralSection = ({ value, update, plan }: SectionProps) => {
  const { t } = useDashboardI18n();
  const zones = React.useMemo(timeZones, []);

  const requiredLabels = {
    all: t('settings.reqAll'),
    selectedProducts: t('settings.reqSelected'),
    optional: t('settings.reqOptional'),
  };

  return (
    <Box direction="vertical" gap="SP4">
      <ToggleField
        label={t('settings.enabled')}
        checked={value.enabled}
        onChange={(enabled) => update({ enabled })}
        info={t('settings.enabledInfo')}
      />
      <SelectField
        label={proLabel(t('settings.requirement'), plan, value.requiredMode === 'selectedProducts')}
        value={value.requiredMode}
        options={REQUIRED_MODES.map((m) => ({ id: m, label: requiredLabels[m] }))}
        onChange={(requiredMode) => update({ requiredMode })}
      />
      <FormField
        label={t('settings.timezone')}
        required
        infoContent={t('settings.timezoneInfo')}
      >
        <Dropdown
          selectedId={value.timezone}
          options={zones.map((z) => ({ id: z, value: z }))}
          onSelect={(o) => update({ timezone: String(o.id) })}
          popoverProps={{ appendTo: 'window' }}
        />
      </FormField>
      <NumberField
        label={t('settings.holdMinutes')}
        value={value.holdMinutes}
        min={5}
        max={120}
        onChange={(holdMinutes) => update({ holdMinutes })}
        info={t('settings.holdMinutesInfo')}
      />
    </Box>
  );
};
