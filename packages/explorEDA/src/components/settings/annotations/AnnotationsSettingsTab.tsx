import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useDataLayer, type IdType } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { useAnnotationRows } from "../../charts/annotations/useAnnotationRows";
import {
  useAnnotationDetails,
  useAnnotationStatuses,
} from "../../charts/annotations/annotationStatus";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { groupFacetData } from "../../charts/FacetRelated/FacetContainer";
import { ActionTooltip } from "../../ui/tooltip";
import {
  annotationContext,
  type AnnotationContext,
} from "@/lib/annotations/context";
import {
  createBand,
  createCallout,
  createInterval,
  createRecordSet,
  createReferenceLine,
  createRegion,
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
  RecordSetFields,
  ReferenceFields,
  RegionFields,
} from "./AnnotationFields";

const EVERY_PANEL = "__every";

/** More saved records than this would bloat every saved analysis. */
const MAX_SAVED_RECORDS = 500;

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
  // After a removal, focus moves to the card that took its place, or to
  // the add buttons, rather than falling back to the page.
  const rootRef = useRef<HTMLDivElement>(null);
  const focusAfterRemove = useRef<number | null>(null);
  useEffect(() => {
    const index = focusAfterRemove.current;
    if (index === null) return;
    focusAfterRemove.current = null;
    const cards = rootRef.current?.querySelectorAll<HTMLElement>(
      "li[data-annotation-id]"
    );
    const card = cards?.[Math.min(index, (cards?.length ?? 1) - 1)];
    (
      card?.querySelector<HTMLElement>("button") ??
      rootRef.current?.querySelector<HTMLElement>("button")
    )?.focus();
  }, [annotations]);
  const { ids, getColumn } = useAnnotationRows();
  const drawn = useAnnotationStatuses(settings.id);
  const details = useAnnotationDetails(settings.id);
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
  // Facet panels by the same ids the panels draw with, so a binding
  // follows its facet values rather than panel order.
  const facetOptions = useMemo(() => {
    const facet = settings.facet;
    if (!facet.enabled || !facet.rowVariable) return [];
    return groupFacetData(
      ids,
      getColumn(facet.rowVariable),
      facet.type === "grid" && facet.columnVariable
        ? getColumn(facet.columnVariable)
        : null
    ).map((group) => ({
      id: group.id,
      label: [group.rowValue, group.columnValue].filter(Boolean).join(" · "),
    }));
  }, [settings.facet, ids, getColumn]);

  const write = (next: ChartAnnotation[]) =>
    onSettingChange("annotations", next.length ? next : undefined);
  const add = (annotation: ChartAnnotation) =>
    write([...annotations, annotation]);
  // Saved records copy the rows the filters select now, by key.
  const selectionSize = visible.size;
  const selecting = selectionSize > 0 && selectionSize < ids.length;
  const canSave =
    context.records &&
    keyFields.length > 0 &&
    selecting &&
    selectionSize <= MAX_SAVED_RECORDS;
  const saveHelp = !context.records
    ? "This chart draws grouped values, not single records."
    : !keyFields.length
      ? "No field identifies every row once, so records can't be saved by key."
      : !selecting
        ? "Select rows first, by brushing or clicking marks in any chart. Saved records keep that membership after the selection changes."
        : selectionSize > MAX_SAVED_RECORDS
          ? `The selection has ${selectionSize.toLocaleString()} rows. Narrow it to ${MAX_SAVED_RECORDS} or fewer to save them.`
          : `Save the ${selectionSize.toLocaleString()} selected rows by key. Their membership stays fixed when filters change.`;
  const selectedRecords = () =>
    createRecordSet(keyFields[0]!, [...visible], getColumn);

  return (
    <div className="space-y-2.5" ref={rootRef}>
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
              : context.categoryField
                ? "Add a label on the category with the most rows. Change the category or text below."
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
              : "Add a fixed target line at a typical value. Change its axis and value below."
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
        {context.plane && (
          <Button
            size="sm"
            variant="outline"
            tooltip="Add a rectangle or ellipse in data units, which marks an area of the plot. Change its bounds below."
            onClick={() => add(createRegion(source))}
          >
            Region
          </Button>
        )}
        {context.records && (
          <Button
            size="sm"
            variant="outline"
            disabled={!canSave}
            tooltip={saveHelp}
            onClick={() => add(selectedRecords())}
          >
            Saved records
          </Button>
        )}
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
              detail={annotation.hidden ? undefined : details[annotation.id]}
              context={context}
              facetOptions={facetOptions}
              keyFields={keyFields}
              getColumn={getColumn}
              ids={ids}
              onChange={(next) =>
                write(
                  annotations.map((item) => (item.id === next.id ? next : item))
                )
              }
              onReplaceRecords={
                canSave && annotation.type === "record-set"
                  ? () =>
                      write(
                        annotations.map((item) =>
                          item.id === annotation.id
                            ? {
                                ...selectedRecords(),
                                id: item.id,
                                label: annotation.label,
                                name: annotation.name,
                              }
                            : item
                        )
                      )
                  : undefined
              }
              replaceHelp={saveHelp}
              onDuplicate={() =>
                write([
                  ...annotations.slice(0, index + 1),
                  duplicateAnnotation(annotation),
                  ...annotations.slice(index + 1),
                ])
              }
              onRemove={() => {
                focusAfterRemove.current = index;
                write(annotations.filter((item) => item.id !== annotation.id));
              }}
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
  detail,
  context,
  facetOptions,
  keyFields,
  getColumn,
  ids,
  onChange,
  onReplaceRecords,
  replaceHelp,
  onDuplicate,
  onRemove,
}: {
  annotation: ChartAnnotation;
  status: AnnotationStatus;
  /** What the drawn annotation read, such as an interval's rows and runs. */
  detail?: string;
  context: AnnotationContext;
  facetOptions: { id: string; label: string }[];
  keyFields: string[];
  getColumn: ColumnGetter;
  ids: IdType[];
  onChange: (next: ChartAnnotation) => void;
  onReplaceRecords?: () => void;
  replaceHelp: string;
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
      {detail && (
        <p className="text-[11px] text-muted-foreground" role="note">
          Drawn from {detail}.
        </p>
      )}
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
        {facetOptions.length > 0 && (
          <>
            <span className="eda-setting-label">Panel</span>
            <Select
              value={annotation.facet ?? EVERY_PANEL}
              onValueChange={(facet) =>
                onChange({
                  ...annotation,
                  facet: facet === EVERY_PANEL ? undefined : facet,
                })
              }
            >
              <ActionTooltip content="Draw it in every facet panel, or only in the panel for one set of facet values.">
                <SelectTrigger aria-label="Facet panel" className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
              </ActionTooltip>
              <SelectContent>
                <SelectItem value={EVERY_PANEL}>Every panel</SelectItem>
                {facetOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
                {annotation.facet &&
                  !facetOptions.some(
                    (option) => option.id === annotation.facet
                  ) && (
                    <SelectItem value={annotation.facet}>
                      A panel with no rows now
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </>
        )}
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
      ) : annotation.type === "region" ? (
        <RegionFields annotation={annotation} {...fieldProps} />
      ) : annotation.type === "record-set" ? (
        <RecordSetFields
          annotation={annotation}
          {...fieldProps}
          onReplace={onReplaceRecords}
          replaceHelp={replaceHelp}
        />
      ) : (
        <IntervalFields annotation={annotation} {...fieldProps} />
      )}
    </li>
  );
}
