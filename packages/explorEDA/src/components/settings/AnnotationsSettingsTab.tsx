import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { useDataLayer, type IdType } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { useAnnotationRows } from "../charts/annotations/useAnnotationRows";
import { FieldSelector } from "../FieldSelector";
import { NumericInputEnter } from "../NumericInputEnter";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { ActionTooltip } from "../ui/tooltip";
import { createCallout, createReferenceLine } from "@/lib/annotations/create";
import {
  ANNOTATION_STATUS_TEXT,
  recordKey,
  resolveRecord,
  uniqueKeyFields,
  type AnnotationStatus,
  type ColumnGetter,
} from "@/lib/annotations/resolve";
import {
  annotationLabel,
  type CalloutAnnotation,
  type ChartAnnotation,
  type ReferenceLineAnnotation,
} from "@/lib/annotations/types";

const toggleClass =
  "w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary";

interface AnnotationsSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

function chartFields(settings: ChartSettings) {
  return "xField" in settings && "yField" in settings
    ? { xField: settings.xField, yField: settings.yField }
    : {};
}

/**
 * Typing in a field is one host change, reported when the field loses
 * focus, rather than one undo step per keystroke.
 */
function useHeldTyping() {
  const holdStateChanges = useDataLayer((state) => state.holdStateChanges);
  const release = useRef<(() => void) | null>(null);
  return {
    onFocus: () => {
      release.current ??= holdStateChanges();
    },
    onBlur: () => {
      release.current?.();
      release.current = null;
    },
  };
}

/**
 * The status the list shows for one annotation. Offscreen positions are the
 * chart's to report; this covers what the rows and filters decide.
 */
function listStatus(
  annotation: ChartAnnotation,
  ids: IdType[],
  getColumn: ColumnGetter,
  visible: Set<IdType>
): AnnotationStatus {
  if (annotation.hidden) return "hidden";
  if (annotation.type !== "callout" || annotation.attach.kind !== "record")
    return "shown";
  const resolution = resolveRecord(annotation.attach, getColumn, ids);
  if (resolution.status !== "found") return resolution.status;
  return visible.has(resolution.id) ? "shown" : "filtered";
}

