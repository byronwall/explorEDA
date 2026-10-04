import type { GeometryAsset } from "exploreda";

export const serviceDistricts: GeometryAsset = {
  id: "service-districts",
  name: "Service districts",
  source: "Synthetic service boundaries for this example",
  geometry: {
    type: "FeatureCollection",
    features: [
      { type: "Feature", id: "west", properties: { district: "West" }, geometry: { type: "Polygon", coordinates: [[[-79,41],[-77,40.8],[-76,41],[-76.5,43],[-76,44],[-78.5,44],[-79,41]]] } },
      { type: "Feature", id: "central", properties: { district: "Central" }, geometry: { type: "Polygon", coordinates: [[[-76,41],[-73,41],[-73.5,42.5],[-73,44],[-76,44],[-76.5,43],[-76,41]]] } },
      { type: "Feature", id: "east", properties: { district: "East" }, geometry: { type: "Polygon", coordinates: [[[-73,41],[-70,41.5],[-70.5,43],[-70,44],[-73,44],[-73.5,42.5],[-73,41]]] } },
      { type: "Feature", id: "east-island", properties: { district: "East" }, geometry: { type: "Polygon", coordinates: [[[-70.2,44.5],[-69.4,44.6],[-69.7,45.2],[-70.4,45],[-70.2,44.5]]] } },
      { type: "Feature", id: "south", properties: { district: "South" }, geometry: { type: "Polygon", coordinates: [[[-79,38],[-75,38],[-75.5,39.5],[-76,41],[-77,40.8],[-79,41],[-79,38]]] } },
      { type: "Feature", id: "harbor", properties: { district: "Harbor" }, geometry: { type: "Polygon", coordinates: [[[-75,38],[-72,38],[-72.2,40],[-73,41],[-76,41],[-75.5,39.5],[-75,38]]] } },
      { type: "Feature", id: "reserve", properties: { district: "Reserve" }, geometry: { type: "Polygon", coordinates: [[[-72,38],[-70,38.5],[-70,41.5],[-73,41],[-72.2,40],[-72,38]]] } },
    ],
  },
};
