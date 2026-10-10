import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { MoveHorizontal, Palette, Trash2 } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import {
  newScaleId,
  type CompositionDefinition,
  type CompositionScale,
  type PositionScale,
  type TimeInterval,
  type ValueScale,
} from "./compositionTypes";
import { ColorSetting, Segmented } from "./inspectorControls";

const DOMAINS = [
  {
    value: "shared" as const,
    label: "Shared",
    tooltip:
      "Every repeat uses one domain, so units compare directly. Built from all rows in the composition.",
  },
  {
    value: "instance" as const,
    label: "Per unit",
    tooltip:
      "Each repeat fits its own rows. Shapes read within a unit, but units no longer compare.",
  },
];

const TRANSFORMS = [
  { value: "linear" as const, label: "Linear", tooltip: "Equal steps in value make equal steps in output" },
  { value: "sqrt" as const, label: "Sqrt", tooltip: "Compress large values, so small counts stay visible" },
  { value: "log" as const, label: "Log", tooltip: "Compress large values strongly, for counts that span orders of magnitude" },
];

/** Lists the composition's scales, and edits the one that is open. */
export function ScalesSection({
  definition,
  openScaleId,
  onOpen,
  onChange,
}: {
  definition: CompositionDefinition;
  openScaleId?: string;
  onOpen: (id: string | undefined) => void;
  onChange: (definition: CompositionDefinition) => void;
}) {
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const openRef = useRef<HTMLLIElement>(null);
  // A scale opened from a mark's Edit button may be out of view below.
  useEffect(() => {
    if (openScaleId)
      openRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [openScaleId]);
  const used = new Set(
    definition.elements.flatMap((element) =>
      element.kind === "unit"
        ? element.marks.flatMap((mark) => [
            mark.positionScaleId,
            mark.valueScaleId,
          ])
        : []
    )
  );
  const update = (id: string, patch: Partial<CompositionScale>) =>
    onChange({
      ...definition,
      scales: definition.scales.map((scale) =>
        scale.id === id ? ({ ...scale, ...patch } as CompositionScale) : scale
      ),
    });
  const add = (scale: CompositionScale) => {
    onChange({ ...definition, scales: [...definition.scales, scale] });
    onOpen(scale.id);
  };
  const firstField =
    profiles.find((profile) => profile.dataType === "datetime") ?? profiles[0];

  return (
    <section className="eda-setting-section" aria-label="Scales">
      <div className="eda-composition-section-head">
        <h5>Scales</h5>
        <span className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            disabled={!firstField}
            tooltip="Add a position scale that places a field along a frame"
            onClick={() =>
              firstField &&
              add({
                id: newScaleId(definition, "x"),
                kind: "position",
                name: firstField.name,
                field: firstField.name,
                interval:
                  firstField.dataType === "datetime" ? "month" : undefined,
                domain: "shared",
              })
            }
          >
            + Position
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            tooltip="Add a value scale that maps a mark's value to color, size, or height"
            onClick={() =>
              add({
                id: newScaleId(definition, "value"),
                kind: "value",
                name: "Value",
                domain: "shared",
                transform: "linear",
                colors: ["#e8eef6", "#1f4e8c"],
              })
            }
          >
            + Value
          </Button>
        </span>
      </div>
      {definition.scales.length === 0 ? (
        <p className="eda-setting-note">
          Adding a chart unit creates its scales.
        </p>
      ) : (
        <ul className="eda-composition-layers">
          {definition.scales.map((scale) => {
            const open = scale.id === openScaleId;
            const Icon = scale.kind === "position" ? MoveHorizontal : Palette;
            return (
              <li
                key={scale.id}
                ref={open ? openRef : undefined}
                className="eda-composition-scale-row"
              >
                <div className="flex w-full items-center">
                  <button
                    type="button"
                    className="eda-composition-layer"
                    aria-expanded={open}
                    onClick={() => onOpen(open ? undefined : scale.id)}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="truncate">{scale.name}</span>
                    <span className="eda-composition-layer-meta">
                      {describeScale(scale)}
                    </span>
                  </button>
                  {open && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label={`Delete ${scale.name}`}
                      tooltip={
                        used.has(scale.id)
                          ? "A mark uses this scale. Point the mark at another scale first."
                          : "Remove this scale"
                      }
                      disabled={used.has(scale.id)}
                      onClick={() => {
                        onOpen(undefined);
                        onChange({
                          ...definition,
                          scales: definition.scales.filter(
                            (item) => item.id !== scale.id
                          ),
                        });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                {open &&
                  (scale.kind === "position" ? (
                    <PositionScaleProperties
                      scale={scale}
                      onChange={(patch) => update(scale.id, patch)}
                    />
                  ) : (
                    <ValueScaleProperties
                      scale={scale}
                      onChange={(patch) => update(scale.id, patch)}
                    />
                  ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function describeScale(scale: CompositionScale) {
  const domain = scale.domain === "shared" ? "shared" : "per unit";
  if (scale.kind === "position")
    return `${scale.interval ? `by ${scale.interval}` : "bands"} · ${domain}`;
  return `${scale.transform} · ${domain}`;
}

function PositionScaleProperties({
  scale,
  onChange,
}: {
  scale: PositionScale;
  onChange: (patch: Partial<PositionScale>) => void;
}) {
  const id = useId();
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const isDate =
    profiles.find((profile) => profile.name === scale.field)?.dataType ===
    "datetime";
  return (
    <div className="eda-setting-grid eda-composition-scale-props">
      <Label htmlFor={`${id}-name`}>Name</Label>
      <Input
        id={`${id}-name`}
        value={scale.name}
        onChange={(event) => onChange({ name: event.target.value })}
      />
      <Label>Field</Label>
      <FieldSelector
        label=""
        value={scale.field}
        onChange={(field) => {
          const date =
            profiles.find((profile) => profile.name === field)?.dataType ===
            "datetime";
          onChange({
            field,
            name: field,
            interval: date ? (scale.interval ?? "month") : undefined,
          });
        }}
      />
      {isDate && (
        <>
          <Label htmlFor={`${id}-interval`}>Bin by</Label>
          <select
            id={`${id}-interval`}
            className="eda-composition-select"
            value={scale.interval ?? "month"}
            onChange={(event) =>
              onChange({ interval: event.target.value as TimeInterval })
            }
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </>
      )}
      <span className="eda-setting-label">Domain</span>
      <Segmented
        label={`${scale.name} domain`}
        value={scale.domain}
        options={DOMAINS}
        onChange={(domain) => onChange({ domain })}
      />
    </div>
  );
}

function ValueScaleProperties({
  scale,
  onChange,
}: {
  scale: ValueScale;
  onChange: (patch: Partial<ValueScale>) => void;
}) {
  const id = useId();
  return (
    <div className="eda-setting-grid eda-composition-scale-props">
      <Label htmlFor={`${id}-name`}>Name</Label>
      <Input
        id={`${id}-name`}
        value={scale.name}
        onChange={(event) => onChange({ name: event.target.value })}
      />
      <span className="eda-setting-label">Spacing</span>
      <Segmented
        label={`${scale.name} transform`}
        value={scale.transform}
        options={TRANSFORMS}
        onChange={(transform) => onChange({ transform })}
      />
      <ColorSetting
        label="Low color"
        value={scale.colors[0]}
        onChange={(low) => onChange({ colors: [low, scale.colors[1]] })}
      />
      <ColorSetting
        label="High color"
        value={scale.colors[1]}
        onChange={(high) => onChange({ colors: [scale.colors[0], high] })}
      />
      <span className="eda-setting-label">Domain</span>
      <Segmented
        label={`${scale.name} domain`}
        value={scale.domain}
        options={DOMAINS}
        onChange={(domain) => onChange({ domain })}
      />
    </div>
  );
}
