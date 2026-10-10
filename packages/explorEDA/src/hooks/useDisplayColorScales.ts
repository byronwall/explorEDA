import { useMemo } from "react";
import {
  useDataLayer,
  useOptionalDataLayer,
} from "@/providers/DataLayerProvider";
import { resolveThemeId } from "@/lib/themes";
import {
  resolveColorScale,
  themeColors,
  type ColorContext,
} from "@/lib/themePalettes";

/** The theme and light or dark mode charts draw their colors in. */
export function useColorContext(): ColorContext {
  // Chart parts drawn outside a workspace use Compact in light mode.
  const themeId = resolveThemeId(useOptionalDataLayer((state) => state.theme));
  const dark = useOptionalDataLayer((state) => state.darkMode ?? false);
  return useMemo(() => ({ themeId, dark }), [themeId, dark]);
}

/**
 * Color scales as charts draw them: palette colors follow the workspace theme
 * and dark mode, and hand-picked colors stay as saved.
 */
export function useDisplayColorScales() {
  const colorScales = useDataLayer((state) => state.colorScales);
  const context = useColorContext();
  return useMemo(
    () => colorScales.map((scale) => resolveColorScale(scale, context)),
    [colorScales, context]
  );
}

/** One color scale as charts draw it. */
export function useDisplayColorScale(id: string | undefined) {
  const scale = useDataLayer((state) =>
    id ? state.colorScales.find((item) => item.id === id) : undefined
  );
  const context = useColorContext();
  return useMemo(
    () => (scale ? resolveColorScale(scale, context) : undefined),
    [scale, context]
  );
}

/** Fallback category and mark colors for the workspace theme and mode. */
export function useThemeColors() {
  const context = useColorContext();
  return useMemo(() => themeColors(context), [context]);
}
