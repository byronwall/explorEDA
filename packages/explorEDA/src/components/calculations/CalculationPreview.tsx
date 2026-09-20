import { useState } from "react";
import type {
  CalculationDefinition,
  CalculationManager,
} from "@/lib/calculations/CalculationState";
import type { DatumObject, HasId } from "@/providers/DataLayerProvider";
import { calculationValue } from "./calculationHelpers";
import { Button } from "@/components/ui/button";

type Props = {
  calculation: CalculationDefinition;
  manager: CalculationManager<DatumObject>;
  savedManager: CalculationManager<DatumObject>;
  data: (DatumObject & HasId)[];
  selectedRow: number;
  onSelectRow: (id: number) => void;
  changed: boolean;
};

export function CalculationPreview({
  calculation,
  manager,
  savedManager,
  data,
  selectedRow,
  onSelectRow,
  changed,
}: Props) {
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [page, setPage] = useState(() =>
    Math.max(
      0,
      Math.floor(data.findIndex((row) => row.__ID === selectedRow) / 5)
    )
  );
  const name = calculation.resultColumnName;
  const values = manager.executeCalculation(calculation);
  const errors = manager.getErrors(name);
  const dependencies = calculation.expression.dependencies;
  const definitions = manager.getCalculations();
  const saved = savedManager
    .getCalculations()
    .find((calc) => calc.resultColumnName === name);
  const before = saved ? savedManager.executeCalculation(saved) : null;
  const inputValues = dependencies.map((field) => {
    const calc = definitions.find((item) => item.resultColumnName === field);
    return calc ? manager.executeCalculation(calc) : null;
  });
  const rows = errorsOnly ? data.filter((row) => errors.has(row.__ID)) : data;
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(rows.length / 5) - 1)
  );
  const start = currentPage * 5;
  return (
    <section className="eda-calc-preview" aria-label="Calculation preview">
      <div className="eda-calc-section-heading">
        <h3>Inputs → result</h3>
        <span>{changed ? "Draft preview" : "Saved values"}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="eda-calc-help">
          All loaded rows, before chart filters. Select a row to follow its
          values through the chain.
        </p>
        {errors.size > 0 && (
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={errorsOnly}
              onChange={(event) => {
                setErrorsOnly(event.target.checked);
                setPage(0);
              }}
            />
            Failed rows only
          </label>
        )}
      </div>
      <div className="eda-calc-preview-scroll">
        <table>
          <thead>
            <tr>
              <th>Row</th>
              {dependencies.map((field) => (
                <th key={field}>
                  {definitions.some(
                    (calc) => calc.resultColumnName === field
                  ) && <span className="eda-calc-symbol mr-1">ƒx</span>}
                  {field}
                </th>
              ))}
              {changed && before && <th>Saved result</th>}
              <th>{changed ? "Draft result" : "Result"}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(start, start + 5).map((row) => (
              <tr key={row.__ID} data-selected={row.__ID === selectedRow}>
                <td>
                  <button
                    type="button"
                    aria-label={"Trace row " + (row.__ID + 1)}
                    aria-pressed={row.__ID === selectedRow}
                    onClick={() => onSelectRow(row.__ID)}
                  >
                    {row.__ID + 1}
                  </button>
                </td>
                {dependencies.map((field, index) => (
                  <td key={field}>
                    {calculationValue(
                      inputValues[index]
                        ? inputValues[index]!.get(row.__ID)
                        : row[field]
                    )}
                  </td>
                ))}
                {changed && before && (
                  <td className="text-muted-foreground">
                    {calculationValue(before.get(row.__ID))}
                  </td>
                )}
                <td className="font-semibold">
                  {errors.has(row.__ID)
                    ? "—"
                    : calculationValue(values.get(row.__ID))}
                </td>
                <td
                  className={
                    errors.has(row.__ID)
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {errors.get(row.__ID) ??
                    (values.get(row.__ID) == null ? "Missing value" : "Valid")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="p-4 text-sm text-muted-foreground">
            {errorsOnly ? "No failed rows." : "No loaded rows."}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 mt-2 text-xs text-muted-foreground">
        <span>
          {rows.length ? start + 1 : 0}–{Math.min(start + 5, rows.length)} of{" "}
          {rows.length.toLocaleString()} rows
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous rows
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={start + 5 >= rows.length}
            onClick={() => setPage(currentPage + 1)}
          >
            Next rows
          </Button>
        </div>
      </div>
    </section>
  );
}
