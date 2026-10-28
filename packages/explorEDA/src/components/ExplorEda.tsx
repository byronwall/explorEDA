import { ChartDraftProvider } from "./plot/ChartDraftContext";
import type { DatumObject } from "@/providers/DataLayerProvider";
import type { DeclaredFieldType } from "@/lib/declaredFieldTypes";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import {
  SavedAnalysisStructure,
  SavedCalculation,
  SavedDataStructure,
  SavedDatum,
  SavedRow,
  SavedSpecialValue,
} from "@/types/SavedDataStructure";
import type {
  SavedColumnSettings,
  SavedRowsSettings,
  ViewMetadata,
} from "@/types/SavedDataTypes";
import {
  formatFieldValue,
  getFieldSettingsError,
  getFieldLabel,
  hasFieldDisplayFormat,
  type ConversionPreview,
  type DatePreset,
  type FieldFormat,
  type FieldSettings,
  type FieldSettingsMap,
} from "@/lib/fieldSettings";
import type { AggregateResult, AggregateSpec } from "@/lib/aggregates";
import {
  parseSavedAnalysis,
  parseSavedData,
  saveAnalysisToClipboard,
  saveToClipboard,
  stringifySavedAnalysis,
  stringifySavedData,
  validateSavedAnalysis,
  validateSavedAnalysisForData,
  validateSavedData,
} from "@/utils/saveDataUtils";
import {
  compileDocument,
  compileViews,
  describeDslSource,
  DSL_CHART_KEYWORDS,
  DSL_REFERENCE,
  exportDocument,
  highlightDsl,
  exportViews,
  formatDsl,
  formatDslDiagnostics,
  normalizeDashboard,
  type DslChartResult,
  type DslView,
  type DslViewResult,
  type DslViewsExportOptions,
  type DslViewsResult,
  type DslExportOptions,
  type DslExportResult,
  type DslFieldSummary,
  type DslCompileOptions,
  type DslCompileResult,
  type DslDiagnostic,
  type DslEffect,
  type DslSeverity,
  type DslToken,
  type DslTokenKind,
} from "@/lib/dsl";
import { PlotManager, type ExplorEdaSchema } from "./PlotManager";
import type { ExplorEdaSidePanel } from "./WorkspaceSidePanel";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { Toaster } from "./ui/sonner";
import { GlobalAlertDialog } from "./GlobalAlertDialog";

import "../index.css";
import { CalculationEditorProvider } from "./calculations/CalculationEditor";
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import {
  exportWorkspaceChartPng,
  type ExportChartPngOptions,
} from "./charts/export/exportChartPng";
import type { ChartImage } from "./charts/export/rasterizePanel";

registerAllCharts();

export interface ExplorEdaHandle {
  getSettings: () => SavedDataStructure;
  /**
   * The chart's PNG as drawn: the image its Download image action saves, at
   * twice its on-screen size unless `pixelRatio` says otherwise. Rejects with
   * "Chart is not rendered." when the chart is not mounted.
   */
  exportChartPng: (
    chartId: string,
    options?: ExportChartPngOptions
  ) => Promise<ChartImage>;
}

export interface ExplorEdaProps {
  data: DatumObject[];
  /** Declared output columns, including when the result contains no rows. */
  fieldNames?: string[];
  /**
   * Field types the data's source declares, such as `fields` from
   * `readTableFile` in `exploreda/readers`. Detection fills in the rest, and
   * a type chosen in field settings wins.
   */
  fieldTypes?: Record<string, DeclaredFieldType>;
  savedData?: SavedDataStructure;
  onStateChange?: (state: SavedDataStructure) => void;
  /** Host panels on the right edge, each with a toolbar button. */
  sidePanels?: ExplorEdaSidePanel[];
  /** Shows the charts without accepting edits. Host panels stay usable. */
  readOnly?: boolean;
  /**
   * Host content that leads the toolbar line, such as view tabs. It takes the
   * room the workspace tools leave and stays usable while read-only.
   */
  toolbarStart?: ReactNode;
  /** Host actions that end the toolbar line, such as undo or export. */
  toolbarEnd?: ReactNode;
  /**
   * What the Schema diagram shows. Without it, the diagram shows this
   * workspace's table and its calculated fields.
   */
  schema?: ExplorEdaSchema;
  /**
   * Shows Add source in the Schema diagram. The host picks a file, then can
   * turn this workspace into a project with `singleTableProject` and
   * `addSourceFromRows` from `exploreda/analysis`.
   */
  onAddSource?: () => void;
  /** Opens the Rows drawer when the workspace first shows. */
  defaultRowsOpen?: boolean;
}

export const ExplorEda = forwardRef<ExplorEdaHandle, ExplorEdaProps>(
  function ExplorEda(
    {
      data,
      fieldNames,
      fieldTypes,
      savedData,
      onStateChange,
      sidePanels,
      readOnly,
      toolbarStart,
      toolbarEnd,
      schema,
      onAddSource,
      defaultRowsOpen,
    },
    ref
  ) {
    return (
      <DataLayerProvider
        data={data}
        fieldNames={fieldNames}
        fieldTypes={fieldTypes}
        savedData={savedData}
        onStateChange={onStateChange}
      >
        <Workspace
          ref={ref}
          sidePanels={sidePanels}
          readOnly={readOnly}
          defaultRowsOpen={defaultRowsOpen}
          toolbarStart={toolbarStart}
          toolbarEnd={toolbarEnd}
          schema={
            onAddSource && !schema?.onAddSource
              ? { ...schema, onAddSource }
              : schema
          }
        />
      </DataLayerProvider>
    );
  }
);

