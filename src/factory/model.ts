export const STATION_IDS = [
  "backlog",
  "source",
  "bench",
  "gate",
  "review",
  "artifact",
  "release",
  "observe",
  "loop",
] as const;

export type StationId = (typeof STATION_IDS)[number];

export type BenchChoice = "budget" | "forever" | "hide";

export type CheckState = "pending" | "running" | "pass" | "fail";

export type GateStatus = "idle" | "running" | "passed" | "failed";

export interface Station {
  id: StationId;
  index: string;
  name: string;
  part: string;
  owner: string;
  thesis: string;
  lesson: string;
  sources?: ReferenceId[];
}

export const STATIONS: Station[] = [
  {
    id: "backlog",
    index: "01",
    name: "Backlog",
    part: "Work order",
    owner: "Product",
    thesis:
      "People decide what to build. Nothing enters the factory as a vibe. A work order names the break, who feels it, and how you will know it is fixed.",
    lesson:
      "Later stations do not invent the goal. Review, the gate, and production all check the change against this card. If the checks are fuzzy, every argument downstream is about a different change. Judgment is cheapest here. A wrong goal costs more at every station after it.",
    sources: ["osmani"],
  },
  {
    id: "source",
    index: "02",
    name: "Source",
    part: "Branch",
    owner: "Agent",
    thesis:
      "The repo is the memory of the factory. Main stays shippable. A branch is a parallel timeline with a name.",
    lesson:
      "A commit is a snapshot with a parent, not a file you overwrite. Cutting a branch does not change main. It only gives the next snapshot a place to land so other work can keep shipping.",
  },
  {
    id: "bench",
    index: "03",
    name: "Bench",
    part: "Edit",
    owner: "Agent",
    thesis:
      "An agent builds the change here. It edits a file, runs it in its sandbox, and looks. It is the fastest station, and the least trustworthy.",
    lesson:
      "The sandbox knows its own env, its half-written files, and its lucky runs. The factory does not. What leaves the bench is a commit. That is a snapshot someone else can check out on a clean machine.",
    sources: ["iusztin"],
  },
  {
    id: "gate",
    index: "04",
    name: "Gate",
    part: "Checks",
    owner: "The factory",
    thesis:
      "The gate runs the same checks, on a clean machine, from the snapshot. Not from the agent's sandbox. It runs before any person reads the change.",
    lesson:
      "Lint, types, tests, and a build are a recipe. If they pass only in the sandbox, they are not a gate. A red check sends the snapshot back. Main does not move. A check earns trust when it is cheap, runs every time, and is hard to fake.",
    sources: ["osmani"],
  },
  {
    id: "review",
    index: "05",
    name: "Review",
    part: "Diff",
    owner: "Human reviewer",
    thesis:
      "The checks already passed. Review is where judgment lives. A person reads the diff, not the intention, and decides if it meets the work order.",
    lesson:
      "A diff is the only thing that changed: removed lines, added lines, nothing else. Approval is the last call before the change is sealed. It is not a compliment. The agent that wrote the change is the worst judge of it. Review the session, not only the PR. Some decisions never show up in the diff.",
    sources: ["osmani", "iusztin", "savkin-review"],
  },
  {
    id: "artifact",
    index: "06",
    name: "Artifact",
    part: "Digest",
    owner: "The factory",
    thesis:
      "Once the gate passes and a person approves, the build is sealed: a name, a version, and a digest. That object is what ships. Not the branch.",
    lesson:
      "Rebuilding later, even from the same commit, can pick up a different clock, toolchain, or dependency. The digest is the proof you promoted the bytes you tested.",
  },
  {
    id: "release",
    index: "07",
    name: "Release",
    part: "Environment",
    owner: "On call",
    thesis:
      "Preview, staging, and production are places a digest runs. Promotion moves the same bytes. It does not compile them again.",
    lesson:
      "What changes between environments is config: keys, traffic, data. The code does not. If production is a rebuild, you are shipping something the gate never saw.",
  },
  {
    id: "observe",
    index: "08",
    name: "Observe",
    part: "Signal",
    owner: "On call",
    thesis:
      "Deploy is not the last station. Production is a station, and it talks back in errors, latency, and logs.",
    lesson:
      "A factory that stops at release only knows that the bytes arrived. The signal tells you whether the work order was actually met, for the people who hit the real path.",
  },
  {
    id: "loop",
    index: "09",
    name: "Return",
    part: "Loop",
    owner: "Product",
    thesis:
      "The signal becomes the next work order. A factory is the loop, not the moment of deploy.",
    lesson:
      "CHK-184 left a trace: the timeout budget is invisible to the people who will debug the next incident. That trace is backlog, not a victory lap. Write down what actually happened, so the next change starts from it.",
    sources: ["savkin"],
  },
];

export const ORDER = "CHK-184";

export const CRITERIA = [
  "The customer sees a failure only after the provider answers, or after 8 seconds.",
  "One retry covers a dropped connection.",
  "A retry never creates a second charge.",
];

export const CHECKS = ["Lint", "Types", "Tests", "Build"] as const;

export const HISTORY = [
  { sha: "a14c0d2", message: "Add the checkout form" },
  { sha: "91ab330", message: "Wire the payment client" },
  { sha: "4e88c19", message: "Release 1.4.1" },
];

export const BRANCH = "fix/checkout-timeout";
export const COMMIT = { sha: "b7e21a4", message: "Raise the charge timeout and key the retry" };

/** The commit message the agent writes for each bench edit. */
export const COMMIT_MESSAGE: Record<BenchChoice, string> = {
  budget: COMMIT.message,
  forever: "Remove the charge timeout",
  hide: "Catch charge errors and show success",
};
export const DIGEST = "sha256:9f3ac21e8b";
export const VERSION = "1.4.2";

export function stationById(id: StationId): Station {
  return STATIONS[stationIndex(id)];
}

export function stationIndex(id: StationId): number {
  return STATION_IDS.indexOf(id);
}

export function nextStation(id: StationId): StationId | null {
  const i = stationIndex(id);
  return i < STATION_IDS.length - 1 ? STATION_IDS[i + 1] : null;
}

