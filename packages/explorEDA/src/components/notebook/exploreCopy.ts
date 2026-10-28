import type { SavedDataStructure } from "@/types/SavedDataStructure";

/** About how tall a copied chart draws, in pixels. */
const COPY_HEIGHT = 480;

/**
 * A workspace to explore a copy of one notebook chart in: the notebook's
 * calculations, scales, and field settings, and the chart at full width.
 * Pass the workspace being explored to add the copy under its charts, so
 * someone can pull several charts aside and compare them.
 */
export function exploreChartCopy(
  notebook: SavedDataStructure,
  chartId: string,
  into?: SavedDataStructure
): SavedDataStructure {
  const chart = notebook.charts.find((item) => item.id === chartId);
  const base: SavedDataStructure = into ?? {
    ...notebook,
    charts: [],
    workspaceFilters: [],
    metadata: {
      ...notebook.metadata,
      name: `Exploring ${notebook.metadata.name}`,
    },
  };
  if (!chart) return base;
  const columns = base.gridSettings.columnCount;
  const rows = Math.max(
    3,
    Math.round(COPY_HEIGHT / base.gridSettings.rowHeight)
  );
  const bottom = Math.max(
    0,
    ...base.charts.map((item) => item.layout.y + item.layout.h)
  );
  const taken = new Set(base.charts.map((item) => item.id));
  let id = `${chart.id}-copy`;
  for (let n = 2; taken.has(id); n++) id = `${chart.id}-copy-${n}`;
  // The notebook's own definitions stay as they are; ones the workspace
  // already has from an earlier copy are kept once.
  const merge = <T>(
    own: T[] = [],
    more: T[] = [],
    key: (item: T) => string
  ) => {
    const kept = new Set(own.map(key));
    return [...own, ...more.filter((item) => !kept.has(key(item)))];
  };
  return {
    ...base,
    calculations: merge(
      base.calculations,
      notebook.calculations,
      (item) => item.resultColumnName
    ),
    colorScales: merge(
      base.colorScales,
      notebook.colorScales,
      (item) => item.id
    ),
    aggregates: merge(base.aggregates, notebook.aggregates, (item) => item.id),
    fieldSettings: { ...notebook.fieldSettings, ...base.fieldSettings },
    charts: [
      ...base.charts,
      {
        ...structuredClone(chart),
        id,
        layout: { x: 0, y: bottom, w: columns, h: rows },
      },
    ],
  };
}
