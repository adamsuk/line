import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../../.github/workflows/", import.meta.url);
const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

/** Jobs that stay on `audit` on purpose (adamsuk/software-factory#370, #373), each commented in its workflow. */
const AUDIT_EXCEPTIONS = new Set(["links.yml:links"]);

export interface HardenStep {
  job: string;
  line: number;
  policy: string | null;
  endpoints: string[] | null;
}

/** Every Harden-Runner step with its job id, egress-policy and allowed-endpoints (folded or inline). */
export function hardenSteps(source: string): HardenStep[] {
  const lines = source.split("\n");
  const out: HardenStep[] = [];
  let job = "";
  for (let i = 0; i < lines.length; i++) {
    const j = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(lines[i]);
    if (j) job = j[1];
    if (!/uses:\s*step-security\/harden-runner@/.test(lines[i])) continue;
    const stepIndent = /^\s*/.exec(lines[i])![0].length;
    let policy: string | null = null;
    let endpoints: string[] | null = null;
    for (let k = i + 1; k < lines.length; k++) {
      const text = lines[k];
      if (text.trim() !== "" && /^\s*/.exec(text)![0].length <= stepIndent) break;
      const p = /^\s*egress-policy:\s*(\S+)/.exec(text);
      if (p) policy = p[1];
      const e = /^(\s*)allowed-endpoints:\s*(.*)$/.exec(text);
      if (e) {
        const parts: string[] = /^[>|][-+]?$/.test(e[2].trim()) ? [] : [e[2]];
        for (let n = k + 1; n < lines.length; n++) {
          if (lines[n].trim() === "" || /^\s*/.exec(lines[n])![0].length <= e[1].length) break;
          parts.push(lines[n]);
        }
        endpoints = parts.join(" ").split(/\s+/).filter(Boolean);
      }
    }
    out.push({ job, line: i + 1, policy, endpoints });
  }
  return out;
}

/** Why a step is not a blocking, 443-only, wildcard-free allowlist, or null when it is. */
export function egressProblem(s: HardenStep): string | null {
  if (s.policy !== "block") return `egress-policy is ${s.policy ?? "missing"}, not block`;
  if (!s.endpoints || s.endpoints.length === 0) return "no allowed-endpoints";
  const bad = s.endpoints.filter((h) => h.includes("*") || !/^[A-Za-z0-9.-]+:443$/.test(h));
  return bad.length ? `wildcard or non-443 endpoint: ${bad.join(", ")}` : null;
}

test("hardenSteps reads folded lists and egressProblem rejects audit, wildcards and non-443", () => {
  const src = [
    "jobs:",
    "  a:",
    "    steps:",
    "      - uses: step-security/harden-runner@abc # v1",
    "        with:",
    "          egress-policy: block",
    "          allowed-endpoints: >-",
    "            github.com:443",
    "            *.npmjs.org:443",
    "      - uses: actions/checkout@abc",
  ].join("\n");
  const [s] = hardenSteps(src);
  assert.deepEqual(s.endpoints, ["github.com:443", "*.npmjs.org:443"]);
  assert.match(egressProblem(s)!, /wildcard/);
  assert.match(egressProblem({ ...s, policy: "audit" })!, /not block/);
  assert.match(egressProblem({ ...s, endpoints: ["github.com:80"] })!, /non-443/);
  assert.match(egressProblem({ ...s, endpoints: null })!, /no allowed-endpoints/);
  assert.equal(egressProblem({ ...s, endpoints: ["github.com:443"] }), null);
});

test("every Harden-Runner step blocks egress with a 443-only, wildcard-free list, bar the two named exceptions", () => {
  const bad: string[] = [];
  let seen = 0;
  for (const f of files) {
    for (const s of hardenSteps(readFileSync(new URL(f, dir), "utf8"))) {
      seen++;
      if (AUDIT_EXCEPTIONS.has(`${f}:${s.job}`)) continue;
      const why = egressProblem(s);
      if (why) bad.push(`${f}:${s.line} job ${s.job}: ${why}`);
    }
  }
  assert.ok(seen > 0);
  assert.deepEqual(bad, []);
});

test("the audit exceptions are still Harden-Runner steps left on audit", () => {
  for (const ex of AUDIT_EXCEPTIONS) {
    const [f, job] = ex.split(":");
    const steps = hardenSteps(readFileSync(new URL(f, dir), "utf8")).filter((s) => s.job === job);
    assert.equal(steps.length, 1, `${ex} has one Harden-Runner step`);
    assert.equal(steps[0].policy, "audit");
  }
});
