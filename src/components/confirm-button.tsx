import { useState, type ComponentProps, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  /** The button that opens the dialog; without one, `open` opens it, e.g. from a menu. */
  trigger?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  /** Text on the button that confirms, e.g. "Ta bort". */
  action: string;
  destructive?: boolean;
  onPendingChange?: (pending: boolean) => void;
  /** The dialog stays open, its buttons locked, until the returned promise settles. */
  onConfirm: () => unknown;
};

/** Asks for confirmation in a modal before running an action. */
export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  action,
  destructive = true,
  onPendingChange,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const changePending = (next: boolean) => {
    setPending(next);
    onPendingChange?.(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={(event) => {
              // Keep the dialog open until the action is done.
              event.preventDefault();
              changePending(true);
              void Promise.resolve()
                .then(onConfirm)
                .catch(() => {}) // the caller shows its own error
                .finally(() => {
                  changePending(false);
                  onOpenChange(false);
                });
            }}
          >
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type ConfirmButtonProps = Pick<ConfirmDialogProps, "title" | "description" | "action" | "destructive" | "onConfirm"> & {
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  disabled?: boolean;
  children: ReactNode;
};

/** A button that asks for confirmation in a modal before it runs a destructive action. */
export function ConfirmButton({
  variant = "destructive-ghost",
  size,
  disabled,
  children,
  ...dialog
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <ConfirmDialog
      {...dialog}
      trigger={
        <Button variant={variant} size={size} disabled={disabled || pending}>
          {children}
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      onPendingChange={setPending}
    />
  );
}
