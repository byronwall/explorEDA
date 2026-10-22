/** The pager's own row; 0 when it shares the chart's legend line. */
export const PAGER_HEIGHT = 20;
const TABLE_HEADER_HEIGHT = 32;
/** A wrap facet's narrowest and shortest panel, and the gap between panels. */
export const FACET_MIN_WIDTH = 260;
export const FACET_MIN_HEIGHT = 230;
export const FACET_GAP = 8;

/** How many columns a wrap facet uses at this width. */
export function wrapFacetColumns(width: number, requestedColumns: number) {
  return Math.max(
    1,
    Math.min(requestedColumns, Math.floor(width / FACET_MIN_WIDTH) || 1)
  );
}

export function planFacetGridLayout(
  width: number,
  height: number,
  rowCount: number,
  columnCount: number,
  page: number,
  tableHeaderHeight: number,
  pagerHeight = PAGER_HEIGHT
) {
  const rowPageSize = Math.max(
    1,
    Math.floor(Math.max(1, height - pagerHeight - TABLE_HEADER_HEIGHT) / 160)
  );
  const columnPageSize = Math.max(1, Math.floor(Math.max(1, width - 90) / 220));
  const rowPages = Math.max(1, Math.ceil(rowCount / rowPageSize));
  const columnPages = Math.max(1, Math.ceil(columnCount / columnPageSize));
  const pageCount = rowPages * columnPages;
  const currentPage = Math.min(page, pageCount - 1);
  const rowPage = Math.floor(currentPage / columnPages);
  const columnPage = currentPage % columnPages;
  const visibleRows = Math.min(rowPageSize, rowCount - rowPage * rowPageSize);
  const visibleColumns = Math.min(
    columnPageSize,
    columnCount - columnPage * columnPageSize
  );
  return {
    mode: "grid" as const,
    width,
    height,
    rowCount,
    columnCount,
    rowPageSize,
    columnPageSize,
    rowPages,
    columnPages,
    pageCount,
    page: currentPage,
    rowPage,
    columnPage,
    tableHeaderHeight,
    cellWidth: Math.max(1, (width - 90) / Math.max(1, visibleColumns)),
    cellHeight: Math.max(
      1,
      (height - pagerHeight - tableHeaderHeight) / Math.max(1, visibleRows)
    ),
  };
}

export function planFacetWrapLayout(
  width: number,
  height: number,
  facetCount: number,
  requestedColumns: number,
  page: number,
  pagerHeight = PAGER_HEIGHT
) {
  const columnCount = wrapFacetColumns(width, requestedColumns);
  // Rows that fit, but no more than the facets fill, so a few facets in a
  // tall chart grow instead of leaving empty rows.
  const rowCount = Math.max(
    1,
    Math.min(
      Math.floor(Math.max(1, height - pagerHeight) / FACET_MIN_HEIGHT) || 1,
      Math.ceil(facetCount / columnCount)
    )
  );
  const pageSize = columnCount * rowCount;
  const pageCount = Math.max(1, Math.ceil(facetCount / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  return {
    mode: "wrap" as const,
    width,
    height,
    facetCount,
    requestedColumns,
    columnCount,
    rowCount,
    pageSize,
    pageCount,
    page: currentPage,
    facetWidth: Math.max(
      1,
      (width - (columnCount - 1) * FACET_GAP) / columnCount
    ),
    facetHeight: Math.max(
      1,
      (height - pagerHeight - (rowCount - 1) * FACET_GAP) / rowCount
    ),
  };
}

export type FacetLayoutPlan =
  | ReturnType<typeof planFacetGridLayout>
  | ReturnType<typeof planFacetWrapLayout>
  | { mode: "focused"; width: number; height: number };
