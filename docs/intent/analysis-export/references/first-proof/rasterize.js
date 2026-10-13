// Spike: generic DOM-panel rasterizer. Injected into the page; defines window.__rasterize.
window.__rasterize = async function (panel, opts = {}) {
  const ratio = opts.ratio ?? 2;
  const embedFonts = opts.embedFonts ?? true;
  const t0 = performance.now();
  const rect = panel.getBoundingClientRect();
  const clone = panel.cloneNode(true);

  const src = [panel, ...panel.querySelectorAll("*")];
  const dst = [clone, ...clone.querySelectorAll("*")];
  const skip = new Set(["d", "x", "y", "cx", "cy", "r", "rx", "ry", "x1", "x2", "y1", "y2", "transform-origin"]);
  for (let i = 0; i < src.length; i++) {
    const s = src[i], d = dst[i];
    const cs = getComputedStyle(s);
    let text = "";
    for (let j = 0; j < cs.length; j++) {
      const p = cs[j];
      if (p.startsWith("--") || skip.has(p)) continue;
      text += `${p}:${cs.getPropertyValue(p)};`;
    }
    d.setAttribute("style", text);
    // Pseudo-elements carry no node; record so the report can mention them.
    if (s.tagName === "CANVAS") {
      const img = document.createElement("img");
      img.src = s.toDataURL("image/png");
      img.setAttribute("style", text);
      d.replaceWith(img);
      dst[i] = img;
    }
    if (s.tagName === "INPUT" || s.tagName === "TEXTAREA") d.setAttribute("value", s.value);
  }
  // Editor chrome: keep layout, hide pixels.
  const hide = opts.hide ?? ".eda-panel-actions, .eda-panel-status, [data-overlay], .react-resizable-handle";
  clone.querySelectorAll(hide).forEach((n) => { n.style.opacity = "0"; n.querySelectorAll("*").forEach((c) => (c.style.opacity = "0")); });
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.position = "static";
  // The page background behind a rounded, possibly transparent panel.
  const bg = getComputedStyle(document.body).backgroundColor;

  let fontCss = "";
  if (embedFonts) fontCss = await embeddedFontFaces();

  let w = Math.ceil(rect.width), h = Math.ceil(rect.height);
  if (opts.expand) {
    // Full extent: let every scrolling box take its content height, then measure off-screen.
    for (let i = 0; i < src.length; i++) {
      const s = src[i];
      if (s.scrollHeight > s.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(s).overflowY)) {
        let d = dst[i];
        d.style.overflow = "visible"; d.style.height = "auto"; d.style.maxHeight = "none";
        for (let a = d.parentElement; a; a = a.parentElement) { a.style.height = "auto"; a.style.maxHeight = "none"; a.style.overflow = "visible"; if (a === clone) break; }
      }
    }
    const host = document.createElement("div");
    host.style.cssText = `position:fixed;left:-100000px;top:0;width:${w}px`;
    host.appendChild(clone); document.body.appendChild(host);
    h = Math.ceil(clone.getBoundingClientRect().height);
    host.remove();
  }
  const xhtml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><style>${fontCss}</style><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;background:${bg}">${xhtml.replace(/^<div xmlns="http:\/\/www.w3.org\/1999\/xhtml"/, "<div")}</div></foreignObject></svg>`;
  const url = opts.dataUrl === false ? URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" })) : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  window.__lastSvg = svg;
  try {
    const image = new Image();
    await new Promise((res, rej) => { image.onload = res; image.onerror = () => rej(new Error("svg image failed")); image.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    return { dataUrl, width: canvas.width, height: canvas.height, ms: Math.round(performance.now() - t0), svgBytes: svg.length };
  } finally {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  }
};

async function embeddedFontFaces() {
  // Fetch @font-face rules from every stylesheet (cross-origin ones by URL) and inline font files.
  let css = "";
  for (const sheet of document.styleSheets) {
    try {
      for (const r of sheet.cssRules) if (r instanceof CSSFontFaceRule) css += r.cssText + "\n";
    } catch {
      if (sheet.href) css += (await (await fetch(sheet.href)).text()).match(/@font-face\s*{[^}]*}/g)?.join("\n") ?? "";
    }
  }
  // Only latin subsets keep the payload small for the spike.
  const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
  const out = [];
  for (const face of faces) {
    const m = face.match(/url\(([^)]+)\)/);
    if (!m) continue;
    const u = m[1].replace(/["']/g, "");
    if (/unicode-range/.test(face) && !/U\+0000-00FF/.test(face)) continue;
    const buf = await (await fetch(u)).arrayBuffer();
    let bin = ""; const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    out.push(face.replace(m[0], `url(data:font/woff2;base64,${btoa(bin)})`));
  }
  return out.join("\n");
}
