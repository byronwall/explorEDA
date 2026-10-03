import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ticks as niceTicks } from "d3-array";
import { Focus } from "lucide-react";
import { ThreeDScatterChartProps } from "./types";

import { useDataLayer } from "@/providers/DataLayerProvider";
import { formatFieldValue as formatValue } from "@/lib/fieldSettings";
import { Button } from "@/components/ui/button";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ChartReadout } from "../ChartReadout";
import { ChartStatusLine, STATUS_HINT_MIN_WIDTH } from "../ChartStatusLine";
import { ThreeDScatterAxes, type CubeTicks } from "./ThreeDScatterAxes";
import { showBackFaces } from "./showBackFaces";
import { ThreeDScatterPoints } from "./ThreeDScatterPoints";
import {
  CUBE_HALF,
  toCube,
  useThreeDScatterData,
  type Domain,
} from "./useThreeDScatterData";
import { DEFAULT_3D_SCATTER_SETTINGS } from "./defaultSettings";

interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

type AxisKey = "x" | "y" | "z";
const AXES: AxisKey[] = ["x", "y", "z"];
const R = CUBE_HALF;

/** Resolves a CSS color, tokens included, to a hex string three.js reads. */
function cssColor(element: Element, value: string, fallback: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  element.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const context = document.createElement("canvas").getContext("2d");
  if (!context || !resolved) {
    return fallback;
  }
  context.fillStyle = resolved;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((part) => (part ?? 0).toString(16).padStart(2, "0")).join("")}`;
}

/** Bumps whenever the page switches between light and dark. */
function useThemeKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setKey((value) => value + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);
  return key;
}

interface AxisLabel {
  key: string;
  axis: AxisKey;
  /** Position along the axis inside the cube; null for the field title. */
  at: number | null;
  text: string;
}

export function ThreeDScatterChart({
  settings,
  width,
  height,
  facetIds,
}: ThreeDScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraStateRef = useRef<CameraState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const labelRefs = useRef(new Map<string, HTMLSpanElement>());
  const ringRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef<number | null>(null);

  const updateChart = useDataLayer((state) => state.updateChart);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const { points, omitted, domains } = useThreeDScatterData(settings, facetIds);
  const [nonce, setNonce] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const themeKey = useThemeKey();
  hoveredRef.current = hovered;

  const label = (field: string) =>
    getFieldLabel ? getFieldLabel(field) : field;
  const format = useCallback(
    (field: string, value: unknown, compact = false) =>
      formatValue(
        field,
        value as never,
        fieldSettings[field],
        compact ? { compact: true } : undefined
      ),
    [fieldSettings]
  );

  // Nice values on each axis; small charts get fewer.
  const tickCount = Math.min(width, height) < 320 ? 3 : 4;
  const tickValues = useMemo(() => {
    const result = {} as Record<AxisKey, number[]>;
    for (const axis of AXES) {
      const [min, max] = domains[axis] as Domain;
      result[axis] =
        max > min ? niceTicks(min, max, tickCount) : min === max ? [min] : [];
    }
    return result;
  }, [domains, tickCount]);
  const cubeTicks = useMemo(
    (): CubeTicks => ({
      x: tickValues.x.map((value) => toCube(value, domains.x)),
      y: tickValues.y.map((value) => toCube(value, domains.y)),
      z: tickValues.z.map((value) => toCube(value, domains.z)),
    }),
    [tickValues, domains]
  );
  const labels = useMemo((): AxisLabel[] => {
    const items: AxisLabel[] = [];
    for (const axis of AXES) {
      const field = settings[`${axis}Field`];
      tickValues[axis].forEach((value) =>
        items.push({
          key: `${axis}:${value}`,
          axis,
          at: toCube(value, domains[axis]),
          text: format(field, value, true),
        })
      );
      items.push({
        key: `${axis}:title`,
        axis,
        at: null,
        text: getFieldLabel ? getFieldLabel(field) : field,
      });
    }
    return items;
  }, [tickValues, domains, settings, format, getFieldLabel]);
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
  const pointsRef = useRef(points);
  pointsRef.current = points;

  const colors = useMemo(() => {
    const element = containerRef.current ?? document.documentElement;
    return {
      grid: cssColor(element, "var(--muted-foreground)", "#6b7280"),
      edge: cssColor(element, "var(--muted-foreground)", "#6b7280"),
    };
    // The theme key re-reads the tokens after a light or dark switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey, nonce]);

  /**
   * Places tick labels along the cube edges nearest the viewer and moves
   * the hover ring onto its point. Runs after every render of the scene.
   */
  const placeOverlay = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }
    const project = (vector: THREE.Vector3) => {
      const p = vector.clone().project(camera);
      return {
        x: ((p.x + 1) / 2) * width,
        y: ((1 - p.y) / 2) * height,
        behind: p.z > 1,
      };
    };
    const center = project(new THREE.Vector3(0, 0, 0));
    const toward = (axis: AxisKey) => Math.sign(camera.position[axis]) || 1;
    // The x and z labels sit on the floor's front edges; y on the vertical
    // edge furthest left on screen.
    const verticalEdges = [-1, 1].flatMap((sx) =>
      [-1, 1].map((sz) => ({ x: sx * R, z: sz * R }))
    );
    const yEdge = verticalEdges.reduce((best, edge) =>
      project(new THREE.Vector3(edge.x, 0, edge.z)).x <
      project(new THREE.Vector3(best.x, 0, best.z)).x
        ? edge
        : best
    );
    const anchor = (axis: AxisKey, at: number) => {
      if (axis === "x") {
        return new THREE.Vector3(at, -R, toward("z") * R);
      }
      if (axis === "z") {
        return new THREE.Vector3(toward("x") * R, -R, at);
      }
      return new THREE.Vector3(yEdge.x, at, yEdge.z);
    };
    for (const item of labelsRef.current) {
      const element = labelRefs.current.get(item.key);
      if (!element) {
        continue;
      }
      const screen = project(anchor(item.axis, item.at ?? 0));
      // Push each label away from the cube's center on screen.
      const dx = screen.x - center.x;
      const dy = screen.y - center.y;
      const length = Math.hypot(dx, dy) || 1;
      const offset = item.at === null ? 34 : 14;
      const x = screen.x + (dx / length) * offset;
      const y = screen.y + (dy / length) * offset;
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      element.style.visibility = screen.behind ? "hidden" : "visible";
    }
    const ring = ringRef.current;
    const point =
      hoveredRef.current !== null
        ? pointsRef.current[hoveredRef.current]
        : undefined;
    if (ring) {
      if (point) {
        const screen = project(new THREE.Vector3(point.x, point.y, point.z));
        ring.style.transform = `translate(${screen.x}px, ${screen.y}px) translate(-50%, -50%)`;
        ring.style.visibility = "visible";
      } else {
        ring.style.visibility = "hidden";
      }
    }
  }, [width, height]);

  const renderScene = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!renderer || !scene || !camera || !controls) {
      return;
    }

    controls.update();
    showBackFaces(scene, camera);
    renderer.render(scene, camera);
    placeOverlay();
  }, [placeOverlay]);
  const placeOverlayRef = useRef(placeOverlay);
  placeOverlayRef.current = placeOverlay;

  // Initialize Three.js scene
  useEffect(() => {
    const container = canvasHostRef.current;
    if (!container || width <= 0 || height <= 0) {
      return;
    }

    // The card shows through, so the scene follows the light or dark theme.
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.copy(settings.cameraPosition);
    camera.lookAt(settings.cameraTarget);
    // A tall chart narrows the view, so zoom out until the cube fits across.
    camera.zoom = Math.min(1, width / height);
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(settings.cameraTarget);
    controls.enableDamping = false;
    controlsRef.current = controls;
    controls.addEventListener("change", () => {
      if (!controls.object || !controls.target) {
        return;
      }
      cameraStateRef.current = {
        position: controls.object.position.clone(),
        target: controls.target.clone(),
      };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (cameraStateRef.current) {
          updateChart(settings.id, {
            cameraPosition: cameraStateRef.current.position,
            cameraTarget: cameraStateRef.current.target,
          });
        }
        timeoutRef.current = null;
      }, 1000);

      showBackFaces(scene, camera);
      renderer.render(scene, camera);
      placeOverlayRef.current();
    });

    renderer.render(scene, camera);

    setNonce((state) => state + 1);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      controls.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      container.innerHTML = "";
    };
    // Camera vectors are applied by the separate sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, settings.id, updateChart]);

  // Apply saved camera changes without rebuilding the scene.
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) {
      return;
    }

    camera.position.copy(settings.cameraPosition);
    controls.target.copy(settings.cameraTarget);
    camera.lookAt(settings.cameraTarget);
    camera.updateProjectionMatrix();
    renderScene();
  }, [settings.cameraPosition, settings.cameraTarget, renderScene]);

  // Labels and the hover ring move with every redraw.
  useEffect(() => {
    renderScene();
  }, [labels, hovered, renderScene]);

  const fitView = () => {
    const position = DEFAULT_3D_SCATTER_SETTINGS.cameraPosition.clone();
    const target = DEFAULT_3D_SCATTER_SETTINGS.cameraTarget.clone();
    updateChart(settings.id, {
      cameraPosition: position,
      cameraTarget: target,
    });
  };

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pickPoint = (clientX: number, clientY: number) => {
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const canvas = rendererRef.current?.domElement;
    if (!camera || !scene || !canvas) {
      return null;
    }
    const bounds = canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((clientX - bounds.left) / bounds.width) * 2 - 1,
      -((clientY - bounds.top) / bounds.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    // About six screen pixels around the pointer, at the cube's distance.
    const distance = camera.position.distanceTo(controlsRef.current!.target);
    const worldPerPixel =
      (2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) /
      (bounds.height * camera.zoom);
    raycaster.params.Points = { threshold: worldPerPixel * 6 };
    const cloud = scene.children.find(
      (child): child is THREE.Points => child instanceof THREE.Points
    );
    if (!cloud) {
      return null;
    }
    const hits = raycaster.intersectObject(cloud);
    if (!hits.length) {
      return null;
    }
    const nearest = hits.reduce((best, hit) =>
      (hit.distanceToRay ?? 0) < (best.distanceToRay ?? 0) ? hit : best
    );
    return nearest.index ?? null;
  };

  const hoveredPoint = hovered !== null ? points[hovered] : undefined;
  const showHints = width >= STATUS_HINT_MIN_WIDTH && !facetIds;
  const statusParts = [
    omitted > 0 &&
      `${omitted.toLocaleString()} rows without numbers for all three axes left out`,
    showHints && "Drag to turn, scroll to zoom, right-drag to pan",
  ];

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ width, height }}
      onPointerMove={(event) => {
        if (event.buttons) {
          return;
        }
        setHovered(pickPoint(event.clientX, event.clientY));
      }}
      onPointerLeave={() => setHovered(null)}
      onPointerDown={() => setHovered(null)}
    >
      <div ref={canvasHostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {labels.map((item) => (
          <span
            key={item.key}
            ref={(element) => {
              if (element) {
                labelRefs.current.set(item.key, element);
              } else {
                labelRefs.current.delete(item.key);
              }
            }}
            className={
              item.at === null
                ? "eda-3d-title absolute left-0 top-0 whitespace-nowrap"
                : "eda-3d-tick absolute left-0 top-0 whitespace-nowrap"
            }
            style={{ visibility: "hidden" }}
          >
            {item.text}
          </span>
        ))}
        <div
          ref={ringRef}
          className="eda-3d-ring"
          style={{ visibility: "hidden" }}
        />
      </div>
      {hoveredPoint && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          {(
            [
              [
                label(settings.xField),
                format(settings.xField, hoveredPoint.values.x),
              ],
              [
                label(settings.yField),
                format(settings.yField, hoveredPoint.values.y),
              ],
              [
                label(settings.zField),
                format(settings.zField, hoveredPoint.values.z),
              ],
              settings.colorField && [
                label(settings.colorField),
                format(settings.colorField, hoveredPoint.values.color),
              ],
              settings.sizeField && [
                label(settings.sizeField),
                format(settings.sizeField, hoveredPoint.values.size),
              ],
            ] as Array<false | undefined | "" | [string, string]>
          ).map(
            (item) =>
              item && (
                <span key={item[0]} className="eda-readout-item">
                  <span>{item[0]}</span>
                  <b>{item[1]}</b>
                </span>
              )
          )}
        </ChartReadout>
      )}
      {!facetIds && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 size-7 text-muted-foreground"
          aria-label="Fit view"
          tooltip="Turn the camera back to the starting view of the whole cube"
          onClick={fitView}
        >
          <Focus />
        </Button>
      )}
      {sceneRef.current && (
        <>
          <ThreeDScatterPoints
            scene={sceneRef.current}
            data={points}
            settings={settings}
            onSceneChange={renderScene}
            key={"points-" + nonce}
          />
          <ThreeDScatterAxes
            scene={sceneRef.current}
            ticks={cubeTicks}
            showGrid={settings.showGrid}
            showAxes={settings.showAxes}
            gridColor={colors.grid}
            edgeColor={colors.edge}
            onSceneChange={renderScene}
            key={"axes-" + nonce}
          />
        </>
      )}
      <ChartStatusLine parts={statusParts} left={8} right={8} />
    </div>
  );
}
