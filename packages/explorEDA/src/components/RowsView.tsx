import { useMemo, useRef, useState, useLayoutEffect } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { DataTable } from "./charts/DataTable/DataTable";
import {
  dataTableDefinition,
  DataTableSettings,
} from "./charts/DataTable/definition";

export function RowsView({
  width,
  active,
  toolbarTarget,
}: {
  width: number;
  active: boolean;
  toolbarTarget: HTMLElement | null;
}) {
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.liveItems);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const [settings, setSettings] = useState<DataTableSettings>(() => ({
    ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 12, h: 6 }),
    title: "Data rows",
    columns: getColumnNames()
      .filter((field) => field !== "__ID")
      .map((field) => ({ id: field, field })),
  }));
  const rows = useMemo(() => {
    const ids = new Set(crossfilter.getFilteredRowIds());
    return data.filter((row) => ids.has(row.__ID));
  }, [data, crossfilter, liveItems]);
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(600);
  useLayoutEffect(() => {
    if (!active || !ref.current) return;
    const measure = () =>
      setHeight(
        Math.max(
          280,
          window.innerHeight -
            (ref.current?.getBoundingClientRect().top ?? 180) -
            16
        )
      );
    measure();
    // Radix removes the previous tab after the first layout pass.
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(ref.current.parentElement!.parentElement!);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active]);
  return (
    <div
      ref={ref}
      className="eda-rows-view overflow-hidden rounded-md border bg-card"
    >
      <DataTable
        settings={settings}
        toolbarTarget={toolbarTarget}
        rows={rows}
        width={width - 2}
        height={height}
        onSettingsChange={(next) =>
          setSettings((current) => ({ ...current, ...next }))
        }
      />
    </div>
  );
}
