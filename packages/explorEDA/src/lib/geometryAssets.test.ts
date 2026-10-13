import { expect, it } from "vitest";
import {
  isRegionGeometry,
  regionGeometryProblems,
  regionGeometrySize,
  type RegionGeometry,
} from "./geometryAssets";

const square = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
];
const collection = (...geometries: unknown[]) => ({
  type: "FeatureCollection",
  features: geometries.map((geometry, index) => ({
    type: "Feature",
    id: `f${index}`,
    properties: null,
    geometry,
  })),
});

it("accepts polygons and multipolygons and counts their vertices", () => {
  const value = collection(
    { type: "Polygon", coordinates: [square] },
    { type: "MultiPolygon", coordinates: [[square], [square]] }
  );
  expect(regionGeometryProblems(value)).toEqual([]);
  expect(isRegionGeometry(value)).toBe(true);
  expect(regionGeometrySize(value as RegionGeometry)).toEqual({
    features: 2,
    vertices: 15,
  });
});

it("names the feature, ring, and point of each problem", () => {
  expect(regionGeometryProblems({ type: "Feature" })).toEqual([
    "This is a Feature; use a FeatureCollection of Polygon or MultiPolygon features",
  ]);
  expect(
    regionGeometryProblems({ type: "FeatureCollection", features: [] })
  ).toEqual(["The FeatureCollection has no features"]);
  expect(
    regionGeometryProblems(
      collection(
        { type: "Point", coordinates: [0, 0] },
        { type: "Polygon", coordinates: [square.slice(0, 4)] },
        {
          type: "Polygon",
          coordinates: [[...square.slice(0, 2), [181, 0], ...square.slice(3)]],
        },
        {
          type: "MultiPolygon",
          coordinates: [
            [square],
            [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, Infinity],
                [0, 0],
              ],
            ],
          ],
        },
        null,
        {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [0, 0],
            ],
          ],
        }
      )
    )
  ).toEqual([
    'Feature 0 ("f0") is a Point; use Polygon or MultiPolygon',
    'Feature 1 ("f1"), ring 0 is not closed: its last point must repeat its first',
    'Feature 2 ("f2"), ring 0, point 2 has longitude 181, outside −180 to 180. Coordinates must be WGS 84 degrees',
    'Feature 3 ("f3"), polygon 1, ring 0, point 3 has a value that is not a finite number',
    'Feature 4 ("f4") has no geometry',
    "1 more features have problems",
  ]);
});