export function AnnotationsSettingsTab({
  settings,
  onSettingChange,
}: AnnotationsSettingsTabProps) {
  const annotations = useMemo(
    () => settings.annotations ?? [],
    [settings.annotations]
  );
  const { ids, getColumn } = useAnnotationRows();
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  // Filter changes arrive as new live items for this chart.
  const liveItems = useDataLayer((state) => state.liveItems[settings.id]);
  const visible = useMemo(
    () => new Set(crossfilter.getChartFilteredRowIds(settings)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [crossfilter, liveItems, settings.filters, settings.localFilters]
  );
  const fields = getColumnNames();
  const keyFields = useMemo(
    () => uniqueKeyFields(fields, getColumn, ids),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields.join("\u0000"), getColumn, ids]
  );
  const source = { fields, ids, getColumn, ...chartFields(settings) };

  const write = (next: ChartAnnotation[]) =>
    onSettingChange("annotations", next.length ? next : undefined);
  const update = (next: ChartAnnotation) =>
    write(annotations.map((item) => (item.id === next.id ? next : item)));

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">
        Callouts and reference lines save with this chart. A callout on a record
        follows that record through filters and data updates.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          tooltip="Add a label attached to the record with the largest Y value. Change the record or text below."
          onClick={() => write([...annotations, createCallout(source)])}
        >
          Add callout
        </Button>
        <Button
          size="sm"
          variant="outline"
          tooltip="Add a fixed target line at the median Y value. Change its axis and value below."
          onClick={() => write([...annotations, createReferenceLine(source)])}
        >
          Add reference line
        </Button>
      </div>
      {annotations.length === 0 ? (
        <p className="text-xs text-muted-foreground">No annotations yet.</p>
      ) : (
        <ul className="space-y-2" aria-label="Annotations">
          {annotations.map((annotation) => (
            <AnnotationCard
              key={annotation.id}
              annotation={annotation}
              status={listStatus(annotation, ids, getColumn, visible)}
              keyFields={keyFields}
              getColumn={getColumn}
              ids={ids}
              onChange={update}
              onRemove={() =>
                write(annotations.filter((item) => item.id !== annotation.id))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AnnotationCard({
  annotation,
  status,
  keyFields,
  getColumn,
  ids,
  onChange,
  onRemove,
}: {
  annotation: ChartAnnotation;
  status: AnnotationStatus;
  keyFields: string[];
  getColumn: ColumnGetter;
  ids: IdType[];
  onChange: (next: ChartAnnotation) => void;
  onRemove: () => void;
}) {
  const label = annotationLabel(annotation);
  const statusText =
    status === "shown" ? undefined : ANNOTATION_STATUS_TEXT[status];
  return (
    <li
      className="space-y-2 rounded-md border border-border p-2"
      data-annotation-id={annotation.id}
    >
      <div className="flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          <span className="text-muted-foreground">
            {annotation.type === "callout" ? "Callout" : "Reference line"}:{" "}
          </span>
          {label}
        </span>
        {statusText && (
          <ActionTooltip content={statusText.help}>
            <span
              className={`shrink-0 rounded-sm px-1 text-[11px] ${
                status === "hidden" || status === "filtered"
                  ? "text-muted-foreground"
                  : "text-warning"
              }`}
              tabIndex={0}
              role="status"
            >
              {statusText.label}
            </span>
          </ActionTooltip>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          aria-label={annotation.hidden ? `Show ${label}` : `Hide ${label}`}
          tooltip={
            annotation.hidden
              ? "Show this annotation on the chart"
              : "Hide this annotation without removing it"
          }
          onClick={() =>
            onChange({
              ...annotation,
              hidden: annotation.hidden ? undefined : true,
            })
          }
        >
          {annotation.hidden ? (
            <EyeOff className="size-3.5" aria-hidden="true" />
          ) : (
            <Eye className="size-3.5" aria-hidden="true" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          aria-label={`Remove ${label}`}
          tooltip="Remove this annotation"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      {annotation.type === "callout" ? (
        <CalloutFields
          callout={annotation}
          keyFields={keyFields}
          getColumn={getColumn}
          ids={ids}
          onChange={onChange}
        />
      ) : (
        <ReferenceFields reference={annotation} onChange={onChange} />
      )}
    </li>
  );
}

function CalloutFields({
  callout,
  keyFields,
  getColumn,
  ids,
  onChange,
}: {
  callout: CalloutAnnotation;
  keyFields: string[];
  getColumn: ColumnGetter;
  ids: IdType[];
  onChange: (next: CalloutAnnotation) => void;
}) {
  const typing = useHeldTyping();
  const keyTyping = useHeldTyping();
  const attach = callout.attach;
  const textId = `${callout.id}-text`;
  const keyId = `${callout.id}-key`;
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
      attach: { kind: "record", keyFields: [field], key: key ?? [""] },
    });
  };
  return (
    <div className="eda-setting-grid">
      <Label htmlFor={textId}>Text</Label>
      <Input
        id={textId}
        value={callout.text}
        placeholder="What this point shows"
        {...typing}
        onChange={(event) => onChange({ ...callout, text: event.target.value })}
      />
      <span className="eda-setting-label">Attach to</span>
      <ToggleGroup
        type="single"
        value={attach.kind}
        onValueChange={(value) => {
          if (value === "record" && attach.kind !== "record") {
            if (keyFields[0]) toRecord(keyFields[0]);
          } else if (value === "coordinate" && attach.kind !== "coordinate")
            onChange({
              ...callout,
              attach: { kind: "coordinate", x: 0, y: 0 },
            });
        }}
        aria-label="Attach to"
        variant="outline"
        size="sm"
        className="grid w-full grid-cols-2"
      >
        <ActionTooltip
          content={
            keyFields.length
              ? "Follow one record, found by a key field, through filters and data updates."
              : "No field identifies every row once, so a record can't be attached."
          }
        >
          <ToggleGroupItem
            value="record"
            aria-label="Record"
            className={toggleClass}
            disabled={!keyFields.length && attach.kind !== "record"}
          >
            Record
          </ToggleGroupItem>
        </ActionTooltip>
        <ActionTooltip content="Stay at fixed X and Y values, whatever the rows do.">
          <ToggleGroupItem
            value="coordinate"
            aria-label="Fixed point"
            className={toggleClass}
          >
            Fixed point
          </ToggleGroupItem>
        </ActionTooltip>
      </ToggleGroup>
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
          <Label htmlFor={keyId}>Key value</Label>
          <Input
            id={keyId}
            value={String(attach.key[0] ?? "")}
            placeholder="The record's value"
            {...keyTyping}
            onChange={(event) =>
              onChange({
                ...callout,
                attach: { ...attach, key: [event.target.value] },
              })
            }
          />
        </>
      ) : (
        <>
          <span className="eda-setting-label">X, Y</span>
          <div className="grid grid-cols-2 gap-2">
            <NumericInputEnter
              aria-label="Callout X value"
              value={attach.x}
              onChange={(x) =>
                onChange({ ...callout, attach: { ...attach, x } })
              }
            />
            <NumericInputEnter
              aria-label="Callout Y value"
              value={attach.y}
              onChange={(y) =>
                onChange({ ...callout, attach: { ...attach, y } })
              }
            />
          </div>
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
    </div>
  );
}

function ReferenceFields({
  reference,
  onChange,
}: {
  reference: ReferenceLineAnnotation;
  onChange: (next: ReferenceLineAnnotation) => void;
}) {
  const typing = useHeldTyping();
  const labelId = `${reference.id}-label`;
  const valueId = `${reference.id}-value`;
  return (
    <div className="eda-setting-grid">
      <span className="eda-setting-label">Axis</span>
      <ToggleGroup
        type="single"
        value={reference.axis}
        onValueChange={(value) => {
          if (value === "x" || value === "y")
            onChange({ ...reference, axis: value });
        }}
        aria-label="Reference axis"
        variant="outline"
        size="sm"
        className="grid w-full grid-cols-2"
      >
        <ActionTooltip content="A horizontal line at a Y value, such as a target.">
          <ToggleGroupItem
            value="y"
            aria-label="Y value"
            className={toggleClass}
          >
            Y value
          </ToggleGroupItem>
        </ActionTooltip>
        <ActionTooltip content="A vertical line at an X value, such as a threshold.">
          <ToggleGroupItem
            value="x"
            aria-label="X value"
            className={toggleClass}
          >
            X value
          </ToggleGroupItem>
        </ActionTooltip>
      </ToggleGroup>
      <Label htmlFor={valueId}>Value</Label>
      <NumericInputEnter
        id={valueId}
        className="max-w-none"
        value={reference.value}
        onChange={(value) => onChange({ ...reference, value })}
      />
      <Label htmlFor={labelId}>Label</Label>
      <Input
        id={labelId}
        value={reference.label ?? ""}
        placeholder="Target"
        {...typing}
        onChange={(event) =>
          onChange({ ...reference, label: event.target.value || undefined })
        }
      />
      <span className="eda-setting-label">Line</span>
      <ToggleGroup
        type="single"
        value={reference.lineStyle ?? "dashed"}
        onValueChange={(value) => {
          if (value === "solid" || value === "dashed")
            onChange({
              ...reference,
              lineStyle: value === "dashed" ? undefined : value,
            });
        }}
        aria-label="Line style"
        variant="outline"
        size="sm"
        className="grid w-full grid-cols-2"
      >
        <ActionTooltip content="A dashed line, which reads as a reference rather than data.">
          <ToggleGroupItem
            value="dashed"
            aria-label="Dashed"
            className={toggleClass}
          >
            Dashed
          </ToggleGroupItem>
        </ActionTooltip>
        <ActionTooltip content="A solid line.">
          <ToggleGroupItem
            value="solid"
            aria-label="Solid"
            className={toggleClass}
          >
            Solid
          </ToggleGroupItem>
        </ActionTooltip>
      </ToggleGroup>
    </div>
  );
}
