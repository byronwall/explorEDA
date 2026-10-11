import type { IdType } from "@/providers/DataLayerProvider";
import type { AnnotationContext } from "@/lib/annotations/context";
import {
  recordKey,
  resolveRecord,
  type ColumnGetter,
} from "@/lib/annotations/resolve";
import type {
  AnnotationYAxis,
  BandAnnotation,
  CalloutAnnotation,
  ChartAnnotation,
  IntervalAnnotation,
  ReferenceLineAnnotation,
} from "@/lib/annotations/types";
import { FieldSelector } from "../../FieldSelector";
import { NumericInputEnter } from "../../NumericInputEnter";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Choice, HeldInput, ValueInput } from "./annotationInputs";

export interface FieldsProps<T extends ChartAnnotation> {
  annotation: T;
  context: AnnotationContext;
  onChange: (next: T) => void;
}

const AXIS_OPTIONS = (context: AnnotationContext) => [
  {
    value: "y" as const,
    label: "Y value",
    help: "Across the plot at a Y value, such as a target or tolerance.",
  },
  {
    value: "x" as const,
    label: context.xDate ? "Date" : "X value",
    help: context.xDate
      ? "Up the plot at a date, such as a release or an event."
      : "Up the plot at an X value, such as a threshold.",
  },
];

/** The vertical axis a value reads on, when the chart has a right axis. */
function YAxisChoice({
  context,
  value,
  onChange,
}: {
  context: AnnotationContext;
  value: AnnotationYAxis | undefined;
  onChange: (value: AnnotationYAxis | undefined) => void;
}) {
  if (!context.rightAxis) return null;
  return (
    <>
      <span className="eda-setting-label">Y axis</span>
      <Choice
        label="Y axis"
        value={value ?? "left"}
        onChange={(next) => onChange(next === "left" ? undefined : next)}
        options={[
          {
            value: "left",
            label: "Left",
            help: "Read Y values on the left axis.",
          },
          {
            value: "right",
            label: "Right",
            help: "Read Y values on the right axis, with the series drawn there.",
          },
        ]}
      />
    </>
  );
}

