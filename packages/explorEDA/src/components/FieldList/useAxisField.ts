import { toast } from "sonner";
import { resolveFieldProfile } from "@/components/FieldMetadata";
import { getChartTitle } from "@/components/charts/chartAccessibility";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  axisRefusal,
  axisUpdate,
  hasFiniteNumber,
  type AxisTarget,
  type FieldFacts,
} from "./fieldAxis";

/** The field's type and whether it holds finite numbers, for axis checks. */
export function useFieldFacts() {
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  return (field: string): FieldFacts | undefined => {
    const profile = resolveFieldProfile(field, fieldProfiles, getColumnData);
    if (!profile) return undefined;
    return {
      field,
      label: getFieldLabel(field),
      dataType: profile.dataType,
      hasNumbers:
        profile.dataType === "numeric" && hasFiniteNumber(getColumnData(field)),
    };
  };
}

/** Applies a field to an axis, or explains why it cannot. */
export function useApplyAxisField() {
  const updateChart = useDataLayer((state) => state.updateChart);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  return (target: AxisTarget, facts: FieldFacts) => {
    const refusal = axisRefusal(target, facts);
    const title = getChartTitle(target.chart, getFieldLabel);
    if (refusal) {
      toast.error(`${facts.label} was not placed on ${title}`, {
        description: refusal,
      });
      return false;
    }
    updateChart(target.chart.id, axisUpdate(target, facts.field));
    toast(`${facts.label} is now the ${target.axis} axis of ${title}`);
    return true;
  };
}
