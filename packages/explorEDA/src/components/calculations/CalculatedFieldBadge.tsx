import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCalculationEditor } from "./CalculationEditor";
import { calculationValue, dependentCalculations } from "./calculationHelpers";

export function CalculatedFieldBadge({
  field,
  showName = false,
  rowId = 0,
  children,
}: {
  field: string;
  showName?: boolean;
  rowId?: number;
  children?: ReactNode;
}) {
  const calculations = useDataLayer((state) => state.calculations) ?? [];
  const manager = useDataLayer((state) => state.calculationManager);
  const data = useDataLayer((state) => state.data);
  const editor = useCalculationEditor();
  const calc = calculations.find((item) => item.resultColumnName === field);
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);
  const restoreFocus = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancelTimer = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!calc || !editor) return <>{children}</>;
  const leave = () => {
    cancelTimer();
    if (!pinned.current) timer.current = setTimeout(() => setOpen(false), 180);
  };
  const errors = open ? manager.getErrors(field) : new Map<number, string>();
  const value = open ? manager.executeCalculation(calc).get(rowId) : undefined;
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) pinned.current = false;
      }}
    >
      <PopoverTrigger asChild>
        <button
          ref={trigger}
          type="button"
          className={
            children !== undefined ? "eda-calc-cell" : "eda-calc-badge"
          }
          aria-label={
            "Inspect " +
            field +
            " calculation" +
            (children !== undefined ? ", row " + (rowId + 1) : "")
          }
          onPointerEnter={(event) => {
            if (event.pointerType === "touch" || event.buttons) return;
            cancelTimer();
            timer.current = setTimeout(() => setOpen(true), 250);
          }}
          onPointerLeave={leave}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            cancelTimer();
            pinned.current = true;
            restoreFocus.current = true;
            setOpen(true);
          }}
        >
          {children !== undefined ? (
            children
          ) : (
            <>
              <span className="eda-calc-symbol" aria-hidden="true">
                ƒx
              </span>
              {showName && <span>{field}</span>}
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="eda-calc-peek"
        align="start"
        collisionPadding={12}
        onPointerEnter={cancelTimer}
        onPointerLeave={leave}
        onOpenAutoFocus={(event) => {
          if (!pinned.current) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (restoreFocus.current) trigger.current?.focus();
          restoreFocus.current = false;
        }}
      >
        <div className="eda-calc-section-heading">
          <strong>{field}</strong>
          <span>Calculated field</span>
        </div>
        <pre>{calc.expression.rawInput}</pre>
        <p className="eda-calc-help">
          Uses{" "}
          {calc.expression.dependencies.length
            ? calc.expression.dependencies.join(", ")
            : "constant values"}
          .
        </p>
        <div className="eda-calc-peek-result">
          <span>Row {rowId + 1}</span>
          <strong title={errors.get(rowId)}>
            {errors.get(rowId) ?? calculationValue(value)}
          </strong>
        </div>
        <p className="eda-calc-help">
          {errors.size
            ? errors.size.toLocaleString() +
              " of " +
              data.length.toLocaleString() +
              " rows failed"
            : "All " + data.length.toLocaleString() + " rows valid"}{" "}
          · {dependentCalculations(calculations, field).length} dependent
          calculations
        </p>
        <Button
          type="button"
          className="mt-4 w-full"
          onClick={() => {
            setOpen(false);
            pinned.current = false;
            restoreFocus.current = false;
            editor.open(field, rowId, trigger.current);
          }}
        >
          Inspect chain & edit
        </Button>
      </PopoverContent>
    </Popover>
  );
}
