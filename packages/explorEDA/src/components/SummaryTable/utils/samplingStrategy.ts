import { datum } from "@/types/ChartTypes";

export interface SamplingOptions {
  sampleSize?: number;
  method: "random" | "systematic";
  seed?: number;
}

export function sampleData(
  data: { [key: number]: datum },
  options: SamplingOptions = { method: "random", sampleSize: 1000, seed: 0 }
): { [key: number]: datum } {
  const values = Object.entries(data);
  const totalSize = values.length;
  const sampleSize = Math.min(options.sampleSize || 1000, totalSize);

  if (options.method === "systematic") {
    const step = Math.floor(totalSize / sampleSize);
    return Object.fromEntries(
      values.filter((_, index) => index % step === 0).slice(0, sampleSize)
    );
  }

  // Random sampling
  const shuffled = [...values];
  let state = (options.seed ?? 0) >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const value = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = value;
  }

  return Object.fromEntries(shuffled.slice(0, sampleSize));
}

export function estimateStatisticalSignificance(
  sampleSize: number,
  populationSize: number
): {
  marginOfError: number;
  confidenceInterval: [number, number];
} {
  // Using standard error formula for finite populations
  const z = 1.96; // z-score for 95% confidence level
  const p = 0.5; // assuming maximum variance
  const marginOfError =
    z *
    Math.sqrt((p * (1 - p)) / sampleSize) *
    Math.sqrt((populationSize - sampleSize) / (populationSize - 1));

  return {
    marginOfError,
    confidenceInterval: [0.5 - marginOfError, 0.5 + marginOfError],
  };
}
