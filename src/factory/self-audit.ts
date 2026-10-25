// Audit your setup: questions a team answers about its own line.
// Questions and rules live here. Recommendations and tools come from model.ts, by id.

import { RECOMMENDATIONS, STATION_IDS, type StationId } from "./model.ts";

export type Answer = "covered" | "partial" | "gap";
export const ANSWERS: Answer[] = ["covered", "partial", "gap"];
export const ANSWER_LABEL: Record<Answer, string> = { covered: "Covered", partial: "Partial", gap: "Gap" };

export interface AuditQuestion {
  id: string;
  /** The station whose recommendations and tools a gap points to. */
  station: StationId;
  q: string;
  covered: string;
  partial: string;
  gap: string;
  /** Existing recommendation ids at that station. Empty means the station's whole list. */
  recs: string[];
}

export interface SetupQuestion extends AuditQuestion {
  topic: string;
}

export const HOMEPAGE = {
  headline: "Agents build. Evidence ships.",
  thesis:
    "A change moves only on evidence, never on a claim. Every station can fail it and stop the line, and when one does, people fix the line, not just the change.",
  why: "A change passes nine stations between an idea and production. At each one something can go wrong, and each one should be able to catch it. Agents write changes faster than people can read them, so the line has to hold the standard, not a person reading every diff. Walk it once to see how it fits together. Then audit your own.",
  walk: "Follow one change, CHK-184, through nine stations and see where it gets sent back.",
  audit: "Answer a few questions per station and see which ones can fail a change, and which only stamp it.",
};

/** Asked once, before the stations: intent and outcome signal, then the line itself. */
export const SETUP_QUESTIONS: SetupQuestion[] = [
  {
    id: "setup-intent",
    topic: "Intent",
    station: "backlog",
    q: "Does every change start from a stated intent: the break, and who feels it?",
    covered: "Every work order names the problem and who is hurt.",
    partial: "Most do. Agent-filed or urgent work skips it.",
    gap: "Work starts from a title or a chat message.",
    recs: ["done-as-checks"],
  },
  {
    id: "setup-signal",
    topic: "Outcome signal",
    station: "observe",
    q: "Does each work order name the signal that shows it worked, and where that signal is read?",
    covered: "A named metric, log or check, read after release by a named person.",
    partial: "A signal exists for some work, or nobody reads it after release.",
    gap: "Done means merged.",
    recs: ["measure-factory"],
  },
  {
    id: "setup-harness",
    topic: "Harness",
    station: "observe",
    q: "Is the harness written down: which agents, tools, models and permissions run at each station?",
    covered: "One versioned list, reviewed like code.",
    partial: "Known to one or two people, or out of date.",
    gap: "Nobody can say what runs where.",
    recs: ["harness-evals"],
  },
  {
    id: "setup-instructions",
    topic: "Instruction files",
    station: "bench",
    q: "Are AGENTS.md and other instruction files listed, owned and reviewed, in the repo and outside it?",
    covered: "All listed, under code owners, changes reviewed.",
    partial: "In-repo files owned. User or global settings are not.",
    gap: "Anyone can change them.",
    recs: ["owned-instructions"],
  },
  {
    id: "setup-stop",
    topic: "Stop the line",
    station: "gate",
    q: "Who can stop the line, at which stations, and how?",
    covered: "Named people per station, one action to stop, and stops are recorded with a cause.",
    partial: "Some stations can be stopped, or stops leave no record.",
    gap: "Nobody can stop it, or only by turning things off by hand.",
    recs: ["checks-not-claims"],
  },
];

type Q = Omit<AuditQuestion, "station">;

