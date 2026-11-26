import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FURTHER_READING, RECOMMENDATIONS, STATION_IDS, TOOLS, type ReadingId } from "./model.ts";
import { AUDIT_EVIDENCE } from "./audit.ts";
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
  assert.deepEqual(rec.sources, [
    "monday-agent-keys",
    "owasp-ai-coding",
    "willison-external-sandboxes",
    "gold-islo-factories",
    "brennan-sandbox-egress",
  ]);
  assert.match(rec.text, /fresh sandbox/);
  assert.match(rec.text, /token scoped only to the repos that task needs/);
  assert.match(rec.text, /expires within about an hour/);
  assert.match(rec.text, /nothing from the run carries into the next one/);
  assert.match(rec.text, /Every tool call is seen by a policy check/);
  assert.match(rec.text, /no general-purpose shell, HTTP, or eval tool that can bypass that check/);
  assert.match(rec.text, /The sandbox does not hold the cleartext credential/);
  assert.match(
    rec.text,
    /A proxy or broker outside the sandbox adds the real credential only to an allowed request/,
  );
  assert.match(rec.text, /the sandbox sees a placeholder or no key/);

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
    "No listed product does all of these: a fresh sandbox per run, a token limited to that task's repos that expires within about an hour, tool wrappers with no general-purpose shell, HTTP, or eval bypass, and a proxy or broker outside the sandbox that adds the real credential only to an allowed request so the sandbox does not hold that cleartext credential.",
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

test("review-scale links path-risk", () => {
  const text =
    "Classify a change's risk from the paths and files it touches, not from what the author or agent declares. Review related changes together, so a high-risk edit cannot be split into low-risk pieces. CI and deploy configuration, secrets, authentication, IAM, and migrations stay with a person and get a deeper review.";
  const cited: ReadingId[] = ["aws-gated-review", "runway-software-factory"];
  const rec = RECOMMENDATIONS.find((r) => r.id === "path-risk");
  assert.ok(rec, "path-risk");
  assert.equal(rec.station, "review");
  assert.equal(rec.stage, "Next");
  assert.equal(rec.maturity, "Cutting edge");
  assert.equal(rec.text, text);
  assert.deepEqual(rec.sources, cited);

  const readings = FURTHER_READING.flatMap((g) => g.refs);
  const aws = readings.find((r) => r.id === "aws-gated-review");
  assert.ok(aws);
  assert.equal(aws.title, "Building a gated review pipeline for AI coding agents on AWS");
  assert.equal(aws.author, "Owen Hawkins, Chris Williams and Trevor Schiavone");
  assert.equal(aws.publication, "AWS DevOps Blog");
  assert.equal(aws.date, "17 November 2026");
  assert.equal(
    aws.url,
    "https://aws.amazon.com/blogs/devops/building-a-gated-review-pipeline-for-ai-coding-agents-on-aws/",
  );
  assert.match(aws.took, /paths and files a change touches/);
  assert.match(aws.took, /person still approves/);

  const runway = readings.find((r) => r.id === "runway-software-factory");
  assert.ok(runway);
  assert.equal(runway.title, "Building a Software Factory");
  assert.equal(runway.author, "Alejandro Alvarez");
  assert.equal(runway.publication, "Runway");
  assert.equal(runway.date, "20 November 2026");
  assert.equal(runway.url, "https://runway.com/news/engineering/building-a-software-factory");
  assert.match(runway.took, /paths a change touches/);
  assert.match(runway.took, /person, who still approves/);

  assert.equal(STATION_QUESTIONS.review.length, 4);
  const scale = STATION_QUESTIONS.review.find((q) => q.id === "review-scale");
  assert.ok(scale);
  assert.deepEqual(scale.recs, ["scale-review", "path-risk", "review-capacity"]);

  assert.deepEqual(TOOLS["path-risk"].tools, []);
  assert.equal(
    TOOLS["path-risk"].gap,
    "No listed product does both: classify risk from the paths and files a change touches, and keep related changes in one review so a high-risk edit cannot be split into low-risk pieces.",
  );

  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  const row = readme.split("\n").find((line) => line.startsWith("| Cutting edge |") && line.includes(text));
  assert.ok(row, "README row");
  assert.ok(row.includes(aws.url), "aws url");
  assert.ok(row.includes(runway.url), "runway url");

  assert.ok(
    AUDIT_EVIDENCE.review.evidence.includes(
      "Whether risk is classified from the paths and files a change touches, rather than from the author",
    ),
  );

  const unchanged: Record<string, { maturity: string; text: string; sources: string[] }> = {
    "scale-review": {
      maturity: "Best practice",
      text: "Keep PRs small. Scale how deeply a person reviews to the size and risk of the change.",
      sources: ["crbugbench", "dora-small-batches"],
    },
    "human-approves": {
      maturity: "Best practice",
      text: "A named person approves. Agent review does not replace it, and no agent approves its own change.",
      sources: ["owasp-ai-coding", "owasp-agents", "crbugbench"],
    },
    "human-release-gate": {
      maturity: "Best practice",
      text: "A named person approves promotion to production where a wrong call is expensive, like auth, billing, data migrations, or a public API. Anyone on call can roll back without a second approval, and the rollback is practised.",
      sources: ["gh-environments", "reveneau-progressive", "iusztin"],
    },
  };
  for (const [id, expected] of Object.entries(unchanged)) {
    const kept = RECOMMENDATIONS.find((r) => r.id === id);
    assert.ok(kept, id);
    assert.equal(kept.maturity, expected.maturity, id);
    assert.equal(kept.text, expected.text, id);
    assert.deepEqual(kept.sources, expected.sources, id);
  }
});

