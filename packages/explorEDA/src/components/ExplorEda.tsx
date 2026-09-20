import type { DatumObject } from "@/providers/DataLayerProvider";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
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

registerAllCharts();

export function ExplorEda({
  data,
  savedData,
  onStateChange,
}: {
  data: DatumObject[];
  savedData: SavedDataStructure | undefined;
  onStateChange?: (state: SavedDataStructure) => void;
}) {
  return (
    <DataLayerProvider
      data={data}
      savedData={savedData}
      onStateChange={onStateChange}
    >
      <div className="bg-background text-foreground">
        <CalculationEditorProvider>
          <PlotManager />
        </CalculationEditorProvider>
        <GlobalAlertDialog />
        <Toaster />
      </div>
    </DataLayerProvider>
  );
}

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
};
