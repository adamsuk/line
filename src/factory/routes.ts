// Hash routes. Three views, plus anchors for the parts (on Home) and the audit (in the guide).
// Older links to #parts and #audit still land on the right section.

export type View = "home" | "walk" | "guide";
export type Anchor = "parts" | "audit" | null;

export interface Route {
  view: View;
  anchor: Anchor;
}

export function routeFromHash(hash: string): Route {
  const key = hash.replace(/^#\/?/, "").toLowerCase();
  switch (key) {
    case "walk":
      return { view: "walk", anchor: null };
    case "guide":
      return { view: "guide", anchor: null };
    case "parts":
      return { view: "home", anchor: "parts" };
    case "audit":
      return { view: "guide", anchor: "audit" };
    default:
      return { view: "home", anchor: null };
  }
}

export function hashFor(route: Route): string {
  if (route.anchor) return `#${route.anchor}`;
  return route.view === "home" ? "" : `#${route.view}`;
}
