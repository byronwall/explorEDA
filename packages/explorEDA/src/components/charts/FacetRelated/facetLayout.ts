const PAGER_HEIGHT = 20;
const TABLE_HEADER_HEIGHT = 32;

export function planFacetGridLayout(
  width: number,
  height: number,
  rowCount: number,
  columnCount: number,
  page: number,
  tableHeaderHeight: number
) {
  const rowPageSize = Math.max(
    1,
    Math.floor(Math.max(1, height - PAGER_HEIGHT - TABLE_HEADER_HEIGHT) / 160)
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
  const pagerHeight = pageCount > 1 ? PAGER_HEIGHT : 0;
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
  page: number
) {
  const columnCount = Math.max(
    1,
    Math.min(requestedColumns, Math.floor(width / 260) || 1)
  );
  const rowCount = Math.max(
    1,
    Math.floor(Math.max(1, height - PAGER_HEIGHT) / 230) || 1
  );
  const pageSize = columnCount * rowCount;
  const pageCount = Math.max(1, Math.ceil(facetCount / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pagerHeight = pageCount > 1 ? PAGER_HEIGHT : 0;
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
    facetWidth: Math.max(1, (width - (columnCount - 1) * 8) / columnCount),
    facetHeight: Math.max(
      1,
      (height - pagerHeight - (rowCount - 1) * 8) / rowCount
    ),
  };
}

export type FacetLayoutPlan =
  | ReturnType<typeof planFacetGridLayout>
  | ReturnType<typeof planFacetWrapLayout>
  | { mode: "focused"; width: number; height: number };
