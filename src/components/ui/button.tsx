import * as React from "react";
import {
  Button as HeroButton,
  buttonVariants as heroButtonVariants,
} from "@heroui/react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  asChild?: boolean;
  disabled?: boolean;
  isDisabled?: boolean;
  isPending?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantMap: Record<
  ButtonVariant,
  React.ComponentProps<typeof HeroButton>["variant"]
> = {
  default: "primary",
  destructive: "danger",
  outline: "outline",
  secondary: "secondary",
  ghost: "ghost",
  link: "ghost",
};

const sizeMap: Record<ButtonSize, React.ComponentProps<typeof HeroButton>["size"]> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "md",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      disabled,
      isDisabled,
      isPending,
      asChild: _asChild,
      ...props
    },
    ref,
  ) => {
    const HeroButtonRoot = HeroButton as React.ElementType;

    return (
      <HeroButtonRoot
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap",
          variant === "link" && "h-auto min-w-0 px-0 underline-offset-4 hover:underline",
          size === "icon" && "min-w-10 px-0",
          className,
        )}
        isDisabled={isDisabled ?? disabled}
        isIconOnly={size === "icon"}
        isPending={isPending}
        size={sizeMap[size]}
        variant={variantMap[variant]}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const buttonVariants = heroButtonVariants;

export { Button, buttonVariants };
