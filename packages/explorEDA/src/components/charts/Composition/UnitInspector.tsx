import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Plus, Trash2 } from "lucide-react";
import { useId } from "react";
import type {
  InstanceOverride,
  CompositionCalculation,
  CompositionScale,
  MarkDefinition,
  RepeatRule,
  UnitElement,
} from "./compositionTypes";
import {
  ColorSetting,
  NumberSetting,
  PairSetting,
  Segmented,
} from "./inspectorControls";

const ARRANGEMENTS = [
  {
    value: "rows" as const,
    label: "Rows",
    tooltip: "Stack the repeats in one column, labeled on the left",
  },
  {
    value: "columns" as const,
    label: "Columns",
    tooltip: "Place the repeats side by side, labeled above",
  },
  {
    value: "grid" as const,
    label: "Grid",
    tooltip: "Wrap the repeats into a grid with a set number of columns",
  },
];

const ORDERS = [
  {
    value: "count" as const,
    label: "Most rows",
    tooltip: "Put the subsets with the most rows first",
  },
  {
    value: "label" as const,
    label: "A–Z",
    tooltip: "Order the subsets by name, with numbers in numeric order",
  },
];

const SHOWN = [
  { value: true, label: "Show", tooltip: "Draw it" },
  { value: false, label: "Hide", tooltip: "Leave it out of the graphic" },
] as const;

const SHAPES = [
  { value: "rect" as const, label: "Square", tooltip: "Draw a rectangle per bin" },
  { value: "circle" as const, label: "Circle", tooltip: "Draw a circle per bin" },
];

const ENCODINGS = [
  {
    value: "color" as const,
    label: "Color",
    tooltip: "Fill each glyph from the value scale's color ramp",
  },
  {
    value: "size" as const,
    label: "Size",
    tooltip: "Grow each glyph with its value; the largest fills its bin",
  },
  {
    value: "height" as const,
    label: "Height",
    tooltip:
      "Raise each glyph with its value, like a bar or dot plot inside the frame",
  },
];

