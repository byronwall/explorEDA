import { createContext, useContext, type ReactNode } from "react";
import type {
  AnalysisField,
  AnalysisResultRow,
  AnalysisStep,
  SourceDefinition,
} from "@/types/AnalysisProject";
import type { ChartTrace } from "./charts/trace/traceTypes";
import type { Filter } from "@/types/FilterTypes";

export interface QueryChartFilterScope {
  chartId: string;
  label: string;
  filters: Filter[];
}

export function queryChartFilterRevision(
  chartId: string | undefined,
  scopes: QueryChartFilterScope[]
) {
  return JSON.stringify(
    scopes
      .filter((scope) => scope.chartId !== chartId)
      .map(({ chartId: id, filters }) => [id, filters])
  );
}

export interface QueryFlowTraceHandoff {
  trace: ChartTrace;
  owner: string;
  chartId?: string;
  queryRevision: string;
  filterRevision: string;
  traceRevision: string;
}

export interface AnalysisChartContextValue {
  query: { id: string; label: string; glyph: string };
  queryRevision: string;
  frame: { id: string; label: string; glyph: string };
  /** Rows in the selected query result, before chart and view filters. */
  availableCount: number;
  /** Evaluator rows keyed by the runtime numeric ID assigned at the chart boundary. */
  resultRowsById: Record<number, AnalysisResultRow>;
  chartFilterScopes: QueryChartFilterScope[];
  fields?: AnalysisField[];
  sources?: SourceDefinition[];
  steps?: AnalysisStep[];
  onOpenQueryFlow?: (rowKey?: string, handoff?: QueryFlowTraceHandoff) => void;
  onTraceRevision?: (owner: string | undefined, revision?: string) => void;
}

const Context = createContext<AnalysisChartContextValue | undefined>(undefined);

export function AnalysisChartContextProvider({
  value,
  children,
}: {
  value: AnalysisChartContextValue;
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAnalysisChartContext() {
  return useContext(Context);
}
