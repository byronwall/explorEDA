import { useDataLayer } from "@/providers/DataLayerProvider";
import { useEffect, type RefObject } from "react";

/**
 * Charts color their palettes for the surface they sit on. Hosts mark dark
 * mode with a `dark` class on the page or an ancestor of the chart, so this
 * watches those ancestors and tells the data layer.
 */
export function useHostDarkMode(ref: RefObject<Element | null>) {
  const setDarkMode = useDataLayer((state) => state.setDarkMode);
  useEffect(() => {
    let dark: boolean | undefined;
    const update = () => {
      const next =
        Boolean(ref.current?.closest(".dark")) ||
        document.documentElement.classList.contains("dark");
      if (next !== dark) setDarkMode((dark = next));
    };
    update();
    if (typeof MutationObserver === "undefined") return;
    // Only the chart's ancestors can switch it, so only they are watched.
    const observer = new MutationObserver(update);
    for (
      let element: Element | null =
        ref.current?.parentElement ?? document.documentElement;
      element;
      element = element.parentElement
    ) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    return () => observer.disconnect();
  }, [ref, setDarkMode]);
}
