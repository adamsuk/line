import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ADOPTION_STAGES,
  ALL_REFERENCES,
  COMMIT_MESSAGE,
  FURTHER_READING,
  GUIDE,
  MATURITY,
  RECOMMENDATIONS,
  REFERENCES,
  STATIONS,
  STATION_IDS,
  stationIndex,
  TOOLS,
  TOOL_LIST,
  TOOL_COVERAGE,
  FIT_MEANING,
} from "./model.ts";

test("nine stations, numbered in order", () => {
  assert.equal(STATIONS.length, 9);
  STATIONS.forEach((s, i) => {
    assert.equal(s.id, STATION_IDS[i]);
    assert.equal(s.index, String(i + 1).padStart(2, "0"));
  });
});

test("the gate runs before review", () => {
  assert.ok(stationIndex("gate") < stationIndex("review"));
});

test("every station has a guide with a known adoption stage", () => {
  const stages = ADOPTION_STAGES.map((g) => g.stage);
  for (const id of STATION_IDS) {
    const guide = GUIDE[id];
    assert.ok(guide, id);
    assert.ok(stages.includes(guide.stage), id);
    assert.ok(guide.bot.length > 0 && guide.human.length > 0, id);
  }
});

test("every adoption stage has a station or a recommendation", () => {
  for (const { stage } of ADOPTION_STAGES) {
    const hasStation = STATION_IDS.some((id) => GUIDE[id].stage === stage);
    const hasRecommendation = RECOMMENDATIONS.some((r) => r.stage === stage);
    assert.ok(hasStation || hasRecommendation, stage);
  }
});

test("guardrails go up before coding agents", () => {
  const order = ADOPTION_STAGES.map((g) => g.stage);
  assert.ok(order.indexOf("Guardrails") > -1);
  assert.ok(order.indexOf("Guardrails") < order.indexOf("Next"));
  assert.equal(GUIDE.bench.stage, "Next");
  assert.ok(RECOMMENDATIONS.some((r) => r.stage === "Guardrails" && r.station === "source"));
  assert.ok(RECOMMENDATIONS.some((r) => r.stage === "Guardrails" && r.station === "bench"));
});

test("Built on keeps its four pieces", () => {
  assert.deepEqual(
    REFERENCES.map((r) => r.id),
    ["osmani", "iusztin", "savkin", "savkin-review"],
  );
});

test("every recommendation has a label, a known station and stage, and a credited source", () => {
  const credited = new Set(ALL_REFERENCES.map((r) => r.id));
  const labels = Object.keys(MATURITY);
  const stages = ADOPTION_STAGES.map((g) => g.stage);
  const ids = new Set<string>();
  for (const r of RECOMMENDATIONS) {
    assert.ok(!ids.has(r.id), `duplicate ${r.id}`);
    ids.add(r.id);
    assert.ok(labels.includes(r.maturity), r.id);
    assert.ok(STATION_IDS.includes(r.station), r.id);
    assert.ok(stages.includes(r.stage), r.id);
    assert.ok(r.text.length > 0, r.id);
    assert.ok(r.sources.length > 0, r.id);
    for (const id of r.sources) assert.ok(credited.has(id), `${r.id} cites ${id}`);
  }
});

test("best practice rests on more than one source", () => {
  for (const r of RECOMMENDATIONS.filter((r) => r.maturity === "Best practice")) {
    assert.ok(new Set(r.sources).size >= 2, r.id);
  }
});

test("both labels are in use", () => {
  for (const m of Object.keys(MATURITY)) {
    assert.ok(RECOMMENDATIONS.some((r) => r.maturity === m), m);
  }
});

test("every further reading piece backs a recommendation", () => {
  const cited = new Set(RECOMMENDATIONS.flatMap((r) => r.sources));
  for (const ref of FURTHER_READING.flatMap((g) => g.refs)) assert.ok(cited.has(ref.id), ref.id);
});

test("references have unique ids and https links", () => {
  assert.equal(new Set(ALL_REFERENCES.map((r) => r.id)).size, ALL_REFERENCES.length);
  for (const r of ALL_REFERENCES) assert.match(r.url, /^https:\/\//, r.id);
});

test("the README lists every recommendation with its label", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  const rows = readme.split("\n");
  for (const r of RECOMMENDATIONS) {
    assert.ok(
      rows.some((row) => row.startsWith(`| ${r.maturity} |`) && row.includes(r.text)),
      r.id,
    );
  }
  for (const ref of FURTHER_READING.flatMap((g) => g.refs)) assert.ok(readme.includes(ref.url), ref.id);
});