export const LOCK_REASON: Record<StationId, string> = {
  backlog: "",
  source: "Accept the work order first. The line does not start from a vague idea.",
  bench: "Cut a branch first, so main stays shippable while the agent edits.",
  gate: "Commit the edit. The gate checks a snapshot, not an unsaved buffer.",
  review: "Run the gate first. A person only reads a change the checks could not reject.",
  artifact: "Nothing is sealed until the gate passes and a person approves.",
  release: "Promote a sealed digest. Do not ship a folder from a laptop.",
  observe: "Production has to be running this digest before its signal means anything.",
  loop: "Read the production signal. The next work order comes from what actually happened.",
};

export const PARTS: { name: string; station: string; definition: string; here: string }[] = [
  {
    name: "Work order",
    station: "Backlog",
    definition: "A small contract: problem, who is hurt, and the checks that define done.",
    here: "CHK-184 says slow cards time out at 800ms and a retry must not double-charge.",
  },
  {
    name: "Repo",
    station: "Source",
    definition: "The tree of files plus the history of snapshots. It is the factory's memory.",
    here: "payments/timeout.ts is the file. Main's tip is 4e88c19, release 1.4.1.",
  },
  {
    name: "Branch",
    station: "Source",
    definition: "A name pointing at a commit, off to the side of main, so unfinished work is not what customers run.",
    here: "fix/checkout-timeout is cut from 4e88c19. Main does not move.",
  },
  {
    name: "Commit",
    station: "Bench",
    definition: "An immutable snapshot: tree, parent, author, message. History is a chain of these.",
    here: "b7e21a4 is the snapshot the gate and review will both look at. Not the agent's sandbox.",
  },
  {
    name: "Gate",
    station: "Gate",
    definition: "A fixed recipe of checks run on a clean machine from a named snapshot.",
    here: "Lint, types, tests, build. A failing test stops the line. Main stays at 4e88c19.",
  },
  {
    name: "Diff",
    station: "Review",
    definition: "The lines removed and the lines added between two snapshots. Intention does not appear in it.",
    here: "Mina reads only what b7e21a4 changed in payments/timeout.ts, after the gate passed.",
  },
  {
    name: "Artifact",
    station: "Artifact",
    definition: "The sealed output of a passing gate and an approved review: version plus digest. The thing you promote.",
    here: "checkout-web 1.4.2, sha256:9f3ac21e8b, built from b7e21a4.",
  },
  {
    name: "Environment",
    station: "Release",
    definition: "A place an artifact runs. Preview, staging, and production differ by config and traffic, not by source.",
    here: "All three run digest 9f3ac21e8b. Production is a promotion, not a rebuild.",
  },
  {
    name: "Signal",
    station: "Observe",
    definition: "What the running artifact reports: errors, latency, logs. The factory listening to itself.",
    here: "Checkout errors per minute fall after the promotion. The 800ms timeouts stop.",
  },
  {
    name: "Loop",
    station: "Return",
    definition: "Signal turned back into a work order. Without this, the factory only repeats itself.",
    here: "CHK-221 asks to show the timeout budget, because CHK-184 was invisible while it was broken.",
  },
];

export const ERRORS = [48, 51, 46, 55, 62, 58, 64, 19, 11, 7, 5, 4];

export const LOGS = [
  { time: "14:02:11", text: "checkout timeout  provider=slow  duration=801ms" },
  { time: "14:11:02", text: "checkout ok       provider=slow  duration=2401ms  retry=1" },
  { time: "14:14:40", text: "checkout ok       provider=slow  duration=1904ms  retry=0" },
];

export type BuiltOnId = "osmani" | "iusztin" | "savkin" | "savkin-review";

export type ReadingId =
  | "crbugbench"
  | "spec-sign-off"
  | "harness-evals"
  | "spec-drift"
  | "coderabbit"
  | "gh-agentic-security"
  | "nvidia-sandbox"
  | "nvidia-agents-md"
  | "gcloud-trusted-files"
  | "owasp-agents"
  | "owasp-ai-coding"
  | "dora-roi"
  | "dora-small-batches"
  | "port-self-healing"
  | "ms-spec-driven"
  | "specguardbench"
  | "spec-growth"
  | "reviewbench"
  | "review-bench-rots"
  | "ci-loop-guards"
  | "ironbee"
  | "pace-bench"
  | "cortex"
  | "stepto-progressive"
  | "reveneau-progressive"
  | "dora-2025"
  | "dx-state-ai"
  | "post-merge-fate"
  | "npm-provenance-census"
  | "gh-slsa-changelog"
  | "gh-attestations"
  | "gh-environments";

export type ReferenceId = BuiltOnId | ReadingId;

export interface Reference {
  id: ReferenceId;
  title: string;
  author: string;
  publication: string;
  date: string;
  url: string;
  took: string;
}

/** The four pieces Line started from. */
export const REFERENCES: Reference[] = [
  {
    id: "osmani",
    title: "Software Factories, Light and Dark",
    author: "Addy Osmani",
    publication: "AddyOsmani.com",
    date: "20 July 2026",
    url: "https://addyosmani.com/blog/software-factories/",
    took: "The closed loop from intent to production signal and back. Verification, not generation, is the bottleneck.",
  },
  {
    id: "iusztin",
    title: "Inside a Software Factory",
    author: "Paul Iusztin",
    publication: "O'Reilly Radar",
    date: "4 September 2026",
    url: "https://www.oreilly.com/radar/inside-a-software-factory/",
    took: "The factory as stages of the lifecycle, and where the human belongs in it.",
  },
  {
    id: "savkin",
    title: "A Software Factory Is a Workflow, Not a Product. Build One in 20 Minutes.",
    author: "Victor Savkin",
    publication: "Nx Blog",
    date: "6 August 2026",
    url: "https://nx.dev/blog/software-factory-workflow-not-product",
    took: "The factory is ordinary steps wired together. Record what happened once it has.",
  },
  {
    id: "savkin-review",
    title: "Building Interactive Agentic Code Reviews in 20 Minutes",
    author: "Victor Savkin",
    publication: "Nx Blog",
    date: "12 August 2026",
    url: "https://nx.dev/blog/building-interactive-agentic-code-reviews",
    took: "A review bot pre-reviews in the background. The person reviews the session and talks to the agent.",
  },
];

