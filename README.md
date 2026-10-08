# Line

A software factory you can walk. One change, work order CHK-184, moves through nine stations. The factory is not typing faster. It is how a change stays the same when someone else builds it, on a clean machine, and then listens to what production does.

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

1. **Backlog** — a work order. Problem, who is hurt, and the checks that mean done.
2. **Source** — a branch off main, so the trunk stays shippable.
3. **Bench** — the edit. Fast, and the least trustworthy station.
4. **Review** — the diff, not the intention.
5. **Gate** — lint, types, tests, and a build on a clean machine.
6. **Artifact** — a sealed digest. This is what ships, not the branch.
7. **Release** — preview, staging, and production run the same bytes.
8. **Observe** — production talks back in errors and logs.
9. **Return** — the signal becomes the next work order.

Try the wrong edit on the bench. Review and the gate send it back. That is the point.

## Run it

```bash
npm install
npm run dev
```

The dev server listens on port 8080.
