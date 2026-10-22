import type { FieldSummary } from "@/components/SummaryTable/components/FieldDistribution";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  type FieldProfile,
  missingCountLabel,
  missingRowCount,
} from "@/lib/fieldProfiles";

/** The short text reading beside a field's distribution. */
export function fieldReading(
  profile: FieldProfile,
  summary: FieldSummary | undefined
) {
  if (!summary) return profile.totalCount === 0 ? "No rows" : "No values";
  if (summary.label !== undefined) {
    return [summary.label, summary.stat].filter(Boolean).join(" ");
  }
  return summary.high !== undefined
    ? `${summary.low}–${summary.high}`
    : summary.low;
}

/**
 * The reading columns every field row shares: distinct count, missing count,
 * distribution, and range. The field list and the field picker both use
 * them, under the same column headings.
 */
export function FieldRowReadings({
  profile,
  label,
  summary,
  filtered = false,
  missingOnly = false,
  onMissingFilter,
}: {
  profile: FieldProfile;
  label: string;
  summary: FieldSummary | undefined;
  /** Marks the reading when the field has an active filter. */
  filtered?: boolean;
  /** True while the field's filter keeps only its missing rows. */
  missingOnly?: boolean;
  /** Makes the missing count a button that filters to those rows. */
  onMissingFilter?: () => void;
}) {
  const missingRows = missingRowCount(profile);
  const missingShare =
    profile.totalCount > 0 ? missingRows / profile.totalCount : 0;
  const missing = missingRows.toLocaleString();
  const caption = missingCountLabel(profile);
  return (
    <>
      <span className="eda-field-row-count">
        <span className="sr-only">Distinct values: </span>
        {profile.uniqueCount.toLocaleString()}
      </span>
      <span
        className="eda-field-row-count"
        data-missing-column=""
        data-missing={missingRows > 0 || undefined}
      >
        {missingRows === 0 ? (
          <>
            <span aria-hidden="true">–</span>
            <span className="sr-only">No missing values</span>
          </>
        ) : onMissingFilter ? (
          <ActionTooltip
            content={`${caption} (${
              missingShare < 0.01 ? "<1%" : `${Math.round(missingShare * 100)}%`
            }). ${missingOnly ? "Click to stop showing only these rows." : "Click to show only these rows."}`}
          >
            <button
              type="button"
              className="eda-summary-missing-filter"
              aria-pressed={missingOnly}
              aria-label={`${caption}. Show only rows missing ${label}`}
              onClick={onMissingFilter}
            >
              {missing}
            </button>
          </ActionTooltip>
        ) : (
          <>
            <span className="sr-only">Missing values: </span>
            {missing}
          </>
        )}
      </span>
      <span className="eda-field-row-spark">
        {summary && (
          <>
            {summary.graphic}
            <span className="sr-only">{summary.description}</span>
          </>
        )}
      </span>
      <span
        className="eda-field-row-reading"
        data-filtered={filtered ? "" : undefined}
      >
        {fieldReading(profile, summary)}
      </span>
    </>
  );
}