export function CalloutFields({
  annotation: callout,
  context,
  onChange,
  keyFields,
  getColumn,
  ids,
}: FieldsProps<CalloutAnnotation> & {
  keyFields: string[];
  getColumn: ColumnGetter;
  ids: IdType[];
}) {
  const attach = callout.attach;
  const toRecord = (field: string) => {
    // Keep the same record when switching key fields, if one resolves.
    const resolved =
      attach.kind === "record"
        ? resolveRecord(attach, getColumn, ids)
        : undefined;
    const key =
      resolved?.status === "found"
        ? recordKey([field], getColumn, resolved.id)
        : undefined;
    onChange({
      ...callout,
      attach: {
        kind: "record",
        keyFields: [field],
        key: key ?? [""],
        yField: attach.kind === "record" ? attach.yField : undefined,
      },
    });
  };
  const canAttachRecord = context.records && keyFields.length > 0;
  return (
    <div className="eda-setting-grid">
      <Label htmlFor={`${callout.id}-text`}>Text</Label>
      <HeldInput
        id={`${callout.id}-text`}
        value={callout.text}
        placeholder="What this point shows"
        onChange={(text) => onChange({ ...callout, text })}
      />
      <span className="eda-setting-label">Attach to</span>
      <Choice
        label="Attach to"
        value={attach.kind}
        onChange={(kind) => {
          if (kind === "record" && attach.kind !== "record") {
            if (keyFields[0]) toRecord(keyFields[0]);
          } else if (kind === "coordinate" && attach.kind !== "coordinate")
            onChange({
              ...callout,
              attach: { kind: "coordinate", x: 0, y: 0 },
            });
        }}
        options={[
          {
            value: "record",
            label: "Record",
            help: !context.records
              ? "This chart draws grouped values, not single records."
              : keyFields.length
                ? "Follow one record, found by a key field, through filters and data updates."
                : "No field identifies every row once, so a record can't be attached.",
            disabled: !canAttachRecord && attach.kind !== "record",
          },
          {
            value: "coordinate",
            label: "Fixed point",
            help: "Stay at fixed X and Y values, whatever the rows do.",
          },
        ]}
      />
      {attach.kind === "record" ? (
        <>
          <span className="eda-setting-label">Key field</span>
          <FieldSelector
            label=""
            placeholder="Field that identifies a row"
            value={attach.keyFields[0] ?? ""}
            fields={
              keyFields.includes(attach.keyFields[0] ?? "")
                ? keyFields
                : [...attach.keyFields, ...keyFields]
            }
            onChange={(field) => field && toRecord(field)}
          />
          <Label htmlFor={`${callout.id}-key`}>Key value</Label>
          <HeldInput
            id={`${callout.id}-key`}
            value={String(attach.key[0] ?? "")}
            placeholder="The record's value"
            onChange={(value) =>
              onChange({ ...callout, attach: { ...attach, key: [value] } })
            }
          />
          {context.measureFields.length > 1 && (
            <>
              <span className="eda-setting-label">On series</span>
              <FieldSelector
                label=""
                value={attach.yField ?? context.measureFields[0]!}
                fields={context.measureFields}
                onChange={(yField) =>
                  yField &&
                  onChange({ ...callout, attach: { ...attach, yField } })
                }
              />
            </>
          )}
        </>
      ) : (
        <>
          <span className="eda-setting-label">
            {context.xDate ? "Date, Y" : "X, Y"}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <ValueInput
              aria-label={context.xDate ? "Callout date" : "Callout X value"}
              date={context.xDate}
              value={attach.x}
              onChange={(x) =>
                onChange({ ...callout, attach: { ...attach, x } })
              }
            />
            <ValueInput
              aria-label="Callout Y value"
              value={attach.y}
              onChange={(y) =>
                onChange({ ...callout, attach: { ...attach, y } })
              }
            />
          </div>
          <YAxisChoice
            context={context}
            value={callout.yAxis}
            onChange={(yAxis) => onChange({ ...callout, yAxis })}
          />
        </>
      )}
      <span className="eda-setting-label">Label offset</span>
      <div className="grid grid-cols-2 gap-2">
        <NumericInputEnter
          aria-label="Label offset right, in pixels"
          value={callout.offset.dx}
          onChange={(dx) =>
            onChange({ ...callout, offset: { ...callout.offset, dx } })
          }
        />
        <NumericInputEnter
          aria-label="Label offset down, in pixels"
          value={callout.offset.dy}
          onChange={(dy) =>
            onChange({ ...callout, offset: { ...callout.offset, dy } })
          }
        />
      </div>
      <Label htmlFor={`${callout.id}-leader`}>Leader line</Label>
      <Switch
        id={`${callout.id}-leader`}
        checked={callout.leader !== false}
        onCheckedChange={(checked) =>
          onChange({ ...callout, leader: checked ? undefined : false })
        }
      />
      <Label htmlFor={`${callout.id}-arrow`}>Arrowhead</Label>
      <Switch
        id={`${callout.id}-arrow`}
        checked={Boolean(callout.arrow)}
        onCheckedChange={(checked) =>
          onChange({ ...callout, arrow: checked || undefined })
        }
      />
    </div>
  );
}

export function ReferenceFields({
  annotation: reference,
  context,
  onChange,
}: FieldsProps<ReferenceLineAnnotation>) {
  const date = context.xDate && reference.axis === "x";
  return (
    <div className="eda-setting-grid">
      <span className="eda-setting-label">Axis</span>
      <Choice
        label="Reference axis"
        value={reference.axis}
        onChange={(axis) => onChange({ ...reference, axis })}
        options={AXIS_OPTIONS(context)}
      />
      <Label htmlFor={`${reference.id}-value`}>{date ? "Date" : "Value"}</Label>
      <ValueInput
        id={`${reference.id}-value`}
        date={date}
        value={reference.value}
        onChange={(value) => onChange({ ...reference, value })}
      />
      <Label htmlFor={`${reference.id}-label`}>Label</Label>
      <HeldInput
        id={`${reference.id}-label`}
        value={reference.label ?? ""}
        placeholder={reference.axis === "x" ? "Event" : "Target"}
        onChange={(label) =>
          onChange({ ...reference, label: label || undefined })
        }
      />
      <span className="eda-setting-label">Line</span>
      <Choice
        label="Line style"
        value={reference.lineStyle ?? "dashed"}
        onChange={(lineStyle) =>
          onChange({
            ...reference,
            lineStyle: lineStyle === "dashed" ? undefined : lineStyle,
          })
        }
        options={[
          {
            value: "dashed",
            label: "Dashed",
            help: "A dashed line, which reads as a reference rather than data.",
          },
          { value: "solid", label: "Solid", help: "A solid line." },
        ]}
      />
      {reference.axis === "y" && (
        <YAxisChoice
          context={context}
          value={reference.yAxis}
          onChange={(yAxis) => onChange({ ...reference, yAxis })}
        />
      )}
    </div>
  );
}

