// Parses CHANGELOG.md (Keep a Changelog style) for the site. The site imports the file itself
// at build time, so the page never drifts from the repo. Only the Markdown the changelog uses is
// handled: "## date" sections, "### group" headings, "- " items, paragraphs, and inline links,
// `code` and **bold**.

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "link"; text: string; href: string };

export interface ChangelogGroup {
  heading: string;
  items: Inline[][];
}

export interface ChangelogRelease {
  date: string;
  notes: Inline[][];
  groups: ChangelogGroup[];
}

export interface Changelog {
  intro: Inline[][];
  releases: ChangelogRelease[];
}

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "text", text: text.slice(last, at) });
    if (m[1] !== undefined) out.push({ kind: "link", text: m[1], href: m[2] });
    else if (m[3] !== undefined) out.push({ kind: "code", text: m[3] });
    else out.push({ kind: "strong", text: m[4] });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

export function parseChangelog(markdown: string): Changelog {
  const intro: Inline[][] = [];
  const releases: ChangelogRelease[] = [];
  let release: ChangelogRelease | null = null;
  let group: ChangelogGroup | null = null;
  let para: string[] = [];
  let item: string[] | null = null;

  const flush = () => {
    if (item) {
      group?.items.push(parseInline(item.join(" ")));
      item = null;
    }
    if (para.length) {
      (release ? release.notes : intro).push(parseInline(para.join(" ")));
      para = [];
    }
  };

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("# ")) {
      flush();
    } else if (line.startsWith("## ")) {
      flush();
      release = { date: line.slice(3).replace(/^\[|\]$/g, "").trim(), notes: [], groups: [] };
      releases.push(release);
      group = null;
    } else if (line.startsWith("### ")) {
      flush();
      group = { heading: line.slice(4).trim(), items: [] };
      release?.groups.push(group);
    } else if (line.startsWith("- ") && group) {
      flush();
      item = [line.slice(2)];
    } else if (!line) {
      flush();
    } else if (item) {
      item.push(line);
    } else {
      para.push(line);
    }
  }
  flush();
  return { intro, releases };
}

// Relative links in the changelog (CONTRIBUTING.md and the like) point at the repo on GitHub.
export function resolveHref(href: string, repoUrl: string): string {
  if (/^[a-z]+:/i.test(href) || href.startsWith("#")) return href;
  return `${repoUrl}/blob/main/${href.replace(/^\.?\//, "")}`;
}
