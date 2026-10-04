import { useRef, useState } from "react";
import type { SVGProps } from "react";
import type { MapSettings, MapView } from "./definition";
import { mapProjection, WORLD_VIEW, wrapLongitude } from "./mapGeometry";

export function useMapPan(
  settings: MapSettings,
  width: number,
  height: number,
  saveView: (view: MapView) => void
) {
  const [draftView, setDraftView] = useState<MapView>();
  const drag = useRef<
    { x: number; y: number; view: MapView; next?: MapView } | undefined
  >(undefined);
  const suppressClick = useRef(false);
  const events: SVGProps<SVGSVGElement> = {
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      suppressClick.current = false;
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        view: settings.view ?? WORLD_VIEW,
      };
    },
    onPointerMove: (event) => {
      const start = drag.current;
      if (!start) return;
      const dx = event.clientX - start.x,
        dy = event.clientY - start.y;
      if (!start.next && Math.hypot(dx, dy) < 4) return;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      const center = mapProjection(
        settings.projection,
        start.view,
        width,
        height
      ).invert!([width / 2 - dx, height / 2 - dy]);
      if (!center?.every(Number.isFinite)) return;
      start.next = {
        ...start.view,
        center: [
          wrapLongitude(center[0]),
          Math.max(-90, Math.min(90, center[1])),
        ],
      };
      setDraftView(start.next);
    },
    onPointerUp: (event) => {
      if (drag.current?.next) saveView(drag.current.next);
      drag.current = undefined;
      setDraftView(undefined);
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => {
      drag.current = undefined;
      setDraftView(undefined);
    },
  };
  return { draftView, events, suppressClick };
}
