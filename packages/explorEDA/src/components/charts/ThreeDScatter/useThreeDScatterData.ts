import { finiteNumber, finiteNumbers } from "@/lib/numeric";
import { useColorScales } from "@/hooks/useColorScales";
import { IdType } from "@/providers/DataLayerProvider";
import { useMemo } from "react";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import { datum } from "@/types/ChartTypes";
import { ThreeDScatterSettings } from "./types";

/** Half the edge of the cube every 3D scatter draws its points inside. */
export const CUBE_HALF = 10;

export type Domain = [number, number];

export interface ThreeDScatterPoint {
  /** Position inside the cube. */
  x: number;
  y: number;
  z: number;
  /** The row's own values, for the readout. */
  values: { x: number; y: number; z: number; color: datum; size: datum };
  color: string;
  size: number;
}

export interface ThreeDScatterData {
  points: ThreeDScatterPoint[];
  omitted: number;
  domains: { x: Domain; y: Domain; z: Domain };
}

function extent(values: datum[]): Domain {
  const numbers = finiteNumbers(values);
  if (!numbers.length) {
    return [0, 0];
  }
  let min = Infinity;
  let max = -Infinity;
  for (const value of numbers) {
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  return [min, max];
}

/** Maps a value into the cube; a flat domain sits in the middle. */
export function toCube(value: number, [min, max]: Domain) {
  return max > min
    ? ((value - min) / (max - min)) * 2 * CUBE_HALF - CUBE_HALF
    : 0;
}

/** Maps a cube position back to a value on the axis. */
export function fromCube(position: number, [min, max]: Domain) {
  return min + ((position + CUBE_HALF) / (2 * CUBE_HALF)) * (max - min);
}

export function buildThreeDScatterData(
  xData: datum[],
  yData: datum[],
  zData: datum[],
  colorData: datum[],
  sizeData: datum[],
  sizeDomain: Domain,
  getColor: (value: datum) => string,
  domains: ThreeDScatterData["domains"] = {
    x: extent(xData),
    y: extent(yData),
    z: extent(zData),
  }
): ThreeDScatterData {
  const [sizeMin, sizeMax] = sizeDomain;
  const sizeRange = sizeMax - sizeMin;
  const points: ThreeDScatterPoint[] = [];
  let omitted = 0;

  const numericValue = (value: datum) => finiteNumber(value) ?? NaN;

  for (let i = 0; i < xData.length; i++) {
    const x = numericValue(xData[i]);
    const y = numericValue(yData[i]);
    const z = numericValue(zData[i]);
    if (![x, y, z].every(Number.isFinite)) {
      omitted += 1;
      continue;
    }

    const rawSize = numericValue(sizeData[i]);
    const size = Number.isFinite(rawSize)
      ? sizeRange > 0
        ? 0.5 + ((rawSize - sizeMin) / sizeRange) * 1.5
        : 1
      : 1;
    points.push({
      x: toCube(x, domains.x),
      y: toCube(y, domains.y),
      z: toCube(z, domains.z),
      values: { x, y, z, color: colorData[i], size: sizeData[i] },
      color: getColor(colorData[i]),
      size,
    });
  }

  return { points, omitted, domains };
}

export function useThreeDScatterData(
  settings: ThreeDScatterSettings,
  facetIds?: IdType[]
) {
  const is3DScatter = settings.type === "3d-scatter";

  const xData = useGetLiveData(settings, settings.xField, facetIds);
  const yData = useGetLiveData(settings, settings.yField, facetIds);
  const zData = useGetLiveData(settings, settings.zField, facetIds);
  const colorData = useGetLiveData(settings, settings.colorField, facetIds);
  const sizeData = useGetLiveData(settings, settings.sizeField, facetIds);
  const allXData = useGetColumnDataForIds(settings.xField);
  const allYData = useGetColumnDataForIds(settings.yField);
  const allZData = useGetColumnDataForIds(settings.zField);
  const allSizeData = useGetColumnDataForIds(settings.sizeField);

  const { getColorForValue } = useColorScales();
  const colorScaleId = settings.colorScaleId;

  // Axes span every row, so filters and facets move points, not the cube.
  const domains = useMemo(
    () => ({ x: extent(allXData), y: extent(allYData), z: extent(allZData) }),
    [allXData, allYData, allZData]
  );

  return useMemo((): ThreeDScatterData => {
    if (!is3DScatter) {
      return { points: [], omitted: 0, domains };
    }

    return buildThreeDScatterData(
      xData,
      yData,
      zData,
      colorData,
      sizeData,
      extent(allSizeData),
      (value) => getColorForValue(colorScaleId, value, "#3b82f6"),
      domains
    );
  }, [
    is3DScatter,
    xData,
    yData,
    zData,
    getColorForValue,
    colorScaleId,
    colorData,
    sizeData,
    allSizeData,
    domains,
  ]);
}
