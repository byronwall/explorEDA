import { useMemo, useState } from "react";
import { Palette, Shapes } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useGetAllIds } from "@/components/charts/useGetLiveData";
import {
  markHasCategories,
  normalizeComposition,
  type CompositionDefinition,
  type MarkDefinition,
  type UnitElement,
  type ValueScale,
} from "@/components/charts/Composition/compositionTypes";
import { updateElement } from "@/components/charts/Composition/compositionEdits";
import {
  markCategories,
  type CompositionData,
} from "@/components/charts/Composition/resolveUnit";
import type { CompositionSettings } from "@/components/charts/Composition/definition";

/** A color set defined inside a composition: a value scale or a mark's categories. */
type CompositionColors =
  | {
      kind: "ramp";
      id: string;
      chart: CompositionSettings;
      scale: ValueScale;
    }
  | {
      kind: "categories";
      id: string;
      chart: CompositionSettings;
      unit: UnitElement;
      mark: MarkDefinition & { colors?: string[] };
      categories: { key: string; color: string }[];
    };

/** Every color set the workspace's compositions define, in chart order. */
function useCompositionColors(): CompositionColors[] {
  const charts = useDataLayer((state) => state.charts);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const allIds = useGetAllIds();
  return useMemo(() => {
    const data: CompositionData = {
      allIds,
      liveIds: allIds,
      column: getColumnData,
    };
    const sets: CompositionColors[] = [];
    for (const chart of charts) {
      if (chart.type !== "composition") continue;
      const settings = chart as CompositionSettings;
      const definition = normalizeComposition(settings.composition);
      for (const scale of definition.scales)
        if (scale.kind === "value")
          sets.push({
            kind: "ramp",
            id: `${chart.id}:${scale.id}`,
            chart: settings,
            scale,
          });
      for (const element of definition.elements) {
        if (element.kind !== "unit") continue;
        for (const mark of element.marks)
          if (markHasCategories(mark))
            sets.push({
              kind: "categories",
              id: `${chart.id}:${element.id}:${mark.id}`,
              chart: settings,
              unit: element,
              mark,
              categories: markCategories(mark, data),
            });
      }
    }
    return sets;
  }, [charts, allIds, getColumnData]);
}

/**
 * The color scales and category palettes defined inside compositions, listed
 * beside the workspace scales so their colors can be found and changed in
 * one place. Edits write back into the composition that owns them.
 */
export function CompositionScales() {
  const sets = useCompositionColors();
  const updateChart = useDataLayer((state) => state.updateChart);
  const [selectedId, setSelectedId] = useState<string>();
  if (!sets.length) return null;
  const selected = sets.find((set) => set.id === selectedId) ?? sets[0]!;

  const write = (
    chart: CompositionSettings,
    change: (definition: CompositionDefinition) => CompositionDefinition
  ) =>
    updateChart(chart.id, {
      composition: change(normalizeComposition(chart.composition)),
    } as Partial<CompositionSettings>);

  const setRampColor = (index: number | "center", color: string) => {
    if (selected.kind !== "ramp") return;
    write(selected.chart, (definition) => ({
      ...definition,
      scales: definition.scales.map((scale) =>
        scale.id === selected.scale.id && scale.kind === "value"
          ? index === "center"
            ? { ...scale, center: color }
            : {
                ...scale,
                colors: scale.colors.map((value, at) =>
                  at === index ? color : value
                ),
              }
          : scale
      ),
    }));
  };

  const setCategoryColor = (index: number, color: string) => {
    if (selected.kind !== "categories") return;
    // A palette shorter than the categories cycles; spell it out so one
    // category changes alone.
    const colors = selected.categories.map((category) => category.color);
    colors[index] = color;
    write(selected.chart, (definition) =>
      updateElement<UnitElement>(definition, selected.unit.id, {
        marks: selected.unit.marks.map((mark) =>
          mark.id === selected.mark.id
            ? ({ ...mark, colors } as MarkDefinition)
            : mark
        ),
      })
    );
  };

  return (
    <section
      className="eda-composition-scales"
      aria-label="Colors in compositions"
    >
      <div className="eda-color-panel-head">
        <div className="min-w-0">
          <h3>In compositions</h3>
          <p className="eda-color-muted">
            Ramps and category colors defined inside a composition graphic.
          </p>
        </div>
      </div>
      <div className="eda-color-panel-body">
        <ul className="eda-scale-list" aria-label="Composition colors">
          {sets.map((set) => (
            <li
              key={set.id}
              className="eda-scale-item"
              data-selected={set.id === selected.id || undefined}
            >
              <button
                type="button"
                className="eda-scale-item-main"
                aria-current={set.id === selected.id || undefined}
                onClick={() => setSelectedId(set.id)}
              >
                <span className="eda-scale-item-title">
                  {set.kind === "ramp" ? (
                    <Palette aria-hidden="true" />
                  ) : (
                    <Shapes aria-hidden="true" />
                  )}
                  <span className="truncate">
                    {set.kind === "ramp" ? set.scale.name : set.mark.name}
                  </span>
                </span>
                <span className="eda-composition-swatch" aria-hidden="true">
                  {(set.kind === "ramp"
                    ? [
                        set.scale.colors[0]!,
                        ...(set.scale.center ? [set.scale.center] : []),
                        ...set.scale.colors.slice(1),
                      ]
                    : set.categories.map((category) => category.color)
                  ).map((color, index) => (
                    <span key={index} style={{ background: color }} />
                  ))}
                </span>
                <span className="eda-scale-item-meta">
                  <span className="truncate">{set.chart.title}</span>
                  <span>
                    {set.kind === "ramp"
                      ? "Value ramp"
                      : `${set.categories.length} categories`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div
          className="eda-composition-scale-colors"
          aria-label={`${selected.kind === "ramp" ? selected.scale.name : selected.mark.name} colors`}
          role="group"
        >
          {selected.kind === "ramp" ? (
            <>
              {selected.scale.colors.map((color, index) => (
                <ColorRow
                  key={index}
                  label={
                    index === 0
                      ? "Low"
                      : index === selected.scale.colors.length - 1
                        ? "High"
                        : `Stop ${index + 1}`
                  }
                  value={color}
                  onChange={(next) => setRampColor(index, next)}
                />
              ))}
              {selected.scale.center !== undefined && (
                <ColorRow
                  label="Center"
                  value={selected.scale.center}
                  onChange={(next) => setRampColor("center", next)}
                />
              )}
            </>
          ) : (
            selected.categories.map((category, index) => (
              <ColorRow
                key={category.key}
                label={category.key}
                value={category.color}
                onChange={(next) => setCategoryColor(index, next)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="eda-composition-color-row">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="truncate">{label}</span>
      <span className="font-mono eda-color-muted">{value}</span>
    </label>
  );
}
