import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Trash2 } from "lucide-react";
import { useId } from "react";
import {
  calcRows,
  describeCalc,
  evaluateCalc,
  formatCalcValue,
} from "./calculations";
import {
  newCalculationId,
  type AnnotationAnchor,
  type AnnotationElement,
  type CalcAggregation,
  type CompositionCalculation,
  type CompositionDefinition,
  type GuideElement,
  type UnitElement,
} from "./compositionTypes";
import {
  ColorSetting,
  NumberSetting,
  PairSetting,
  Segmented,
} from "./inspectorControls";
import { repeatSubsets, type CompositionData } from "./resolveUnit";

const POPULATIONS = [
  {
    value: "repeat" as const,
    label: "Each repeat",
    tooltip:
      "Compute once per repeated unit from that unit's rows, such as each correspondent's total",
  },
  {
    value: "composition" as const,
    label: "Whole graphic",
    tooltip:
      "Compute one value from every row in the graphic, shared by every repeat",
  },
];

const FILTER_POLICIES = [
  {
    value: "follow" as const,
    label: "Follow",
    tooltip: "Recompute from the rows that pass the active filters",
  },
  {
    value: "ignore" as const,
    label: "Ignore",
    tooltip:
      "Always use every row, so the value stays fixed while filters change. Shared and filter-independent are separate choices.",
  },
];

