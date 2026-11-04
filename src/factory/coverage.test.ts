import { test } from "node:test";
import assert from "node:assert/strict";
import { AUDIT_EVIDENCE, auditPrompt, buildGuideJson, midSentence } from "./audit.ts";
import { checkUrl, citedUrls } from "./links.ts";
import { ALL_REFERENCES, RECOMMENDATIONS, STATIONS, STATION_IDS, TOOL_LIST } from "./model.ts";

test("every station with a recommendation has audit evidence and access", () => {
  for (const r of RECOMMENDATIONS) {
    const a = AUDIT_EVIDENCE[r.station];
    assert.ok(a.evidence.length > 0, `${r.id}: no audit evidence for ${r.station}`);
    assert.ok(a.access.length > 0, `${r.id}: no audit access for ${r.station}`);
    for (const line of [...a.evidence, ...a.access]) assert.ok(line.trim().length > 0, r.id);
  }
});

test("the audit prompt and guide.json carry each station's evidence", () => {
  const prompt = auditPrompt("test");
  const guide = buildGuideJson("## 2026-01-01\n");
  for (const s of STATIONS) {
    for (const line of AUDIT_EVIDENCE[s.id].evidence) assert.ok(prompt.includes(midSentence(line)), `${s.id}: ${line}`);
    const g = guide.stations.find((x) => x.id === s.id)!;
    assert.deepEqual(g.audit, AUDIT_EVIDENCE[s.id]);
    assert.equal(g.recommendations.length, RECOMMENDATIONS.filter((r) => r.station === s.id).length);
  }
});

test("every station has at least one recommendation", () => {
  for (const id of STATION_IDS) {
    assert.ok(RECOMMENDATIONS.some((r) => r.station === id), id);
  }
});

test("every cited URL is listed once for the live link check", () => {
  const urls = citedUrls();
  assert.equal(urls.length, ALL_REFERENCES.length + TOOL_LIST.length);
  for (const u of urls) assert.match(u.url, /^https:\/\/\S+$/, u.id);
});

test("the link check treats 2xx and 3xx as resolved, 4xx and errors as broken", async () => {
  const c = { url: "https://example.test/", kind: "source" as const, id: "x" };
  const status = (code: number) => (async () => ({ status: code }) as Response) as typeof fetch;
  assert.equal((await checkUrl(c, status(200))).ok, true);
  assert.equal((await checkUrl(c, status(404))).ok, false);
  const boom = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  const r = await checkUrl(c, boom);
  assert.equal(r.ok, false);
  assert.equal(r.error, "offline");
});

test("the link check falls back to GET when HEAD is refused", async () => {
  const c = { url: "https://example.test/", kind: "tool" as const, id: "y" };
  const seen: string[] = [];
  const f = (async (_u: string, init: RequestInit) => {
    seen.push(String(init.method));
    return { status: init.method === "HEAD" ? 405 : 200 } as Response;
  }) as unknown as typeof fetch;
  assert.equal((await checkUrl(c, f)).ok, true);
  assert.deepEqual(seen, ["HEAD", "GET"]);
});
