import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs } from '@wix/design-system';

const SECTIONS = [
  { id: '/', title: 'Overview' },
  { id: '/orders', title: 'Orders' },
  { id: '/product-rules', title: 'Product rules' },
  { id: '/settings', title: 'Settings' },
  { id: '/help', title: 'Help & diagnostics' },
] as const;

/** Section navigation shared by every route; the active tab follows the router path. */
export const SectionTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active =
    [...SECTIONS].reverse().find((s) => s.id !== '/' && pathname.startsWith(s.id))?.id ?? '/';
  return (
    <Tabs
      items={SECTIONS.map((s) => ({ id: s.id, title: s.title }))}
      activeId={active}
      type="compactSide"
      onClick={(item) => navigate(String(item.id))}
    />
  );
};