/** Newer pieces behind the labelled recommendations. Titles are quoted as published. */
export const FURTHER_READING: { heading: string; refs: Reference[] }[] = [
  {
    heading: "Sep to Oct 2026",
    refs: [
      {
        id: "stepto-progressive",
        title: "More Code, Fewer Deployments: Why Progressive Delivery Is the Missing Half of Your AI Coding Strategy",
        author: "Igor Gazivoda",
        publication: "StepTo",
        date: "20 October 2026",
        url: "https://stepto.net/blog/progressive-delivery-feature-flags-ai-generated-code-release-safety-2026",
        took: "Agents raise change volume. Flags, canaries, and automated rollback shrink how many users meet a bad change.",
      },
      {
        id: "reveneau-progressive",
        title: "Releasing AI-written changes: flags, canaries and rollback",
        author: "Reveneau Editorial",
        publication: "Reveneau",
        date: "1 September 2026",
        url: "https://reveneau.com/guides/ai-native-delivery/progressive-delivery-for-ai-written-changes",
        took: "Separate deploy from release, widen on a named signal, and let anyone on call roll back. Practise the rollback.",
      },
      {
        id: "ironbee",
        title: "The Honest Raw LLM Code Review Benchmark: 21 Models, 7,980 Reviews, Every Number Open",
        author: "Serkan Özal",
        publication: "IronBee AI",
        date: "19 October 2026",
        url: "https://ironbee.ai/blog/the-honest-raw-llm-code-review-benchmark",
        took: "Raw models review as well as review tools, and scores shift between models and runs. Benchmark your own setup.",
      },
      {
        id: "pace-bench",
        title: "When Coding Agents Outpace Review: Evaluating PRD-Driven Development in Mature Enterprise Repositories",
        author: "Tianqi Liu and others",
        publication: "arXiv",
        date: "19 October 2026",
        url: "https://arxiv.org/abs/2610.26394",
        took: "With the same model and tasks, successive harness releases raised the mean score from 59.4 to 63.0.",
      },
      {
        id: "cortex",
        title: "Cortex: Measurement-Gated Evolution and Pruning of Coding-Agent Skills and Rules",
        author: "Samuele Giampieri",
        publication: "arXiv",
        date: "9 October 2026",
        url: "https://arxiv.org/abs/2610.14216",
        took: "Replay tasks with a new rule several times. Keep it only if it helps overall and breaks no task.",
      },
      {
        id: "specguardbench",
        title: "SpecGuardBench: Can Coding Agents Construct Reliable Validation Harnesses from Natural Language Specifications?",
        author: "Zhiqing Zhong, Mingyu Chen, Aoyang Fang, Yuzhong Zhang, Haoye Tian, Lionel Briand, Boxi Yu, Pinjia He",
        publication: "arXiv",
        date: "12 October 2026",
        url: "https://arxiv.org/abs/2610.16870",
        took: "No agent wrote checks faithful to the spec on more than 63% of tasks. Their checks copied the code, not the spec.",
      },
      {
        id: "spec-growth",
        title: "Implementing the Spec Growth Engine: Preventing Spec-Code Divergence, and Growing the Spec with Agents",
        author: "Hartwig Grabowski",
        publication: "arXiv",
        date: "8 October 2026",
        url: "https://arxiv.org/abs/2610.11725",
        took: "A drift check that needs no model can run as a pre-commit hook and refuse a drifting commit.",
      },
      {
        id: "reviewbench",
        title: "ReviewBench: An open benchmark for AI code review",
        author: "Michelle Zhou",
        publication: "The GitHub Blog",
        date: "5 October 2026",
        url: "https://github.blog/ai-and-ml/github-copilot/reviewbench-an-open-benchmark-for-ai-code-review/",
        took: "An open set of 219 real PRs with a fixed rubric, for testing a review agent before you trust it.",
      },
      {
        id: "review-bench-rots",
        title: "Martian's Code Review Bench: the \"#1\" claim rots in months",
        author: "aicodereview.io Editorial",
        publication: "aicodereview.io",
        date: "5 October 2026",
        url: "https://aicodereview.io/blog/martians-code-review-bench-the-1-claim-rots-in-months/",
        took: "Review bot rankings move within months. Re-test rather than trust a vendor's top spot.",
      },
      {
        id: "ci-loop-guards",
        title: "CI Failure to Fix: The AI Agent CI Loop That Doesn't Thrash",
        author: "Russell Winslow",
        publication: "Automater Intel",
        date: "13 September 2026",
        url: "https://automater.ai/intel/ci-agent-fix-loop-guards/",
        took: "Cap fix attempts, retry only on a new failure, and hand fixes to tests, CI config, or lockfiles to a person.",
      },
      {
        id: "crbugbench",
        title:
          "(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection",
        author: "Chenyang Yang, Hao He, Ti-Chung Cheng, Jenna Butler, Emerson Murphy-Hill, Carmen Badea, Christian Bird",
        publication: "arXiv",
        date: "9 October 2026",
        url: "https://arxiv.org/abs/2610.13668",
        took: "The best review agent caught 71.9% of known bugs. Agents still miss bugs that need wider context. Scale review effort to the change.",
      },
      {
        id: "spec-sign-off",
        title: "Who Holds the Pen? Let Specifications, Not Agents, Sign Off",
        author: "Haiqing Li and others",
        publication: "arXiv",
        date: "24 September 2026",
        url: "https://arxiv.org/abs/2609.29921",
        took: "Agents claim success more often than they pass. Checks outside the agent should sign off.",
      },
      {
        id: "spec-drift",
        title: "Spec-driven development and spec drift: 335 repositories surveyed",
        author: "Striff Engineering",
        publication: "Striff",
        date: "15 September 2026",
        url: "https://striff.io/blog/architecture-matters-more-not-less/",
        took: "Most repos hand agents docs to build from. Few check the code still matches them.",
      },
      {
        id: "harness-evals",
        title: "The Anatomy of Harness Engineering: How to Evaluate, Iterate, and Guard AI Coding Agents",
        author: "Taylor Mullen, Christian Gunderman",
        publication: "Google Developers Blog",
        date: "9 September 2026",
        url: "https://developers.googleblog.com/en/the-anatomy-of-harness-engineering-how-to-evaluate-iterate-and-guard-ai-coding-agents/",
        took: "Test the agent setup with small behavioural evals, and watch the pass rate when a prompt or model changes.",
      },
    ],
  },
  {
    heading: "Earlier, still current",
    refs: [
      {
        id: "dora-2025",
        title: "Announcing the 2025 DORA Report",
        author: "Nathen Harvey, Derek DeBellis",
        publication: "Google Cloud Blog",
        date: "23 September 2025",
        url: "https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report",
        took: "AI adoption now goes with higher throughput, and still with lower delivery stability.",
      },
      {
        id: "dx-state-ai",
        title: "State of AI in Software Development",
        author: "DX",
        publication: "LeadDev LXD3",
        date: "June 2026",
        url: "https://leaddev.com/wp-content/uploads/2026/06/LXD3-2026-AI-in-the-SDLC.pdf",
        took: "Across 61 companies, AI users' change failure rate barely moved on average. Per company it rose or fell. Measure your own.",
      },
      {
        id: "post-merge-fate",
        title: "Do These Violent Delights Have Violent Ends? Measuring the Post-Merge Fate of Agentic Code",
        author: "Chunqiu Steven Xia, Courtney Miller and others",
        publication: "arXiv",
        date: "10 July 2026",
        url: "https://arxiv.org/abs/2607.09902",
        took: "Merged agent code needed more bug fixes later, and more so where changes went unreviewed. Merge rate alone hides this.",
      },
      {
        id: "npm-provenance-census",
        title: "Two years after npm shipped build provenance, 78% of a typical dependency tree still doesn't use it",
        author: "Zennoxa Shield",
        publication: "Zennoxa",
        date: "25 August 2026",
        url: "https://zennoxa.com/research/npm-provenance-census-2026",
        took: "Build provenance is easy to turn on, yet most packages still ship without it.",
      },
      {
        id: "gh-slsa-changelog",
        title: "Strengthen your supply chain with code-to-cloud traceability and SLSA Build Level 3 security",
        author: "GitHub",
        publication: "GitHub Changelog",
        date: "20 January 2026",
        url: "https://github.blog/changelog/2026-01-20-strengthen-your-supply-chain-with-code-to-cloud-traceability-and-slsa-build-level-3-security/",
        took: "Link each artifact to its attestations, where it is stored, and where it is deployed.",
      },
      {
        id: "gh-attestations",
        title: "Artifact attestations",
        author: "GitHub",
        publication: "GitHub Docs",
        date: "Undated",
        url: "https://docs.github.com/en/actions/concepts/security/artifact-attestations",
        took: "A signed record ties an artifact to its commit and workflow. SLSA Build Level 2 by default, Level 3 with a reusable workflow.",
      },
      {
        id: "gh-environments",
        title: "Deployments and environments",
        author: "GitHub",
        publication: "GitHub Docs",
        date: "Undated",
        url: "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
        took: "Required reviewers must approve a job before it deploys to a protected environment.",
      },
      {
        id: "coderabbit",
        title: "Is Agentic Code Review Helpful? Mining Developers' Feedback to CodeRabbit Reviews in the Wild",
        author: "Hong Yi Lin, Mingzhao Liang, Patanamon Thongtanunam, Kla Tantithamthavorn",
        publication: "arXiv",
        date: "3 July 2026",
        url: "https://arxiv.org/abs/2607.03316",
        took: "Developers rejected more review bot comments than they accepted. Track which ones land.",
      },
      {
        id: "gh-agentic-security",
        title: "Under the hood: Security architecture of GitHub Agentic Workflows",
        author: "Landon Cox, Jiaxiao Zhou",
        publication: "The GitHub Blog",
        date: "9 March 2026",
        url: "https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/",
        took: "Agents hold no secrets. Their writes are staged and vetted before anything lands.",
      },
      {
        id: "nvidia-sandbox",
        title: "Practical Security Guidance for Sandboxing Agentic Workflows and Managing Execution Risk",
        author: "Rich Harang",
        publication: "NVIDIA Technical Blog",
        date: "30 January 2026",
        url: "https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/",
        took: "Sandbox agents and control where they can reach on the network.",
      },
      {
        id: "nvidia-agents-md",
        title: "Mitigating Indirect AGENTS.md Injection Attacks in Agentic Environments",
        author: "Daniel Teixeira",
        publication: "NVIDIA Technical Blog",
        date: "20 April 2026",
        url: "https://developer.nvidia.com/blog/mitigating-indirect-agents-md-injection-attacks-in-agentic-environments/",
        took: "Instruction files can be planted. Treat them as part of the supply chain.",
      },
      {
        id: "gcloud-trusted-files",
        title: "Beyond source code: The files AI coding agents trust \u2014 and attackers exploit",
        author: "Bernardo Quintero, Daniel Kapellmann Zafra",
        publication: "Google Cloud Blog",
        date: "12 May 2026",
        url: "https://cloud.google.com/blog/products/identity-security/beyond-source-code-the-files-ai-coding-agents-trust-and-attackers-exploit",
        took: "Instruction files and agent settings can steer an agent. Allow only known ones and review them before merge.",
      },
      {
        id: "owasp-agents",
        title: "AI Agent and MCP Security",
        author: "OWASP",
        publication: "OWASP DevSecOps Guideline",
        date: "Undated",
        url: "https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/",
        took: "Isolation is the boundary, not a prompt. Instruction files go under code owners. No agent approves its own change.",
      },
      {
        id: "owasp-ai-coding",
        title: "Secure Coding with AI Cheat Sheet",
        author: "OWASP",
        publication: "OWASP Cheat Sheet Series",
        date: "Undated",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html",
        took: "Every AI change has a named human owner. AI review does not replace human review.",
      },
      {
        id: "dora-roi",
        title: "ROI of AI-assisted Software Development",
        author: "DORA",
        publication: "dora.dev",
        date: "22 April 2026",
        url: "https://dora.dev/ai/roi/report/",
        took: "Expect a dip before gains, and count the cost of checking AI output.",
      },
      {
        id: "dora-small-batches",
        title: "Capabilities: Working in small batches",
        author: "DORA",
        publication: "dora.dev",
        date: "Updated 8 December 2025",
        url: "https://dora.dev/capabilities/working-in-small-batches/",
        took: "Small batches are a safety net for AI adoption, against the instability faster changes bring.",
      },
      {
        id: "port-self-healing",
        title: "How to build self-healing CI pipelines",
        author: "Zohar Einy",
        publication: "Port newsletter",
        date: "12 May 2026",
        url: "https://newsletter.port.io/p/how-to-build-self-healing-ci-pipelines",
        took: "Sort a red check by whose problem it is before fixing it. Hand new or risky failures to a person.",
      },
      {
        id: "ms-spec-driven",
        title: "Spec-Driven Development: A Spec-First Approach to AI-Native Engineering",
        author: "Apoorv Gupta",
        publication: "Microsoft for Developers",
        date: "10 June 2026",
        url: "https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering/",
        took: "Write the spec first, and keep it as the thing agents build and check against.",
      },
    ],
  },
];

