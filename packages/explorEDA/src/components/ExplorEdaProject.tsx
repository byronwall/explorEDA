import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Database, GitBranch } from "lucide-react";
import type { DatumObject } from "@/providers/DataLayerProvider";
import {
  ExplorEda,
  type ExplorEdaHandle,
  type ExplorEdaSidePanel,
  type SavedDataStructure,
} from "./ExplorEda";
import type {
  AnalysisProject,
  AnalysisSourceRow,
  AnalysisView,
} from "@/types/AnalysisProject";
import { useAnalysisEvaluation } from "@/lib/analysis/useAnalysisEvaluation";
import { ProjectSchemaPanel } from "./project/ProjectSchemaPanel";
import { ProjectQueryPanel } from "./project/ProjectQueryPanel";
import { AnalysisChartContextProvider } from "./AnalysisChartContext";
import {
  decodeAnalysisRowKeys,
  encodeAnalysisRowKeys,
  unresolvedAnalysisRowKeys,
} from "./project/analysisRowKeys";
import { incompatibleSettingsFields } from "./project/settingsCompatibility";

export interface ExplorEdaProjectChange {
  project: AnalysisProject;
  view: AnalysisView;
}

export interface ExplorEdaProjectProps {
  project: AnalysisProject;
  /** Source rows by source ID. Pass a new array when a table changes. */
  tables: Record<string, readonly AnalysisSourceRow[]>;
  view: AnalysisView;
  sidePanels?: ExplorEdaSidePanel[];
  /** Starting charts for a view of a query that has no settings yet. */
  queryPresets?: Record<string, SavedDataStructure>;
  /** A definition or view change: query, inputs, inspection, relationships. */
  onProjectChange: (change: ExplorEdaProjectChange) => void;
  /** Chart and filter edits for the view, like `ExplorEda`'s callback. */
  onStateChange?: (settings: SavedDataStructure) => void;
  /** Open a new view, with the project it needs when it adds a query. */
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
  readOnly?: boolean;
}

const FIELD_TYPES = {
  number: "numeric",
  string: "categorical",
  boolean: "boolean",
  date: "datetime",
} as const;

/**
 * A chart workspace over one query of a multi-table project. Each view picks
 * a query; its result rows are what the charts see. Schema and Query panels
 * edit the project and report every change through `onProjectChange`.
 */
export const ExplorEdaProject = forwardRef<
  ExplorEdaHandle,
  ExplorEdaProjectProps
