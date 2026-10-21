import { PARTS } from "@/factory/model";

export function Parts() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <p className="max-w-2xl text-base text-muted">
        These are the objects that move. Stations are where a person, an agent, or a machine touches them. Learn the
        object and you can recognize it in any repo, not just this one.
      </p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {PARTS.map((part, i) => (
          <li key={part.name} className="rounded-2xl border border-line bg-paper p-4">
            <p className="font-mono text-xs tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-1 font-display text-2xl text-ink">{part.name}</h2>
            <p className="mt-2 text-sm text-ink">{part.definition}</p>
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-steel">{part.station}. </span>
              {part.here}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
