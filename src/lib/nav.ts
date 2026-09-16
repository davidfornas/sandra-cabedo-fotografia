import { site, type NavItem } from '../config/site';

export function getNavItems(): NavItem[] {
  return site.nav;
}
