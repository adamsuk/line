import { test } from "node:test";
import assert from "node:assert/strict";
import { hashFor, routeFromHash } from "./routes.ts";

test("three views have hash routes", () => {
  assert.deepEqual(routeFromHash(""), { view: "home", anchor: null });
  assert.deepEqual(routeFromHash("#home"), { view: "home", anchor: null });
  assert.deepEqual(routeFromHash("#walk"), { view: "walk", anchor: null });
  assert.deepEqual(routeFromHash("#/guide"), { view: "guide", anchor: null });
});

test("old tabs redirect to where their content now lives", () => {
  assert.deepEqual(routeFromHash("#parts"), { view: "home", anchor: "parts" });
  assert.deepEqual(routeFromHash("#audit"), { view: "guide", anchor: "audit" });
  assert.deepEqual(routeFromHash("#nonsense"), { view: "home", anchor: null });
});

test("hashes round trip", () => {
  for (const h of ["", "#walk", "#guide", "#parts", "#audit"])
    assert.equal(hashFor(routeFromHash(h)), h);
});
