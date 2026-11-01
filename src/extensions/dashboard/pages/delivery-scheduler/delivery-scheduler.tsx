// The dashboard page's entry file. A Wix CLI app has to hand the page location
// to the router itself: PatternsReactRouter reads it from the location prop of
// withDashboard (in SchedulerApp), and nothing else supplies it.
import React, { useEffect, useState } from 'react';
import { dashboard, type PageLocation, type PageParams } from '@wix/dashboard';
import { BusinessManagerTheme } from '../../BusinessManagerTheme';
import { SchedulerApp } from './SchedulerApp';

const Page = () => {
  const [location, setLocation] = useState<PageLocation | undefined>();

  useEffect(() => {
    const subscription = dashboard.observeState<PageParams>((pageParams) => {
      setLocation(pageParams.location);
    });
    return () => subscription.disconnect();
  }, []);

  return <BusinessManagerTheme>{location ? <SchedulerApp location={location} /> : null}</BusinessManagerTheme>;
};

export default Page;
