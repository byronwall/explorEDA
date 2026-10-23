import type { FieldProfile } from "@/lib/fieldProfiles";
import type { ChartType } from "@/types/ChartTypes";

export interface StartSuggestion {
  type: ChartType;
  /** The chart's main field. */
  field: string;
  /** The second field of a scatter plot. */
  yField?: string;
}

/** Text that names each row, such as an order ID, says little. */
function namesEachRow(profile: FieldProfile) {
  const present = profile.totalCount - profile.nullCount;
  return (
    profile.dataType === "categorical" &&
    present > 20 &&
    profile.uniqueCount >= present
  );
}

/**
 * Up to three first charts drawn from a dataset's own fields: counts by a
 * few-valued category, the spread of a measure, and a date's daily counts,
 * or two measures against each other when there is no date.
 */
export function startSuggestions(profiles: FieldProfile[]): StartSuggestion[] {
  const usable = profiles.filter(
    (profile) => profile.uniqueCount > 1 && !namesEachRow(profile)
  );
  const category = usable.find(
    (profile) =>
      (profile.dataType === "categorical" || profile.dataType === "boolean") &&
      profile.uniqueCount <= 20
  );
  const measures = usable.filter(
    (profile) => profile.dataType === "numeric" && profile.uniqueCount > 10
  );
  const date = usable.find((profile) => profile.dataType === "datetime");

  const suggestions: StartSuggestion[] = [];
  if (category) {
    suggestions.push({
      type: "row",
      field: category.name,
    });
  }
  const [first, second] = measures;
  if (first) {
    suggestions.push({
      type: "bar",
      field: first.name,
    });
  }
  if (date) {
    suggestions.push({
      type: "calendar",
      field: date.name,
    });
  } else if (first && second) {
    suggestions.push({
      type: "scatter",
      field: first.name,
      yField: second.name,
    });
  }
  return suggestions.slice(0, 3);
}
