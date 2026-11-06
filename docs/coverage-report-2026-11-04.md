# Guide coverage report, 4 November 2026

Audit for [#73](https://github.com/adamsuk/line/issues/73). It checks `guide.json` (built from `src/factory/model.ts` and `src/factory/audit.ts`) against the station prose and the audit prompt. #72 (station 01 asks the owner questions) was already filed and is left out.

Categories: **A** prose versus recommendations, **B** recommendations versus audit, **C** missing practices, **D** structure.

## Fixed in this change

| Station | Cat. | Finding | Fix | Sources |
|---|---|---|---|---|
| 01 Backlog | A | `guide.bot` says the triage agent drops duplicates and routes each issue. No recommendation. | `triage-routing` (Cutting edge) | Iusztin, Osmani |
| 03 Bench | A | `guide.bot` says small work orders labelled for the factory. No recommendation. | `small-work-orders` (Cutting edge) | Savkin, Iusztin, DORA small batches |
| 03 Bench | A | `guide.bot` says a separate QA agent tries to break the change. No recommendation. | `qa-agent` (Cutting edge) | Iusztin, Savkin |
| 05 Review | A | `guide.bot` says an adversarial review agent runs in the background. Only measuring the bot was a recommendation, not having one. | `background-review-agent` (Cutting edge) | Savkin (review), CRBugBench |
| 08 Observe | A | `guide.bot` says a monitoring agent turns alerts into tasks. No recommendation. | `signal-to-work-order` (Cutting edge) | Iusztin, Osmani |
| 09 Return | A | `guide.bot` says a record agent writes down what happened. No recommendation. | `record-what-happened` (Cutting edge) | Savkin, Iusztin |
| 02 Source | A, B | Prose says "main only moves through the gate and review", and the audit already looks for "no direct pushes", yet no recommendation said to protect the default branch. | `protect-default-branch` (Best practice) | GitHub Docs, CodeRabbit (AI governance for coding agents) |
| 06 Artifact, 07 Release | A | Prose in both stations says build once, seal a digest, and promote the same bytes rather than recompiling. Only attestation was a recommendation; the base idea had none. | `promote-not-rebuild` (Best practice, filed under Artifact; its text covers Release's "promotion moves the same bytes" too) | MinimumCD/DojoConsortium (Immutable Artifacts), OneUptime (Build Once, Promote Everywhere) |
| 04 Gate | A, B | Prose says the gate runs on a clean machine from the snapshot. No recommendation for required checks on a clean runner plus a merge queue. | `clean-runner-merge-queue` (Best practice); closes [#74](https://github.com/adamsuk/line/issues/74) | GitHub Docs (hosted runners, merge queue), DORA CI |
| 01, 03, 05, 08, 09 | B | The new recommendations had no matching evidence line in the station's audit. | One `AUDIT_EVIDENCE` line each, so they reach the audit prompt | n/a |
| All | B | Nothing failed when a station's audit evidence was empty. | `src/factory/coverage.test.ts`, in `npm run test:factory` | n/a |
| All | D | Source URLs were only checked to be well-formed `https`. | `npm run check:links` and the scheduled `links.yml` workflow (not a required check). It caught one dead link before this merged: a GitLab docs page I'd first tried for `protect-default-branch`'s tools returned 404 live, so that tool entry was dropped and GitHub rulesets stands alone. | n/a |

The six Backlog/Bench/Review/Observe/Return recommendations are labelled Cutting edge because each rests on the guide's own already-cited pieces for that station, which are two or three practitioner posts, not independent studies. `protect-default-branch`, `promote-not-rebuild`, and `clean-runner-merge-queue` are Best practice: each cites independent, named sources (and verified live), not already in the guide. `promote-not-rebuild`'s two sources are both dated. `protect-default-branch` pairs one dated source (CodeRabbit, 23 June 2026) with GitHub's own "About protected branches" page, which the model records as Undated — authoritative and independent, but not a dated one. Every new recommendation names a tool or its gap.

## Deferred (need new sources; not invented here)

[#74](https://github.com/adamsuk/line/issues/74) is resolved: `clean-runner-merge-queue` is in the guide with sources (GitHub hosted runners, GitHub merge queue, DORA CI). The three gaps below remain filed as `factory:triage` sub-issues of #73 ([#75](https://github.com/adamsuk/line/issues/75), [#76](https://github.com/adamsuk/line/issues/76), [#77](https://github.com/adamsuk/line/issues/77)). The station prose or the audit evidence names each practice, but no source already in Line backs it and a short search for this report did not turn up two independent ones worth citing without more digging. Best practice needs at least two independent sources.

| Station | Cat. | Gap | Suggested label | Source to find | Issue |
|---|---|---|---|---|---|
| 03 Bench | A | `guide.human` says a person must be able to halt or redirect the agent. No recommendation. | Cutting edge | An agent-safety source on interrupt and kill switches | #75 |
| 08 Observe | C, B | Alerts, SLOs and monitors are in the audit evidence, but no recommendation says to define them. | Best practice | Google SRE book on SLOs, plus a DORA monitoring capability page | #76 |
| 09 Return | C, B | Postmortems are in the audit evidence. No recommendation for blameless postmortems on agent-caused incidents. | Best practice | Google SRE postmortem chapter, plus one more | #77 |

## Checked and clean

- **Structure (D):** every recommendation has a known station, stage and label, resolvable source ids, and either tools or a named gap (`model.test.ts`). Best practice cites at least two sources. All 93 source and tool URLs resolved live on 4 November 2026 (`npm run check:links`).
- **Artifact:** its `guide.bot` says no agent and `guide.human` says none, so no agent recommendation is expected there. It now has two recommendations (`attest-provenance`, `promote-not-rebuild`) and no open gap.
- **Audit prompt (B):** it lists every station's evidence and access lines, and `guide.json` carries the same lines per station. Evidence is written per station, not per recommendation, so the new test checks station level only.
- **Not re-graded:** existing Best practice and Cutting edge labels and the station thesis and lesson prose, as the work order excludes them.
