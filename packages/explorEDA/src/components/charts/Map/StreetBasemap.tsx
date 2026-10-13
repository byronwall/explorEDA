import { useEffect, useRef } from "react";
import type { MapSettings, MapView } from "./definition";
import { wrapLongitude } from "./mapGeometry";
import type {
  StreetMapConstructor,
  StreetMapEngine,
  StreetMapInstance,
} from "./mapEngine";
import { STREET_MAX_ZOOM, streetZoom, viewZoom } from "./streetCamera";

interface StreetBasemapProps {
  engine: StreetMapEngine;
  view: MapView;
  projection: MapSettings["projection"];
  width: number;
  height: number;
  dark: boolean;
  /** Every camera frame while the user pans or zooms. */
  onMove: (view: MapView) => void;
  /** The camera after a user gesture ends. */
  onMoveEnd: (view: MapView) => void;
  /** A click on the basemap that was not a drag. */
  onBackgroundClick: (altKey: boolean) => void;
  /** The style could not load, or the browser cannot draw the map. */
  onFailure: () => void;
}

/**
 * MapLibre draws streets and owns pan and zoom. The chart's marks stay in
 * the SVG above it, projected to match this camera.
 */
export function StreetBasemap(props: StreetBasemapProps) {
  const { engine, view, projection, width, height, dark } = props;
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<StreetMapInstance | undefined>(undefined);
  const latest = useRef(props);
  latest.current = props;
  const style = dark ? engine.styles.dark : engine.styles.light;
  const styleRef = useRef(style);

  useEffect(() => {
    if (!container.current) return;
    const current = latest.current;
    const toView = (instance: StreetMapInstance): MapView => {
      const { projection, width, height } = latest.current;
      const center = instance.getCenter();
      return {
        center: [wrapLongitude(center.lng), center.lat],
        zoom: viewZoom(instance.getZoom(), projection, width, height),
      };
    };
    let instance: StreetMapInstance;
    try {
      const StreetMap = engine.maplibre.Map as unknown as StreetMapConstructor;
      instance = new StreetMap({
        container: container.current,
        style: styleRef.current,
        center: current.view.center,
        zoom: streetZoom(
          current.view,
          current.projection,
          current.width,
          current.height
        ),
        maxZoom: STREET_MAX_ZOOM,
        attributionControl: { compact: true },
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
        fadeDuration: 0,
        // Keeps the canvas readable for image export (MapLibre 5+, then 4).
        canvasContextAttributes: { preserveDrawingBuffer: true },
        preserveDrawingBuffer: true,
      });
    } catch {
      current.onFailure();
      return;
    }
    map.current = instance;
    instance.touchZoomRotate?.disableRotation();
    // Arrow keys move between points, so the basemap takes no keys.
    instance.keyboard?.disable();
    let loaded = false;
    const element = container.current;
    instance.on("load", () => {
      loaded = true;
      // Narrow charts keep the credits behind their info button.
      if (latest.current.width < 640)
        element
          .querySelector(".maplibregl-ctrl-attrib")
          ?.classList.remove("maplibregl-compact-show");
    });
    instance.on("error", () => {
      // A missing tile after load is harmless; a style that never loads is not.
      if (!loaded) latest.current.onFailure();
    });
    instance.on("move", () => latest.current.onMove(toView(instance)));
    instance.on("moveend", (event) => {
      if (event.originalEvent) latest.current.onMoveEnd(toView(instance));
    });
    instance.on("click", (event) =>
      latest.current.onBackgroundClick(Boolean(event.originalEvent?.altKey))
    );
    return () => {
      map.current = undefined;
      instance.remove();
    };
  }, [engine]);

  useEffect(() => {
    if (styleRef.current === style) return;
    styleRef.current = style;
    map.current?.setStyle(style);
  }, [style]);

  useEffect(() => {
    map.current?.resize();
  }, [width, height]);

  // Saved views, toolbar buttons, and fits move the camera from outside.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const zoom = streetZoom(view, projection, width, height);
    const center = instance.getCenter();
    if (
      Math.abs(instance.getZoom() - zoom) > 1e-6 ||
      Math.abs(wrapLongitude(center.lng - view.center[0])) > 1e-7 ||
      Math.abs(center.lat - view.center[1]) > 1e-7
    )
      instance.jumpTo({ center: view.center, zoom });
  }, [view, projection, width, height]);

  return (
    <div
      ref={container}
      className="overflow-hidden rounded"
      // MapLibre's stylesheet sets position: relative on this element.
      style={{ position: "absolute", inset: 0 }}
      data-street-basemap=""
    />
  );
}
