/** Shared layout for the declarations export writes. */

/** A declaration stays on one line up to this width. */
const LINE_WIDTH = 88;
/** Settings lines in a body wrap at this width. */
const BODY_WIDTH = 80;

/**
 * Writes a declaration: one line when it fits, otherwise a head line that
 * opens a body, the remaining settings in lines of a comfortable width, and
 * a closing brace. A token without `=`, such as `@name`, stays on the head.
 */
export function block(
  head: string,
  tokens: string[],
  children: string[] = []
): string[] {
  const single = [head, ...tokens].join(" ");
  if (single.length <= LINE_WIDTH && !children.length) {
    return [single];
  }
  let line = head;
  let index = 0;
  while (
    index < tokens.length &&
    (!tokens[index]!.includes("=") ||
      line.length + tokens[index]!.length + 3 <= LINE_WIDTH)
  ) {
    line += ` ${tokens[index]}`;
    index++;
  }
  const body: string[] = [];
  for (const token of tokens.slice(index)) {
    const last = body.at(-1);
    if (last !== undefined && last.length + token.length + 1 <= BODY_WIDTH) {
      body[body.length - 1] = `${last} ${token}`;
    } else {
      body.push(token);
    }
  }
  body.push(...children);
  return body.length
    ? [`${line} {`, ...body.map((item) => `  ${item}`), "}"]
    : [line];
}
