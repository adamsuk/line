import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADOPTION_STAGES,
  COMMIT_MESSAGE,
  GUIDE,
  REFERENCES,
  STATIONS,
  STATION_IDS,
  stationIndex,
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

test("every adoption stage has at least one station", () => {
  for (const { stage } of ADOPTION_STAGES) {
    assert.ok(STATION_IDS.some((id) => GUIDE[id].stage === stage), stage);
  }
});

test("every cited source is in Built on", () => {
  const known = new Set(REFERENCES.map((r) => r.id));
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

test("no em or en dashes in station copy or the guide", () => {
  const copy = JSON.stringify([STATIONS, GUIDE, ADOPTION_STAGES, REFERENCES]);
  assert.doesNotMatch(copy, /[\u2013\u2014]/);
});
