import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  AUDIT_EVIDENCE,
  auditPrompt,
  buildGuideJson,
  buildLlmsTxt,
  GUIDE_JSON_URL,
  LLMS_FULL_URL,
  machineFiles,
  MCP_SERVERS,
  SITE_URL,
} from "./audit.ts";
import { ALL_REFERENCES, RECOMMENDATIONS, STATIONS, STATION_IDS, TOOL_COVERAGE } from "./model.ts";
import { parseChangelog } from "./changelog.ts";

const changelog = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");
const guide = buildGuideJson(changelog);

test("the site URL is the live Pages URL the README and Vite base use", () => {
  assert.equal(SITE_URL, "https://adamsuk.github.io/line/");
  assert.equal(GUIDE_JSON_URL, "https://adamsuk.github.io/line/guide.json");
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  assert.ok(readme.includes("https://adamsuk.github.io/line/"));
  const vite = readFileSync(new URL("../../vite.pages.config.ts", import.meta.url), "utf8");
  assert.match(vite, /"\/line\/"/);
});

test("guide.json is versioned by the latest changelog date", () => {
  assert.equal(guide.version, parseChangelog(changelog).releases[0].date);
  assert.match(guide.version, /^\d{4}-\d{2}-\d{2}$/);
});

test("guide.json has every station in order, with its audit evidence", () => {
  assert.deepEqual(
    guide.stations.map((s) => s.id),
    [...STATION_IDS],
  );
  for (const s of guide.stations) {
    assert.equal(s.name, STATIONS.find((x) => x.id === s.id)!.name);
    assert.ok(s.audit.evidence.length > 0 && s.audit.access.length > 0, s.id);
  }
  assert.deepEqual(Object.keys(AUDIT_EVIDENCE), [...STATION_IDS]);
});

test("guide.json carries every recommendation once, unchanged, under its station", () => {
  const seen = guide.stations.flatMap((s) =>
    s.recommendations.map((r) => ({ ...r, station: s.id })),
  );
  assert.equal(seen.length, RECOMMENDATIONS.length);
  for (const r of RECOMMENDATIONS) {
    const j = seen.find((x) => x.id === r.id);
    assert.ok(j, r.id);
    assert.equal(j.station, r.station);
    assert.equal(j.maturity, r.maturity);
    assert.equal(j.text, r.text);
    assert.deepEqual(j.sources, r.sources);
  }
});

test("guide.json tool ratings match the page's tool coverage", () => {
  assert.equal(guide.tools.length, TOOL_COVERAGE.length);
  for (const t of TOOL_COVERAGE) {
    const j = guide.tools.find((x) => x.url === t.url);
    assert.ok(j, t.name);
    for (const id of STATION_IDS) {
      const fit = t.stations[id].fit;
      assert.equal((j.stations as Record<string, string>)[id] ?? "None", fit, `${t.name} ${id}`);
    }
  }
});

test("guide.json lists every source with a date, and every cited source resolves", () => {
  assert.equal(guide.sources.length, ALL_REFERENCES.length);
  const ids = new Set(guide.sources.map((s) => s.id));
  for (const s of guide.sources) assert.ok(s.date.length > 0, s.id);
  for (const r of guide.stations.flatMap((s) => s.recommendations))
    for (const id of r.sources) assert.ok(ids.has(id), `${r.id} cites ${id}`);
});

test("the audit prompt fetches the live guide.json, stays read-only, and asks for all four outputs", () => {
  const p = auditPrompt(guide.version);
  assert.ok(p.includes(`Fetch ${GUIDE_JSON_URL}`));
  assert.match(p, /read-only/i);
  assert.match(p, /Do not create, edit/);
  assert.match(p, /score it unknown\. Do not guess/);
  for (const s of STATIONS) assert.ok(p.includes(`${s.index} ${s.name}:`), s.name);
  for (const part of ["(a) Scorecard", "(b) Quick wins", "(c) Biggest gains", "(d) Unknowns"])
    assert.ok(p.includes(part), part);
  assert.match(p, /Keep Best practice and Cutting edge apart/);
  assert.equal(guide.audit.prompt, p);
});

test("llms.txt follows the convention and points at guide.json", () => {
  const txt = buildLlmsTxt(changelog);
  const lines = txt.split("\n");
  assert.equal(lines[0], "# Line");
  assert.ok(lines[2].startsWith("> "));
  assert.equal(txt.match(/^# /gm)?.length, 1);
  assert.ok(txt.includes(`](${GUIDE_JSON_URL})`));
  assert.ok(txt.includes(`](${LLMS_FULL_URL})`));
  for (const line of lines.filter((l) => l.startsWith("- ")))
    assert.match(line, /^- \[[^\]]+\]\(https:\/\/[^)]+\)(: .+)?$/, line);
});

test("the build emits the three files, and guide.json parses", () => {
  const files = machineFiles(changelog);
  assert.deepEqual(Object.keys(files).sort(), ["guide.json", "llms-full.txt", "llms.txt"]);
  assert.deepEqual(JSON.parse(files["guide.json"]), JSON.parse(JSON.stringify(guide)));
  assert.ok(files["llms-full.txt"].includes(auditPrompt(guide.version)));
});

test("MCP server links are https, and the copy has no em or en dashes", () => {
  for (const s of MCP_SERVERS.flatMap((g) => g.servers)) assert.match(s.url, /^https:\/\//, s.name);
  const copy = JSON.stringify([
    AUDIT_EVIDENCE,
    MCP_SERVERS,
    auditPrompt("x"),
    buildLlmsTxt(changelog),
  ]);
  assert.doesNotMatch(copy, /[\u2013\u2014]/);
});
