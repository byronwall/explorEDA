import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useDataLayer, type IdType } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { useAnnotationRows } from "../../charts/annotations/useAnnotationRows";
import { useAnnotationStatuses } from "../../charts/annotations/annotationStatus";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { ActionTooltip } from "../../ui/tooltip";
import {
  annotationContext,
  type AnnotationContext,
} from "@/lib/annotations/context";
import {
  createBand,
  createCallout,
  createInterval,
  createReferenceLine,
  duplicateAnnotation,
} from "@/lib/annotations/create";
import {
  ANNOTATION_STATUS_TEXT,
  resolveRecord,
  uniqueKeyFields,
  type AnnotationStatus,
  type ColumnGetter,
} from "@/lib/annotations/resolve";
import {
  ANNOTATION_TYPE_NAMES,
  annotationLabel,
  type ChartAnnotation,
} from "@/lib/annotations/types";
import { HeldInput } from "./annotationInputs";
import {
  BandFields,
  CalloutFields,
  IntervalFields,
  ReferenceFields,
} from "./AnnotationFields";

interface AnnotationsSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

/**
 * What rows and filters say about an annotation, for when no drawn panel
 * has reported on it, such as while the chart is off screen.
 */
function listStatus(
  annotation: ChartAnnotation,
  ids: IdType[],
  getColumn: ColumnGetter,
  visible: Set<IdType>
): AnnotationStatus {
  if (annotation.hidden) return "hidden";
  if (annotation.type === "interval")
    return annotation.lowerField && annotation.upperField ? "shown" : "invalid";
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
  const context = annotationContext(settings);
  const { ids, getColumn } = useAnnotationRows();
  const drawn = useAnnotationStatuses(settings.id);
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
  const source = { fields, ids, getColumn, ...context };

  const write = (next: ChartAnnotation[]) =>
    onSettingChange("annotations", next.length ? next : undefined);
  const add = (annotation: ChartAnnotation) =>
    write([...annotations, annotation]);

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">
        Annotations save with this chart. A callout on a record follows that
        record through filters and data updates.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Add</span>
        <Button
          size="sm"
          variant="outline"
          tooltip={
            context.records
              ? "Add a label attached to the record with the largest value. Change the record or text below."
              : "Add a label at a fixed point. Change its position and text below."
          }
          onClick={() => add(createCallout(source))}
        >
          Callout
        </Button>
        <Button
          size="sm"
          variant="outline"
          tooltip={
            context.xDate
              ? "Add a vertical line at a date, such as a release. Change its date below."
              : "Add a fixed target line at the median value. Change its axis and value below."
          }
          onClick={() => add(createReferenceLine(source))}
        >
          Line
        </Button>
        <Button
          size="sm"
          variant="outline"
          tooltip={
            context.xDate
              ? "Add a shaded period between two dates. Change its dates below."
              : "Add a shaded range between two values, such as a tolerance. Change it below."
          }
          onClick={() => add(createBand(source))}
        >
          Band
        </Button>
        {context.intervals && (
          <Button
            size="sm"
            variant="outline"
            tooltip="Shade between lower and upper bounds that each row already holds, such as a supplied forecast range. The chart computes no interval itself."
            onClick={() => add(createInterval(source))}
          >
            Interval
          </Button>
        )}
      </div>
      {annotations.length === 0 ? (
        <p className="text-xs text-muted-foreground">No annotations yet.</p>
      ) : (
        <ul className="space-y-2" aria-label="Annotations">
          {annotations.map((annotation, index) => (
            <AnnotationCard
              key={annotation.id}
              annotation={annotation}
              status={
                annotation.hidden
                  ? "hidden"
                  : (drawn[annotation.id] ??
                    listStatus(annotation, ids, getColumn, visible))
              }
              context={context}
              keyFields={keyFields}
              getColumn={getColumn}
              ids={ids}
              onChange={(next) =>
                write(
                  annotations.map((item) => (item.id === next.id ? next : item))
                )
              }
              onDuplicate={() =>
                write([
                  ...annotations.slice(0, index + 1),
                  duplicateAnnotation(annotation),
                  ...annotations.slice(index + 1),
                ])
              }
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
  context,
  keyFields,
  getColumn,
  ids,
  onChange,
  onDuplicate,
  onRemove,
}: {
  annotation: ChartAnnotation;
  status: AnnotationStatus;
  context: AnnotationContext;
  keyFields: string[];
  getColumn: ColumnGetter;
  ids: IdType[];
  onChange: (next: ChartAnnotation) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const label = annotationLabel(annotation);
  const statusText =
    status === "shown" ? undefined : ANNOTATION_STATUS_TEXT[status];
  const fieldProps = { context, onChange };
  return (
    <li
      className="space-y-2 rounded-md border border-border p-2"
      data-annotation-id={annotation.id}
    >
      <div className="flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          <span className="text-muted-foreground">
            {ANNOTATION_TYPE_NAMES[annotation.type]}:{" "}
          </span>
          {label}
        </span>
        {statusText && (
          <ActionTooltip content={statusText.help}>
            <span
              className={`shrink-0 rounded-sm px-1 text-[11px] ${
                status === "hidden" ||
                status === "filtered" ||
                status === "offscreen"
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
          aria-label={`Duplicate ${label}`}
          tooltip="Add a copy of this annotation below it"
          onClick={onDuplicate}
        >
          <Copy className="size-3.5" aria-hidden="true" />
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
      <div className="eda-setting-grid">
        <Label htmlFor={`${annotation.id}-name`}>Name</Label>
        <HeldInput
          id={`${annotation.id}-name`}
          value={annotation.name ?? ""}
          placeholder={label}
          onChange={(name) =>
            onChange({ ...annotation, name: name || undefined })
          }
        />
      </div>
      {annotation.type === "callout" ? (
        <CalloutFields
          annotation={annotation}
          {...fieldProps}
          keyFields={keyFields}
          getColumn={getColumn}
          ids={ids}
        />
      ) : annotation.type === "reference-line" ? (
        <ReferenceFields annotation={annotation} {...fieldProps} />
      ) : annotation.type === "band" ? (
        <BandFields annotation={annotation} {...fieldProps} />
      ) : (
        <IntervalFields annotation={annotation} {...fieldProps} />
      )}
    </li>
  );
}
