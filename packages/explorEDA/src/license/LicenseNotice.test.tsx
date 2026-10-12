import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExplorEda } from "@/components/ExplorEda";
import { signLicense } from "./sign";

const DEV_PRIVATE_KEY = "OQUkqhgAWUY6KYM6jaUiV2yk2SvsO2iARwJN7NiowEo";
const rows = [
  { region: "East", sales: 10 },
  { region: "West", sales: 20 },
];

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("shows an unlicensed notice that opens the License panel, without a network call", async () => {
  const fetchSpy = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
  render(<ExplorEda data={rows} />);
  const notice = await screen.findByRole("button", { name: "Unlicensed" });
  fireEvent.click(notice);
  expect(await screen.findByText("No license key")).toBeTruthy();
  expect(fetchSpy).not.toHaveBeenCalled();
});

it("shows no notice with a valid key and names the licensee", async () => {
  const key = await signLicense(
    {
      v: 1,
      kid: "dev-1",
      id: "lic_notice",
      licensee: "Notice Test Co",
      plan: "commercial",
      seats: 2,
      scope: "internal",
      issued: "2026-10-11",
      updatesUntil: "2099-12-31",
    },
    DEV_PRIVATE_KEY
  );
  render(<ExplorEda data={rows} licenseKey={key} />);
  await waitFor(() =>
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining("Notice Test Co")
    )
  );
  expect(screen.queryByRole("button", { name: "Unlicensed" })).toBeNull();
});
