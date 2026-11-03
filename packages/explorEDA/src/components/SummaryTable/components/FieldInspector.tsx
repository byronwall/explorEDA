import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Settings2, X } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFieldDistribution } from "@/hooks/useFieldDistribution";
import {
  resolveFieldProfile,
  typeIcons,
  typeLabels,
} from "@/components/FieldMetadata";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import type { datum } from "@/types/ChartTypes";
import {
  buildConversionPreview,
  formatFieldValue,
  getFieldSettingsError,
  sameConversion,
  type FieldSettings,
} from "@/lib/fieldSettings";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionTooltip } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldValues } from "./FieldValues";
import { FieldReadAs } from "./FieldReadAs";
import { FieldDisplaySettings } from "./FieldDisplaySettings";
import {
  ConversionReview,
  firstReviewFilter,
  type ReviewFilter,
} from "./ConversionReview";
import { bestNumberInput } from "./NumberInputChoice";

type Tab = "values" | "read" | "display";

/** The inspector's widest size; the popover also keeps 24 px of the viewport. */
const WIDTH = 760;
/** The popover's collision padding plus its gap from the anchor. */
const EDGE = 16;

/** Compare settings, treating blank text and unset values as the same. */
function sameSettings(left: FieldSettings, right: FieldSettings) {
  const clean = (settings: FieldSettings) =>
    Object.fromEntries(
      Object.entries(settings)
        .filter(
          ([key, value]) =>
            value !== undefined &&
            value !== "" &&
            !(key === "format" && value === "auto") &&
            !(Array.isArray(value) && value.length === 0)
        )
        .sort(([a], [b]) => a.localeCompare(b))
    );
  return JSON.stringify(clean(left)) === JSON.stringify(clean(right));
}

type Props = {
  field: string | null;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Opens beside this element instead of a trigger button, such as a chart's
   * axis label. Focus returns to it on close.
   */
  anchor?: Element | null;
  /** Which side of the trigger or anchor the inspector opens on. */
  side?: "top" | "right" | "bottom" | "left";
};

/**
 * A side with room for the inspector. Beside an anchor with too little room,
 * such as a field list row on a tablet, it opens below instead, so its title
 * and tabs never sit off screen.
 */
function sideWithRoom(
  side: NonNullable<Props["side"]>,
  anchor: Element | null | undefined
) {
  if (!anchor || (side !== "left" && side !== "right")) return side;
  const rect = anchor.getBoundingClientRect();
  const room = side === "left" ? rect.left : window.innerWidth - rect.right;
  return room >= Math.min(WIDTH, window.innerWidth - 24) + EDGE
    ? side
    : "bottom";
}

