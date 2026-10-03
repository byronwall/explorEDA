import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Where a chart writes the values under the pointer. The chart panel offers
 * a slot in its header, so the reading never covers the plot.
 */
const ChartReadoutContext = createContext<HTMLElement | null>(null);

export const ChartReadoutProvider = ChartReadoutContext.Provider;

/**
 * One line of hovered values. It renders in the panel header when a panel
 * offers a slot, and otherwise in place, for charts used on their own.
 */
export function ChartReadout({
  children,
  fallbackClassName,
}: {
  children: ReactNode;
  fallbackClassName?: string;
}) {
  const target = useContext(ChartReadoutContext);
  if (target) return createPortal(children, target);
  return (
    <div className={fallbackClassName} role="status">
      {children}
    </div>
  );
}
