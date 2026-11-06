// Every URL the guide cites, and a live check for them. The offline half runs in the factory
// tests; the live half runs from scripts/check-source-links.mjs on a schedule, never on a PR.

import { ALL_REFERENCES, TOOL_LIST } from "./model.ts";

export interface CitedUrl {
  url: string;
  kind: "source" | "tool";
  id: string;
}

export function citedUrls(): CitedUrl[] {
  return [
    ...ALL_REFERENCES.map((r) => ({ url: r.url, kind: "source" as const, id: r.id })),
    ...TOOL_LIST.map((t) => ({ url: t.url, kind: "tool" as const, id: t.name })),
  ];
}

export interface LinkResult extends CitedUrl {
  ok: boolean;
  status: number | null;
  error?: string;
}

/** HEAD first, then GET, because some hosts refuse HEAD. Any status under 400 resolves. */
export async function checkUrl(
  c: CitedUrl,
  fetchFn: typeof fetch = fetch,
  timeoutMs = 20000,
): Promise<LinkResult> {
  let last: LinkResult = { ...c, ok: false, status: null };
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetchFn(c.url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "line-link-check (+https://github.com/adamsuk/line)" },
      });
      await res.body?.cancel().catch(() => {});
      if (res.status < 400) return { ...c, ok: true, status: res.status };
      last = { ...c, ok: false, status: res.status };
    } catch (e) {
      last = { ...c, ok: false, status: null, error: e instanceof Error ? e.message : String(e) };
    }
  }
  return last;
}

export async function checkAll(urls: CitedUrl[], fetchFn: typeof fetch = fetch): Promise<LinkResult[]> {
  const out: LinkResult[] = [];
  const queue = [...urls];
  const worker = async () => {
    for (let c = queue.shift(); c; c = queue.shift()) out.push(await checkUrl(c, fetchFn));
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}
