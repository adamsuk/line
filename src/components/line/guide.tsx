import { ADOPTION_STAGES, GUIDE, STATIONS, recommendationsFor } from "@/factory/model";
import { MaturityLegend, RecommendationList } from "@/components/line/recommendations";
import { SourceLink } from "@/components/line/stage";
import { AssessWithLlm } from "@/components/line/assess";

export function Guide() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <p className="max-w-2xl text-base text-muted">
        Bring agents in a stage at a time. Start with the cheap checks and a review bot. Add more once people
        trust them. Put the guardrails up before any coding agent writes code. Keep a person where judgment
        matters.
      </p>
      <div className="mt-4 max-w-4xl rounded-xl border border-line p-4">
        <p className="font-mono text-xs text-muted">Each recommendation carries a label</p>
        <div className="mt-2">
          <MaturityLegend />
        </div>
      </div>
      <AssessWithLlm />
      <ol className="mt-6 grid gap-4">
        {ADOPTION_STAGES.map((group) => (
          <li key={group.stage} className="rounded-2xl border border-line bg-paper p-4 sm:p-6">
            <h2 className="font-display text-2xl text-ink">
              {group.stage === "Start" ? "Start here" : group.stage}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">{group.summary}</p>
            {group.sources.map((ref) => (
              <SourceLink key={ref} id={ref} />
            ))}
            <ul className="mt-4 grid gap-3 empty:hidden md:grid-cols-2">
              {STATIONS.filter((s) => GUIDE[s.id].stage === group.stage).map((s) => (
                <li key={s.id} className="rounded-xl border border-line p-4">
                  <p className="font-mono text-xs text-faint">
                    {s.index} · {s.name}
                  </p>
                  <p className="mt-2 text-sm text-ink">
                    <span className="font-medium text-steel">Bot. </span>
                    {GUIDE[s.id].bot}
                  </p>
                  <p className="mt-2 text-sm text-ink">
                    <span className="font-medium text-steel">Human. </span>
                    {GUIDE[s.id].human}
                  </p>
                </li>
              ))}
            </ul>
            {recommendationsFor({ stage: group.stage }).length > 0 ? (
              <div className="mt-4">
                <h3 className="font-mono text-xs text-muted">Recommendations</h3>
                <div className="mt-2">
                  <RecommendationList items={recommendationsFor({ stage: group.stage })} show="station" />
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
