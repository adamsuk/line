import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseChangelog, parseInline, resolveHref } from "./changelog.ts";

const source = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");
const log = parseChangelog(source);

test("every section of CHANGELOG.md is a date, newest first", () => {
  assert.ok(log.releases.length > 0);
  for (const r of log.releases) assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
  const dates = log.releases.map((r) => r.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

test("every date has at least one grouped entry", () => {
  for (const r of log.releases) {
    assert.ok(r.groups.length > 0, r.date);
    for (const g of r.groups) assert.ok(g.items.length > 0, `${r.date} ${g.heading}`);
  }
});

test("PR links parse as links", () => {
  const links = log.releases
    .flatMap((r) => r.groups.flatMap((g) => g.items.flat()))
    .filter((i) => i.kind === "link");
  assert.ok(links.some((l) => l.kind === "link" && /\/pull\/\d+$/.test(l.href)));
});

test("inline links, code and bold parse", () => {
  assert.deepEqual(parseInline("a [#1](https://x/pull/1) `b` **c**"), [
    { kind: "text", text: "a " },
    { kind: "link", text: "#1", href: "https://x/pull/1" },
    { kind: "text", text: " " },
    { kind: "code", text: "b" },
    { kind: "text", text: " " },
    { kind: "strong", text: "c" },
  ]);
});

test("relative links point at the repo", () => {
  assert.equal(
    resolveHref("CONTRIBUTING.md", "https://github.com/a/b"),
    "https://github.com/a/b/blob/main/CONTRIBUTING.md",
  );
  assert.equal(resolveHref("https://k.com", "https://github.com/a/b"), "https://k.com");
});
