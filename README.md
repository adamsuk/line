# Line

A best practice guide to bringing agents into a software factory, and to where people stay in the loop. You can walk it. One change, work order CHK-184, moves through nine stations. People plan and approve. Agents build. The factory is not typing faster. It is how a change stays the same when someone else builds it, on a clean machine, and then listens to what production does.

Live at https://adamsuk.github.io/line/

## Where to read

Start here. These files are the factory. Everything else is the app shell that renders them.

| File | What it is |
|---|---|
| [src/factory/model.ts](src/factory/model.ts) | The nine stations, the work order, the objects that move, and the guide |
| [src/factory/store.ts](src/factory/store.ts) | How a change advances, and what a bad edit invalidates downstream |
| [src/components/line/stage.tsx](src/components/line/stage.tsx) | What you do at each station |
| [src/components/line/rail.tsx](src/components/line/rail.tsx) | The line itself |
| [src/components/line/parts.tsx](src/components/line/parts.tsx) | The glossary of parts |
| [src/components/line/guide.tsx](src/components/line/guide.tsx) | The adoption guide: which bot, when, and where people stay |
| [src/components/line/app.tsx](src/components/line/app.tsx) | The shell: walk, read the parts, or read the guide |
| [src/styles.css](src/styles.css) | Paper, ink, and steel |

## The nine stations

1. **Backlog**: A work order. Problem, who is hurt, and the checks that mean done.
2. **Source**: A branch off main, so the trunk stays shippable.
3. **Bench**: An agent builds the edit. Fast, and the least trustworthy station.
4. **Gate**: Lint, types, tests, and a build on a clean machine. Before any person reads it.
5. **Review**: A person reads the diff that passed the gate, not the intention.
6. **Artifact**: A sealed digest. This is what ships, not the branch.
7. **Release**: Preview, staging, and production run the same bytes.
8. **Observe**: Production talks back in errors and logs.
9. **Return**: The signal becomes the next work order.

Try the wrong edit on the bench. The gate sends it back before a person ever reads it. That is the point.

## Bringing agents in

Bring agents in a stage at a time. Start with the cheap checks and a review bot. Add more once people trust them. Keep a person where judgment matters.

| Stage | What to add |
|---|---|
| Start | Cheap checks on every snapshot and a review bot. Every team gains from these. Nothing ships without a person. |
| Next | Agents take small work orders that are labelled for the factory. They build in fresh workspaces. People still plan and approve. |
| Later | Agents help release, watch production, and record what happened. Keep a person wherever a wrong call is expensive. |

## Where people stay in the loop

| Station | Bot | Stage | Human in the loop |
|---|---|---|---|
| Backlog | A triage agent sorts incoming bugs, ideas, and incidents. It drops duplicates and routes each one. | Next | Product decides what gets built and writes the checks that mean done. Planning is where judgment pays most. |
| Source | An agent sets up a fresh workspace and cuts the branch for each work order. | Next | No one needs to touch this per change. People set the rule that main only moves through the gate and review. |
| Bench | A coding agent builds the change. A separate QA agent tries to break it. Start with small work orders labelled for the factory. | Next | Not at the bench. A person must still be able to step in, halt the agent, or redirect it. |
| Gate | CI runs lint, types, tests, and a build on every snapshot. Later a fixing agent can pick up a red check. | Start | People choose which checks exist. A check is worth trusting when it is cheap, runs every time, and is hard to fake. |
| Review | An adversarial review agent runs in the background. It looks for low-level bugs and API misuse, then writes a summary. | Start | The reviewer. Agents cannot explain a change to a person and are poor at architecture. A person reads the session, talks to the agent, and approves. |
| Artifact | No agent. The build tool seals the version and digest. | Start | None per change. Nothing here needs judgment. |
| Release | CD promotes the sealed digest to staging, then production. | Later | A person checks before production. Keep that check wherever a wrong call is expensive, like auth, billing, or a public API. |
| Observe | A monitoring agent turns alerts, errors, and incidents into new tasks for triage. | Later | On call. A person owns the consequences when production is wrong. |
| Return | A record agent writes down what actually happened, so the next change starts from it. | Later | Product decides whether the signal becomes the next work order. |

## Built on

Line started from these four pieces.

| Piece | What Line took from it |
|---|---|
| [Software Factories, Light and Dark](https://addyosmani.com/blog/software-factories/). Addy Osmani, AddyOsmani.com, 20 July 2026 | The closed loop from intent to production signal and back. Verification, not generation, is the bottleneck. |
| [Inside a Software Factory](https://www.oreilly.com/radar/inside-a-software-factory/). Paul Iusztin, O'Reilly Radar, 4 September 2026 | The factory as stages of the lifecycle, and where the human belongs in it. |
| [A Software Factory Is a Workflow, Not a Product. Build One in 20 Minutes.](https://nx.dev/blog/software-factory-workflow-not-product) Victor Savkin, Nx Blog, 6 August 2026 | The factory is ordinary steps wired together. Record what happened once it has. |
| [Building Interactive Agentic Code Reviews in 20 Minutes](https://nx.dev/blog/building-interactive-agentic-code-reviews). Victor Savkin, Nx Blog, 12 August 2026 | A review bot pre-reviews in the background. The person reviews the session and talks to the agent. |

## Run it

```bash
npm install
npm run dev
```

The dev server listens on port 8080.
