import type { HierarchySettings } from "./definition";

export type Arrangement = HierarchySettings["arrangement"];

/** Each way to draw the hierarchy, with the help its control shows. */
export const ARRANGEMENTS: readonly {
  value: Arrangement;
  label: string;
  help: string;
}[] = [
  {
    value: "treemap",
    label: "Treemap",
    help: "Nested boxes: each parent frames its children, and area shows size.",
  },
  {
    value: "icicle",
    label: "Icicle",
    help: "One column per level, left to right: each box is as tall as its share, so sizes compare along one edge.",
  },
];
