export type TrackEvent =
  | "tool_viewed"
  | "tool_used"
  | "result_downloaded"
  | "related_clicked";

const isDev = import.meta.env.DEV;

export function track(eventName: TrackEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  // GA4 stub — in production this would push to dataLayer / gtag.
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${eventName}`, params);
  }
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: eventName, ...params });
  }
}
