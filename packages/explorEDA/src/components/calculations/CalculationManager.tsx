import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useCalculationEditor } from "./CalculationEditor";
import { CalculatedFieldBadge } from "./CalculatedFieldBadge";
import { dependentCalculations } from "./calculationHelpers";

export function CalculationManager() {
  const calculations = useDataLayer((state) => state.calculations);
  const manager = useDataLayer((state) => state.calculationManager);
  const data = useDataLayer((state) => state.data);
  const removeCalculation = useDataLayer((state) => state.removeCalculation);
  const editor = useCalculationEditor();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const shown = calculations.filter((calc) =>
    (calc.resultColumnName + " " + calc.expression.rawInput)
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  return (
    <section className="eda-calculations">
      <header className="eda-calculations-header">
        <h2>
          Calculated fields
          {calculations.length > 0 && <span>{calculations.length}</span>}
        </h2>
        <Button size="sm" onClick={() => editor?.open()}>
          <Plus />
          New calculation
        </Button>
      </header>
      {error && (
        <p role="alert" className="eda-calc-error mb-3">
          {error}
        </p>
      )}
      {calculations.length ? (
        <>
          <div className="eda-calculations-toolbar">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-2 text-muted-foreground"
                size={16}
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                aria-label="Find a calculation"
                placeholder="Find a field or formula…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <span>
              {shown.length} calculations · {data.length.toLocaleString()}{" "}
              loaded rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="eda-calculation-list">
              <thead>
                <tr>
                  <th>Calculated field</th>
                  <th>Formula / inputs</th>
                  <th>Used by</th>
                  <th>Row checks</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((calc) => {
                  const name = calc.resultColumnName;
                  const errors = manager.getErrors(name);
                  return (
                    <tr key={name}>
                      <td data-label="Calculated field">
                        <div className="flex items-center gap-2">
                          <CalculatedFieldBadge field={name} />
                          <button
                            className="eda-calc-field-name"
                            type="button"
                            onClick={() => editor?.open(name)}
                          >
                            {name}
                          </button>
                        </div>
                      </td>
                      <td data-label="Formula / inputs">
                        <button
                          className="eda-calc-formula-link"
                          type="button"
                          onClick={() => editor?.open(name)}
                        >
                          <code>{calc.expression.rawInput}</code>
                        </button>
                        <div className="eda-calc-input-list">
                          {calc.expression.dependencies.length
                            ? calc.expression.dependencies.map((field) => (
                                <span key={field}>
                                  {calculations.some(
                                    (item) => item.resultColumnName === field
                                  ) ? (
                                    <button
                                      type="button"
                                      onClick={() => editor?.open(field)}
                                    >
                                      <span className="eda-calc-symbol">
                                        ƒx
                                      </span>{" "}
                                      {field}
                                    </button>
                                  ) : (
                                    field
                                  )}
                                </span>
                              ))
                            : "Constant value"}
                        </div>
                      </td>
                      <td data-label="Used by">
                        {dependentCalculations(calculations, name).length}{" "}
                        calculations
                      </td>
                      <td data-label="Row checks">
                        <button
                          type="button"
                          className={
                            errors.size
                              ? "eda-calc-text-button text-destructive"
                              : "eda-calc-text-button"
                          }
                          onClick={() => editor?.open(name)}
                        >
                          {errors.size
                            ? errors.size.toLocaleString() + " failed rows"
                            : "All rows valid"}
                        </button>
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={"Delete " + name}
                          tooltip="Delete calculation"
                          onClick={() => {
                            try {
                              removeCalculation(name);
                              setError("");
                            } catch (error) {
                              setError(
                                error instanceof Error
                                  ? error.message
                                  : String(error)
                              );
                            }
                          }}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!shown.length && (
              <p className="p-6 text-muted-foreground">
                No calculations match “{search}”.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="eda-calc-empty">
          <span className="eda-calc-symbol">ƒx</span>
          <div>
            <h3>Make a field from the data you have</h3>
            <p>
              Combine values, set a rule, or extract a date. Each formula stays
              connected to its inputs, and its result previews before you use it
              in a chart.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
