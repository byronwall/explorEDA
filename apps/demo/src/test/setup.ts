import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import { testTiming } from "@repo/test-config";

configure({ asyncUtilTimeout: testTiming.waitMs });

// jsdom has <dialog> but not its modal methods; open and close it in place.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
}
