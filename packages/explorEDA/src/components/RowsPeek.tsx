import type { ReactNode, RefObject } from "react";
import { RowsView } from "./RowsView";
import { WorkspaceDrawer } from "./WorkspaceDrawer";

/**
 * The rows that pass every chart filter, in a drawer over the right of the
 * viewport. Expanded, it leaves a strip of charts and a click there closes
 * it. Narrow, it sits beside the charts, which stay in use while it is open.
 * R, Escape, and the close button close either size.
 */
export function RowsPeek({
  id,
  scope,
  containerRef,
  narrow,
  onNarrowChange,
  onClose,
  readOnly = false,
}: {
  id: string;
  /** The row count and active filters, which the drawer covers in the toolbar. */
  scope?: ReactNode;
  /** The sticky controls; clicks there keep the drawer open. */
  containerRef: RefObject<HTMLElement | null>;
  /** The narrow size keeps the charts visible and in use beside the rows. */
  narrow: boolean;
  onNarrowChange: (narrow: boolean) => void;
  onClose: () => void;
  /** Keep table edits local while inspecting a read-only preview. */
  readOnly?: boolean;
}) {
  return (
    <WorkspaceDrawer
      id={id}
      heading="Rows"
      scope={scope}
      containerRef={containerRef}
      narrow={narrow}
      onNarrowChange={onNarrowChange}
      sizeLabels={{
        expand: "Expand the rows",
        expandTooltip: "Expand the rows across the workspace",
        narrow: "Narrow the rows",
        narrowTooltip: "Narrow the rows to keep the charts in use beside them",
      }}
      closeLabel="Close rows"
      closeTooltip="Close rows (R or Esc)"
      onClose={onClose}
    >
      {(size, toolbarTarget) => (
        <RowsView
          width={size.width}
          height={size.height}
          toolbarTarget={toolbarTarget}
          readOnly={readOnly}
        />
      )}
    </WorkspaceDrawer>
  );
}
