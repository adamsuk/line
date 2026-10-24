import changelogSource from "../../../CHANGELOG.md?raw";
import { REPO_URL } from "@/factory/build-info";
import {
  parseChangelog,
  resolveHref,
  type ChangelogRelease,
  type Inline,
} from "@/factory/changelog";

// Built from CHANGELOG.md at build time, so the site and the repo always agree.
const LOG = parseChangelog(changelogSource);
const LATEST = 3;

export function ChangelogEntries() {
  const latest = LOG.releases.slice(0, LATEST);
  const older = LOG.releases.slice(LATEST);
  return (
    <div className="max-w-3xl">
      <p className="mt-2 text-sm text-muted">
        What changed and why, newest first. Every change adds an entry. Source:{" "}
        <a
          href={`${REPO_URL}/blob/main/CHANGELOG.md`}
          target="_blank"
          rel="noreferrer"
          className="text-ink underline underline-offset-4 hover:text-steel"
        >
          CHANGELOG.md
        </a>
        .
      </p>
      {latest.map((r) => (
        <Release key={r.date} release={r} />
      ))}
      {older.length > 0 && (
        <details className="group/older mt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg font-mono text-xs text-steel focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel [&::-webkit-details-marker]:hidden">
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-150 group-open/older:rotate-90"
            >
              ▸
            </span>
            Older entries ({older.length})
          </summary>
          {older.map((r) => (
            <Release key={r.date} release={r} />
          ))}
        </details>
      )}
    </div>
  );
}

function Release({ release }: { release: ChangelogRelease }) {
  return (
    <section aria-label={release.date} className="mt-4 border-t border-line pt-3">
      <h3 className="font-mono text-sm text-ink">
        <time dateTime={release.date}>{release.date}</time>
      </h3>
      {release.notes.map((n, i) => (
        <p key={i} className="mt-1 text-sm text-muted">
          <Rich parts={n} />
        </p>
      ))}
      {release.groups.map((g) => (
        <div key={g.heading} className="mt-2">
          <h4 className="font-mono text-xs text-muted">{g.heading}</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink marker:text-faint">
            {g.items.map((item, i) => (
              <li key={i} className="break-words">
                <Rich parts={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function Rich({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === "link")
          return (
            <a
              key={i}
              href={resolveHref(p.href, REPO_URL)}
              target="_blank"
              rel="noreferrer"
              className="text-steel underline underline-offset-4 hover:text-steel-2"
            >
              {p.text}
            </a>
          );
        if (p.kind === "code")
          return (
            <code key={i} className="rounded bg-paper-2 px-1 font-mono text-xs">
              {p.text}
            </code>
          );
        if (p.kind === "strong") return <strong key={i}>{p.text}</strong>;
        return <span key={i}>{p.text}</span>;
      })}
    </>
  );
}