const Workspace = forwardRef<
  ExplorEdaHandle,
  Pick<
    ExplorEdaProps,
    | "sidePanels"
    | "readOnly"
    | "toolbarStart"
    | "toolbarEnd"
    | "schema"
    | "defaultRowsOpen"
  >
>(function Workspace(
  { sidePanels, readOnly, toolbarStart, toolbarEnd, schema, defaultRowsOpen },
  ref
) {
  const getSettings = useDataLayer((state) => state.saveToStructure);
  const charts = useDataLayer((state) => state.charts);
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      getSettings,
      exportChartPng: (chartId, options) =>
        exportWorkspaceChartPng(rootRef.current, charts, chartId, options),
    }),
    [getSettings, charts]
  );

  return (
    <div ref={rootRef} className="bg-background text-foreground">
      <CalculationEditorProvider>
        <ChartDraftProvider>
          <PlotManager
            sidePanels={sidePanels}
            readOnly={readOnly}
            defaultRowsOpen={defaultRowsOpen}
            toolbarStart={toolbarStart}
            toolbarEnd={toolbarEnd}
            schema={schema}
          />
        </ChartDraftProvider>
      </CalculationEditorProvider>
      <GlobalAlertDialog />
      <Toaster />
    </div>
  );
});

export type { SavedDataStructure, ExplorEdaSidePanel, ExplorEdaSchema };
export type { GeometryAsset, RegionGeometry } from "@/lib/geometryAssets";
export type { WorkspaceTheme, WorkspaceThemeId } from "@/lib/themes";
export type { ChartStyleOverrides } from "@/types/ChartTypes";
export type { ChartImage, ExportChartPngOptions };
export type {
  SchemaEdge,
  SchemaEndpoint,
  SchemaGraph,
  SchemaNode,
  SchemaNodeKind,
  SchemaRow,
} from "@/lib/schema/schemaGraph";
export type {
  SchemaEditing,
  SchemaFieldEditing,
  SchemaProjectEditing,
} from "./schema/schemaEditing";
export type {
  SavedAnalysisStructure,
  SavedCalculation,
  SavedRow,
  SavedDatum,
  SavedSpecialValue,
  SavedColumnSettings,
  SavedRowsSettings,
  ViewMetadata,
  ConversionPreview,
  DatePreset,
  FieldFormat,
  FieldSettings,
  FieldSettingsMap,
  AggregateSpec,
  AggregateResult,
  DslChartResult,
  DslCompileOptions,
  DslCompileResult,
  DslDiagnostic,
  DslEffect,
  DslExportOptions,
  DslExportResult,
  DslFieldSummary,
  DslSeverity,
  DslToken,
  DslTokenKind,
  DslView,
  DslViewResult,
  DslViewsExportOptions,
  DslViewsResult,
};
export {
  compileDocument,
  describeDslSource,
  DSL_CHART_KEYWORDS,
  DSL_REFERENCE,
  exportDocument,
  exportViews,
  compileViews,
  formatDsl,
  formatDslDiagnostics,
  highlightDsl,
  normalizeDashboard,
  parseSavedAnalysis,
  parseSavedData,
  saveAnalysisToClipboard,
  saveToClipboard,
  stringifySavedAnalysis,
  stringifySavedData,
  validateSavedAnalysis,
  validateSavedAnalysisForData,
  validateSavedData,
  formatFieldValue,
  getFieldSettingsError,
  getFieldLabel,
  hasFieldDisplayFormat,
};

// Project folders: project text, analysis files, and their data, read
// through any file adapter.
export * from "@/lib/project";
// Notebooks: Markdown with eda blocks, and chart edits written back to them.
export * from "@/lib/notebook";
export {
  ExplorEdaNotebook,
  useNotebookResult,
  type ExplorEdaNotebookProps,
} from "./notebook/ExplorEdaNotebook";
export { exploreChartCopy } from "./notebook/exploreCopy";
export { NotebookSourceEditor } from "./notebook/NotebookSourceEditor";
export {
  listBoundarySets,
  registerBoundarySet,
} from "@/lib/boundaries/registry";
export type { BoundarySet } from "@/lib/boundaries/registry";
export {
  OPENFREEMAP_STYLES,
  registerMapLibre,
} from "@/components/charts/Map/mapEngine";
export type {
  MapLibreModule,
  StreetMapOptions,
  StreetMapStyles,
} from "@/components/charts/Map/mapEngine";
export type * from "@/types/AnalysisProject";
export { ExplorEdaProject } from "./ExplorEdaProject";
export type {
  ExplorEdaProjectChange,
  ExplorEdaProjectProps,
} from "./ExplorEdaProject";
