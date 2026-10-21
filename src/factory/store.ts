import { create } from "zustand";
import {
  type BenchChoice,
  type CheckState,
  type GateStatus,
  type StationId,
  CHECKS,
  LOCK_REASON,
  stationIndex,
} from "@/factory/model";

export interface LineState {
  view: "walk" | "parts";
  focus: StationId;
  notice: string | null;
  criteria: boolean[];
  accepted: boolean;
  branched: boolean;
  choice: BenchChoice | null;
  committed: boolean;
  commentResolved: boolean;
  approved: boolean;
  gate: GateStatus;
  checks: CheckState[];
  sealed: boolean;
  staging: boolean;
  production: boolean;
  signalRead: boolean;
  returned: boolean;
  setView: (view: "walk" | "parts") => void;
  focusStation: (id: StationId) => void;
  clearNotice: () => void;
  toggleCriterion: (index: number) => void;
  accept: () => void;
  cutBranch: () => void;
  pick: (choice: BenchChoice) => void;
  commit: () => void;
  resolveComment: () => void;
  approve: () => void;
  runGate: () => void;
  markCheck: (index: number, state: CheckState) => void;
  seal: () => void;
  promoteStaging: () => void;
  promoteProduction: () => void;
  readSignal: () => void;
  dropReturn: () => void;
  reset: () => void;
}

const initial = {
  view: "walk" as const,
  focus: "backlog" as StationId,
  notice: null as string | null,
  criteria: [false, false, false],
  accepted: false,
  branched: false,
  choice: null as BenchChoice | null,
  committed: false,
  commentResolved: false,
  approved: false,
  gate: "idle" as GateStatus,
  checks: CHECKS.map(() => "pending" as CheckState),
  sealed: false,
  staging: false,
  production: false,
  signalRead: false,
  returned: false,
};

export function frontierOf(s: Pick<
  LineState,
  | "accepted"
  | "branched"
  | "committed"
  | "approved"
  | "gate"
  | "sealed"
  | "production"
  | "signalRead"
  | "returned"
>): StationId {
  if (!s.accepted) return "backlog";
  if (!s.branched) return "source";
  if (!s.committed) return "bench";
  if (s.gate !== "passed") return "gate";
  if (!s.approved) return "review";
  if (!s.sealed) return "artifact";
  if (!s.production) return "release";
  if (!s.signalRead) return "observe";
  if (!s.returned) return "loop";
  return "loop";
}

function downstreamCleared() {
  return {
    commentResolved: false,
    approved: false,
    gate: "idle" as GateStatus,
    checks: CHECKS.map(() => "pending" as CheckState),
    sealed: false,
    staging: false,
    production: false,
    signalRead: false,
    returned: false,
  };
}

export const useLine = create<LineState>((set, get) => ({
  ...initial,
  setView: (view) => set({ view }),
  focusStation: (id) => {
    const frontier = frontierOf(get());
    if (stationIndex(id) > stationIndex(frontier)) {
      set({ notice: LOCK_REASON[id] });
      return;
    }
    set({ focus: id, notice: null });
  },
  clearNotice: () => set({ notice: null }),
  toggleCriterion: (index) => {
    if (get().accepted) return;
    const criteria = get().criteria.slice();
    criteria[index] = !criteria[index];
    set({ criteria });
  },
  accept: () => {
    if (!get().criteria.every(Boolean)) return;
    set({ accepted: true, notice: null });
  },
  cutBranch: () => set({ branched: true, notice: null }),
  pick: (choice) => {
    if (get().choice === choice && !get().committed) return;
    set({
      choice,
      committed: false,
      ...downstreamCleared(),
      notice: null,
    });
  },
  commit: () => {
    if (!get().choice) return;
    set({ committed: true, notice: null });
  },
  resolveComment: () => set({ commentResolved: true }),
  approve: () => {
    const s = get();
    if (s.gate !== "passed" || s.choice !== "budget" || !s.commentResolved) return;
    set({ approved: true, notice: null });
  },
  runGate: () => {
    if (get().gate === "running") return;
    const failAt = get().choice === "budget" ? -1 : 2;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    set({
      gate: "running",
      checks: CHECKS.map(() => "pending"),
      commentResolved: false,
      approved: false,
      sealed: false,
      staging: false,
      production: false,
      signalRead: false,
      returned: false,
      notice: null,
    });
    let i = 0;
    const tick = () => {
      if (get().gate !== "running") return;
      if (i >= CHECKS.length) {
        set({ gate: "passed" });
        return;
      }
      const running = get().checks.slice();
      running[i] = "running";
      set({ checks: running });
      window.setTimeout(() => {
        if (get().gate !== "running") return;
        const next = get().checks.slice();
        if (i === failAt) {
          next[i] = "fail";
          set({ checks: next, gate: "failed" });
          return;
        }
        next[i] = "pass";
        set({ checks: next });
        i += 1;
        tick();
      }, reduced ? 40 : 700);
    };
    tick();
  },
  markCheck: (index, state) => {
    const checks = get().checks.slice();
    checks[index] = state;
    set({ checks });
  },
  seal: () => {
    if (get().gate !== "passed" || !get().approved) return;
    set({ sealed: true });
  },
  promoteStaging: () => {
    if (!get().sealed) return;
    set({ staging: true });
  },
  promoteProduction: () => {
    if (!get().staging) return;
    set({ production: true });
  },
  readSignal: () => set({ signalRead: true }),
  dropReturn: () => set({ returned: true }),
  reset: () => set({ ...initial, criteria: [false, false, false], checks: CHECKS.map(() => "pending") }),
}));

export function doneCount(s: LineState): number {
  return [
    s.accepted,
    s.branched,
    s.committed,
    s.gate === "passed",
    s.approved,
    s.sealed,
    s.production,
    s.signalRead,
    s.returned,
  ].filter(Boolean).length;
}

export function stationDone(s: LineState, id: StationId): boolean {
  switch (id) {
    case "backlog":
      return s.accepted;
    case "source":
      return s.branched;
    case "bench":
      return s.committed;
    case "gate":
      return s.gate === "passed";
    case "review":
      return s.approved;
    case "artifact":
      return s.sealed;
    case "release":
      return s.production;
    case "observe":
      return s.signalRead;
    case "loop":
      return s.returned;
  }
}
