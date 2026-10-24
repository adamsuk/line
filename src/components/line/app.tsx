import type { ReactNode } from "react";
import { FURTHER_READING, REFERENCES, TOOL_LIST, TOOLS_CHECKED } from "@/factory/model";
import { ChangelogEntries } from "@/components/line/changelog";
import { Guide } from "@/components/line/guide";
import { buildInfo, commitUrl, formatLondon, shortSha } from "@/factory/build-info";
import { doneCount, useLine } from "@/factory/store";
import { Parts } from "@/components/line/parts";
import { Rail } from "@/components/line/rail";
import { Stage } from "@/components/line/stage";

export function LineApp() {
  const view = useLine((s) => s.view);
  const setView = useLine((s) => s.setView);
  const reset = useLine((s) => s.reset);
  const notice = useLine((s) => s.notice);
  const clearNotice = useLine((s) => s.clearNotice);
  const count = useLine(doneCount);

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b border-line bg-paper/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-wide text-muted">Software factory</p>
              <h1 className="font-display text-4xl leading-none text-ink">Line</h1>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
              <a
                href="https://github.com/adamsuk/line"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-steel underline underline-offset-4 hover:text-steel-2"
              >
                View on GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 shrink-0 rounded-md px-3 text-sm font-medium text-steel underline-offset-4 hover:underline"
              >
                Start over
              </button>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-muted sm:text-base">
            A guide to bringing agents into a software factory. One change, nine stations. People plan and approve. Agents build. A factory is not typing faster. It is how a change stays the same
            when someone else builds it, on a clean machine, and then listens to what production does.
          </p>
          <p className="-mt-2 text-sm text-muted">
            How it was researched:{" "}
            <a
              href="https://sradams.co.uk/blog/researching-a-software-factory-with-grok"
              target="_blank"
              rel="noreferrer"
              className="text-steel underline underline-offset-4 hover:text-steel-2"
            >
              Researching a Software Factory with Grok
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-paper-2 p-1 sm:flex">
              <Seg label="Walk the line" active={view === "walk"} onClick={() => setView("walk")} />
              <Seg label="The parts" active={view === "parts"} onClick={() => setView("parts")} />
              <Seg label="The guide" active={view === "guide"} onClick={() => setView("guide")} />
            </div>
            <p className="font-mono text-xs tabular-nums text-faint">
              CHK-184 · {count} of 9 stations done
            </p>
          </div>
          {notice ? (
            <button
              type="button"
              onClick={clearNotice}
              className="rounded-lg border border-line bg-hold-bg px-4 py-3 text-left text-sm text-ink"
            >
              {notice}
            </button>
          ) : null}
        </div>
      </header>

      {view === "walk" ? (
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start">
          <Rail />
          <Stage />
        </div>
      ) : view === "parts" ? (
        <Parts />
      ) : (
        <Guide />
      )}

      <BuiltOn />
    </main>
  );
}

function Seg({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "min-h-11 rounded-lg px-4 text-sm font-medium transition-colors duration-150 " +
        (active ? "bg-ink text-paper" : "text-muted hover:text-ink")
      }
    >
      {label}
    </button>
  );
}

function BuiltOn() {
  return (
    <footer aria-labelledby="built-on" className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
      <div className="border-t border-line pt-6">
        <Disclosure id="built-on" title="Built on">
          <p className="mt-2 max-w-2xl text-sm text-muted">Line started from these four pieces.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REFERENCES.map((ref) => (
              <li key={ref.id} className="rounded-2xl border border-line bg-paper p-4">
                <p className="font-mono text-xs text-faint">
                  {ref.publication} · {ref.date}
                </p>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-display text-lg leading-snug text-ink underline-offset-4 hover:underline"
                >
                  {ref.title}
                </a>
                <p className="mt-1 text-sm text-steel">{ref.author}</p>
                <p className="mt-2 text-sm text-muted">{ref.took}</p>
              </li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure id="further-reading" title="Further reading" className="mt-4">
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Newer pieces behind the labelled recommendations in the guide. Agent tooling moves fast,
            so these are dated.
          </p>
          {FURTHER_READING.map((group) => (
            <section key={group.heading} aria-label={group.heading} className="mt-4">
              <h3 className="font-mono text-xs text-muted">{group.heading}</h3>
              <ul className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {group.refs.map((ref) => (
                  <li key={ref.id} className="text-sm">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink underline underline-offset-4 hover:text-steel"
                    >
                      {ref.title}
                    </a>
                    <span className="text-muted">
                      . {ref.author}, {ref.publication}, {ref.date}.
                    </span>
                    <p className="mt-1 text-muted">{ref.took}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Disclosure>
        <Disclosure id="tools" title="Tools" className="mt-4">
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Every tool named in the guide, checked on {TOOLS_CHECKED}. This is not an endorsement. Each
            station's recommendations show which tools fit, how fully, and the gap left.
          </p>
          <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_LIST.map((t) => (
              <li key={t.url}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink underline underline-offset-4 hover:text-steel"
                >
                  {t.name}
                </a>
              </li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure id="changelog" title="Changelog" className="mt-4">
          <ChangelogEntries />
        </Disclosure>
        <LastUpdated />
      </div>
    </footer>
  );
}

function LastUpdated() {
  const info = buildInfo();
  if (!info) return null;
  return (
    <p className="mt-6 font-mono text-xs text-faint">
      Last updated <time dateTime={info.iso}>{formatLondon(info.iso)}</time>
      {info.sha ? (
        <>
          {" · "}
          <a
            href={commitUrl(info.sha)}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-steel"
          >
            {shortSha(info.sha)}
          </a>
        </>
      ) : null}
    </p>
  );
}

/** A native disclosure. Closed on first load, opens with click, Enter, or Space. */
function Disclosure({
  id,
  title,
  className = "",
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <details className={"group " + className}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="inline-block w-5 text-xl leading-none text-steel transition-transform duration-150 group-open:rotate-90"
        >
          ▸
        </span>
        <h2 id={id} className="font-display text-2xl text-ink">
          {title}
        </h2>
        <span aria-hidden="true" className="font-mono text-xs text-muted">
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
