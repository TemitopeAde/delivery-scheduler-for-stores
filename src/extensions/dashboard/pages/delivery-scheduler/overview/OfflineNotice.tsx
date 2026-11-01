import React from 'react';
import { SectionHelper } from '@wix/design-system';

/** Shown at the bottom of the page while the browser reports no connectivity. */
export const OfflineNotice = () => {
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
    <SectionHelper skin="warning" title="You're offline">
      Data on this page may be out of date. It refreshes when your connection returns.
    </SectionHelper>
  );
};
