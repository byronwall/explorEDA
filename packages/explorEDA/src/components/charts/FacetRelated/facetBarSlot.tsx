import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * The element at the right of the chart's legend line. Facet layouts put
 * their pager there so it shares the legend's row instead of taking its own.
 */
export const FacetBarSlotContext = createContext<HTMLElement | null>(null);

/** The legend line's facet slot, or null when facets draw their own row. */
export function useFacetBarSlot() {
  return useContext(FacetBarSlotContext);
}

/** Renders children in the legend line when it exists, otherwise in place. */
export function FacetBarPortal({ children }: { children: ReactNode }) {
  const slot = useFacetBarSlot();
  return slot ? createPortal(children, slot) : <>{children}</>;
}
