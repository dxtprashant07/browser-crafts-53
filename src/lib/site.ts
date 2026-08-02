// Set VITE_SITE_URL at build/deploy time to override the production origin,
// no trailing slash. Falls back to the real production domain.
export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.subtrate.com";

export function absUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
