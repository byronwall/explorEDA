import { detectColumnType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { categoryLabel, categoryValue } from "@/lib/categories";
import { finiteNumber, finiteNumbers, isMissingValue } from "@/lib/valueParsing";
import { useColorScales } from "@/hooks/useColorScales";
import { IdType } from "@/providers/DataLayerProvider";
import { useMemo } from "react";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData, useGetLiveIds } from "../useGetLiveData";
import { jitter, JITTER_SHARE, type ScatterCategory } from "../ScatterPlot/scatterAxis";
import { datum } from "@/types/ChartTypes";
import { ThreeDScatterSettings } from "./types";

/** Half the edge of the cube every 3D scatter draws its points inside. */
export const CUBE_HALF = 10;

export type Domain = [number, number];

/**
 * One cube axis. Numeric fields span their range. Any other field, like the
 * main scatter plot, gets one evenly spaced slot per category.
 */
export type CubeAxis =
  | { kind: "numeric"; domain: Domain }
  | { kind: "band"; categories: ScatterCategory[] };

export interface ThreeDScatterPoint {
  /** Position inside the cube. */
  x: number;
  y: number;
  z: number;
  /** The row's own values, for the readout. */
  values: { x: datum; y: datum; z: datum; color: datum; size: datum };
  color: string;
  size: number;
}

export interface ThreeDScatterData {
  points: ThreeDScatterPoint[];
  omitted: number;
  axes: { x: CubeAxis; y: CubeAxis; z: CubeAxis };
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

const labelOrder = new Intl.Collator(undefined, { numeric: true });

/** Plans an axis from every value of its field. */
export function planCubeAxis(values: datum[]): CubeAxis {
  const hasValues = values.some((value) => !isMissingValue(value));
  if (!hasValues || detectColumnType(values) === "numeric") {
    return { kind: "numeric", domain: extent(values) };
  }
  const byLabel = new Map<string, datum>();
  for (const raw of values) {
    const value = categoryValue(raw);
    byLabel.set(categoryLabel(value), value);
  }
  const categories = [...byLabel]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) =>
      a.value == null
        ? 1
        : b.value == null
          ? -1
          : labelOrder.compare(a.label, b.label)
    );
  return { kind: "band", categories };
}

/** The cube position of a category slot's center. */
export function bandCenter(index: number, count: number) {
  const step = (2 * CUBE_HALF) / Math.max(count, 1);
  return -CUBE_HALF + step * (index + 0.5);
}

/** Places a value on an axis, or undefined when it has no place. */
export function cubePosition(
  axis: CubeAxis,
  raw: datum,
  id: IdType,
  salt: number
): { value: datum; at: number } | undefined {
  if (axis.kind === "numeric") {
    const value = finiteNumber(raw);
    return value === undefined
      ? undefined
      : { value, at: toCube(value, axis.domain) };
  }
  const value = categoryValue(raw);
  const label = categoryLabel(value);
  const index = axis.categories.findIndex((item) => item.label === label);
  if (index < 0) return undefined;
  const step = (2 * CUBE_HALF) / axis.categories.length;
  return {
    value,
    // Points spread inside their slot so a category reads as a cloud.
    at:
      bandCenter(index, axis.categories.length) +
      jitter(id, salt) * step * JITTER_SHARE * 0.6,
  };
}

export function buildThreeDScatterData(
  xData: datum[],
  yData: datum[],
  zData: datum[],
  colorData: datum[],
  sizeData: datum[],
  sizeDomain: Domain,
  getColor: (value: datum) => string,
  axes: ThreeDScatterData["axes"] = {
    x: planCubeAxis(xData),
    y: planCubeAxis(yData),
    z: planCubeAxis(zData),
  },
  ids?: IdType[]
): ThreeDScatterData {
  const [sizeMin, sizeMax] = sizeDomain;
  const sizeRange = sizeMax - sizeMin;
  const points: ThreeDScatterPoint[] = [];
  let omitted = 0;

  for (let i = 0; i < xData.length; i++) {
    const id = ids?.[i] ?? i;
    const x = cubePosition(axes.x, xData[i], id, 1);
    const y = cubePosition(axes.y, yData[i], id, 2);
    const z = cubePosition(axes.z, zData[i], id, 3);
    if (!x || !y || !z) {
      omitted += 1;
      continue;
    }

    const rawSize = finiteNumber(sizeData[i]) ?? NaN;
    const size = Number.isFinite(rawSize)
      ? sizeRange > 0
        ? 0.5 + ((rawSize - sizeMin) / sizeRange) * 1.5
        : 1
      : 1;
    points.push({
      x: x.at,
      y: y.at,
      z: z.at,
      values: {
        x: x.value,
        y: y.value,
        z: z.value,
        color: colorData[i],
        size: sizeData[i],
      },
      color: getColor(colorData[i]),
      size,
    });
  }

  return { points, omitted, axes };
}

export function useThreeDScatterData(
  settings: ThreeDScatterSettings,
  facetIds?: IdType[]
) {
  const is3DScatter = settings.type === "3d-scatter";

  const xData = useGetLiveData(settings, settings.xField, facetIds);
  const yData = useGetLiveData(settings, settings.yField, facetIds);
  const zData = useGetLiveData(settings, settings.zField, facetIds);
  const liveIds = useGetLiveIds(settings, facetIds);
  const colorData = useGetLiveData(settings, settings.colorField, facetIds);
  const sizeData = useGetLiveData(settings, settings.sizeField, facetIds);
  const allXData = useGetColumnDataForIds(settings.xField);
  const allYData = useGetColumnDataForIds(settings.yField);
  const allZData = useGetColumnDataForIds(settings.zField);
  const allSizeData = useGetColumnDataForIds(settings.sizeField);

  const { getColorForValue } = useColorScales();
  const colorScaleId = settings.colorScaleId;

  // Axes span every row, so filters and facets move points, not the cube.
  const axes = useMemo(
    () => ({
      x: planCubeAxis(allXData),
      y: planCubeAxis(allYData),
      z: planCubeAxis(allZData),
    }),
    [allXData, allYData, allZData]
  );

  return useMemo((): ThreeDScatterData => {
    if (!is3DScatter) {
      return { points: [], omitted: 0, axes };
    }

    return buildThreeDScatterData(
      xData,
      yData,
      zData,
      colorData,
      sizeData,
      extent(allSizeData),
      (value) => getColorForValue(colorScaleId, value, "#3b82f6"),
      axes,
      liveIds
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
    axes,
    liveIds,
  ]);
}
