import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FieldMetadata } from "@/components/FieldMetadata";
import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { summarizeField } from "@/components/SummaryTable/components/FieldDistribution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFilteredFieldProfiles } from "@/hooks/useFilteredFieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import { matchesField } from "./FieldList";
import { FieldRowReadings } from "./FieldRowReadings";

/**
 * Picks a set of fields from the same rows the field list shows: type, name,
 * distinct and missing counts, and each field's distribution. Values describe
 * the rows that pass the chart filters.
 */
export function FieldPicker({
  heading,
  selected,
  onChange,
}: {
  heading: string;
  /** Selected field names, in their display order. */
  selected: string[];
  onChange: (fields: string[]) => void;
}) {
  const profiles = useFilteredFieldProfiles();
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatValue = useDataLayer((state) => state.formatFieldValue);
  const [query, setQuery] = useState("");
  const chosen = useMemo(() => new Set(selected), [selected]);
  const shown = profiles.filter((profile) =>
    matchesField(query, profile.name, getFieldLabel(profile.name))
  );
  const all = profiles.map((profile) => profile.name);

  return (
    <div className="eda-field-picker">
      <div className="eda-field-picker-head">
        <h3>{heading}</h3>
        <span className="eda-field-list-count" aria-live="polite">
          {chosen.size.toLocaleString()} of {profiles.length.toLocaleString()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={all.every((field) => chosen.has(field))}
          onClick={() =>
            // Keep the current order, then add the rest in source order.
            onChange([
              ...selected,
              ...all.filter((field) => !chosen.has(field)),
            ])
          }
        >
          Show all
        </Button>
      </div>
      <label className="eda-field-list-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Find fields</span>
        <Input
          type="search"
          value={query}
          placeholder="Find a field"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {shown.length === 0 ? (
        <p className="eda-field-list-empty">
          No fields match “{query.trim()}”.
        </p>
      ) : (
        <>
          <div className="eda-field-list-columns" aria-hidden="true">
            <span>Field</span>
            <span className="eda-field-row-count">Distinct</span>
            <span className="eda-field-row-count" data-missing-column="">
              Missing
            </span>
            <span className="eda-field-row-spark">Values</span>
          </div>
          <ul className="eda-field-list-rows" aria-label={heading}>
            {shown.map((profile) => {
              const label = getFieldLabel(profile.name);
              const checked = chosen.has(profile.name);
              return (
                <li key={profile.name} className="eda-field-row">
                  <label className="eda-field-row-line eda-field-pick">
                    <input
                      type="checkbox"
                      checked={checked}
                      // The last field stays, so the table never goes empty.
                      disabled={checked && chosen.size === 1}
                      aria-label={label}
                      onChange={(event) =>
                        onChange(
                          event.target.checked
                            ? [...selected, profile.name]
                            : selected.filter((field) => field !== profile.name)
                        )
                      }
                    />
                    <FieldMetadata
                      profile={profile}
                      label={label}
                      compact
                      showDetail={false}
                      showTooltip={false}
                      className="eda-field-pick-name"
                    />
                    <CalculatedFieldBadge field={profile.name} side="left" />
                    <FieldRowReadings
                      profile={profile}
                      label={label}
                      summary={summarizeField(
                        profile,
                        (value) => formatValue(profile.name, value as datum),
                        label
                      )}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
