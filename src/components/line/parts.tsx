import { PARTS } from "@/factory/model";

export function Parts() {
  return (
    <section id="parts" aria-labelledby="parts-heading" className="mx-auto max-w-6xl scroll-mt-4 px-4 py-6 sm:px-6">
      <h2 id="parts-heading" className="font-display text-3xl text-ink">
        The parts
      </h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        These are the objects that move. Stations are where a person, an agent, or a machine touches them. Learn the
        object and you can recognize it in any repo, not just this one.
      </p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {PARTS.map((part, i) => (
          <li key={part.name} className="rounded-2xl border border-line bg-paper p-4">
            <p className="font-mono text-xs tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 font-display text-2xl text-ink">{part.name}</h3>
            <p className="mt-2 text-sm text-ink">{part.definition}</p>
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-steel">{part.station}. </span>
              {part.here}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
