import type { ReactNode } from "react";

/** A native disclosure. Closed on first load, opens with click, Enter, or Space. */
export function Disclosure({
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
