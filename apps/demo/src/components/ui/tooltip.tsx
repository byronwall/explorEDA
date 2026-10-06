import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

/**
 * Hover help that matches the workspace's tooltips. It opens on pointer hover
 * after a short delay; focus return does not open it.
 */
export function ActionTooltip({
  children,
  content,
  side,
}: {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>["side"];
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={140}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger
          asChild
          onFocus={(event) => event.preventDefault()}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="tooltip-content"
            side={side}
            sideOffset={4}
            className="eda-soft-tooltip z-50"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
