# Line

A software factory you can walk. One change, work order CHK-184, moves through nine stations. People plan and approve. Agents build. The factory is not typing faster. It is how a change stays the same when someone else builds it, on a clean machine, and then listens to what production does.

Live at https://adamsuk.github.io/line/

## Where to read

Start here. These files are the factory. Everything else is the app shell that renders them.

| File | What it is |
|---|---|
| [src/factory/model.ts](src/factory/model.ts) | The nine stations, the work order, and the objects that move |
| [src/factory/store.ts](src/factory/store.ts) | How a change advances, and what a bad edit invalidates downstream |
| [src/components/line/stage.tsx](src/components/line/stage.tsx) | What you do at each station |
| [src/components/line/rail.tsx](src/components/line/rail.tsx) | The line itself |
| [src/components/line/parts.tsx](src/components/line/parts.tsx) | The glossary of parts |
| [src/components/line/app.tsx](src/components/line/app.tsx) | The shell: walk, or read the parts |
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

## Built on

Line started from these three pieces.

| Piece | What Line took from it |
|---|---|
| [Software Factories, Light and Dark](https://addyosmani.com/blog/software-factories/). Addy Osmani, AddyOsmani.com, 20 July 2026 | The closed loop from intent to production signal and back. Verification, not generation, is the bottleneck. |
| [Inside a Software Factory](https://www.oreilly.com/radar/inside-a-software-factory/). Paul Iusztin, O'Reilly Radar, 4 September 2026 | The factory as stages of the lifecycle, and where the human belongs in it. |
| [A Software Factory Is a Workflow, Not a Product. Build One in 20 Minutes.](https://nx.dev/blog/software-factory-workflow-not-product) Victor Savkin, Nx Blog, 6 August 2026 | The factory is ordinary steps wired together. Record what happened once it has. |

## Run it

```bash
npm install
npm run dev
```

The dev server listens on port 8080.
