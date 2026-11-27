/**
 * The project rail's shared pieces: a one-line row, its tooltip, a small
 * icon button, and the popover its forms open in.
 */
import {
  cloneElement,
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { X } from "lucide-react";

/** Details beside a control, opened by hover or keyboard focus. */
function Tip({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactElement;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="app-tip"
          side="right"
          sideOffset={8}
          collisionPadding={8}
        >
          {content}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** As long as a tooltip waits, so a card and a tip open alike. */
const OPEN_DELAY = 450;
/** Time to move the pointer from the row into its card. */
const CLOSE_DELAY = 150;

/**
 * A card beside a row, opened by resting the pointer on it or by keyboard
 * focus, that the pointer can move into. Unlike a tooltip, tooltips inside
 * it, such as a field's details, leave it open.
 */
function HoverCard({
  content,
  label,
  children,
}: {
  content: ReactNode;
  /** What a screen reader announces for the card. */
  label: string;
  children: ReactElement<{
    onPointerEnter?: () => void;
    onPointerLeave?: () => void;
    onPointerDown?: () => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: () => void;
  }>;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const later = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  const stay = () => window.clearTimeout(timer.current);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Anchor asChild>
        {cloneElement(children, {
          onPointerEnter: () => later(true, OPEN_DELAY),
          onPointerLeave: () => later(false, CLOSE_DELAY),
          // Choosing the row opens what the card previews.
          onPointerDown: () => later(false, 0),
          // Keyboard focus only: a click focuses the row it just chose.
          onFocus: (event: FocusEvent) => {
            if ((event.target as Element).matches?.(":focus-visible")) {
              later(true, OPEN_DELAY);
            }
          },
          onBlur: () => later(false, CLOSE_DELAY),
        })}
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className="app-tip app-tip-card"
          aria-label={label}
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          // Focus stays on the row; the card is for reading.
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerEnter={stay}
          onPointerLeave={() => later(false, CLOSE_DELAY)}
        >
          {content}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
>(function IconButton({ label, className = "", ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={`app-icon-button ${className}`}
      {...props}
    />
  );
});

/**
 * One line in the rail: an icon, a name, a short fact, and one action.
 * The action's place is kept when it has none, so rows line up and nothing
 * moves when it appears.
 */
export function RailRow({
  icon,
  name,
  details,
  meta,
  action,
  tone,
  current,
  busy,
  onClick,
  card,
}: {
  icon: ReactNode;
  name: string;
  /** Shown in the row's tooltip, under the full name. */
  details?: ReactNode;
  /** A larger tooltip body under the details, such as a field summary. */
  card?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  /** Colors the icon: the row's state. */
  tone?: "warning" | "error";
  current?: boolean;
  busy?: boolean;
  /** A row without it shows its details and does nothing else yet. */
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="app-row-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="app-row-name">{name}</span>
    </>
  );
  const tip = (
    <>
      <strong>{name}</strong>
      {details}
      {card}
    </>
  );
  const row = (
    <div
      className="app-row"
      data-tone={tone}
      data-current={current || undefined}
      aria-busy={busy || undefined}
    >
      {onClick ? (
        <button
          type="button"
          className="app-row-main"
          aria-current={current ? "page" : undefined}
          onClick={onClick}
        >
          {content}
        </button>
      ) : (
        <span className="app-row-main" tabIndex={0}>
          {content}
        </span>
      )}
      <span className="app-row-meta">{meta}</span>
      <span className="app-row-action">{action}</span>
    </div>
  );
  // The tip hangs off the whole row, so it never covers the action.
  return card ? (
    <HoverCard content={tip} label={`${name}: field summary`}>
      {row}
    </HoverCard>
  ) : (
    <Tip content={tip}>{row}</Tip>
  );
}

/**
 * A form or tool beside the control that opens it, so the rail never moves.
 * Once something is typed or checked, only Escape and its own buttons close
 * it; an untouched one also closes on a click elsewhere.
 */
export function FormPopover({
  open,
  onOpenChange,
  title,
  trigger,
  narrow,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger: ReactElement;
  /** Without room beside the rail, the popover opens under its control. */
  narrow: boolean;
  children: ReactNode;
}) {
  const typed = useRef(false);
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        typed.current = false;
        onOpenChange(next);
      }}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="app-popover"
          aria-label={title}
          side={narrow ? "bottom" : "right"}
          align={narrow ? "end" : "start"}
          sideOffset={8}
          collisionPadding={8}
          onChange={() => (typed.current = true)}
          // Focus moving on its own, as from a closing menu, keeps it open.
          onFocusOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => {
            if (typed.current) event.preventDefault();
          }}
          // Keys typed here never reach the workspace's shortcuts.
          onKeyDown={(event) => {
            if (event.key !== "Escape") event.stopPropagation();
          }}
        >
          <div className="app-popover-head">
            <h3>{title}</h3>
            <Popover.Close asChild>
              <IconButton label="Close">
                <X />
              </IconButton>
            </Popover.Close>
          </div>
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
