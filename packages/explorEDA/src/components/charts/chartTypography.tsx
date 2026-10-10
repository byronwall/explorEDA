import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";
import { DEFAULT_AXIS_TYPOGRAPHY, type AxisTypography } from "./Axis/axisPlan";
import { clearTextMeasureCache, measureTextWidth } from "@/lib/textMeasure";

/** The theme's text sizes, as the workspace CSS resolves them. */
export interface ThemeTypography {
  headlineSize: number;
  headlineWeight: number;
  subtitleSize: number;
  tickSize: number;
  labelSize: number;
  fontFamily: string;
}

export const COMPACT_TYPOGRAPHY: ThemeTypography = {
  headlineSize: 14,
  headlineWeight: 600,
  subtitleSize: 11,
  tickSize: DEFAULT_AXIS_TYPOGRAPHY.tickSize,
  labelSize: DEFAULT_AXIS_TYPOGRAPHY.labelSize,
  fontFamily: "sans-serif",
};

/** Reads the theme tokens an element inherits. */
export function readThemeTypography(element: Element): ThemeTypography {
  const style = getComputedStyle(element);
  const number = (name: string, fallback: number) => {
    const value = parseFloat(style.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };
  return {
    headlineSize: number(
      "--eda-headline-size",
      COMPACT_TYPOGRAPHY.headlineSize
    ),
    headlineWeight: number(
      "--eda-headline-weight",
      COMPACT_TYPOGRAPHY.headlineWeight
    ),
    subtitleSize: number(
      "--eda-subtitle-size",
      COMPACT_TYPOGRAPHY.subtitleSize
    ),
    tickSize: number("--eda-axis-tick-size", COMPACT_TYPOGRAPHY.tickSize),
    labelSize: number("--eda-axis-label-size", COMPACT_TYPOGRAPHY.labelSize),
    fontFamily: style.fontFamily || COMPACT_TYPOGRAPHY.fontFamily,
  };
}

/** Bumps when web fonts finish loading, so measured layouts redo their sums. */
function useFontsLoaded() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    if (!fonts) return;
    let live = true;
    const bump = () => {
      if (!live) return;
      clearTextMeasureCache();
      setRevision((value) => value + 1);
    };
    void fonts.ready.then(bump);
    fonts.addEventListener?.("loadingdone", bump);
    return () => {
      live = false;
      fonts.removeEventListener?.("loadingdone", bump);
    };
  }, []);
  return revision;
}

/**
 * Tracks the theme typography an element inherits. `key` changes when the
 * theme does, so the tokens are read again.
 */
export function useThemeTypography(
  ref: RefObject<Element | null>,
  key: string
) {
  const fonts = useFontsLoaded();
  const [typography, setTypography] = useState(COMPACT_TYPOGRAPHY);
  // Before paint, so a theme switch never shows a frame at the old sizes.
  useLayoutEffect(() => {
    if (!ref.current) return;
    const next = readThemeTypography(ref.current);
    setTypography((current) =>
      JSON.stringify(current) === JSON.stringify(next) ? current : next
    );
  }, [ref, key, fonts]);
  return { typography, fonts };
}

export function toAxisTypography(
  typography: ThemeTypography,
  /** Changes when loaded fonts change widths. */
  _fonts = 0
): AxisTypography {
  void _fonts;
  return {
    tickSize: typography.tickSize,
    labelSize: typography.labelSize,
    measure: (text, size) =>
      measureTextWidth(text, size, typography.fontFamily),
  };
}

const AxisTypographyContext = createContext<AxisTypography>(
  DEFAULT_AXIS_TYPOGRAPHY
);

export const AxisTypographyProvider = AxisTypographyContext.Provider;

/** The axis typography of the chart's panel; compact outside a panel. */
export function useAxisTypography() {
  return useContext(AxisTypographyContext);
}
