import { createContext, useCallback, useContext } from "react";
import { simulateColor, type VisionMode } from "@/lib/colorPalettes";

const VisionContext = createContext<VisionMode>("normal");

export const VisionProvider = VisionContext.Provider;

/**
 * Converts a color, or every color inside a CSS gradient, to how the reader
 * picked in the editor's vision preview would see it.
 */
export function useSimulate() {
  const mode = useContext(VisionContext);
  return useCallback(
    (color: string) =>
      mode === "normal"
        ? color
        : color.replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi, (match) =>
            simulateColor(match, mode)
          ),
    [mode]
  );
}

export function useVisionMode() {
  return useContext(VisionContext);
}
