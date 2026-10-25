# Changelog

All notable changes to Line are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Line is a live site with no version numbers, so each section is the date the change merged (YYYY-MM-DD, Europe/London).

Research-driven entries say what changed, why, and which sources back it. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 2026-10-25

### Added

- A homepage that leads with the thesis: a change moves only on evidence, never on a claim, and when a station fails it, people fix the line, not just the change. It has a short why a line paragraph and two ways in: Walk the line (unchanged) and Audit your setup. Line now opens on the homepage, and Start over returns to the walk. Why: the site opened straight into the walk and never said what it argues. ([#42](https://github.com/adamsuk/line/pull/42))
- Audit your setup: five setup questions (intent, outcome signal, harness, instruction files, who can stop the line), then two to four questions per station, each with a covered, partial and gap rule. A gap opens that station's existing recommendations and tools. A summary scores each station and names the weakest. Answers stay in this browser's localStorage, with no sharing or export. Why: Scott wanted a way to check a real setup against Line. The questions reuse the recommendations already in the guide, so nothing is added or copied. ([#42](https://github.com/adamsuk/line/pull/42))

### Changed

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
