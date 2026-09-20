import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeDScatterPoint } from "./useThreeDScatterData";
import { ThreeDScatterSettings } from "./types";

interface ThreeDScatterPointsProps {
  scene: THREE.Scene;
  data: ThreeDScatterPoint[];
  settings: ThreeDScatterSettings;
  onSceneChange: () => void;
}

export function ThreeDScatterPoints({
  scene,
  data,
  settings,
  onSceneChange,
}: ThreeDScatterPointsProps) {
  const pointsRef = useRef<THREE.Points | null>(null);

  // Create points geometry
  const pointsGeometry = useMemo(() => {
    const positions = new Float32Array(data.length * 3);
    const colors = new Float32Array(data.length * 3);
    const sizes = new Float32Array(data.length);

    data.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      sizes[i] = point.size;

      // Handle color from point data
      const color = new THREE.Color(point.color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    return geometry;
  }, [data]);

  // Create points material
  const pointsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      uniforms: {
        pointSize: { value: settings.pointSize },
        opacity: { value: settings.pointOpacity },
      },
      vertexShader: `
        attribute float size;
        varying vec3 pointColor;
        uniform float pointSize;
        void main() {
          pointColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = pointSize * size * (300.0 / max(1.0, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 pointColor;
        uniform float opacity;
        void main() {
          if (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;
          gl_FragColor = vec4(pointColor, opacity);
        }
      `,
    });
  }, [settings.pointSize, settings.pointOpacity]);

  // Add points to scene
  useEffect(() => {
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    pointsRef.current = points;
    scene.add(points);
    const frame = requestAnimationFrame(() => onSceneChange());

    return () => {
      cancelAnimationFrame(frame);
      if (pointsRef.current) {
        scene.remove(pointsRef.current);
      }
      pointsGeometry.dispose();
      pointsMaterial.dispose();
    };
  }, [scene, pointsGeometry, pointsMaterial, onSceneChange]);

  return null;
}
