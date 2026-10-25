import { useEffect } from "react";
import { hashFor, routeFromHash } from "@/factory/routes";
import { useLine } from "@/factory/store";

/** Keeps the view in the URL hash, follows back and forward, and scrolls to an anchor. */
export function useHashRoute() {
  const view = useLine((s) => s.view);
  const anchor = useLine((s) => s.anchor);
  const setView = useLine((s) => s.setView);

  // Read the hash on load and when it changes.
  useEffect(() => {
    const apply = () => {
      const r = routeFromHash(window.location.hash);
      setView(r.view, r.anchor);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [setView]);

  // Write the hash when the view changes, without adding a history entry for each tab.
  useEffect(() => {
    const next = hashFor({ view, anchor });
    if (window.location.hash !== next) {
      const url = window.location.pathname + window.location.search + next;
      window.history.replaceState(null, "", url);
    }
    if (anchor) {
      requestAnimationFrame(() =>
        document.getElementById(anchor)?.scrollIntoView({ block: "start" }),
      );
    }
  }, [view, anchor]);
}
