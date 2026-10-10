import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ThemeSettingsPanel } from "./ThemeSettingsPanel";

function ThemeId() {
  const theme = useDataLayer((state) => state.theme);
  return <output aria-label="theme">{theme?.id ?? "compact"}</output>;
}

it("switches the workspace theme and marks the choice", () => {
  render(
    <DataLayerProvider data={[{ value: 1 }]} charts={[]}>
      <ThemeSettingsPanel />
      <ThemeId />
    </DataLayerProvider>
  );
  const compact = screen.getByRole("radio", { name: "Compact" });
  const newsprint = screen.getByRole("radio", { name: "Newsprint" });
  expect(compact).toHaveAttribute("aria-checked", "true");

  fireEvent.click(newsprint);
  expect(newsprint).toHaveAttribute("aria-checked", "true");
  expect(screen.getByLabelText("theme")).toHaveTextContent("newsprint");

  fireEvent.click(compact);
  expect(screen.getByLabelText("theme")).toHaveTextContent("compact");
});