test("backlog-approve-spec links approve-spec-before-code", () => {
  const ids = RECOMMENDATIONS.map((r) => r.id);
  assert.equal(ids[ids.indexOf("triage-routing") + 1], "approve-spec-before-code");
  const rec = RECOMMENDATIONS.find((r) => r.id === "approve-spec-before-code");
  assert.ok(rec);
  assert.equal(rec.station, "backlog");
  assert.equal(rec.stage, "Next");
  assert.equal(rec.maturity, "Cutting edge");
  assert.equal(
    rec.text,
    "A person approves the work order's specification before any coding agent writes code. The specification covers intent, acceptance checks, constraints, and out of scope. After that approval, agents may build. The agent that writes the change still does not grade its own work.",
  );
  assert.deepEqual(rec.sources, ["anwar-specs-not-prompts", "aws-gated-review"]);

  assert.equal(FURTHER_READING[0]?.heading, "November 2026");
  assert.equal(FURTHER_READING[1]?.heading, "Sep to Oct 2026");
  assert.deepEqual(
    FURTHER_READING[0]?.refs.map((r) => r.id),
    [
      "runway-software-factory",
      "brennan-sandbox-egress",
      "anwar-specs-not-prompts",
      "aws-gated-review",
      "gold-islo-factories",
      "willison-external-sandboxes",
    ],
  );
  const anwar = FURTHER_READING[0]?.refs.find((r) => r.id === "anwar-specs-not-prompts");
  const aws = FURTHER_READING[0]?.refs.find((r) => r.id === "aws-gated-review");
  assert.equal(
    anwar?.title,
    "Specs, Not Prompts: Putting Machine-Readable Intent Back at the Center of the Development Lifecycle",
  );
  assert.equal(anwar?.date, "17 November 2026");
  assert.equal(
    anwar?.url,
    "https://www.computer.org/publications/tech-news/research/specification-driven-agentic-software",
  );
  assert.equal(aws?.title, "Building a gated review pipeline for AI coding agents on AWS");
  assert.equal(aws?.date, "17 November 2026");
  assert.equal(
    aws?.url,
    "https://aws.amazon.com/blogs/devops/building-a-gated-review-pipeline-for-ai-coding-agents-on-aws/",
  );

  const backlog = STATION_QUESTIONS.backlog;
  assert.deepEqual(
    backlog.map((q) => q.id),
    ["backlog-refuse", "backlog-stop", "backlog-untrusted", "backlog-approve-spec"],
  );
  const q = backlog.find((x) => x.id === "backlog-approve-spec");
  assert.ok(q);
  assert.equal(q.id, "backlog-approve-spec");
  assert.equal(
    q.q,
    "Does a person approve the work order's specification before a coding agent writes code?",
  );
  assert.equal(
    q.covered,
    "A person accepts the specification, including intent, acceptance checks, constraints, and out of scope, before any coding agent writes code. After that, agents may build. The agent that writes the change does not grade its own work.",
  );
  assert.equal(
    q.partial,
    "A person reviews the change after it is written, but nobody accepts the specification before generation.",
  );
  assert.equal(q.gap, "Agents write code from a ticket nobody has accepted as the specification.");
  assert.deepEqual(q.recs, ["approve-spec-before-code"]);

  assert.deepEqual(AUDIT_EVIDENCE.backlog.evidence, [
    "Issue and work order templates, and whether done is written as checks",
    "Labels or routing for triage, and how agents are told which issues to take",
    "Whether triage has a clarifying-questions step for ambiguous tickets, and whether the questions and the owner's answers are recorded on the issue before it is marked ready",
    "Whether a triage agent drops duplicates and routes issues, and whether only labelled issues are picked up for building",
    "Whether a person approves the work order's specification, including intent, acceptance checks, constraints, and out of scope, before a coding agent writes code",
  ]);

  assert.deepEqual(TOOLS["approve-spec-before-code"].tools, []);
  assert.equal(
    TOOLS["approve-spec-before-code"].gap,
    "No listed product requires a person to accept the specification before a coding agent writes code.",
  );
});