export function FieldInspector({
  field,
  children,
  open,
  onOpenChange,
  anchor,
  side = "bottom",
}: Props) {
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const updateFieldSettings = useDataLayer(
    (state) => state.updateFieldSettings
  );
  const getFieldConversionPreview = useDataLayer(
    (state) => state.getFieldConversionPreview
  );
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const calculations = useDataLayer((state) => state.calculations);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const [draft, setDraft] = useState<FieldSettings>({});
  const [tab, setTab] = useState<Tab>("values");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("failed");
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = open ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;

  useEffect(() => {
    if (isOpen && field) {
      setDraft((fieldSettings ?? {})[field] ?? {});
    }
  }, [isOpen, field, fieldSettings]);

  const applied = field ? ((fieldSettings ?? {})[field] ?? {}) : {};
  const isCalculated = Boolean(
    field &&
      (calculations ?? []).some(
        (calculation) => calculation.resultColumnName === field
      )
  );
  const calculatedProfile = (fieldProfiles ?? []).find(
    (profile) => profile.name === field
  );
  const preview = useMemo(() => {
    if (!isOpen || !field) return null;
    if (!isCalculated) return getFieldConversionPreview(field, draft);
    const values = getColumnData(field);
    const rows = Object.values(values).map((value) => ({ [field]: value }));
    return buildConversionPreview(
      field,
      rows,
      draft,
      calculatedProfile?.dataType ?? "categorical"
    );
  }, [
    field,
    getFieldConversionPreview,
    getColumnData,
    calculatedProfile?.dataType,
    isCalculated,
    isOpen,
    draft,
  ]);
  const distributionType = useMemo(
    () =>
      field
        ? resolveFieldProfile(field, fieldProfiles ?? [], getColumnData)
            ?.dataType
        : undefined,
    [field, fieldProfiles, getColumnData]
  );
  const distribution = useFieldDistribution(field, isOpen);
  const appliedFailures = useMemo(
    () =>
      isOpen && field && !isCalculated
        ? getFieldConversionPreview(field, applied).failedCount
        : 0,
    // Field settings identify the applied conversion for this field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, field, isCalculated, getFieldConversionPreview, fieldSettings]
  );

  // Open each field on its values, and its review on what needs a look.
  useEffect(() => {
    if (!isOpen || !field) return;
    setTab("values");
    setReviewFilter(
      firstReviewFilter(
        getFieldConversionPreview(field, (fieldSettings ?? {})[field])
      )
    );
    // Only a new field or a new opening resets the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, field]);

  const placement = useMemo(
    () => sideWithRoom(side, anchor),
    // Placement is decided when the inspector opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side, anchor, isOpen]
  );

  if (!field) return null;
  const settingsError = getFieldSettingsError(draft);
  const changed = !sameSettings(draft, applied);
  const typeName = typeLabels[distributionType ?? "categorical"];
  const TypeIcon = typeIcons[distributionType ?? "categorical"];
  const conversionChanged = !isCalculated && !sameConversion(draft, applied);
  const label = getFieldLabel(field);
  // Values tab previews the draft display settings before they are applied.
  const formatDistributionValue = (value: number) => {
    if (distribution?.kind !== "date") {
      return formatFieldValue(field, value as datum, draft);
    }
    if (draft.format === "date" || draft.format === "datetime") {
      return formatFieldValue(field, value, draft);
    }
    const range = distribution.range?.all;
    const iso = new Date(value).toISOString();
    return range && range.last - range.first < 3 * 24 * 60 * 60 * 1000
      ? `${iso.slice(0, 10)} ${iso.slice(11, 16)}`
      : iso.slice(0, 10);
  };
  const samples: Array<{ label: string; value: datum }> =
    distribution?.kind === "numeric" && distribution.summary
      ? [
          { label: "Minimum", value: distribution.summary.all.min },
          { label: "Median", value: distribution.summary.all.median },
          { label: "Maximum", value: distribution.summary.all.max },
        ]
      : distribution?.kind === "date" && distribution.range
        ? [
            {
              label: "First",
              value: new Date(distribution.range.all.first).toISOString(),
            },
            {
              label: "Last",
              value: new Date(distribution.range.all.last).toISOString(),
            },
          ]
        : [];
  const update = (next: Partial<FieldSettings>) =>
    setDraft((current) => ({ ...current, ...next }));
  const changeType = (type: DataType | undefined) => {
    const next: FieldSettings =
      type === "numeric"
        ? { ...draft, type }
        : {
            ...draft,
            type,
            // A number input only reads numeric fields.
            numberInput: undefined,
            percentInput: undefined,
            accountingInput: undefined,
            currencyInput: undefined,
          };
    // A field becoming numeric starts on the convention that reads the most
    // of its values, as a draft to review before Apply.
    if (type === "numeric" && draft.type !== "numeric" && !draft.numberInput) {
      const counts = getFieldConversionPreview(field, next).numberInputs;
      const best = counts && bestNumberInput(counts);
      if (best?.input && best.validCount > (counts?.[0]?.validCount ?? 0)) {
        next.numberInput = best.input;
      }
    }
    setDraft(next);
    setReviewFilter(firstReviewFilter(getFieldConversionPreview(field, next)));
  };
  const apply = () => {
    if (!changed || settingsError) return;
    updateFieldSettings(field, draft);
    setOpen(false);
  };
  const reviewFailed = () => {
    setTab("read");
    setReviewFilter("failed");
  };

  return (
    <Popover open={isOpen} onOpenChange={setOpen} modal={false}>
      {anchor ? (
        <PopoverAnchor virtualRef={{ current: anchor }} />
      ) : (
        <ActionTooltip content={`Inspect ${label}`}>
          <PopoverTrigger asChild>
            {children ?? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Inspect ${field}`}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            )}
          </PopoverTrigger>
        </ActionTooltip>
      )}
      <PopoverContent
        aria-label={`Inspect field: ${label}`}
        align="start"
        side={placement}
        collisionPadding={12}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            apply();
          }
        }}
        onOpenAutoFocus={(event) => {
          // Start on the active tab, not the close button and its tooltip.
          const active = (
            event.currentTarget as HTMLElement | null
          )?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
          if (active) {
            event.preventDefault();
            active.focus({ preventScroll: true });
          }
        }}
        onCloseAutoFocus={(event) => {
          if (anchor instanceof HTMLElement || anchor instanceof SVGElement) {
            event.preventDefault();
            anchor.focus({ preventScroll: true });
          }
        }}
        className="eda-inspector flex w-[min(760px,calc(100vw-24px))] max-h-[min(640px,var(--radix-popover-content-available-height))] flex-col overflow-hidden p-0"
      >
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="space-y-2 border-b border-border px-3 pt-2.5 pb-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                aria-hidden="true"
              >
                <TypeIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base leading-tight font-semibold">
                  <span className="sr-only">Inspect field: </span>
                  {label}
                </h2>
                {settingsError ? (
                  <p role="alert" className="truncate text-xs text-destructive">
                    {settingsError}
                  </p>
                ) : (
                  <p className="flex min-w-0 items-center gap-x-1.5 text-xs text-muted-foreground">
                    <span className="shrink-0">
                      {isCalculated
                        ? `Calculated ${typeName.toLowerCase()}`
                        : typeName}
                    </span>
                    {field !== label && (
                      <span className="min-w-0 truncate">
                        · <code>{field}</code>
                      </span>
                    )}
                    {appliedFailures > 0 && (
                      <span className="shrink-0">
                        ·{" "}
                        <button
                          type="button"
                          className="text-destructive underline-offset-2 hover:underline"
                          onClick={reviewFailed}
                        >
                          {appliedFailures.toLocaleString()} failed
                        </button>
                      </span>
                    )}
                    {applied.description && (
                      <span className="min-w-0 truncate">
                        · {applied.description}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!changed}
                  onClick={() => setDraft(applied)}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  // Neutral until there is something to apply.
                  variant={changed ? "default" : "outline"}
                  disabled={!changed || Boolean(settingsError)}
                  tooltip="Apply field settings (⌘Enter)"
                  aria-label="Apply field settings"
                  onClick={apply}
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-1.5"
                  aria-label="Close inspector"
                  tooltip="Close inspector"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </Button>
              </div>
            </div>
            <TabsList className="h-8">
              <TabsTrigger value="values" className="px-3 text-xs">
                Values
              </TabsTrigger>
              {!isCalculated && (
                <TabsTrigger value="read" className="px-3 text-xs">
                  Read as
                </TabsTrigger>
              )}
              <TabsTrigger value="display" className="px-3 text-xs">
                Display
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="eda-inspector-body min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <TabsContent value="values">
              {distribution ? (
                <FieldValues
                  distribution={distribution}
                  fieldLabel={label}
                  format={formatDistributionValue}
                  failedCount={appliedFailures}
                  onReviewFailed={isCalculated ? undefined : reviewFailed}
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  This field has no rows.
                </p>
              )}
            </TabsContent>
            {!isCalculated && preview && (
              <TabsContent
                value="read"
                className="grid gap-4 min-[680px]:grid-cols-[minmax(0,370px)_minmax(0,1fr)]"
              >
                <FieldReadAs
                  draft={draft}
                  inferredType={preview.inferredType}
                  preview={preview}
                  conversionChanged={conversionChanged}
                  onTypeChange={changeType}
                  onChange={update}
                />
                <div className="flex max-h-80 min-h-0 flex-col min-[680px]:h-[420px] min-[680px]:max-h-none">
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      {preview.totalCount.toLocaleString()}
                    </span>{" "}
                    rows:{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {preview.validCount.toLocaleString()}
                    </span>{" "}
                    read ·{" "}
                    <span className="tabular-nums">
                      {preview.missingCount.toLocaleString()}
                    </span>{" "}
                    missing ·{" "}
                    <span
                      className={
                        preview.failedCount > 0
                          ? "text-destructive tabular-nums"
                          : "tabular-nums"
                      }
                    >
                      {preview.failedCount.toLocaleString()}
                    </span>{" "}
                    failed
                  </p>
                  <ConversionReview
                    preview={preview}
                    filter={reviewFilter}
                    onFilterChange={setReviewFilter}
                  />
                </div>
              </TabsContent>
            )}
            <TabsContent value="display" className="max-w-[480px]">
              <FieldDisplaySettings
                field={field}
                draft={draft}
                type={
                  draft.type ??
                  preview?.effectiveType ??
                  distributionType ??
                  "categorical"
                }
                samples={samples}
                onChange={update}
              />
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
