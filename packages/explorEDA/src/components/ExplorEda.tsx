import { ChartDraftProvider } from "./plot/ChartDraftContext";
import type { DatumObject } from "@/providers/DataLayerProvider";
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
  exportViews,
  formatDslDiagnostics,
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
} from "@/lib/dsl";
import { PlotManager } from "./PlotManager";
import type { ExplorEdaSidePanel } from "./WorkspaceSidePanel";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { Toaster } from "./ui/sonner";
import { GlobalAlertDialog } from "./GlobalAlertDialog";

import "../index.css";
import { CalculationEditorProvider } from "./calculations/CalculationEditor";
import { forwardRef, useImperativeHandle } from "react";

registerAllCharts();

export interface ExplorEdaHandle {
  getSettings: () => SavedDataStructure;
}

export interface ExplorEdaProps {
  data: DatumObject[];
  savedData?: SavedDataStructure;
  onStateChange?: (state: SavedDataStructure) => void;
  /** Host panels on the right edge, each with a toolbar button. */
  sidePanels?: ExplorEdaSidePanel[];
  /** Shows the charts without accepting edits. Host panels stay usable. */
  readOnly?: boolean;
}

export const ExplorEda = forwardRef<ExplorEdaHandle, ExplorEdaProps>(
  function ExplorEda(
    { data, savedData, onStateChange, sidePanels, readOnly },
    ref
  ) {
    return (
      <DataLayerProvider
        data={data}
        savedData={savedData}
        onStateChange={onStateChange}
      >
        <Workspace ref={ref} sidePanels={sidePanels} readOnly={readOnly} />
      </DataLayerProvider>
    );
  }
);

const Workspace = forwardRef<
  ExplorEdaHandle,
  Pick<ExplorEdaProps, "sidePanels" | "readOnly">
>(function Workspace({ sidePanels, readOnly }, ref) {
  const getSettings = useDataLayer((state) => state.saveToStructure);
  useImperativeHandle(ref, () => ({ getSettings }), [getSettings]);

  return (
    <div className="bg-background text-foreground">
      <CalculationEditorProvider>
        <ChartDraftProvider>
          <PlotManager sidePanels={sidePanels} readOnly={readOnly} />
        </ChartDraftProvider>
      </CalculationEditorProvider>
      <GlobalAlertDialog />
      <Toaster />
    </div>
  );
});

export type { SavedDataStructure, ExplorEdaSidePanel };
export type { GeometryAsset, RegionGeometry } from "@/lib/geometryAssets";
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
  formatDslDiagnostics,
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
