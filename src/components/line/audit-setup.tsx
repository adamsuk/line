import { useEffect, useState } from "react";
import { RECOMMENDATIONS, STATIONS, stationById, type StationId } from "@/factory/model";
import {
  ANSWERS,
  ANSWER_LABEL,
  SETUP_QUESTIONS,
  STATION_QUESTIONS,
  STORAGE_KEY,
  gapRecommendations,
  parseAnswers,
  scoreQuestions,
  stationResults,
  weakestStation,
  type Answer,
  type Answers,
  type AuditQuestion,
  type Score,
} from "@/factory/self-audit";
import { RecommendationList } from "@/components/line/recommendations";

function loadAnswers(): Answers {
  try {
    return parseAnswers(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}

/** Answers stay in this browser's localStorage. Nothing is sent anywhere. */
function useAnswers() {
  const [answers, setAnswers] = useState<Answers>(() => (typeof window === "undefined" ? {} : loadAnswers()));
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // Storage can be full or blocked. The audit still works for this visit.
    }
  }, [answers]);
  return [answers, setAnswers] as const;
}

export function AuditSetup() {
  const [answers, setAnswers] = useAnswers();
  const set = (id: string, a: Answer) => setAnswers((prev) => ({ ...prev, [id]: a }));
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h2 className="font-display text-3xl text-ink">Audit your setup</h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        Start with how work enters and how you know it worked. Then ask each station whether it can fail a
        change, on what evidence, and who can stop the line. Pick the rule that fits. Each gap points to that
        station's recommendations and tools.
      </p>
      <p className="mt-2 max-w-2xl text-xs text-muted">
        Your answers stay in this browser. Nothing is sent or shared.
        {answeredCount > 0 ? (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setAnswers({})}
              className="min-h-11 rounded-md px-1 font-medium text-steel underline underline-offset-4 hover:text-steel-2"
            >
              Clear answers
            </button>
          </>
        ) : null}
      </p>

      <section aria-labelledby="audit-setup" className="mt-6 rounded-2xl border border-line bg-paper p-4 sm:p-6">
        <h3 id="audit-setup" className="font-display text-2xl text-ink">
          Your setup
        </h3>
        <p className="mt-1 text-sm text-muted">Intent and outcome signal, then the line itself.</p>
        <ol className="mt-4 grid gap-4">
          {SETUP_QUESTIONS.map((q) => (
            <Question key={q.id} q={q} kicker={q.topic} answer={answers[q.id]} onAnswer={set} />
          ))}
        </ol>
        <ScoreLine score={scoreQuestions(SETUP_QUESTIONS, answers).score} />
      </section>

      <ol className="mt-6 grid gap-4">
        {STATIONS.map((s) => (
          <li key={s.id}>
            <section
              aria-labelledby={`audit-${s.id}`}
              className="rounded-2xl border border-line bg-paper p-4 sm:p-6"
            >
              <p className="font-mono text-xs text-faint">
                {s.index} · {s.part} · {s.owner}
              </p>
              <h3 id={`audit-${s.id}`} className="font-display text-2xl text-ink">
                {s.name}
              </h3>
              <ol className="mt-4 grid gap-4">
                {STATION_QUESTIONS[s.id].map((q, i) => (
                  <Question
                    key={q.id}
                    q={q}
                    kicker={i === 0 ? "Can it fail a change?" : undefined}
                    answer={answers[q.id]}
                    onAnswer={set}
                  />
                ))}
              </ol>
              <ScoreLine score={scoreQuestions(STATION_QUESTIONS[s.id], answers).score} />
            </section>
          </li>
        ))}
      </ol>

      <Summary answers={answers} />
    </div>
  );
}

