import type { DatumObject } from "@/LandingPage";
import { ExplorEdaNotebook } from "exploreda";

/**
 * A live notebook on a docs page: the example's text over its rows. Chart
 * selections stay on the page; nothing is saved.
 */
export default function NotebookFindingsExample({
  text,
  rows,
  onEdit,
}: {
  text: string;
  rows: DatumObject[];
  onEdit: () => void;
}) {
  return <ExplorEdaNotebook text={text} data={rows} onStateChange={onEdit} />;
}