/** Two to four questions per station. The first asks whether the station can fail a change. */
const BY_STATION: Record<StationId, Q[]> = {
  backlog: [
    {
      id: "backlog-refuse",
      q: "Can a work order be refused before work starts, and on what evidence?",
      covered: "Refused unless done is written as checks a machine can run.",
      partial: "Checks are written, but nothing refuses work without them.",
      gap: "Anything can enter.",
      recs: ["done-as-checks"],
    },
    {
      id: "backlog-stop",
      q: "Who can stop work entering the line?",
      covered: "A named product owner can reject or pause intake, agent-filed work included.",
      partial: "An owner exists, but agents can file and start work around them.",
      gap: "Nobody owns intake.",
      recs: [],
    },
    {
      id: "backlog-untrusted",
      q: "Does the triage agent treat issue text as data, never as orders?",
      covered: "It can only label and route, and input is scanned for injection.",
      partial: "Its prompt says so, but its tools would let it act.",
      gap: "It acts on what issues say.",
      recs: ["untrusted-issues"],
    },
  ],
  source: [
    {
      id: "source-refuse",
      q: "Can this station refuse a change, for example a direct push to main?",
      covered: "Main moves only through the gate and review. No agent can bypass.",
      partial: "Main is protected, but admin or agent tokens can bypass.",
      gap: "Agents can push to main.",
      recs: ["sandbox-no-secrets"],
    },
    {
      id: "source-stop",
      q: "Who can revoke an agent's workspace or network access?",
      covered: "A named owner of the sandbox rules can end any session.",
      partial: "Possible, but only by whoever set it up.",
      gap: "Nobody owns the sandbox rules.",
      recs: [],
    },
    {
      id: "source-secrets",
      q: "Does any agent workspace hold a production secret?",
      covered: "None, checked by a scan.",
      partial: "Scoped tokens, but some reach production.",
      gap: "Yes.",
      recs: ["sandbox-no-secrets"],
    },
    {
      id: "source-egress",
      q: "Can the sandbox reach hosts off an allowlist?",
      covered: "Blocked.",
      partial: "Logged, not blocked.",
      gap: "Open network.",
      recs: ["egress-allowlist"],
    },
  ],
  bench: [
    {
      id: "bench-refuse",
      q: "Can the bench fail its own change before it leaves, and on what evidence?",
      covered: "A separate QA agent or local checks must pass, and their output goes with the commit.",
      partial: "The agent runs checks but reports its own result.",
      gap: "It pushes on its own say-so.",
      recs: ["staged-writes"],
    },
    {
      id: "bench-stop",
      q: "Can a person halt or redirect a running agent?",
      covered: "One action halts a session and its pending writes.",
      partial: "It can be killed, but writes may already have landed.",
      gap: "No way to stop it mid-run.",
      recs: [],
    },
    {
      id: "bench-instructions",
      q: "Are AGENTS.md and other instruction files under code owners?",
      covered: "All of them, including files outside the repo listed with an owner.",
      partial: "In-repo files only.",
      gap: "None.",
      recs: ["owned-instructions"],
    },
  ],
  gate: [
    {
      id: "gate-refuse",
      q: "Do checks run on a clean machine from the snapshot, and does red block the merge?",
      covered: "Required checks on a clean runner. A check that did not run counts as red.",
      partial: "Checks run but are not required, or get rerun until green.",
      gap: "Checks are optional.",
      recs: ["checks-not-claims"],
    },
    {
      id: "gate-stop",
      q: "Who can override a red check, and is it recorded?",
      covered: "Nobody merges red. Any override is named and logged.",
      partial: "Admins can bypass without a record.",
      gap: "Agents can bypass.",
      recs: [],
    },
    {
      id: "gate-checks",
      q: "Are the checks drawn from the work order, and has a person checked them against it?",
      covered: "Acceptance checks trace to the work order and a person reviewed them.",
      partial: "Tests exist, written by the agent, unreviewed.",
      gap: "Done is whatever passed.",
      recs: ["spec-signs-off", "check-the-checks"],
    },
    {
      id: "gate-fixer",
      q: "If a fixing agent works red checks, is it capped, and do fixes to tests, CI config or lockfiles go to a person?",
      covered: "Attempt cap, retry only on a new failure, code owners on those paths. Or no fixing agent.",
      partial: "Some of these.",
      gap: "Uncapped and unowned.",
      recs: ["triage-red-checks", "fix-as-pr", "cap-fix-loop", "fix-paths-to-person"],
    },
  ],
  review: [
    {
      id: "review-refuse",
      q: "Can review send the change back, and does merge need a named person's approval?",
      covered: "A named person approves. No agent approves its own change.",
      partial: "Bot approvals count toward merge.",
      gap: "No required review.",
      recs: ["human-approves"],
    },
    {
      id: "review-evidence",
      q: "What evidence does the reviewer read?",
      covered: "The diff, the gate result and the agent session.",
      partial: "The diff only.",
      gap: "The PR description.",
      recs: [],
    },
    {
      id: "review-scale",
      q: "Is review depth scaled to the size and risk of the change?",
      covered: "Small PRs, with deeper review for risky paths by rule.",
      partial: "Small PRs, one review depth for all.",
      gap: "Large PRs, skimmed.",
      recs: ["scale-review"],
    },
    {
      id: "review-bot",
      q: "Do you track how often people accept the review bot's comments, and test it on known bugs?",
      covered: "Both, and again when the model changes.",
      partial: "Acceptance tracked only.",
      gap: "Neither.",
      recs: ["measure-review-bot"],
    },
  ],
  artifact: [
    {
      id: "artifact-refuse",
      q: "Can promotion be refused because the artifact is not the one the gate built?",
      covered: "Provenance is verified before promotion. A mismatch blocks it.",
      partial: "Builds are attested, but nothing verifies them.",
      gap: "No digest, or production rebuilds.",
      recs: ["attest-provenance"],
    },
    {
      id: "artifact-owner",
      q: "Who owns the build and signing setup?",
      covered: "A named owner, and changes go through code owners.",
      partial: "Owned, but changes skip review.",
      gap: "Nobody.",
      recs: [],
    },
  ],
  release: [
    {
      id: "release-refuse",
      q: "Can a release halt or roll back on its own when a guardrail breaks?",
      covered: "Canary or flag rollout with automatic rollback on a named signal.",
      partial: "Staged rollout, rolled back by hand.",
      gap: "All at once.",
      recs: ["progressive-release"],
    },
    {
      id: "release-rollback",
      q: "Can anyone on call roll back without a second approval, and has it been practised?",
      covered: "Yes, and a rollback was run on a normal day recently.",
      partial: "Yes, never practised.",
      gap: "Needs the author or a second approval.",
      recs: ["human-release-gate"],
    },
    {
      id: "release-approve",
      q: "Does a named person approve production where a wrong call is expensive?",
      covered: "Required reviewers on production for auth, billing, migrations, public APIs.",
      partial: "An approval, but for everything or for nothing in particular.",
      gap: "None.",
      recs: ["human-release-gate"],
    },
  ],
  observe: [
    {
      id: "observe-refuse",
      q: "Can the production signal fail the change, so a missed outcome reopens it?",
      covered: "Each work order's outcome signal is checked after release, and a miss reopens it.",
      partial: "Dashboards exist, not tied to work orders.",
      gap: "Nothing ties production back.",
      recs: ["measure-factory"],
    },
    {
      id: "observe-stop",
      q: "Who can stop the line from here, for example pause agent changes when change failure rate rises?",
      covered: "On call can pause agent merges in one action.",
      partial: "Only by asking each team.",
      gap: "Nobody.",
      recs: [],
    },
    {
      id: "observe-measure",
      q: "Do you measure change failure rate, rework and recovery time, before agents and after?",
      covered: "All three, with a baseline.",
      partial: "Some, or no baseline.",
      gap: "None.",
      recs: ["measure-factory"],
    },
    {
      id: "observe-evals",
      q: "Do prompt, tool or model changes run behavioural evals before they ship?",
      covered: "Yes, with a tracked pass rate.",
      partial: "Ad hoc.",
      gap: "No.",
      recs: ["harness-evals"],
    },
  ],
  loop: [
    {
      id: "loop-fix-line",
      q: "When a station fails a change, do people fix the line as well as the change?",
      covered: "Each repeat failure leads to a recorded change to a check, harness or rule.",
      partial: "A new work order, but the line stays the same.",
      gap: "The change is patched and forgotten.",
      recs: ["audit-with-mcp"],
    },
    {
      id: "loop-decide",
      q: "Who decides what becomes the next work order?",
      covered: "Product, named.",
      partial: "Whoever notices.",
      gap: "Nobody.",
      recs: [],
    },
    {
      id: "loop-drift",
      q: "Is drift between the docs agents build from and the code checked by a deterministic check?",
      covered: "A check that can refuse a drifting commit.",
      partial: "Reviewed by hand now and then.",
      gap: "No.",
      recs: ["spec-drift"],
    },
    {
      id: "loop-audit",
      q: "Is the whole setup audited against Line on a schedule?",
      covered: "A read-only agent audit, with gaps turned into work orders.",
      partial: "Once.",
      gap: "Never.",
      recs: ["audit-with-mcp"],
    },
  ],
};

