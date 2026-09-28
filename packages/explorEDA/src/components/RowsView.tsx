import { useMemo } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { DataTable } from "./charts/DataTable/DataTable";
import {
  dataTableDefinition,
  DataTableSettings,
} from "./charts/DataTable/definition";

export function RowsView({
  width,
  height,
  toolbarTarget,
}: {
  width: number;
  height: number;
  toolbarTarget: HTMLElement | null;
}) {
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.liveItems);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const rowsSettings = useDataLayer((state) => state.rowsSettings);
  const updateRowsSettings = useDataLayer((state) => state.updateRowsSettings);
  const settings = useMemo<DataTableSettings>(
    () => ({
      ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 12, h: 6 }),
      ...rowsSettings,
      title: "Data rows",
    }),
    [rowsSettings]
  );
  const rows = useMemo(() => {
    const ids = new Set(crossfilter.getFilteredRowIds());
    return data.filter((row) => ids.has(row.__ID));
  }, [data, crossfilter, liveItems]);
  return (
    <div className="eda-rows-view overflow-hidden">
      <DataTable
        settings={settings}
        toolbarTarget={toolbarTarget}
        rows={rows}
        width={width}
        height={height}
        onSettingsChange={(next) => updateRowsSettings(next)}
      />
    </div>
  );
}
