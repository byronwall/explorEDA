import { ChartSettings } from "@/types/ChartTypes";
import { ChartRenderer } from "../ChartRenderer";
import { FacetData } from "./FacetContainer";

interface FacetWrapLayoutProps {
  width: number;
  height: number;
  columns: number;
  facetData: FacetData[];
  settings: ChartSettings;
}

export function FacetWrapLayout({
  width,
  height,
  columns,
  facetData,
  settings,
}: FacetWrapLayoutProps) {
  columns = Math.max(1, Math.min(columns, Math.floor(width / 260)));
  // Calculate dimensions based on the number of facet values
  const facetWidth = (width - (columns - 1) * 8) / columns;
  const rows = Math.ceil(facetData.length / (columns || 1));
  const facetHeight = Math.max(230, (height - (rows - 1) * 8) / (rows || 1));

  return (
    <div
      className="w-full h-full grid gap-2 overflow-auto"
      style={{
        gridTemplateColumns: `repeat(${columns || 1}, 1fr)`,
        gridAutoRows: `${facetHeight}px`,
      }}
    >
      {facetData.map((facet) => (
        <div key={facet.id} className="border border-border/50 rounded-md p-2">
          <div className="text-xs font-medium mb-1">{facet.rowValue}</div>
          <div style={{ height: facetHeight - 30 }}>
            <ChartRenderer
              settings={settings}
              width={facetWidth - 16} // Adjust for padding
              height={facetHeight - 30} // Adjust for header and padding
              facetIds={facet.ids}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
