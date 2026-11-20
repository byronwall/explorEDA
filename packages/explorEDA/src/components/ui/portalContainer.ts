import { createContext, useContext } from "react";

/**
 * Where menus, popovers, tooltips, and dialogs mount. Undefined mounts them
 * on `document.body`, as in the workspace. A standalone chart points them at
 * a layer inside its own element, so its scoped stylesheet still applies.
 */
export const PortalContainerContext = createContext<HTMLElement | undefined>(
  undefined
);

export const usePortalContainer = () => useContext(PortalContainerContext);
