import { Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Shortcut = {
  /** Each entry is one key; alternatives are separated by "or". */
  keys: string[][];
  action: string;
};

type ShortcutGroup = {
  title: string;
  shortcuts: Shortcut[];
};

export const modifierKey =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.platform)
    ? "⌘"
    : "Ctrl";

export const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Workspace",
    shortcuts: [
      { keys: [["?"]], action: "Show keyboard shortcuts" },
      { keys: [["F"]], action: "Open or close the field list" },
      { keys: [["Shift", "F"]], action: "Show every field's distribution" },
      { keys: [["R"]], action: "Peek at the rows that pass every filter" },
      {
        keys: [["Esc"]],
        action: "Close the open editor, popover, or expanded chart",
      },
    ],
  },
  {
    title: "Charts",
    shortcuts: [
      { keys: [["Tab"]], action: "Move between charts and their controls" },
      { keys: [["S"]], action: "Open chart settings" },
      { keys: [["D"]], action: "Duplicate chart" },
      { keys: [["X"]], action: "Delete chart after confirmation" },
      { keys: [["V"]], action: "View chart data" },
      { keys: [["C"]], action: "Clear chart filters" },
      {
        keys: [["Enter"], ["Space"]],
        action: "Filter by the focused bar or category",
      },
      {
        keys: [["Alt", "Enter"]],
        action: "Trace the focused title, facet, or color scale",
      },
      {
        keys: [[modifierKey, "Enter"]],
        action: "Inspect the field behind the focused axis label",
      },
    ],
  },
  {
    title: "Calculations",
    shortcuts: [
      {
        keys: [[modifierKey, "Enter"]],
        action: "Apply the calculation you are editing",
      },
    ],
  },
  {
    title: "Notes",
    shortcuts: [
      { keys: [["/"]], action: "Insert a heading, list, quote, or divider" },
      {
        keys: [["#"], ["-"], [">"]],
        action: "Start a heading, list, or quote",
      },
      { keys: [[modifierKey, "B"]], action: "Bold the selected text" },
      { keys: [[modifierKey, "I"]], action: "Italicize the selected text" },
    ],
  },
];

function Keys({ keys }: { keys: string[][] }) {
  return (
    <span className="eda-shortcut-keys">
      {keys.map((combo, index) => (
        <Fragment key={combo.join("+")}>
          {index > 0 && <span className="eda-shortcut-or">or</span>}
          {combo.map((key) => (
            <kbd key={key}>{key}</kbd>
          ))}
        </Fragment>
      ))}
    </span>
  );
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="eda-shortcuts max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Letter shortcuts work while focus is in the workspace or the pointer
            is over a chart. They pause while you type in a field.
          </DialogDescription>
        </DialogHeader>
        <div className="eda-shortcut-groups">
          {shortcutGroups.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              <dl>
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.action}>
                    <dt>{shortcut.action}</dt>
                    <dd>
                      <Keys keys={shortcut.keys} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