const AGGREGATIONS: { value: CalcAggregation; label: string }[] = [
  { value: "count", label: "Count rows" },
  { value: "sum", label: "Sum" },
  { value: "average", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

/** The calculations list, with the open one's scope and current value. */
export function CalculationsSection({
  definition,
  data,
  openId,
  onOpen,
  onChange,
}: {
  definition: CompositionDefinition;
  data: CompositionData;
  openId?: string;
  onOpen: (id: string | undefined) => void;
  onChange: (definition: CompositionDefinition) => void;
}) {
  const update = (id: string, patch: Partial<CompositionCalculation>) =>
    onChange({
      ...definition,
      calculations: definition.calculations.map((calc) =>
        calc.id === id ? { ...calc, ...patch } : calc
      ),
    });
  const used = new Set(
    definition.elements.flatMap((element) =>
      element.kind === "unit"
        ? [element.label.valueCalcId]
        : element.kind === "guide" && element.value.kind === "calc"
          ? [element.value.calcId]
          : []
    )
  );
  return (
    <section className="eda-setting-section" aria-label="Calculations">
      <div className="eda-composition-section-head">
        <h5>Calculations</h5>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          tooltip="Add a value computed from the data. Show it beside repeat labels, in text as {Name}, or as a guide."
          onClick={() => {
            const id = newCalculationId(definition);
            onChange({
              ...definition,
              calculations: [
                ...definition.calculations,
                {
                  id,
                  name: `Value ${definition.calculations.length + 1}`,
                  aggregation: "count",
                  population: "repeat",
                  filters: "follow",
                },
              ],
            });
            onOpen(id);
          }}
        >
          + Calculation
        </Button>
      </div>
      {definition.calculations.length === 0 ? (
        <p className="eda-setting-note">
          No calculations yet. Add one to label repeats or place a guide.
        </p>
      ) : (
        <ul className="eda-composition-layers">
          {definition.calculations.map((calc) => {
            const open = calc.id === openId;
            const whole = evaluateCalc(calc, data);
            return (
              <li key={calc.id} className="eda-composition-scale-row">
                <div className="flex w-full items-center">
                  <button
                    type="button"
                    className="eda-composition-layer"
                    aria-expanded={open}
                    onClick={() => onOpen(open ? undefined : calc.id)}
                  >
                    <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="truncate">{calc.name}</span>
                    <span className="eda-composition-layer-meta">
                      {calc.population === "repeat" ? "per repeat" : "graphic"}{" "}
                      · {calc.filters === "ignore" ? "all rows" : "filtered"}
                    </span>
                  </button>
                  {open && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label={`Delete ${calc.name}`}
                      tooltip={
                        used.has(calc.id)
                          ? "A label or guide uses this calculation. Remove that use first."
                          : "Remove this calculation"
                      }
                      disabled={used.has(calc.id)}
                      onClick={() => {
                        onOpen(undefined);
                        onChange({
                          ...definition,
                          calculations: definition.calculations.filter(
                            (item) => item.id !== calc.id
                          ),
                        });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                {open && (
                  <CalculationProperties
                    calc={calc}
                    data={data}
                    definition={definition}
                    wholeText={whole.text}
                    onChange={(patch) => update(calc.id, patch)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function CalculationProperties({
  calc,
  data,
  definition,
  wholeText,
  onChange,
}: {
  calc: CompositionCalculation;
  data: CompositionData;
  definition: CompositionDefinition;
  wholeText: string;
  onChange: (patch: Partial<CompositionCalculation>) => void;
}) {
  const id = useId();
  // Preview per-repeat values over the first unit's repeats.
  const unit = definition.elements.find(
    (element): element is UnitElement => element.kind === "unit"
  );
  const perRepeat =
    calc.population === "repeat" && unit
      ? repeatSubsets(unit, data).map((subset) => ({
          key: subset.key,
          result: evaluateCalc(calc, data, subset),
        }))
      : [];
  const numbers = perRepeat
    .map((item) => item.result.value)
    .filter((value): value is number => value !== undefined);
  const kind = perRepeat[0]?.result.kind ?? "number";
  const rows = calcRows(calc, data).length;
  return (
    <div className="eda-setting-grid eda-composition-scale-props">
      <Label htmlFor={`${id}-name`}>Name</Label>
      <Input
        id={`${id}-name`}
        value={calc.name}
        onChange={(event) => onChange({ name: event.target.value })}
      />
      <Label htmlFor={`${id}-aggregation`}>Value</Label>
      <select
        id={`${id}-aggregation`}
        className="eda-composition-select"
        value={calc.aggregation}
        onChange={(event) =>
          onChange({ aggregation: event.target.value as CalcAggregation })
        }
      >
        {AGGREGATIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {calc.aggregation !== "count" && (
        <>
          <Label>Of</Label>
          <FieldSelector
            label=""
            value={calc.field ?? ""}
            onChange={(field) => onChange({ field })}
          />
        </>
      )}
      <span className="eda-setting-label">Population</span>
      <Segmented
        label={`${calc.name} population`}
        value={calc.population}
        options={POPULATIONS}
        onChange={(population) => onChange({ population })}
      />
      <span className="eda-setting-label">Filters</span>
      <Segmented
        label={`${calc.name} filter policy`}
        value={calc.filters}
        options={FILTER_POLICIES}
        onChange={(filters) => onChange({ filters })}
      />
      <span className="eda-setting-label">Now</span>
      <p className="eda-composition-calc-now" role="status">
        {calc.population === "repeat" && perRepeat.length ? (
          <>
            <b>
              {formatCalcValue(Math.min(...numbers), kind)} –{" "}
              {formatCalcValue(Math.max(...numbers), kind)}
            </b>{" "}
            across {perRepeat.length} repeats
          </>
        ) : (
          <>
            <b>{wholeText}</b> from {rows.toLocaleString()} rows
          </>
        )}
        <span className="block text-muted-foreground">
          {describeCalc(calc)}.
        </span>
      </p>
    </div>
  );
}

export function GuideProperties({
  guide,
  definition,
  onChange,
}: {
  guide: GuideElement;
  definition: CompositionDefinition;
  onChange: (patch: Partial<GuideElement>) => void;
}) {
  const id = useId();
  const units = definition.elements.filter(
    (element): element is UnitElement => element.kind === "unit"
  );
  return (
    <section className="eda-setting-section" aria-label={`${guide.name} guide`}>
      <h5>{guide.name}</h5>
      <div className="eda-setting-grid">
        <Label htmlFor={`${id}-unit`}>Across</Label>
        <select
          id={`${id}-unit`}
          className="eda-composition-select"
          value={guide.unitId}
          onChange={(event) => onChange({ unitId: event.target.value })}
        >
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
        <span className="eda-setting-label">At</span>
        <Segmented
          label="Guide value source"
          value={guide.value.kind}
          options={[
            {
              value: "constant" as const,
              label: "Fixed value",
              tooltip:
                "A value you type, such as a date. It never changes with the data.",
            },
            {
              value: "calc" as const,
              label: "Calculation",
              tooltip:
                "A calculated value. It follows or ignores filters as the calculation says.",
            },
          ]}
          onChange={(kind) =>
            onChange({
              value:
                kind === "constant"
                  ? { kind, value: "" }
                  : {
                      kind,
                      calcId: definition.calculations[0]?.id ?? "",
                    },
            })
          }
        />
        {guide.value.kind === "constant" ? (
          <>
            <Label htmlFor={`${id}-value`}>Value</Label>
            <Input
              id={`${id}-value`}
              placeholder="2022-01-01"
              value={guide.value.value}
              onChange={(event) =>
                onChange({
                  value: { kind: "constant", value: event.target.value },
                })
              }
            />
          </>
        ) : (
          <>
            <Label htmlFor={`${id}-calc`}>Calculation</Label>
            <select
              id={`${id}-calc`}
              className="eda-composition-select"
              value={guide.value.calcId}
              onChange={(event) =>
                onChange({
                  value: { kind: "calc", calcId: event.target.value },
                })
              }
            >
              {!definition.calculations.length && (
                <option value="">Add a calculation first</option>
              )}
              {definition.calculations.map((calc) => (
                <option key={calc.id} value={calc.id}>
                  {calc.name}
                </option>
              ))}
            </select>
          </>
        )}
        <Label htmlFor={`${id}-label`}>Label</Label>
        <Input
          id={`${id}-label`}
          placeholder="Use {value} for the value"
          value={guide.label}
          onChange={(event) => onChange({ label: event.target.value })}
        />
        <ColorSetting
          label="Color"
          value={guide.color}
          onChange={(color) => onChange({ color })}
        />
        <PairSetting
          label="Label offset"
          names={["X", "Y"]}
          values={[guide.x, guide.y]}
          onChange={([x, y]) => onChange({ x, y })}
        />
      </div>
    </section>
  );
}

const ANCHORS = [
  {
    value: "page" as const,
    label: "Page",
    tooltip: "Stay at a fixed point on the artboard",
  },
  {
    value: "frame" as const,
    label: "Frame",
    tooltip: "Stay at a point inside one repeat's frame, and move with it",
  },
  {
    value: "data" as const,
    label: "Data",
    tooltip:
      "Follow a mark chosen from the data, such as the busiest month, as filters change",
  },
];

const PICKS = [
  {
    value: "max" as const,
    label: "Largest",
    tooltip: "The glyph with the largest value, or the highest point",
  },
  {
    value: "min" as const,
    label: "Smallest",
    tooltip: "The glyph with the smallest value, or the lowest point",
  },
  {
    value: "first" as const,
    label: "First",
    tooltip:
      "The first glyph along the position scale, or the first point in order",
  },
  {
    value: "last" as const,
    label: "Last",
    tooltip:
      "The last glyph along the position scale, or the last point in order",
  },
  {
    value: "at" as const,
    label: "At…",
    tooltip:
      "The glyph whose bin or order value matches a value you type, such as a year",
  },
];

export function AnnotationProperties({
  note,
  definition,
  data,
  anchorPoint,
  onChange,
}: {
  note: AnnotationElement;
  definition: CompositionDefinition;
  data: CompositionData;
  /** Where the anchor resolves now, so switching to the page keeps the text in place. */
  anchorPoint?: { x: number; y: number };
  onChange: (patch: Partial<AnnotationElement>) => void;
}) {
  const id = useId();
  const units = definition.elements.filter(
    (element): element is UnitElement => element.kind === "unit"
  );
  const anchor = note.anchor;
  const unit =
    anchor.kind === "page"
      ? undefined
      : units.find((item) => item.id === anchor.unitId);
  const keys = unit
    ? repeatSubsets(unit, data).map((subset) => subset.key)
    : [];
  const setAnchor = (kind: AnnotationAnchor["kind"]) => {
    if (kind === anchor.kind) return;
    if (kind === "page") {
      const point = anchorPoint ?? { x: 0, y: 0 };
      onChange({
        anchor: { kind },
        x: Math.round(point.x + note.x),
        y: Math.round(point.y + note.y - note.fontSize / 2),
        leader: false,
      });
      return;
    }
    const target = unit ?? units[0];
    if (!target) return;
    const instanceKey =
      anchor.kind === "page"
        ? (repeatSubsets(target, data)[0]?.key ?? "all")
        : anchor.instanceKey;
    onChange({
      anchor:
        kind === "frame"
          ? { kind, unitId: target.id, instanceKey, fx: 1, fy: 0.5 }
          : {
              kind,
              unitId: target.id,
              instanceKey,
              markId: target.marks[0]?.id ?? "",
              pick: "max",
            },
      x: 16,
      y: -14,
      leader: true,
    });
  };
  return (
    <section
      className="eda-setting-section"
      aria-label={`${note.name} annotation`}
    >
      <h5>{note.name}</h5>
      <div className="eda-setting-grid">
        <Label htmlFor={`${id}-text`}>Text</Label>
        <textarea
          id={`${id}-text`}
          className="eda-composition-textarea"
          rows={2}
          value={note.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
        <span className="eda-setting-label">Attach to</span>
        <Segmented
          label="Annotation anchor"
          value={anchor.kind}
          options={units.length ? ANCHORS : ANCHORS.slice(0, 1)}
          onChange={setAnchor}
        />
        {anchor.kind !== "page" && unit && (
          <>
            <Label htmlFor={`${id}-repeat`}>Repeat</Label>
            <select
              id={`${id}-repeat`}
              className="eda-composition-select"
              value={anchor.instanceKey}
              onChange={(event) =>
                onChange({
                  anchor: { ...anchor, instanceKey: event.target.value },
                })
              }
            >
              {!keys.includes(anchor.instanceKey) && (
                <option value={anchor.instanceKey}>
                  {anchor.instanceKey} (not drawn)
                </option>
              )}
              {keys.map((key) => (
                <option key={key} value={key}>
                  {key === "all" ? "The one unit" : key}
                </option>
              ))}
            </select>
          </>
        )}
        {anchor.kind === "data" && unit && (
          <>
            <Label htmlFor={`${id}-mark`}>Mark</Label>
            <select
              id={`${id}-mark`}
              className="eda-composition-select"
              value={anchor.markId}
              onChange={(event) =>
                onChange({ anchor: { ...anchor, markId: event.target.value } })
              }
            >
              {unit.marks.map((mark) => (
                <option key={mark.id} value={mark.id}>
                  {mark.name}
                </option>
              ))}
            </select>
            <span className="eda-setting-label">Glyph</span>
            <Segmented
              label="Glyph to follow"
              value={anchor.pick}
              options={PICKS}
              onChange={(pick) => onChange({ anchor: { ...anchor, pick } })}
            />
            {anchor.pick === "at" && (
              <>
                <Label htmlFor={`${id}-at`}>Matching</Label>
                <Input
                  id={`${id}-at`}
                  placeholder="A bin label or order value, such as 2008"
                  value={anchor.at ?? ""}
                  onChange={(event) =>
                    onChange({ anchor: { ...anchor, at: event.target.value } })
                  }
                />
              </>
            )}
          </>
        )}
        {anchor.kind === "frame" && (
          <PairSetting
            label="Frame point"
            names={["X", "Y"]}
            values={[anchor.fx, anchor.fy]}
            onChange={([fx, fy]) =>
              onChange({
                anchor: {
                  ...anchor,
                  fx: Math.min(1, Math.max(0, fx)),
                  fy: Math.min(1, Math.max(0, fy)),
                },
              })
            }
          />
        )}
        <PairSetting
          label={anchor.kind === "page" ? "Position" : "Offset"}
          names={["X", "Y"]}
          values={[note.x, note.y]}
          onChange={([x, y]) => onChange({ x, y })}
        />
        {anchor.kind !== "page" && (
          <>
            <span className="eda-setting-label">Leader</span>
            <Segmented
              label="Leader line"
              value={note.leader}
              options={[
                {
                  value: true,
                  label: "Show",
                  tooltip: "Draw a line from the anchor to the text",
                },
                {
                  value: false,
                  label: "Hide",
                  tooltip: "Show only the ring at the anchor",
                },
              ]}
              onChange={(leader) => onChange({ leader })}
            />
          </>
        )}
        <NumberSetting
          label="Size"
          min={6}
          max={72}
          value={note.fontSize}
          onChange={(fontSize) => onChange({ fontSize })}
        />
        <ColorSetting
          label="Color"
          value={note.color}
          onChange={(color) => onChange({ color })}
        />
      </div>
      {anchor.kind === "data" && (
        <p className="eda-setting-note">
          Use {"{label}"} and {"{value}"} for the followed glyph&apos;s bin and
          value, or {"{x}"} and {"{y}"} for a point&apos;s coordinates. A drag
          changes the offset and keeps the attachment.
        </p>
      )}
    </section>
  );
}
