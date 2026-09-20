import type {
  CalculationDefinition,
  CalculationManager,
} from "@/lib/calculations/CalculationState";
import type { DatumObject, HasId } from "@/providers/DataLayerProvider";
import { calculationValue, dependentCalculations } from "./calculationHelpers";

type Props = {
  calculations: CalculationDefinition[];
  manager: CalculationManager<DatumObject>;
  row: DatumObject & HasId;
  root: string;
  selected: string;
  draftFields: string[];
  previewing: boolean;
  onSelect: (field: string) => void;
};

export function CalculationTrace({
  calculations,
  manager,
  row,
  root,
  selected,
  draftFields,
  previewing,
  onSelect,
}: Props) {
  const byName = new Map(
    calculations.map((calc) => [calc.resultColumnName, calc])
  );
  const dependents = dependentCalculations(calculations, selected);
  const node = (name: string, path: Set<string>): React.ReactNode => {
    if (path.has(name)) return null;
    const calc = byName.get(name);
    const value = calc
      ? manager.executeCalculation(calc).get(row.__ID)
      : row[name];
    const error = calc && manager.getErrors(name).get(row.__ID);
    const nextPath = new Set([...path, name]);
    return (
      <li key={name}>
        {calc ? (
          <button
            type="button"
            className="eda-calc-node"
            aria-pressed={name === selected}
            onClick={() => onSelect(name)}
            title={calc.expression.rawInput}
          >
            <span className="eda-calc-symbol" aria-hidden="true">
              ƒx
            </span>
            <span className="min-w-0 flex-1 break-words">
              {name}
              {draftFields.includes(name) && (
                <small className="block text-xs font-normal text-muted-foreground">
                  {name === selected && previewing
                    ? "Draft preview"
                    : "Draft kept"}
                </small>
              )}
            </span>
            <span
              className={error ? "text-destructive" : "eda-calc-node-value"}
              title={error || String(value ?? "Missing")}
            >
              {error ? "Error" : calculationValue(value)}
            </span>
          </button>
        ) : (
          <div className="eda-calc-source">
            <span className="min-w-0 flex-1 break-words">
              {name}
              <small>Source field</small>
            </span>
            <span
              className="eda-calc-node-value"
              title={String(value ?? "Missing")}
            >
              {calculationValue(value)}
            </span>
          </div>
        )}
        {calc && calc.expression.dependencies.length > 0 && (
          <ul>
            {calc.expression.dependencies.map((field) => node(field, nextPath))}
          </ul>
        )}
      </li>
    );
  };
  return (
    <div className="eda-calc-trace">
      <div className="eda-calc-section-heading">
        <h3>How this value is made</h3>
        <span>Row {row.__ID + 1}</span>
      </div>
      <p className="eda-calc-help">
        Follow the inputs below. Select a calculation to inspect or edit that
        step.
      </p>
      <ul className="eda-calc-tree" aria-label="Calculation dependency chain">
        {node(root, new Set())}
      </ul>
      {root !== selected && (
        <button
          className="eda-calc-text-button"
          type="button"
          onClick={() => onSelect(root)}
        >
          Return to {root}
        </button>
      )}
      <div className="eda-calc-section-heading mt-6">
        <h3>Used by</h3>
        <span>{dependents.length} calculations</span>
      </div>
      {dependents.length ? (
        <div className="eda-calc-link-list">
          {dependents.map((calc) => (
            <button
              type="button"
              key={calc.resultColumnName}
              onClick={() => onSelect(calc.resultColumnName)}
            >
              <span className="eda-calc-symbol">ƒx</span>
              {calc.resultColumnName}
            </button>
          ))}
        </div>
      ) : (
        <p className="eda-calc-help">No calculations depend on this field.</p>
      )}
    </div>
  );
}
