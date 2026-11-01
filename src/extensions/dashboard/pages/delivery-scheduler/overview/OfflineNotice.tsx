import React from 'react';
import { SectionHelper } from '@wix/design-system';
import { useDashboardI18n } from '../LanguageContext';

/** Shown at the bottom of the page while the browser reports no connectivity. */
export const OfflineNotice = () => {
  const { t } = useDashboardI18n();
  const [online, setOnline] = React.useState(() => navigator.onLine !== false);
  React.useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  if (online) return null;
  return (
    <SectionHelper skin="warning" title={t('overview.offlineTitle')}>
      {t('overview.offlineDesc')}
    </SectionHelper>
  );
};
