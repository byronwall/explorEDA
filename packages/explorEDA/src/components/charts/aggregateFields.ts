import { useMemo } from "react";
import type { AggregateAggregation } from "@/lib/aggregates";
import { finiteNumber } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";

/** The default name of a grouped summary, such as "Sum of Revenue by Region". */
export function getAggregateName(
  aggregation: AggregateAggregation,
  groupField: string,
  measureField?: string,
  entityField?: string
) {
  if (aggregation === "count") {
    return `Count${entityField ? ` distinct ${entityField}` : ""} by ${groupField}`;
  }
  return `${aggregation === "sum" ? "Sum" : "Average"} of ${measureField ?? ""}${entityField ? ` once per ${entityField}` : ""} by ${groupField}`;
}

/** Every field and numeric calculation that a sum or average can measure. */
export function useMeasureFields(current?: string) {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const calculations = useDataLayer((state) => state.calculations);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const fieldNames = useMemo(() => {
    void calculations;
    return getColumnNames();
  }, [getColumnNames, calculations]);
  const measureFields = useMemo(() => {
    const numeric = fieldNames.filter((field) =>
      fieldProfiles.some(
        (profile) => profile.name === field && profile.dataType === "numeric"
      )
    );
    calculations.forEach((calculation) => {
      const values = Object.values(getColumnData(calculation.resultColumnName));
      if (values.some((value) => finiteNumber(value) !== undefined)) {
        numeric.push(calculation.resultColumnName);
      }
    });
    if (current && !numeric.includes(current)) {
      numeric.unshift(current);
    }
    return numeric;
  }, [current, calculations, fieldNames, fieldProfiles, getColumnData]);
  return { fieldNames, measureFields };
}
