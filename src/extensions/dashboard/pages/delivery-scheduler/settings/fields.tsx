import React from 'react';
import { Badge, Box, Dropdown, FormField, Input, InputArea, NumberInput, ToggleSwitch } from '@wix/design-system';
import type { Plan } from '../../../../../lib/engine/types';
import type { SettingsInput } from '../../../../../lib/schemas';

export interface SectionProps {
  value: SettingsInput;
  update: (patch: Partial<SettingsInput>) => void;
  plan: Plan;
}

export const ProBadge = () => (
  <Badge size="tiny" skin="premium">
    Pro
  </Badge>
);

export const proLabel = (text: string, plan: Plan, isPro: boolean): React.ReactNode =>
  isPro && plan !== 'pro' ? (
    <Box gap="SP1" verticalAlign="middle">
      {text}
      <ProBadge />
    </Box>
  ) : (
    text
  );

export const ToggleField = ({
  label,
  checked,
  onChange,
  disabled,
  info,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  info?: string;
}) => (
  <FormField label={label} labelPlacement="right" infoContent={info}>
    <ToggleSwitch checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
  </FormField>
);

export const NumberField = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  info,
}: {
  label: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  info?: string;
}) => (
  <FormField label={label} infoContent={info}>
    <NumberInput
      value={value}
      min={min}
      max={max}
      step={step ?? 1}
      disabled={disabled}
      onChange={(v) => onChange(v === null ? min : Math.min(max, Math.max(min, v)))}
    />
  </FormField>
);

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  maxLength,
  disabled,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength: number;
  disabled?: boolean;
}) => (
  <FormField label={label} charCount={maxLength - value.length}>
    {multiline ? (
      <InputArea value={value} maxLength={maxLength} rows={3} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <Input value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    )}
  </FormField>
);

export function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: React.ReactNode;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <FormField label={label}>
      <Dropdown
        selectedId={value}
        disabled={disabled}
        options={options.map((o) => ({ id: o.id, value: o.label }))}
        onSelect={(option) => {
          const picked = options.find((o) => o.id === option.id);
          if (picked) onChange(picked.id);
        }}
      />
    </FormField>
  );
}
