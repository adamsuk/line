import {
  MATURITY,
  referenceById,
  stationById,
  type Maturity,
  type Recommendation,
} from "@/factory/model";

export function MaturityBadge({ maturity }: { maturity: Maturity }) {
  const tone = maturity === "Best practice" ? "bg-pass-bg text-pass" : "bg-hold-bg text-hold";
  return (
    <span
      className={
        "inline-block shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-xs " + tone
      }
    >
      {maturity}
    </span>
  );
}

export function MaturityLegend() {
  return (
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      {(Object.keys(MATURITY) as Maturity[]).map((m) => (
        <div key={m} className="flex items-start gap-2">
          <dt>
            <MaturityBadge maturity={m} />
          </dt>
          <dd className="text-muted">{MATURITY[m]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RecommendationList({
  items,
  show,
}: {
  items: Recommendation[];
  show: "station" | "stage";
}) {
  if (items.length === 0) return null;
  return (
    <ul className="grid gap-3">
      {items.map((r) => (
        <li key={r.id} className="rounded-xl border border-line p-3">
          <div className="flex flex-wrap items-center gap-2">
            <MaturityBadge maturity={r.maturity} />
            <span className="font-mono text-xs text-faint">
              {show === "station"
                ? `${stationById(r.station).index} · ${stationById(r.station).name}`
                : r.stage === "Start"
                  ? "Start here"
                  : r.stage}
            </span>
          </div>
          <p className="mt-2 text-sm text-ink">{r.text}</p>
          <p className="mt-2 text-xs text-muted">
            From{" "}
            {r.sources.map((id, i) => {
              const ref = referenceById(id);
              return (
                <span key={id}>
                  {i > 0 ? "; " : null}
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-steel underline underline-offset-4 hover:text-steel-2"
                  >
                    {ref.title}
                  </a>
                </span>
              );
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
