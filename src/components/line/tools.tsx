import { useState, type ReactNode } from "react";
import {
  FIT_MEANING,
  STATIONS,
  TOOL_COVERAGE,
  type Fit,
  type StationId,
  type ToolCoverage,
  type ToolUse,
} from "@/factory/model";
import { MaturityBadge } from "@/components/line/recommendations";

const MARK: Record<Fit, string> = { Full: "●", Partial: "◐" };

function chipClass(fit: Fit) {
  return (
    "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 font-mono text-xs " +
    (fit === "Full" ? "border-steel bg-steel text-on-steel" : "border-steel/60 text-steel")
  );
}

function covered(tool: ToolCoverage) {
  return STATIONS.filter((s) => tool.stations[s.id].fit !== "None");
}

/** Tools with the stations they fully or partly cover, filterable by station. */
export function ToolsByStation() {
  const [station, setStation] = useState<StationId | null>(null);

  const tools = station
    ? TOOL_COVERAGE.filter((t) => t.stations[station].fit !== "None").sort(
        (a, b) =>
          Number(b.stations[station].fit === "Full") - Number(a.stations[station].fit === "Full") ||
          a.name.localeCompare(b.name),
      )
    : TOOL_COVERAGE;

  return (
    <div className="mt-4">
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {(Object.keys(FIT_MEANING) as Fit[]).map((f) => (
          <div key={f} className="flex items-start gap-2">
            <dt>
              <span className={chipClass(f)}>
                <span aria-hidden="true">{MARK[f]}</span> {f}
              </span>
            </dt>
            <dd className="text-muted">{FIT_MEANING[f]}</dd>
          </div>
        ))}
      </dl>

      <div
        role="group"
        aria-label="Filter tools by station"
        className="mt-4 flex flex-wrap gap-1.5"
      >
        <FilterButton active={station === null} onClick={() => setStation(null)}>
          All <span className="text-faint">{TOOL_COVERAGE.length}</span>
        </FilterButton>
        {STATIONS.map((s) => {
          const full = TOOL_COVERAGE.filter((t) => t.stations[s.id].fit === "Full").length;
          const part = TOOL_COVERAGE.filter((t) => t.stations[s.id].fit === "Partial").length;
          return (
            <FilterButton
              key={s.id}
              active={station === s.id}
              onClick={() => setStation(station === s.id ? null : s.id)}
              label={`${s.name}: ${full} full, ${part} partial`}
            >
              {s.name}{" "}
              <span aria-hidden="true" className="text-faint">
                {[full > 0 ? `${full}●` : "", part > 0 ? `${part}◐` : ""].filter(Boolean).join(" ")}
              </span>
            </FilterButton>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-3 text-xs text-muted">
        {station
          ? `${tools.length} tools at ${STATIONS.find((s) => s.id === station)?.name}, full first, with how each helps.`
          : "Pick a station to see how each tool helps there."}
      </p>

      <ul className="mt-2 divide-y divide-line border-y border-line">
        {tools.map((t) => (
          <li key={t.url} className="py-2.5">
            <div
              className={
                station
                  ? "flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4"
                  : "flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-nowrap sm:items-start sm:gap-4"
              }
            >
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-ink underline underline-offset-4 hover:text-steel sm:w-56 sm:shrink-0"
              >
                {t.name}
              </a>
              {station ? (
                <ul className="grid min-w-0 flex-1 gap-1 text-sm text-muted">
                  {dedupe(t.stations[station].uses).map((u) => (
                    <li key={u.recommendation} className="flex flex-wrap items-start gap-2">
                      <span className={chipClass(u.fit)}>
                        <span aria-hidden="true">{MARK[u.fit]}</span> {u.fit}
                      </span>
                      {u.maturity === "Cutting edge" ? (
                        <MaturityBadge maturity={u.maturity} />
                      ) : null}
                      <span className="min-w-0 flex-1 basis-48">{u.note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul
                  aria-label={`${t.name} stations`}
                  className="flex min-w-0 flex-1 flex-wrap gap-1.5"
                >
                  {covered(t).map((s) => {
                    const fit = t.stations[s.id].fit as Fit;
                    return (
                      <li key={s.id} className={chipClass(fit)}>
                        <span aria-hidden="true">{MARK[fit]}</span> {s.name}
                        <span className="sr-only">: {fit.toLowerCase()}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two recommendations at one station can share a tool note. Show it once. */
function dedupe(uses: ToolUse[]) {
  const seen = new Set<string>();
  return uses.filter((u) => {
    const key = `${u.fit}|${u.maturity}|${u.note}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function FilterButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={
        "min-h-11 rounded-lg border px-2.5 text-sm sm:px-3 transition-colors duration-150 " +
        (active ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-steel")
      }
    >
      {children}
    </button>
  );
}
