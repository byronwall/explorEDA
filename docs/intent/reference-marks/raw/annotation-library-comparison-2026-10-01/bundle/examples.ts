import type { Annotation, AnnotationDocument, EditTransaction } from "./annotation-model";

declare const process: { stdout: { write(text: string): void } };
const provenance = {
  createdBy: "user:analyst-42",
  createdAt: "2026-10-01T14:00:00Z",
  updatedAt: "2026-10-01T14:00:00Z",
};
const behavior = {
  onFiltered: "hide", onMissing: "show-unresolved", whenOutOfView: "clip",
  affectsDomain: false,
} as const;
const scope = { viewId: "revenue", facet: { region: "West" } };
const annotations: Annotation[] = [
  {
    id: "ann:launch-callout",
    anchors: {
      subject: {
        kind: "datum", scope, datasetId: "sales", rowKey: { orderId: "O-1042" },
        x: { field: "completedAt", axisId: "time" },
        y: { field: "revenueUsd", axisId: "revenue-usd" },
        snapshot: {
          x: { kind: "instant", value: "2026-09-14T00:00:00Z" },
          y: { kind: "number", value: 128000 },
          datasetRevision: "sales:51", capturedAt: "2026-10-01T14:00:00Z",
        },
      },
    },
    geometry: {
      kind: "callout", anchor: "subject",
      placement: {
        offsetCssPx: { x: 48, y: -36 }, align: "start", verticalAlign: "bottom",
        maxWidthCssPx: 180, layout: "manual",
      },
      leader: { route: "elbow", headAtTarget: "arrow" },
    },
    content: { kind: "text", text: "Revenue increased after launch", language: "en" },
    style: { stroke: "#334155", strokeWidthCssPx: 1.5, fontSizeCssPx: 14 },
    behavior, accessibility: { decorative: false, label: "Launch revenue annotation" },
    provenance,
  },
  {
    id: "ann:target-band",
    anchors: {
      lower: {
        kind: "coordinate", scope,
        x: { space: "plot-fraction", value: 0 },
        y: { space: "axis", axisId: "revenue-usd", value: { kind: "number", value: 100000 } },
      },
      upper: {
        kind: "coordinate", scope,
        x: { space: "plot-fraction", value: 1 },
        y: { space: "axis", axisId: "revenue-usd", value: { kind: "number", value: 130000 } },
      },
    },
    geometry: { kind: "band", from: "lower", to: "upper", orientation: "horizontal", span: [0, 1] },
    content: { kind: "text", text: "Target range: $100,000–$130,000" },
    style: { fill: "#dbeafe", opacity: 0.3 },
    behavior, accessibility: { decorative: false, label: "Revenue target range" },
    provenance,
  },
  {
    id: "ann:freehand-review",
    anchors: {},
    geometry: {
      kind: "freehand", frame: { kind: "plot-fraction", scope },
      samples: [
        { x: 0.3, y: 0.25, pressure: 0.5, elapsedMs: 0 },
        { x: 0.34, y: 0.2, pressure: 0.6, elapsedMs: 12 },
        { x: 0.4, y: 0.24, pressure: 0.5, elapsedMs: 25 },
      ],
    },
    style: { stroke: "#92400e", strokeWidthCssPx: 2 },
    behavior, accessibility: { decorative: false, label: "Reviewer's freehand emphasis" },
    provenance,
  },
];
export const document: AnnotationDocument = {
  schema: "chart-annotations", schemaVersion: "1.0.0",
  documentId: "annotations:quarterly-review", revision: "rev:17",
  views: { revenue: { axisIds: ["time", "revenue-usd"], description: "Revenue by region" } },
  datasets: { sales: { sourceId: "warehouse:sales", revision: "sales:51", keyFields: ["orderId"] } },
  annotations: Object.fromEntries(annotations.map(a => [a.id, a])),
  order: annotations.map(a => a.id), assets: {},
};
export const labelMove: EditTransaction = {
  transactionId: "tx:label-move-18", actorId: "user:analyst-42", baseRevision: "rev:17",
  createdAt: "2026-10-01T14:02:00Z", origin: "user",
  operations: [{
    type: "set-geometry", annotationId: "ann:launch-callout",
    geometry: {
      kind: "callout", anchor: "subject",
      placement: {
        offsetCssPx: { x: 72, y: -40 }, align: "start", verticalAlign: "bottom",
        maxWidthCssPx: 180, layout: "manual",
      },
      leader: { route: "elbow", headAtTarget: "arrow" },
    },
  }],
};
process.stdout.write(JSON.stringify({ document, exampleTransaction: labelMove }, null, 2) + "\n");
