/**
 * Renderer-neutral chart annotation contract, proposed version 1.0.0.
 * This is a design reference, not an implementation of a renderer/editor.
 * All lengths ending in CssPx are CSS pixels, not device/export pixels.
 * plot-fraction and view-css-px coordinates use a TOP-LEFT origin, y down.
 * Axis values use the axis's own orientation and are projected by an adapter.
 */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type Id = string;
export type KeyAtom = string | number | boolean;
export type RowKey = Record<string, KeyAtom>;
export type Scalar =
  | { kind: "number"; value: number }
  | { kind: "instant"; value: string } // RFC 3339; an instant, not a local date
  | { kind: "category"; value: string | number };
export interface Scope {
  viewId: Id;
  /** Semantic facet identity, never a screen position or panel array index. */
  facet?: Record<string, KeyAtom>;
}
export interface CssPoint { x: number; y: number }
export type Coordinate =
  | { space: "axis"; axisId: Id; value: Scalar; bandPosition?: number }
  | { space: "plot-fraction"; value: number }
  | { space: "view-css-px"; value: number };
export interface FieldBinding { field: string; axisId: Id }
export interface AnchorSnapshot {
  x: Scalar;
  y: Scalar;
  datasetRevision?: string;
  capturedAt: string;
}
export type Anchor =
  | {
      kind: "coordinate";
      scope: Scope;
      x: Coordinate;
      y: Coordinate;
    }
  | {
      kind: "datum";
      scope: Scope;
      datasetId: Id;
      rowKey: RowKey;
      x: FieldBinding;
      y: FieldBinding;
      snapshot?: AnchorSnapshot;
    }
  | {
      kind: "row-set";
      scope: Scope;
      datasetId: Id;
      rowKeys: RowKey[];
      x: FieldBinding;
      y: FieldBinding;
    }
  | {
      kind: "derived";
      scope: Scope;
      datasetId: Id;
      /** Registered, allowlisted resolver; never executable source in JSON. */
      resolver: { id: string; version: string; params: Record<string, Json> };
      input: { kind: "dataset" } | { kind: "filter"; filterId: Id };
      output: "point" | "region";
    };
export interface LabelPlacement {
  offsetCssPx: CssPoint;
  align: "start" | "center" | "end";
  verticalAlign: "top" | "middle" | "bottom";
  maxWidthCssPx?: number;
  /** Auto-placement results are a transient cache, not new authored offsets. */
  layout: "manual" | "avoid-overlap";
}
export type Head = "none" | "arrow" | "dot";
export type StrokeFrame =
  | { kind: "plot-fraction"; scope: Scope }
  | { kind: "view-css-px"; scope: Scope }
  | {
      kind: "axes";
      scope: Scope;
      /** Freehand v1 permits continuous axes only. */
      x: { axisId: Id; encoding: "number" | "epoch-ms" };
      y: { axisId: Id; encoding: "number" | "epoch-ms" };
    };
export interface StrokeSample {
  x: number;
  y: number;
  pressure?: number; // [0, 1]
  elapsedMs?: number;
}
export type Geometry =
  | { kind: "label"; anchor: Id; placement: LabelPlacement }
  | {
      kind: "callout";
      anchor: Id;
      placement: LabelPlacement;
      leader: {
        route: "straight" | "elbow" | "curve";
        headAtTarget: Head;
        /** For curved leaders, offsets from the target in CSS pixels. */
        controlOffsetsCssPx?: [CssPoint, CssPoint];
      };
    }
  | {
      kind: "marker";
      anchor: Id;
      role: "point" | "event";
      glyph: "circle" | "square" | "diamond" | "flag";
      sizeCssPx: number;
    }
  | { kind: "line"; from: Id; to: Id; startHead: Head; endHead: Head }
  | {
      kind: "rule";
      anchor: Id;
      orientation: "horizontal" | "vertical";
      /** Fractions of the orthogonal plot dimension, top/left = 0. */
      span: [number, number];
    }
  | {
      kind: "band";
      from: Id;
      to: Id;
      orientation: "horizontal" | "vertical";
      span: [number, number];
    }
  | { kind: "shape"; shape: "rect" | "ellipse"; from: Id; to: Id }
  | { kind: "polygon"; vertices: Id[] }
  | {
      kind: "highlight";
      target: Id; // a row-set or region-producing resolver
      outline: "bounds" | "convex-hull";
      paddingCssPx: number;
    }
  | {
      kind: "image";
      anchor: Id;
      offsetCssPx: CssPoint;
      widthCssPx: number;
      heightCssPx: number;
      rotationDeg: number;
    }
  | { kind: "freehand"; frame: StrokeFrame; samples: StrokeSample[] };
