import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/** The part of the artboard in view: its top-left corner and a magnification. */
export interface ArtboardView {
  x: number;
  y: number;
  k: number;
}

export const FULL_VIEW: ArtboardView = { x: 0, y: 0, k: 1 };
export const MAX_ZOOM = 8;

/** Keeps a view inside the artboard, from the whole artboard to `MAX_ZOOM`. */
export function clampView(
  view: ArtboardView,
  width: number,
  height: number
): ArtboardView {
  const k = Math.min(MAX_ZOOM, Math.max(1, view.k));
  if (k === 1) return FULL_VIEW;
  const maxX = width - width / k;
  const maxY = height - height / k;
  return {
    k,
    x: Math.min(maxX, Math.max(0, view.x)),
    y: Math.min(maxY, Math.max(0, view.y)),
  };
}

/**
 * Magnifies a view by `factor` about a point given as fractions of the
 * viewport, so the artboard point under the pointer stays under it.
 */
export function zoomAbout(
  view: ArtboardView,
  factor: number,
  fx: number,
  fy: number,
  width: number,
  height: number
): ArtboardView {
  const k = Math.min(MAX_ZOOM, Math.max(1, view.k * factor));
  const pointX = view.x + (fx * width) / view.k;
  const pointY = view.y + (fy * height) / view.k;
  return clampView(
    { k, x: pointX - (fx * width) / k, y: pointY - (fy * height) / k },
    width,
    height
  );
}

/**
 * Zoom and pan for a drawn artboard: Ctrl- or Command-wheel and pinch zoom
 * about the pointer; once zoomed, the wheel and a drag on the artboard pan.
 * `scale` is the artboard's fitted size on screen, in pixels per unit.
 */
export function useArtboardZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  width: number,
  height: number,
  scale: number
) {
  const [view, setView] = useState<ArtboardView>(FULL_VIEW);
  const viewRef = useRef(view);
  viewRef.current = view;
  const pan = useRef<{ x: number; y: number; moved: boolean } | undefined>(
    undefined
  );
  // A drag that panned should not also count as a click.
  const panned = useRef(false);

  const zoom = useCallback(
    (factor: number, fx = 0.5, fy = 0.5) =>
      setView((current) => zoomAbout(current, factor, fx, fy, width, height)),
    [width, height]
  );
  const reset = useCallback(() => setView(FULL_VIEW), []);

  // A different artboard size starts from the whole artboard.
  useEffect(() => setView(FULL_VIEW), [width, height]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      const rect = svg.getBoundingClientRect();
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoom(
          Math.exp(-event.deltaY * 0.01),
          (event.clientX - rect.left) / rect.width,
          (event.clientY - rect.top) / rect.height
        );
        return;
      }
      if (viewRef.current.k === 1) return;
      event.preventDefault();
      const unit = scale * viewRef.current.k;
      setView((current) =>
        clampView(
          {
            ...current,
            x: current.x + event.deltaX / unit,
            y: current.y + event.deltaY / unit,
          },
          width,
          height
        )
      );
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [svgRef, zoom, scale, width, height]);

  /** Starts a pan when zoomed; returns whether it did. */
  const startPan = (event: React.PointerEvent) => {
    panned.current = false;
    if (viewRef.current.k === 1 || event.button !== 0) return false;
    pan.current = { x: event.clientX, y: event.clientY, moved: false };
    return true;
  };
  const movePan = (event: React.PointerEvent) => {
    const start = pan.current;
    if (!start) return false;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 3) return true;
    if (!start.moved)
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    start.moved = true;
    start.x = event.clientX;
    start.y = event.clientY;
    const unit = scale * viewRef.current.k;
    setView((current) =>
      clampView(
        { ...current, x: current.x - dx / unit, y: current.y - dy / unit },
        width,
        height
      )
    );
    return true;
  };
  const endPan = () => {
    panned.current = pan.current?.moved ?? false;
    pan.current = undefined;
  };

  return {
    view,
    zoom,
    reset,
    startPan,
    movePan,
    endPan,
    /** True right after a drag that panned, so its click is ignored. */
    didPan: () => panned.current,
  };
}
