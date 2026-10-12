import { useSyncExternalStore } from "react";

/** The parts of a MapLibre GL map that street views use. */
export interface StreetMapInstance {
  on(type: string, listener: (event: StreetMapEvent) => void): unknown;
  remove(): void;
  resize(): void;
  jumpTo(camera: { center: [number, number]; zoom: number }): unknown;
  getCenter(): { lng: number; lat: number };
  getZoom(): number;
  setStyle(style: string): unknown;
  touchZoomRotate?: { disableRotation(): void };
  keyboard?: { disable(): void };
}
export interface StreetMapEvent {
  originalEvent?: { altKey?: boolean };
  error?: unknown;
}
/**
 * The `maplibre-gl` module, or any object with a compatible `Map` class.
 * Typed loosely so every MapLibre release's own types fit.
 */
export interface MapLibreModule {
  Map: new (...args: never[]) => unknown;
}
export type StreetMapConstructor = new (
  options: Record<string, unknown>
) => StreetMapInstance;
export interface StreetMapStyles {
  /** Style URL for light mode. */
  light: string;
  /** Style URL for dark mode. */
  dark: string;
}
export interface StreetMapOptions {
  /** Basemap styles. Defaults to OpenFreeMap's Positron and Dark styles. */
  styles?: StreetMapStyles;
}
export interface StreetMapEngine {
  maplibre: MapLibreModule;
  styles: StreetMapStyles;
}

/** Free OpenFreeMap vector styles: no key, and attribution comes with them. */
export const OPENFREEMAP_STYLES: StreetMapStyles = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

let engine: StreetMapEngine | undefined;
const listeners = new Set<() => void>();

/**
 * Turns on street maps. Point maps zoomed in past continent scale draw a
 * street basemap beneath their points. Pass the `maplibre-gl` module and
 * import `maplibre-gl/dist/maplibre-gl.css` once in the host app.
 */
export function registerMapLibre(
  maplibre: MapLibreModule,
  options: StreetMapOptions = {}
) {
  engine = { maplibre, styles: options.styles ?? OPENFREEMAP_STYLES };
  listeners.forEach((listener) => listener());
  return () => {
    if (engine?.maplibre !== maplibre) return;
    engine = undefined;
    listeners.forEach((listener) => listener());
  };
}

export function useStreetMapEngine() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => engine,
    () => undefined
  );
}
