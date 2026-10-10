import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
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
import {
  useAnalysisEvaluation,
  type AnalysisWorker,
} from "@/lib/analysis/useAnalysisEvaluation";
import { ProjectSchemaPanel } from "./project/ProjectSchemaPanel";
import { ProjectQueryPanel } from "./project/ProjectQueryPanel";
import { AnalysisChartContextProvider } from "./AnalysisChartContext";
import {
  decodeAnalysisRowKeys,
  encodeAnalysisRowKeys,
  unresolvedAnalysisRowKeys,
} from "./project/analysisRowKeys";
import { incompatibleSettingsFields } from "./project/settingsCompatibility";
import { projectSchemaGraph } from "@/lib/schema/schemaGraph";

export interface ExplorEdaProjectChange {
  project: AnalysisProject;
  view: AnalysisView;
}

export interface ExplorEdaProjectProps {
  project: AnalysisProject;
  /** Source rows by source ID. Pass a new array when a table changes. */
  tables: Record<string, readonly AnalysisSourceRow[]>;
  view: AnalysisView;
  /**
   * Every saved view of the project, so the Schema diagram can show what
   * each one reads. Without it, the diagram shows only the current view.
   */
  views?: AnalysisView[];
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
  /**
   * Runs queries in a worker so large projects keep input responsive. Pass
   * `createAnalysisWorker` from `exploreda/analysis`; without it, queries run
   * on the main thread.
   */
  createWorker?: () => AnalysisWorker;
  /** Host content that leads the toolbar line, like `ExplorEda`'s prop. */
  toolbarStart?: ReactNode;
  /** Host actions that end the toolbar line, like `ExplorEda`'s prop. */
  toolbarEnd?: ReactNode;
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
    views,
    sidePanels = [],
    queryPresets,
    onProjectChange,
    onStateChange,
    onOpenView,
    readOnly = false,
    createWorker,
    toolbarStart,
    toolbarEnd,
  },
  ref
) {
  const chartRef = useRef<ExplorEdaHandle>(null);
  const [openPanel, setOpenPanel] = useState<"schema" | "query">();
  const [diagramOpen, setDiagramOpen] = useState(false);

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
    shownView.bindings ?? EMPTY_BINDINGS,
    createWorker
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
  const schemaViews = useMemo(
    () => [
      {
        id: shownView.id,
        name: shownView.name,
        queryId: shownView.queryId,
        settings,
        current: true,
        othersHidden: !views,
      },
      // Other views, with the starting charts a view without settings gets.
      ...(views ?? [])
        .filter((item) => item.id !== shownView.id)
        .map((item) => ({
          id: item.id,
          name: item.name,
          queryId: item.queryId,
          settings: item.settings ?? queryPresets?.[item.queryId],
        })),
    ],
    [
      shownView.id,
      shownView.name,
      shownView.queryId,
      settings,
      views,
      queryPresets,
    ]
  );
  const schemaGraph = useMemo(
    () => projectSchemaGraph(project, tables, schemaViews),
    [project, tables, schemaViews]
  );
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
    // Saved settings for a field add to its declared name and type.
    const fieldSettings: NonNullable<SavedDataStructure["fieldSettings"]> = {
      ...declared,
    };
    for (const [id, saved] of Object.entries(decoded.fieldSettings ?? {})) {
      fieldSettings[id] = { ...declared[id], ...saved };
    }
    return { ...decoded, fieldSettings };
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
        onOpenDiagram={() => {
          setOpenPanel(undefined);
          setDiagramOpen(true);
        }}
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
      {status === "pending" && evaluation.revision === "unavailable" ? (
        // Nothing has finished yet. Charts wait rather than draw an empty
        // result that saved settings would not match. Host controls stay.
        <>
          {(toolbarStart || toolbarEnd) && (
            <div className="flex items-center justify-between gap-2">
              {toolbarStart}
              {toolbarEnd}
            </div>
          )}
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">
            Running the query…
          </p>
        </>
      ) : (
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
          schema={{
            graph: schemaGraph,
            editing: readOnly
              ? undefined
              : {
                  project,
                  tables,
                  onChange: (next) => update(next, shownView),
                  views: schemaViews,
                  onOpenView,
                },
            viewId: shownView.id,
            open: diagramOpen,
            onOpenChange: setDiagramOpen,
          }}
          readOnly={readOnly}
          toolbarStart={toolbarStart}
          toolbarEnd={toolbarEnd}
        />
      )}
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
