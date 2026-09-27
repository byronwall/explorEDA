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

  element.scrollIntoView({ behavior: "auto", block: "start" });
  element.focus({ preventScroll: true });
}