export const ALL_REFERENCES: Reference[] = [...REFERENCES, ...FURTHER_READING.flatMap((g) => g.refs)];

export function referenceById(id: ReferenceId): Reference {
  return ALL_REFERENCES.find((r) => r.id === id)!;
}

/** When to bring a station's bot in. Start small and add more as people trust it. */
export type AdoptionStage = "Start" | "Guardrails" | "Next" | "Later";

export const ADOPTION_STAGES: {
  stage: AdoptionStage;
  summary: string;
  sources: ReferenceId[];
}[] = [
  {
    stage: "Start",
    summary:
      "Cheap checks on every snapshot and a review bot. Every team gains from these. Nothing ships without a person.",
    sources: ["osmani", "savkin-review"],
  },
  {
    stage: "Guardrails",
    summary:
      "Before any coding agent writes code. Agents run in a sandbox with no secrets and a short list of hosts they can reach. Their writes are staged and checked. Their instruction files are owned and reviewed like code.",
    sources: ["gh-agentic-security", "owasp-agents"],
  },
  {
    stage: "Next",
    summary:
      "Agents take small work orders that are labelled for the factory. They build in fresh workspaces inside the guardrails. People still plan and approve.",
    sources: ["savkin", "iusztin"],
  },
  {
    stage: "Later",
    summary:
      "Agents help release, watch production, and record what happened. Keep a person wherever a wrong call is expensive.",
    sources: ["iusztin", "osmani"],
  },
];

