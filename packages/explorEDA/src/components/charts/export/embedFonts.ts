/**
 * Web fonts do not load inside an SVG drawn as an image, so text would fall
 * back to another face and clip. Inline the `@font-face` rules for the
 * families a panel uses, with their files as data URLs. System fonts need
 * nothing. A font that cannot be fetched is left out and falls back.
 */

const fontFiles = new Map<string, Promise<string | null>>();
const sheetText = new Map<string, Promise<string>>();

// A cap so a large icon or CJK family cannot balloon one image.
const MAX_FONT_BYTES = 6_000_000;

function familyNames(stack: string) {
  return stack
    .split(",")
    .map((name) =>
      name
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase()
    )
    .filter(Boolean);
}

function usedFamilies(panel: HTMLElement) {
  const families = new Set<string>();
  for (const node of [panel, ...Array.from(panel.querySelectorAll("*"))]) {
    for (const name of familyNames(getComputedStyle(node).fontFamily)) {
      families.add(name);
    }
  }
  return families;
}

function readFile(url: string) {
  let pending = fontFiles.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => (response.ok ? response.blob() : null))
      .then(
        (blob) =>
          blob &&
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          })
      )
      .catch(() => null);
    fontFiles.set(url, pending);
  }
  return pending;
}

interface FontFace {
  family: string;
  declarations: string;
  url: string;
}

const FACE = /@font-face\s*{([^}]*)}/g;

function parseFaces(css: string, base: string): FontFace[] {
  const faces: FontFace[] = [];
  for (const [, body = ""] of css.matchAll(FACE)) {
    const family = /font-family\s*:\s*([^;]+)/i.exec(body)?.[1];
    const url = /url\(\s*["']?([^"')]+)["']?\s*\)/i.exec(body)?.[1];
    if (!family || !url) {
      continue;
    }
    const declarations = body
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part && !/^src\s*:/i.test(part))
      .join(";");
    faces.push({
      family: familyNames(family)[0] ?? "",
      declarations,
      url: new URL(url, base).href,
    });
  }
  return faces;
}

async function documentFaces() {
  const faces: FontFace[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const base = sheet.href ?? document.baseURI;
    try {
      const css = Array.from(sheet.cssRules)
        .filter((rule) => rule instanceof CSSFontFaceRule)
        .map((rule) => rule.cssText)
        .join("\n");
      faces.push(...parseFaces(css, base));
    } catch {
      // A cross-origin sheet hides its rules; read it again by URL.
      if (!sheet.href) {
        continue;
      }
      let text = sheetText.get(sheet.href);
      if (!text) {
        text = fetch(sheet.href)
          .then((response) => (response.ok ? response.text() : ""))
          .catch(() => "");
        sheetText.set(sheet.href, text);
      }
      faces.push(...parseFaces(await text, sheet.href));
    }
  }
  return faces;
}

export async function embeddedFontFaces(panel: HTMLElement) {
  if (typeof document === "undefined" || !document.styleSheets) {
    return "";
  }
  const families = usedFamilies(panel);
  const faces = (await documentFaces()).filter((face) =>
    families.has(face.family)
  );
  let bytes = 0;
  const rules: string[] = [];
  for (const face of faces) {
    const data = await readFile(face.url);
    if (!data || bytes + data.length > MAX_FONT_BYTES) {
      continue;
    }
    bytes += data.length;
    rules.push(`@font-face{${face.declarations};src:url(${data})}`);
  }
  return rules.join("\n");
}