export const STATION_QUESTIONS: Record<StationId, AuditQuestion[]> = Object.fromEntries(
  STATION_IDS.map((id) => [id, BY_STATION[id].map((q) => ({ ...q, station: id }))]),
) as Record<StationId, AuditQuestion[]>;

export const ALL_QUESTIONS: AuditQuestion[] = [
  ...SETUP_QUESTIONS,
  ...STATION_IDS.flatMap((id) => STATION_QUESTIONS[id]),
];

/** The recommendation ids a gap points to: the question's own, or else every one at its station. */
export function gapRecommendations(q: AuditQuestion): string[] {
  if (q.recs.length > 0) return q.recs;
  return RECOMMENDATIONS.filter((r) => r.station === q.station).map((r) => r.id);
}

export type Answers = Record<string, Answer>;

export type Score = "Covered" | "Partial" | "Gap" | "Not started";

export interface StationResult {
  id: StationId;
  answered: number;
  total: number;
  gaps: number;
  partials: number;
  canFail: Answer | null;
  score: Score;
  /** The first recommendation behind the first gap, or else the first partial. */
  next: string | null;
}

/**
 * Covered when every answer is covered. Gap when the station cannot fail a change
 * (its first question is a gap) or half or more of its answers are gaps. Partial otherwise.
 */
