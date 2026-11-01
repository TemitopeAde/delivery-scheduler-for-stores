import React from 'react';
import { Box, ColorInput, FormField, Input, Text } from '@wix/design-system';
import { MESSAGE_KEYS, MESSAGES_EN, TARGET_LOCALES } from '../../../../../lib/i18n/messages';
import { DATE_STYLES, FONT_FAMILIES, HOUR_CYCLES, SLOT_STYLES, type Appearance } from '../../../../../lib/schemas';
import { NumberField, SelectField, ToggleField, proLabel, type SectionProps } from './fields';

const COLOR_FIELDS: Array<[keyof Appearance, string]> = [
  ['textColor', 'Text'],
  ['backgroundColor', 'Background'],
  ['borderColor', 'Borders'],
  ['accentColor', 'Accent (selected)'],
  ['accentTextColor', 'Text on accent'],
];

const toHex = (color: string | object): string | null =>
  typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : null;

export const AppearanceSection = ({ value, update, plan }: SectionProps) => {
  const a = value.appearance;
  const setA = (patch: Partial<Appearance>) => update({ appearance: { ...a, ...patch } });
  const t = value.translations;
  return (
    <Box direction="vertical" gap="SP4">
      <SelectField label="Font" value={a.fontFamily} options={FONT_FAMILIES.map((f) => ({ id: f, label: f }))} onChange={(fontFamily) => setA({ fontFamily })} />
      <Text size="tiny" secondary>Web-safe fonts only, so the widget never waits for a font download at checkout.</Text>
      <NumberField label="Font size (px)" value={a.fontSize} min={12} max={22} onChange={(fontSize) => setA({ fontSize })} />
      <SelectField
        label="Font weight"
        value={a.fontWeight}
        options={[400, 500, 600, 700].map((w) => ({ id: w as Appearance['fontWeight'], label: String(w) }))}
        onChange={(fontWeight) => setA({ fontWeight })}
      />
      <ToggleField
        label="Use my own colors"
        checked={a.useCustomColors}
        onChange={(useCustomColors) => setA({ useCustomColors })}
        info="When off, the widget follows the colors and corner radius of your checkout theme."
      />
      {a.useCustomColors &&
        COLOR_FIELDS.map(([key, text]) => (
          <FormField key={key} label={text}>
            <ColorInput
              value={String(a[key])}
              onConfirm={(color) => {
                const hex = toHex(color);
                if (hex) setA({ [key]: hex } as Partial<Appearance>);
              }}
            />
          </FormField>
        ))}
      <NumberField label="Corner radius (px)" value={a.borderRadius} min={0} max={24} onChange={(borderRadius) => setA({ borderRadius })} />
      <NumberField label="Spacing (px)" value={a.spacing} min={4} max={24} onChange={(spacing) => setA({ spacing })} />
      <SelectField label="Selected slot style" value={a.slotStyle} options={SLOT_STYLES.map((s) => ({ id: s, label: s === 'filled' ? 'Filled' : 'Outline' }))} onChange={(slotStyle) => setA({ slotStyle })} />

      <SelectField
        label="Default language"
        value={t.defaultLocale}
        options={TARGET_LOCALES.map((l) => ({ id: l, label: l === 'en' ? 'English' : `${l} (uses English until translated)` }))}
        onChange={(defaultLocale) => update({ translations: { ...t, defaultLocale } })}
      />
      <SelectField label="Date format" value={t.dateStyle} options={DATE_STYLES.map((d) => ({ id: d, label: d[0]?.toUpperCase() + d.slice(1) }))} onChange={(dateStyle) => update({ translations: { ...t, dateStyle } })} />
      <SelectField label="Time format" value={t.hourCycle} options={HOUR_CYCLES.map((h) => ({ id: h, label: h === 'h12' ? '12-hour' : '24-hour' }))} onChange={(hourCycle) => update({ translations: { ...t, hourCycle } })} />
      <CopyOverrides value={value} update={update} plan={plan} />
    </Box>
  );
};

/** Merchant copy per message key for the default language. Plain text only; never HTML. */
const CopyOverrides = ({ value, update, plan }: SectionProps) => {
  const t = value.translations;
  const locale = t.defaultLocale;
  const overrides = t.overrides[locale] ?? {};
  const disabled = plan !== 'pro';
  const setKey = (key: string, text: string) => {
    const next = { ...overrides };
    if (text.trim()) next[key] = text;
    else delete next[key];
    const all = { ...t.overrides };
    if (Object.keys(next).length) all[locale] = next;
    else delete all[locale];
    update({ translations: { ...t, overrides: all } });
  };
  return (
    <FormField label={proLabel(`Custom text (${locale})`, plan, true)} infoContent="Leave a field blank to use the default text.">
      <Box direction="vertical" gap="SP2">
        {MESSAGE_KEYS.map((key) => (
          <Box key={key} direction="vertical" gap="SP1">
            <Text size="tiny" secondary>{key}</Text>
            <Input
              size="small"
              disabled={disabled}
              maxLength={300}
              value={overrides[key] ?? ''}
              placeholder={MESSAGES_EN[key] || '(empty by default)'}
              ariaLabel={`Custom text for ${key}`}
              onChange={(e) => setKey(key, e.target.value)}
            />
          </Box>
        ))}
      </Box>
    </FormField>
  );
};
