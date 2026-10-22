// Build stamp for the Pages site. vite.pages.config.ts injects __BUILD_TIME__ and __BUILD_SHA__.
// Other builds leave them undefined and the stamp is not shown.

declare const __BUILD_TIME__: string | undefined;
declare const __BUILD_SHA__: string | undefined;

export const REPO_URL = "https://github.com/adamsuk/line";

export interface BuildInfo {
  iso: string;
  sha: string;
}

export function buildInfo(): BuildInfo | null {
  const iso = typeof __BUILD_TIME__ === "string" ? __BUILD_TIME__ : "";
  const sha = typeof __BUILD_SHA__ === "string" ? __BUILD_SHA__ : "";
  if (!iso || Number.isNaN(Date.parse(iso))) return null;
  return { iso: new Date(iso).toISOString(), sha };
}

const LONDON = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZoneName: "short",
});

/** For example "22 Oct 2026, 09:40 BST". */
export function formatLondon(iso: string): string {
  return LONDON.format(new Date(iso));
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function commitUrl(sha: string): string {
  return `${REPO_URL}/commit/${sha}`;
}
