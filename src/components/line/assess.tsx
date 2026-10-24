import { useState } from "react";
import changelogSource from "../../../CHANGELOG.md?raw";
import {
  auditPrompt,
  EFFORT_RUBRIC,
  GUIDE_JSON_URL,
  guideVersion,
  IMPACT_RUBRIC,
  LLMS_FULL_URL,
  LLMS_TXT_URL,
  MCP_SERVERS,
  SCORES,
} from "@/factory/audit";
import { Disclosure } from "@/components/line/disclosure";
import { MaturityBadge } from "@/components/line/recommendations";
import { SourceLink } from "@/components/line/stage";

const VERSION = guideVersion(changelogSource);
const PROMPT = auditPrompt(VERSION);

const link = "text-steel underline underline-offset-4 hover:text-steel-2";

/** Point an agent with read-only MCP access at the guide, and get a scored gap list back. */
export function AssessWithLlm() {
  return (
    <Disclosure id="assess" title="Assess your setup with an LLM" className="mt-4 max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <MaturityBadge maturity="Cutting edge" />
        <span className="font-mono text-xs text-faint">Guide version {VERSION}</span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Give an agent read-only MCP access to your repos, CI, branch rules, deploy, and monitoring.
        Paste the prompt. It reads this guide as data, scores each recommendation with evidence, and
        returns quick wins and biggest gains. People decide which gaps become work orders.
      </p>

      <ol className="mt-4 grid gap-4 text-sm text-ink">
        <li>
          <p className="font-medium">
            1. Connect MCP servers, read-only, with the narrowest scopes they offer.
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {MCP_SERVERS.map((g) => (
              <div key={g.kind}>
                <p className="font-mono text-xs text-muted">{g.kind}</p>
                <ul className="mt-1 grid gap-1">
                  {g.servers.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noreferrer" className={link}>
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </li>
        <li>
          <p className="font-medium">2. Copy the prompt into the agent.</p>
          <PromptBox />
        </li>
        <li>
          <p className="font-medium">3. Check the evidence it cites before acting on a gap.</p>
          <Rubric />
        </li>
      </ol>

      <p className="mt-4 text-sm text-muted">
        Machine-readable guide:{" "}
        <a href={GUIDE_JSON_URL} className={link}>
          guide.json
        </a>
        {" · "}
        <a href={LLMS_TXT_URL} className={link}>
          llms.txt
        </a>
        {" · "}
        <a href={LLMS_FULL_URL} className={link}>
          llms-full.txt
        </a>
        . Built from the same data as this page.
      </p>
      <SourceLink id="mcp-spec" />
      <SourceLink id="llms-txt" />
    </Disclosure>
  );
}

function PromptBox() {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2500);
  };
  return (
    <div className="mt-2 rounded-xl border border-line">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-1">
        <p className="font-mono text-xs text-muted">Audit prompt</p>
        <button
          type="button"
          onClick={copy}
          className="min-h-11 rounded-lg px-3 text-sm font-medium text-steel underline-offset-4 hover:underline"
        >
          {copied === "done" ? "Copied" : copied === "failed" ? "Select and copy" : "Copy prompt"}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied === "done" ? "Prompt copied" : ""}
        </span>
      </div>
      <pre
        tabIndex={0}
        aria-label="Audit prompt"
        className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed text-ink"
      >
        {PROMPT}
      </pre>
    </div>
  );
}

function Rubric() {
  const rows = (r: Record<string, string>) =>
    Object.entries(r).map(([k, v]) => (
      <div key={k} className="flex gap-2">
        <dt className="w-16 shrink-0 font-mono text-xs text-steel">{k}</dt>
        <dd className="text-muted">{v}</dd>
      </div>
    ));
  return (
    <div className="mt-2 grid gap-4 sm:grid-cols-3">
      <div>
        <p className="font-mono text-xs text-muted">Score</p>
        <dl className="mt-1 grid gap-1">{rows(SCORES)}</dl>
      </div>
      <div>
        <p className="font-mono text-xs text-muted">Impact</p>
        <dl className="mt-1 grid gap-1">{rows(IMPACT_RUBRIC)}</dl>
      </div>
      <div>
        <p className="font-mono text-xs text-muted">Effort</p>
        <dl className="mt-1 grid gap-1">{rows(EFFORT_RUBRIC)}</dl>
      </div>
    </div>
  );
}
