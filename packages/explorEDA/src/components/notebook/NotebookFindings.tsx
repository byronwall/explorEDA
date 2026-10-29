import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import {
  evaluateFindings,
  findingFor,
  type FindingResult,
} from "@/lib/notebook/findings";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { measureInputs } from "../charts/MetricCard/measureInputs";
import { MetricCardTraceBody } from "../charts/MetricCard/MetricCardTraceBody";
import { Button } from "../ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";

interface NotebookFindingsValue {
  results: ReadonlyMap<string, FindingResult>;
  /** Opens a finding's current records beside the link that asked. */
  openRecords: (id: string, anchor: HTMLElement) => void;
}

const NotebookFindingsContext = createContext<NotebookFindingsValue | null>(
  null
);

export function useNotebookFindings() {
  return useContext(NotebookFindingsContext);
}

/** Every finding's current result, from the workspace as it is now. */
function useFindingResults() {
  const findings = useDataLayer((state) => state.findings);
  const charts = useDataLayer((state) => state.charts);
  const data = useDataLayer((state) => state.data);
  // Any selection or filter change gives new live items.
  const liveItems = useDataLayer((state) => state.liveItems);
  const nonce = useDataLayer((state) => state.nonce);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const rawData = useDataLayer((state) => state.rawData);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const calculations = useDataLayer((state) => state.calculations);
  return useMemo(() => {
    void liveItems;
    const byId = new Map(charts.map((chart) => [chart.id, chart]));
    return evaluateFindings(findings, {
      allIds: data.map((row) => row.__ID),
      eligible: (id) => {
        const chart = byId.get(id);
        return chart ? crossfilter.getChartFilteredRowIds(chart) : undefined;
      },
      // A notebook keeps each selection to its chart, so the crossfilter
      // leaves it out; the finding applies its owner's own test.
      selection: (id) => {
        const chart = byId.get(id);
        return chart ? crossfilter.getFilterFunction(chart) : undefined;
      },
      chartLabel: (id) => byId.get(id)?.title || id,
      column: getColumnData,
      measureInputs: (field, ids) =>
        measureInputs(field, ids, {
          rawData,
          fieldSettings,
          profiles,
          calculations,
        }),
      label: getFieldLabel,
      format: formatFieldValue,
      revision: String(nonce),
    });
  }, [
    findings,
    charts,
    data,
    liveItems,
    nonce,
    crossfilter,
    getColumnData,
    getFieldLabel,
    formatFieldValue,
    rawData,
    fieldSettings,
    profiles,
    calculations,
  ]);
}

/**
 * Provides the notebook's live findings to its prose, and shows one
 * finding's records in a popover beside the link that opened them.
 */
export function NotebookFindingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const results = useFindingResults();
  const [open, setOpen] = useState<{
    id: string;
    revision: string;
    anchor: HTMLElement;
  }>();
  const openRecords = useCallback(
    (id: string, anchor: HTMLElement) =>
      setOpen({ id, revision: findingFor(results, id).revision, anchor }),
    [results]
  );
  const value = useMemo(
    () => ({ results, openRecords }),
    [results, openRecords]
  );
  const current = open && findingFor(results, open.id);
  // Records belong to the inputs they were opened for; when those change,
  // the popover closes rather than showing other rows under an old value.
  const shown =
    open && current && current.revision === open.revision ? open : undefined;
  return (
    <NotebookFindingsContext.Provider value={value}>
      {children}
      <Popover
        open={Boolean(shown)}
        onOpenChange={(next) => {
          if (!next) setOpen(undefined);
        }}
      >
        {shown && (
          <PopoverAnchor
            virtualRef={{ current: shown.anchor }}
            key={shown.id}
          />
        )}
        {shown && current && (
          <PopoverContent
            align="start"
            className="eda-finding-records w-96 text-xs"
            aria-label={`Records for ${shown.id}`}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              shown.anchor.focus();
            }}
          >
            <FindingRecords
              result={current}
              onClose={() => setOpen(undefined)}
            />
          </PopoverContent>
        )}
      </Popover>
    </NotebookFindingsContext.Provider>
  );
}

function FindingRecords({
  result,
  onClose,
}: {
  result: FindingResult;
  onClose: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate font-medium">
          <span className="text-muted-foreground">Finding </span>
          {result.id}
          <span className="text-muted-foreground"> · </span>
          {result.text}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Close records"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {result.operands ? (
        <>
          <p>
            <span className="text-muted-foreground">Calculation </span>
            {result.calculation}
          </p>
          {result.operands.map((operand, index) => (
            <section
              key={index}
              className="space-y-1 border-t border-border pt-2"
              aria-label={`Records for ${operand.id}`}
            >
              <p className="font-medium">
                <span className="text-muted-foreground">
                  {
                    (result.kind === "share"
                      ? ["Part ", "Whole "]
                      : ["From ", "Minus "])[index]
                  }
                </span>
                {operand.id}
                <span className="text-muted-foreground"> · </span>
                {operand.text}
              </p>
              <OperandRecords result={operand} />
            </section>
          ))}
        </>
      ) : (
        <OperandRecords result={result} />
      )}
    </div>
  );
}

/** One summary's calculation and contributors, as a metric card traces them. */
function OperandRecords({ result }: { result: FindingResult }) {
  return result.plan ? (
    <MetricCardTraceBody
      trace={{
        kind: "metric-card",
        id: `finding:${result.id}`,
        revision: result.revision,
        plan: result.plan,
      }}
    />
  ) : (
    <p className="text-muted-foreground">{result.scope}</p>
  );
}
