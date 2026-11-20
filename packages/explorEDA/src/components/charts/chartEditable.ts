import { createContext, useContext } from "react";

/**
 * Whether a chart's own content takes edits, such as a note's text. The
 * workspace leaves it on; a read-only standalone chart turns it off.
 */
export const ChartEditableContext = createContext(true);

export const useChartEditable = () => useContext(ChartEditableContext);
