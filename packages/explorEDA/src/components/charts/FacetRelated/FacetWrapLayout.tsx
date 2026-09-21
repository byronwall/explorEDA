import { ChartSettings, datum } from "@/types/ChartTypes";
import { useEffect, useState } from "react";
import { ChartRenderer } from "../ChartRenderer";
import { FacetData } from "./FacetContainer";

const PAGER_HEIGHT = 20;
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
  formatFacetValue,
}: FacetWrapLayoutProps) {
  const columnCount = Math.max(
    1,
    Math.min(columns, Math.floor(width / 260) || 1)
  );
  const rowCount = Math.max(
    1,
    Math.floor(Math.max(1, height - PAGER_HEIGHT) / 230) || 1
  );
  const pageSize = columnCount * rowCount;
  const pageCount = Math.max(1, Math.ceil(facetData.length / pageSize));
  const [page, setPage] = useState(0);
  useEffect(
    () => setPage((current) => Math.min(current, pageCount - 1)),
    [pageCount]
  );

  const visible = facetData.slice(page * pageSize, (page + 1) * pageSize);
  const pagerHeight = pageCount > 1 ? PAGER_HEIGHT : 0;
  const facetWidth = Math.max(1, (width - (columnCount - 1) * 8) / columnCount);
  const facetHeight = Math.max(
    1,
    (height - pagerHeight - (rowCount - 1) * 8) / rowCount
  );
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
            <div className="mb-1 flex items-center justify-between gap-1 text-xs font-medium">
              <button
                type="button"
                className="min-w-0 truncate text-left underline-offset-2 hover:underline"
                aria-pressed={isFacetFiltered(rowVariable, facet.rowRawValue)}
                onClick={() => onToggleFacet(rowVariable, facet.rowRawValue)}
              >
                {formatFacetValue(rowVariable, facet.rowRawValue)}
              </button>
              <button
                type="button"
                className="shrink-0 underline"
                aria-label={`Focus ${formatFacetValue(rowVariable, facet.rowRawValue)} facet`}
                onClick={() => onFocusFacet(facet.id)}
              >
                Focus
              </button>
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
