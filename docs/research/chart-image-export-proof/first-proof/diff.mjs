// Usage: node tmp/proof/diff.mjs a.png b.png out-diff.png  → prints mismatch stats
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
const [a, b, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
const r = await page.evaluate(async ([a, b]) => {
  const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; });
  const [ia, ib] = await Promise.all([load(a), load(b)]);
  const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
  const get = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h); };
  const da = get(ia), db = get(ib);
  const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
  const out = x.createImageData(w, h); let bad = 0;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let i = 0; i < da.data.length; i += 4) {
    const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
    const p = i / 4, px = p % w, py = (p / w) | 0;
    if (d > 48) { bad++; out.data[i] = 255; out.data[i + 3] = 255; minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); }
    else { out.data[i] = out.data[i + 1] = out.data[i + 2] = da.data[i] / 4; out.data[i + 3] = 255; }
  }
  x.putImageData(out, 0, 0);
  return { size: [ia.width, ia.height, ib.width, ib.height], mismatchPct: +(100 * bad / (w * h)).toFixed(3), bbox: bad ? [minX, minY, maxX, maxY] : null, png: c.toDataURL() };
}, [a, b].map((f) => "data:image/png;base64," + readFileSync(f).toString("base64")));
writeFileSync(out, Buffer.from(r.png.split(",")[1], "base64"));
delete r.png; console.log(JSON.stringify(r));
await browser.close();
