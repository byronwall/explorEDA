import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AggregateResult } from "@/lib/aggregates";
import type { datum } from "@/types/ChartTypes";
import type { AggregateBarPlan } from "./barPlanner";
import type { ChartGuide } from "../BaseChart";

export type BarTraceSelection = {
  kind: "bar" | "guide" | "title";
  id: string;
  owner?: string;
  revision?: string;
  field: string;
  fieldLabel?: string;
  guide?: ChartGuide;
  bar?: {
    markId: string;
    label: string;
    value: number;
    groupValue: datum;
    start?: number;
    end?: number;
    geometry: { x: number; y: number; width: number; height: number };
    baseline?: number;
    fill?: string;
  };
  result?: AggregateResult;
  selectedRowId?: string;
  plan?: AggregateBarPlan;
  xScale: { type: string; domain: readonly unknown[]; range: readonly unknown[] };
  yScale: { type: string; domain: readonly unknown[]; range: readonly unknown[] };
  scopeDescription?: string;
  inspect?: (selection: BarTraceSelection) => void;
};

type ChartRegistration = {
  inspect: (selection: BarTraceSelection) => void;
  findRow: (id: number) => boolean;
  guides: () => BarTraceSelection[];
  title: () => BarTraceSelection;
};

type BarTraceContextValue = {
  selection: BarTraceSelection | null;
  select: (selection: BarTraceSelection | null) => void;
  register: (owner: string, registration: ChartRegistration) => () => void;
  inspectFirst: (selection: BarTraceSelection) => void;
  inspectRow: (id: number) => boolean;
  guides: BarTraceSelection[];
  inspectTitle: () => void;
};

const Context = createContext<BarTraceContextValue | null>(null);

const sameGuides = (left: BarTraceSelection[], right: BarTraceSelection[]) =>
  left.length === right.length &&
  left.every((guide, index) => {
    const next = right[index];
    return (
      guide.id === next?.id &&
      JSON.stringify(guide.xScale.domain) === JSON.stringify(next?.xScale.domain) &&
      JSON.stringify(guide.yScale.domain) === JSON.stringify(next?.yScale.domain) &&
      guide.guide?.x === next?.guide?.x &&
      guide.guide?.y === next?.guide?.y
    );
  });

export function BarTraceScope({ children }: { children: ReactNode }) {
  const [selection, select] = useState<BarTraceSelection | null>(null);
  const [guides, setGuides] = useState<BarTraceSelection[]>([]);
  const charts = useRef(new Map<string, ChartRegistration>());
  const register = useCallback((owner: string, registration: ChartRegistration) => {
    charts.current.set(owner, registration);
    const next = charts.current.values().next().value?.guides() ?? [];
    setGuides((current) => (sameGuides(current, next) ? current : next));
    return () => {
      charts.current.delete(owner);
      queueMicrotask(() => {
        if (charts.current.size === 0) setGuides([]);
        else {
          const next = charts.current.values().next().value?.guides() ?? [];
          setGuides((current) => (sameGuides(current, next) ? current : next));
        }
      });
    };
  }, []);
  const inspectFirst = useCallback((next: BarTraceSelection) => {
    charts.current.values().next().value?.inspect(next);
  }, []);
  const inspectRow = useCallback((id: number) => {
    for (const chart of charts.current.values()) {
      if (chart.findRow(id)) return true;
    }
    return false;
  }, []);
  const inspectTitle = useCallback(() => {
    const chart = charts.current.values().next().value;
    if (chart) chart.inspect(chart.title());
  }, []);
  return (
    <Context.Provider value={{ selection, select, register, inspectFirst, inspectRow, guides, inspectTitle }}>
      {children}
    </Context.Provider>
  );
}

export function useBarTraceSelection() {
  return useContext(Context);
}
