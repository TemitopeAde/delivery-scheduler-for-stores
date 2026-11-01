import React from 'react';
import { Box, Dropdown, Text } from '@wix/design-system';
import { useDashboardI18n } from './LanguageContext';
import type { SupportedLocale } from '../../../../lib/i18n/languages';

export const LanguageSwitcher: React.FC<{ size?: 'small' | 'medium' }> = ({ size = 'small' }) => {
  const { locale, setLocale, languages, t } = useDashboardI18n();

  return (
    <Box verticalAlign="middle" gap="SP2">
      <Text size="tiny" secondary>
        🌐 {t('nav.language')}:
      </Text>
      <Box width="170px">
        <Dropdown
          size={size}
          selectedId={locale}
          options={languages.map((lang) => ({
            id: lang.code,
            value: `${lang.nativeName} (${lang.code.toUpperCase()})`,
          }))}
          onSelect={(option) => {
            if (option?.id) {
              void setLocale(option.id as SupportedLocale);
            }
          }}
          popoverProps={{ appendTo: 'window' }}
        />
      </Box>
    </Box>
  );
};

