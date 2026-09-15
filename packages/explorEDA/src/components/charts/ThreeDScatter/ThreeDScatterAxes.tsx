import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeDScatterSettings } from "./types";

interface ThreeDScatterAxesProps {
  scene: THREE.Scene;
  settings: ThreeDScatterSettings;
  onSceneChange: () => void;
}

export function ThreeDScatterAxes({
  scene,
  settings,
  onSceneChange,
}: ThreeDScatterAxesProps) {
  // Create axes helper
  const axesHelper = useMemo(() => {
    return new THREE.AxesHelper(10);
  }, []);

  // Create grid helper
  const gridHelpers = useMemo(() => {
    const size = 10;
    const divisions = 10;

    return {
      xy: new THREE.GridHelper(size, divisions),
      xz: new THREE.GridHelper(size, divisions),
      yz: new THREE.GridHelper(size, divisions),
    };
  }, []);

  // Setup grid positions and rotations
  useEffect(() => {
    if (settings.showGrid) {
      // XY plane (blue)
      gridHelpers.xy.rotation.x = Math.PI / 2;
      scene.add(gridHelpers.xy);

      // XZ plane (red)
      gridHelpers.xz.position.y = 0;
      scene.add(gridHelpers.xz);

      // YZ plane (green)
      gridHelpers.yz.rotation.z = Math.PI / 2;
      scene.add(gridHelpers.yz);
    }

    if (settings.showAxes) {
      scene.add(axesHelper);
    }

    const frame = requestAnimationFrame(() => onSceneChange());

    return () => {
      cancelAnimationFrame(frame);
      scene.remove(gridHelpers.xy);
      scene.remove(gridHelpers.xz);
      scene.remove(gridHelpers.yz);
      scene.remove(axesHelper);

      gridHelpers.xy.dispose();
      gridHelpers.xz.dispose();
      gridHelpers.yz.dispose();
      axesHelper.dispose();
    };
  }, [
    scene,
    settings.showGrid,
    settings.showAxes,
    gridHelpers,
    axesHelper,
    onSceneChange,
  ]);

  return null;
}
