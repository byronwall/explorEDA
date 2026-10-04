import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CUBE_HALF } from "./useThreeDScatterData";

type AxisKey = "x" | "y" | "z";

export interface CubeTicks {
  x: number[];
  y: number[];
  z: number[];
}

interface ThreeDScatterAxesProps {
  scene: THREE.Scene;
  /** Tick positions inside the cube, per axis. */
  ticks: CubeTicks;
  showGrid: boolean;
  showAxes: boolean;
  gridColor: string;
  edgeColor: string;
  onSceneChange: () => void;
}

const R = CUBE_HALF;
const AXES: AxisKey[] = ["x", "y", "z"];

function point(axis: AxisKey, value: number, a: number, b: number) {
  // `a` and `b` fill the two other axes in x, y, z order.
  if (axis === "x") {
    return new THREE.Vector3(value, a, b);
  }
  if (axis === "y") {
    return new THREE.Vector3(a, value, b);
  }
  return new THREE.Vector3(a, b, value);
}

/**
 * Grid lines for one face of the cube, at each tick of the two axes that lie
 * in that face.
 */
function faceGrid(axis: AxisKey, side: number, ticks: CubeTicks) {
  const [u, v] = AXES.filter((item) => item !== axis) as [AxisKey, AxisKey];
  const at = (uValue: number, vValue: number) => {
    const position = { x: 0, y: 0, z: 0 };
    position[axis] = side * R;
    position[u] = uValue;
    position[v] = vValue;
    return new THREE.Vector3(position.x, position.y, position.z);
  };
  const points: THREE.Vector3[] = [];
  for (const tick of ticks[u]) {
    points.push(at(tick, -R), at(tick, R));
  }
  for (const tick of ticks[v]) {
    points.push(at(-R, tick), at(R, tick));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function cubeEdges() {
  const points: THREE.Vector3[] = [];
  for (const axis of AXES) {
    for (const a of [-R, R]) {
      for (const b of [-R, R]) {
        points.push(point(axis, -R, a, b), point(axis, R, a, b));
      }
    }
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

export function ThreeDScatterAxes({
  scene,
  ticks,
  showGrid,
  showAxes,
  gridColor,
  edgeColor,
  onSceneChange,
}: ThreeDScatterAxesProps) {
  const group = useMemo(() => {
    const frame = new THREE.Group();
    if (showGrid) {
      const material = new THREE.LineBasicMaterial({
        color: gridColor,
        transparent: true,
        opacity: 0.3,
      });
      for (const axis of AXES) {
        for (const side of [-1, 1]) {
          const lines = new THREE.LineSegments(
            faceGrid(axis, side, ticks),
            material
          );
          lines.userData.face = { axis, side };
          frame.add(lines);
        }
      }
    }
    if (showAxes) {
      frame.add(
        new THREE.LineSegments(
          cubeEdges(),
          new THREE.LineBasicMaterial({ color: edgeColor })
        )
      );
    }
    return frame;
  }, [ticks, showGrid, showAxes, gridColor, edgeColor]);

  useEffect(() => {
    scene.add(group);
    const frame = requestAnimationFrame(() => onSceneChange());
    return () => {
      cancelAnimationFrame(frame);
      scene.remove(group);
      group.traverse((object) => {
        if (object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
    };
  }, [scene, group, onSceneChange]);

  return null;
}