test("every cited source is credited", () => {
  const known = new Set(ALL_REFERENCES.map((r) => r.id));
  const cited = [
    ...STATIONS.flatMap((s) => s.sources ?? []),
    ...Object.values(GUIDE).flatMap((g) => g.sources),
    ...ADOPTION_STAGES.flatMap((g) => g.sources),
  ];
  for (const id of cited) assert.ok(known.has(id), id);
});

test("each bench edit has its own commit message", () => {
  assert.equal(new Set(Object.values(COMMIT_MESSAGE)).size, 3);
});

test("no em or en dashes in station copy, the guide, or the recommendations", () => {
  // Titles are quoted as published, so they are left out.
  const refs = ALL_REFERENCES.map(({ title: _title, ...rest }) => rest);
  const copy = JSON.stringify([STATIONS, GUIDE, ADOPTION_STAGES, refs, RECOMMENDATIONS, MATURITY, TOOLS]);
  assert.doesNotMatch(copy, /[\u2013\u2014]/);
});

test("every recommendation maps to tools or names its gap", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  for (const r of RECOMMENDATIONS) {
    const entry = TOOLS[r.id];
    assert.ok(entry, r.id);
    assert.ok(entry.tools.length > 0 || entry.gap, r.id);
    for (const t of entry.tools) {
      assert.match(t.url, /^https:\/\//, t.name);
      assert.ok(readme.includes(t.url), t.name);
    }
  }
  for (const id of Object.keys(TOOLS)) assert.ok(RECOMMENDATIONS.some((r) => r.id === id), id);
});

test("the tools list names each tool once", () => {
  assert.equal(new Set(TOOL_LIST.map((t) => t.url)).size, TOOL_LIST.length);
  const urls = new Set(Object.values(TOOLS).flatMap((e) => e.tools.map((t) => t.url)));
  assert.equal(TOOL_LIST.length, urls.size);
});

test("tool coverage rates every station for every tool, and nothing else", () => {
  assert.equal(TOOL_COVERAGE.length, TOOL_LIST.length);
  const urls = new Set(TOOL_LIST.map((t) => t.url));
  for (const t of TOOL_COVERAGE) {
    assert.ok(urls.has(t.url), t.name);
    assert.deepEqual(Object.keys(t.stations).sort(), [...STATION_IDS].sort(), t.name);
    assert.ok(Object.values(t.stations).some((c) => c.fit !== "None"), `${t.name} covers no station`);
  }
});

test("each coverage rating comes from TOOLS for a recommendation at that station", () => {
  for (const t of TOOL_COVERAGE) {
    for (const [station, cell] of Object.entries(t.stations)) {
      assert.equal(cell.fit === "None", cell.uses.length === 0, `${t.name} ${station}`);
      if (cell.uses.length) {
        const best = cell.uses.some((u) => u.fit === "Full") ? "Full" : "Partial";
        assert.equal(cell.fit, best, `${t.name} ${station}`);
      }
      for (const u of cell.uses) {
        const r = RECOMMENDATIONS.find((x) => x.id === u.recommendation);
        assert.ok(r, u.recommendation);
        assert.equal(r.station, station, `${t.name} ${u.recommendation}`);
        assert.equal(u.maturity, r.maturity);
        const src = TOOLS[r.id].tools.find((x) => x.url === t.url);
        assert.ok(src, `${t.name} not in TOOLS for ${r.id}`);
        assert.equal(u.fit, src.fit);
        assert.equal(u.note, src.note);
      }
    }
  }
  // And the other way: every tool in TOOLS shows up at its recommendation's station.
  for (const r of RECOMMENDATIONS) {
    for (const tool of TOOLS[r.id].tools) {
      const cov = TOOL_COVERAGE.find((t) => t.url === tool.url);
      assert.ok(cov?.stations[r.station].uses.some((u) => u.recommendation === r.id), `${tool.name} ${r.id}`);
    }
  }
});

test("fit meanings have no em or en dashes", () => {
  assert.doesNotMatch(JSON.stringify(FIT_MEANING), /[\u2013\u2014]/);
});
