// The machine-readable guide and the audit prompt. Everything here is built from the same data
// the page renders (model.ts) and from CHANGELOG.md, so nothing is copied by hand.
// vite.pages.config.ts writes guide.json, llms.txt and llms-full.txt from these at build time.

import {
  ALL_REFERENCES,
  FIT_MEANING,
  GUIDE,
  MATURITY,
  RECOMMENDATIONS,
  STATIONS,
  TOOL_COVERAGE,
  TOOLS,
  TOOLS_CHECKED,
  type StationId,
} from "./model.ts";
import { parseChangelog } from "./changelog.ts";

export const SITE_URL = "https://adamsuk.github.io/line/";
export const GUIDE_JSON_URL = `${SITE_URL}guide.json`;
export const LLMS_TXT_URL = `${SITE_URL}llms.txt`;
export const LLMS_FULL_URL = `${SITE_URL}llms-full.txt`;
export const REPO_URL = "https://github.com/adamsuk/line";

/** What an auditing agent should look at per station, and which kind of MCP access gets it. */
export const AUDIT_EVIDENCE: Record<StationId, { evidence: string[]; access: string[] }> = {
  backlog: {
    evidence: [
      "Issue and work order templates, and whether done is written as checks",
      "Labels or routing for triage, and how agents are told which issues to take",
    ],
    access: [
      "Issue tracker (GitHub Issues, GitLab, Jira or Linear)",
      "Repo files: .github/ISSUE_TEMPLATE",
    ],
  },
  source: {
    evidence: [
      "Rules on the default branch: required checks, required review, no direct pushes",
      "Where agents run: sandbox or devcontainer config, which secrets they can reach, outbound host allowlists",
    ],
    access: [
      "Branch protection and rulesets (GitHub MCP governance toolset)",
      "Repo files: devcontainer, agent config, workflow permissions",
      "Secret and variable names only, never values",
    ],
  },
  bench: {
    evidence: [
      "Agent instruction files (AGENTS.md, copilot-instructions and the like) and whether CODEOWNERS covers them",
      "How agent writes land: as PRs or staged outputs, never straight to main",
    ],
    access: [
      "Repo files: instruction files, CODEOWNERS",
      "Pull request history for agent-authored PRs",
    ],
  },
  gate: {
    evidence: [
      "CI workflows, which checks are required before merge, and whether a merge queue is used",
      "Recent CI run history: failure and flake rate, time to green, retries",
    ],
    access: [
      "Repo files: .github/workflows or .gitlab-ci.yml",
      "CI run history (GitHub MCP actions toolset)",
      "Rulesets",
    ],
  },
  review: {
    evidence: [
      "Required reviewers and code owners, PR size, time to first review",
      "Whether a review bot runs, and how often its comments are accepted",
    ],
    access: [
      "Pull requests and reviews (GitHub MCP pull_requests toolset)",
      "Repo files: CODEOWNERS",
    ],
  },
  artifact: {
    evidence: [
      "Whether builds are sealed by version and digest, and promoted rather than rebuilt",
      "Build provenance or attestations, and where artifacts are stored",
    ],
    access: [
      "Repo files: build and release workflows",
      "Releases and attestations",
      "Container or package registry (cloud MCP)",
    ],
  },
  release: {
    evidence: [
      "Deploy config, environments, and who must approve production",
      "Progressive delivery (canaries, flags) and a practised rollback",
    ],
    access: [
      "Deployments and environments (GitHub)",
      "Cloud provider MCP for deploy targets",
      "Repo files: deploy workflows, infra as code",
    ],
  },
  observe: {
    evidence: [
      "Alerts, monitors, dashboards and SLOs for production",
      "Change failure rate, recovery time and rework, and whether alerts become issues",
    ],
    access: [
      "Observability MCP (Datadog, Grafana, Sentry or similar)",
      "Issue tracker for incident follow-ups",
    ],
  },
  loop: {
    evidence: [
      "Postmortems or records of what happened, and how a signal becomes the next work order",
      "Whether docs agents build from are checked against the code",
    ],
    access: ["Repo files: docs, decision records, drift checks", "Issue tracker"],
  },
};

