import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeDScatterSettings } from "./types";

interface Point3D {
  x: number;
  y: number;
  z: number;
  color?: number | string;
  size?: number;
}

interface ThreeDScatterPointsProps {
  scene: THREE.Scene;
  data: Point3D[];
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

    data.forEach((point, i) => {
      positions[i * 3] = point.x || 0;
      positions[i * 3 + 1] = point.y || 0;
      positions[i * 3 + 2] = point.z || 0;

      // Handle color from point data
      if (point.color) {
        if (typeof point.color === "string") {
          // Convert hex string to RGB
          const color = new THREE.Color(point.color);
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        } else {
          // Handle numeric color
          const color = new THREE.Color(point.color);
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
      } else {
        // Default color (white)
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geometry;
  }, [data]);

  // Create points material
  const pointsMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: settings.pointSize,
      vertexColors: true,
      transparent: true,
      opacity: settings.pointOpacity,
      sizeAttenuation: true,
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