export interface Guide {
  stage: AdoptionStage;
  bot: string;
  human: string;
  sources: ReferenceId[];
}

/** Per station: the bot you can bring in, when, and where a person stays. */
export const GUIDE: Record<StationId, Guide> = {
  backlog: {
    stage: "Next",
    bot: "A triage agent sorts incoming bugs, ideas, and incidents. It drops duplicates and routes each one. It reads issue text as untrusted input and takes no orders from it.",
    human:
      "Product decides what gets built and writes the checks that mean done. Planning is where judgment pays most.",
    sources: ["iusztin", "osmani"],
  },
  source: {
    stage: "Next",
    bot: "An agent sets up a fresh workspace and cuts the branch for each work order. The workspace is a sandbox with no production secrets.",
    human:
      "No one needs to touch this per change. People set the rule that main only moves through the gate and review. They own the sandbox rules too.",
    sources: ["savkin", "gh-agentic-security"],
  },
  bench: {
    stage: "Next",
    bot: "A coding agent builds the change. A separate QA agent tries to break it. Start with small work orders labelled for the factory. Its pushes and comments are staged, then checked.",
    human:
      "Not at the bench. A person must still be able to step in, halt the agent, or redirect it.",
    sources: ["iusztin", "savkin"],
  },
  gate: {
    stage: "Start",
    bot: "CI runs lint, types, tests, and a build on every snapshot. Later a fixing agent can sort a red check and open a fix as a PR. A new or risky failure goes to its owner.",
    human:
      "People choose which checks exist. A check is worth trusting when it is cheap, runs every time, and is hard to fake. An agent saying it is done is not a check.",
    sources: ["osmani", "iusztin"],
  },
  review: {
    stage: "Start",
    bot: "An adversarial review agent runs in the background. It looks for bugs and API misuse, then writes a summary. The PR description can mislead it.",
    human:
      "The reviewer. Agents cannot explain a change to a person and are poor at architecture. A person reads the session, talks to the agent, and approves. Review goes deeper as the change gets bigger or riskier.",
    sources: ["savkin-review", "osmani"],
  },
  artifact: {
    stage: "Start",
    bot: "No agent. The build tool seals the version and digest.",
    human: "None per change. Nothing here needs judgment.",
    sources: [],
  },
  release: {
    stage: "Later",
    bot: "CD promotes the sealed digest to staging, then production.",
    human:
      "A person checks before production. Keep that check wherever a wrong call is expensive, like auth, billing, or a public API.",
    sources: ["iusztin", "osmani"],
  },
  observe: {
    stage: "Later",
    bot: "A monitoring agent turns alerts, errors, and incidents into new tasks for triage.",
    human: "On call. A person owns the consequences when production is wrong.",
    sources: ["iusztin", "osmani"],
  },
  loop: {
    stage: "Later",
    bot: "A record agent writes down what actually happened, so the next change starts from it.",
    human: "Product decides whether the signal becomes the next work order.",
    sources: ["savkin", "iusztin"],
  },
};

/**
 * How settled a recommendation is.
 * Best practice: well established, several independent sources, widely adopted.
 * Cutting edge: newer, evidence mostly from one recent paper or survey, or emerging tooling.
 */
export type Maturity = "Best practice" | "Cutting edge";

export const MATURITY: Record<Maturity, string> = {
  "Best practice": "Well established. Several independent sources say it, and teams widely do it.",
  "Cutting edge": "Newer. The evidence is mostly one recent paper or survey, or tooling that is still emerging.",
};