export function UnitProperties({
  unit,
  scales,
  repeatCount,
  calculations,
  onChange,
  onEditScale,
}: {
  unit: UnitElement;
  scales: CompositionScale[];
  calculations: CompositionCalculation[];
  /** Repeats drawn now, so the template note can name them. */
  repeatCount: number;
  onChange: (patch: Partial<UnitElement>) => void;
  onEditScale: (scaleId: string) => void;
}) {
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const repeatFields = profiles
    .filter(
      (profile) =>
        profile.dataType !== "numeric" || profile.uniqueCount <= 60
    )
    .filter((profile) => profile.uniqueCount <= 200)
    .map((profile) => profile.name);
  const repeat = (patch: Partial<RepeatRule>) =>
    onChange({ repeat: { ...unit.repeat, ...patch } });
  const nameId = useId();

  return (
    <>
      <section
        className="eda-setting-section"
        aria-label={`${unit.name} repeat rule`}
      >
        <h5>{unit.name}</h5>
        <p className="eda-composition-scope" role="note">
          Template · edits apply to{" "}
          {repeatCount === 1 ? "the one unit" : `all ${repeatCount} repeats`}
        </p>
        <div className="eda-setting-grid">
          <Label htmlFor={nameId}>Layer name</Label>
          <Input
            id={nameId}
            value={unit.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
          <Label>Repeat by</Label>
          <FieldSelector
            label=""
            placeholder="One unit for all rows"
            value={unit.repeat.field ?? ""}
            allowClear
            fields={repeatFields}
            onChange={(field) => repeat({ field: field || undefined })}
          />
          {unit.repeat.field && (
            <>
              <span className="eda-setting-label">Arrange</span>
              <Segmented
                label="Repeat arrangement"
                value={unit.repeat.arrangement}
                options={ARRANGEMENTS}
                onChange={(arrangement) => repeat({ arrangement })}
              />
              {unit.repeat.arrangement === "grid" && (
                <NumberSetting
                  label="Columns"
                  min={1}
                  max={24}
                  value={unit.repeat.columns}
                  onChange={(columns) => repeat({ columns })}
                />
              )}
              <span className="eda-setting-label">Order</span>
              <Segmented
                label="Repeat order"
                value={unit.repeat.order}
                options={ORDERS}
                onChange={(order) => repeat({ order })}
              />
              <NumberSetting
                label="Most units"
                min={1}
                max={200}
                value={unit.repeat.limit}
                onChange={(limit) => repeat({ limit })}
              />
              <NumberSetting
                label="Gap"
                min={0}
                max={200}
                value={unit.repeat.gap}
                onChange={(gap) => repeat({ gap })}
              />
            </>
          )}
          <PairSetting
            label="Frame"
            names={["W", "H"]}
            min={4}
            values={[unit.frame.width, unit.frame.height]}
            onChange={([width, height]) => onChange({ frame: { width, height } })}
          />
          <span className="eda-setting-label">Labels</span>
          <Segmented
            label="Repeat labels"
            value={unit.label.show}
            options={SHOWN}
            onChange={(show) => onChange({ label: { ...unit.label, show } })}
          />
          {unit.label.show && (
            <>
              <Label htmlFor={`${nameId}-label-value`}>Label value</Label>
              <select
                id={`${nameId}-label-value`}
                className="eda-composition-select"
                value={unit.label.valueCalcId ?? ""}
                onChange={(event) =>
                  onChange({
                    label: {
                      ...unit.label,
                      valueCalcId: event.target.value || undefined,
                    },
                  })
                }
              >
                <option value="">None</option>
                {calculations.map((calc) => (
                  <option key={calc.id} value={calc.id}>
                    {calc.name}
                  </option>
                ))}
              </select>
            </>
          )}
          {unit.label.show && unit.repeat.arrangement === "rows" && (
            <NumberSetting
              label="Label width"
              min={0}
              max={600}
              value={unit.label.width}
              onChange={(width) => onChange({ label: { ...unit.label, width } })}
            />
          )}
          <span className="eda-setting-label">Axis</span>
          <Segmented
            label="Position labels"
            value={unit.axis}
            options={SHOWN}
            onChange={(axis) => onChange({ axis })}
          />
          <PairSetting
            label="Position"
            names={["X", "Y"]}
            values={[unit.x, unit.y]}
            onChange={([x, y]) => onChange({ x, y })}
          />
        </div>
      </section>
      <MarksSection
        unit={unit}
        scales={scales}
        onChange={(marks) => onChange({ marks })}
        onEditScale={onEditScale}
      />
    </>
  );
}

function MarksSection({
  unit,
  scales,
  onChange,
  onEditScale,
}: {
  unit: UnitElement;
  scales: CompositionScale[];
  onChange: (marks: MarkDefinition[]) => void;
  onEditScale: (scaleId: string) => void;
}) {
  const update = (id: string, patch: Partial<MarkDefinition>) =>
    onChange(
      unit.marks.map((mark) => (mark.id === id ? { ...mark, ...patch } : mark))
    );
  const addMark = () => {
    const first = unit.marks[0];
    if (!first) return;
    const ids = new Set(unit.marks.map((mark) => mark.id));
    let index = 1;
    while (ids.has(`mark-${index}`)) index += 1;
    onChange([
      ...unit.marks,
      {
        ...first,
        id: `mark-${index}`,
        name: "Dots",
        shape: "circle",
        encoding: "size",
        fill: "#1f2328",
      },
    ]);
  };
  return (
    <section className="eda-setting-section" aria-label="Marks">
      <div className="eda-composition-section-head">
        <h5>Marks</h5>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          tooltip="Layer another mark over this unit's frame, drawn from the same rows"
          onClick={addMark}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Mark
        </Button>
      </div>
      {unit.marks.map((mark) => (
        <MarkProperties
          key={mark.id}
          mark={mark}
          scales={scales}
          canRemove={unit.marks.length > 1}
          onChange={(patch) => update(mark.id, patch)}
          onRemove={() =>
            onChange(unit.marks.filter((item) => item.id !== mark.id))
          }
          onEditScale={onEditScale}
        />
      ))}
    </section>
  );
}

function MarkProperties({
  mark,
  scales,
  canRemove,
  onChange,
  onRemove,
  onEditScale,
}: {
  mark: MarkDefinition;
  scales: CompositionScale[];
  canRemove: boolean;
  onChange: (patch: Partial<MarkDefinition>) => void;
  onRemove: () => void;
  onEditScale: (scaleId: string) => void;
}) {
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const numericFields = profiles
    .filter((profile) => profile.dataType === "numeric")
    .map((profile) => profile.name);
  const id = useId();
  const positions = scales.filter((scale) => scale.kind === "position");
  const values = scales.filter((scale) => scale.kind === "value");
  return (
    <div className="eda-composition-mark">
      <div className="eda-composition-section-head">
        <span className="eda-composition-mark-name">{mark.name}</span>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`Remove ${mark.name}`}
            tooltip="Remove this mark from every repeat"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="eda-setting-grid">
        <span className="eda-setting-label">Shape</span>
        <Segmented
          label={`${mark.name} shape`}
          value={mark.shape}
          options={SHAPES}
          onChange={(shape) => onChange({ shape })}
        />
        <Label htmlFor={`${id}-position`}>Position</Label>
        <ScaleSelect
          id={`${id}-position`}
          value={mark.positionScaleId}
          scales={positions}
          onChange={(positionScaleId) => onChange({ positionScaleId })}
          onEdit={onEditScale}
        />
        <Label htmlFor={`${id}-aggregation`}>Value</Label>
        <select
          id={`${id}-aggregation`}
          className="eda-composition-select"
          value={mark.aggregation}
          onChange={(event) => {
            const aggregation = event.target
              .value as MarkDefinition["aggregation"];
            onChange({
              aggregation,
              measureField:
                aggregation === "count"
                  ? undefined
                  : (mark.measureField ?? numericFields[0]),
            });
          }}
        >
          <option value="count">Count rows</option>
          <option value="sum" disabled={!numericFields.length}>
            Sum
          </option>
          <option value="average" disabled={!numericFields.length}>
            Average
          </option>
        </select>
        {mark.aggregation !== "count" && (
          <>
            <Label>Of</Label>
            <FieldSelector
              label=""
              placeholder="Measure"
              value={mark.measureField ?? ""}
              fields={numericFields}
              onChange={(measureField) => onChange({ measureField })}
            />
          </>
        )}
        <span className="eda-setting-label">Encode as</span>
        <Segmented
          label={`${mark.name} encoding`}
          value={mark.encoding}
          options={ENCODINGS}
          onChange={(encoding) => onChange({ encoding })}
        />
        <Label htmlFor={`${id}-value`}>Value scale</Label>
        <ScaleSelect
          id={`${id}-value`}
          value={mark.valueScaleId}
          scales={values}
          onChange={(valueScaleId) => onChange({ valueScaleId })}
          onEdit={onEditScale}
        />
        {mark.encoding !== "color" && (
          <ColorSetting
            label="Fill"
            value={mark.fill}
            onChange={(fill) => onChange({ fill })}
          />
        )}
        <NumberSetting
          label="Spacing"
          min={0}
          max={20}
          value={mark.inset}
          onChange={(inset) => onChange({ inset })}
        />
      </div>
    </div>
  );
}

