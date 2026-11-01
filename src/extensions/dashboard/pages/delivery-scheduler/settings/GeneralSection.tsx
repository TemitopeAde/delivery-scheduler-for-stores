import React from 'react';
import { Box, Dropdown, FormField } from '@wix/design-system';
import { REQUIRED_MODES } from '../../../../../lib/schemas';
import { NumberField, SelectField, ToggleField, proLabel, type SectionProps } from './fields';

const REQUIRED_LABELS: Record<(typeof REQUIRED_MODES)[number], string> = {
  all: 'Required for all orders with store products',
  selectedProducts: 'Required only for products with a rule that requires it',
  optional: 'Optional',
};

function timeZones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['UTC'];
  }
}

export const GeneralSection = ({ value, update, plan }: SectionProps) => {
  const zones = React.useMemo(timeZones, []);
  return (
    <Box direction="vertical" gap="SP4">
      <ToggleField
        label="Scheduling enabled"
        checked={value.enabled}
        onChange={(enabled) => update({ enabled })}
        info="While off, the checkout widget is hidden and checkout is never blocked."
      />
      <SelectField
        label={proLabel('Scheduling requirement', plan, value.requiredMode === 'selectedProducts')}
        value={value.requiredMode}
        options={REQUIRED_MODES.map((m) => ({ id: m, label: REQUIRED_LABELS[m] }))}
        onChange={(requiredMode) => update({ requiredMode })}
      />
      <FormField
        label="Store time zone"
        required
        infoContent="All dates, cut-offs and capacity use this zone, never the customer's browser zone."
      >
        <Dropdown
          selectedId={value.timezone}
          options={zones.map((z) => ({ id: z, value: z }))}
          onSelect={(o) => update({ timezone: String(o.id) })}
          popoverProps={{ appendTo: 'window' }}
        />
      </FormField>
      <NumberField
        label="Hold a selected time for (minutes)"
        value={value.holdMinutes}
        min={5}
        max={120}
        onChange={(holdMinutes) => update({ holdMinutes })}
        info="Capacity is reserved while the customer finishes checkout, then released if no order arrives."
      />
    </Box>
  );
};