export interface Recommendation {
  id: string;
  station: StationId;
  stage: AdoptionStage;
  maturity: Maturity;
  text: string;
  sources: ReferenceId[];
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "done-as-checks",
    station: "backlog",
    stage: "Start",
    maturity: "Best practice",
    text: "Write done as checks a machine can run. Vague criteria give an agent room to claim success.",
    sources: ["ms-spec-driven",  "spec-sign-off"],
  },
  {
    id: "untrusted-issues",
    station: "backlog",
    stage: "Next",
    maturity: "Best practice",
    text: "Treat issue text as untrusted input. The triage agent reads it but takes no orders from it.",
    sources: ["nvidia-agents-md",  "owasp-agents"],
  },
  {
    id: "sandbox-no-secrets",
    station: "source",
    stage: "Guardrails",
    maturity: "Best practice",
    text: "Run agents in a sandbox with no production secrets. Isolation is the boundary, not a prompt.",
    sources: ["gh-agentic-security",  "nvidia-sandbox",  "owasp-agents"],
  },
  {
    id: "egress-allowlist",
    station: "source",
    stage: "Guardrails",
    maturity: "Best practice",
    text: "Let the sandbox reach only a short list of hosts. Block the rest of the network.",
    sources: ["nvidia-sandbox",  "gh-agentic-security",  "owasp-agents"],
  },
  {
    id: "staged-writes",
    station: "bench",
    stage: "Guardrails",
    maturity: "Best practice",
    text: "Stage the agent's writes. Pushes, PRs, and comments pass a check with limits before they land.",
    sources: ["gh-agentic-security",  "owasp-agents"],
  },
  {
    id: "owned-instructions",
    station: "bench",
    stage: "Guardrails",
    maturity: "Best practice",
    text: "Put AGENTS.md and other instruction files under code owners. Review a change to them like a change to code.",
    sources: ["owasp-agents",  "nvidia-agents-md",  "gcloud-trusted-files"],
  },
  {
    id: "checks-not-claims",
    station: "gate",
    stage: "Start",
    maturity: "Best practice",
    text: "An agent saying it is done is not evidence. Only the gate's checks count.",
    sources: ["osmani",  "spec-sign-off",  "gh-agentic-security"],
  },
  {
    id: "spec-signs-off",
    station: "gate",
    stage: "Later",
    maturity: "Cutting edge",
    text: "Let the spec sign off, not the agent. Checks drawn from the work order decide whether the change is done.",
    sources: ["spec-sign-off"],
  },
  {
    id: "spec-checks-rerun",
    station: "gate",
    stage: "Later",
    maturity: "Cutting edge",
    text: "Run those checks again whenever the code or data they depend on changes.",
    sources: ["spec-sign-off"],
  },
  {
    id: "check-the-checks",
    station: "gate",
    stage: "Later",
    maturity: "Cutting edge",
    text: "A person checks the checks against the work order. Agents tend to write checks that copy their code, not the spec.",
    sources: ["specguardbench",  "spec-sign-off"],
  },
  {
    id: "triage-red-checks",
    station: "gate",
    stage: "Later",
    maturity: "Cutting edge",
    text: "A fixing agent sorts each red check first: whose problem it is, and whether it has been seen before. A new or risky failure goes to its owner.",
    sources: ["port-self-healing"],
  },
  {
    id: "fix-as-pr",
    station: "gate",
    stage: "Later",
    maturity: "Cutting edge",
    text: "The fixing agent opens its fix as a PR. It goes through the gate and review like any other change.",
    sources: ["port-self-healing"],
  },
  {
    id: "cap-fix-loop",
    station: "gate",
    stage: "Later",
    maturity: "Cutting edge",
    text: "Cap the fixing agent's attempts, and let it try again only on a new failure.",
    sources: ["ci-loop-guards"],
  },
  {
    id: "fix-paths-to-person",
    station: "gate",
    stage: "Later",
    maturity: "Cutting edge",
    text: "Send any fix that touches tests, CI config, or lockfiles to a person.",
    sources: ["ci-loop-guards"],
  },
  {
    id: "scale-review",
    station: "review",
    stage: "Start",
    maturity: "Best practice",
    text: "Keep PRs small. Scale how deeply a person reviews to the size and risk of the change.",
    sources: ["crbugbench",  "dora-small-batches"],
  },
  {
    id: "human-approves",
    station: "review",
    stage: "Start",
    maturity: "Best practice",
    text: "A named person approves. Agent review does not replace it, and no agent approves its own change.",
    sources: ["owasp-ai-coding",  "owasp-agents",  "crbugbench"],
  },
  {
    id: "measure-review-bot",
    station: "review",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Track how often people accept the review bot's comments, and test it on bugs you already know. The PR description can mislead it, so read its summary as a claim. Test it again when the model changes. Rankings move within months. Several independent benchmarks back this, but wide adoption is not shown yet.",
    sources: ["crbugbench",  "coderabbit",  "reviewbench",  "review-bench-rots",  "ironbee"],
  },
  {
    id: "attest-provenance",
    station: "artifact",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Attest each build: a signed record that ties the digest to its commit and workflow. Verify it before you promote. The SLSA standard is mature, but most projects do not do this yet.",
    sources: ["gh-attestations",  "gh-slsa-changelog",  "npm-provenance-census"],
  },
  {
    id: "progressive-release",
    station: "release",
    stage: "Later",
    maturity: "Best practice",
    text: "Separate deploy from release. Turn a change on for a small share of users first, widen it on a named signal, and roll back automatically when a guardrail breaks.",
    sources: ["reveneau-progressive",  "stepto-progressive",  "dora-2025"],
  },
  {
    id: "human-release-gate",
    station: "release",
    stage: "Later",
    maturity: "Best practice",
    text: "A named person approves promotion to production where a wrong call is expensive, like auth, billing, data migrations, or a public API. Anyone on call can roll back without a second approval, and the rollback is practised.",
    sources: ["gh-environments",  "reveneau-progressive",  "iusztin"],
  },
  {
    id: "measure-factory",
    station: "observe",
    stage: "Start",
    maturity: "Best practice",
    text: "Measure change failure rate, rework, and recovery time before agents arrive and after. Expect throughput to rise before stability does. Count cost per change too, though little published evidence measures it yet.",
    sources: ["dora-2025",  "dora-roi",  "dx-state-ai",  "post-merge-fate"],
  },
  {
    id: "harness-evals",
    station: "observe",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Test the agent setup like code. Run small behavioural evals when a prompt, tool, or model changes, and track the pass rate over time. Keep a prompt or rule change only when replayed evals show it helps and breaks no task.",
    sources: ["harness-evals",  "crbugbench",  "pace-bench",  "cortex"],
  },
  {
    id: "spec-drift",
    station: "loop",
    stage: "Later",
    maturity: "Cutting edge",
    text: "Check that the docs agents build from still match the code. Record the drift as the next work order. Make the check deterministic, so it can refuse a drifting commit.",
    sources: ["spec-drift",  "ms-spec-driven",  "spec-growth"],
  },
];

