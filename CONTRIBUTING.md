# Contributing

## Changelog

Every change adds a dated entry to [CHANGELOG.md](CHANGELOG.md) in the same PR. This matters most for research-driven changes from the Research Scout.

Add it under today's date (YYYY-MM-DD), in Added, Changed, or Removed. Each entry covers:

- **What changed**: one or two short lines.
- **Why**: the reason, such as new evidence or a label moving between best practice and cutting edge.
- **Sources**: the articles or papers behind a research change, linked.
- **PR link**: for example `([#30](https://github.com/adamsuk/line/pull/30))`.

CI fails a PR that does not touch CHANGELOG.md. For a change with nothing worth logging, such as a typo or a CI tweak, add the `skip-changelog` label.
