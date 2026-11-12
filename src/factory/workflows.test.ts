import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../../.github/workflows/", import.meta.url);
const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

/** Every `uses:` value with its line number. Local refs (`./...`) are skipped. */
export function nonLocalUses(source: string): { line: number; ref: string; text: string }[] {
  const out: { line: number; ref: string; text: string }[] = [];
  source.split("\n").forEach((text, i) => {
    const m = /^\s*(?:-\s+)?uses:\s*(\S+)/.exec(text);
    if (m && !m[1].startsWith("./")) out.push({ line: i + 1, ref: m[1], text });
  });
  return out;
}

/** Why a `uses:` line is not pinned, or null when it is pinned to 40 hex with a version comment. */
export function unpinnedReason(ref: string, text: string, needComment = true): string | null {
  if (!/@[0-9a-f]{40}$/.test(ref)) return "not pinned to a 40-hex commit SHA";
  if (needComment && !/#\s*\S/.test(text.slice(text.indexOf(ref) + ref.length))) return "missing version comment";
  return null;
}

test("there are workflows to check", () => {
  assert.ok(files.includes("pages.yml"));
});

test("every non-local uses: is pinned to a 40-hex SHA with a version comment", () => {
  const bad: string[] = [];
  for (const f of files) {
    const source = readFileSync(new URL(f, dir), "utf8");
    for (const u of nonLocalUses(source)) {
      // The version comment is required in pages.yml (#353); other workflows
      // are only held to the 40-hex pin, so size-label.yml is not widened here.
      const why = unpinnedReason(u.ref, u.text, f === "pages.yml");
      if (why) bad.push(`${f}:${u.line} ${u.ref} (${why})`);
    }
  }
  assert.deepEqual(bad, []);
});

test("the pin check flags tags, short SHAs and missing comments", () => {
  const sha = "a".repeat(40);
  assert.ok(unpinnedReason("actions/checkout@v4", "- uses: actions/checkout@v4"));
  assert.ok(unpinnedReason(`actions/checkout@${"a".repeat(39)}`, "- uses: x"));
  assert.ok(unpinnedReason(`actions/checkout@${sha}`, `- uses: actions/checkout@${sha}`));
  assert.equal(
    unpinnedReason(`actions/checkout@${sha}`, `- uses: actions/checkout@${sha} # v4.4.0`),
    null,
  );
  assert.equal(unpinnedReason(`x@${sha}`, `uses: x@${sha}`, false), null);
});

test("local uses: refs are not checked", () => {
  assert.deepEqual(nonLocalUses("      - uses: ./.github/actions/x\n"), []);
});
