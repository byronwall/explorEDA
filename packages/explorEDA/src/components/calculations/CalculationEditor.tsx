import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalculationManager,
  type CalculationDefinition,
} from "@/lib/calculations/CalculationState";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { useDataLayer, type DatumObject } from "@/providers/DataLayerProvider";
import {
  getChartFields,
  getChartTitle,
} from "@/components/charts/chartAccessibility";
import { CalculationForm, type CalculationDraft } from "./CalculationForm";
import { CalculationPreview } from "./CalculationPreview";
import { CalculationTrace } from "./CalculationTrace";
import { dependentCalculations } from "./calculationHelpers";
import { CheckCircle2, CircleAlert } from "lucide-react";

type Editor = {
  open: (
    name?: string,
    rowId?: number,
    returnFocus?: HTMLElement | null
  ) => void;
};
const EditorContext = createContext<Editor | null>(null);
export const useCalculationEditor = () => useContext(EditorContext);
type Preview = {
  key: string;
  manager?: CalculationManager<DatumObject>;
  calculation?: CalculationDefinition;
  error?: string;
};

export function CalculationEditorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const data = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const savedManager = useDataLayer((state) => state.calculationManager);
  const charts = useDataLayer((state) => state.charts);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const addCalculation = useDataLayer((state) => state.addCalculation);
  const updateCalculation = useDataLayer((state) => state.updateCalculation);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string>();
  const [root, setRoot] = useState<string>();
  const [rowId, setRowId] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, CalculationDraft>>({});
  const [preview, setPreview] = useState<Preview>();
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = useCallback(
    (name?: string, row?: number, target?: HTMLElement | null) => {
      returnFocus.current = target ?? (document.activeElement as HTMLElement);
      setSelected(name);
      setRoot(name);
      setRowId(row ?? 0);
      setSaveError("");
      setSavedMessage("");
      setVisible(true);
    },
    []
  );
  const editor = useMemo(() => ({ open }), [open]);
  useEffect(() => {
    setDrafts({});
    setVisible(false);
  }, [data]);

  const key = selected ?? "";
  const calculation = calculations.find(
    (calc) => calc.resultColumnName === selected
  );
  const draft = Object.hasOwn(drafts, key)
    ? drafts[key]!
    : {
        name: calculation?.resultColumnName ?? "",
        expression: calculation?.expression.rawInput ?? "",
      };
  const dirty =
    draft.name !== (calculation?.resultColumnName ?? "") ||
    draft.expression !== (calculation?.expression.rawInput ?? "");
  const previewKey = JSON.stringify([selected, draft.name, draft.expression]);
  useEffect(() => {
    if (!visible) return;
    setPreview(undefined);
    const timer = setTimeout(() => {
      if (!draft.name.trim() || !draft.expression.trim()) {
        setPreview({ key: previewKey });
        return;
      }
      try {
        const candidate = {
          resultColumnName: draft.name.trim(),
          expression: parseExpression(draft.expression),
        };
        const manager = new CalculationManager(data, [
          ...calculations.filter((calc) => calc.resultColumnName !== selected),
          candidate,
        ]);
        manager.executeCalculation(candidate);
        setPreview({ key: previewKey, manager, calculation: candidate });
      } catch (error) {
        setPreview({
          key: previewKey,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [visible, previewKey, data, calculations]);
  const current = preview?.key === previewKey ? preview : undefined;
  const checking =
    !current && Boolean(draft.name.trim() && draft.expression.trim());
  const dependents = dependentCalculations(
    calculations,
    selected ?? draft.name
  );
  const affected = new Set([
    selected ?? draft.name,
    ...dependents.map((calc) => calc.resultColumnName),
  ]);
  const usedViews = charts.filter((chart) =>
    [
      ...getChartFields(chart),
      ...chart.filters.map((filter) => filter.field),
      chart.facet?.rowVariable,
      chart.facet?.type === "grid" ? chart.facet.columnVariable : undefined,
    ].some((field) => field && affected.has(field))
  );
  const nameLocked = Boolean(
    calculation && (dependents.length || usedViews.length)
  );
  const canApply = Boolean(dirty && current?.manager && current.calculation);
  const errorCount = current?.manager?.getErrors(draft.name.trim()).size ?? 0;
  const removeDraft = () =>
    setDrafts((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  const apply = async () => {
    if (!canApply || !current?.calculation) return;
    try {
      if (selected) updateCalculation(selected, current.calculation);
      else await addCalculation(current.calculation);
      removeDraft();
      const name = current.calculation.resultColumnName;
      setSelected(name);
      if (!root || root === selected) setRoot(name);
      setSaveError("");
      setSavedMessage(
        "Applied. All dependent calculations and views are up to date."
      );
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    }
  };
  const traceManager = current?.manager ?? savedManager;
  const traceCalculations = traceManager.getCalculations();
  const traceRoot =
    root === selected
      ? (current?.calculation?.resultColumnName ?? root)
      : (root ?? current?.calculation?.resultColumnName);
  const selectedRow = data.find((row) => row.__ID === rowId) ?? data[0];
  const status =
    saveError || current?.error ? (
      <p role="alert" className="eda-calc-error">
        <CircleAlert aria-hidden="true" size={16} />
        <span>{saveError || current?.error}</span>
      </p>
    ) : checking ? (
      <p role="status">
        Checking formula against {data.length.toLocaleString()} loaded rows…
      </p>
    ) : current?.manager ? (
      <p
        role="status"
        className={errorCount ? "eda-calc-error" : "eda-calc-valid"}
      >
        {errorCount ? (
          <CircleAlert size={16} aria-hidden="true" />
        ) : (
          <CheckCircle2 size={16} aria-hidden="true" />
        )}
        <span>
          {errorCount
            ? errorCount.toLocaleString() +
              " of " +
              data.length.toLocaleString() +
              " rows failed. Valid rows remain available."
            : "Valid for all " + data.length.toLocaleString() + " rows."}
          {savedMessage && " " + savedMessage}
        </span>
      </p>
    ) : (
      <p>Enter a field name and formula to preview results.</p>
    );
  return (
    <EditorContext.Provider value={editor}>
      {children}
      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent
          className="eda-calc-editor"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus.current?.isConnected) returnFocus.current.focus();
          }}
        >
          <DialogHeader className="eda-calc-editor-header">
            <DialogTitle>
              <span className="eda-calc-symbol mr-2">ƒx</span>
              {selected ? "Inspect calculation" : "New calculation"}
            </DialogTitle>
            <DialogDescription>
              {root
                ? "Following " +
                  root +
                  ". Preview a change before applying it to the analysis."
                : "Turn source fields into values you can reuse in any view."}
            </DialogDescription>
          </DialogHeader>
          <CalculationForm
            key={key}
            draft={draft}
            onChange={(next) => {
              setDrafts((previous) => ({ ...previous, [key]: next }));
              setSaveError("");
              setSavedMessage("");
            }}
            fields={getColumnNames().filter((field) => field !== selected)}
            calculatedFields={calculations.map((calc) => calc.resultColumnName)}
            editing={Boolean(calculation)}
            nameLocked={nameLocked}
            checking={checking}
            canApply={canApply}
            dirty={dirty}
            status={status}
            impact={
              dependents.length +
              " dependent calculations · " +
              usedViews.length +
              " affected views"
            }
            onApply={apply}
            onDiscard={() => {
              removeDraft();
              setSaveError("");
              setSavedMessage("");
            }}
            onClose={() => setVisible(false)}
            preview={
              current?.manager && current.calculation ? (
                <CalculationPreview
                  key={key}
                  calculation={current.calculation}
                  manager={current.manager}
                  savedManager={savedManager}
                  data={data}
                  selectedRow={selectedRow?.__ID ?? 0}
                  onSelectRow={setRowId}
                  changed={dirty}
                />
              ) : (
                <div className="eda-calc-preview-empty">
                  <h3>See the result before you apply</h3>
                  <p>
                    Inputs, saved values, and draft results appear here once the
                    formula is valid.
                  </p>
                </div>
              )
            }
            trace={
              <>
                {dirty && !current?.manager && (
                  <p className="eda-calc-help mb-3">
                    The chain shows saved values until this draft can be
                    previewed.
                  </p>
                )}
                {traceRoot && selectedRow ? (
                  <CalculationTrace
                    calculations={traceCalculations}
                    manager={traceManager}
                    row={selectedRow}
                    root={traceRoot}
                    selected={selected ?? draft.name}
                    draftFields={Object.keys(drafts)}
                    previewing={Boolean(current?.manager)}
                    onSelect={(field) => {
                      if (
                        root &&
                        dependentCalculations(calculations, root).some(
                          (calc) => calc.resultColumnName === field
                        )
                      )
                        setRoot(field);
                      setSelected(field);
                      setSaveError("");
                      setSavedMessage("");
                    }}
                  />
                ) : (
                  <p className="eda-calc-help">
                    Add a formula to see how its fields connect.
                  </p>
                )}
                {usedViews.length > 0 && (
                  <section className="mt-6">
                    <h3 className="text-sm font-medium">Used in views</h3>
                    <ul className="eda-calc-view-list">
                      {usedViews.map((chart) => (
                        <li key={chart.id}>
                          {getChartTitle(chart, getFieldLabel)}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            }
          />
        </DialogContent>
      </Dialog>
    </EditorContext.Provider>
  );
}
