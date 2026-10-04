import type * as THREE from "three";

type AxisKey = "x" | "y" | "z";

/**
 * Shows only the cube faces behind the data, like a room the points sit in.
 * Call before each render.
 */
export function showBackFaces(scene: THREE.Scene, camera: THREE.Camera) {
  scene.traverse((object) => {
    const face = object.userData.face as
      | { axis: AxisKey; side: number }
      | undefined;
    if (!face) {
      return;
    }
    const toward = Math.sign(camera.position[face.axis]) || 1;
    object.visible = face.side === -toward;
  });
}
