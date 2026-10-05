/** Scrolls a chart in the workspace into view and moves focus to it. */
export function focusChartInContainer(
  container: HTMLElement | null,
  id: string
) {
  const element = Array.from(
    container?.querySelectorAll<HTMLElement>("[data-chart-id]") ?? []
  ).find((candidate) => candidate.dataset.chartId === id);
  if (!element) {
    return;
  }

  // A chart already in view stays put; others scroll the least distance.
  element.scrollIntoView({ behavior: "auto", block: "nearest" });
  element.focus({ preventScroll: true });
}

/** Marks one chart in the workspace, or clears the mark when `id` is empty. */
export function highlightChartInContainer(
  container: HTMLElement | null,
  id: string | undefined
) {
  container
    ?.querySelectorAll<HTMLElement>("[data-chart-highlight]")
    .forEach((element) => element.removeAttribute("data-chart-highlight"));
  if (!id) return;
  const element = Array.from(
    container?.querySelectorAll<HTMLElement>("[data-chart-id]") ?? []
  ).find((candidate) => candidate.dataset.chartId === id);
  element?.setAttribute("data-chart-highlight", "");
}
