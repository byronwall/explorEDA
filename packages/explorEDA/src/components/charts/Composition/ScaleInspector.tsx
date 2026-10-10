import { FieldSelector } from "@/components/FieldSelector";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { MoveHorizontal, Palette, Ruler, Trash2 } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import {
  markScaleIds,
  newScaleId,
  type CompositionDefinition,
  type CompositionScale,
  type NumericScale,
  type PositionScale,
  type TimeInterval,
  type ValueScale,
} from "./compositionTypes";
import {
  ColorSetting,
  NumberSetting,
  PairSetting,
  Segmented,
} from "./inspectorControls";

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
  {
    value: "linear" as const,
    label: "Linear",
    tooltip: "Equal steps in value make equal steps in output",
  },
  {
    value: "sqrt" as const,
    label: "Sqrt",
    tooltip: "Compress large values, so small counts stay visible",
  },
  {
    value: "log" as const,
    label: "Log",
    tooltip:
      "Compress large values strongly, for counts that span orders of magnitude",
  },
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
      element.kind === "unit" ? element.marks.flatMap(markScaleIds) : []
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
  const firstNumeric = profiles.find(
    (profile) => profile.dataType === "numeric"
  );

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
            disabled={!firstNumeric}
            tooltip="Add a numeric scale that places a field along a frame's width or height, for points and paths"
            onClick={() =>
              firstNumeric &&
              add({
                id: newScaleId(definition, "n"),
                kind: "numeric",
                name: firstNumeric.name,
                field: firstNumeric.name,
                domain: "shared",
                zero: false,
                nice: true,
              })
            }
          >
            + Numeric
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
            const Icon =
              scale.kind === "position"
                ? MoveHorizontal
                : scale.kind === "numeric"
                  ? Ruler
                  : Palette;
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
                  ) : scale.kind === "numeric" ? (
                    <NumericScaleProperties
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
  if (scale.kind === "numeric")
    return `${
      scale.min !== undefined || scale.max !== undefined ? "fixed" : "numeric"
    } · ${domain}`;
  return `${scale.transform} · ${domain}`;
}

const ZERO_OPTIONS = [
  {
    value: false,
    label: "Data",
    tooltip: "Span the data's smallest to largest value",
  },
  {
    value: true,
    label: "Include zero",
    tooltip:
      "Extend the span to zero, so heights and distances read from a baseline",
  },
];

const NICE_OPTIONS = [
  {
    value: true,
    label: "Ticks",
    tooltip: "Round the ends out to tidy tick values",
  },
  { value: false, label: "Exact", tooltip: "End exactly at the data's extent" },
];

const LIMIT_OPTIONS = [
  {
    value: false,
    label: "Fit data",
    tooltip: "The span follows the rows in the composition, or in each repeat",
  },
  {
    value: true,
    label: "Fixed",
    tooltip:
      "Type the ends. Marks outside them are clipped to the frame, not removed from the data.",
  },
];

function NumericScaleProperties({
  scale,
  onChange,
}: {
  scale: NumericScale;
  onChange: (patch: Partial<NumericScale>) => void;
}) {
  const id = useId();
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const numericFields = profiles
    .filter((profile) => profile.dataType === "numeric")
    .map((profile) => profile.name);
  const fixed = scale.min !== undefined || scale.max !== undefined;
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
        fields={numericFields}
        onChange={(field) => onChange({ field, name: field })}
      />
      <span className="eda-setting-label">Domain</span>
      <Segmented
        label={`${scale.name} domain`}
        value={scale.domain}
        options={DOMAINS}
        onChange={(domain) => onChange({ domain })}
      />
      <span className="eda-setting-label">Baseline</span>
      <Segmented
        label={`${scale.name} zero`}
        value={scale.zero}
        options={ZERO_OPTIONS}
        onChange={(zero) => onChange({ zero })}
      />
      <span className="eda-setting-label">Ends</span>
      <Segmented
        label={`${scale.name} rounding`}
        value={scale.nice}
        options={NICE_OPTIONS}
        onChange={(nice) => onChange({ nice })}
      />
      <span className="eda-setting-label">Limits</span>
      <Segmented
        label={`${scale.name} limits`}
        value={fixed}
        options={LIMIT_OPTIONS}
        onChange={(next) =>
          onChange(
            next
              ? { min: scale.min ?? 0, max: scale.max ?? 100 }
              : { min: undefined, max: undefined }
          )
        }
      />
      {fixed && (
        <PairSetting
          label="From, to"
          names={["Min", "Max"]}
          values={[scale.min ?? 0, scale.max ?? 100]}
          onChange={([min, max]) => onChange({ min, max })}
        />
      )}
    </div>
  );
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
      <span className="eda-setting-label">Ramp</span>
      <div className="eda-composition-ramp">
        {scale.colors.map((color, index) => {
          const stops =
            scale.stops ??
            scale.colors.map((_, position) =>
              scale.colors.length > 1 ? position / (scale.colors.length - 1) : 0
            );
          return (
            <div key={index} className="eda-composition-ramp-stop">
              <input
                type="color"
                aria-label={`Ramp color ${index + 1}`}
                value={color}
                onChange={(event) =>
                  onChange({
                    colors: scale.colors.map((item, position) =>
                      position === index ? event.target.value : item
                    ),
                  })
                }
              />
              <NumericInputEnter
                aria-label={`Ramp stop ${index + 1} position`}
                value={Math.round(stops[index]! * 100)}
                min={0}
                max={100}
                onChange={(next) =>
                  Number.isFinite(next) &&
                  onChange({
                    stops: stops.map((stop, position) =>
                      position === index
                        ? Math.min(1, Math.max(0, next / 100))
                        : stop
                    ),
                  })
                }
              />
              <span aria-hidden="true">%</span>
              {scale.colors.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  aria-label={`Remove ramp stop ${index + 1}`}
                  tooltip="Remove this color from the ramp"
                  onClick={() =>
                    onChange({
                      colors: scale.colors.filter(
                        (_, position) => position !== index
                      ),
                      stops: scale.stops
                        ? scale.stops.filter(
                            (_, position) => position !== index
                          )
                        : undefined,
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 self-start"
          tooltip="Add a color stop. Set each stop's position as a percent of the ramp, so a few high values can take the strongest colors."
          onClick={() => {
            const stops =
              scale.stops ??
              scale.colors.map((_, position) =>
                scale.colors.length > 1
                  ? position / (scale.colors.length - 1)
                  : 0
              );
            // The old top color moves halfway toward the end; a copy of it
            // takes the end, ready to recolor.
            const last = scale.colors[scale.colors.length - 1]!;
            const previous = stops[stops.length - 2] ?? 0;
            onChange({
              colors: [...scale.colors, last],
              stops: [...stops.slice(0, -1), (previous + 1) / 2, 1],
            });
          }}
        >
          + Stop
        </Button>
      </div>
      <span className="eda-setting-label">Around zero</span>
      <Segmented
        label={`${scale.name} direction`}
        value={scale.center !== undefined}
        options={[
          {
            value: false,
            label: "One way",
            tooltip: "Values run from the low color to the high color",
          },
          {
            value: true,
            label: "Diverging",
            tooltip:
              "A middle color stands for no change; decreases run toward the low color and increases toward the high color",
          },
        ]}
        onChange={(diverging) =>
          onChange({
            center: diverging ? (scale.center ?? "#d9dde3") : undefined,
          })
        }
      />
      {scale.center !== undefined && (
        <ColorSetting
          label="Middle color"
          value={scale.center}
          onChange={(center) => onChange({ center })}
        />
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
