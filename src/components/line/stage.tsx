import type { ReactNode } from "react";
import {
  BRANCH,
  CHECKS,
  COMMIT,
  COMMIT_MESSAGE,
  CRITERIA,
  GUIDE,
  DIGEST,
  ERRORS,
  HISTORY,
  LOGS,
  ORDER,
  VERSION,
  nextStation,
  referenceById,
  stationById,
  type BenchChoice,
  type ReferenceId,
} from "@/factory/model";
import { useLine, type LineState } from "@/factory/store";

export function Stage() {
  const focus = useLine((s) => s.focus);
  const station = stationById(focus);

  return (
    <article className="rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <p className="font-mono text-xs text-muted">
        {station.index} · {station.part} · {station.owner}
      </p>
      <h2 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{station.name}</h2>
      <p className="mt-3 max-w-2xl text-base text-ink">{station.thesis}</p>

      <div className="mt-6">
        {focus === "backlog" && <Backlog />}
        {focus === "source" && <Source />}
        {focus === "bench" && <Bench />}
        {focus === "gate" && <Gate />}
        {focus === "review" && <Review />}
        {focus === "artifact" && <Artifact />}
        {focus === "release" && <Release />}
        {focus === "observe" && <Observe />}
        {focus === "loop" && <Loop />}
      </div>

      <aside className="mt-6 rounded-xl border border-line bg-paper-2 p-4">
        <p className="font-mono text-xs text-muted">What this station is for</p>
        <p className="mt-2 text-sm text-ink">{station.lesson}</p>
        {station.sources?.map((id) => <SourceLink key={id} id={id} />)}
      </aside>

      <GuidePanel id={focus} />
    </article>
  );
}

export function SourceLink({ id }: { id: ReferenceId }) {
  const ref = referenceById(id);
  return (
    <p className="mt-3 text-xs text-muted">
      From{" "}
      <a
        href={ref.url}
        target="_blank"
        rel="noreferrer"
        className="text-steel underline underline-offset-4 hover:text-steel-2"
      >
        {ref.title}
      </a>{" "}
      by {ref.author}
    </p>
  );
}

export function GuidePanel({ id }: { id: LineState["focus"] }) {
  const guide = GUIDE[id];
  return (
    <aside className="mt-4 rounded-xl border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">Bringing in agents</p>
        <StageBadge stage={guide.stage} />
      </div>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-steel">Bot</dt>
          <dd className="mt-1 text-ink">{guide.bot}</dd>
        </div>
        <div>
          <dt className="font-medium text-steel">Human in the loop</dt>
          <dd className="mt-1 text-ink">{guide.human}</dd>
        </div>
      </dl>
      {guide.sources.map((ref) => (
        <SourceLink key={ref} id={ref} />
      ))}
    </aside>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="rounded-md bg-paper-2 px-2 py-1 font-mono text-xs text-ink">
      {stage === "Start" ? "Start here" : stage}
    </span>
  );
}

function Continue({ id, label }: { id: LineState["focus"]; label: string }) {
  const focusStation = useLine((s) => s.focusStation);
  const next = nextStation(id);
  if (!next) return null;
  return (
    <button
      type="button"
      onClick={() => focusStation(next)}
      className="min-h-11 rounded-md bg-steel px-4 text-sm font-medium text-on-steel"
    >
      {label}
    </button>
  );
}

