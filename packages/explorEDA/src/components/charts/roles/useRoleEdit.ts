import { useCallback, useRef } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayerSnapshot } from "@/providers/DataLayerProvider";
import { useChartEdit } from "../InPlace/useChartEdit";
import type { ChartRole } from "./chartRoles";

/**
 * Binds fields to one of a chart's roles. `preview` shows a field without
 * reporting it; `choose` keeps the last field and reports the whole session
 * as one change; `cancel` puts the chart back. Color scales created for
 * fields that were only previewed are removed before the host hears
 * anything, so one undo restores the chart and its scales.
 */
export function useRoleEdit(chartId: string) {
  const { begin, apply, commit, cancel: restore } = useChartEdit(chartId);
  const { getOrCreateScaleForField, removeColorScale } = useColorScales();
  const getState = useDataLayerSnapshot();
  const session = useRef<{
    field?: string;
    scaleId?: string;
    created: Set<string>;
  } | null>(null);

  const bind = useCallback(
    (role: ChartRole, field: string | undefined) => {
      if (role !== "color") return undefined;
      if (!session.current) {
        const chart = getState().charts.find((item) => item.id === chartId);
        session.current = {
          field: chart?.colorField || undefined,
          scaleId: chart?.colorScaleId,
          created: new Set(),
        };
      }
      const current = session.current;
      begin();
      let scaleId: string | undefined;
      if (field && field === current.field) {
        scaleId = current.scaleId;
      } else if (field) {
        const before = new Set(getState().colorScales.map((scale) => scale.id));
        scaleId = getOrCreateScaleForField(field);
        if (!before.has(scaleId)) current.created.add(scaleId);
      }
      apply({ colorField: field, colorScaleId: scaleId });
      return scaleId;
    },
    [apply, begin, chartId, getOrCreateScaleForField, getState]
  );

  /** Removes scales this session made, except the one the chart keeps. */
  const dropCreated = useCallback(
    (keep?: string) => {
      for (const id of session.current?.created ?? []) {
        if (id !== keep) removeColorScale(id);
      }
      session.current = null;
    },
    [removeColorScale]
  );

  const preview = useCallback(
    (role: ChartRole, field: string | undefined) => {
      bind(role, field);
    },
    [bind]
  );

  const choose = useCallback(
    (role: ChartRole, field: string | undefined) => {
      // Scale creation and binding share the hold, so the host sees both or
      // neither.
      dropCreated(bind(role, field));
      commit();
    },
    [bind, commit, dropCreated]
  );

  const cancel = useCallback(() => {
    if (!session.current) return;
    dropCreated();
    restore();
  }, [dropCreated, restore]);

  return { preview, choose, cancel };
}
