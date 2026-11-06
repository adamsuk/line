# Changelog

All notable changes to Line are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Line is a live site with no version numbers, so each section is the date the change merged (YYYY-MM-DD, Europe/London).

Research-driven entries say what changed, why, and which sources back it. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 2026-11-06

### Added

- Six cutting-edge recommendations for practices the station prose already described but the audit never scored: the triage agent drops duplicates and routes issues (Backlog), small work orders labelled for the factory and a separate QA agent (Bench), a background adversarial review agent (Review), a monitoring agent that turns alerts into work orders (Observe), and a record agent that writes down what happened (Return). Each station's audit evidence has a matching line, so the audit prompt asks for it. Why: Line audits only what `guide.json` lists as a recommendation. Sources: the pieces the guide already cites for each station (Iusztin, Osmani, Savkin, DORA small batches, CRBugBench).
- Two best-practice recommendations for gaps the audit evidence already asked about but no recommendation covered: protect the default branch with a required pull request, passing checks and review (Source), and build the artifact once and promote the same digest through every environment instead of rebuilding (Artifact, and it closes the matching gap in Release's "promotion moves the same bytes" prose too). Sources: [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) (GitHub Docs, Undated), [AI governance for coding agents: policies and enforcement](https://www.coderabbit.ai/guides/ai-governance-coding-agents) (Brandon Gubitosa, CodeRabbit, 23 June 2026), [Immutable Artifacts](https://beyond.minimumcd.org/docs/pipeline/immutable-artifacts/) (MinimumCD and DojoConsortium, last updated 8 October 2026), [Build Once, Promote Everywhere: Stop Rebuilding Artifacts per Environment](https://oneuptime.com/blog/post/2026-07-28-build-once-promote-everywhere/view) (Nawaz Dhandala, OneUptime, 28 July 2026).
- A coverage report, `docs/coverage-report-2026-11-04.md`, with findings per station and per category. Four gaps were filed as sub-issues of #73; [#74](https://github.com/adamsuk/line/issues/74) was resolved earlier by [#81](https://github.com/adamsuk/line/pull/81) (`clean-runner-merge-queue`), while [#75](https://github.com/adamsuk/line/issues/75), [#76](https://github.com/adamsuk/line/issues/76), and [#77](https://github.com/adamsuk/line/issues/77) still need a credible source.
- A test that fails when a station's audit evidence or access is empty, or missing from the audit prompt or `guide.json`.
- `npm run check:links` and a weekly, non-required `links.yml` workflow that check every source and tool URL resolves. It caught one dead link in review before this merged (a GitLab docs page), which is why `protect-default-branch` cites GitHub rulesets alone. (adamsuk/line#73)

## 2026-11-05

### Added

- A required `Target repository` field at the top of the Task issue form, prefilled with `Target repo: owner/repo`, so every form-filed task names the single repository it lands in before station 01 marks it ready. It matches the gh-factory baseline form. (adamsuk/software-factory#110)

## 2026-11-04

### Added

- A Best practice Backlog recommendation, `ask-before-building`: when a ticket is ambiguous or its done-checks are missing, the triage agent asks the owner targeted questions, ideally as quick multiple-choice answers, and records the answers on the ticket before it is marked ready. It does not guess. The Backlog audit question on refusing work now assesses clarification as well as checks, so it only counts as covered when an ambiguous ticket is sent back for the owner's answers first, and the question on treating issue text as data now counts writing those answers to the ticket as a controlled write, not as taking orders from the issue. The Backlog audit evidence asks whether triage has a clarifying-questions step and whether questions and answers are recorded on the issue. GitHub Spec Kit's `/clarify` command is a partial fit: it asks and records answers, but in the spec, not the ticket. Why: nothing in the guide told the triage agent to raise ambiguity with the owner, so the audit could never flag its absence, and the rubric had to catch up once it could. Stored audit answers are cleared because the rubric change can flip what an existing answer means. Sources: [Ambig-SWE: Interactive Agents to Overcome Underspecificity in Software Engineering](https://arxiv.org/abs/2502.13069) (arXiv, 18 February 2025), [ClarifyGPT: Empowering LLM-based Code Generation with Intention Clarification](https://arxiv.org/abs/2310.10996) (arXiv, 17 October 2023). (#72)
- A Gate recommendation: run the required checks on a fresh runner from the snapshot, not in the agent's sandbox, and use a merge queue so each change is checked against the latest base and the changes queued ahead of it before it merges. GitHub's merge queue, Trunk Merge Queue and Mergify are a partial fit: they do not run checks on a clean runner. The Gate audit evidence already asks which checks are required and whether a merge queue is used, and now also asks about a clean runner, so `audit.ts` records `clean-runner-merge-queue` in its gate-refuse recommendations. Why: the Gate's thesis names a clean machine, but no card covered it or the queue. Sources: [Managing a merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) (GitHub Docs, Undated), [GitHub-hosted runners](https://docs.github.com/en/actions/concepts/runners/github-hosted-runners) (GitHub Docs, Undated), [Capabilities: Continuous integration](https://dora.dev/capabilities/continuous-integration/) (DORA, Undated). (adamsuk/line#74)

## 2026-11-03

### Changed

- Pinned `step-security/harden-runner` (v2.22.3, `egress-policy: audit`) as the first step of every job in the test, pages (build and deploy), CodeQL and changelog workflows, at the same commit as gh-factory's `ci.yml`. Audit mode records outbound traffic without blocking it. (adamsuk/software-factory#223)

### Added

- A cutting-edge Observe recommendation: before merge, record the behaviour the change should produce as a small check, such as a request and the response it should return, then run that same check after the deploy and close the work order only when it passes. A green run, a closed issue, or a finished deploy does not by itself show the change works. The Observe question on a missed outcome reopening the work order now links this card as well as factory measurement. No product feature was found for that close rule, so the card names the gap. Why: a green run, a closed issue, or a finished deploy can all report success while the change is broken. Source: [AI coding agent mistakes: what broke and the lessons learned](https://www.andrewconnell.com/articles/ai-coding-agent-mistakes-lessons-learned/) (andrewconnell.com, 30 October 2026). ([#68](https://github.com/adamsuk/line/pull/68))
- A cutting-edge Source recommendation: each agent run gets a fresh sandbox and a token scoped only to the repos that task needs. The token expires within about an hour, and nothing from the run carries into the next one. Every tool call is seen by a policy check, and there is no general-purpose shell, HTTP, or eval tool that can bypass that check. No listed product does all three, so the card names that gap. The Source audit question on production secrets now links to it as well as the sandbox with no production secrets. Why: one engineering post, plus the OWASP guidance on ephemeral credentials already in Line, is not enough to call it best practice. Sources: [How We Gave AI Agents the Keys to Production and Still Sleep at Night](https://engineering.monday.com/how-we-gave-ai-agents-the-keys-to-production-and-still-sleep-at-night/) (monday AI engineering, 26 October 2026), [Secure Coding with AI Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html) (OWASP Cheat Sheet Series, Undated). ([#69](https://github.com/adamsuk/line/pull/69))

## 2026-10-27

### Added

- A pull-request check named `test` that runs typecheck, lint and the factory tests, and a factory config that records that command for later builders. `npm test` stays out of CI until the failures tracked in #62 are fixed. The check runs with `persist-credentials: false`, and the empty catch in the token-hashing fallback now explains why it ignores an unparseable payload, so lint passes. Why: the Pages build ran the factory tests, but a builder had no recorded command for typecheck, lint and those tests together.

### Changed

- The changelog check now skips Dependabot pull requests, because dependency bumps carry no changelog entry and were all failing CI.

## 2026-10-26

### Added

- A cutting-edge Review recommendation: start review from a short record, not the diff. It names the agreed behaviour, the checks that ran on this commit, any behaviour nobody asked for, and how far a mistake would reach. No tool builds it yet, so the card names that gap. The Review audit question on what evidence the reviewer reads now links to it. Why: two independent October pieces converge on evidence-first review as agents outpace reviewers, and the audit question had no recommendation behind it. Sources: [Code Review After Code Gets Cheap](https://www.oreilly.com/radar/code-review-after-code-gets-cheap/) (O'Reilly Radar, 16 October 2026), [Redesign how your team ships software with AI agents](https://about.gitlab.com/blog/redesign-how-your-team-ships-software-with-ai-agents/) (GitLab Blog, 20 October 2026). ([#48](https://github.com/adamsuk/line/pull/48))

## 2026-10-25

### Added

- A cutting-edge Review recommendation: let agents open only as many PRs as people can read, track time to first review and reviewer load, and slow the agents before review turns into silent approval. DX and Swarmia are partial tools. Why: agents now write faster than people review, and the queue grows quietly. Sources: [State of AI Impact in Engineering: Q3 Report](https://getdx.com/report/state-of-ai-impact-in-engineering-q3-report/) (DX, Q3 2026 data), [AI Writes Faster Than Humans Can Review](https://arxiv.org/abs/2607.01904) (2 July 2026), and as a counterpoint [Mockus and others, ESEM 2026](https://drops.dagstuhl.de/storage/00lipics/lipics-vol394-esem2026/LIPIcs.ESEM.2026.93/LIPIcs.ESEM.2026.93.pdf) (September 2026). ([#46](https://github.com/adamsuk/line/pull/46))
- A cutting-edge Bench recommendation: keep tests out of the agent's reach. A change that edits, skips, or deletes an existing test goes to a person, and the gate counts a skipped test as a fail. CODEOWNERS and GitHub rulesets are partial tools. Why: agents pass by changing the tests that judge them, and their summaries still read green. Sources: [ImpossibleBench](https://arxiv.org/abs/2510.20270) (23 October 2025), [hacktrace](https://arxiv.org/abs/2610.03055) (2 October 2026), [Who Holds the Pen?](https://arxiv.org/abs/2609.29921) (24 September 2026). ([#46](https://github.com/adamsuk/line/pull/46))
- An audit question at Release: how long does a rollback take, measured? A gap opens progressive release and the human release gate. Why: the audit asked whether anyone can roll back, not how fast. ([#46](https://github.com/adamsuk/line/pull/46))
- Five new sources in Further reading, each dated. ([#46](https://github.com/adamsuk/line/pull/46))
- A homepage that leads with the thesis: a change moves only on evidence, never on a claim, and when a station fails it, people fix the line, not just the change. It has a short why a line paragraph and two ways in: Walk the line (unchanged) and Audit your setup. Line now opens on the homepage, and Start over returns to the walk. Why: the site opened straight into the walk and never said what it argues. ([#42](https://github.com/adamsuk/line/pull/42))
- Audit your setup: five setup questions (intent, outcome signal, harness, instruction files, who can stop the line), then two to four questions per station, each with a covered, partial and gap rule. A gap opens that station's existing recommendations and tools. A summary scores each station and names the weakest. Answers stay in this browser's localStorage, with no sharing or export. Why: Scott wanted a way to check a real setup against Line. The questions reuse the recommendations already in the guide, so nothing is added or copied. ([#42](https://github.com/adamsuk/line/pull/42))

### Changed

- The Gate audit's first question now asks whether merge reads the required checks' result from CI, not the agent's summary or the PR text, and a skipped check counts as red. The Review audit's scale question now also asks about time to first review, reviewer load and a cap on agent PRs. Both are folded into existing questions because each station keeps two to four. Why: an agent's summary can read done when the checks did not pass. ([#46](https://github.com/adamsuk/line/pull/46))
- Three tabs instead of five: Home, Walk the line and The guide. The parts now sit on Home below the hero, and Audit your setup is a labelled section at the end of the guide, with an entry card at the top. The view is kept in the URL hash, and #parts and #audit open the section where that content now lives. Why: Scott found too many options, and on a phone the tab bar wrapped to two rows. It now fits one row at 390px and up. ([#44](https://github.com/adamsuk/line/pull/44))
- The guide's recommendation cards now list suggested tools, the same list the station cards in the walk show. Why: Scott asked for suggested tools in the guide, and only the walk had them. ([#40](https://github.com/adamsuk/line/pull/40))

## 2026-10-24

### Added

- Assess your setup with an LLM: a collapsed section in the guide with a read-only audit prompt, a scoring rubric, and MCP servers to connect. The site now serves guide.json, llms.txt, and llms-full.txt, built from the page's data and versioned by this changelog. Cutting edge. Sources: [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28), [llms.txt v2](https://llmstxt.org/). ([#36](https://github.com/adamsuk/line/pull/36))
- A cutting-edge Return recommendation to audit the whole setup with a read-only agent over MCP, with GitHub MCP Server and Datadog MCP Server as partial tools. ([#36](https://github.com/adamsuk/line/pull/36))
- A collapsed Changelog section on the site, built from this file at build time so it never drifts. The latest three dates show, with older ones behind a second toggle. ([#32](https://github.com/adamsuk/line/pull/32))
- This changelog, backfilled from the merged PRs. Every PR now adds an entry, with a PR template checkbox and a CI check (skip with the `skip-changelog` label). ([#30](https://github.com/adamsuk/line/pull/30))

### Changed

- The audit prompt's per-station lists read mid-sentence: each item starts lowercase unless it is a name like CI or GitHub. ([#38](https://github.com/adamsuk/line/pull/38))
- The Tools section marks each tool with the stations it covers, full or partial, and filters by station to show how each tool helps there. Ratings come from the existing per-recommendation fits, so no new claims. ([#34](https://github.com/adamsuk/line/pull/34))

## 2026-10-23

### Added

- Link the blog post on how Line was researched from the README. ([#22](https://github.com/adamsuk/line/pull/22))

## 2026-10-22

Research update.

### Added

- Artifact and Release recommendations: attest each build's provenance (cutting edge), progressive release and a human release gate (best practice). ([#24](https://github.com/adamsuk/line/pull/24))
- A Tools section on the site and in the README, with every link re-checked on 22 Oct 2026. ([#24](https://github.com/adamsuk/line/pull/24))
- A View on GitHub link in the header. ([#20](https://github.com/adamsuk/line/pull/20))
- The footer shows the deployed commit's date and sha. ([#28](https://github.com/adamsuk/line/pull/28))

### Changed

- Review bot benchmarking moved back from best practice to cutting edge. Factory measurement now cites DORA 2025, DORA ROI, DX LXD3 2026 and the post-merge fate study, and drops CRBugBench. ([#24](https://github.com/adamsuk/line/pull/24))
- Split two broad recommendations into smaller ones (spec sign-off and checks; self-healing CI into triage, fix as PR, cap the fix loop, and hand off to a person). Labels and sources kept. ([#24](https://github.com/adamsuk/line/pull/24))
- Each station's recommendation cards show their tools, and the bottom tools list is slimmer. ([#26](https://github.com/adamsuk/line/pull/26))

## 2026-10-21

Research update: Line became a guide to bringing agents into a software factory, with labelled, sourced recommendations.

### Added

- The guide: which bot to bring in at each station, at which stage (Start, Next, Later), and where a person stays in the loop. ([#10](https://github.com/adamsuk/line/pull/10))
- Each recommendation is labelled best practice or cutting edge, with a Guardrails stage and a Further reading list. Best practice needs at least two sources. ([#12](https://github.com/adamsuk/line/pull/12))
- Credit the software factory pieces Line is built on. ([#6](https://github.com/adamsuk/line/pull/6))
- Deploy Line to GitHub Pages, and link the live site from the README. ([#2](https://github.com/adamsuk/line/pull/2), [#4](https://github.com/adamsuk/line/pull/4))

### Changed

- Four cutting-edge recommendations tightened from October sources, with five dated sources added to Further reading. ([#16](https://github.com/adamsuk/line/pull/16))
- Review bot benchmarking promoted to best practice (IronBee added). Harness evals stay cutting edge, now citing PACE-Bench and Cortex. ([#18](https://github.com/adamsuk/line/pull/18))
- Built on and Further reading are collapsed by default, so the page stays easy to read. ([#14](https://github.com/adamsuk/line/pull/14))
- The gate runs before review, and agents build. ([#8](https://github.com/adamsuk/line/pull/8))

## 2026-10-08

### Added

- Line, a walkable software factory: one work order moving through nine stations.
