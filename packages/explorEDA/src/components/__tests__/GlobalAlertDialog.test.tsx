import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlobalAlertDialog } from "@/components/GlobalAlertDialog";
import { useAlertStore } from "@/stores/alertStore";

describe("GlobalAlertDialog", () => {
  it("draws one dialog and one backdrop when several workspaces share a page", async () => {
    const { unmount } = render(
      <>
        <GlobalAlertDialog />
        <GlobalAlertDialog />
        <GlobalAlertDialog />
      </>
    );

    act(() => {
      void useAlertStore.getState().showAlert("Delete chart?", "Gone soon.");
    });

    expect(await screen.findAllByRole("alertdialog")).toHaveLength(1);
    expect(
      document.querySelectorAll("[data-slot='alert-dialog-overlay']")
    ).toHaveLength(1);

    act(() => useAlertStore.getState().closeAlert(false));
    unmount();
  });
});