/** MCP servers to connect, by kind. Official pages only, opened on 24 October 2026. */
export const MCP_SERVERS: { kind: string; servers: { name: string; url: string }[] }[] = [
  {
    kind: "Code, CI and branch rules",
    servers: [
      {
        name: "GitHub MCP Server (run it with --read-only)",
        url: "https://github.com/github/github-mcp-server",
      },
      {
        name: "GitLab MCP server",
        url: "https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/mcp_server/",
      },
    ],
  },
  {
    kind: "Cloud and deploy",
    servers: [
      { name: "MCP servers for AWS", url: "https://awslabs.github.io/mcp/" },
      {
        name: "Azure MCP Server",
        url: "https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/",
      },
      { name: "Google Cloud MCP servers", url: "https://docs.cloud.google.com/mcp/overview" },
    ],
  },
  {
    kind: "Observability",
    servers: [
      { name: "Datadog MCP Server", url: "https://docs.datadoghq.com/bits_ai/mcp_server/" },
      { name: "Grafana MCP server", url: "https://github.com/grafana/mcp-grafana" },
      { name: "Sentry MCP", url: "https://docs.sentry.io/product/sentry-mcp/" },
    ],
  },
];

export const IMPACT_RUBRIC = {
  H: "Touches every change or production safety: what reaches main, secrets, or release to production.",
  M: "Improves one station's quality or speed for most changes.",
  L: "Hygiene or a narrow case.",
} as const;

export const EFFORT_RUBRIC = {
  S: "A setting, a rule, or one file. Under a day.",
  M: "A new workflow or a tool rolled out to one team. A few days.",
  L: "A platform or cross-team change. Weeks.",
} as const;

export const SCORES = {
  met: "Evidence shows the recommendation is in place.",
  partial: "Some of it is in place, or only in some repos.",
  missing: "You looked and it is not there.",
  unknown: "You could not see it. Say what access was missing.",
} as const;

export function guideVersion(changelog: string): string {
  return parseChangelog(changelog).releases[0]?.date ?? "unversioned";
}

function sourceSummary(id: string) {
  const r = ALL_REFERENCES.find((x) => x.id === id)!;
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    publication: r.publication,
    date: r.date,
    url: r.url,
  };
}

/** The whole guide as data: stations, recommendations, tools, sources, and the audit rubric. */
export function buildGuideJson(changelog: string) {
  return {
    name: "Line",
    description:
      "A guide to bringing agents into a software factory, and to where people stay in the loop.",
    url: SITE_URL,
    repo: REPO_URL,
    version: guideVersion(changelog),
    changelog: `${REPO_URL}/blob/main/CHANGELOG.md`,
    maturity: MATURITY,
    fit: FIT_MEANING,
    toolsChecked: TOOLS_CHECKED,
    stations: STATIONS.map((s) => ({
      id: s.id,
      index: s.index,
      name: s.name,
      part: s.part,
      owner: s.owner,
      thesis: s.thesis,
      guide: { stage: GUIDE[s.id].stage, bot: GUIDE[s.id].bot, human: GUIDE[s.id].human },
      audit: AUDIT_EVIDENCE[s.id],
      recommendations: RECOMMENDATIONS.filter((r) => r.station === s.id).map((r) => ({
        id: r.id,
        stage: r.stage,
        maturity: r.maturity,
        text: r.text,
        sources: r.sources,
        tools: TOOLS[r.id]?.tools ?? [],
        gap: TOOLS[r.id]?.gap ?? null,
      })),
    })),
    tools: TOOL_COVERAGE.map((t) => ({
      name: t.name,
      url: t.url,
      stations: Object.fromEntries(
        Object.entries(t.stations)
          .filter(([, c]) => c.fit !== "None")
          .map(([id, c]) => [id, c.fit]),
      ),
    })),
    sources: ALL_REFERENCES.map((r) => sourceSummary(r.id)),
    audit: {
      prompt: auditPrompt(guideVersion(changelog)),
      scores: SCORES,
      impact: IMPACT_RUBRIC,
      effort: EFFORT_RUBRIC,
      mcpServers: MCP_SERVERS,
    },
  };
}

/**
 * Lowercase the first letter of a list item so it reads mid-sentence. Words with a capital after
 * the first letter (CI, SLOs, GitHub, AGENTS.md) are names, so they keep their case.
 */
