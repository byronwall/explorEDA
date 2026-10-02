import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useAlertStore } from "@/stores/alertStore";

export function GlobalAlertDialog() {
  const {
    isOpen,
    title,
    description,
    confirmLabel,
    destructive,
    closeAlert,
    id,
  } = useAlertStore();

  return (
    <AlertDialog
      key={id}
      open={isOpen}
      onOpenChange={(open) => !open && closeAlert(false)}
    >
      <AlertDialogContent
        className="eda-confirm"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const action = document.getElementById(`alert-dialog-action-${id}`);
          if (action) {
            action.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={buttonVariants({ variant: "outline", size: "sm" })}
            onClick={() => closeAlert(false)}
            autoFocus={false}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({
              variant: destructive ? "destructive" : "default",
              size: "sm",
            })}
            onClick={() => closeAlert(true)}
            autoFocus
            id={`alert-dialog-action-${id}`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