function Question({
  q,
  kicker,
  answer,
  onAnswer,
}: {
  q: AuditQuestion;
  kicker?: string;
  answer: Answer | undefined;
  onAnswer: (id: string, a: Answer) => void;
}) {
  const rule: Record<Answer, string> = { covered: q.covered, partial: q.partial, gap: q.gap };
  return (
    <li className="rounded-xl border border-line p-3 sm:p-4">
      <fieldset>
        <legend className="text-sm text-ink">
          {kicker ? <span className="mr-2 font-mono text-xs text-steel">{kicker}</span> : null}
          {q.q}
        </legend>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {ANSWERS.map((a) => (
            <label
              key={a}
              className={
                "flex min-h-11 cursor-pointer gap-2 rounded-lg border p-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-steel " +
                (answer === a ? TONE[a] : "border-line hover:border-steel")
              }
            >
              <input
                type="radio"
                name={q.id}
                value={a}
                checked={answer === a}
                onChange={() => onAnswer(q.id, a)}
                className="mt-0.5 accent-steel"
              />
              <span>
                <span className="font-medium text-ink">{ANSWER_LABEL[a]}. </span>
                <span className="text-muted">{rule[a]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {answer === "gap" ? <GapLinks q={q} /> : null}
    </li>
  );
}

const TONE: Record<Answer, string> = {
  covered: "border-pass bg-pass-bg",
  partial: "border-hold bg-hold-bg",
  gap: "border-fail bg-fail-bg",
};

function GapLinks({ q }: { q: AuditQuestion }) {
  const station = stationById(q.station);
  const ids = gapRecommendations(q);
  const items = RECOMMENDATIONS.filter((r) => ids.includes(r.id));
  return (
    <details className="group mt-3" open>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-steel [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="transition-transform duration-150 group-open:rotate-90">
          ▸
        </span>
        Start with {station.index} {station.name}: {items.length === 1 ? "1 recommendation and its tools" : `${items.length} recommendations and their tools`}
      </summary>
      <div className="mt-2">
        <RecommendationList items={items} show="stage" withTools />
      </div>
    </details>
  );
}

const SCORE_TONE: Record<Score, string> = {
  Covered: "bg-pass-bg text-pass",
  Partial: "bg-hold-bg text-hold",
  Gap: "bg-fail-bg text-fail",
  "Not started": "bg-paper-2 text-muted",
};

function ScoreBadge({ score }: { score: Score }) {
  return (
    <span className={"inline-block whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-xs " + SCORE_TONE[score]}>
      {score}
    </span>
  );
}

function ScoreLine({ score }: { score: Score }) {
  return (
    <p className="mt-4 flex items-center gap-2 text-sm text-muted">
      So far: <ScoreBadge score={score} />
    </p>
  );
}

function recText(id: string | null) {
  return id ? RECOMMENDATIONS.find((r) => r.id === id)?.text ?? null : null;
}

function Summary({ answers }: { answers: Answers }) {
  const results = stationResults(answers);
  const weakest = weakestStation(results);
  const setup = scoreQuestions(SETUP_QUESTIONS, answers);
  return (
    <section aria-labelledby="audit-summary" className="mt-6 rounded-2xl border border-ink bg-paper p-4 sm:p-6">
      <h3 id="audit-summary" className="font-display text-2xl text-ink">
        Summary
      </h3>
      <p className="mt-1 text-sm text-muted">
        A station is covered when every answer is covered. It is a gap when it cannot fail a change, or half
        its answers are gaps. Otherwise it is partial. The weakest station has the worst score and the most
        gaps, ties going to the earliest.
      </p>
      <div aria-live="polite" className="mt-4 rounded-xl border border-line bg-paper-2 p-4 text-sm text-ink">
        {weakest ? (
          <p>
            <span className="font-medium">Weakest station: {stationById(weakest.id).index}{" "}
            {stationById(weakest.id).name}.</span>{" "}
            {weakest.canFail === "gap" ? "It cannot fail a change. " : ""}
            {recText(weakest.next) ? <>Start with: {recText(weakest.next)}</> : null}
          </p>
        ) : results.some((r) => r.score !== "Not started") ? (
          <p>No weak station yet. Every station you answered is covered.</p>
        ) : (
          <p>Answer a station to see where your line is weakest.</p>
        )}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="font-mono text-xs text-muted">
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-3 font-normal">Station</th>
              <th scope="col" className="py-2 pr-3 font-normal">Can fail a change</th>
              <th scope="col" className="py-2 pr-3 font-normal">Score</th>
              <th scope="col" className="py-2 pr-3 font-normal">Answered</th>
              <th scope="col" className="py-2 font-normal">Start with</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <th scope="row" className="py-2 pr-3 font-normal text-ink">Your setup</th>
              <td className="py-2 pr-3 text-muted">Not asked</td>
              <td className="py-2 pr-3"><ScoreBadge score={setup.score} /></td>
              <td className="py-2 pr-3 tabular-nums text-muted">{setup.answered} of {setup.total}</td>
              <td className="py-2 text-muted">{recText(setup.next) ?? "Nothing yet"}</td>
            </tr>
            {results.map((r) => {
              const s = stationById(r.id as StationId);
              const isWeakest = weakest?.id === r.id;
              return (
                <tr key={r.id} className={"border-b border-line " + (isWeakest ? "bg-fail-bg" : "")}>
                  <th scope="row" className="py-2 pr-3 font-normal text-ink">
                    {s.index} {s.name}
                    {isWeakest ? <span className="ml-2 font-mono text-xs text-fail">Weakest</span> : null}
                  </th>
                  <td className="py-2 pr-3 text-muted">{r.canFail ? ANSWER_LABEL[r.canFail] : "Not answered"}</td>
                  <td className="py-2 pr-3"><ScoreBadge score={r.score} /></td>
                  <td className="py-2 pr-3 tabular-nums text-muted">{r.answered} of {r.total}</td>
                  <td className="py-2 text-muted">{recText(r.next) ?? "Nothing yet"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