function Primary({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 rounded-md bg-steel px-4 text-sm font-medium text-on-steel disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Backlog() {
  const criteria = useLine((s) => s.criteria);
  const accepted = useLine((s) => s.accepted);
  const toggle = useLine((s) => s.toggleCriterion);
  const accept = useLine((s) => s.accept);
  const ready = criteria.every(Boolean);

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-line p-4">
        <p className="font-mono text-xs text-steel">{ORDER}</p>
        <h3 className="mt-1 font-display text-2xl">Checkout times out on slow cards</h3>
        <p className="mt-2 text-sm text-muted">
          Customers on high-latency networks see a spinner, then a failure. Sometimes the charge has already
          landed. The client gives the provider 800ms.
        </p>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-ink">Done means all three</legend>
        <div className="mt-2 grid gap-2">
          {CRITERIA.map((item, i) => (
            <label
              key={item}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-line px-3 py-3 text-sm"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={criteria[i]}
                disabled={accepted}
                onChange={() => toggle(i)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {accepted ? (
        <Continue id="backlog" label="Continue to source" />
      ) : (
        <Primary onClick={accept} disabled={!ready}>
          {ready ? "Accept onto the line" : "Check every line of done"}
        </Primary>
      )}
    </div>
  );
}

function Source() {
  const branched = useLine((s) => s.branched);
  const cut = useLine((s) => s.cutBranch);

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-line bg-ink p-4 font-mono text-sm text-paper">
        <p className="text-xs text-paper/60">repo</p>
        <ul className="mt-3 space-y-1">
          <li>payments/</li>
          <li className="pl-4">timeout.ts ← the edit</li>
          <li className="pl-4">timeout.test.ts</li>
          <li>.factory/</li>
          <li className="pl-4">gate.yml</li>
          <li className="pl-4">release.yml</li>
        </ul>
      </div>
      <ol className="grid gap-2">
        {HISTORY.map((commit, i) => (
          <li key={commit.sha} className="flex items-start gap-3">
            <span className="mt-1 flex flex-col items-center">
              <span className="size-2.5 rounded-full bg-steel" />
              {i < HISTORY.length - 1 || branched ? <span className="h-6 w-px bg-line" /> : null}
            </span>
            <span>
              <span className="font-mono text-xs text-steel">{commit.sha}</span>
              <span className="ml-2 text-sm">{commit.message}</span>
              {i === HISTORY.length - 1 ? (
                <span className="ml-2 font-mono text-xs text-faint">main</span>
              ) : null}
            </span>
          </li>
        ))}
        {branched ? (
          <li className="flex items-start gap-3 pl-6">
            <span className="mt-1 size-2.5 rounded-full border-2 border-steel bg-paper" />
            <span>
              <span className="font-mono text-xs text-steel">branch</span>
              <span className="ml-2 text-sm">{BRANCH}</span>
              <span className="mt-1 block text-xs text-muted">
                Points at 4e88c19. No new snapshot yet. Main did not move.
              </span>
            </span>
          </li>
        ) : null}
      </ol>
      {branched ? (
        <Continue id="source" label="Continue to the bench" />
      ) : (
        <Primary onClick={cut}>Cut branch {BRANCH}</Primary>
      )}
    </div>
  );
}

const CHOICES: { id: BenchChoice; title: string; detail: string; local: string }[] = [
  {
    id: "budget",
    title: "Wait 8s, retry once, key the attempt",
    detail: "TIMEOUT_MS = 8000, RETRIES = 1, and the same idempotency key on the retry.",
    local: "Local check passed. One charge, one retry, failure only after the budget.",
  },
  {
    id: "forever",
    title: "Remove the timeout",
    detail: "TIMEOUT_MS = 0. The call waits until the provider feels like answering.",
    local: "Local check hung. The worker never returned to the pool.",
  },
  {
    id: "hide",
    title: "Catch the error and show success",
    detail: "The UI stops looking broken. The ledger does whatever the provider did.",
    local: "Local check lied. The screen said paid. The ledger had two charges.",
  },
];

function Bench() {
  const choice = useLine((s) => s.choice);
  const committed = useLine((s) => s.committed);
  const pick = useLine((s) => s.pick);
  const commit = useLine((s) => s.commit);
  const selected = CHOICES.find((c) => c.id === choice);

  return (
    <div className="grid gap-4">
      <pre className="overflow-x-auto rounded-xl border border-line bg-paper-2 p-4 font-mono text-xs leading-relaxed text-ink sm:text-sm">
        {`// payments/timeout.ts\nexport const TIMEOUT_MS = 800;\nexport const RETRIES = 0;\n\nexport async function charge(card: Card) {\n  return provider.charge(card, {\n    timeout: TIMEOUT_MS,\n    retries: RETRIES,\n  });\n}`}
      </pre>
      <fieldset>
        <legend className="text-sm font-medium">The agent drafted three edits. Pick the one it commits.</legend>
        <div className="mt-2 grid gap-2">
          {CHOICES.map((item) => (
            <label
              key={item.id}
              className={
                "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-sm " +
                (choice === item.id ? "border-steel bg-paper-2" : "border-line")
              }
            >
              <input
                type="radio"
                name="bench"
                className="mt-0.5"
                checked={choice === item.id}
                onChange={() => pick(item.id)}
              />
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="mt-1 block text-muted">{item.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {selected ? <p className="text-sm text-ink">{selected.local}</p> : null}
      {committed ? (
        <div className="grid gap-3">
          <p className="font-mono text-xs text-muted">
            {COMMIT.sha} · {choice ? COMMIT_MESSAGE[choice] : COMMIT.message}
          </p>
          <Continue id="bench" label="Continue to the gate" />
        </div>
      ) : (
        <Primary onClick={commit} disabled={!choice}>
          {choice ? "Commit the edit" : "Pick an edit first"}
        </Primary>
      )}
    </div>
  );
}

function Review() {
  const choice = useLine((s) => s.choice);
  const commentResolved = useLine((s) => s.commentResolved);
  const approved = useLine((s) => s.approved);
  const resolve = useLine((s) => s.resolveComment);
  const approve = useLine((s) => s.approve);
  const focusStation = useLine((s) => s.focusStation);
  const correct = choice === "budget";

  return (
    <div className="grid gap-4">
      <p className="font-mono text-xs text-muted">
        {BRANCH} → main · {COMMIT.sha} · gate passed
      </p>
      <Diff choice={choice} />
      {correct ? (
        <div className="rounded-xl border border-line bg-paper-2 p-4">
          <p className="font-mono text-xs text-muted">Review bot · adversarial pass, ran in the background</p>
          <ul className="mt-2 grid gap-1 text-sm text-ink">
            <li>Summary: the charge waits up to 8 seconds and retries once with the same idempotency key.</li>
            <li>Checked: a retry reuses the key, so it cannot create a second charge.</li>
            <li>Not checked: whether 8 seconds is the provider&apos;s documented budget. That needs a person.</li>
          </ul>
        </div>
      ) : null}
      <div className="rounded-xl border border-line p-4">
        <p className="text-sm font-medium">Mina Okonkwo · human reviewer</p>
        <p className="mt-2 text-sm text-ink">
          {correct
            ? "The gate is green and the bot found nothing low level. The change matches the work order. Is 8 seconds the provider's documented budget, or the agent's guess?"
            : "This misses the work order. The charge can still hang, or a retry can still double-submit. I am not approving this snapshot."}
        </p>
        {correct ? (
          commentResolved ? (
            <p className="mt-3 text-sm text-pass">
              The agent, in its session: 8 seconds is the provider p99 plus a margin. It is now written
              on the work order. Resolved.
            </p>
          ) : (
            <div className="mt-3">
              <Primary onClick={resolve}>
                Ask the agent in its session
              </Primary>
            </div>
          )
        ) : (
          <div className="mt-3">
            <Primary onClick={() => focusStation("bench")}>Send back to the bench</Primary>
          </div>
        )}
      </div>
      {approved ? (
        <Continue id="review" label="Continue to the artifact" />
      ) : correct && commentResolved ? (
        <Primary onClick={approve}>Approve b7e21a4</Primary>
      ) : (
        <p className="text-sm text-muted">Approval waits on a diff that meets CHK-184.</p>
      )}
    </div>
  );
}

function Diff({ choice }: { choice: BenchChoice | null }) {
  const lines = diffLines(choice);
  return (
    <pre className="overflow-x-auto rounded-xl border border-line font-mono text-xs leading-relaxed sm:text-sm">
      {lines.map((line, i) => (
        <div
          key={i}
          className={
            line.kind === "add"
              ? "bg-pass-bg px-4 text-pass"
              : line.kind === "del"
                ? "bg-fail-bg px-4 text-fail"
                : "px-4 text-muted"
          }
        >
          {line.kind === "add" ? "+ " : line.kind === "del" ? "− " : "  "}
          {line.text}
        </div>
      ))}
    </pre>
  );
}

function diffLines(choice: BenchChoice | null): { kind: "add" | "del" | "ctx"; text: string }[] {
  if (choice === "forever") {
    return [
      { kind: "del", text: "export const TIMEOUT_MS = 800;" },
      { kind: "add", text: "export const TIMEOUT_MS = 0;" },
      { kind: "ctx", text: "export const RETRIES = 0;" },
    ];
  }
  if (choice === "hide") {
    return [
      { kind: "ctx", text: "export async function charge(card: Card) {" },
      { kind: "del", text: "  return provider.charge(card, { timeout, retries });" },
      { kind: "add", text: "  try {" },
      { kind: "add", text: "    return await provider.charge(card, { timeout, retries });" },
      { kind: "add", text: "  } catch {" },
      { kind: "add", text: "    return { ok: true };" },
      { kind: "add", text: "  }" },
      { kind: "ctx", text: "}" },
    ];
  }
  return [
    { kind: "del", text: "export const TIMEOUT_MS = 800;" },
    { kind: "del", text: "export const RETRIES = 0;" },
    { kind: "add", text: "export const TIMEOUT_MS = 8_000;" },
    { kind: "add", text: "export const RETRIES = 1;" },
    { kind: "ctx", text: "return provider.charge(card, {" },
    { kind: "add", text: "  timeout: TIMEOUT_MS," },
    { kind: "add", text: "  retries: RETRIES," },
    { kind: "add", text: "  idempotencyKey: card.attemptId," },
    { kind: "ctx", text: "});" },
  ];
}

function Gate() {
  const gate = useLine((s) => s.gate);
  const checks = useLine((s) => s.checks);
  const choice = useLine((s) => s.choice);
  const runGate = useLine((s) => s.runGate);
  const focusStation = useLine((s) => s.focusStation);

  const failName =
    choice === "hide"
      ? "charge does not report success when the provider failed"
      : "charge returns before the worker is stuck";

  return (
    <div className="grid gap-4">
      <pre className="overflow-x-auto rounded-xl border border-line bg-paper-2 p-4 font-mono text-xs leading-relaxed sm:text-sm">
        {`# .factory/gate.yml\nfrom: ${COMMIT.sha}\nmachine: clean\nchecks:\n  - lint\n  - typecheck\n  - test\n  - build`}
      </pre>
      <ul className="grid gap-2">
        {CHECKS.map((name, i) => {
          const state = checks[i];
          return (
            <li
              key={name}
              className="flex min-h-11 items-center justify-between rounded-lg border border-line px-3 text-sm"
            >
              <span>{name}</span>
              <span
                className={
                  "font-mono text-xs tabular-nums " +
                  (state === "pass"
                    ? "text-pass"
                    : state === "fail"
                      ? "text-fail"
                      : state === "running"
                        ? "text-steel"
                        : "text-faint")
                }
              >
                {state === "pending" ? "Waiting" : state === "running" ? "Running" : state === "pass" ? "Pass" : "Fail"}
              </span>
            </li>
          );
        })}
      </ul>
      {gate === "failed" ? (
        <div className="grid gap-3">
          <p className="text-sm text-fail">
            Tests failed: {failName}. This machine does not have the sandbox's luck. No person had to read it. Main stays at 4e88c19.
          </p>
          <Primary onClick={() => focusStation("bench")}>Back to the bench</Primary>
        </div>
      ) : gate === "passed" ? (
        <div className="grid gap-3">
          <p className="text-sm text-ink">
            Same snapshot as the bench, on a machine that does not know the agent. The gate produced a build.
            No person has read it yet.
          </p>
          <Continue id="gate" label="Continue to review" />
        </div>
      ) : (
        <Primary onClick={runGate} disabled={gate === "running"}>
          {gate === "running" ? "Running the gate" : "Run the gate"}
        </Primary>
      )}
    </div>
  );
}

function Artifact() {
  const sealed = useLine((s) => s.sealed);
  const seal = useLine((s) => s.seal);

  return (
    <div className="grid gap-4">
      <dl className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-2">
        <Fact k="Package" v="checkout-web" />
        <Fact k="Version" v={VERSION} />
        <Fact k="Commit" v={COMMIT.sha} />
        <Fact k="Digest" v={DIGEST} />
      </dl>
      <p className="text-sm text-muted">
        {sealed
          ? "Sealed. Preview, staging, and production may only receive this digest."
          : "Still loose. Seal it and the bytes stop changing."}
      </p>
      {sealed ? <Continue id="artifact" label="Continue to release" /> : <Primary onClick={seal}>Seal artifact</Primary>}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-xs text-faint">{k}</dt>
      <dd className="font-mono text-sm text-ink">{v}</dd>
    </div>
  );
}

function Release() {
  const sealed = useLine((s) => s.sealed);
  const staging = useLine((s) => s.staging);
  const production = useLine((s) => s.production);
  const promoteStaging = useLine((s) => s.promoteStaging);
  const promoteProduction = useLine((s) => s.promoteProduction);

  return (
    <div className="grid gap-3">
      <Env
        name="Preview"
        note="Automatic from the branch. Already running this digest."
        state="Running"
        action={null}
      />
      <Env
        name="Staging"
        note="Same bytes. Fake cards, internal traffic."
        state={staging ? "Running" : "Empty"}
        action={
          staging ? null : (
            <Primary onClick={promoteStaging} disabled={!sealed}>
              Promote
            </Primary>
          )
        }
      />
      <Env
        name="Production"
        note="Same bytes. Live keys, real charges."
        state={production ? "Running" : staging ? "Held" : "Waiting"}
        action={
          production ? null : (
            <Primary onClick={promoteProduction} disabled={!staging}>
              Promote
            </Primary>
          )
        }
      />
      <p className="text-sm text-muted">
        Digest on every row that is running: {DIGEST}. Nothing was rebuilt between them.
      </p>
      {production ? <Continue id="release" label="Continue to observe" /> : null}
    </div>
  );
}

function Env({
  name,
  note,
  state,
  action,
}: {
  name: string;
  note: string;
  state: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="mt-1 text-sm text-muted">{note}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-steel">{state}</span>
        {action}
      </div>
    </div>
  );
}

function Observe() {
  const signalRead = useLine((s) => s.signalRead);
  const readSignal = useLine((s) => s.readSignal);
  const max = Math.max(...ERRORS);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm text-muted">Checkout errors per minute. The gap is the production promotion.</p>
        <div className="mt-3 flex h-28 items-end gap-1" aria-hidden="true">
          {ERRORS.map((n, i) => (
            <div key={i} className="flex h-full flex-1 items-end">
              <div
                className={"w-full rounded-sm " + (i < 7 ? "bg-fail/80" : "bg-steel")}
                style={{ height: `${Math.max(8, (n / max) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs text-faint">
          <span>Before · ~60 / min</span>
          <span className="tabular-nums">After · 4 / min</span>
        </div>
      </div>
      <ul className="grid gap-2 font-mono text-xs sm:text-sm">
        {LOGS.map((line) => (
          <li key={line.time} className="rounded-lg border border-line px-3 py-2">
            <span className="text-faint">{line.time} </span>
            {line.text}
          </li>
        ))}
      </ul>
      {signalRead ? (
        <Continue id="observe" label="Continue to the return" />
      ) : (
        <Primary onClick={readSignal}>Read the signal</Primary>
      )}
    </div>
  );
}

function Loop() {
  const returned = useLine((s) => s.returned);
  const drop = useLine((s) => s.dropReturn);
  const reset = useLine((s) => s.reset);

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-line p-4">
        <p className="font-mono text-xs text-steel">CHK-221 · from the signal on CHK-184</p>
        <h3 className="mt-1 font-display text-2xl">Show the timeout budget where on-call can see it</h3>
        <p className="mt-2 text-sm text-muted">
          The 800ms cap was invisible until customers failed. The fix worked. The next break will not announce
          itself either, unless the budget is on the board.
        </p>
      </div>
      <ol className="grid gap-1 text-sm text-muted">
        <li>Work order CHK-184 accepted with three checks.</li>
        <li>Branch {BRANCH} cut from main at 4e88c19.</li>
        <li>The agent committed {COMMIT.sha}. It raised the budget and keyed the retry.</li>
        <li>The gate passed on a clean machine.</li>
        <li>A person approved the diff, not the intention.</li>
        <li>Artifact {VERSION} sealed as {DIGEST}.</li>
        <li>That digest was promoted, not rebuilt.</li>
        <li>Errors fell. The line heard it.</li>
      </ol>
      {returned ? (
        <div className="grid gap-3">
          <p className="text-sm text-ink">
            CHK-221 is on the backlog. The line is clear. The factory is this loop, ready to run again.
          </p>
          <Primary onClick={reset}>Walk another change</Primary>
        </div>
      ) : (
        <Primary onClick={drop}>Drop CHK-221 on the backlog</Primary>
      )}
    </div>
  );
}
