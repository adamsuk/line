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

test("observe-refuse links verify-after-deploy", () => {
  const ids = RECOMMENDATIONS.map((r) => r.id);
  const rec = RECOMMENDATIONS[ids.indexOf("harness-evals") + 1];
  assert.equal(rec?.id, "verify-after-deploy");
  assert.equal(rec.station, "observe");
  assert.equal(rec.stage, "Next");
  assert.equal(rec.maturity, "Cutting edge");
  assert.deepEqual(rec.sources, ["connell-agent-mistakes"]);
  assert.match(rec.text, /after the deploy/);
  assert.match(rec.text, /Close the work order only when the check passes/);

  const observe = STATION_QUESTIONS.observe;
  assert.equal(observe.length, 4);
  assert.deepEqual(
    observe.map((q) => q.id),
    ["observe-refuse", "observe-stop", "observe-measure", "observe-evals"],
  );
  const q = observe[0];
  assert.equal(q.id, "observe-refuse");
  assert.equal(q.q, "Can the production signal fail the change, so a missed outcome reopens it?");
  assert.equal(q.covered, "Each work order's outcome signal is checked after release, and a miss reopens it.");
  assert.equal(q.partial, "Dashboards exist, not tied to work orders.");
  assert.equal(q.gap, "Nothing ties production back.");
  assert.deepEqual(q.recs, ["measure-factory", "verify-after-deploy"]);

  assert.equal(TOOLS["verify-after-deploy"].tools.length, 0);
  assert.ok(TOOLS["verify-after-deploy"].gap);
});

test("source-secrets links per-run-credentials", () => {
  const rec = RECOMMENDATIONS.find((r) => r.id === "per-run-credentials");
  assert.ok(rec, "per-run-credentials");
  assert.equal(rec.station, "source");
  assert.equal(rec.stage, "Guardrails");
  assert.equal(rec.maturity, "Cutting edge");
  assert.deepEqual(rec.sources, ["monday-agent-keys", "owasp-ai-coding"]);
  assert.match(rec.text, /fresh sandbox/);
  assert.match(rec.text, /token scoped only to the repos that task needs/);
  assert.match(rec.text, /expires within about an hour/);
  assert.match(rec.text, /nothing from the run carries into the next one/);
  assert.match(rec.text, /Every tool call is seen by a policy check/);
  assert.match(rec.text, /no general-purpose shell, HTTP, or eval tool that can bypass that check/);

  const ids = RECOMMENDATIONS.map((r) => r.id);
  assert.equal(ids[ids.indexOf("sandbox-no-secrets") + 1], "per-run-credentials");
  const sandbox = RECOMMENDATIONS.find((r) => r.id === "sandbox-no-secrets");
  assert.ok(sandbox);
  assert.equal(sandbox.maturity, "Best practice");
  assert.equal(sandbox.stage, "Guardrails");
  assert.equal(
    sandbox.text,
    "Run agents in a sandbox with no production secrets. Isolation is the boundary, not a prompt.",
  );
  assert.deepEqual(sandbox.sources, ["gh-agentic-security", "nvidia-sandbox", "owasp-agents"]);

  const secrets = STATION_QUESTIONS.source.find((q) => q.id === "source-secrets");
  assert.ok(secrets);
  assert.deepEqual(secrets.recs, ["sandbox-no-secrets", "per-run-credentials"]);
  assert.equal(secrets.q, "Does any agent workspace hold a production secret?");
  assert.equal(secrets.covered, "None, checked by a scan.");
  assert.equal(secrets.partial, "Scoped tokens, but some reach production.");
  assert.equal(secrets.gap, "Yes.");
  const refuse = STATION_QUESTIONS.source.find((q) => q.id === "source-refuse");
  assert.deepEqual(refuse?.recs, ["sandbox-no-secrets"]);

  assert.deepEqual(TOOLS["per-run-credentials"].tools, []);
  assert.equal(
    TOOLS["per-run-credentials"].gap,
    "No listed product does all three: a fresh sandbox per run, a token limited to that task's repos that expires within about an hour, and tool wrappers with no general-purpose shell, HTTP, or eval bypass.",
  );
  assert.ok(TOOLS["per-run-credentials"].gap.trim().length > 0);

  assert.equal(STATION_QUESTIONS.source.length, 4);
  assert.deepEqual(
    STATION_QUESTIONS.source.map((q) => q.id),
    ["source-refuse", "source-stop", "source-secrets", "source-egress"],
  );
});

test("backlog-refuse links ask-before-building", () => {
  const rec = RECOMMENDATIONS.find((r) => r.id === "ask-before-building");
  assert.ok(rec, "ask-before-building");
  assert.equal(rec.station, "backlog");
  assert.equal(rec.maturity, "Best practice");
  assert.deepEqual(rec.sources, ["ambig-swe", "clarifygpt"]);
  assert.match(rec.text, /It does not guess/);

  const q = STATION_QUESTIONS.backlog.find((x) => x.id === "backlog-refuse");
  assert.deepEqual(q?.recs, ["done-as-checks", "ask-before-building"]);
  assert.match(q?.covered ?? "", /owner's answers first/);

  assert.equal(TOOLS["ask-before-building"].tools.length, 1);
  assert.equal(TOOLS["ask-before-building"].tools[0].name, "GitHub Spec Kit");
  assert.equal(TOOLS["ask-before-building"].tools[0].fit, "Partial");
  assert.ok(TOOLS["ask-before-building"].gap);
});

test("backlog-untrusted covers recording clarification answers on the ticket", () => {
  const q = STATION_QUESTIONS.backlog.find((x) => x.id === "backlog-untrusted");
  assert.ok(q);
  assert.match(q.covered, /write the owner's clarification answers to the ticket/);
  assert.match(q.covered, /takes no other action an issue's text asks for/);
});
