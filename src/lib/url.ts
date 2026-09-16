const BASE = import.meta.env.BASE_URL ?? '/';

/** Join the active base with a site-relative path, collapsing the duplicate slash at the join. */
export function withBase(path: string): string {
  const left = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const right = path.startsWith('/') ? path : `/${path}`;
  return `${left}${right}` || '/';
}

/** Absolute URL (site + base + path) for canonical/OG/sitemap-style needs. */
export function absoluteUrl(path: string, site: string): string {
  return new URL(withBase(path), site).toString();
}
