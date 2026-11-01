import React from 'react';
import { Box, Text } from '@wix/design-system';
import { DEFAULT_SETTINGS } from '../../../../../lib/defaults';
import type { SettingsInput } from '../../../../../lib/schemas';
import { renderPreviewHtml } from '../../../../../widget/preview';

/**
 * Renders the real customer widget markup with the unsaved settings. The
 * renderer escapes all merchant text, and colours/fonts are schema-validated,
 * so injecting it is safe. Invalid in-progress values fall back to the last render.
 */
export const WidgetPreview = ({ value }: { value: SettingsInput }) => {
  const lastGood = React.useRef('');
  let html = lastGood.current;
  try {
    html = renderPreviewHtml({ ...DEFAULT_SETTINGS, ...value, configured: true }, value.translations.defaultLocale);
    lastGood.current = html;
  } catch (error) {
    console.error('Preview render failed', error);
  }
  return (
    <Box direction="vertical" gap="SP2">
      <Text size="tiny" secondary>Sample dates from your current settings. Checkout colors apply when custom colors are off.</Text>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Box>
  );
};
