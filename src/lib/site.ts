// Set VITE_SITE_URL at build/deploy time to the real production origin
// (e.g. https://tools.example.com), no trailing slash. Falls back to a
// placeholder so relative dev builds don't silently ship broken absolute URLs.
export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://tools-platform.example.com";

export function absUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
