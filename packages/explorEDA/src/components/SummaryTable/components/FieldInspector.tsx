import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Settings2 } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  buildConversionPreview,
  getFieldSettingsError,
  type DatePreset,
  type FieldFormat,
  type FieldSettings,
} from "@/lib/fieldSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dataTypes = ["numeric", "categorical", "datetime", "boolean"] as const;
const formats = [
  "auto",
  "number",
  "currency",
  "percent",
  "date",
  "datetime",
] as const;

export function FieldInspector({
  field,
  open,
  onOpenChange,
}: {
  field: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
  const [showAllFailures, setShowAllFailures] = useState(false);

  useEffect(() => {
    if (open && field) {
      setDraft(fieldSettings[field] ?? {});
      setShowAllFailures(false);
    }
  }, [open, field, fieldSettings]);

  const applied = field ? (fieldSettings[field] ?? {}) : {};
  const isCalculated = Boolean(
    field &&
      calculations.some(
        (calculation) => calculation.resultColumnName === field
      )
  );
  const calculatedProfile = fieldProfiles.find(
    (profile) => profile.name === field
  );
  const preview = useMemo(() => {
    if (!field) return null;
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
    draft,
  ]);
  const settingsError = getFieldSettingsError(draft);
  const conversionChanged =
    !isCalculated &&
    (draft.type !== applied.type ||
      draft.datePreset !== applied.datePreset ||
      JSON.stringify(draft.nullTokens ?? []) !==
        JSON.stringify(applied.nullTokens ?? []));

  if (!field) {
    return null;
  }

  const update = (next: Partial<FieldSettings>) =>
    setDraft((current) => ({ ...current, ...next }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,90vh)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Inspect field: {getFieldLabel(field)}
          </DialogTitle>
          <DialogDescription>
            Canonical name <code>{field}</code>. Changes apply to this analysis.
          </DialogDescription>
          {isCalculated && (
            <p className="text-xs text-muted-foreground">
              This is a calculated field. Its formula controls the runtime
              type. Use the formula editor for type changes; this inspector
              controls display settings and previews calculated values.
            </p>
          )}
        </DialogHeader>

        {preview && (
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
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
            <p className="mt-2 text-muted-foreground">
              Automatic inference currently treats this field as{" "}
              <strong>{preview?.inferredType}</strong>. An override changes
              runtime values, filters, calculations, and chart positions.
            </p>
            {preview.failedCount > 0 && (
              <div className="mt-2 text-destructive">
                Invalid values become missing. Review the failed rows below.
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="field-label">Display label</Label>
            <Input
              id="field-label"
              value={draft.label ?? ""}
              placeholder={field}
              onChange={(event) => update({ label: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="field-description">Description</Label>
            <Input
              id="field-description"
              value={draft.description ?? ""}
              onChange={(event) => update({ description: event.target.value })}
            />
          </div>
          {!isCalculated && (
            <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="field-unit">Unit suffix</Label>
            <Input
              id="field-unit"
              value={draft.unit ?? ""}
              placeholder="kg, ms, USD"
              onChange={(event) => update({ unit: event.target.value })}
            />
          </div>
          {draft.format === "currency" && (
            <div className="space-y-2">
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
          {!isCalculated && draft.type === "datetime" && (
            <div className="space-y-2">
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
            <div className="space-y-2 sm:col-span-2">
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
        </div>

        {conversionChanged && (
          <div className="flex gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            Applying a type, date preset, or null-token change clears filters
            for this field.
          </div>
        )}

        {settingsError && (
          <p role="alert" className="text-sm text-destructive">
            {settingsError}
          </p>
        )}

        {preview && preview.examples.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Conversion preview</h3>
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
                    <tr key={example.row} className="border-b last:border-0">
                      <td className="p-2 tabular-nums">{example.row + 1}</td>
                      <td className="p-2 font-mono">{String(example.raw)}</td>
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
          <div className="space-y-2 text-sm">
            <h3 className="font-medium text-destructive">Failed rows</h3>
            <ul className="max-h-24 overflow-y-auto text-xs text-muted-foreground">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={Boolean(settingsError)}
            onClick={() => {
              updateFieldSettings(field, draft);
              onOpenChange(false);
            }}
          >
            Apply field settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
