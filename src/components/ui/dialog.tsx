import * as React from "react";
import { Modal } from "@heroui/react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => (
  <Modal.Backdrop isOpen={open} onOpenChange={onOpenChange} variant="opaque">
    <Modal.Container placement="auto" scroll="inside">
      {children}
    </Modal.Container>
  </Modal.Backdrop>
);

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onClose, ...props }, ref) => {
    const ModalDialog = Modal.Dialog as React.ElementType;
    const ModalCloseTrigger = Modal.CloseTrigger as React.ElementType;

    return (
      <ModalDialog
        ref={ref}
        className={cn(
          "relative grid w-full max-w-lg gap-4 border border-slate-200 bg-white p-6 text-slate-950 shadow-xl dark:border-[var(--app-border)] dark:bg-[var(--app-surface)] dark:text-[var(--app-text)]",
          className,
        )}
        {...props}
      >
        {onClose && <ModalCloseTrigger onPress={onClose} />}
        {children}
      </ModalDialog>
    );
  },
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <Modal.Header
    className={cn("flex flex-col space-y-1.5 text-start", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Modal.Heading
    ref={ref}
    className={cn("text-lg font-semibold leading-none", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
