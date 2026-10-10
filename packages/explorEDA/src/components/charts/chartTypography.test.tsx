import { act, render } from "@testing-library/react";
import { useMemo, useRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  readThemeTypography,
  toAxisTypography,
  useThemeTypography,
} from "./chartTypography";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("reads theme sizes from the CSS an element inherits", () => {
  const element = document.createElement("div");
  element.style.setProperty("--eda-axis-tick-size", "11px");
  element.style.setProperty("--eda-headline-size", "20px");
  document.body.appendChild(element);
  expect(readThemeTypography(element)).toMatchObject({
    tickSize: 11,
    labelSize: 11,
    headlineSize: 20,
  });
  element.remove();
});

it("measures again when web fonts finish loading", async () => {
  const fonts = new EventTarget() as EventTarget & { ready: Promise<void> };
  fonts.ready = Promise.resolve();
  Object.defineProperty(document, "fonts", {
    value: fonts,
    configurable: true,
  });
  const seen: unknown[] = [];
  function Probe() {
    const ref = useRef<HTMLDivElement>(null);
    const { typography, fonts: revision } = useThemeTypography(ref, "compact");
    const axis = useMemo(
      () => toAxisTypography(typography, revision),
      [typography, revision]
    );
    seen.push(axis);
    return <div ref={ref} />;
  }
  render(<Probe />);
  await act(async () => {
    await fonts.ready;
  });
  const afterReady = seen.length;
  act(() => {
    fonts.dispatchEvent(new Event("loadingdone"));
  });
  // A new typography object makes every axis plan run again.
  expect(seen.length).toBeGreaterThan(afterReady);
  expect(seen.at(-1)).not.toBe(seen[afterReady - 1]);
  delete (document as { fonts?: unknown }).fonts;
});
