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

type ConfirmButtonProps = {
  title: ReactNode;
  description: ReactNode;
  /** Text on the button that confirms, e.g. "Ta bort". */
  action: string;
  /** The dialog stays open, its buttons locked, until the returned promise settles. */
  onConfirm: () => unknown;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  disabled?: boolean;
  children: ReactNode;
};

/** A button that asks for confirmation in a modal before it runs a destructive action. */
export function ConfirmButton({
  title,
  description,
  action,
  onConfirm,
  variant = "destructive-ghost",
  size,
  disabled,
  children,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || pending}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(event) => {
              // Keep the dialog open until the action is done.
              event.preventDefault();
              setPending(true);
              void Promise.resolve()
                .then(onConfirm)
                .catch(() => {}) // the caller shows its own error
                .finally(() => {
                  setPending(false);
                  setOpen(false);
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
