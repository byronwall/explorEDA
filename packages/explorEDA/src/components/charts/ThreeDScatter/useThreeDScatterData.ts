import { finiteNumber, finiteNumbers } from "@/lib/numeric";
import { useColorScales } from "@/hooks/useColorScales";
import { IdType } from "@/providers/DataLayerProvider";
import { useMemo } from "react";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import { datum } from "@/types/ChartTypes";
import { ThreeDScatterSettings } from "./types";

export interface ThreeDScatterPoint {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

export interface ThreeDScatterData {
  points: ThreeDScatterPoint[];
  omitted: number;
}

export function buildThreeDScatterData(
  xData: datum[],
  yData: datum[],
  zData: datum[],
  colorData: datum[],
  sizeData: datum[],
  sizeDomain: [number, number],
  getColor: (value: datum) => string
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
    points.push({ x, y, z, color: getColor(colorData[i]), size });
  }

  return { points, omitted };
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
  const allSizeData = useGetColumnDataForIds(settings.sizeField);

  const { getColorForValue } = useColorScales();
  const colorScaleId = settings.colorScaleId;

  return useMemo(() => {
    if (!is3DScatter) {
      return { points: [], omitted: 0 };
    }

    const sizes = finiteNumbers(allSizeData);
    const sizeDomain: [number, number] = sizes.length
      ? [Math.min(...sizes), Math.max(...sizes)]
      : [0, 0];
    return buildThreeDScatterData(
      xData,
      yData,
      zData,
      colorData,
      sizeData,
      sizeDomain,
      (value) => getColorForValue(colorScaleId, value, "#ffffff")
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
  ]);
}
