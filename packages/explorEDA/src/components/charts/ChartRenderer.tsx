import { useChartDefinition } from "@/charts/registry";
import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChartRendererProps {
  settings: ChartSettings;
  width: number;
  height: number;
  facetIds?: IdType[];
  toolbarTarget?: HTMLElement | null;
}

export function ChartRenderer({
  settings,
  width,
  height,
  facetIds,
  toolbarTarget,
}: ChartRendererProps) {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const definition = useChartDefinition(settings.type);
  const ChartComponent = definition.component;
  const columnNames = getColumnNames();

  const missingFields =
    settings.type === "pivot"
      ? [
          ...settings.rowFields,
          settings.columnField,
          ...settings.valueFields.map((valueField) => valueField.field),
        ].filter(
          (field, index, fields) =>
            field &&
            !columnNames.includes(field) &&
            fields.indexOf(field) === index
        )
      : [];

  if (missingFields.length > 0) {
    return (
      <Alert className="m-4" role="alert">
        <AlertTitle>Pivot table needs updated fields</AlertTitle>
        <AlertDescription>
          The current data does not include: {missingFields.join(", ")}. Update
          this chart&apos;s settings or load data with these fields.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ChartComponent
      settings={settings}
      width={width}
      height={height}
      facetIds={facetIds}
      toolbarTarget={toolbarTarget}
    />
  );
}
