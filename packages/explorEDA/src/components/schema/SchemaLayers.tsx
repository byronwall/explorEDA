import { Grid3x3, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SchemaGraph, SchemaNode } from "@/lib/schema/schemaGraph";

export interface SchemaLayerState {
  /** One line from each table to each view that reads it. */
  lines: boolean;
  /** Relationships, with the unused tables they touch as short cards. */
  relationships: boolean;
  /** The list of tables no view reads. */
  unused: boolean;
}

export const DEFAULT_LAYERS: SchemaLayerState = {
  lines: true,
  relationships: true,
  unused: true,
};

const LAYER_KEY = "exploreda.schemaLayers";

/** The viewer's last choice of layers; the defaults when none is saved. */
export function savedLayers(): SchemaLayerState {
  try {
    const saved = JSON.parse(localStorage.getItem(LAYER_KEY) ?? "null");
    return { ...DEFAULT_LAYERS, ...(saved ?? {}) };
  } catch {
    return DEFAULT_LAYERS;
  }
}

export function saveLayers(layers: SchemaLayerState) {
  try {
    localStorage.setItem(LAYER_KEY, JSON.stringify(layers));
  } catch {
    // A private window keeps the choice for this session only.
  }
}

/** Shows or hides the diagram's layers. */
export function SchemaLayersMenu({
  layers,
  counts,
  onChange,
}: {
  layers: SchemaLayerState;
  counts: { lines: number; relationships: number; unused: number };
  onChange: (layers: SchemaLayerState) => void;
}) {
  const shown = Object.values(layers).filter(Boolean).length;
  const rows: [keyof SchemaLayerState, string, string][] = [
    ["lines", "Lines to views", `${counts.lines}`],
    [
      "relationships",
      "Relationships",
      counts.relationships ? `${counts.relationships}` : "none yet",
    ],
    ["unused", "Unused tables", `${counts.unused}`],
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="eda-schema-text-button"
          tooltip="Show or hide lines, relationships, and unused tables"
          aria-label="Layers"
        >
          <Layers aria-hidden="true" />
          <span className="eda-schema-button-label">Layers</span>
          <span className="eda-schema-layer-count">{shown}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="eda-schema-layers">
        {rows.map(([key, label, count]) => (
          <label key={key} className="eda-schema-layer">
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={(event) =>
                onChange({ ...layers, [key]: event.target.checked })
              }
            />
            <span>{label}</span>
            <span className="eda-schema-layer-detail">{count}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Which views read each table, as a grid: tables down, views across, a dot
 * where one reads the other. Choosing a view lights it up in the diagram.
 */
export function SchemaCoverage({
  drawn,
  detail,
  litViewId,
  onLight,
}: {
  /** The condensed drawing, which knows each table's readers. */
  drawn: SchemaGraph;
  /** Every table, including the ones the drawing folds. */
  detail: SchemaGraph;
  litViewId?: string;
  onLight: (viewId: string) => void;
}) {
  const views = detail.nodes.filter((node) => node.kind === "view");
  const readers = new Map(
    drawn.nodes
      .filter((node) => node.kind === "table")
      .map((node) => [node.id, new Set(node.readerIds ?? [])])
  );
  const tables = detail.nodes.filter((node) => node.kind === "table");
  const readBy = (table: SchemaNode) => readers.get(table.id) ?? new Set();
  const ordered = [
    ...tables.filter((table) => readBy(table).size),
    ...tables.filter((table) => !readBy(table).size),
  ];
  if (!views.length) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="eda-schema-text-button"
          tooltip="Which views read each table"
          aria-label="Coverage"
        >
          <Grid3x3 aria-hidden="true" />
          <span className="eda-schema-button-label">Coverage</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="eda-schema-coverage">
        <table>
          <caption>Which views read each table</caption>
          <thead>
            <tr>
              <th scope="col">Table</th>
              {views.map((view) => (
                <th
                  key={view.id}
                  scope="col"
                  data-lit={view.id === litViewId || undefined}
                >
                  <button type="button" onClick={() => onLight(view.id)}>
                    {view.title}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordered.map((table) => (
              <tr
                key={table.id}
                data-unused={readBy(table).size ? undefined : ""}
              >
                <th scope="row">{table.title}</th>
                {views.map((view) => (
                  <td
                    key={view.id}
                    data-lit={view.id === litViewId || undefined}
                  >
                    {readBy(table).has(view.id) && (
                      <span
                        className="eda-schema-coverage-dot"
                        role="img"
                        aria-label={`${view.title} reads ${table.title}`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </PopoverContent>
    </Popover>
  );
}
