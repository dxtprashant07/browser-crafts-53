// Ad network config, set at build/deploy time via env vars. Any unset var
// disables that network's placements (component falls back to nothing/placeholder).
export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || ""; // e.g. "ca-pub-1234567890123456"
export const ADSENSE_SLOT_TOOL = import.meta.env.VITE_ADSENSE_SLOT_TOOL || ""; // ad unit id for the in-tool-page slot
export const ETHICALADS_PUBLISHER = import.meta.env.VITE_ETHICALADS_PUBLISHER || ""; // e.g. "toolsplatform"
