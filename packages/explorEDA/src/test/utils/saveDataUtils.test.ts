import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveToClipboard,
  validateSavedData,
  migrateDataVersion,
} from "@/utils/saveDataUtils";
import { SavedDataStructure } from "@/types/SavedDataStructure";

describe("saveDataUtils", () => {
  const mockValidData: SavedDataStructure = {
    charts: [],
    calculations: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 30,
      containerPadding: 10,
      showBackgroundMarkers: true,
    },
    metadata: {
      name: "Test View",
      version: 1,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    colorScales: [],
  };
  const valid3dChart = {
    id: "chart",
    type: "3d-scatter",
    title: "3D",
    field: "x",
    layout: { x: 0, y: 0, w: 1, h: 1 },
    facet: {
      enabled: false,
      type: "wrap",
      rowVariable: "",
      columnCount: 2,
    },
    xAxis: { zoomLevel: 1 },
    yAxis: { zoomLevel: 1 },
    zAxis: { zoomLevel: 1 },
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    filters: [],
    xAxisLabel: "",
    yAxisLabel: "",
    xGridLines: 5,
    yGridLines: 5,
    xField: "x",
    yField: "y",
    zField: "z",
    pointSize: 5,
    pointOpacity: 0.8,
    showGrid: true,
    showAxes: true,
    cameraPosition: { x: 1, y: 2, z: 3 },
    cameraTarget: { x: 0, y: 0, z: 0 },
  };

  describe("validateSavedData", () => {
    it("should return true for valid data", () => {
      expect(validateSavedData(mockValidData)).toBe(true);
    });

    it("should return false for null or undefined", () => {
      expect(validateSavedData(null)).toBe(false);
      expect(validateSavedData(undefined)).toBe(false);
    });

    it("should return false for non-object data", () => {
      expect(validateSavedData("string")).toBe(false);
      expect(validateSavedData(123)).toBe(false);
      expect(validateSavedData([])).toBe(false);
    });

    it("should return false for missing required properties", () => {
      const invalidData = { ...mockValidData };
      delete (invalidData as any).charts;
      expect(validateSavedData(invalidData)).toBe(false);
    });

    it("should return false for invalid metadata types", () => {
      const invalidData = {
        ...mockValidData,
        metadata: {
          ...mockValidData.metadata,
          version: "1" as any,
        },
      };
      expect(validateSavedData(invalidData)).toBe(false);
    });

    it("should return false for invalid gridSettings types", () => {
      const invalidData = {
        ...mockValidData,
        gridSettings: {
          ...mockValidData.gridSettings,
          columnCount: "12" as any,
        },
      };
      expect(validateSavedData(invalidData)).toBe(false);
    });

    it("should return false for malformed nested chart and calculation data", () => {
      expect(
        validateSavedData({
          ...mockValidData,
          charts: [{ id: "chart", type: "scatter" }],
        })
      ).toBe(false);

      expect(
        validateSavedData({
          ...mockValidData,
          calculations: [
            {
              resultColumnName: "double",
              expression: { type: "unknown", dependencies: [] },
            },
          ],
        })
      ).toBe(false);
    });

    it("rejects unsupported chart types", () => {
      expect(
        validateSavedData({
          ...mockValidData,
          charts: [{ ...valid3dChart, type: "unknown" }],
        })
      ).toBe(false);
    });

    it("rejects malformed nested chart settings", () => {
      expect(
        validateSavedData({
          ...mockValidData,
          charts: [
            {
              ...valid3dChart,
              cameraPosition: { x: "bad", y: 2, z: 3 },
            },
          ],
        })
      ).toBe(false);
    });

    it("accepts serialized 3D camera vectors", () => {
      expect(
        validateSavedData({
          ...mockValidData,
          charts: [valid3dChart],
        })
      ).toBe(true);
    });
  });

  describe("saveToClipboard", () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(),
        },
      });
    });

    it("should write JSON string to clipboard", async () => {
      await saveToClipboard(mockValidData);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(mockValidData)
      );
    });

    it("should throw error when clipboard write fails", async () => {
      (navigator.clipboard.writeText as any).mockRejectedValue(
        new Error("Clipboard error")
      );
      await expect(saveToClipboard(mockValidData)).rejects.toThrow(
        "Failed to save data to clipboard"
      );
    });
  });

  describe("migrateDataVersion", () => {
    it("should return data unchanged for current version", () => {
      const result = migrateDataVersion(mockValidData);
      expect(result).toEqual(mockValidData);
    });
  });
});
