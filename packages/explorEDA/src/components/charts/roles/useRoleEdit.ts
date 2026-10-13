import { useCallback } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import type { ChartSettings } from "@/types/ChartTypes";
import { useChartEdit } from "../InPlace/useChartEdit";
import type { ChartRole } from "./chartRoles";

/**
 * Binds a field to one of a chart's roles. The change applies at once and
 * reaches the host as one change, so one undo restores the chart, including
 * any color scale the choice created.
 */
export function useRoleEdit(chartId: string) {
  const { begin, apply, commit } = useChartEdit(chartId);
  const { getOrCreateScaleForField } = useColorScales();

  const choose = useCallback(
    (role: ChartRole, field: string | undefined) => {
      begin();
      // Scale creation and binding share the hold, so the host sees both or
      // neither.
      const updates: Partial<ChartSettings> =
        role === "color"
          ? {
              colorField: field,
              colorScaleId: field ? getOrCreateScaleForField(field) : undefined,
            }
          : {};
      apply(updates);
      commit();
    },
    [apply, begin, commit, getOrCreateScaleForField]
  );

  return { choose };
}
