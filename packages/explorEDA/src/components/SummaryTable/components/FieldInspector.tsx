import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, Settings2 } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { buildFieldDistribution } from "@/lib/fieldDistribution";
import { resolveFieldProfile } from "@/components/FieldMetadata";
import type { datum } from "@/types/ChartTypes";
import {
  buildConversionPreview,
  formatFieldValue,
  getFieldSettingsError,
  type DatePreset,
  type FieldFormat,
  type FieldSettings,
} from "@/lib/fieldSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionTooltip } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldValues } from "./FieldValues";

const dataTypes = ["numeric", "categorical", "datetime", "boolean"] as const;
const formats = [
  "auto",
  "number",
  "currency",
  "percent",
  "date",
  "datetime",
] as const;

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
};

export function FieldInspector({
  field,
  children,
  open,
  onOpenChange,
  anchor,
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
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  const charts = useDataLayer((state) => state.charts);
  const [draft, setDraft] = useState<FieldSettings>({});
  const [showAllFailures, setShowAllFailures] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = open ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;

  useEffect(() => {
    if (isOpen && field) {
      setDraft((fieldSettings ?? {})[field] ?? {});
      setShowAllFailures(false);
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
  const distribution = useMemo(() => {
    // liveItems changes whenever chart filters change the remaining rows.
    void liveItems;
    if (!isOpen || !field) {
      return null;
    }
    const profile = resolveFieldProfile(
      field,
      fieldProfiles ?? [],
      getColumnData
    );
    if (!profile) {
      return null;
    }
    // Chart filters scope the rows; with no charts every row is in scope.
    const filteredIds = charts.length
      ? new Set(crossfilterWrapper.getFilteredRowIds())
      : undefined;
    return buildFieldDistribution(
      getColumnData(field),
      profile.dataType,
      filteredIds
    );
  }, [
    isOpen,
    field,
    fieldProfiles,
    getColumnData,
    crossfilterWrapper,
    charts,
    liveItems,
  ]);
  const appliedFailures = useMemo(
    () =>
      isOpen && field && !isCalculated
        ? getFieldConversionPreview(field, applied).failedCount
        : 0,
    // Field settings identify the applied conversion for this field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, field, isCalculated, getFieldConversionPreview, fieldSettings]
  );
  const settingsError = getFieldSettingsError(draft);
  const conversionChanged =
    !isCalculated &&
    (draft.type !== applied.type ||
      draft.datePreset !== applied.datePreset ||
      JSON.stringify(draft.nullTokens ?? []) !==
        JSON.stringify(applied.nullTokens ?? []));

  if (!field) return null;
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
  const update = (next: Partial<FieldSettings>) =>
    setDraft((current) => ({ ...current, ...next }));

  return (
    <Popover open={isOpen} onOpenChange={setOpen} modal={false}>
      {anchor ? (
        <PopoverAnchor virtualRef={{ current: anchor }} />
      ) : (
        <ActionTooltip content={`Inspect ${getFieldLabel(field)}`}>
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
        aria-label={`Inspect field: ${getFieldLabel(field)}`}
        align="start"
        side="bottom"
        collisionPadding={12}
        onCloseAutoFocus={(event) => {
          if (anchor instanceof HTMLElement || anchor instanceof SVGElement) {
            event.preventDefault();
            anchor.focus({ preventScroll: true });
          }
        }}
        className="flex w-[min(760px,calc(100vw-24px))] max-h-[min(640px,var(--radix-popover-content-available-height))] flex-col overflow-hidden p-0"
      >
        <Tabs
          defaultValue="values"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-border px-3 pt-3 pb-2">
            <div className="min-w-0 space-y-0.5">
              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                <Settings2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Inspect field: {getFieldLabel(field)}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {field !== getFieldLabel(field) ? (
                  <>
                    Source name: <code>{field}</code>
                  </>
                ) : (
                  "Field settings for this analysis"
                )}
              </p>
            </div>
            <TabsList className="grid h-8 w-full grid-cols-4">
              <TabsTrigger value="values" className="text-xs">
                Values
              </TabsTrigger>
              <TabsTrigger value="display" className="text-xs">
                Display
              </TabsTrigger>
              <TabsTrigger value="type" className="text-xs">
                Type
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="eda-inspector-body min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <TabsContent value="values">
              {distribution ? (
                <FieldValues
                  distribution={distribution}
                  fieldLabel={getFieldLabel(field)}
                  format={formatDistributionValue}
                  failedCount={appliedFailures}
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  This field has no rows.
                </p>
              )}
            </TabsContent>
            <TabsContent value="display" className="max-w-[440px] space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="field-label">Display label</Label>
                <Input
                  id="field-label"
                  value={draft.label ?? ""}
                  placeholder={field}
                  onChange={(event) => update({ label: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="field-description">Description</Label>
                <Input
                  id="field-description"
                  value={draft.description ?? ""}
                  onChange={(event) =>
                    update({ description: event.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Display format</Label>
                  <Select
                    value={draft.format ?? "auto"}
                    onValueChange={(value) =>
                      update({ format: value as FieldFormat })
                    }
                  >
                    <SelectTrigger aria-label="Display format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="field-precision">Precision</Label>
                  <Input
                    id="field-precision"
                    type="number"
                    min={0}
                    max={20}
                    value={draft.precision ?? ""}
                    onChange={(event) =>
                      update({
                        precision:
                          event.target.value === ""
                            ? undefined
                            : Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="field-unit">Unit suffix</Label>
                  <Input
                    id="field-unit"
                    value={draft.unit ?? ""}
                    placeholder="kg, ms, USD"
                    onChange={(event) => update({ unit: event.target.value })}
                  />
                </div>
                {draft.format === "currency" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="field-currency">Currency code</Label>
                    <Input
                      id="field-currency"
                      value={draft.currency ?? "USD"}
                      maxLength={3}
                      onChange={(event) =>
                        update({ currency: event.target.value.toUpperCase() })
                      }
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="type" className="max-w-[440px] space-y-3">
              {preview && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 rounded bg-muted/50 px-2 py-2 text-xs">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      Inferred: <strong>{preview.inferredType}</strong>
                    </span>
                    <span>
                      Effective: <strong>{preview.effectiveType}</strong>
                    </span>
                    <span>{preview.validCount} valid</span>
                    <span>{preview.missingCount} missing</span>
                    <span>{preview.failedCount} failed</span>
                  </div>
                  {preview.failedCount > 0 && (
                    <div className="mt-2 text-destructive">
                      Invalid values become missing. The Preview tab lists each
                      failed row.
                    </div>
                  )}
                </div>
              )}
              {isCalculated && (
                <p className="text-xs text-muted-foreground">
                  This is a calculated field. Its formula controls the runtime
                  type. Use the formula editor for type changes; this inspector
                  controls display settings and previews calculated values.
                </p>
              )}
              {preview && (
                <>
                  {" "}
                  <p className="mt-2 text-muted-foreground">
                    Automatic inference currently treats this field as{" "}
                    <strong>{preview.inferredType}</strong>. An override changes
                    runtime values, filters, calculations, and chart positions.
                  </p>
                </>
              )}
              {!isCalculated && (
                <div className="space-y-1.5">
                  <Label>Type override</Label>
                  <Select
                    value={draft.type ?? "auto"}
                    onValueChange={(value) =>
                      update({
                        type:
                          value === "auto"
                            ? undefined
                            : (value as FieldSettings["type"]),
                      })
                    }
                  >
                    <SelectTrigger aria-label="Type override">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic</SelectItem>
                      {dataTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!isCalculated && draft.type === "datetime" && (
                <div className="space-y-1.5">
                  <Label>Date input preset</Label>
                  <Select
                    value={draft.datePreset ?? "iso"}
                    onValueChange={(value) =>
                      update({ datePreset: value as DatePreset })
                    }
                  >
                    <SelectTrigger aria-label="Date input preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso">ISO</SelectItem>
                      <SelectItem value="month-day-year">
                        Month / day / year
                      </SelectItem>
                      <SelectItem value="day-month-year">
                        Day / month / year
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!isCalculated && (
                <div className="space-y-1.5">
                  <Label htmlFor="field-null-tokens">Null tokens</Label>
                  <Input
                    id="field-null-tokens"
                    value={draft.nullTokens?.join(", ") ?? ""}
                    placeholder="NA, N/A, -"
                    onChange={(event) =>
                      update({
                        nullTokens: event.target.value
                          .split(",")
                          .map((token) => token.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              )}
              {conversionChanged && (
                <div className="flex gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  Applying a type, date preset, or null-token change clears
                  filters for this field.
                </div>
              )}
            </TabsContent>
            <TabsContent value="preview" className="max-w-[560px]">
              {preview && preview.examples.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-medium">Conversion preview</h3>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Row</th>
                          <th className="p-2">Raw</th>
                          <th className="p-2">Runtime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.examples.map((example) => (
                          <tr
                            key={example.row}
                            className="border-b last:border-0"
                          >
                            <td className="p-2 tabular-nums">
                              {example.row + 1}
                            </td>
                            <td className="p-2 font-mono">
                              {String(example.raw)}
                            </td>
                            <td className="p-2">
                              {String(example.value ?? "Missing")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {preview && preview.failures.length > 0 && (
                <div className="mt-4 space-y-1.5 text-xs">
                  <h3 className="font-medium text-destructive">Failed rows</h3>
                  <ul className="max-h-24 overflow-y-auto text-muted-foreground">
                    {(showAllFailures
                      ? preview.failures
                      : preview.failures.slice(0, 12)
                    ).map((failure) => (
                      <li key={failure.row}>
                        Row {failure.row + 1}: {String(failure.raw)} —{" "}
                        {failure.reason}
                      </li>
                    ))}
                  </ul>
                  {preview.failures.length > 12 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllFailures((current) => !current)}
                    >
                      {showAllFailures
                        ? "Show fewer failed rows"
                        : `Show all ${preview.failures.length} failed rows`}
                    </Button>
                  )}
                </div>
              )}
              {!preview?.examples.length && !preview?.failures.length && (
                <p className="text-xs text-muted-foreground">
                  No conversion issues or sample rows.
                </p>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
          {settingsError && (
            <p role="alert" className="mr-auto text-xs text-destructive">
              {settingsError}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={Boolean(settingsError)}
            onClick={() => {
              updateFieldSettings(field, draft);
              setOpen(false);
            }}
          >
            Apply field settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
