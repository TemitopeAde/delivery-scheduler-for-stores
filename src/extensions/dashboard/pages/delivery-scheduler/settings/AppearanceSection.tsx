import React from 'react';
import { Box, ColorInput, FormField, Input, Text } from '@wix/design-system';
import { MESSAGE_KEYS, MESSAGES_EN, TARGET_LOCALES } from '../../../../../lib/i18n/messages';
import { LANGUAGES, type SupportedLocale } from '../../../../../lib/i18n/languages';
import { DATE_STYLES, FONT_FAMILIES, HOUR_CYCLES, SLOT_STYLES, type Appearance } from '../../../../../lib/schemas';
import { NumberField, SelectField, ToggleField, proLabel, type SectionProps } from './fields';
import { useDashboardI18n } from '../LanguageContext';
import type { DashboardMessageKey } from '../../../../../lib/i18n/dashboard-messages';

const toHex = (color: string | object): string | null =>
  typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : null;

export const AppearanceSection = ({ value, update, plan }: SectionProps) => {
  const { t, setLocale } = useDashboardI18n();
  const a = value.appearance;
  const setA = (patch: Partial<Appearance>) => update({ appearance: { ...a, ...patch } });
  const trans = value.translations;

  const colorFields: Array<[keyof Appearance, string]> = [
    ['textColor', t('settings.colorText')],
    ['backgroundColor', t('settings.colorBg')],
    ['borderColor', t('settings.colorBorder')],
    ['accentColor', t('settings.colorAccent')],
    ['accentTextColor', t('settings.colorAccentText')],
  ];

  const handleLanguageChange = (newLocale: string) => {
    update({ translations: { ...trans, defaultLocale: newLocale } });
    if (TARGET_LOCALES.includes(newLocale as SupportedLocale)) {
      void setLocale(newLocale as SupportedLocale);
    }
  };

  return (
    <Box direction="vertical" gap="SP4">
      <SelectField label={t('settings.font')} value={a.fontFamily} options={FONT_FAMILIES.map((f) => ({ id: f, label: f }))} onChange={(fontFamily) => setA({ fontFamily })} />
      <Text size="tiny" secondary>{t('settings.fontNote')}</Text>
      <NumberField label={t('settings.fontSize')} value={a.fontSize} min={12} max={22} onChange={(fontSize) => setA({ fontSize })} />
      <SelectField
        label={t('settings.fontWeight')}
        value={a.fontWeight}
        options={[400, 500, 600, 700].map((w) => ({ id: w as Appearance['fontWeight'], label: String(w) }))}
        onChange={(fontWeight) => setA({ fontWeight })}
      />
      <ToggleField
        label={t('settings.customColors')}
        checked={a.useCustomColors}
        onChange={(useCustomColors) => setA({ useCustomColors })}
        info={t('settings.customColorsInfo')}
      />
      {a.useCustomColors &&
        colorFields.map(([key, text]) => (
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
      <NumberField label={t('settings.radius')} value={a.borderRadius} min={0} max={24} onChange={(borderRadius) => setA({ borderRadius })} />
      <NumberField label={t('settings.spacing')} value={a.spacing} min={4} max={24} onChange={(spacing) => setA({ spacing })} />
      <SelectField
        label={t('settings.slotStyle')}
        value={a.slotStyle}
        options={SLOT_STYLES.map((s) => ({
          id: s,
          label: s === 'filled' ? t('settings.slotStyleFilled') : t('settings.slotStyleOutline'),
        }))}
        onChange={(slotStyle) => setA({ slotStyle })}
      />

      <SelectField
        label={t('settings.defaultLang')}
        value={trans.defaultLocale}
        options={TARGET_LOCALES.map((l) => ({
          id: l,
          label: `${LANGUAGES[l].nativeName} (${LANGUAGES[l].name})`,
        }))}
        onChange={handleLanguageChange}
      />
      <SelectField
        label={t('settings.dateFormat')}
        value={trans.dateStyle}
        options={DATE_STYLES.map((d) => ({ id: d, label: d[0]?.toUpperCase() + d.slice(1) }))}
        onChange={(dateStyle) => update({ translations: { ...trans, dateStyle } })}
      />
      <SelectField
        label={t('settings.timeFormat')}
        value={trans.hourCycle}
        options={HOUR_CYCLES.map((h) => ({
          id: h,
          label: h === 'h12' ? t('settings.time12') : t('settings.time24'),
        }))}
        onChange={(hourCycle) => update({ translations: { ...trans, hourCycle } })}
      />
      <CopyOverrides value={value} update={update} plan={plan} />
    </Box>
  );
};

/** Merchant copy per message key for the default language. Plain text only; never HTML. */
const CopyOverrides = ({ value, update, plan }: SectionProps) => {
  const { t } = useDashboardI18n();
  const trans = value.translations;
  const locale = trans.defaultLocale;
  const overrides = trans.overrides[locale] ?? {};
  const disabled = plan !== 'pro';
  const setKey = (key: string, text: string) => {
    const next = { ...overrides };
    if (text.trim()) next[key] = text;
    else delete next[key];
    const all = { ...trans.overrides };
    if (Object.keys(next).length) all[locale] = next;
    else delete all[locale];
    update({ translations: { ...trans, overrides: all } });
  };
  return (
    <FormField label={proLabel(t('settings.customText', { locale }), plan, true)} infoContent={t('settings.customTextInfo')}>
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