export function scoreQuestions(questions: AuditQuestion[], answers: Answers) {
  const given = questions.map((q) => answers[q.id]).filter((a): a is Answer => !!a);
  const gaps = given.filter((a) => a === "gap").length;
  const partials = given.filter((a) => a === "partial").length;
  const canFail = answers[questions[0].id] ?? null;
  let score: Score;
  if (given.length === 0) score = "Not started";
  else if (canFail === "gap" || gaps * 2 >= given.length) score = "Gap";
  else if (gaps === 0 && partials === 0 && given.length === questions.length) score = "Covered";
  else score = "Partial";
  const first =
    questions.find((q) => answers[q.id] === "gap") ?? questions.find((q) => answers[q.id] === "partial");
  return {
    answered: given.length,
    total: questions.length,
    gaps,
    partials,
    canFail,
    score,
    next: first ? (gapRecommendations(first)[0] ?? null) : null,
  };
}

export function stationResults(answers: Answers): StationResult[] {
  return STATION_IDS.map((id) => ({ id, ...scoreQuestions(STATION_QUESTIONS[id], answers) }));
}

const RANK: Record<Score, number> = { Gap: 3, Partial: 2, Covered: 1, "Not started": 0 };

/** The weakest started station: worst score, then most gaps, then most partials, then earliest. */
export function weakestStation(results: StationResult[]): StationResult | null {
  let worst: StationResult | null = null;
  for (const r of results) {
    if (r.score === "Not started" || r.score === "Covered") continue;
    if (
      !worst ||
      RANK[r.score] > RANK[worst.score] ||
      (RANK[r.score] === RANK[worst.score] &&
        (r.gaps > worst.gaps || (r.gaps === worst.gaps && r.partials > worst.partials)))
    ) {
      worst = r;
    }
  }
  return worst;
}

export const STORAGE_KEY = "line-audit-v1";

export function parseAnswers(raw: string | null): Answers {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return {};
    const known = new Set(ALL_QUESTIONS.map((q) => q.id));
    const out: Answers = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (known.has(k) && (ANSWERS as string[]).includes(v as string)) out[k] = v as Answer;
    }
    return out;
  } catch {
    return {};
  }
}
