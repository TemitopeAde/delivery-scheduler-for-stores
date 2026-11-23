import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, Package, SlidersHorizontal, Settings, CircleHelp, ScrollText } from 'lucide-react';
import { useDashboardI18n } from './LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
const links = [
  ['/', 'nav.overview', LayoutDashboard],
  ['/orders', 'nav.orders', Package],
  ['/product-rules', 'nav.productRules', SlidersHorizontal],
  ['/logs', 'nav.logs', ScrollText],
  ['/settings', 'nav.settings', Settings],
  ['/help', 'nav.help', CircleHelp],
] as const;
export function DashboardLayout({ children }: { children: ReactNode }) {
  const { t } = useDashboardI18n();
  return <div className="scheduler-shell">
    <aside className="scheduler-sidebar">
      <div className="scheduler-brand"><span><CalendarDays size={21} /></span><div>Delivery Scheduler<small>Store operations</small></div></div>
      <nav aria-label="Dashboard">{links.map(([path, label, Icon]) => <NavLink key={path} to={path} end={path === '/'} className={({isActive}) => `scheduler-nav-link${isActive ? ' active' : ''}`}><Icon size={18} aria-hidden="true" />{t(label)}</NavLink>)}</nav>
      <div className="scheduler-sidebar-footer"><LanguageSwitcher /></div>
    </aside>
    <main className="scheduler-main" id="main-content">{children}</main>
  </div>;
}
