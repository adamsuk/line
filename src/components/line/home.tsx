import { HOMEPAGE } from "@/factory/self-audit";
import { useLine } from "@/factory/store";

export function Home() {
  const setView = useLine((s) => s.setView);
  return (
    <section aria-labelledby="home-headline" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h2 id="home-headline" className="font-display text-4xl leading-tight text-ink sm:text-5xl">
        {HOMEPAGE.headline}
      </h2>
      <p className="mt-4 max-w-3xl font-display text-xl leading-snug text-ink sm:text-2xl">{HOMEPAGE.thesis}</p>
      <h3 className="mt-8 font-mono text-xs text-muted">Why a line</h3>
      <p className="mt-2 max-w-2xl text-base text-muted">{HOMEPAGE.why}</p>
      <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
        <Cta label="Walk the line" detail={HOMEPAGE.walk} primary onClick={() => setView("walk")} />
        <Cta label="Audit your setup" detail={HOMEPAGE.audit} onClick={() => setView("audit")} />
      </div>
    </section>
  );
}

function Cta({
  label,
  detail,
  primary = false,
  onClick,
}: {
  label: string;
  detail: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex min-h-11 flex-col items-start rounded-2xl border p-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel " +
        (primary
          ? "border-ink bg-ink text-paper hover:bg-steel"
          : "border-line bg-paper text-ink hover:border-steel")
      }
    >
      <span className="font-display text-xl">{label} →</span>
      <span className={"mt-1 text-sm " + (primary ? "text-paper/80" : "text-muted")}>{detail}</span>
    </button>
  );
}