function ScaleSelect({
  id,
  value,
  scales,
  onChange,
  onEdit,
}: {
  id: string;
  value: string;
  scales: CompositionScale[];
  onChange: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="eda-composition-scale-select">
      <select
        id={id}
        className="eda-composition-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {scales.map((scale) => (
          <option key={scale.id} value={scale.id}>
            {scale.name}
          </option>
        ))}
      </select>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        tooltip="Open this scale's settings below. Every mark that uses it changes."
        onClick={() => onEdit(value)}
      >
        Edit
      </Button>
    </div>
  );
}

/** Edits one repeat apart from its template: placement and look only. */
export function OverrideProperties({
  label,
  override,
  onChange,
  onReset,
  onEditTemplate,
}: {
  label: string;
  override?: InstanceOverride;
  onChange: (patch: Partial<InstanceOverride>) => void;
  onReset: () => void;
  onEditTemplate: () => void;
}) {
  return (
    <section
      className="eda-setting-section eda-composition-override"
      aria-label={`${label} override`}
    >
      <div className="eda-composition-section-head">
        <h5>Repeat: {label}</h5>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          tooltip="Select the template again. Its edits apply to every repeat."
          onClick={onEditTemplate}
        >
          Edit template
        </Button>
      </div>
      <p className="eda-composition-scope" role="note">
        Override · changes only this repeat. Its rows, calculations, and scales
        still come from the template.
      </p>
      <div className="eda-setting-grid">
        <PairSetting
          label="Nudge"
          names={["X", "Y"]}
          values={[override?.dx ?? 0, override?.dy ?? 0]}
          onChange={([dx, dy]) => onChange({ dx, dy })}
        />
        <span className="eda-setting-label">Accent</span>
        <div className="eda-composition-color">
          <input
            type="color"
            aria-label={`${label} accent color`}
            value={override?.accent ?? "#1f4e8c"}
            onChange={(event) => onChange({ accent: event.target.value })}
          />
          {override?.accent ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              tooltip="Use the template's colors for this repeat again"
              onClick={() => onChange({ accent: undefined })}
            >
              Clear
            </Button>
          ) : (
            <span className="text-muted-foreground">Template colors</span>
          )}
        </div>
        <NumberSetting
          label="Opacity %"
          min={10}
          max={100}
          value={Math.round((override?.opacity ?? 1) * 100)}
          onChange={(value) =>
            onChange({ opacity: value >= 100 ? undefined : value / 100 })
          }
        />
        <span className="eda-setting-label">Label</span>
        <Segmented
          label={`${label} label weight`}
          value={Boolean(override?.emphasize)}
          options={[
            { value: false, label: "Template", tooltip: "Use the template's label weight" },
            { value: true, label: "Bold", tooltip: "Make this repeat's label bold, to call it out" },
          ]}
          onChange={(emphasize) => onChange({ emphasize })}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 h-7"
        disabled={!override}
        tooltip="Remove every change made to this repeat, so it matches the template"
        onClick={onReset}
      >
        Reset to template
      </Button>
    </section>
  );
}
