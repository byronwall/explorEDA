import { fireEvent, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { scatterPlotDefinition } from "./definition";
import { planMarginals } from "./marginalPlan";
import { planScatter } from "./scatterPlan";
import { ScatterSvg } from "./ScatterSvg";

it("keeps normal brush clicks and traces points only on Alt-click, not Alt-drag", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  settings.xField = "x";
  settings.yField = "y";
  const plan = planScatter(
    settings,
    {
      revision: "test",
      allIds: [0],
      chartIds: [0],
      filteredIds: [0],
      xData: { 0: 10 },
      yData: { 0: 20 },
      colorData: {},
      fieldSettings: {},
    },
    400,
    300
  );
  const onBrushChange = vi.fn();
  const onInspectPoint = vi.fn(() => true);
  const onInspectGuide = vi.fn();
  const { container } = render(
    <ScatterSvg
      plan={plan}
      hoveredId={null}
      onBrushChange={onBrushChange}
      onInspectPoint={onInspectPoint}
      onInspectGuide={onInspectGuide}
      onInspectOverlay={vi.fn()}
    />
  );
  const svg = container.querySelector("svg")!;
  const x = plan.margin.left + plan.points[0]!.x;
  const y = plan.margin.top + plan.points[0]!.y;
  const click = (altKey: boolean) => {
    fireEvent.pointerDown(svg, { clientX: x, clientY: y, button: 0, altKey });
    fireEvent.pointerUp(svg, { clientX: x, clientY: y, altKey });
    fireEvent.click(svg, { clientX: x, clientY: y, altKey });
  };

  click(false);
  expect(onInspectPoint).not.toHaveBeenCalled();
  expect(onBrushChange).toHaveBeenLastCalledWith(null);
  click(true);
  expect(onInspectPoint).toHaveBeenCalledOnce();
  expect(onInspectPoint).toHaveBeenCalledWith(
    plan.points[0]!.x,
    plan.points[0]!.y
  );

  fireEvent.pointerDown(svg, {
    clientX: x,
    clientY: y,
    button: 0,
    altKey: true,
  });
  fireEvent.pointerMove(svg, {
    clientX: x + 30,
    clientY: y + 30,
    buttons: 1,
    altKey: true,
  });
  fireEvent.pointerUp(svg, {
    clientX: x + 30,
    clientY: y + 30,
    altKey: true,
  });
  fireEvent.click(svg, {
    clientX: x + 30,
    clientY: y + 30,
    altKey: true,
  });
  expect(onInspectPoint).toHaveBeenCalledTimes(1);

  const axisLabel = container.querySelector('[data-plan-id="x:label"]')!;
  fireEvent.pointerDown(axisLabel, { button: 0 });
  fireEvent.click(axisLabel);
  expect(onInspectGuide).not.toHaveBeenCalled();
  fireEvent.pointerDown(axisLabel, { button: 0, altKey: true });
  fireEvent.click(axisLabel, { altKey: true });
  expect(onInspectGuide).toHaveBeenCalledWith("x:label");
});

it("traces a point through an active brush and traces the brush when no point is hit", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  settings.xField = "x";
  settings.yField = "y";
  const plan = planScatter(
    settings,
    {
      revision: "test",
      allIds: [0],
      chartIds: [0],
      filteredIds: [0],
      xData: { 0: 10 },
      yData: { 0: 20 },
      colorData: {},
      fieldSettings: {},
    },
    400,
    300
  );
  const point = plan.points[0]!;
  plan.brushExtent = [
    [point.x - 20, point.y - 20],
    [point.x + 20, point.y + 20],
  ];
  const onInspectPoint = vi.fn(() => true);
  const onInspectOverlay = vi.fn();
  const { container } = render(
    <ScatterSvg
      plan={plan}
      hoveredId={null}
      onBrushChange={vi.fn()}
      onInspectPoint={onInspectPoint}
      onInspectGuide={vi.fn()}
      onInspectOverlay={onInspectOverlay}
    />
  );
  const brush = container.querySelector('[data-plan-id="brush"]')!;
  const click = () => {
    const clientX = plan.margin.left + point.x;
    const clientY = plan.margin.top + point.y;
    fireEvent.pointerDown(brush, { clientX, clientY, button: 0, altKey: true });
    fireEvent.pointerUp(brush, { clientX, clientY, altKey: true });
    fireEvent.click(brush, { clientX, clientY, altKey: true });
  };

  click();
  expect(onInspectPoint).toHaveBeenCalledWith(point.x, point.y);
  expect(onInspectOverlay).not.toHaveBeenCalled();

  onInspectPoint.mockReturnValue(false);
  click();
  expect(onInspectOverlay).toHaveBeenCalledWith("brush");
});

it("brushes either marginal histogram to an axis range", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  settings.xField = "x";
  settings.yField = "y";
  settings.marginals = { bins: 5 };
  const snapshot = {
    revision: "marginals",
    allIds: [0, 1, 2, 3, 4],
    chartIds: [0, 1, 2, 3, 4],
    filteredIds: [0, 1, 2, 3, 4],
    xData: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 },
    yData: { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1 },
    colorData: {},
    fieldSettings: {},
  };
  const plan = planScatter(settings, snapshot, 400, 300);
  const marginals = planMarginals(settings, plan)!;
  const onMarginalBrush = vi.fn();
  const onMarginal = vi.fn();
  const { container } = render(
    <ScatterSvg
      plan={plan}
      hoveredId={null}
      marginals={marginals}
      onMarginalBrush={onMarginalBrush}
      onMarginal={onMarginal}
      onBrushChange={vi.fn()}
      onInspectPoint={vi.fn(() => false)}
      onInspectGuide={vi.fn()}
      onInspectOverlay={vi.fn()}
    />
  );
  const drag = (axis: "x" | "y") => {
    const bins = marginals.bins
      .filter((bin) => bin.axis === axis)
      .sort((a, b) => a.bounds[0] - b.bounds[0]);
    const first = bins[0]!;
    const last = bins[bins.length - 1]!;
    const point = (bin: typeof first) => [
      plan.margin.left + bin.x + bin.width / 2,
      plan.margin.top + bin.y + bin.height / 2,
    ];
    const [x0, y0] = point(first);
    const [x1, y1] = point(last);
    const target = container.querySelector(`[data-marginal-id="${first.id}"]`)!;
    fireEvent.pointerDown(target, {
      clientX: x0,
      clientY: y0,
      button: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(target, {
      clientX: x1,
      clientY: y1,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerUp(target, { clientX: x1, clientY: y1, pointerId: 1 });
    fireEvent.click(target, { clientX: x1, clientY: y1 });
    expect(onMarginalBrush).toHaveBeenLastCalledWith(axis, [
      bins[0]!.bounds[0],
      bins[bins.length - 1]!.bounds[1],
    ]);
  };

  drag("x");
  drag("y");
  expect(onMarginal).not.toHaveBeenCalled();
});
