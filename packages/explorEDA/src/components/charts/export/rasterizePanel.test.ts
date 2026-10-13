import { describe, expect, it, vi } from "vitest";
import { panelSvg, registerCanvasReader } from "./rasterizePanel";

function panelWith(html: string) {
  const panel = document.createElement("div");
  panel.className = "eda-panel";
  panel.innerHTML = html;
  document.body.appendChild(panel);
  return panel;
}

const parse = (svg: string) =>
  new DOMParser().parseFromString(svg, "image/svg+xml");

describe("panelSvg", () => {
  it("keeps marked chrome in the layout but draws nothing for it", () => {
    const panel = panelWith(
      `<h3>Title</h3><div class="actions" data-export="omit"><button>Delete</button></div><svg><g data-overlay=""><rect/></g></svg>`
    );
    const doc = parse(panelSvg(panel).svg);
    const actions = doc.querySelector(".actions") as HTMLElement;
    expect(actions.style.opacity).toBe("0");
    expect(actions.textContent).toBe("Delete");
    expect(
      (doc.querySelector("[data-overlay]") as SVGElement).style.opacity
    ).toBe("0");
    expect(doc.querySelector("h3")!.textContent).toBe("Title");
    panel.remove();
  });

  it("replaces canvases with their pixels, preferring a registered reader", () => {
    const panel = panelWith(`<canvas></canvas><canvas class="gl"></canvas>`);
    const [plain, gl] = Array.from(panel.querySelectorAll("canvas"));
    plain!.toDataURL = vi.fn(() => "data:image/png;base64,plain");
    const release = registerCanvasReader(
      gl!,
      () => "data:image/png;base64,frame"
    );
    const { svg, images } = panelSvg(panel);
    const sources = Array.from(parse(svg).querySelectorAll("img")).map(
      (image) => image.getAttribute("src")
    );
    expect(sources).toEqual([
      "data:image/png;base64,plain",
      "data:image/png;base64,frame",
    ]);
    expect(images).toBe(2);
    release();
    panel.remove();
  });

  it("shifts scrolled content to the position on screen", () => {
    const panel = panelWith(
      `<div class="scroll" style="overflow:auto;height:50px"><table><tbody><tr><td>row</td></tr></tbody></table></div>`
    );
    const scroller = panel.querySelector<HTMLElement>(".scroll")!;
    scroller.scrollTop = 120;
    const doc = parse(panelSvg(panel).svg);
    const scroll = doc.querySelector(".scroll") as HTMLElement;
    expect(scroll.style.overflow).toBe("hidden");
    expect((doc.querySelector("table") as HTMLElement).style.transform).toMatch(
      /translate\(0px, -120px\)/
    );
    panel.remove();
  });

  it("reads the panel at rest and leaves no export state behind", () => {
    const panel = panelWith(`<p>x</p>`);
    const seen: (string | null)[] = [];
    const original = window.getComputedStyle;
    const spy = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation((node, pseudo) => {
        if (node === panel) {
          seen.push(panel.getAttribute("data-exporting"));
        }
        return original(node, pseudo);
      });
    panelSvg(panel);
    spy.mockRestore();
    expect(seen).toContain("");
    expect(panel.hasAttribute("data-exporting")).toBe(false);
    panel.remove();
  });
});
