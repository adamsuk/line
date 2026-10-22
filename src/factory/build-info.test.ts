import { test } from "node:test";
import assert from "node:assert/strict";
import { commitUrl, formatLondon, shortSha } from "./build-info.ts";

test("the stamp reads in London time, BST in summer and GMT in winter", () => {
  assert.equal(formatLondon("2026-10-22T08:40:00Z"), "22 Oct 2026, 09:40 BST");
  assert.equal(formatLondon("2026-12-01T09:05:00Z"), "1 Dec 2026, 09:05 GMT");
});

test("a committer date with an offset lands on the same London time", () => {
  assert.equal(formatLondon("2026-10-22T09:40:00+01:00"), "22 Oct 2026, 09:40 BST");
});

test("the short sha links to the full commit", () => {
  const sha = "c99d7a19ede6da6579232591e005491fe0993b56";
  assert.equal(shortSha(sha), "c99d7a1");
  assert.equal(commitUrl(sha), `https://github.com/adamsuk/line/commit/${sha}`);
});
