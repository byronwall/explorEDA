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
import { PlotManager } from "./PlotManager";
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

export const ExplorEda = forwardRef<
  ExplorEdaHandle,
  {
    data: DatumObject[];
    savedData?: SavedDataStructure;
    onStateChange?: (state: SavedDataStructure) => void;
  }
>(function ExplorEda({ data, savedData, onStateChange }, ref) {
  return (
    <DataLayerProvider
      data={data}
      savedData={savedData}
      onStateChange={onStateChange}
    >
      <Workspace ref={ref} />
    </DataLayerProvider>
  );
});

const Workspace = forwardRef<ExplorEdaHandle>(function Workspace(_props, ref) {
  const getSettings = useDataLayer((state) => state.saveToStructure);
  useImperativeHandle(ref, () => ({ getSettings }), [getSettings]);

  return (
    <div className="bg-background text-foreground">
      <CalculationEditorProvider>
        <ChartDraftProvider>
          <PlotManager />
        </ChartDraftProvider>
      </CalculationEditorProvider>
      <GlobalAlertDialog />
      <Toaster />
    </div>
  );
});

export type { SavedDataStructure };
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
};
export {
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
