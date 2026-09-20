import type { DatumObject } from "@/providers/DataLayerProvider";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { SavedDataStructure } from "@/types/SavedDataStructure";
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
