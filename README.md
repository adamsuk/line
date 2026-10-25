# Line

A best practice guide to bringing agents into a software factory, and to where people stay in the loop. You can walk it. One change, work order CHK-184, moves through nine stations. People plan and approve. Agents build. The factory is not typing faster. It is how a change stays the same when someone else builds it, on a clean machine, and then listens to what production does.

Live at https://adamsuk.github.io/line/

How it was researched: [Researching a Software Factory with Grok](https://sradams.co.uk/blog/researching-a-software-factory-with-grok)

What changed and why: [CHANGELOG.md](CHANGELOG.md). Every PR adds an entry; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Where to read

Start here. These files are the factory. Everything else is the app shell that renders them.

| File | What it is |
|---|---|
| [src/factory/model.ts](src/factory/model.ts) | The nine stations, the work order, the objects that move, and the guide |
| [src/factory/store.ts](src/factory/store.ts) | How a change advances, and what a bad edit invalidates downstream |
| [src/components/line/stage.tsx](src/components/line/stage.tsx) | What you do at each station |
| [src/components/line/rail.tsx](src/components/line/rail.tsx) | The line itself |
| [src/components/line/parts.tsx](src/components/line/parts.tsx) | The glossary of parts, on the homepage below the hero |
| [src/components/line/home.tsx](src/components/line/home.tsx) | The homepage: the thesis, why a line, and the two ways in |
| [src/factory/self-audit.ts](src/factory/self-audit.ts) | Audit your setup: the questions, their covered, partial and gap rules, and the scoring |
| [src/components/line/audit-setup.tsx](src/components/line/audit-setup.tsx) | The audit, at the end of the guide, and its per-station summary |
| [src/components/line/guide.tsx](src/components/line/guide.tsx) | The adoption guide: which bot, when, and where people stay |
| [src/components/line/recommendations.tsx](src/components/line/recommendations.tsx) | The labelled recommendations: best practice or cutting edge |
| [src/components/line/app.tsx](src/components/line/app.tsx) | The shell: three tabs, Home, Walk the line and The guide |
| [src/factory/routes.ts](src/factory/routes.ts) | Hash routes: #walk, #guide, and #parts and #audit for the sections that used to be tabs |
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

Bring agents in a stage at a time. Start with the cheap checks and a review bot. Put the guardrails up before any coding agent writes code. Add more once people trust them. Keep a person where judgment matters.

| Stage | What to add |
|---|---|
| Start | Cheap checks on every snapshot and a review bot. Every team gains from these. Nothing ships without a person. |
| Guardrails | Before any coding agent writes code. Agents run in a sandbox with no secrets and a short list of hosts they can reach. Their writes are staged and checked. Their instruction files are owned and reviewed like code. |
| Next | Agents take small work orders that are labelled for the factory. They build in fresh workspaces inside the guardrails. People still plan and approve. |
| Later | Agents help release, watch production, and record what happened. Keep a person wherever a wrong call is expensive. |

## Where people stay in the loop

| Station | Bot | Stage | Human in the loop |
|---|---|---|---|
| Backlog | A triage agent sorts incoming bugs, ideas, and incidents. It drops duplicates and routes each one. It reads issue text as untrusted input and takes no orders from it. | Next | Product decides what gets built and writes the checks that mean done. Planning is where judgment pays most. |
| Source | An agent sets up a fresh workspace and cuts the branch for each work order. The workspace is a sandbox with no production secrets. | Next | No one needs to touch this per change. People set the rule that main only moves through the gate and review. They own the sandbox rules too. |
| Bench | A coding agent builds the change. A separate QA agent tries to break it. Start with small work orders labelled for the factory. Its pushes and comments are staged, then checked. | Next | Not at the bench. A person must still be able to step in, halt the agent, or redirect it. |
| Gate | CI runs lint, types, tests, and a build on every snapshot. Later a fixing agent can sort a red check and open a fix as a PR. A new or risky failure goes to its owner. | Start | People choose which checks exist. A check is worth trusting when it is cheap, runs every time, and is hard to fake. An agent saying it is done is not a check. |
| Review | An adversarial review agent runs in the background. It looks for bugs and API misuse, then writes a summary. The PR description can mislead it. | Start | The reviewer. Agents cannot explain a change to a person and are poor at architecture. A person reads the session, talks to the agent, and approves. Review goes deeper as the change gets bigger or riskier. |
| Artifact | No agent. The build tool seals the version and digest. | Start | None per change. Nothing here needs judgment. |
| Release | CD promotes the sealed digest to staging, then production. | Later | A person checks before production. Keep that check wherever a wrong call is expensive, like auth, billing, or a public API. |
| Observe | A monitoring agent turns alerts, errors, and incidents into new tasks for triage. | Later | On call. A person owns the consequences when production is wrong. |
| Return | A record agent writes down what actually happened, so the next change starts from it. | Later | Product decides whether the signal becomes the next work order. |

## Recommendations, labelled

Agent tooling is changing fast. Each recommendation carries one of two labels, so you can tell settled practice from newer ideas.

- **Best practice**: Well established. Several independent sources say it, and teams widely do it.
- **Cutting edge**: Newer. The evidence is mostly one recent paper or survey, or tooling that is still emerging.

| Label | Station | Stage | Recommendation | Sources |
|---|---|---|---|---|
| Best practice | Backlog | Start | Write done as checks a machine can run. Vague criteria give an agent room to claim success. | [Spec-Driven Development: A Spec-First Approach to AI-Native Engineering](https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering/)<br>[Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921) |
| Best practice | Backlog | Next | Treat issue text as untrusted input. The triage agent reads it but takes no orders from it. | [Mitigating Indirect AGENTS.md Injection Attacks in Agentic Environments](https://developer.nvidia.com/blog/mitigating-indirect-agents-md-injection-attacks-in-agentic-environments/)<br>[AI Agent and MCP Security](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/) |
| Best practice | Source | Guardrails | Run agents in a sandbox with no production secrets. Isolation is the boundary, not a prompt. | [Under the hood: Security architecture of GitHub Agentic Workflows](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/)<br>[Practical Security Guidance for Sandboxing Agentic Workflows and Managing Execution Risk](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/)<br>[AI Agent and MCP Security](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/) |
| Best practice | Source | Guardrails | Let the sandbox reach only a short list of hosts. Block the rest of the network. | [Practical Security Guidance for Sandboxing Agentic Workflows and Managing Execution Risk](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/)<br>[Under the hood: Security architecture of GitHub Agentic Workflows](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/)<br>[AI Agent and MCP Security](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/) |
| Best practice | Bench | Guardrails | Stage the agent's writes. Pushes, PRs, and comments pass a check with limits before they land. | [Under the hood: Security architecture of GitHub Agentic Workflows](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/)<br>[AI Agent and MCP Security](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/) |
| Best practice | Bench | Guardrails | Put AGENTS.md and other instruction files under code owners. Review a change to them like a change to code. | [AI Agent and MCP Security](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/)<br>[Mitigating Indirect AGENTS.md Injection Attacks in Agentic Environments](https://developer.nvidia.com/blog/mitigating-indirect-agents-md-injection-attacks-in-agentic-environments/)<br>[Beyond source code: The files AI coding agents trust — and attackers exploit](https://cloud.google.com/blog/products/identity-security/beyond-source-code-the-files-ai-coding-agents-trust-and-attackers-exploit) |
| Cutting edge | Bench | Guardrails | Keep tests out of the agent's reach. A change that edits, skips, or deletes an existing test goes to a person, and the gate counts a skipped test as a fail. | [ImpossibleBench: Measuring LLMs' Propensity of Exploiting Test Cases](https://arxiv.org/abs/2510.20270)<br>[hacktrace: behavior-supervised detection of reward hacking during code generation](https://arxiv.org/abs/2610.03055)<br>[Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921) |
| Best practice | Gate | Start | An agent saying it is done is not evidence. Only the gate's checks count. | [Software Factories, Light and Dark](https://addyosmani.com/blog/software-factories/)<br>[Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921)<br>[Under the hood: Security architecture of GitHub Agentic Workflows](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/) |
| Cutting edge | Gate | Later | Let the spec sign off, not the agent. Checks drawn from the work order decide whether the change is done. | [Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921) |
| Cutting edge | Gate | Later | Run those checks again whenever the code or data they depend on changes. | [Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921) |
| Cutting edge | Gate | Later | A person checks the checks against the work order. Agents tend to write checks that copy their code, not the spec. | [SpecGuardBench: Can Coding Agents Construct Reliable Validation Harnesses from Natural Language Specifications?](https://arxiv.org/abs/2610.16870)<br>[Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921) |
| Cutting edge | Gate | Later | A fixing agent sorts each red check first: whose problem it is, and whether it has been seen before. A new or risky failure goes to its owner. | [How to build self-healing CI pipelines](https://newsletter.port.io/p/how-to-build-self-healing-ci-pipelines) |
| Cutting edge | Gate | Later | The fixing agent opens its fix as a PR. It goes through the gate and review like any other change. | [How to build self-healing CI pipelines](https://newsletter.port.io/p/how-to-build-self-healing-ci-pipelines) |
| Cutting edge | Gate | Later | Cap the fixing agent's attempts, and let it try again only on a new failure. | [CI Failure to Fix: The AI Agent CI Loop That Doesn't Thrash](https://automater.ai/intel/ci-agent-fix-loop-guards/) |
| Cutting edge | Gate | Later | Send any fix that touches tests, CI config, or lockfiles to a person. | [CI Failure to Fix: The AI Agent CI Loop That Doesn't Thrash](https://automater.ai/intel/ci-agent-fix-loop-guards/) |
| Best practice | Review | Start | Keep PRs small. Scale how deeply a person reviews to the size and risk of the change. | [(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection](https://arxiv.org/abs/2610.13668)<br>[Capabilities: Working in small batches](https://dora.dev/capabilities/working-in-small-batches/) |
| Best practice | Review | Start | A named person approves. Agent review does not replace it, and no agent approves its own change. | [Secure Coding with AI Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html)<br>[AI Agent and MCP Security](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/)<br>[(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection](https://arxiv.org/abs/2610.13668) |
| Cutting edge | Review | Next | Let agents open only as many PRs as people can read. Track time to first review and reviewer load, and slow the agents before review turns into silent approval. One large study found AI code reviewed faster, so measure your own. | [State of AI Impact in Engineering: Q3 Report](https://getdx.com/report/state-of-ai-impact-in-engineering-q3-report/)<br>[AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2x Mandate](https://arxiv.org/abs/2607.01904)<br>[A Preliminary Analysis of the Impact of AI Assisted/Generated Code on Quality, Centrality and Review Time at Scale](https://drops.dagstuhl.de/storage/00lipics/lipics-vol394-esem2026/LIPIcs.ESEM.2026.93/LIPIcs.ESEM.2026.93.pdf) |
| Cutting edge | Review | Next | Track how often people accept the review bot's comments, and test it on bugs you already know. The PR description can mislead it, so read its summary as a claim. Test it again when the model changes. Rankings move within months. Several independent benchmarks back this, but wide adoption is not shown yet. | [(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection](https://arxiv.org/abs/2610.13668)<br>[Is Agentic Code Review Helpful? Mining Developers' Feedback to CodeRabbit Reviews in the Wild](https://arxiv.org/abs/2607.03316)<br>[ReviewBench: An open benchmark for AI code review](https://github.blog/ai-and-ml/github-copilot/reviewbench-an-open-benchmark-for-ai-code-review/)<br>[Martian's Code Review Bench: the "#1" claim rots in months](https://aicodereview.io/blog/martians-code-review-bench-the-1-claim-rots-in-months/)<br>[The Honest Raw LLM Code Review Benchmark: 21 Models, 7,980 Reviews, Every Number Open](https://ironbee.ai/blog/the-honest-raw-llm-code-review-benchmark) |
| Cutting edge | Artifact | Next | Attest each build: a signed record that ties the digest to its commit and workflow. Verify it before you promote. The SLSA standard is mature, but most projects do not do this yet. | [Artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations)<br>[Strengthen your supply chain with code-to-cloud traceability and SLSA Build Level 3 security](https://github.blog/changelog/2026-01-20-strengthen-your-supply-chain-with-code-to-cloud-traceability-and-slsa-build-level-3-security/)<br>[Two years after npm shipped build provenance, 78% of a typical dependency tree still doesn't use it](https://zennoxa.com/research/npm-provenance-census-2026) |
| Best practice | Release | Later | Separate deploy from release. Turn a change on for a small share of users first, widen it on a named signal, and roll back automatically when a guardrail breaks. | [Releasing AI-written changes: flags, canaries and rollback](https://reveneau.com/guides/ai-native-delivery/progressive-delivery-for-ai-written-changes)<br>[More Code, Fewer Deployments: Why Progressive Delivery Is the Missing Half of Your AI Coding Strategy](https://stepto.net/blog/progressive-delivery-feature-flags-ai-generated-code-release-safety-2026)<br>[Announcing the 2025 DORA Report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) |
| Best practice | Release | Later | A named person approves promotion to production where a wrong call is expensive, like auth, billing, data migrations, or a public API. Anyone on call can roll back without a second approval, and the rollback is practised. | [Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)<br>[Releasing AI-written changes: flags, canaries and rollback](https://reveneau.com/guides/ai-native-delivery/progressive-delivery-for-ai-written-changes)<br>[Inside a Software Factory](https://www.oreilly.com/radar/inside-a-software-factory/) |
| Best practice | Observe | Start | Measure change failure rate, rework, and recovery time before agents arrive and after. Expect throughput to rise before stability does. Count cost per change too, though little published evidence measures it yet. | [Announcing the 2025 DORA Report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)<br>[ROI of AI-assisted Software Development](https://dora.dev/ai/roi/report/)<br>[State of AI in Software Development](https://leaddev.com/wp-content/uploads/2026/06/LXD3-2026-AI-in-the-SDLC.pdf)<br>[Do These Violent Delights Have Violent Ends? Measuring the Post-Merge Fate of Agentic Code](https://arxiv.org/abs/2607.09902) |
| Cutting edge | Observe | Next | Test the agent setup like code. Run small behavioural evals when a prompt, tool, or model changes, and track the pass rate over time. Keep a prompt or rule change only when replayed evals show it helps and breaks no task. | [The Anatomy of Harness Engineering: How to Evaluate, Iterate, and Guard AI Coding Agents](https://developers.googleblog.com/en/the-anatomy-of-harness-engineering-how-to-evaluate-iterate-and-guard-ai-coding-agents/)<br>[(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection](https://arxiv.org/abs/2610.13668)<br>[When Coding Agents Outpace Review: Evaluating PRD-Driven Development in Mature Enterprise Repositories](https://arxiv.org/abs/2610.26394)<br>[Cortex: Measurement-Gated Evolution and Pruning of Coding-Agent Skills and Rules](https://arxiv.org/abs/2610.14216) |
| Cutting edge | Return | Later | Check that the docs agents build from still match the code. Record the drift as the next work order. Make the check deterministic, so it can refuse a drifting commit. | [Spec-driven development and spec drift: 335 repositories surveyed](https://striff.io/blog/architecture-matters-more-not-less/)<br>[Spec-Driven Development: A Spec-First Approach to AI-Native Engineering](https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering/)<br>[Implementing the Spec Growth Engine: Preventing Spec-Code Divergence, and Growing the Spec with Agents](https://arxiv.org/abs/2610.11725) |
| Cutting edge | Return | Later | Audit the whole setup against this guide with a read-only agent connected over MCP. It scores each recommendation with evidence and lists quick wins and biggest gains. People decide which gaps become work orders. | [Model Context Protocol Specification, version 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)<br>[The /llms.txt file, v2](https://llmstxt.org/) |

## Tools

Every tool named in the guide, checked on 22 October 2026. This is not an endorsement. Each station's recommendations on the site show which tools fit, how fully, and the gap left.

- [ArchUnit](https://www.archunit.org)
- [Argo Rollouts](https://argoproj.github.io/rollouts/)
- [attest-build-provenance](https://github.com/actions/attest-build-provenance)
- [Braintrust](https://www.braintrust.dev)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [CodeRabbit dashboard](https://docs.coderabbit.ai/guides/dashboard)
- [Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review)
- [Copilot coding agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)
- [Copilot coding agent firewall](https://docs.github.com/en/copilot/customizing-copilot/customizing-or-disabling-the-firewall-for-copilot-coding-agent)
- [Cucumber](https://cucumber.io)
- [Datadog MCP Server](https://docs.datadoghq.com/bits_ai/mcp_server/)
- [Daytona](https://www.daytona.io)
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)
- [DX](https://getdx.com)
- [E2B](https://e2b.dev)
- [Faros AI](https://www.faros.ai)
- [Flagger](https://flagger.app)
- [Gitar](https://gitar.ai)
- [GitHub Agentic Workflows](https://github.github.com/gh-aw/)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [GitHub environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Graphite](https://graphite.dev)
- [Inspect AI](https://inspect.aisi.org.uk)
- [Kiro](https://kiro.dev)
- [Lakera Guard](https://www.lakera.ai/lakera-guard)
- [LaunchDarkly guarded rollouts](https://launchdarkly.com/docs/home/releases/guarded-rollouts)
- [Martian Code Review Bench](https://github.com/withmartian/code-review-benchmark)
- [Mergify](https://mergify.com)
- [Nx affected](https://nx.dev/ci/features/affected)
- [Nx Cloud self-healing CI](https://nx.dev/ci/features/self-healing-ci)
- [Promptfoo](https://www.promptfoo.dev)
- [PullApprove](https://www.pullapprove.com)
- [PurpleLlama (Prompt Guard)](https://github.com/meta-llama/PurpleLlama)
- [Sigstore cosign](https://github.com/sigstore/cosign)
- [slsa-github-generator](https://github.com/slsa-framework/slsa-github-generator)
- [StepSecurity Harden-Runner](https://github.com/step-security/harden-runner)
- [Stryker](https://stryker-mutator.io)
- [Swarmia](https://www.swarmia.com)
- [Trunk Flaky Tests](https://trunk.io/flaky-tests)
- [Trunk Merge Queue](https://trunk.io/merge-queue)

## Built on

Line started from these four pieces.

| Piece | What Line took from it |
|---|---|
| [Software Factories, Light and Dark](https://addyosmani.com/blog/software-factories/). Addy Osmani, AddyOsmani.com, 20 July 2026 | The closed loop from intent to production signal and back. Verification, not generation, is the bottleneck. |
| [Inside a Software Factory](https://www.oreilly.com/radar/inside-a-software-factory/). Paul Iusztin, O'Reilly Radar, 4 September 2026 | The factory as stages of the lifecycle, and where the human belongs in it. |
| [A Software Factory Is a Workflow, Not a Product. Build One in 20 Minutes.](https://nx.dev/blog/software-factory-workflow-not-product) Victor Savkin, Nx Blog, 6 August 2026 | The factory is ordinary steps wired together. Record what happened once it has. |
| [Building Interactive Agentic Code Reviews in 20 Minutes](https://nx.dev/blog/building-interactive-agentic-code-reviews). Victor Savkin, Nx Blog, 12 August 2026 | A review bot pre-reviews in the background. The person reviews the session and talks to the agent. |

## Further reading

Newer pieces behind the labelled recommendations. Titles are quoted as published.

### Sep to Oct 2026

- [hacktrace: behavior-supervised detection of reward hacking during code generation](https://arxiv.org/abs/2610.03055). Hao Jiang, Xin Li, Annan Wang and others, arXiv, 2 October 2026. A coding agent can pass by deleting the test that exposes the bug. In the authors' training runs, 82 to 91% of passing solutions were shortcuts until a monitor penalised them.
- [State of AI Impact in Engineering: Q3 Report](https://getdx.com/report/state-of-ai-impact-in-engineering-q3-report/). DX, getdx.com, Q3 2026 data (July to September 2026), page undated. Where agents write the most code, PRs wait 105% longer for a first review, while PR throughput keeps rising. Review has not kept pace.
- [A Preliminary Analysis of the Impact of AI Assisted/Generated Code on Quality, Centrality and Review Time at Scale](https://drops.dagstuhl.de/storage/00lipics/lipics-vol394-esem2026/LIPIcs.ESEM.2026.93/LIPIcs.ESEM.2026.93.pdf). Audris Mockus, Peter C. Rigby, Don Stewart, Chandra Maddila, Nachiappan Nagappan, ESEM 2026 (LIPIcs), September 2026. A counterpoint. At Meta, diffs with AI code were reviewed faster once context was controlled for. Review load is not slower everywhere, so measure your own.
- [More Code, Fewer Deployments: Why Progressive Delivery Is the Missing Half of Your AI Coding Strategy](https://stepto.net/blog/progressive-delivery-feature-flags-ai-generated-code-release-safety-2026). Igor Gazivoda, StepTo, 20 October 2026. Agents raise change volume. Flags, canaries, and automated rollback shrink how many users meet a bad change.
- [Releasing AI-written changes: flags, canaries and rollback](https://reveneau.com/guides/ai-native-delivery/progressive-delivery-for-ai-written-changes). Reveneau Editorial, Reveneau, 1 September 2026. Separate deploy from release, widen on a named signal, and let anyone on call roll back. Practise the rollback.
- [The Honest Raw LLM Code Review Benchmark: 21 Models, 7,980 Reviews, Every Number Open](https://ironbee.ai/blog/the-honest-raw-llm-code-review-benchmark). Serkan Özal, IronBee AI, 19 October 2026. Raw models review as well as review tools, and scores shift between models and runs. Benchmark your own setup.
- [When Coding Agents Outpace Review: Evaluating PRD-Driven Development in Mature Enterprise Repositories](https://arxiv.org/abs/2610.26394). Tianqi Liu and others, arXiv, 19 October 2026. With the same model and tasks, successive harness releases raised the mean score from 59.4 to 63.0.
- [Cortex: Measurement-Gated Evolution and Pruning of Coding-Agent Skills and Rules](https://arxiv.org/abs/2610.14216). Samuele Giampieri, arXiv, 9 October 2026. Replay tasks with a new rule several times. Keep it only if it helps overall and breaks no task.
- [SpecGuardBench: Can Coding Agents Construct Reliable Validation Harnesses from Natural Language Specifications?](https://arxiv.org/abs/2610.16870). Zhiqing Zhong, Mingyu Chen, Aoyang Fang, Yuzhong Zhang, Haoye Tian, Lionel Briand, Boxi Yu, Pinjia He, arXiv, 12 October 2026. No agent wrote checks faithful to the spec on more than 63% of tasks. Their checks copied the code, not the spec.
- [Implementing the Spec Growth Engine: Preventing Spec-Code Divergence, and Growing the Spec with Agents](https://arxiv.org/abs/2610.11725). Hartwig Grabowski, arXiv, 8 October 2026. A drift check that needs no model can run as a pre-commit hook and refuse a drifting commit.
- [ReviewBench: An open benchmark for AI code review](https://github.blog/ai-and-ml/github-copilot/reviewbench-an-open-benchmark-for-ai-code-review/). Michelle Zhou, The GitHub Blog, 5 October 2026. An open set of 219 real PRs with a fixed rubric, for testing a review agent before you trust it.
- [Martian's Code Review Bench: the "#1" claim rots in months](https://aicodereview.io/blog/martians-code-review-bench-the-1-claim-rots-in-months/). aicodereview.io Editorial, aicodereview.io, 5 October 2026. Review bot rankings move within months. Re-test rather than trust a vendor's top spot.
- [CI Failure to Fix: The AI Agent CI Loop That Doesn't Thrash](https://automater.ai/intel/ci-agent-fix-loop-guards/). Russell Winslow, Automater Intel, 13 September 2026. Cap fix attempts, retry only on a new failure, and hand fixes to tests, CI config, or lockfiles to a person.
- [(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection](https://arxiv.org/abs/2610.13668). Chenyang Yang, Hao He, Ti-Chung Cheng, Jenna Butler, Emerson Murphy-Hill, Carmen Badea, Christian Bird, arXiv, 9 October 2026. The best review agent caught 71.9% of known bugs. Agents still miss bugs that need wider context. Scale review effort to the change.
- [Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921). Haiqing Li and others, arXiv, 24 September 2026. Agents claim success more often than they pass. Checks outside the agent should sign off.
- [Spec-driven development and spec drift: 335 repositories surveyed](https://striff.io/blog/architecture-matters-more-not-less/). Striff Engineering, Striff, 15 September 2026. Most repos hand agents docs to build from. Few check the code still matches them.
- [The Anatomy of Harness Engineering: How to Evaluate, Iterate, and Guard AI Coding Agents](https://developers.googleblog.com/en/the-anatomy-of-harness-engineering-how-to-evaluate-iterate-and-guard-ai-coding-agents/). Taylor Mullen, Christian Gunderman, Google Developers Blog, 9 September 2026. Test the agent setup with small behavioural evals, and watch the pass rate when a prompt or model changes.

### Earlier, still current

- [AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2x Mandate](https://arxiv.org/abs/2607.01904). Hao He, Shyam Agarwal, Yegor Denisov-Blanch and others, arXiv, 2 July 2026. Merged PRs per engineer doubled. Load per reviewer roughly doubled too, and automated review overtook human review.
- [ImpossibleBench: Measuring LLMs' Propensity of Exploiting Test Cases](https://arxiv.org/abs/2510.20270). Ziqian Zhong, Aditi Raghunathan, Nicholas Carlini, arXiv, 23 October 2025. Agents given tests that conflict with the spec often pass by changing or gaming the tests. Limiting test access cuts this.
- [Announcing the 2025 DORA Report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report). Nathen Harvey, Derek DeBellis, Google Cloud Blog, 23 September 2025. AI adoption now goes with higher throughput, and still with lower delivery stability.
- [State of AI in Software Development](https://leaddev.com/wp-content/uploads/2026/06/LXD3-2026-AI-in-the-SDLC.pdf). DX, LeadDev LXD3, June 2026. Across 61 companies, AI users' change failure rate barely moved on average. Per company it rose or fell. Measure your own.
- [Do These Violent Delights Have Violent Ends? Measuring the Post-Merge Fate of Agentic Code](https://arxiv.org/abs/2607.09902). Chunqiu Steven Xia, Courtney Miller and others, arXiv, 10 July 2026. Merged agent code needed more bug fixes later, and more so where changes went unreviewed. Merge rate alone hides this.
- [Two years after npm shipped build provenance, 78% of a typical dependency tree still doesn't use it](https://zennoxa.com/research/npm-provenance-census-2026). Zennoxa Shield, Zennoxa, 25 August 2026. Build provenance is easy to turn on, yet most packages still ship without it.
- [Strengthen your supply chain with code-to-cloud traceability and SLSA Build Level 3 security](https://github.blog/changelog/2026-01-20-strengthen-your-supply-chain-with-code-to-cloud-traceability-and-slsa-build-level-3-security/). GitHub, GitHub Changelog, 20 January 2026. Link each artifact to its attestations, where it is stored, and where it is deployed.
- [Artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations). GitHub, GitHub Docs, Undated. A signed record ties an artifact to its commit and workflow. SLSA Build Level 2 by default, Level 3 with a reusable workflow.
- [Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments). GitHub, GitHub Docs, Undated. Required reviewers must approve a job before it deploys to a protected environment.
- [Is Agentic Code Review Helpful? Mining Developers' Feedback to CodeRabbit Reviews in the Wild](https://arxiv.org/abs/2607.03316). Hong Yi Lin, Mingzhao Liang, Patanamon Thongtanunam, Kla Tantithamthavorn, arXiv, 3 July 2026. Developers rejected more review bot comments than they accepted. Track which ones land.
- [Under the hood: Security architecture of GitHub Agentic Workflows](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/). Landon Cox, Jiaxiao Zhou, The GitHub Blog, 9 March 2026. Agents hold no secrets. Their writes are staged and vetted before anything lands.
- [Practical Security Guidance for Sandboxing Agentic Workflows and Managing Execution Risk](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/). Rich Harang, NVIDIA Technical Blog, 30 January 2026. Sandbox agents and control where they can reach on the network.
- [Mitigating Indirect AGENTS.md Injection Attacks in Agentic Environments](https://developer.nvidia.com/blog/mitigating-indirect-agents-md-injection-attacks-in-agentic-environments/). Daniel Teixeira, NVIDIA Technical Blog, 20 April 2026. Instruction files can be planted. Treat them as part of the supply chain.
- [Beyond source code: The files AI coding agents trust — and attackers exploit](https://cloud.google.com/blog/products/identity-security/beyond-source-code-the-files-ai-coding-agents-trust-and-attackers-exploit). Bernardo Quintero, Daniel Kapellmann Zafra, Google Cloud Blog, 12 May 2026. Instruction files and agent settings can steer an agent. Allow only known ones and review them before merge.
- [AI Agent and MCP Security](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-2-Develop/2-2-5-AI-Agent-and-MCP-Security/). OWASP, OWASP DevSecOps Guideline, Undated. Isolation is the boundary, not a prompt. Instruction files go under code owners. No agent approves its own change.
- [Secure Coding with AI Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html). OWASP, OWASP Cheat Sheet Series, Undated. Every AI change has a named human owner. AI review does not replace human review.
- [ROI of AI-assisted Software Development](https://dora.dev/ai/roi/report/). DORA, dora.dev, 22 April 2026. Expect a dip before gains, and count the cost of checking AI output.
- [Capabilities: Working in small batches](https://dora.dev/capabilities/working-in-small-batches/). DORA, dora.dev, Updated 8 December 2025. Small batches are a safety net for AI adoption, against the instability faster changes bring.
- [How to build self-healing CI pipelines](https://newsletter.port.io/p/how-to-build-self-healing-ci-pipelines). Zohar Einy, Port newsletter, 12 May 2026. Sort a red check by whose problem it is before fixing it. Hand new or risky failures to a person.
- [Spec-Driven Development: A Spec-First Approach to AI-Native Engineering](https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering/). Apoorv Gupta, Microsoft for Developers, 10 June 2026. Write the spec first, and keep it as the thing agents build and check against.
- [Model Context Protocol Specification, version 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28). Model Context Protocol, modelcontextprotocol.io, 28 July 2026. One protocol for agents to read context and call tools in other systems. Hosts must get consent before a tool runs.
- [The /llms.txt file, v2](https://llmstxt.org/). Jeremy Howard, llmstxt.org, 3 September 2024, updated 10 August 2026. A small Markdown file at a path tells agents what the site is and links the detail they should fetch.

## Assess your setup with an LLM

Cutting edge. Give an agent read-only MCP access to your repos, CI, branch rules, deploy, and monitoring, then paste the audit prompt from the guide view on the site. It reads the guide as data, scores each recommendation as met, partial, missing, or unknown with evidence, and returns quick wins and biggest gains.

- [guide.json](https://adamsuk.github.io/line/guide.json): stations, recommendations, tools with station ratings, dated sources, the rubric and the prompt
- [llms.txt](https://adamsuk.github.io/line/llms.txt) and [llms-full.txt](https://adamsuk.github.io/line/llms-full.txt)

All three are built from the page's data and CHANGELOG.md by `npm run build:pages` ([src/factory/audit.ts](src/factory/audit.ts)).

## Run it

```bash
npm install
npm run dev
```

The dev server listens on port 8080.