export type Fit = "Full" | "Partial";

export interface Tool {
  name: string;
  url: string;
  fit: Fit;
  note: string;
}

/** When the tool links were last opened. */
export const TOOLS_CHECKED = "22 October 2026";

/** Per recommendation: tools that meet some or all of it, and what is left. Not an endorsement. */
export const TOOLS: Record<string, { tools: Tool[]; gap?: string }> = {
  "done-as-checks": {
    tools: [
      {
        name: "GitHub Spec Kit",
        url: "https://github.com/github/spec-kit",
        fit: "Partial",
        note: "Keeps the spec as what agents build and check against. Does not make the checks executable.",
      },
      {
        name: "Kiro",
        url: "https://kiro.dev",
        fit: "Partial",
        note: "Writes acceptance criteria into specs. They run only if you turn them into tests.",
      },
      {
        name: "Cucumber",
        url: "https://cucumber.io",
        fit: "Partial",
        note: "Acceptance criteria as executable scenarios. People still write them.",
      }
    ],
  },
  "untrusted-issues": {
    tools: [
      {
        name: "GitHub Agentic Workflows",
        url: "https://github.github.com/gh-aw/",
        fit: "Partial",
        note: "Limits what an agent can do with what it reads.",
      },
      {
        name: "Lakera Guard",
        url: "https://www.lakera.ai/lakera-guard",
        fit: "Partial",
        note: "Detects prompt injection. Detection is probabilistic, not a boundary.",
      },
      {
        name: "PurpleLlama (Prompt Guard)",
        url: "https://github.com/meta-llama/PurpleLlama",
        fit: "Partial",
        note: "Open-source injection classifier, with the same limit.",
      }
    ],
  },
  "sandbox-no-secrets": {
    tools: [
      {
        name: "E2B",
        url: "https://e2b.dev",
        fit: "Full",
        note: "Isolated sandboxes for agents.",
      },
      {
        name: "Daytona",
        url: "https://www.daytona.io",
        fit: "Full",
        note: "Isolated sandboxes for agents.",
      },
      {
        name: "Copilot coding agent",
        url: "https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent",
        fit: "Full",
        note: "Runs in a GitHub Actions sandbox. GitHub-hosted work only.",
      }
    ],
  },
  "egress-allowlist": {
    tools: [
      {
        name: "Copilot coding agent firewall",
        url: "https://docs.github.com/en/copilot/customizing-copilot/customizing-or-disabling-the-firewall-for-copilot-coding-agent",
        fit: "Full",
        note: "Allowlist for Copilot's agent only.",
      },
      {
        name: "StepSecurity Harden-Runner",
        url: "https://github.com/step-security/harden-runner",
        fit: "Full",
        note: "Blocks outbound traffic from GitHub Actions runners to unlisted hosts.",
      }
    ],
  },
  "staged-writes": {
    tools: [
      {
        name: "GitHub Agentic Workflows",
        url: "https://github.github.com/gh-aw/",
        fit: "Full",
        note: "The agent proposes writes and a separate step checks them before they land.",
      },
      {
        name: "GitHub rulesets",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
        fit: "Partial",
        note: "Protect branches, but not comments or PRs.",
      }
    ],
  },
  "owned-instructions": {
    tools: [
      {
        name: "CODEOWNERS",
        url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners",
        fit: "Full",
        note: "With rulesets, a change to an instruction file needs its owner.",
      }
    ],
    gap: "Instruction files outside the repo, such as user or global agent settings, still need a person.",
  },
  "checks-not-claims": {
    tools: [
      {
        name: "GitHub rulesets",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
        fit: "Full",
        note: "Required status checks block the merge.",
      },
      {
        name: "Trunk Merge Queue",
        url: "https://trunk.io/merge-queue",
        fit: "Full",
        note: "Merges only what passes the checks.",
      },
      {
        name: "Mergify",
        url: "https://mergify.com",
        fit: "Full",
        note: "Merge queue and merge rules.",
      }
    ],
  },
  "spec-signs-off": {
    tools: [
      {
        name: "GitHub Spec Kit",
        url: "https://github.com/github/spec-kit",
        fit: "Partial",
        note: "Keeps the spec as what agents build and check against. Does not make the checks executable.",
      },
      {
        name: "Cucumber",
        url: "https://cucumber.io",
        fit: "Partial",
        note: "Scenarios from the work order can decide done.",
      }
    ],
    gap: "No tool makes checks drawn from the work order the sign-off by itself. A person or a custom workflow wires it up.",
  },
  "spec-checks-rerun": {
    tools: [
      {
        name: "Nx affected",
        url: "https://nx.dev/ci/features/affected",
        fit: "Partial",
        note: "Reruns checks for projects a code change touches. Not data changes.",
      }
    ],
    gap: "Rerunning on a data or external dependency change needs a custom trigger.",
  },
  "check-the-checks": {
    tools: [
      {
        name: "Stryker",
        url: "https://stryker-mutator.io",
        fit: "Partial",
        note: "Mutation testing shows weak tests, not whether they match the spec.",
      }
    ],
    gap: "No tool checks the checks against the work order. A person does it.",
  },
  "triage-red-checks": {
    tools: [
      {
        name: "Trunk Flaky Tests",
        url: "https://trunk.io/flaky-tests",
        fit: "Partial",
        note: "Separates flaky failures from real ones.",
      },
      {
        name: "Nx Cloud self-healing CI",
        url: "https://nx.dev/ci/features/self-healing-ci",
        fit: "Partial",
        note: "Proposes fixes for red checks. A person approves by default, with an option to auto-apply verified fixes.",
      }
    ],
  },
  "fix-as-pr": {
    tools: [
      {
        name: "Nx Cloud self-healing CI",
        url: "https://nx.dev/ci/features/self-healing-ci",
        fit: "Partial",
        note: "Proposes fixes for red checks. A person approves by default, with an option to auto-apply verified fixes.",
      },
      {
        name: "Gitar",
        url: "https://gitar.ai",
        fit: "Partial",
        note: "Fixes CI failures and reviews code.",
      }
    ],
  },
  "cap-fix-loop": {
    tools: [],
    gap: "No product found with an attempt cap and a new-failure rule. Write it into the workflow.",
  },
  "fix-paths-to-person": {
    tools: [
      {
        name: "CODEOWNERS",
        url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners",
        fit: "Full",
        note: "Own tests, CI config, and lockfiles so a person must approve changes to them.",
      }
    ],
  },
  "scale-review": {
    tools: [
      {
        name: "Graphite",
        url: "https://graphite.dev",
        fit: "Partial",
        note: "Stacked PRs keep each change small.",
      },
      {
        name: "PullApprove",
        url: "https://www.pullapprove.com",
        fit: "Partial",
        note: "Routes reviewers by rule. You still judge the risk.",
      }
    ],
  },
  "human-approves": {
    tools: [
      {
        name: "GitHub rulesets",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
        fit: "Full",
        note: "Require an approving review before merge.",
      },
      {
        name: "Copilot code review",
        url: "https://docs.github.com/en/copilot/concepts/agents/code-review",
        fit: "Partial",
        note: "A review bot only. Check that its reviews cannot count as an approval.",
      }
    ],
  },
  "measure-review-bot": {
    tools: [
      {
        name: "CodeRabbit dashboard",
        url: "https://docs.coderabbit.ai/guides/dashboard",
        fit: "Partial",
        note: "Comment acceptance rates by severity and category. CodeRabbit only.",
      },
      {
        name: "Martian Code Review Bench",
        url: "https://github.com/withmartian/code-review-benchmark",
        fit: "Partial",
        note: "Open benchmark to run your bot through.",
      }
    ],
    gap: "Testing the bot on bugs from your own history is still a custom script.",
  },
  "attest-provenance": {
    tools: [
      {
        name: "attest-build-provenance",
        url: "https://github.com/actions/attest-build-provenance",
        fit: "Full",
        note: "Signed SLSA provenance from GitHub Actions. Verify with gh attestation verify.",
      },
      {
        name: "slsa-github-generator",
        url: "https://github.com/slsa-framework/slsa-github-generator",
        fit: "Full",
        note: "SLSA Build Level 3 provenance.",
      },
      {
        name: "Sigstore cosign",
        url: "https://github.com/sigstore/cosign",
        fit: "Partial",
        note: "Signs and verifies artifacts. Provenance comes from your build.",
      }
    ],
  },
  "progressive-release": {
    tools: [
      {
        name: "Argo Rollouts",
        url: "https://argoproj.github.io/rollouts/",
        fit: "Full",
        note: "Canary with metric analysis and automated rollback, on Kubernetes.",
      },
      {
        name: "Flagger",
        url: "https://flagger.app",
        fit: "Full",
        note: "The same, on Kubernetes.",
      },
      {
        name: "LaunchDarkly guarded rollouts",
        url: "https://launchdarkly.com/docs/home/releases/guarded-rollouts",
        fit: "Full",
        note: "Flag rollouts that halt and revert on a guardrail metric.",
      }
    ],
  },
  "human-release-gate": {
    tools: [
      {
        name: "GitHub environments",
        url: "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
        fit: "Full",
        note: "Required reviewers approve before a deploy to production.",
      }
    ],
    gap: "Deciding which changes are expensive to get wrong is still a person's call.",
  },
  "measure-factory": {
    tools: [
      {
        name: "DX",
        url: "https://getdx.com",
        fit: "Partial",
        note: "AI impact and delivery metrics.",
      },
      {
        name: "Faros AI",
        url: "https://www.faros.ai",
        fit: "Partial",
        note: "DORA metrics.",
      },
      {
        name: "Swarmia",
        url: "https://www.swarmia.com",
        fit: "Partial",
        note: "Delivery metrics.",
      }
    ],
    gap: "No tool reports cost per change. Join agent and CI bills to changes yourself.",
  },
  "harness-evals": {
    tools: [
      {
        name: "Inspect AI",
        url: "https://inspect.aisi.org.uk",
        fit: "Full",
        note: "Agent evals.",
      },
      {
        name: "Promptfoo",
        url: "https://www.promptfoo.dev",
        fit: "Full",
        note: "Evals that run in CI.",
      },
      {
        name: "Braintrust",
        url: "https://www.braintrust.dev",
        fit: "Partial",
        note: "Tracks eval results over time.",
      }
    ],
    gap: "Keeping a rule only when replayed tasks show it helps needs your own task set.",
  },
  "spec-drift": {
    tools: [
      {
        name: "dependency-cruiser",
        url: "https://github.com/sverweij/dependency-cruiser",
        fit: "Partial",
        note: "Blocks imports that break declared rules, deterministically. Does not read prose specs.",
      },
      {
        name: "ArchUnit",
        url: "https://www.archunit.org",
        fit: "Partial",
        note: "The same for Java.",
      }
    ],
    gap: "Nothing checks prose docs or AGENTS.md against the code. That check is custom.",
  }
};

export function recommendationsFor(filter: { station?: StationId; stage?: AdoptionStage }): Recommendation[] {
  return RECOMMENDATIONS.filter(
    (r) => (!filter.station || r.station === filter.station) && (!filter.stage || r.stage === filter.stage),
  );
}
