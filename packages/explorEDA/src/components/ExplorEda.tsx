import type { DatumObject } from "@/providers/DataLayerProvider";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { SavedDataStructure } from "@/types/SavedDataStructure";
import { PlotManager } from "./PlotManager";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { Toaster } from "./ui/sonner";
import { GlobalAlertDialog } from "./GlobalAlertDialog";

import "../index.css";

registerAllCharts();

export function ExplorEda({
  data,
  savedData,
}: {
  data: DatumObject[];
  savedData: SavedDataStructure | undefined;
}) {
  return (
    <DataLayerProvider data={data} savedData={savedData}>
      <div className="bg-background text-foreground">
        <PlotManager />
        <GlobalAlertDialog />
        <Toaster />
      </div>
    </DataLayerProvider>
  );
}

export type { SavedDataStructure };
