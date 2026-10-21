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
      "A diff is the only thing that changed: removed lines, added lines, nothing else. Approval is the last call before the change is sealed. It is not a compliment. The agent that wrote the change is the worst judge of it.",
    sources: ["osmani", "iusztin"],
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

export type ReferenceId = "osmani" | "iusztin" | "savkin";

export interface Reference {
  id: ReferenceId;
  title: string;
  author: string;
  publication: string;
  date: string;
  url: string;
  took: string;
}

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
];

export function referenceById(id: ReferenceId): Reference {
  return REFERENCES.find((r) => r.id === id)!;
}
