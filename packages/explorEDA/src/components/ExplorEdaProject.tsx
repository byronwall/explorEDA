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
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisSourceRow,
  AnalysisView,
} from "@/types/AnalysisProject";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
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
  tables: Record<string, readonly AnalysisSourceRow[]>;
  view: AnalysisView;
  sidePanels?: ExplorEdaSidePanel[];
  queryPresets?: Record<string, SavedDataStructure>;
  onProjectChange: (change: ExplorEdaProjectChange) => void;
  onStateChange?: (settings: SavedDataStructure) => void;
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
  readOnly?: boolean;
}

/** Controlled multi-source workspace around the existing chart renderer. */
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
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);
  const [schemaWide, setSchemaWide] = useState(false);
  const [queryWide, setQueryWide] = useState(false);
  const [readOnlyView, setReadOnlyView] = useState(view);
  useEffect(() => setReadOnlyView(view), [view]);
  const shownView = readOnly ? readOnlyView : view;

  const query = project.queries.find((item) => item.id === shownView.queryId);
  const evaluated = useMemo(() => {
    if (!query)
      return {
        evaluation: emptyEvaluation(shownView.queryId),
        error: "This view points to a missing query.",
      };
    try {
      return {
        evaluation: evaluateAnalysisQuery(
          project,
          tables,
          shownView.queryId,
          shownView.bindings ?? {}
        ),
        error: "",
      };
    } catch (error) {
      return {
        evaluation: emptyEvaluation(shownView.queryId),
        error:
          error instanceof Error
            ? error.message
            : "The query could not be evaluated.",
      };
    }
  }, [project, tables, shownView.queryId, shownView.bindings, query]);
  const data = useMemo<DatumObject[]>(
    () => evaluated.evaluation.rows.map((row, __ID) => ({ ...row.data, __ID })),
    [evaluated.evaluation]
  );
  const settings = shownView.settings ?? queryPresets?.[shownView.queryId];
  const idsByKey = useMemo(
    () =>
      new Map(evaluated.evaluation.rows.map((row, index) => [row.key, index])),
    [evaluated.evaluation]
  );
  const keysById = useMemo(
    () =>
      new Map(evaluated.evaluation.rows.map((row, index) => [index, row.key])),
    [evaluated.evaluation]
  );
  const runtimeSettings = useMemo(
    () => (settings ? decodeAnalysisRowKeys(settings, idsByKey) : undefined),
    [settings, idsByKey]
  );
  const declaredFieldSettings = Object.fromEntries(
    evaluated.evaluation.fields.map((field) => [
      field.id,
      {
        label: field.name,
        ...(field.type === "number"
          ? { type: "numeric" as const }
          : field.type === "string"
            ? { type: "categorical" as const }
            : field.type === "boolean"
              ? { type: "boolean" as const }
              : field.type === "date"
                ? { type: "datetime" as const }
                : {}),
      },
    ])
  );
  const renderedSettings = runtimeSettings
    ? {
        ...runtimeSettings,
        fieldSettings: {
          ...declaredFieldSettings,
          ...runtimeSettings.fieldSettings,
        },
      }
    : undefined;
  const availableFields = new Set(
    evaluated.evaluation.fields.map((field) => field.id)
  );
  const incompatibleFields = incompatibleSettingsFields(settings, availableFields);
  const settingsCompatible = incompatibleFields.length === 0;
  const unresolvedKeys = unresolvedAnalysisRowKeys(shownView.settings);
  const fieldNames = useMemo(() => evaluated.evaluation.fields.map(field => field.id), [evaluated.evaluation]);
  const resultRowsById = useMemo(
    () =>
      Object.fromEntries(
        evaluated.evaluation.rows.map((row, index) => [index, row])
      ),
    [evaluated.evaluation]
  );

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
    if (readOnly) setReadOnlyView(nextView);
    else onProjectChange({ project: nextProject, view: nextView });
  };
  const schemaPanel: ExplorEdaSidePanel = {
    id: "analysis-schema",
    label: "Schema",
    tooltip: "Inspect sources, fields, and relationships",
    icon: <Database />,
    open: schemaOpen,
    onOpenChange: (open) => {
      setSchemaOpen(open);
      if (open) setQueryOpen(false);
    },
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
    tooltip: "Inspect and follow this query",
    icon: <GitBranch />,
    open: queryOpen,
    onOpenChange: (open) => {
      setQueryOpen(open);
      if (open) setSchemaOpen(false);
    },
    wide: queryWide,
    onWideChange: setQueryWide,
    banner: evaluated.error ? (
      <div
        role="alert"
        className="border-b border-destructive px-3 py-2 text-xs text-destructive"
      >
        {evaluated.error}
      </div>
    ) : undefined,
    children: (
      <ProjectQueryPanel
        project={project}
        view={shownView}
        tables={tables}
        evaluation={evaluated.evaluation}
        incompatibleFields={incompatibleFields}
        unresolvedRowKeys={unresolvedKeys.length}
        queryPresets={queryPresets}
        readOnly={readOnly}
        onChange={update}
        onOpenView={onOpenView}
      />
    ),
  };

  const onOpenQueryFlow = (rowKey?: string) => {
    setSchemaOpen(false);
    setQueryOpen(true);
    const nextView = {
      ...shownView,
      inspection: {
        ...shownView.inspection,
        stepId: query?.outputStepId,
        rowKey,
      },
    };
    if (readOnly) setReadOnlyView(nextView);
    else onProjectChange({ project, view: nextView });
  };

  return (
    <AnalysisChartContextProvider
      value={{
        query: {
          id: query?.id ?? shownView.queryId,
          label: query?.name ?? "Unavailable query",
          glyph: query?.glyph ?? "?",
        },
        frame: {
          id: query?.outputStepId ?? "unavailable",
          label: query?.frameLabel ?? "Unavailable frame",
          glyph: query?.glyph ?? "?",
        },
        availableCount: evaluated.evaluation.counts.available,
        resultRowsById,
        fields: evaluated.evaluation.fields,
        sources: project.sources,
        steps: query?.steps,
        onOpenQueryFlow,
      }}
    >
      <ExplorEda
        ref={chartRef}
        data={data}
        fieldNames={fieldNames}
        onStateChange={
          readOnly || !settingsCompatible
            ? undefined
            : (next) => onStateChange?.(encodeAnalysisRowKeys(next, keysById))
        }
        key={`${shownView.id}:${shownView.queryId}`}
        savedData={settingsCompatible ? renderedSettings : undefined}
        sidePanels={[...sidePanels, schemaPanel, queryPanel]}
        readOnly={readOnly}
      />
    </AnalysisChartContextProvider>
  );
});

function emptyEvaluation(queryId: string): AnalysisEvaluation {
  return {
    queryId,
    revision: "unavailable",
    fields: [],
    rows: [],
    stages: [],
    diagnostics: [],
    counts: { source: 0, output: 0, available: 0, excluded: 0 },
  };
}