>(function ExplorEdaProject(
  {
    project,
    tables,
    view,
    sidePanels = [],
    queryPresets,
    onProjectChange,
    onStateChange,
    onOpenView,
    readOnly = false,
  },
  ref
) {
  const chartRef = useRef<ExplorEdaHandle>(null);
  const [openPanel, setOpenPanel] = useState<"schema" | "query">();
  const [schemaWide, setSchemaWide] = useState(false);
  const [queryWide, setQueryWide] = useState(false);
  const [focusRowKeys, setFocusRowKeys] = useState<string[]>();
  // A read-only preview can still move through steps and rows; those
  // changes stay here instead of reaching the host.
  const [previewView, setPreviewView] = useState(view);
  useEffect(() => setPreviewView(view), [view]);
  const shownView = readOnly ? previewView : view;

  const query = project.queries.find((item) => item.id === shownView.queryId);
  const { evaluation, status, error, appliedBindings } = useAnalysisEvaluation(
    project,
    tables,
    shownView.queryId,
    shownView.bindings ?? EMPTY_BINDINGS
  );
  useEffect(() => setFocusRowKeys(undefined), [evaluation]);

  const data = useMemo<DatumObject[]>(
    () => evaluation.rows.map((row, __ID) => ({ ...row.data, __ID })),
    [evaluation]
  );
  const fieldNames = useMemo(
    () => evaluation.fields.map((field) => field.id),
    [evaluation]
  );
  const idsByKey = useMemo(
    () => new Map(evaluation.rows.map((row, index) => [row.key, index])),
    [evaluation]
  );
  const keysById = useMemo(
    () => new Map(evaluation.rows.map((row, index) => [index, row.key])),
    [evaluation]
  );

  const settings = shownView.settings ?? queryPresets?.[shownView.queryId];
  const incompatibleFields = useMemo(
    () => incompatibleSettingsFields(settings, new Set(fieldNames)),
    [settings, fieldNames]
  );
  const settingsCompatible = incompatibleFields.length === 0;
  const renderedSettings = useMemo(() => {
    if (!settings) return undefined;
    const decoded = decodeAnalysisRowKeys(settings, idsByKey);
    // Declared field names and types fill in what saved settings leave out.
    const declared = Object.fromEntries(
      evaluation.fields.map((field) => [
        field.id,
        {
          label: field.name,
          ...(field.type && field.type !== "unknown"
            ? { type: FIELD_TYPES[field.type] }
            : {}),
        },
      ])
    );
    return {
      ...decoded,
      fieldSettings: { ...declared, ...decoded.fieldSettings },
    };
  }, [settings, idsByKey, evaluation.fields]);

  useImperativeHandle(
    ref,
    () => ({
      getSettings: () => {
        if (settings && !settingsCompatible) return settings;
        if (!chartRef.current) {
          if (settings) return settings;
          throw new Error("Workspace settings are not ready.");
        }
        return encodeAnalysisRowKeys(chartRef.current.getSettings(), keysById);
      },
    }),
    [keysById, settings, settingsCompatible]
  );

  const update = (nextProject: AnalysisProject, nextView: AnalysisView) => {
    if (readOnly) setPreviewView(nextView);
    else onProjectChange({ project: nextProject, view: nextView });
  };
  const panel = (id: "schema" | "query") => ({
    open: openPanel === id,
    onOpenChange: (open: boolean) => setOpenPanel(open ? id : undefined),
  });

  const schemaPanel: ExplorEdaSidePanel = {
    id: "analysis-schema",
    label: "Schema",
    tooltip:
      "Schema: the project's tables, their fields, and the links between them",
    icon: <Database />,
    ...panel("schema"),
    wide: schemaWide,
    onWideChange: setSchemaWide,
    children: (
      <ProjectSchemaPanel
        project={project}
        queryId={shownView.queryId}
        tables={tables}
        readOnly={readOnly}
        onProjectChange={(next) => update(next, shownView)}
        onOpenView={readOnly ? undefined : onOpenView}
      />
    ),
  };
  const queryPanel: ExplorEdaSidePanel = {
    id: "analysis-query",
    label: "Query",
    tooltip: "Query: this view's steps, row counts, inputs, and source records",
    icon: <GitBranch />,
    ...panel("query"),
    wide: queryWide,
    onWideChange: setQueryWide,
    children: (
      <ProjectQueryPanel
        project={project}
        view={shownView}
        tables={tables}
        evaluation={evaluation}
        pending={status === "pending"}
        incompatibleFields={incompatibleFields}
        unresolvedRowKeys={unresolvedAnalysisRowKeys(shownView.settings).length}
        focusRowKeys={focusRowKeys}
        readOnly={readOnly}
        onChange={update}
        onClearFocus={() => setFocusRowKeys(undefined)}
        onResetSettings={() =>
          update(project, { ...shownView, settings: undefined })
        }
        onOpenView={readOnly ? undefined : onOpenView}
      />
    ),
  };

  const chartContext = useMemo(
    () => ({
      fields: evaluation.fields,
      sources: project.sources,
      steps: query?.steps ?? [],
      resultRows: evaluation.rows,
      onOpenQueryFlow: (rowKeys: string[]) => {
        setFocusRowKeys(rowKeys);
        setOpenPanel("query");
        if (shownView.inspection?.stepId)
          update(project, {
            ...shownView,
            inspection: { ...shownView.inspection, stepId: undefined },
          });
      },
    }),
    // `update` and `shownView` only matter when a trace opens the flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [evaluation, project, query, shownView]
  );

  return (
    <AnalysisChartContextProvider value={chartContext}>
      <ProjectScope
        glyph={query?.glyph}
        name={query?.name ?? "Missing query"}
        frame={query?.frameLabel}
        count={evaluation.counts.output}
        status={status}
        error={error}
        appliedBindings={appliedBindings}
        project={project}
      />
      <ExplorEda
        ref={chartRef}
        key={`${shownView.id}:${shownView.queryId}`}
        data={data}
        fieldNames={fieldNames}
        savedData={settingsCompatible ? renderedSettings : undefined}
        onStateChange={
          readOnly || !settingsCompatible
            ? undefined
            : (next) => onStateChange?.(encodeAnalysisRowKeys(next, keysById))
        }
        sidePanels={[...sidePanels, schemaPanel, queryPanel]}
        readOnly={readOnly}
      />
    </AnalysisChartContextProvider>
  );
});

const EMPTY_BINDINGS: Record<string, never> = {};

/**
 * One line for the whole view: which query feeds every chart, what a row
 * means, and how many there are. Charts share it, so it is not repeated.
 */
function ProjectScope({
  glyph,
  name,
  frame,
  count,
  status,
  error,
  appliedBindings,
  project,
}: {
  glyph?: string;
  name: string;
  frame?: string;
  count: number;
  status: "pending" | "ready" | "error";
  error?: string;
  appliedBindings?: Record<string, unknown>;
  project: AnalysisProject;
}) {
  const inputs = (project.parameters ?? [])
    .filter((parameter) => appliedBindings?.[parameter.id] != null)
    .map(
      (parameter) =>
        `${parameter.name} ${String(appliedBindings![parameter.id])}`
    );
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 px-1 pb-1.5 text-xs text-muted-foreground">
      <span className="min-w-0 truncate">
        <span aria-hidden="true" className="mr-1">
          {glyph}
        </span>
        <span className="font-medium text-foreground">{name}</span>
        {frame && <> · rows are {frame}</>} · {count.toLocaleString()}
        {inputs.length > 0 && <> · {inputs.join(", ")}</>}
      </span>
      {status === "pending" && (
        <span role="status" aria-live="polite">
          Updating…
        </span>
      )}
      {status === "error" && (
        <span role="alert" className="text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
