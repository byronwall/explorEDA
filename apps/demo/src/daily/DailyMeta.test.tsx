import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import { DailyMeta } from "./DailyMeta";

it("sets article metadata and restores the host metadata on exit", () => {
  const original = document.title;
  const { unmount } = render(
    <MemoryRouter initialEntries={["/daily/example"]}>
      <DailyMeta heading="An example" description="A finding" />
    </MemoryRouter>
  );
  expect(document.title).toBe("An example · explorEDA");
  expect(
    document.querySelector('link[rel="canonical"]')?.getAttribute("href")
  ).toBe("https://exploreda.dev/daily/example");
  expect(
    document.querySelector('meta[property="og:url"]')?.getAttribute("content")
  ).toBe("https://exploreda.dev/daily/example");
  unmount();
  expect(document.title).toBe(original);
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
});