export type TextSpan = { text: string; bold?: boolean; italic?: boolean };
export type Content =
  | { kind: "text"; text: string; language?: string }
  | { kind: "rich-text"; paragraphs: TextSpan[][]; language?: string }
  | { kind: "asset"; assetId: Id; alt: string; caption?: string };
export interface Style {
  stroke?: string;
  strokeWidthCssPx?: number;
  strokeDashCssPx?: number[];
  fill?: string;
  opacity?: number;
  textColor?: string;
  fontFamily?: string;
  fontSizeCssPx?: number;
  fontWeight?: 400 | 500 | 600 | 700;
  paddingCssPx?: number;
  cornerRadiusCssPx?: number;
}
export interface Behavior {
  onFiltered: "hide" | "show-with-status";
  onMissing: "hide" | "show-snapshot" | "show-unresolved";
  whenOutOfView: "clip" | "hide" | "edge-indicator";
  affectsDomain: boolean;
}
export type Accessibility =
  | { decorative: true }
  | { decorative: false; label: string; description?: string; readingOrder?: number };
export interface Annotation {
  id: Id;
  anchors: Record<Id, Anchor>;
  geometry: Geometry;
  content?: Content;
  style: Style;
  behavior: Behavior;
  accessibility: Accessibility;
  /** UI affordance only. Server authorization must be enforced independently. */
  locked?: boolean;
  provenance: { createdBy: Id; createdAt: string; updatedAt: string };
  /** Namespaced, JSON-only integration metadata. */
  extensions?: Record<string, Json>;
}
export interface Asset {
  id: Id;
  mediaType: string;
  /** Application asset-store key, not a temporary signed URL or DOM object. */
  storageKey: string;
  sha256?: string;
  intrinsicWidth?: number;
  intrinsicHeight?: number;
}
export interface AnnotationDocument {
  schema: "chart-annotations";
  schemaVersion: "1.0.0";
  documentId: Id;
  /** Opaque server revision; independent of the schema/library versions. */
  revision: string;
  views: Record<Id, { axisIds: Id[]; description?: string }>;
  datasets: Record<Id, { sourceId: Id; revision?: string; keyFields: string[] }>;
  annotations: Record<Id, Annotation>;
  /** Rendering order only; accessibility reading order is independently defined. */
  order: Id[];
  assets: Record<Id, Asset>;
}

/** Transient editor state: never serialize into AnnotationDocument. */
export interface EditorState {
  tool: string;
  selectedIds: Id[];
  hoveredId?: Id;
  focusedId?: Id;
  gesture?: {
    id: Id;
    annotationId: Id;
    startCssPx: CssPoint;
    preview: Annotation;
  };
  guides: Array<{ from: CssPoint; to: CssPoint }>;
}
export type StyleOperation = {
  [K in keyof Required<Style>]: {
    type: "set-style";
    annotationId: Id;
    key: K;
    value: NonNullable<Style[K]> | null; // null removes the override
  }
}[keyof Required<Style>];
export type EditOperation =
  | { type: "add"; annotation: Annotation; afterId?: Id }
  | { type: "remove"; annotationId: Id }
  | { type: "set-anchor"; annotationId: Id; anchorId: Id; anchor: Anchor }
  | { type: "set-geometry"; annotationId: Id; geometry: Geometry }
  | { type: "set-content"; annotationId: Id; content: Content | null }
  | StyleOperation;
export interface EditTransaction {
  transactionId: Id;
  actorId: Id;
  baseRevision: string;
  createdAt: string;
  origin: "user" | "remote" | "undo" | "redo" | "migration" | "system";
  operations: EditOperation[];
}
export type EditorEvent =
  | { phase: "begin"; gestureId: Id; annotationIds: Id[] }
  | { phase: "preview"; gestureId: Id; annotations: Annotation[] }
  | { phase: "commit"; gestureId?: Id; transaction: EditTransaction }
  | { phase: "cancel"; gestureId: Id };
export type AnchorResolution =
  | {
      status: "resolved";
      pointsCssPx: CssPoint[];
      visibility: "visible" | "offscreen" | "filtered";
    }
  | {
      status: "unresolved";
      reason: "missing-key" | "deleted" | "source-unavailable" |
        "invalid-value" | "missing-axis" | "missing-facet" | "filtered-out";
      snapshot?: AnchorSnapshot;
    };
export interface ChartAdapter {
  id: string;
  version: string;
  /** Resolves semantic data identities against the current chart/data state. */
  resolve(anchor: Anchor): AnchorResolution;
  project(scope: Scope, x: Coordinate, y: Coordinate): CssPoint;
  /** Inversion is axis-aware; categorical inversion must define band position. */
  unproject(scope: Scope, point: CssPoint, axes: { x: Id; y: Id }): {
    x: Scalar; y: Scalar; xBandPosition?: number; yBandPosition?: number;
  };
}
