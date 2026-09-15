import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeDScatterChartProps } from "./types";

import { useDataLayer } from "@/providers/DataLayerProvider";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ThreeDScatterAxes } from "./ThreeDScatterAxes";
import { ThreeDScatterPoints } from "./ThreeDScatterPoints";
import { useThreeDScatterData } from "./useThreeDScatterData";

interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export function ThreeDScatterChart({
  settings,
  width,
  height,
  facetIds,
}: ThreeDScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraStateRef = useRef<CameraState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateChart = useDataLayer((state) => state.updateChart);
  const data = useThreeDScatterData(settings, facetIds);
  const [nonce, setNonce] = useState(0);
  const renderScene = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!renderer || !scene || !camera || !controls) {
      return;
    }

    controls.update();
    renderer.render(scene, camera);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container || width <= 0 || height <= 0) {
      return;
    }

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.copy(settings.cameraPosition);
    camera.lookAt(settings.cameraTarget);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
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

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (cameraStateRef.current) {
          updateChart(settings.id, {
            cameraPosition: cameraStateRef.current.position,
            cameraTarget: cameraStateRef.current.target,
          });
        }
        timeoutRef.current = null;
      }, 1000);

      renderer.render(scene, camera);
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Force initial render
    renderer.render(scene, camera);

    setNonce((state) => state + 1);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (controls) {
        controls.dispose();
      }
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
      container.innerHTML = "";
    };
    // Camera vectors are applied by the separate sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, settings.id, updateChart]);

  // Apply saved camera changes without rebuilding the scene.
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    if (!camera || !controls || !renderer || !scene) {
      return;
    }

    camera.position.copy(settings.cameraPosition);
    controls.target.copy(settings.cameraTarget);
    camera.lookAt(settings.cameraTarget);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }, [settings.cameraPosition, settings.cameraTarget]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (
        !rendererRef.current ||
        !cameraRef.current ||
        !sceneRef.current ||
        width <= 0 ||
        height <= 0
      ) {
        return;
      }

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      // Force render on resize
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  return (
    <div ref={containerRef} style={{ width, height }}>
      {sceneRef.current && (
        <>
          <ThreeDScatterPoints
            scene={sceneRef.current}
            data={data}
            settings={settings}
            onSceneChange={renderScene}
            key={"points-" + nonce}
          />
          <ThreeDScatterAxes
            scene={sceneRef.current}
            settings={settings}
            onSceneChange={renderScene}
            key={"axes-" + nonce}
          />
        </>
      )}
    </div>
  );
}
