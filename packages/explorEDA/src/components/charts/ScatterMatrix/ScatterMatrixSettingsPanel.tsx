import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useMemo } from "react";
import {
  MAX_MATRIX_FIELDS,
  MIN_MATRIX_FIELDS,
  type ScatterMatrixSettings,
} from "./definition";

/** Moves one item to a new index, keeping the rest in order. */
export function moveField(fields: string[], from: number, to: number) {
  if (to < 0 || to >= fields.length || from === to) return fields;
  const next = [...fields];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function ScatterMatrixSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterMatrixSettings>) {
  const getColumnNames = useDataLayer((s) => s.getColumnNames);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const calculations = useDataLayer((s) => s.calculations);
  const allFields = useMemo(() => {
    void calculations;
    return getColumnNames();
  }, [calculations, getColumnNames]);
  const used = new Set(settings.fields);

  const change = (next: Partial<ScatterMatrixSettings>) =>
    onSettingsChange({ ...settings, ...next });
  const setFields = (fields: string[]) => {
    const keep = new Set([...fields, "__ID"]);
    // A removed field takes its selection with it.
    change({
      fields,
      filters: settings.filters.filter((filter) => keep.has(filter.field)),
    });
  };

  return (
    <div className="space-y-2.5">
      <section className="space-y-2" aria-labelledby="matrix-fields-heading">
        <div className="flex items-baseline justify-between">
          <h5 id="matrix-fields-heading" className="text-sm font-medium">
            Fields, in order
          </h5>
          <span className="text-xs text-muted-foreground">
            {settings.fields.length} of {MAX_MATRIX_FIELDS}
          </span>
        </div>
        <ol className="space-y-1.5">
          {settings.fields.map((field, index) => {
            const label = getFieldLabel(field);
            return (
              <li
                key={`${field}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <FieldSelector
                    label=""
                    placeholder={`Field ${index + 1}`}
                    value={field}
                    fields={allFields.filter(
                      (item) => item === field || !used.has(item)
                    )}
                    onChange={(next) =>
                      setFields(
                        settings.fields.map((item, position) =>
                          position === index ? next : item
                        )
                      )
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} earlier`}
                  tooltip="Move this field one place earlier: left in the columns and up in the rows."
                  disabled={index === 0}
                  onClick={() =>
                    setFields(moveField(settings.fields, index, index - 1))
                  }
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} later`}
                  tooltip="Move this field one place later: right in the columns and down in the rows."
                  disabled={index === settings.fields.length - 1}
                  onClick={() =>
                    setFields(moveField(settings.fields, index, index + 1))
                  }
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove ${label}`}
                  tooltip="Remove this field and its selection."
                  disabled={settings.fields.length <= MIN_MATRIX_FIELDS}
                  onClick={() =>
                    setFields(
                      settings.fields.filter(
                        (_, position) => position !== index
                      )
                    )
                  }
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ol>
        {settings.fields.length < MAX_MATRIX_FIELDS && (
          <FieldSelector
            label=""
            placeholder="Add a field"
            value=""
            fields={allFields.filter((field) => !used.has(field))}
            onChange={(field) =>
              field && setFields([...settings.fields, field])
            }
          />
        )}
      </section>
    </div>
  );
}
