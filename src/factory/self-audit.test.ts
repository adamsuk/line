import { test } from "node:test";
import assert from "node:assert/strict";
import { RECOMMENDATIONS, STATION_IDS, TOOLS } from "./model.ts";
import {
  ALL_QUESTIONS,
  HOMEPAGE,
  SETUP_QUESTIONS,
  STATION_QUESTIONS,
  gapRecommendations,
  parseAnswers,
  scoreQuestions,
  stationResults,
  weakestStation,
} from "./self-audit.ts";

test("every audit question maps to a station and has a rule for each answer", () => {
  const ids = new Set<string>();
  for (const q of ALL_QUESTIONS) {
    assert.ok(!ids.has(q.id), `duplicate ${q.id}`);
    ids.add(q.id);
    assert.ok(STATION_IDS.includes(q.station), q.id);
    for (const rule of [q.q, q.covered, q.partial, q.gap]) assert.ok(rule.trim().length > 0, q.id);
  }
});

test("setup comes first, then two to four questions per station", () => {
  assert.equal(SETUP_QUESTIONS.length, 5);
  for (const id of STATION_IDS) {
    const n = STATION_QUESTIONS[id].length;
    assert.ok(n >= 2 && n <= 4, `${id} has ${n}`);
    for (const q of STATION_QUESTIONS[id]) assert.equal(q.station, id);
  }
});

test("every gap link resolves to an existing recommendation and its tools at that station", () => {
  const byId = new Map(RECOMMENDATIONS.map((r) => [r.id, r]));
  for (const q of ALL_QUESTIONS) {
    const recs = gapRecommendations(q);
    assert.ok(recs.length > 0, q.id);
    for (const id of recs) {
      const r = byId.get(id);
      assert.ok(r, `${q.id} links ${id}`);
      assert.equal(r.station, q.station, `${q.id} links ${id} at another station`);
      assert.ok(TOOLS[id], `${id} has no tools entry`);
    }
  }
});

test("scoring follows the rule", () => {
  const qs = STATION_QUESTIONS.gate;
  const all = (a: "covered" | "partial" | "gap") => Object.fromEntries(qs.map((q) => [q.id, a]));
  assert.equal(scoreQuestions(qs, {}).score, "Not started");
  assert.equal(scoreQuestions(qs, all("covered")).score, "Covered");
  assert.equal(scoreQuestions(qs, { ...all("covered"), [qs[1].id]: "partial" }).score, "Partial");
  // Cannot fail a change: the first question is a gap.
  assert.equal(scoreQuestions(qs, { ...all("covered"), [qs[0].id]: "gap" }).score, "Gap");
  // Half the answers are gaps.
  assert.equal(scoreQuestions(qs, { [qs[1].id]: "gap", [qs[2].id]: "covered" }).score, "Gap");
  // Not every question answered is never covered.
  assert.equal(scoreQuestions(qs, { [qs[0].id]: "covered" }).score, "Partial");
});

test("the weakest station has the worst score, then the most gaps, then comes first", () => {
  const a = (id: string, v: "covered" | "partial" | "gap") => ({ [id]: v });
  const bench = STATION_QUESTIONS.bench;
  const artifact = STATION_QUESTIONS.artifact;
  const answers = {
    ...a(bench[0].id, "gap"),
    ...a(artifact[0].id, "gap"),
    ...a(artifact[1].id, "gap"),
    ...a(STATION_QUESTIONS.review[1].id, "partial"),
  };
  assert.equal(weakestStation(stationResults(answers))?.id, "artifact");
  const tie = { ...a(bench[0].id, "gap"), ...a(artifact[0].id, "gap") };
  assert.equal(weakestStation(stationResults(tie))?.id, "bench");
  assert.equal(weakestStation(stationResults({})), null);
});

test("stored answers are validated", () => {
  assert.deepEqual(parseAnswers(null), {});
  assert.deepEqual(parseAnswers("not json"), {});
  const q = ALL_QUESTIONS[0].id;
  assert.deepEqual(parseAnswers(JSON.stringify({ [q]: "gap", nope: "gap", [ALL_QUESTIONS[1].id]: "maybe" })), {
    [q]: "gap",
  });
});

test("no em or en dashes in the homepage or audit copy", () => {
  assert.doesNotMatch(JSON.stringify([HOMEPAGE, ALL_QUESTIONS]), /[\u2013\u2014]/);
});
