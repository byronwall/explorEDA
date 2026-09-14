import { useGetColumnData } from "@/components/charts/useGetColumnData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalculationDefinition } from "@/lib/calculations/CalculationState";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo } from "react";

interface CalculationPreviewProps {
  calculation: CalculationDefinition;

  previewRows?: number;
}

export function CalculationPreview({
  calculation,
  previewRows = 10,
}: CalculationPreviewProps) {
  const rawData = useGetColumnData(calculation.resultColumnName);

  // Prepare the preview data
  const previewData = useMemo(() => {
    return Object.entries(rawData).map(([id, result]) => ({
      __ID: id,
      [calculation.resultColumnName]: result,
    }));
  }, [rawData, calculation.resultColumnName]);

  const totalRows = useDataLayer((state) => state.data.length);

  return (
    <div className="space-y-4">
      <p>Expression: {calculation.expression.rawInput}</p>

      <div>
        <h4 className="text-sm font-medium mb-2">Preview Data</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.slice(0, previewRows).map((row) => (
                <TableRow key={row.__ID}>
                  <TableCell>{row.__ID}</TableCell>
                  <TableCell>{row[calculation.resultColumnName]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalRows > previewRows && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {previewRows} of {totalRows} rows
          </p>
        )}
      </div>
    </div>
  );
}