export function BandFields({
  annotation: band,
  context,
  onChange,
}: FieldsProps<BandAnnotation>) {
  const date = context.xDate && band.axis === "x";
  return (
    <div className="eda-setting-grid">
      <span className="eda-setting-label">Axis</span>
      <Choice
        label="Band axis"
        value={band.axis}
        onChange={(axis) => onChange({ ...band, axis })}
        options={[
          {
            value: "y",
            label: "Y range",
            help: "A span of Y values, such as a tolerance or normal range.",
          },
          {
            value: "x",
            label: context.xDate ? "Period" : "X range",
            help: context.xDate
              ? "A span of dates, such as a campaign or an outage."
              : "A span of X values.",
          },
        ]}
      />
      <span className="eda-setting-label">From, to</span>
      <div className="grid grid-cols-2 gap-2">
        <ValueInput
          aria-label="Band start"
          date={date}
          value={band.from}
          onChange={(from) => onChange({ ...band, from })}
        />
        <ValueInput
          aria-label="Band end"
          date={date}
          value={band.to}
          onChange={(to) => onChange({ ...band, to })}
        />
      </div>
      <Label htmlFor={`${band.id}-label`}>Label</Label>
      <HeldInput
        id={`${band.id}-label`}
        value={band.label ?? ""}
        placeholder="What the span means"
        onChange={(label) => onChange({ ...band, label: label || undefined })}
      />
      <span className="eda-setting-label">Show as</span>
      <Choice
        label="Band display"
        value={band.display ?? "fill"}
        onChange={(display) =>
          onChange({
            ...band,
            display: display === "fill" ? undefined : display,
          })
        }
        options={[
          {
            value: "fill",
            label: "Shaded",
            help: "Shade the span across the plot.",
          },
          {
            value: "bracket",
            label: "Bracket",
            help: "Mark the span with a bracket along the plot edge, leaving the marks unshaded.",
          },
        ]}
      />
      {band.axis === "y" && (
        <YAxisChoice
          context={context}
          value={band.yAxis}
          onChange={(yAxis) => onChange({ ...band, yAxis })}
        />
      )}
    </div>
  );
}

export function IntervalFields({
  annotation: interval,
  context,
  onChange,
}: FieldsProps<IntervalAnnotation>) {
  return (
    <div className="eda-setting-grid">
      <span className="eda-setting-label">Lower bound</span>
      <FieldSelector
        label=""
        placeholder="Field with each row's lower bound"
        value={interval.lowerField}
        onChange={(lowerField) =>
          lowerField && onChange({ ...interval, lowerField })
        }
      />
      <span className="eda-setting-label">Upper bound</span>
      <FieldSelector
        label=""
        placeholder="Field with each row's upper bound"
        value={interval.upperField}
        onChange={(upperField) =>
          upperField && onChange({ ...interval, upperField })
        }
      />
      <Label htmlFor={`${interval.id}-meaning`}>Meaning</Label>
      <HeldInput
        id={`${interval.id}-meaning`}
        value={interval.meaning}
        placeholder="Such as: supplied 90% forecast range"
        onChange={(meaning) => onChange({ ...interval, meaning })}
      />
      <YAxisChoice
        context={context}
        value={interval.yAxis}
        onChange={(yAxis) => onChange({ ...interval, yAxis })}
      />
    </div>
  );
}
