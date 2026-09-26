import { ChartSettings, datum } from "@/types/ChartTypes";
import { Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChartRenderer } from "../ChartRenderer";
import { FacetData } from "./FacetContainer";
import { planFacetWrapLayout, type FacetLayoutPlan } from "./facetLayout";

const FACET_CARD_WIDTH_CHROME = 18;
const FACET_CARD_HEIGHT_CHROME = 38;

interface FacetWrapLayoutProps {
  width: number;
  height: number;
  columns: number;
  facetData: FacetData[];
  settings: ChartSettings;
  onToggleFacet: (field: string, value: datum) => void;
  isFacetFiltered: (field: string, value: datum) => boolean;
  onFocusFacet: (id: string) => void;
  onTraceFacet?: (
    role: "panel",
    facets: FacetData[],
    layout: FacetLayoutPlan
  ) => void;
  formatFacetValue: (field: string, value: datum) => string;
}

export function FacetWrapLayout({
  width,
  height,
  columns,
  facetData,
  settings,
  onToggleFacet,
  isFacetFiltered,
  onFocusFacet,
  onTraceFacet,
  formatFacetValue,
}: FacetWrapLayoutProps) {
  const [page, setPage] = useState(0);
  const layout = planFacetWrapLayout(
    width,
    height,
    facetData.length,
    columns,
    page
  );
  const { columnCount, pageSize, pageCount, facetWidth, facetHeight } = layout;
  useEffect(() => setPage(layout.page), [layout.page]);

  const visible = facetData.slice(page * pageSize, (page + 1) * pageSize);
  const rowVariable = settings.facet.rowVariable;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {pageCount > 1 && (
        <div className="flex shrink-0 items-center justify-between gap-2 overflow-hidden pb-1 text-xs text-muted-foreground">
          <span className="min-w-0 truncate whitespace-nowrap">
            Facets {page * pageSize + 1}–
            {Math.min((page + 1) * pageSize, facetData.length)} of{" "}
            {facetData.length}
          </span>
          <span className="flex shrink-0 gap-1 whitespace-nowrap">
            <button
              type="button"
              className="whitespace-nowrap underline disabled:no-underline disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="whitespace-nowrap underline disabled:no-underline disabled:opacity-40"
              disabled={page === pageCount - 1}
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
            >
              Next
            </button>
          </span>
        </div>
      )}
      <div
        className="grid min-h-0 flex-1 gap-2 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        {visible.map((facet) => (
          <div
            key={facet.id}
            className="relative min-h-0 min-w-0 overflow-hidden rounded-md border border-border/50 p-2"
          >
            <div className="mb-1 flex h-4 min-w-0 items-center gap-0.5 text-xs font-medium">
              <button
                type="button"
                className="min-w-0 truncate text-left underline-offset-2 hover:underline"
                aria-pressed={isFacetFiltered(rowVariable, facet.rowRawValue)}
                onClick={(event) => {
                  if (event.altKey && onTraceFacet)
                    onTraceFacet("panel", [facet], layout);
                  else onToggleFacet(rowVariable, facet.rowRawValue);
                }}
              >
                {formatFacetValue(rowVariable, facet.rowRawValue)}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
                tooltip="Focus facet"
                aria-label={`Focus ${formatFacetValue(rowVariable, facet.rowRawValue)} facet`}
                onClick={(event) => {
                  if (event.altKey && onTraceFacet)
                    onTraceFacet("panel", [facet], layout);
                  else onFocusFacet(facet.id);
                }}
              >
                <Maximize2 className="size-3" />
              </Button>
            </div>
            <ChartRenderer
              settings={settings}
              width={Math.max(1, facetWidth - FACET_CARD_WIDTH_CHROME)}
              height={Math.max(1, facetHeight - FACET_CARD_HEIGHT_CHROME)}
              facetIds={facet.ids}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