export function midSentence(item: string): string {
  const first = item.split(/[\s(,;:]/, 1)[0];
  if (/[A-Z]/.test(first.slice(1))) return item;
  return item.charAt(0).toLowerCase() + item.slice(1);
}

/** The prompt someone pastes into an agent that has read-only MCP access to their setup. */
export function auditPrompt(version: string): string {
  const stations = STATIONS.map((s) => {
    const a = AUDIT_EVIDENCE[s.id];
    return `- ${s.index} ${s.name}: look for ${a.evidence.map(midSentence).join("; ")}. Use ${a.access.map(midSentence).join("; ")}.`;
  }).join("\n");
  const rubric = (r: Record<string, string>) =>
    Object.entries(r)
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join("\n");
  return `You are auditing my software delivery setup against Line, a guide to bringing agents into a software factory (version ${version}).

1. Fetch ${GUIDE_JSON_URL}. It lists nine stations, each with recommendations labelled "Best practice" or "Cutting edge", the tools that meet them (Full or Partial), and dated sources.
2. Work read-only. Use only read and list tools. Do not create, edit, comment, merge, deploy, change settings, or open issues. Never print secret values.
3. Gather evidence station by station with the MCP servers you have:
${stations}
   If you lack access to something, say so and score it unknown. Do not guess.
4. Score every recommendation in guide.json:
${rubric(SCORES)}
   Cite evidence for each score: file paths, URLs, run links, or settings names.
5. For every partial or missing item, rate impact and effort:
   Impact
${rubric(IMPACT_RUBRIC)}
   Effort
${rubric(EFFORT_RUBRIC)}

Reply with:
(a) Scorecard: one table per station. Columns: recommendation id, label, score, evidence, impact, effort.
(b) Quick wins: up to 5 gaps with impact H or M and effort S, H first.
(c) Biggest gains: up to 5 gaps with the highest impact, whatever the effort. For each give a first step and the matching tools from guide.json.
(d) Unknowns: what you could not see, and which access would let you check it.

Keep Best practice and Cutting edge apart: list Best practice gaps first in (b) and (c), then Cutting edge gaps under their own heading. Cutting edge items are newer ideas, so treat them as options, not failures.`;
}

/** llms.txt per the llms.txt convention (https://llmstxt.org/). */
export function buildLlmsTxt(changelog: string): string {
  const version = guideVersion(changelog);
  return `# Line

> A guide to bringing agents into a software factory, and to where people stay in the loop. Nine stations, each with recommendations labelled Best practice or Cutting edge, the tools that meet them, and dated sources. Version ${version}.

To audit a setup against the guide, give an agent read-only MCP access to the repos, CI, branch rules, deploy and monitoring, then use the audit prompt in llms-full.txt. It scores each recommendation as met, partial, missing or unknown, and returns quick wins and biggest gains.

## Guide data

- [guide.json](${GUIDE_JSON_URL}): Stations, recommendations, tools with Full or Partial station ratings, sources with dates, and the audit rubric
- [llms-full.txt](${LLMS_FULL_URL}): The guide in Markdown, with the audit prompt

## Optional

- [Changelog](${REPO_URL}/blob/main/CHANGELOG.md): What changed and why, by date
- [Site](${SITE_URL}): The walkable page for people
`;
}

/** The whole guide in Markdown, with the audit prompt, for agents that want one file. */
export function buildLlmsFull(changelog: string): string {
  const version = guideVersion(changelog);
  const ref = (id: string) => {
    const r = ALL_REFERENCES.find((x) => x.id === id)!;
    return `[${r.title}](${r.url}) (${r.date})`;
  };
  const stations = STATIONS.map((s) => {
    const recs = RECOMMENDATIONS.filter((r) => r.station === s.id)
      .map((r) => {
        const entry = TOOLS[r.id];
        const tools = (entry?.tools ?? []).map((t) => `[${t.name}](${t.url}) ${t.fit}`).join(", ");
        return `- **${r.maturity}** \`${r.id}\` (${r.stage}): ${r.text}\n  Sources: ${r.sources.map(ref).join("; ")}${
          tools ? `\n  Tools: ${tools}` : ""
        }${entry?.gap ? `\n  Gap: ${entry.gap}` : ""}`;
      })
      .join("\n");
    return `## ${s.index} ${s.name}\n\n${s.thesis}\n\nBot: ${GUIDE[s.id].bot}\n\nHuman: ${GUIDE[s.id].human}\n\n${recs || "No recommendations yet."}`;
  }).join("\n\n");
  return `# Line, full guide

> Version ${version}. Generated from the same data as ${SITE_URL}. Structured data: ${GUIDE_JSON_URL}

${stations}

## Audit prompt

\`\`\`text
${auditPrompt(version)}
\`\`\`
`;
}

export function machineFiles(changelog: string): Record<string, string> {
  return {
    "guide.json": JSON.stringify(buildGuideJson(changelog), null, 2) + "\n",
    "llms.txt": buildLlmsTxt(changelog),
    "llms-full.txt": buildLlmsFull(changelog),
  };
}
