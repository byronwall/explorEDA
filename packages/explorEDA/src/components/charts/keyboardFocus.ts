/**
 * True when the element holds focus the reader should see: keyboard focus,
 * not the focus a mouse press leaves behind. Hover readouts follow keyboard
 * focus but must clear when the pointer leaves.
 */
export function keyboardFocused(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
}
